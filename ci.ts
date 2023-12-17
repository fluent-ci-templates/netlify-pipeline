import {
  build,
  deploy,
} from "https://pkg.fluentci.io/netlify_pipeline@v0.7.0/mod.ts";

await build();
await deploy();
