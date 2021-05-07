const rules = require("./webpack.rules");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
rules.push({
    test: /\.css$/,
    use: [
        { loader: "style-loader" },
        { loader: "css-loader" },
        { loader: "postcss-loader" },
    ],
});

rules.push({
    test: /\.(png|jpe?g|gif|ico|svg)$/i,
    use: [
        {
            loader: "file-loader",
            options: {
                name: "[path][name].[ext]",
                publicPath: "..",
                context: "src", 
            },
        },
    ],
});

module.exports = {
    module: {
        rules,
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.join("src", "app", "assets"),
                    to: "assets"
                }
            ]
        }),
    ],
    externals: [
		{
			'./cptable': 'var cptable'
		}
	]
};
