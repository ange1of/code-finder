import * as vscode from "vscode";

export const AutoCompleteProvider = vscode.languages.registerCompletionItemProvider(
  "plaintext",
  {
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
  }
);
