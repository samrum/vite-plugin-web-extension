import os from "node:os";
import fs from "fs-extra";
import { spawn } from "node:child_process";
import { SafariBuildOptions } from "../../types";

export async function convertToSafariWebExtension(
  dist: string,
  {
    dir = undefined,
    appName = "web-extension",
    bundleIdentifier = "",
    objc = false,
  }: SafariBuildOptions = {}
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    spawn("which", ["xcrun"]).on("close", (code) =>
      code ? reject("Xcode Command Line Tools are not available") : resolve()
    );
  });

  await new Promise<void>((resolve, reject) => {
    spawn("which", ["xcodebuild"]).on("close", (code) =>
      code ? reject("Xcode Command Line Tools are not available") : resolve()
    );
  });

  const outputPath = dir
    ? `${dist.split("/").slice(0, -1).join("/")}/${dir}`
    : `${dist}-safari`;

  const projectLocation = `${os.tmpdir()}/vite-plugin-web-extension-safari-${Date.now()}-${~~(
    Math.random() * 1000000
  )}`;

  await fs.remove(projectLocation);
  await fs.ensureDir(projectLocation);

  try {
    await new Promise<void>((resolve, reject) => {
      const cp = spawn(
        "xcrun",
        [
          "safari-web-extension-converter",
          "--no-open",
          "--copy-resources",
          "--macos-only",
          "--project-location",
          projectLocation,
          "--app-name",
          appName,
          objc ? "--objc" : "--swift",
          ...(bundleIdentifier
            ? ["--bundle-identifier", bundleIdentifier]
            : []),
          dist,
        ],
        {
          stdio: ["ignore", "pipe", "pipe"],
        }
      );

      let error = "";

      cp.stderr.on("data", (data) => {
        error += data;
      });

      cp.on("close", (code) => (code ? reject(error) : resolve()));
    });

    await new Promise<void>((resolve, reject) => {
      const cp = spawn(
        "xcodebuild",
        [
          "-project",
          `${projectLocation}/${appName}/${appName}.xcodeproj`,
          "-scheme",
          appName,
          "-configuration",
          "Release",
          `SYMROOT=${projectLocation}`,
          "build",
        ],
        {
          stdio: ["ignore", "pipe", "pipe"],
        }
      );

      let error = "";

      const onClose = (code: number) => (code ? reject(error) : resolve());

      const onData = (data: string) => {
        error += data;

        if (error.includes("** BUILD FAILED **")) {
          cp.kill();
          onClose(1);
        }
      };

      cp.stdout.on("data", onData);
      cp.stderr.on("data", onData);
      cp.on("close", onClose);
    });

    await fs.remove(outputPath);
    await fs.ensureDir(outputPath);

    await fs.copy(
      `${projectLocation}/Release/${appName}.app`,
      `${outputPath}/${appName}.app`
    );
  } finally {
    await fs.remove(projectLocation);
  }
}
