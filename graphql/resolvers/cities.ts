import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 } from "uuid";
import { isAuth } from "../../middleware/isAuth";

interface CityInput {
  country: string;
  location: {
    lon: number;
    lat: number;
  };
  name: string;
}

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

const createCity = async ({ country, location, name }: CityInput) => {
  const city = {
    cityId: v4(),
    country,
    location,
    name,
  };

  const params = {
    TableName: "Cities",
    Item: marshall(city),
  };
  
  try {
    const results = await client.send(new PutItemCommand(params));
    if (results.$metadata.httpStatusCode == 200) {
      return city;
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const cities = async () => {
  const params = {
    TableName: "Cities",
  };

  try {
    const results = await client.send(new ScanCommand(params));
    if (results.$metadata.httpStatusCode == 200) {
      const cities = [];
      results.Items.forEach((item) => {
        cities.push(unmarshall(item));
      });
      return cities;
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export default {
  createCity: async (args: { input: CityInput }, {req}) => {
    if (!(await isAuth(req?.headers.authorization)))
      throw new Error("USER_NOT_AUTHENTICATED");
    return createCity(args.input);
  },
  cities: async (_, {req}) => {
    if (!(await isAuth(req?.headers.authorization)))
      throw new Error("USER_NOT_AUTHENTICATED");
    return cities();
  },
};
