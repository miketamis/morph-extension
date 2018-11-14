const promiseObject = require('promise-all-object');

const buildDoc = require('./buildDoc.js')

const path = require('path');
const renderGenericTemplate = require('./renderGenericTemplate')

const vscode = require('vscode');

const xmlExtension = require('./extensions/xml')(getRequiredValues)
const htlExtension = require('./extensions/htl')(getRequiredValues)


function getLocationFromPath(path) {
    return path.substring(0, path.lastIndexOf('/')+1);
}


const renderCSSTemplate = renderGenericTemplate
const renderHTMLTemplate  = renderGenericTemplate


function buildHTMLBlock(doc, docUnderstanding) {
        const values  = getRequiredValues(docUnderstanding, doc)
    
        return renderHTMLTemplate(doc.code, values);
}

function buildMustacheBlock(doc, docUnderstanding) {
    const values  = getRequiredValues(docUnderstanding, doc)
    const mustache = require('mustache');
    return Promise.resolve(values).then((vals) => {
        return mustache.render(doc.code, vals);
    })
}

function buildHTML(docUnderstanding) {
    let output = [];
    docUnderstanding.blocks.forEach((doc) => {
        if(doc.type === 'html' && doc.name === 'unknown') {
           output.push(buildHTMLBlock(doc, docUnderstanding));
        }
        if(doc.type === 'mustache' && doc.name === 'unknown') {
            output.push(buildMustacheBlock(doc, docUnderstanding));
         }
    });
    return output;
}

function buildCSS(docUnderstanding) {
    let output = [];
    docUnderstanding.blocks.forEach((doc, i) => {
        if(doc.type === 'css'  && doc.name === 'unknown') {
            const values  = getRequiredValues(docUnderstanding, doc);
            output.push(renderCSSTemplate(doc.code, values))
        }
    });
    return output;
}

function buildLive(doc, docUnderstanding) {
    if(doc.type === 'xml') {
        return xmlExtension.buildLive(doc, docUnderstanding);
    }
    return Promise.resolve('Sorry dont know how todo this live')
}

function getNamedBlock(startIndex, name, docUnderstanding) {
    for(let i = startIndex - 1; i >= 0; i--) {
        if(docUnderstanding.blocks[i].name === name) {
            return docUnderstanding.blocks[i];
        }
    }
}

function queryBlockForValue(block, key, docUnderstanding, req) {
    const doc = block
    if(doc.type === 'input') {
        if(!doc.queryForValue) {
            return 'Huh trying to use an input when not called'
        }
        if(doc.name === key) {
            req.requirement = doc.argumentBlockName;
            doc.queryForValue(req)
        }
        return doc.queryForValue(req);
    }
    if(doc.type === 'xml') {
        return xmlExtension.queryBlockForValue(doc, key, docUnderstanding);
    } 
    if(doc.type === 'htl') {
        return htlExtension.queryBlockForValue(doc, key, docUnderstanding);
    } 
    if(doc.type === 'html') {
        return Promise.resolve(buildHTMLBlock(doc, docUnderstanding))
    }
    if(doc.type === 'mustache') {
        return Promise.resolve(buildMustacheBlock(doc, docUnderstanding))
    }
    if(doc.type === 'js') {
        const requiredValuesProm = Promise.resolve(getRequiredValues(docUnderstanding, doc))
        return requiredValuesProm.then(reqVals => {
            let inject = ''
            Object.entries(reqVals).forEach(([key, value]) =>  {
                try {
                    const str = JSON.stringify(value);
                    inject += `const ${key} = JSON.parse('${str.replace(/\\/g, '\\\\')}');`
                } catch(error) {
                    inject += `ERROR`
                }
            });
            return Promise.resolve(eval(`${inject}\n ${doc.code }\n${key}`))
        })
    }

    if(doc.type === 'import') {
        return new Promise((resolve) => {
            vscode.workspace.openTextDocument(path.join(docUnderstanding.location, doc.file)).then((document) => {

                const docUnderstandingForNewFile = buildDoc(document.getText())
                docUnderstandingForNewFile.location = getLocationFromPath(document.uri.path)

                const indexBlock = docUnderstandingForNewFile.blocks.find(({ name }) => name === 'index')
                const importBlock = docUnderstandingForNewFile.blocks.find(({ type }) => type === 'input')

                if(importBlock) {
                    if(!req.requirementObj.argument) {
                        return resolve('This import requires an input')
                    }
                    importBlock.argumentBlockName  = req.requirementObj.argument
                    importBlock.queryForValue = (areq) => {
                        const argumentBlock = getNamedBlock(req.index, req.requirementObj.argument, docUnderstanding)
                        return queryBlockForValue(argumentBlock, areq.requirement, docUnderstanding, areq)
                    }
                }

                if(indexBlock) {
                    resolve(queryBlockForValue(indexBlock, key, docUnderstandingForNewFile));
                } else {
                    resolve('File Importing has no index?')
                }                
            });
        })
    }

        return renderGenericTemplate(doc.code, getRequiredValues(docUnderstanding, doc)).then((a) => {
            if(key === doc.name) {
                return JSON.parse(a);
            }
            return JSON.parse(a)[key]
        })
    
}



const diff = function(b, a) {
    const _a = a.map(({ requirement }) => requirement)
    return b.filter(function(i) {return _a.indexOf(i.requirement) < 0;});
};

function getRequirements(docUnderstanding, doc, index) {
    let required = doc.requiredVaribles.reduce((acum, curr) => {
        return [...acum, ...curr.requiredVars.map(req => {
            return {
                requirement: req,
                requirementObj: curr,
                index: index,
            }
        })]
    }, []);
    const requiredBlocks = [];
    for(let i = index - 1; i >= 0; i--) {
        if(docUnderstanding.blocks[i].params === 'live' && !docUnderstanding.root) {
            continue;
        }
        const prevReq = required;
        required = diff(required, docUnderstanding.blocks[i].modifingVaribles.map(requirement => ({ requirement })))
        const requiredByThisFile = diff(prevReq, required)
        if(requiredByThisFile.length) {
            requiredBlocks.push({
                why: {
                    required,
                    requiredByThisFile,
                },
                block: docUnderstanding.blocks[i],
            })
        }
    }
    return requiredBlocks;
}



function getRequiredValues(docUnderstanding, doc) {
    const requiredBlocks = getRequirements(docUnderstanding, doc, doc.index)
    const values  = {}
    requiredBlocks.forEach((r) => {
        r.why.requiredByThisFile.forEach(req => {
            values[req.requirementObj.token] = queryBlockForValue(r.block, req.requirement, docUnderstanding, req)
        })
    })
    return promiseObject(values);
}


module.exports = {
    getLocationFromPath,
    buildCSS,
    buildHTML,
    buildLive,
}