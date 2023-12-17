import { Client, Directory, Secret } from "../../sdk/client.gen.ts";
import { connect } from "../../sdk/connect.ts";
import { getDirectory, getNetlifyAuthToken } from "./lib.ts";

export enum Job {
  build = "build",
  deploy = "deploy",
}

export const exclude = [".devbox", "node_modules", ".fluentci"];

/**
 * @function
 * @description Build the project
 * @param {string | Directory} src
 * @returns {string}
 */
export async function build(
  src: Directory | string = "."
): Promise<Directory | string> {
  let id = "";
  await connect(async (client: Client) => {
    const context = getDirectory(client, src);
    const ctr = client
      .pipeline(Job.build)
      .container()
      .from("pkgxdev/pkgx:latest")
      .withExec(["pkgx", "install", "node@18.16.1", "bun"])
      .withMountedCache(
        "/root/.bun/install/cache",
        client.cacheVolume("bun-cache")
      )
      .withMountedCache("/app/node_modules", client.cacheVolume("node_modules"))
      .withDirectory("/app", context, { exclude })
      .withWorkdir("/app")
      .withExec(["bun", "install"])
      .withExec([
        "sh",
        "-c",
        'eval "$(devbox global shellenv)" && bun run build',
      ])
      .withExec(["cp", "-r", "/app/dist", "/dist"]);

    await ctr.stdout();

    await ctr.directory("/app/dist").export("./dist");

    id = await ctr.directory("/dist").id();
  });
  return id;
}

/**
 * @function
 * @description Deploy to Netlify
 * @param {string | Directory} src
 * @returns {string}
 */
export async function deploy(
  src: Directory | string,
  token: Secret | string,
  siteId: string,
  siteDir: string
): Promise<string> {
  let result = "";
  await connect(async (client: Client) => {
    const context = getDirectory(client, src);

    if (!Deno.env.has("NETLIFY_AUTH_TOKEN") && !token) {
      console.log("NETLIFY_AUTH_TOKEN is not set");
      Deno.exit(1);
    }

    if (!Deno.env.has("NETLIFY_SITE_ID") && !siteId) {
      console.log("NETLIFY_SITE_ID is not set");
      Deno.exit(1);
    }

    const dir = Deno.env.get("NETLIFY_SITE_DIR") || siteDir || ".";

    const secret = getNetlifyAuthToken(client, token);

    if (!secret) {
      console.log("NETLIFY_AUTH_TOKEN is not set");
      Deno.exit(1);
    }

    let deployCommand = `bunx netlify-cli status && bunx netlify-cli deploy --dir ${dir}`;

    if (Deno.env.get("PRODUCTION_DEPLOY") === "1") {
      deployCommand += " --prod";
    }

    const ctr = client
      .pipeline(Job.deploy)
      .container()
      .from("pkgxdev/pkgx:latest")
      .withExec(["pkgx", "install", "node@18.16.1", "bun"])
      .withMountedCache(
        "/root/.bun/install/cache",
        client.cacheVolume("bun-cache")
      )
      .withMountedCache("/app/node_modules", client.cacheVolume("node_modules"))
      .withSecretVariable("NETLIFY_AUTH_TOKEN", secret)
      .withEnvVariable(
        "NETLIFY_SITE_ID",
        Deno.env.get("NETLIFY_SITE_ID") || siteId!
      )
      .withDirectory("/app", context, { exclude })
      .withWorkdir("/app")
      .withExec(["sh", "-c", deployCommand]);

    result = await ctr.stdout();
  });
  return result;
}

export type JobExec = (
  src: Directory | string,
  token: Secret | string,
  siteId: string,
  siteDir: string
) => Promise<Directory | string>;

export const runnableJobs: Record<Job, JobExec> = {
  [Job.build]: build,
  [Job.deploy]: deploy,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.build]: "Build the project",
  [Job.deploy]: "Deploy to Netlify",
};
