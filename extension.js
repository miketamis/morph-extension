const vscode = require('vscode');

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




function activate(context) {


    context.subscriptions.push(vscode.commands.registerCommand('morphPreview.start', () => {
        const panel = vscode.window.createWebviewPanel(
            'morphPreview', 
            "Morph Preview", 
            vscode.ViewColumn.Two,
            { } // Webview options. More on these later.
        );


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
            const liveBlock = docUnderstanding.blocks.find(({ name }) => name === 'live')
            if(liveBlock) {
                buildLive(liveBlock, docUnderstanding).then((output) => {
                    panel.webview.html = output;
                })
            } else {
                const output = [   
                    '<div>',
                    ...getPage(docUnderstanding),
                    '</div>',
                    `
                    <style>

        .hidden-toggle:not(:checked) + .to-be-hidden {
            display: none;
        }
                    </style>
                    <input class="hidden-toggle" type="checkbox">
                    Show Morph Debug
                    </input>
                    <div class="to-be-hidden">`,
                    '<xmp>',
                    JSON.stringify(docUnderstanding, null, 2),
                    ...buildCSS(docUnderstanding),
                '</xmp>',
                '</div>'
                ]

                Promise.all(output).then((outputReady) => {
                    panel.webview.html = outputReady.join('');
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
function deactivate() {
}
exports.deactivate = deactivate;