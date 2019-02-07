# Update Chunk Links In Files Webpack Plugin
This plugin replaces chunk file names (links) in given list of files. 

It's meant to solve the problem of updating file names inside HTML / ASPX / PHP / etc. files when chunk names contain a hash, which changes every time a new version of the file is created by WebPack.

In case you are not using Webpack to build your HTML / ASPX / PHP files, this plugin will solve that problem!

## Installation
```shell
$ npm install update-chunk-links-in-files-webpack-plugin --save-dev
```

## Example

### Webpack.config.js

First let's have a look at WebPack config file (unimportant bits are omitted for brevity).

Notice that the file names in the `output` section contain `[contenthash]`, which changes each time the content of the file changes.

```javascript
const path = require('path');
const UpdateChunkLinksInFilesWebpackPlugin = require('update-chunk-links-in-files-webpack-plugin');

module.exports = {

    entry: {
        "app": path.resolve("src/index.js")
    },
    output: {
        // chunk names contain `contenthash`
        filename: "[name].[contenthash].bundle.js",
        chunkFilename: "[name].[contenthash].bundle.js"
    },

    /* ... your usual WebPack stuff goes here ... */

    plugins: [
        new UpdateChunkLinksInFilesWebpackPlugin({
            // files containing links to chunks, which need to be updated
            replaceInFiles: [
                path.resolve(__dirname, '_site/master-pages/default.aspx')
            ],
            // regexp patterns to be used to find chunk names in the file
            chunkNamePatterns: [
                /vendor\.[a-z0-9]+\.bundle\.js/g,
                /app\.[a-z0-9]+\.bundle\.js/g
            ]
        })
    ]
};
```

### HTML
The following snippet shows the `default.aspx` file, which is indicated in the WebPack config

Each time any of the bundle files changes the plugin will update the *ASPX* file accordingly.

```html
<!DOCTYPE html>
<html lang="en">
<head>
</head>
<body>
    <p>Hello World</p>
    <script src="/script/vendor.0f8f98e02847fe61032d.bundle.js"></script>
    <script src="/script/app.f0c4c1d45df3e888a309.bundle.js" async></script>
</body>
</html>
```

# License
MIT