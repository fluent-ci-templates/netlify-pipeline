# Netlify Pipeline

[![fluentci pipeline](https://shield.fluentci.io/x/netlify_pipeline)](https://pkg.fluentci.io/netlify_pipeline)
[![deno module](https://shield.deno.dev/x/netlify_pipeline)](https://deno.land/x/netlify_pipeline)
![deno compatibility](https://shield.deno.dev/deno/^1.41)
[![dagger-min-version](https://shield.fluentci.io/dagger/v0.11.7)](https://dagger.io)
[![](https://img.shields.io/codecov/c/gh/fluent-ci-templates/netlify-pipeline)](https://codecov.io/gh/fluent-ci-templates/netlify-pipeline)

A ready-to-use CI/CD Pipeline for deploying your applications to [Netlify](https://www.netlify.com).


## 🚀 Usage

Run the following command:

```bash
fluentci run netlify_pipeline
```

## Dagger Module

Use as a [Dagger](https://dagger.io) module:

```bash
dagger mod install github.com/fluent-ci-templates/netlify-pipeline@mod
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

```typescript
build(
  src?: Directory | string = "."
): Promise<Directory | string>

deploy(
  src: Directory | string,
  token: Secret | string,
  siteId: string,
  siteDir: string
): Promise<string>
```

## Programmatic usage

You can also use this pipeline programmatically:

```typescript
import { build, deploy } from "https://pkg.fluentci.io/netlify_pipeline@v0.7.2/mod.ts";

await build();
await deploy();

```
