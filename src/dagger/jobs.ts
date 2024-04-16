import { Directory, Secret, dag } from "../../sdk/client.gen.ts";
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
  const context = await getDirectory(src);
  const ctr = dag
    .pipeline(Job.build)
    .container()
    .from("pkgxdev/pkgx:latest")
    .withExec(["apt-get", "update"])
    .withExec([
      "apt-get",
      "install",
      "-y",
      "ca-certificates",
      "build-essential",
    ])
    .withExec(["pkgx", "install", "node@18.19.0", "bun@1.1.3", "git"])
    .withMountedCache("/app/node_modules", dag.cacheVolume("node_modules"))
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app")
    .withExec(["bun", "install"])
    .withExec(["bun", "run", "build"])
    .withExec(["cp", "-r", "/app/dist", "/dist"]);

  await ctr.stdout();

  await ctr.directory("/app/dist").export("./dist");

  const id = await ctr.directory("/dist").id();
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
  const context = await getDirectory(src);

  if (!Deno.env.has("NETLIFY_AUTH_TOKEN") && !token) {
    console.log("NETLIFY_AUTH_TOKEN is not set");
    Deno.exit(1);
  }

  if (!Deno.env.has("NETLIFY_SITE_ID") && !siteId) {
    console.log("NETLIFY_SITE_ID is not set");
    Deno.exit(1);
  }

  const dir = Deno.env.get("NETLIFY_SITE_DIR") || siteDir || ".";

  const secret = await getNetlifyAuthToken(token);

  if (!secret) {
    console.log("NETLIFY_AUTH_TOKEN is not set");
    Deno.exit(1);
  }

  let deployCommand = `npx netlify-cli deploy --dir ${dir}`;

  if (Deno.env.get("PRODUCTION_DEPLOY") === "1") {
    deployCommand += " --prod";
  }

  const ctr = dag
    .pipeline(Job.deploy)
    .container()
    .from("pkgxdev/pkgx:latest")
    .withExec([
      "apt-get",
      "install",
      "-y",
      "ca-certificates",
      "build-essential",
    ])
    .withExec(["pkgx", "install", "node@18.19.0", "bun@1.1.3", "git", "npm"])
    .withSecretVariable("NETLIFY_AUTH_TOKEN", secret)
    .withEnvVariable(
      "NETLIFY_SITE_ID",
      Deno.env.get("NETLIFY_SITE_ID") || siteId!
    )
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app")
    .withExec(["npx", "netlify-cli", "status"])
    .withExec(deployCommand.split(" "));

  const result = await ctr.stdout();
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
