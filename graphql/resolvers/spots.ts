import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  QueryCommandInput,
  ScanCommand,
  ScanCommandInput,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 } from "uuid";
import { isAuth } from "../../middleware/isAuth";
import { itemsByFilter, updateItem } from "../../src/utils/dynamoDB";

interface SpotInput {
  spotId?: string;
  coordinates: {
    lon: string;
    lat: string;
  };
  occupied: boolean;
  reserved: boolean;
  active: boolean,
  cityId: string
}

type Filters = Partial<Record<keyof SpotInput, any>>;
type SpotsByLocation = { lon: number; lat: number; latDelta: number; lonDelta: number }

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

const createSpot = async (input: SpotInput) => {
  const spot = {
    ...input,
    spotId: v4(),
    active: true,
    createdAt: +new Date(),
  };

  const params = {
    TableName: "Spots",
    Item: marshall(spot),
  };

  try {
    if (!spot.cityId) {
      throw new Error("REQUIRED_PARAM_cityId")
    }
    const results = await client.send(new PutItemCommand(params));
    if (results.$metadata.httpStatusCode === 200) {
      return spot;
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const updateSpot = async (params: Partial<Record<keyof SpotInput, any>>) => {
  return await updateItem(client, params, "Spots", "spotId");
};

const spots = async () => {
  const params = {
    TableName: "Spots",
  };

  try {
    const results = await client.send(new ScanCommand(params));
    if (results.$metadata.httpStatusCode === 200) {
      return results.Items.map((item) => unmarshall(item));
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const spotsByFilter = async (params: Filters) => {
  return await itemsByFilter(client, params, "Spots", "equals");
};

const spotsByLocation = async (params: SpotsByLocation) => {
  if (!params.lon || !params.lat) throw new Error("LATITUDE_LONGITUDE_MISSING");

  const { lon, lat, latDelta, lonDelta } = params;

  // Construct the filter expression to find spots within the bounding box
  const filterExpression = 'coordinates.lat BETWEEN :latMin AND :latMax AND coordinates.lon BETWEEN :lonMin AND :lonMax';

  const expressionAttributeValues = marshall({
    ":latMin": lat - Number(latDelta),
    ":latMax": lat + Number(latDelta),
    ":lonMin": lon - Number(lonDelta),
    ":lonMax": lon + Number(lonDelta),
  });

  const scanParams: ScanCommandInput = {
    TableName: "Spots",
    FilterExpression: filterExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  };

  try {
    const results = await client.send(new ScanCommand(scanParams));
    if (results.$metadata.httpStatusCode === 200) {
      console.log(scanParams)
      const spots = results.Items.map((item) => unmarshall(item));
      return spots;
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export default {
  createSpot: async (args: { input: SpotInput }, { req }) => {
    if (!(await isAuth(req?.headers.authorization)))
      throw new Error("USER_NOT_AUTHENTICATED");
    return createSpot(args.input);
  },
  spots: async (_, { req }) => {
    if (!(await isAuth(req?.headers.authorization)))
      throw new Error("USER_NOT_AUTHENTICATED");
    return spots();
  },
  spotsByFilter: async (args: { input: Filters }, { req }) => {
    if (!(await isAuth(req?.headers.authorization)))
      throw new Error("USER_NOT_AUTHENTICATED");
    return spotsByFilter(args.input);
  },
  updateSpot: async (args: { input: Filters }, { req }) => {
    if (!(await isAuth(req?.headers.authorization)))
      throw new Error("USER_NOT_AUTHENTICATED");
    return updateSpot(args.input);
  },
  spotsByLocation: async (args: { input: SpotsByLocation }, { req }) => {
    if (!(await isAuth(req?.headers.authorization)))
      throw new Error("USER_NOT_AUTHENTICATED");
    return spotsByLocation(args.input);
  },
};
