import * as jobs from "./jobs.ts";

const { build, deploy, runnableJobs } = jobs;

export default async function pipeline(src = ".", args: string[] = []) {
  if (args.length > 0) {
    await runSpecificJobs(args as jobs.Job[]);
    return;
  }
  await build();
  await deploy(
    src,
    Deno.env.get("NETLIFY_AUTH_TOKEN")!,
    Deno.env.get("NETLIFY_SITE_ID")!,
    Deno.env.get("NETLIFY_SITE_DIR")!
  );
}

async function runSpecificJobs(args: jobs.Job[]) {
  for (const name of args) {
    const job = runnableJobs[name];
    if (!job) {
      throw new Error(`Job ${name} not found`);
    }
    await job(
      ".",
      Deno.env.get("NETLIFY_AUTH_TOKEN")!,
      Deno.env.get("NETLIFY_SITE_ID")!,
      Deno.env.get("NETLIFY_SITE_DIR")!
    );
  }
}
