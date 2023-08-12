# Netlify Pipeline

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

| Variable           | Description               |
|--------------------|---------------------------|
| NETLIFY_AUTH_TOKEN | Your Netlify Access Token |

## Jobs

| Job     | Description                      |
|---------|----------------------------------|
| deploy  | Deploys your application to Netlify. |

## Programmatic usage

You can also use this pipeline programmatically:

```typescript
import { Client, connect } from "https://esm.sh/@dagger.io/dagger@0.8.1";
import { Dagger } from "https://deno.land/x/netlify_pipeline/mod.ts";

const { deploy } = Dagger;

function pipeline(src = ".") {
  connect(async (client: Client) => {
    await deploy(client, src);
  });
}

pipeline();

```
