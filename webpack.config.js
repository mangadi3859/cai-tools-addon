const path = require("path");

module.exports = {
    entry: {
        content: "./src/content.ts",
    },
    output: {
        path: path.resolve(__dirname, "dist", "js"),
        filename: "[name].js",
    },
    devtool: "source-map",
    module: {
        rules: [{ test: /\.ts$/, use: "ts-loader" }],
    },
    resolve: {
        extensions: [".ts", ".js"],
        modules: ["node_modules", path.resolve(__dirname, "src")],
    },
};
