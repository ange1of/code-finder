import * as vscode from 'vscode';

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
    	];

    	const completions: vscode.CompletionItem[] = [];

    	// NE RABOTAYET
    	imports.forEach(([name, alias]) => {
        	const comp = new vscode.CompletionItem(`import`);
        	comp.insertText = `import ${name} as ${alias}`;
        	completions.push(comp);
    	});

		const commandCompletion = new vscode.CompletionItem("new");
		commandCompletion.kind = vscode.CompletionItemKind.Keyword;
		commandCompletion.insertText = "new ";
		commandCompletion.command = {
			command: "editor.action.triggerSuggest",
			title: "Re-trigger completions...",
		};

		return [commandCompletion, ...completions];
    },
	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('code-finder.codefinder', () => {
		context.subscriptions.push(provider);
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}