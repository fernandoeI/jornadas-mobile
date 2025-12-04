const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { withMonicon } = require("@monicon/metro");

const config = getDefaultConfig(__dirname);
config.resolver.blockList = [/@monicon\/runtime/].concat(
  config.resolver.blockList
);

const configWithMonicon = withMonicon(config, {
  collections: [
    "radix-icons",
    "lucide",
    "fe",
    "mdi",
    "ic",
    "openmoji",
    "material-symbols",
  ],
});

const configWithNativeWind = withNativeWind(configWithMonicon, {
  input: "./global.css",
  inlineRem: 16,
});

module.exports = configWithNativeWind;
