const Compiler = require("@adobe/htlengine/src/compiler/Compiler");
 

module.exports = function(getRequiredValues) {
    function getRequiredVaribles(group) {
            return ["properties"]
    }

    function getModifingVaribles(group) {
            return group.name !== 'unknown' ? [group.name, group.name + '_raw'] : []
    }

    function build(block, docUnderstanding) {
        return new Promise((resolve) => {
            const valuesPromise  = getRequiredValues(docUnderstanding, block)
        
            const compiler = new Compiler()
            .withOutputDirectory('.')
            .includeRuntime(true)
            .withRuntimeVar(["properties"])
            .withSourceMap(true);
            Promise.all([valuesPromise,  
            compiler.compileToString(block.code)]).then(([values, output]) => {
            const toEval = output.replace('module.exports.main =', 'const htlComponentTemplateFunction =') + 'htlComponentTemplateFunction(' + JSON.stringify(values) + ')'
    
            eval(toEval).then((res) => resolve(res.body))
            });
        })
    }

    function queryBlockForValue(block, key, docUnderstanding) {
        if(key.includes('_raw')) {
            return Promise.resolve(block.code)
        }
        return Promise.resolve(build(block, docUnderstanding))
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

