const {resolvePath} = require('babel-plugin-module-resolver');

module.exports = {
    presets: [
        '@babel/preset-react'
    ],
    plugins: [
        '@babel/plugin-syntax-dynamic-import',
        [
            'babel-plugin-module-resolver',
            {
                alias: {
                    'react': './node_modules/react/umd/react.production.min.js',
                    'react-dom': './node_modules/react-dom/umd/react-dom.production.min.js'
                },
                //FIXME here should be cwd: 'build' but it does not work, so we just replace as follows to make sure we stay in build dir
                resolvePath: (sourcePath, currentFile, opts) => resolvePath(sourcePath, currentFile, opts).replace('../../', '../')
            }
        ]
    ]
};