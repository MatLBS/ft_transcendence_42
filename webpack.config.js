// webpack.config.js
import path from 'path';
import { fileURLToPath } from 'url';

// Solution pour __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    entry: {
        pong: './srcs/public/scripts/pong.ts',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'srcs/dist/srcs/public/scripts/'),
        library: {
            type: 'module',
        },
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    devtool: 'source-map',
    mode: 'development',
    target: 'web',
    experiments: {
        outputModule: true,
    },
};