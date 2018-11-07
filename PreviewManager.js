'use strict'
const vscode = require('vscode')
const HTMLDocumentContentProvider = require('./DocumentContentProvider')
// const StatusBarItem = require('./StatusBarItem')
// const Constants = require('./Constants') "morphExtension://preview"


// This class initializes the previewmanager based on extension type and manages all the subscriptions
class PreviewManager {

    constructor(htmlDocumentContentProvider) {
        this.htmlDocumentContentProvider = htmlDocumentContentProvider && htmlDocumentContentProvider || new HTMLDocumentContentProvider();
        this.htmlDocumentContentProvider.generateHTML();
        // subscribe to selection change event
        let subscriptions = [];
        vscode.window.onDidChangeTextEditorSelection(this.onEvent, this, subscriptions)
        this.disposable = vscode.Disposable.from(...subscriptions);
    }

    dispose() {
        this.disposable.dispose();
    }

    onEvent() {
        this.htmlDocumentContentProvider.update(vscode.Uri.parse("morphExtension://preview"));
        // this.updatePreviewStatus();
        // console.log(Constants.SessionVariables.IS_PREVIEW_BEING_SHOWN);
    }

    // updatePreviewStatus() {
    //     let visibleEditors = vscode.window.visibleTextEditors;
    //     console.log(visibleEditors)
    //     for (let editor of visibleEditors) {
    //         console.log(editor.document.uri);
    //         console.log(vscode.Uri.parse(Constants.ExtensionConstants.PREVIEW_URI));
    //         if (editor.document.uri === vscode.Uri.parse(Constants.ExtensionConstants.PREVIEW_URI)) {
    //             Constants.SessionVariables.IS_PREVIEW_BEING_SHOWN = true;
    //             return;
    //         }
    //     }
    //     Constants.SessionVariables.IS_PREVIEW_BEING_SHOWN = false;
    // }



}

module.exports = PreviewManager;