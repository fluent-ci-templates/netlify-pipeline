import { CircleCI, Job } from "fluent_circleci";

export function generateYaml(): CircleCI {
  const circleci = new CircleCI();

  const deploy = new Job()
    .machine({ image: "ubuntu-2004:2023.07.1" })
    .variables({
      NETLIFY_AUTH_TOKEN: "${{netlify.NETLIFY_AUTH_TOKEN}}",
    })
    .steps([
      "checkout",
      {
        run: "sudo apt-get update && sudo apt-get install -y curl unzip",
      },
      {
        run: `\
curl -fsSL https://deno.land/x/install/install.sh | sh
export DENO_INSTALL="$HOME/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"`,
      },
      {
        run: "deno install -A -r https://cli.fluentci.io -n fluentci",
      },
      {
        run: `\
curl -L https://dl.dagger.io/dagger/install.sh | DAGGER_VERSION=0.8.1 sh
sudo mv bin/dagger /usr/local/bin
dagger version`,
      },
      {
        run: {
          name: "Run Dagger Pipelines",
          command: "dagger run fluentci netlify_pipeline",
        },
      },
    ]);

  circleci.jobs({ deploy }).workflow("dagger", ["deploy"]);

  return circleci;
}
