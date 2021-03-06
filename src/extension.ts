import vscode from "vscode";
import { createCompletionsProvider } from "./autocomplete";
import { Search } from "./search";
import { GithubSearch } from "./github-search";

export function activate(context: vscode.ExtensionContext) {
  const githubSearch = new GithubSearch(context.extensionPath);
  const autoCompleteProvider = createCompletionsProvider(context, githubSearch);
  context.subscriptions.push(autoCompleteProvider, Search(context));
  console.log("code-finder loaded 🚀");
}

export function deactivate() {}
