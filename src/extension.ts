import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('SnipSelect extension is now active!');

    // Register the command
    let disposable = vscode.commands.registerCommand('snipselect.openPanel', () => {
        vscode.window.showInformationMessage('SnipSelect Panel is now open!');
        // This is where you'd implement the actual UI for SnipSelect
        openPanelUI();
    });

    // Add the command to the context subscriptions
    context.subscriptions.push(disposable);
}

// Function to open the UI (for now, we'll just show an info message)
function openPanelUI() {
    vscode.window.showInformationMessage('This is the SnipSelect Panel');
}

export function deactivate() {}
