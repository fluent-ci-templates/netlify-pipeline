import { GitlabCI, Job } from "fluent_gitlab_ci";

export function generateYaml(): GitlabCI {
  const setupDagger = `
deno install -A -r https://cli.fluentci.io -n fluentci
curl -L https://dl.dagger.io/dagger/install.sh | DAGGER_VERSION=0.8.1 sh
sudo mv bin/dagger /usr/local/bin
dagger version`;

  const deploy = new Job()
    .beforeScript(setupDagger, {
      multiline: true,
    })
    .script("dagger run fluentci netlify_pipeline");

  return new GitlabCI().addJob("deploy", deploy);
}
