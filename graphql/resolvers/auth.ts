import { Auth } from "aws-amplify";
import awsconfig from "../../src/aws-exports.js";
import {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { isAuth } from "../../middleware/isAuth";
import { UserInput } from "./users";

Auth.configure(awsconfig);

const client = new DynamoDBClient({ region: process.env.AWS_REGION_CODE});
const s3Client = new S3Client({ region: process.env.AWS_REGION_CODE});

const createUser = async (params: { password: string } & UserInput) => {
  try {
    const res = await Auth.signUp({
      username: params.username,
      password: params.password,
      attributes: {
        email: params.email, // optional
        // phoneNumber, // optional - E.164 number convention
        // other custom attributes
      },
      autoSignIn: {
        // optional - enables auto sign in after user is confirmed
        enabled: true,
      },
    });

    console.log(res);

    delete params.password

    const p = {
      TableName: "Users",
      Item: marshall({
        ...params,
        userId: res.userSub,
        createdAt: +new Date()
      }),
    };

    try {
      const results = await client.send(new PutItemCommand(p));
      if (results.$metadata.httpStatusCode === 200) {
        return {
          ...params,
          userId: res.userSub
        };
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  } catch (error) {
    console.log("error signing up:", error);
    throw error;
  }
};

const signIn = async ({ password, username }) => {
  try {
    const res = await Auth.signIn({
      username,
      password,
    });

    let { username: user, signInUserSession, attributes } = res,
      data = { user, signInUserSession, attributes };

    console.log(data);
  } catch (error) {
    console.log("error signing in:", error);
  }
};

const getPresignedURL = async ({ bucket, key }) => {
  const exp = +new Date() + 3600000;
  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      // ContentType: "image/jpeg"
      // Expires: new Date(exp),
    });
    
    
    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
    
    return url;
  } catch (error) {
    console.error(error);
  }
};

const getObjectURL = async ({ bucket, key }) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      // ContentType: "image/jpeg"
      // Expires: new Date(exp),
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return url;
  } catch (error) {
    console.error(error);
  }
};

export default {
  createUser: async (args, { req }) => {
    if (!(await isAuth(req?.headers.authorization)))
      throw new Error("NOT_AUTHENTICATED");

    return createUser(args.input);
  },
  signIn: (args, { req }) => {
    return signIn(args.input);
  },
  getPresignedURL: async (args, { req }) => {
    if (!(await isAuth(req?.headers.authorization)))
      throw new Error("USER_NOT_AUTHENTICATED");
    return getPresignedURL(args.input);
  },
  getObjectURL: async (args, { req }) => {
    if (!(await isAuth(req?.headers.authorization)))
      throw new Error("USER_NOT_AUTHENTICATED");
    return getObjectURL(args.input);
  },
};
