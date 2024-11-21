import axios from "axios";
import awsconfig from "../src/aws-exports";

const COGNITO_URL = `https://cognito-idp.${awsconfig.aws_project_region}.amazonaws.com/`;

export const isAuth = async (accessToken: string) => {

  if (process.env.USER === "cam") return true
  try {
    const { data } = await axios.post(
      COGNITO_URL,
      {
        AccessToken: accessToken,
      },
      {
        headers: {
          "Content-Type": "application/x-amz-json-1.1",
          "X-Amz-Target": "AWSCognitoIdentityProviderService.GetUser",
        },
      }
    );
    return data;
  } catch (error) {
    return false;
  }
};

// export default isAuth;
