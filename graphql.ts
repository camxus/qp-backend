import { ApolloServer } from "@apollo/server";
import {
  startServerAndCreateLambdaHandler,
  handlers,
} from "@as-integrations/aws-lambda";
import resolvers from "./graphql/resolvers/index.js";
import schema from "./graphql/schema/index";

// Set up Apollo Server
const server = new ApolloServer({
  schema,
  // resolvers,
  rootValue: resolvers,
});

// This final export is important!
export const graphqlHandler = startServerAndCreateLambdaHandler(
  server,
  // We will be using the Proxy V2 handler
  handlers.createAPIGatewayProxyEventV2RequestHandler(),
  {
    context: async ({ event, context }) => {
      return {
        req: event,
        context: context,
      };
    },
  }
);
