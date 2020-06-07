import vscode from "vscode";
import { GithubSearch } from "./github-search";

export const createCompletionsProvider = (context: vscode.ExtensionContext, search: GithubSearch) => {
  const editor = vscode.window.activeTextEditor;
  const language = editor?.document.languageId || "python";
  const completionsFromFile = search.getAutocompletionSuggestions(language);
  console.log("Loaded completions: " + completionsFromFile.length);
  return vscode.languages.registerCompletionItemProvider(language, {
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
