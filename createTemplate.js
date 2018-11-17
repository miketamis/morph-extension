const output = []

const languages = ['css', 'js', 'json', 'html', 'mustache', 'xml', 'htl']

languages.forEach(element => {
    output.push({
        "begin": "<([^\\>\\/\\s\\.]+\\.)?" + element + "(?:\\s+([^\\>\\/\\s]*))?\\s*>",
        "end": "<\\/([^\\>\\/\\s\\.]+\\.)?" + element + "(?:\\s+([^\\>\\/\\s]*))?\\s*>",
        "contentName": "meta.embedded.block." + element,
        "patterns": [
            { "include": "source." + element }
        ]
    },
    )
});


console.log(JSON.stringify(output))