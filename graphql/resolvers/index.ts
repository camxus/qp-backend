import hello from "./hello";
import dynamoDB from "./dynamoDB.js";
import user from "./users";
import cities from "./cities";
import spots from "./spots";
import auth from "./auth";

export default {
  ...hello, ...dynamoDB, ...user, ...cities, ...spots, ...auth,
};
