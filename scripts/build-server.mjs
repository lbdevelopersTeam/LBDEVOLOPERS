import { mkdir } from "node:fs/promises";
import path from "node:path";
import { build } from "esbuild";

const outputDirectory = path.resolve("dist");

await mkdir(outputDirectory, { recursive: true });

await build({
  entryPoints: [path.resolve("server.ts")],
  outfile: path.join(outputDirectory, "server.mjs"),
  platform: "node",
  format: "esm",
  bundle: true,
  packages: "external",
  target: "node22",
  sourcemap: true,
  banner: {
    js: "process.env.NODE_ENV ||= 'production';",
  },
});
