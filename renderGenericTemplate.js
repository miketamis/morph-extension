
function renderGenericTemplate(code, propsPromise) {
    return Promise.resolve(propsPromise).then((props) => {
        let output = code;
        Object.entries(props).forEach(([key, value]) => {
            output =  output.replace(new RegExp("\\$\\{"
            + key.replace('$', '\\$').replace('(','\\(').replace(')', '\\)')
            + "\\}", "g"), value)
        }) 
        return output;
    })
}

module.exports = renderGenericTemplate