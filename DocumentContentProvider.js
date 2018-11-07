
"use strict"
const vscode = require('vscode')

/**
 * HTMLDocumentContentProvider 
 */
class HTMLDocumentContentProvider  {
    constructor() {
        this._onDidChange = new vscode.EventEmitter();
        this._textEditor = vscode.window.activeTextEditor;
    }

    provideTextDocumentContent(uri) {
        return `LOL`
    }


    update(uri) {
        this._onDidChange.fire(uri);
    }


    get onDidChange() {
        return this._onDidChange.event;
    }
}

module.exports = HTMLDocumentContentProvider