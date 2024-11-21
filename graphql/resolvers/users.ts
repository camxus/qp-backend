import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  ScanCommandInput,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { isAuth } from "../../middleware/isAuth";
import {
  getItemImages,
  itemsByFilter,
  updateItem,
} from "../../src/utils/dynamoDB";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const s3Client = new S3Client({ region: process.env.AWS_REGION });

export interface UserInput {
  userId: string;
  name: {
    firstName: string;
    lastName: string;
  };
  username: string;
  email: string;
  phoneNumber: number;
  birthdate: string;
  userImages: {
    imageId: string;
    s3location: { key: string; bucket: string };
    url: string;
  }[];
  createdAt: string;
  bio: string;
}

type Filter = Partial<Record<keyof UserInput, any>>;

const updateUser = async (params: Partial<Record<keyof UserInput, any>>) => {
  params.userImages.forEach((image) => delete image.url);
  await updateItem(client, params, "Users", "userId");
  const [user] = await usersByFilter({ userId: params.userId });
  return user
};

export const usersByFilter = async (params: Filter) => {
  const users = await itemsByFilter(client, params, "Users", "equals");

  return await Promise.all(
    users.map(async (user) => await getItemImages(s3Client, user, "userImages"))
  );
};

export default {
  updateUser: async (args, { req }) => {
    if (!(await isAuth(req?.headers.authorization)))
      throw new Error("USER_NOT_AUTHENTICATED");
    return updateUser({ ...args.input });
  },
  usersByFilter: async (args, { req }) => {
    return usersByFilter({ ...args.input });
  },
};
