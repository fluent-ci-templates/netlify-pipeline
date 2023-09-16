import Client from "@fluentci.io/dagger";
import { withDevbox } from "https://nix.fluentci.io/v0.4.1/src/dagger/steps.ts";

export enum Job {
  deploy = "deploy",
}

export const exclude = [".git", ".devbox", "node_modules", ".fluentci"];

export const deploy = async (client: Client, src = ".") => {
  const context = client.host().directory(src);

  if (!Deno.env.get("NETLIFY_AUTH_TOKEN")) {
    console.log("NETLIFY_AUTH_TOKEN is not set");
    Deno.exit(1);
  }

  if (!Deno.env.get("NETLIFY_SITE_ID")) {
    console.log("NETLIFY_SITE_ID is not set");
    Deno.exit(1);
  }

  const dir = Deno.env.get("NETLIFY_SITE_DIR") || ".";

  let deployCommand = `devbox global run -- bun x netlify-cli deploy --dir ${dir}`;

  if (Deno.env.get("PRODUCTION_DEPLOY") === "1") {
    deployCommand += " --prod";
  }

  const ctr = withDevbox(
    client
      .pipeline(Job.deploy)
      .container()
      .from("alpine:latest")
      .withExec(["apk", "update"])
      .withExec(["apk", "add", "curl", "bash"])
      .withMountedCache("/nix", client.cacheVolume("nix"))
      .withMountedCache("/etc/nix", client.cacheVolume("nix-etc"))
  )
    .withMountedCache(
      "/root/.local/share/devbox/global",
      client.cacheVolume("devbox-global")
    )
    .withExec(["devbox", "global", "add", "nodejs@18.16.1", "bun@0.7.0"])
    .withMountedCache(
      "/root/.bun/install/cache",
      client.cacheVolume("bun-cache")
    )
    .withMountedCache("/app/node_modules", client.cacheVolume("node_modules"))
    .withEnvVariable("NIX_INSTALLER_NO_CHANNEL_ADD", "1")
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
  [Job.deploy]: deploy,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.deploy]: "Deploy to Netlify",
};
