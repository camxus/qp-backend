import {
  DynamoDBClient,
  QueryCommand,
  QueryCommandInput,
  ScanCommand,
  ScanCommandInput,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

export const updateItem = async (client, params, tableName, key) => {
  // Construct the UpdateItemCommandInput
  const expressions = {
    ExpressionAttributeValues: {},
    ExpressionAttributeNames: {},
  };

  const entries = Object.entries(params).filter(([k]) => k !== key);

  entries.forEach(([k, v]) => {
    expressions.ExpressionAttributeValues[`:${k}`] = v;
    expressions.ExpressionAttributeNames[`#${k}`] = k;
  });
  
  const p: UpdateItemCommandInput = {
    TableName: tableName, 
    Key: marshall({ [`${key}`]: params[`${key}`] }), 
    UpdateExpression: `SET ${entries.map(([k]) => `#${k} = :${k}`).join(", ")}`,
    ExpressionAttributeNames: expressions.ExpressionAttributeNames,
    ExpressionAttributeValues: marshall(expressions.ExpressionAttributeValues),
    ConditionExpression: `attribute_exists(${key})`,
    ReturnValues: 'ALL_NEW'
  };
  
  try {
    const results = await client.send(new UpdateItemCommand(p));
    if (results.$metadata.httpStatusCode === 200) {
      return unmarshall(results.Attributes);
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const itemsByFilter = async (
  client: DynamoDBClient,
  params: any,
  TableName: string,
  condition: "equals" | "contains"
) => {
  const expression = {};
  const keys = Object.keys(params);
  Object.entries(params).map(([k, v]) => {
    expression[`:${k}`] = v;
  });

  const p: ScanCommandInput = {
    TableName,
    ExpressionAttributeValues: marshall(expression),
  };
  switch (condition) {
    case "equals":
      p.FilterExpression = keys.map((k) => `${k} = :${k}`).join(" AND ");
      break;
    case "contains":
      p.FilterExpression = keys
        .map((k) => `contains(${k}, :${k})`)
        .join(" AND ");
      break;

    default:
      throw new Error("MISSING CONDITION");
  }

  try {
    const results = await client.send(new ScanCommand(p));
    if (results.$metadata.httpStatusCode === 200) {
      const items: any = [];
      results.Items?.forEach((item) => {
        items.push(unmarshall(item));
      });
      return items;
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const queryItem = async (
  client: DynamoDBClient,
  TableName: string,
  key: string,
  partitionKey: any
) => {
  const p: QueryCommandInput = {
    TableName,
    KeyConditionExpression: `${key} = :${key}`,
    ExpressionAttributeValues: marshall({ [`:${key}`]: partitionKey }),
  };

  try {
    const results = await client.send(new QueryCommand(p));
    if (results.Items?.[0]) {
      const item = unmarshall(results.Items[0]);
      return item;
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const getItemImages = async (
  client: S3Client,
  item: any,
  itemKey: string
) => {
  if (!item[itemKey] || item[itemKey].length === 0) return item;
  const itemImages = await Promise.all(
    item[itemKey].map(async (image) => {
      try {
        const command = new GetObjectCommand({
          Bucket: image.s3location.bucket,
          Key: image.s3location.key,
          // ContentType: "image/jpeg"
          // Expires: new Date(exp),
        });

        const url = await getSignedUrl(client, command, {
          expiresIn: 3600,
        });

        return { ...image, url };
      } catch (error) {
        console.error(error);
      }
    })
  );
  item[itemKey] = itemImages;
  return item;
};
