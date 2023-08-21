# AWS CodePipeline

[![deno module](https://shield.deno.dev/x/netlify_pipeline)](https://deno.land/x/netlify_pipeline)
![deno compatibility](https://shield.deno.dev/deno/^1.34)
[![](https://img.shields.io/codecov/c/gh/fluent-ci-templates/netlify-pipeline)](https://codecov.io/gh/fluent-ci-templates/netlify-pipeline)

The following command will generate a `buildspec.yml` file in your project:

```bash
fluentci ac init -t netlify_pipeline
```

Generated file:

```yaml
# Do not edit this file directly. It is generated by https://deno.land/x/fluent_aws_codepipeline

version: 0.2
phases:
  install:
    commands:
      - curl -fsSL https://deno.land/x/install/install.sh | sh
      - export DENO_INSTALL="$HOME/.deno"
      - export PATH="$DENO_INSTALL/bin:$PATH"
      - deno install -A -r https://cli.fluentci.io -n fluentci
      - curl -L https://dl.dagger.io/dagger/install.sh | DAGGER_VERSION=0.8.1 sh
      - mv bin/dagger /usr/local/bin
      - dagger version
  build:
    commands:
      - dagger run fluentci netlify_pipeline
  post_build:
    commands:
      - echo Build completed on `date`
env:
  secrets-manager:
    NETLIFY_AUTH_TOKEN: netlify:NETLIFY_AUTH_TOKEN

```

Feel free to edit the template generator at `.fluentci/src/aws/config.ts` to your needs.