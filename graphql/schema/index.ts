/// <reference path="./graphql.d.ts" />
import { buildSchema } from "graphql";
import dynamoDB from "./dynamoDB.js";
import root from "./root.js";
import user from "./user.js";
import cities from "./cities.js";
import spots from "./spots.js";

export default buildSchema(
  [root, dynamoDB, user, cities, spots].join()
);
