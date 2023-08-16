import { generateYaml } from "./config.ts";

generateYaml().save(".github/workflows/deploy.yml");
