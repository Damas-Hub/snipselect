import * as vscode from 'vscode';

let copiedSnippets: string[] = []; // Store multiple copied snippets

export function activate(context: vscode.ExtensionContext) {
  console.log('SnipSelect extension is now active!');

  // Register openPanel command
  const openPanelCommand = vscode.commands.registerCommand(
    'snipselect.openPanel',
    () => {
      vscode.window.showInformationMessage('SnipSelect Panel is now open!');
      openPanelUI();
    }
  );

  // Register copySnippet command
  const copySnippetCommand = vscode.commands.registerCommand(
    'snipselect.copySnippet',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage('No active editor to copy from.');
        return;
      }

      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);

      if (!selectedText) {
        vscode.window.showInformationMessage('No text selected to copy.');
        return;
      }

      copiedSnippets.push(selectedText);
      vscode.window.showInformationMessage(`Copied snippet: "${selectedText}"`);

      // Update the snippets list in the webview
      const panel = vscode.window.activeTextEditor?.document.uri.toString();
      if (panel) {
        const webviewPanel = vscode.window.createWebviewPanel(
          'snipselectPanel',
          'SnipSelect Panel',
          vscode.ViewColumn.One,
          { enableScripts: true,
            retainContextWhenHidden: true,
          }
        );
        webviewPanel.webview.postMessage({
          command: 'updateSnippets',
          snippets: copiedSnippets,
        });
      }
    }
  );

  // Register pasteSnippet command
  const pasteSnippetCommand = vscode.commands.registerCommand(
    'snipselect.pasteSnippet',
    async (snippet: string) => {
      if (copiedSnippets.length === 0) {
        vscode.window.showInformationMessage('No snippets available to paste.');
        return;
      }

      // Let user pick a snippet
      const selected = snippet || await vscode.window.showQuickPick(copiedSnippets, {
        placeHolder: 'Select a snippet to paste',
      });

      if (!selected) {
        return; // User cancelled
      }

      const editor = vscode.window.activeTextEditor;
      if (editor) {
        editor.edit((editBuilder: vscode.TextEditorEdit) => {
          const currentPosition = editor.selection.active;
          editBuilder.insert(currentPosition, selected);
        });
      }
    }
  );

  context.subscriptions.push(openPanelCommand, copySnippetCommand, pasteSnippetCommand);
}

// Webview Panel (optional)
function openPanelUI() {
  const panel = vscode.window.createWebviewPanel(
    'snipselectPanel',
    'SnipSelect Panel',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );

  panel.webview.html = getWebviewContent();
}

// HTML for the Webview (optional)
function getWebviewContent() {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SnipSelect Panel</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; }
          button { background-color: #4CAF50; color: white; padding: 10px 20px; border: none; cursor: pointer; margin: 10px 0; width: 100%; }
          button:hover { background-color: #45a049; }
        </style>
      </head>
      <body>
        <h1>SnipSelect Panel</h1>
        <button onclick="copySnippet()">Copy Snippet</button>
        <button onclick="pasteSnippet()">Paste Snippet</button>
        <script>
          const vscode = acquireVsCodeApi();
          function copySnippet() { vscode.postMessage({ command: 'copySnippet' }); }
          function pasteSnippet() { vscode.postMessage({ command: 'pasteSnippet' }); }
        </script>
      </body>
      </html>
    `;
  }
  
  

export function deactivate() {}
