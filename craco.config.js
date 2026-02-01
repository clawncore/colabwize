module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            if (process.env.NODE_ENV === 'production') {
                // Ensure optimization and minimizer exist
                if (webpackConfig.optimization && webpackConfig.optimization.minimizer) {
                    const terserPlugin = webpackConfig.optimization.minimizer.find(
                        (minimizer) =>
                            minimizer &&
                            minimizer.constructor &&
                            minimizer.constructor.name === 'TerserPlugin'
                    );

                    if (terserPlugin) {
                        // Ensure nested objects exist
                        terserPlugin.options = terserPlugin.options || {};
                        terserPlugin.options.terserOptions = terserPlugin.options.terserOptions || {};
                        terserPlugin.options.terserOptions.compress = terserPlugin.options.terserOptions.compress || {};

                        // Apply settings
                        terserPlugin.options.terserOptions.compress.drop_console = true;
                        terserPlugin.options.terserOptions.compress.drop_debugger = true;
                    }
                }
            }
            return webpackConfig;
        },
    },
};
