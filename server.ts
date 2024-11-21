import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import resolvers from "./graphql/resolvers/index";
import schema from "./graphql/schema/index";
import { GraphQLScalarType, Kind } from "graphql";

require('dotenv').config();

const app = express();
const httpServer = http.createServer(app);

// Set up Apollo Server
const server = new ApolloServer({
  schema,
  // resolvers: null,
  rootValue: resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

async function run() {
  await server.start();

  app.use(
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ res, req }) => {
        return { req };
      },
    })
  );

  await new Promise((resolve) =>
    httpServer.listen({ port: 4000 }, () => resolve(""))
  );
  console.log(`🚀 Server ready at http://localhost:4000`);
}

run();
