import vscode from "vscode";
import { GithubSearch } from "./github-search";

export const createCompletionsProvider = (context: vscode.ExtensionContext, search: GithubSearch) => {
  const language = vscode.window.activeTextEditor?.document.languageId || "python" ;
  const completionsFromFile = search.getAutocompletionSuggestions("", language);
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
