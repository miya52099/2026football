const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias["react"] = path.resolve(__dirname, "node_modules/react");
    config.resolve.alias["react-dom"] = path.resolve(__dirname, "node_modules/react-dom");
    config.resolve.alias["react/jsx-runtime"] = path.resolve(__dirname, "node_modules/react/jsx-runtime");
    config.resolve.alias["react/jsx-dev-runtime"] = path.resolve(__dirname, "node_modules/react/jsx-dev-runtime");
    config.resolve.alias["react-dom/server"] = path.resolve(__dirname, "node_modules/react-dom/server");
    return config;
  },
};

module.exports = nextConfig;
