import {
  queryType,
  makeSchema,
  dirname,
  join,
  resolve,
  stringArg,
  nonNull,
} from "../../deps.ts";

import { build, deploy } from "./jobs.ts";

const Query = queryType({
  definition(t) {
    t.string("build", {
      args: {
        src: nonNull(stringArg()),
      },
      resolve: async (_root, args, _ctx) => await build(args.src),
    });
    t.string("deploy", {
      args: {
        src: nonNull(stringArg()),
        token: nonNull(stringArg()),
        siteId: nonNull(stringArg()),
        siteDir: nonNull(stringArg()),
      },
      resolve: async (_root, args, _ctx) =>
        await deploy(args.src, args.token, args.siteId, args.siteDir),
    });
  },
});

export const schema = makeSchema({
  types: [Query],
  outputs: {
    schema: resolve(join(dirname(".."), dirname(".."), "schema.graphql")),
    typegen: resolve(join(dirname(".."), dirname(".."), "gen", "nexus.ts")),
  },
});
