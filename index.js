const fs = require('fs');

function UpdateChunkLinksInFilesWebpackPlugin(options) {
    this.options = options;
}

UpdateChunkLinksInFilesWebpackPlugin.prototype.apply = function(compiler) {

    compiler.hooks.emit.tapAsync("UpdateChunkLinksInFilesWebpackPlugin", (compilation, callback) => {

        const {replaceInFiles, chunkNamePatterns, chunkNameAntiPatterns, enabled, disabled} = this.options;

        if(enabled===false || disabled===true) {
            callback(); // passing the control back to WebPack
            return; // do nothing
        }

        // Find chunks which match the pattern
        // IF the `chunkFilename` is matched with any pattern
        // the it will be mapped new object `{pattern, chunkFilename}` (created by `reduce`)
        // ELSE IF no match is found it will be mapped to `false` (returned by `reduce`)
        let matchingChunks = Object.keys(compilation.assets)
            .map(chunkFilename =>
                // `reduce` tries to match the given chunk with one of the patterns
                // > IF match is found it will return `chunkInfo` - `chunkFilename` passed the test
                // > ELSE othervise it will return `null` - `chunkInfo` didn't pass the test
                chunkNamePatterns.reduce((prevResult, pattern) => !prevResult && pattern.test(chunkFilename) ? {chunkFilename, pattern} : prevResult, false));
        
        if(chunkNameAntiPatterns) {
            matchingChunks = matchingChunks.map(chunkInfo =>
                // `reduce` tries to match the given chunk with any of the anti-patterns
                // > IF match is found it will return `null` - `chunkInfo` didn't pass the test
                // > ELSE othervise it will return unchanged `chunkInfo` - `chunkInfo` passed the test
                chunkNameAntiPatterns.reduce((prevResult, antiPattern) => prevResult && !antiPattern.test(chunkInfo.chunkFilename) ? chunkInfo : false, chunkInfo));
        }

        // keep only `chunkInfo`s which were survived the `reduce` calls
        matchingChunks.filter(chunkInfo => !!chunkInfo)

        if(matchingChunks.length > 0) {

            // tracking how many files have been processed
            let filesLeftToRead = replaceInFiles.length,
                filesLeftToWrite = filesLeftToRead;

            replaceInFiles.forEach(oneFile => {

                fs.readFile(oneFile, 'utf8', function (err, data) {
                    filesLeftToRead--;

                    // check if the read was successful
                    if (err) {

                        filesLeftToWrite--; // the current file will never be written to

                        console.log(`UpdateChunkLinksInFilesWebpackPlugin: error reading from file ${oneFile} not found`, err);

                        if(filesLeftToRead===0 && filesLeftToWrite===0) {
                            // IF all the files have been processed
                            // > passing the control back to WebPack
                            callback();
                        }

                        return; // stop processing the current file
                    }

                    // do a search-replace for every matching chunk
                    matchingChunks.forEach(({pattern, chunkFilename}) => {
                        data = data.replace(pattern, chunkFilename);
                    });

                    fs.writeFile(oneFile, data, 'utf8', err => {

                        --filesLeftToWrite;

                        if (err) {
                            console.log(`UpdateChunkLinksInFilesWebpackPlugin: error writing to file ${oneFile}`, err);
                        }

                        if(filesLeftToRead===0 && filesLeftToWrite===0) {
                            callback(); // passing the control back to WebPack
                        }
                    });
                });
            });
        } else {
            console.log(`UpdateChunkLinksInFilesWebpackPlugin: no matching chunks found`);
            // ELSE - no chunk which matched the given rules
            // > passing the control back to WebPack
            callback();
        }
    });
};
    
module.exports = UpdateChunkLinksInFilesWebpackPlugin;