const vscode = require('vscode');

const path = require('path');

const mainCompiler = require('./mainCompiler')
const buildDoc = require('./buildDoc.js')
const window = vscode.window;

const Disposable = vscode.Disposable;

const getLocationFromPath = mainCompiler.getLocationFromPath;
const buildCSS = mainCompiler.buildCSS;
const buildHTML = mainCompiler.buildHTML;
const buildLive = mainCompiler.buildLive;

function getPage(docUnderstanding) {
    return [
        Promise.resolve('<style>'),
        ...buildCSS(docUnderstanding),
        Promise.resolve('</style>'),
        ...buildHTML(docUnderstanding)
    ]
}

function escapeHTML(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }


function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}


function activate(context) {


    context.subscriptions.push(vscode.commands.registerCommand('morphPreview.start', () => {
        const panel = vscode.window.createWebviewPanel(
            'morphPreview',
            "Morph Preview",
            vscode.ViewColumn.Two, {
                enableScripts: true
            } // Webview options. More on these later.
        );



        const getURI = (thePath) => {
            // Local path to main script run in the webview
            const scriptPathOnDisk = vscode.Uri.file(path.join(context.extensionPath, 'extension-pane/build/', thePath));

            // And the uri we use to load this script in the webview
            return scriptPathOnDisk.with({
                scheme: 'vscode-resource'
            });

        }


        // TODO: #9 Make this load from react build
        panel.webview.html = `
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no"><meta name="theme-color" content="#000000"><title>React App</title><link nonce="sDlPzKOY2N3eLeihWwcZzne9MN8Gf7o3" src="vscode-resource:/Users/miketamis/Development/Projects/morph/morph-extension/morph-extension/extension-pane/build/static/css/main.80e4e1f2.chunk.css" rel="stylesheet"><style>body{background-color:#1e1e1e;color:#d4d4d4;display:block;font-family:-apple-system,system-ui,"Segoe WPC","Segoe UI",HelveticaNeue-Light,Ubuntu,"Droid Sans",sans-serif;font-size:13px}</style><link href="/static/css/main.60d935ff.chunk.css" rel="stylesheet"></head><body><noscript>You need to enable JavaScript to run this app.</noscript><div id="root"></div><script>!function(l){function e(e){for(var r,t,n=e[0],o=e[1],u=e[2],f=0,i=[];f<n.length;f++)t=n[f],p[t]&&i.push(p[t][0]),p[t]=0;for(r in o)Object.prototype.hasOwnProperty.call(o,r)&&(l[r]=o[r]);for(s&&s(e);i.length;)i.shift()();return c.push.apply(c,u||[]),a()}function a(){for(var e,r=0;r<c.length;r++){for(var t=c[r],n=!0,o=1;o<t.length;o++){var u=t[o];0!==p[u]&&(n=!1)}n&&(c.splice(r--,1),e=f(f.s=t[0]))}return e}var t={},p={2:0},c=[];function f(e){if(t[e])return t[e].exports;var r=t[e]={i:e,l:!1,exports:{}};return l[e].call(r.exports,r,r.exports,f),r.l=!0,r.exports}f.m=l,f.c=t,f.d=function(e,r,t){f.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:t})},f.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},f.t=function(r,e){if(1&e&&(r=f(r)),8&e)return r;if(4&e&&"object"==typeof r&&r&&r.__esModule)return r;var t=Object.create(null);if(f.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:r}),2&e&&"string"!=typeof r)for(var n in r)f.d(t,n,function(e){return r[e]}.bind(null,n));return t},f.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return f.d(r,"a",r),r},f.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},f.p="/";var r=window.webpackJsonp=window.webpackJsonp||[],n=r.push.bind(r);r.push=e,r=r.slice();for(var o=0;o<r.length;o++)e(r[o]);var s=n;a()}([])</script><script src="/static/js/1.456aa1bc.chunk.js"></script><script src="/static/js/main.4ecfe616.chunk.js"></script></body>            `.replace(/src="([^"]+)"/g, (_, a) => `nonce="${getNonce()}" src="${getURI(a)}"`)
        


        const handleUpdate = () => {
            let editor = window.activeTextEditor;
            if (!editor) {
                return;
            }

            let doc = editor.document;


            let docContent = doc.getText();

            const docUnderstanding = buildDoc(docContent)
            docUnderstanding.root = true;
            docUnderstanding.location = getLocationFromPath(doc.uri.path)
            const liveBlock = docUnderstanding.blocks.find(({
                name
            }) => name === 'live')


          
            if (liveBlock) {
                buildLive(liveBlock, docUnderstanding).then((output) => {
                    panel.webview.html = [
                        output,
                    ].join('');
                })
            } else {
                const output = [
                    '<div>',
                    ...getPage(docUnderstanding),
                    '</div>',
                ]

                Promise.all(output).then((outputReady) => {                
                    
                    var renderHTML = outputReady.join('')
                    // TODO: #11 generate this from the previous git version
                    // var renderHTMLOld = "<div><style></style>        <style>\n           \n\n    .color-block {\n        width: 48px;\n        height: 48px;\n        margin-right: 8px;\n    }\n\n    .color-line {\n        color: var(--test);\n        display: flex;\n        margin: 8px;\n        align-items: center;\n        font-size: 24px;\n    }\n\n    </style>\n    <div>\n        <div class=\"color-line\"> \n            <div class=\"color-block\" style=\"background-color: #bbb\"> </div>\n            <div>grey - #bbb</div>\n        </div>\n    </div>\n\n</div>"

                    const renderHTMLOld = ''

                    panel.webview.postMessage({
                        renderHTML,
                        docUnderstanding,
                        renderHTMLOld,
                    });


                    //outputReady.join('');
                })
            }
        }


        handleUpdate();
        let subscriptions = [];
        window.onDidChangeTextEditorSelection(handleUpdate, this, subscriptions);
        window.onDidChangeActiveTextEditor(handleUpdate, this, subscriptions);

        // create a combined disposable from both event subscriptions
        this._disposable = Disposable.from(...subscriptions);

    }));



}


exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;