import Client from "@fluentci.io/dagger";

export enum Job {
  build = "build",
  deploy = "deploy",
}

export const exclude = [".devbox", "node_modules", ".fluentci"];

export const build = async (client: Client, src = ".") => {
  const context = client.host().directory(src);
  const ctr = client
    .pipeline(Job.build)
    .container()
    .from("ghcr.io/fluent-ci-templates/bun:latest")
    .withMountedCache(
      "/root/.bun/install/cache",
      client.cacheVolume("bun-cache")
    )
    .withMountedCache("/app/node_modules", client.cacheVolume("node_modules"))
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app")
    .withExec(["sh", "-c", 'eval "$(devbox global shellenv)" && bun install'])
    .withExec([
      "sh",
      "-c",
      'eval "$(devbox global shellenv)" && bun run build',
    ]);

  const result = await ctr.stdout();

  await ctr.directory("/app/dist").export("./dist");

  console.log(result);
};

export const deploy = async (client: Client, src = ".") => {
  const context = client.host().directory(src);

  if (!Deno.env.has("NETLIFY_AUTH_TOKEN")) {
    console.log("NETLIFY_AUTH_TOKEN is not set");
    Deno.exit(1);
  }

  if (!Deno.env.has("NETLIFY_SITE_ID")) {
    console.log("NETLIFY_SITE_ID is not set");
    Deno.exit(1);
  }

  const dir = Deno.env.get("NETLIFY_SITE_DIR") || ".";

  let deployCommand = `eval "$(devbox global shellenv)" && bun x netlify-cli status && bun x netlify-cli deploy --dir ${dir}`;

  if (Deno.env.get("PRODUCTION_DEPLOY") === "1") {
    deployCommand += " --prod";
  }

  const ctr = client
    .pipeline(Job.deploy)
    .container()
    .from("ghcr.io/fluent-ci-templates/bun:latest")
    .withMountedCache(
      "/root/.bun/install/cache",
      client.cacheVolume("bun-cache")
    )
    .withMountedCache("/app/node_modules", client.cacheVolume("node_modules"))
    .withEnvVariable("NETLIFY_AUTH_TOKEN", Deno.env.get("NETLIFY_AUTH_TOKEN")!)
    .withEnvVariable("NETLIFY_SITE_ID", Deno.env.get("NETLIFY_SITE_ID")!)
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app")
    .withExec(["sh", "-c", deployCommand]);

  const result = await ctr.stdout();

  console.log(result);
};

export type JobExec = (
  client: Client,
  src?: string
) =>
  | Promise<void>
  | ((
      client: Client,
      src?: string,
      options?: {
        ignore: string[];
      }
    ) => Promise<void>);

export const runnableJobs: Record<Job, JobExec> = {
  [Job.build]: build,
  [Job.deploy]: deploy,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.build]: "Build the project",
  [Job.deploy]: "Deploy to Netlify",
};
