import Client, { connect } from "../../deps.ts";

export enum Job {
  build = "build",
  deploy = "deploy",
}

export const exclude = [".devbox", "node_modules", ".fluentci"];

export const build = async (src = ".") => {
  await connect(async (client: Client) => {
    const context = client.host().directory(src);
    const ctr = client
      .pipeline(Job.build)
      .container()
      .from("ghcr.io/fluentci-io/bun:latest")
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
  });
  return "Done";
};

export const deploy = async (
  src = ".",
  token?: string,
  siteId?: string,
  siteDir?: string
) => {
  await connect(async (client: Client) => {
    const context = client.host().directory(src);

    if (!Deno.env.has("NETLIFY_AUTH_TOKEN") && !token) {
      console.log("NETLIFY_AUTH_TOKEN is not set");
      Deno.exit(1);
    }

    if (!Deno.env.has("NETLIFY_SITE_ID") && !siteId) {
      console.log("NETLIFY_SITE_ID is not set");
      Deno.exit(1);
    }

    const dir = Deno.env.get("NETLIFY_SITE_DIR") || siteDir || ".";

    let deployCommand = `eval "$(devbox global shellenv)" && bun x netlify-cli status && bun x netlify-cli deploy --dir ${dir}`;

    if (Deno.env.get("PRODUCTION_DEPLOY") === "1") {
      deployCommand += " --prod";
    }

    const ctr = client
      .pipeline(Job.deploy)
      .container()
      .from("ghcr.io/fluentci-io/bun:latest")
      .withMountedCache(
        "/root/.bun/install/cache",
        client.cacheVolume("bun-cache")
      )
      .withMountedCache("/app/node_modules", client.cacheVolume("node_modules"))
      .withEnvVariable(
        "NETLIFY_AUTH_TOKEN",
        Deno.env.get("NETLIFY_AUTH_TOKEN") || token!
      )
      .withEnvVariable(
        "NETLIFY_SITE_ID",
        Deno.env.get("NETLIFY_SITE_ID") || siteId!
      )
      .withDirectory("/app", context, { exclude })
      .withWorkdir("/app")
      .withExec(["sh", "-c", deployCommand]);

    const result = await ctr.stdout();

    console.log(result);
  });
  return "Done";
};

export type JobExec = (
  src?: string,
  token?: string,
  siteId?: string,
  siteDir?: string
) =>
  | Promise<string>
  | ((
      src?: string,
      token?: string,
      siteId?: string,
      siteDir?: string,
      options?: {
        ignore: string[];
      }
    ) => Promise<string>);

export const runnableJobs: Record<Job, JobExec> = {
  [Job.build]: build,
  [Job.deploy]: deploy,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.build]: "Build the project",
  [Job.deploy]: "Deploy to Netlify",
};
