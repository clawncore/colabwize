const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    webpack: {
        configure: (config) => {
            if (process.env.NODE_ENV === "production") {
                config.optimization.minimizer = [
                    new TerserPlugin({
                        terserOptions: {
                            compress: {
                                drop_console: true,
                                drop_debugger: true,
                            },
                        },
                    }),
                ];
            }
            return config;
        },
    },
};
