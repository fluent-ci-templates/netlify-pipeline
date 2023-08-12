import { GitlabCI } from "fluent_gitlab_ci";
import { hello } from "./jobs.ts";

const gitlabci = new GitlabCI().image("alpine").addJob("hello", hello);

export default gitlabci;
