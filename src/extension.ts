import vscode from "vscode";
import { createCompletionsProvider } from "./autocomplete";
import { Search } from "./search";
import { GithubSearch } from "./github-search";

export function activate(context: vscode.ExtensionContext) {
  const githubSearch = new GithubSearch(context.extensionPath);
  const autoCompleteProvider = createCompletionsProvider(context);
  context.subscriptions.push(autoCompleteProvider, Search);
  console.log("code-finder loaded 🚀");
}

export function deactivate() {}
