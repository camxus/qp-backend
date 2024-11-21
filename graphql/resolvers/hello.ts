import {isAuth} from "../../middleware/isAuth"

export default {
  hello: async (args, {req}, context) => {
    return !!await isAuth(req?.headers.authorization)
    console.log(`Auth: ${JSON.stringify(req?.headers)}, Context: ${JSON.stringify(context)}, Req: ${JSON.stringify(req)}`)
    if (context)

      return `Auth: ${JSON.stringify(req?.headers.authorization)}, Context: ${JSON.stringify(context)}, Req: ${JSON.stringify(req)}`
  },
};
