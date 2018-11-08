

const mustache = require('mustache');
const esprima = require('esprima');

const xmlExtension = require('./extensions/xml')()

const openTagRegex = /<([^\>\/\s\.]+)\.?([^\>\/\s]*)\s*([^\>\/\s]*)[^>]*>/
const closeTagRegex = /<\/([^\>\/\s\.]+)\.?([^\>\/\s]*)[^>]*>/
const importTagRegex = /import {\s*([^}]+)+} from '([^']+)'/

const defaultEx = {
    getRequiredVaribles() {
        return []
    },
    getModifingVaribles() {
        return []
    }
}




const htmlExtension = {
    getRequiredVaribles(group) {
        return (group.code.match(/\${([^\}]+)}/g) || []).map((a) => a.slice(2, a.length-1))
    },
    getModifingVaribles(group) {
        return group.name !== 'unknown' ? [group.name] : []
    }
}

const cssExtension = {
    getRequiredVaribles(group) {
        return (group.code.match(/\${([^\}]+)}/g) || []).map((a) => a.slice(2, a.length-1))
    },
    getModifingVaribles() {
        return []
    }
}

function renderGenericTemplate(code, props) {
    let output = code;
    Object.entries(props).forEach(([key, value]) => {
        output =  output.replace(new RegExp("\\$\\{" + key.replace('$', '\\$') + "\\}", "g"), value)
    }) 
    return output;
}

const jsonExtension = {
    getRequiredVaribles(group) {
        return (group.code.match(/\${([^\}]+)}/g) || []).map((a) => a.slice(2, a.length-1))
    },
    getModifingVaribles(group) {
        let output = []
        const required = jsonExtension.getRequiredVaribles(group)
        const fake = {

        }

        required.forEach((a) => {
            fake[a] = '0'
        })


        try {
            output = Object.keys(JSON.parse(renderGenericTemplate(group.code, fake)))
        } catch(err) {
            group.errors.push(err);
        }

        if(group.name !== 'unknown') {
            output.push(group.name);
        }

        return output;
    }
}

const inputExtension = {
    getRequiredVaribles() {
        return []
    },
    getModifingVaribles: jsonExtension.getModifingVaribles,
}


const mustacheExtension = {
    getModifingVaribles(group) {
        return group.name !== 'unknown' ? [group.name] : []
        
    },
    getRequiredVaribles(group) {
        group.much = mustache.parse(group.code)
        return group.much.filter((a) => a[0] === '#' ||  a[0] === 'name').map((a) => a[1]);
    }
}

const jsExtension = {
    getModifingVaribles(group) {
        group.esprima = esprima.parse(group.code);
        const output = []
        try {
            group.esprima.body.forEach((node) => {
                if(node.type === 'VariableDeclaration') {
                    output.push(node.declarations[0].id.name);
                }
            })
        } catch(err) {

        }
        return output
    },
    getRequiredVaribles(group) {
        group.esprima = esprima.parse(group.code);
        const output = []
    //     try {
            function handleArgs(args) {
                args.forEach(b => {
                    if(b.type === 'Identifier') {
                        output.push(b.name);
                    }
                })
            }
            group.esprima.body.forEach((node) => {
                if(node.type === 'VariableDeclaration') {
                    node.declarations.forEach((a) => {
                        if(a.init.type === 'CallExpression') {
                            handleArgs(a.init.arguments)
                            
                            handleArgs(a.init.callee.object.arguments)
                            
                        }
                    })
                }
                if(node.type === 'ExpressionStatement') {
                    if(node.expression.right.type === 'Identifier') {
                        output.push(node.expression.right.name);
                    }
                }
            })
        // } catch(err) {

        // }
        return output
    }
}


const lookup =  {
    css: cssExtension,
    html: htmlExtension,
    json: jsonExtension,
    mustache: mustacheExtension,
    js: jsExtension,
    xml: xmlExtension,
    input: inputExtension,
}

function getExtension (type) {
    return lookup[type] || defaultEx
}


const functionRegex = /([^\(]+)\(([^)]+)\)/

function addToQueue(group) {
    if(!getExtension(group.type)) {
        group.notTransformed = true;
        return;
    }
    const requiredVaribles = getExtension(group.type).getRequiredVaribles(group)
    const modifingVaribles = getExtension(group.type).getModifingVaribles(group)
    group.requiredVaribles = requiredVaribles.map((reqVar) => {
        const functionReqRes = functionRegex.exec(reqVar);

        if(functionReqRes) {
            return {
                token: reqVar,
                requiredVars: [functionReqRes[1]],
                function: functionReqRes[1],
                argument: functionReqRes[2],
            }
        }

        return {
            token: reqVar,
            requiredVars: [reqVar]
        }
    });
    group.modifingVaribles = modifingVaribles;
}


function getNameAndType(regexRes) {
    let type = regexRes[1]
    let name = 'unknown'
    if(regexRes[2]) {
        type = regexRes[2]
        name = regexRes[1]
    }
    return  { type, name }
}

const errors = []
module.exports = (input) => {
    const output = []
    let openGroup;
    input.split('\n').forEach((line) => {
        const openRegexResult = openTagRegex.exec(line)
        if(!openGroup && openRegexResult) {
            openGroup = {
                ...getNameAndType(openRegexResult),
                code: '',
                errors: [],
                index: output.length,
                params: openRegexResult[3],
            }
            output.push(openGroup)
            return;
        }
        const closeRegexResult = closeTagRegex.exec(line)
        if(closeRegexResult && !openGroup) {
            errors.push('Random closee?')
            return;
        }
        
        if(closeRegexResult) {
            const nameType = getNameAndType(closeRegexResult);
            if(nameType.type === openGroup.type && nameType.name === openGroup.name) {  
                addToQueue(openGroup);
                openGroup = null;
                return;
            }
        }
        if(openGroup) {
            openGroup.code += line + '\n';
            return;
        } 

        const importRegexResult = importTagRegex.exec(line);
        if(importRegexResult) {
            const importing = importRegexResult[1].split(',').map(a => a.trim());
            const from = importRegexResult[2]
            output.push({
                type: 'import',
                code: '',
                file: from,
                errors: [],
                index: output.length,
                modifingVaribles: importing,
            })
        }
        
    })


    return {
        blocks: output
    };
}