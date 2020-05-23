import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log("code-finder loaded");

  let provider = vscode.languages.registerCompletionItemProvider("plaintext", {
    provideCompletionItems(
      document: vscode.TextDocument,
      position: vscode.Position,
      token: vscode.CancellationToken,
      context: vscode.CompletionContext
    ) {
      const imports = [
        ["numpy", "np"],
        ["pandas", "pd"],
        ["matplotlip.pyplot", "plt"],
        ["requests", "r"],
      ];

      const completions: vscode.CompletionItem[] = [];

      imports.forEach(([name, alias]) => {
        const comp = new vscode.CompletionItem(`import ${name} as ${alias}`);
        completions.push(comp);
      });

      return completions;
    },
  });

  // Register autocomplete provider
  context.subscriptions.push(provider);

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("code-finder.search", () => {
    // context.subscriptions.push(provider);
    vscode.window
      .showInputBox({ prompt: "Enter query" })
      .then((query) =>
        query ? vscode.window.showInformationMessage(query) : null
      );
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
