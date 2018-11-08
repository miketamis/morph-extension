var refractor = require('refractor')
var rehype = require('rehype')
const renderGenericTemplate = require('../renderGenericTemplate')

module.exports = function(getRequiredValues) {
    function getRequiredVaribles(group) {
            return (group.code.match(/\${([^\}]+)}/g) || []).map((a) => a.slice(2, a.length-1))
    }

    function getModifingVaribles(group) {
            return group.name !== 'unknown' ? [group.name] : []
    }

    function build(block, docUnderstanding) {
        const values  = getRequiredValues(docUnderstanding, block)
        return renderGenericTemplate(block.code, values);
    }

    function queryBlockForValue(block, key, docUnderstanding) {
        return Promise.resolve(build(block, docUnderstanding))
    }

    function buildLive(block, docUnderstanding) {
        return build(block, docUnderstanding).then((code) => {
            var nodes = refractor.highlight(code.replace(/&#x2F;/g, '/'), 'xml')

            var html = rehype()
            .stringify({type: 'root', children: nodes })
            .toString()
            return Promise.resolve(`
            <Style>
                ${css}
            </Style>
            <pre><code>
            ${html}
            </code></pre>
            `)
        })
    }
    return {
        getRequiredVaribles,
        getModifingVaribles,
        queryBlockForValue,
        buildLive,
    }
}



var css = `
/**
 * prism.js Dark theme for JavaScript, CSS and HTML
 * Based on the slides of the talk “/Reg(exp){2}lained/”
 * @author Lea Verou
 */

code[class*="language-"],
pre[class*="language-"] {
	color: white;
	background: none;
	text-shadow: 0 -.1em .2em black;
	font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
	text-align: left;
	white-space: pre;
	word-spacing: normal;
	word-break: normal;
	word-wrap: normal;
	line-height: 1.5;

	-moz-tab-size: 4;
	-o-tab-size: 4;
	tab-size: 4;

	-webkit-hyphens: none;
	-moz-hyphens: none;
	-ms-hyphens: none;
	hyphens: none;
}

@media print {
	code[class*="language-"],
	pre[class*="language-"] {
		text-shadow: none;
	}
}

pre[class*="language-"],
:not(pre) > code[class*="language-"] {
	background: hsl(30, 20%, 25%);
}

/* Code blocks */
pre[class*="language-"] {
	padding: 1em;
	margin: .5em 0;
	overflow: auto;
	border: .3em solid hsl(30, 20%, 40%);
	border-radius: .5em;
	box-shadow: 1px 1px .5em black inset;
}

/* Inline code */
:not(pre) > code[class*="language-"] {
	padding: .15em .2em .05em;
	border-radius: .3em;
	border: .13em solid hsl(30, 20%, 40%);
	box-shadow: 1px 1px .3em -.1em black inset;
	white-space: normal;
}

.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
	color: hsl(30, 20%, 50%);
}

.token.punctuation {
	opacity: .7;
}

.namespace {
	opacity: .7;
}

.token.property,
.token.tag,
.token.boolean,
.token.number,
.token.constant,
.token.symbol {
	color: hsl(350, 40%, 70%);
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
	color: hsl(75, 70%, 60%);
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string,
.token.variable {
	color: hsl(40, 90%, 60%);
}

.token.atrule,
.token.attr-value,
.token.keyword {
	color: hsl(350, 40%, 70%);
}

.token.regex,
.token.important {
	color: #e90;
}

.token.important,
.token.bold {
	font-weight: bold;
}
.token.italic {
	font-style: italic;
}

.token.entity {
	cursor: help;
}

.token.deleted {
	color: red;
}

`