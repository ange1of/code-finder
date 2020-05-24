import fs from "fs";
import path from "path";
import vscode from "vscode";

const loadCompletions = (extensionPath: string) => {
  // Probably super ineffective code
  const completionsRaw = fs.readFileSync(
    path.resolve(extensionPath, "resources", "completions.json"),
    { encoding: "utf-8" }
  );
  return JSON.parse(completionsRaw.toString());
};

export const createCompletionsProvider = (context: vscode.ExtensionContext) => {
  const completionsFromFile = loadCompletions(context.extensionPath);
  console.log("Loaded completions: " + completionsFromFile);
  return vscode.languages.registerCompletionItemProvider("plaintext", {
    provideCompletionItems(
      document: vscode.TextDocument,
      position: vscode.Position,
      token: vscode.CancellationToken,
      context: vscode.CompletionContext
    ) {
      return completionsFromFile.map(
        (x: string) => new vscode.CompletionItem(x)
      );
    },
  });
};
