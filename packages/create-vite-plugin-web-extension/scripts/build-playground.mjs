import util from "util";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { exec as execCallback } from "child_process";

const exec = util.promisify(execCallback);

const __dirname = dirname(fileURLToPath(import.meta.url));

const frameworks = ["vanilla", "vue", "svelte", "react", "preact"];

const manifestVersions = ["2", "3", "2+3"];

const builds = [];

(async () => {
  await exec("pnpm build");
  await exec("mkdir -p playground && rm -rf playground/*");

  for (const framework of frameworks) {
    for (const manifest of manifestVersions) {
      const manifestFilename = manifest.replace("+", "-");
      const flags = [
        `--manifest=${manifest}`,
        `--framework=${framework}`,
        `--force`,
      ];

      builds.push([`${framework}-v${manifestFilename}`, ...flags]);

      builds.push([`${framework}-v${manifestFilename}-ts`, ...flags, `--ts`]);
    }
  }

  for (const buildArgs of builds) {
    await exec(`cd playground && node ../create.cjs ${buildArgs.join(" ")}`);

    await exec(`cd playground/${buildArgs[0]} && pnpm i && pnpm build`);
    console.log(
      `cd ${__dirname}/../playground/${buildArgs[0]} && pnpm serve:chrome`
    );
  }
})();
