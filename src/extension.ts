import * as vscode from "vscode";
import { AutoCompleteProvider } from "./autocomple";
import { Search } from "./search";
import { GithubSearch } from './github-search';

export function activate(context: vscode.ExtensionContext) {
  const githubSearch = new GithubSearch(context.extensionPath); 
  context.subscriptions.push(AutoCompleteProvider, Search);
  console.log("code-finder loaded 🚀");
  githubSearch.getSuggestions("import", "python").then(result => console.log(result));
}

export function deactivate() {}
