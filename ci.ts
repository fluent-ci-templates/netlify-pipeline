import {
  build,
  deploy,
} from "https://pkg.fluentci.io/netlify_pipeline@v0.7.2/mod.ts";

await build();
await deploy();
