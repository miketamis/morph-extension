const fs = require('fs') 
const vscode = require('vscode')
const path = require('path')
const spawn = require('cross-spawn-promise')
const classLoader = require('./java/classLoader');





module.exports = function(getRequiredValues) {
    function getRequiredVaribles(group) {
            return []
    }

    function getModifingVaribles(group) {
            return group.name !== 'unknown' ? [group.name] : []
    }

    function build(block, docUnderstanding) {
        return new Promise((resolve) => {
            resolve('')
        })
    }

    function queryBlockForValue(block, key, docUnderstanding) {
        return new Promise((resolve) => {
            const data = new Uint8Array(Buffer.from(block.code));
            var dir = path.join(vscode.workspace.rootPath, 'morphJavaTemp')
            var filePath = path.join(dir, block.name+ '.' + 'java');

            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }

            fs.writeFile(filePath, data, (err) => {
                if (err) throw err;
                spawn('javac', [filePath]).then(() => {
                    console.log('The file has been Built!');

                    const clazz = classLoader(dir, block.name);

                    resolve(clazz)
                }).catch((err) => {
                    console.log('WOWwewe errors');
                    console.log(err)
                })
                console.log('The file has been saved!');
            });
        })
    }

    function buildLive(block, docUnderstanding) {
        return build(block, docUnderstanding).then((code) => {
            return code;
        })
    }
    return {
        getRequiredVaribles,
        getModifingVaribles,
        queryBlockForValue,
        buildLive,
    }
}

