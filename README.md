# Netlify Pipeline

[![fluentci pipeline](https://img.shields.io/badge/dynamic/json?label=pkg.fluentci.io&labelColor=%23000&color=%23460cf1&url=https%3A%2F%2Fapi.fluentci.io%2Fv1%2Fpipeline%2Fnetlify_pipeline&query=%24.version)](https://pkg.fluentci.io/netlify_pipeline)
[![deno module](https://shield.deno.dev/x/netlify_pipeline)](https://deno.land/x/netlify_pipeline)
![deno compatibility](https://shield.deno.dev/deno/^1.34)
[![](https://img.shields.io/codecov/c/gh/fluent-ci-templates/netlify-pipeline)](https://codecov.io/gh/fluent-ci-templates/netlify-pipeline)

A ready-to-use CI/CD Pipeline for deploying your applications to [Netlify](https://www.netlify.com).


## 🚀 Usage

Run the following command:

```bash
dagger run fluentci netlify_pipeline
```

## Environment Variables

| Variable           | Description                             |
|--------------------|-----------------------------------------|
| NETLIFY_AUTH_TOKEN | Your Netlify Access Token               |
| NETLIFY_SITE_ID    | Your Netlify Site ID                    |
| NETLIFY_SITE_DIR   | Your directory to deploy (default: `.`) |

## Jobs

| Job     | Description                          |
|---------|--------------------------------------|
| build   | Builds your application.             |
| deploy  | Deploys your application to Netlify. |

## Programmatic usage

You can also use this pipeline programmatically:

```typescript
import Client, { connect } from "https://sdk.fluentci.io/v0.1.9/mod.ts";
import { build, deploy } from "https://pkg.fluentci.io/netlify_pipeline@v0.5.3/mod.ts";

function pipeline(src = ".") {
  connect(async (client: Client) => {
    await build(client, src);
    await deploy(client, src);
  });
}

pipeline();

```
