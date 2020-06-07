import vscode from "vscode";
import { GithubSearch } from "./github-search";

export const createCompletionsProvider = (context: vscode.ExtensionContext, search: GithubSearch) => {
  const completionsFromFile = search.getAutocompletionSuggestions("", "Python");
  console.log("Loaded completions: " + completionsFromFile.length);
  return vscode.languages.registerCompletionItemProvider("plaintext", {
    provideCompletionItems(
      document: vscode.TextDocument,
      position: vscode.Position,
      token: vscode.CancellationToken,
      context: vscode.CompletionContext
    ) {
      return completionsFromFile.map(
        x => new vscode.CompletionItem(x.construction)
      );
    },
  });
};
