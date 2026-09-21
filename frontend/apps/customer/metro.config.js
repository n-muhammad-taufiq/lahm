const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch only the specific shared packages rather than entire monorepo root to avoid Windows file watcher limits
config.watchFolders = [
  path.resolve(monorepoRoot, "packages/tokens"),
  path.resolve(monorepoRoot, "packages/ui"),
  path.resolve(monorepoRoot, "packages/api"),
];

// Resolve modules in both app and monorepo root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

module.exports = withNativeWind(config, { input: "./src/global.css" });
