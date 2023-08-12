import { Job } from "fluent_gitlab_ci";

export const hello = new Job().script("echo 'Hello, world!'");
