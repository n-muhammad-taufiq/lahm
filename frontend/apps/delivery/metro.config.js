const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch only the specific shared packages rather than entire monorepo root to avoid Windows file watcher limits
config.watchFolders = [
  path.resolve(workspaceRoot, "packages/tokens"),
  path.resolve(workspaceRoot, "packages/ui"),
  path.resolve(workspaceRoot, "packages/api"),
];
// Resolve modules in both app and monorepo root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

module.exports = withNativeWind(config, { input: "./src/global.css" });

