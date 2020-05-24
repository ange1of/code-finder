import vscode from "vscode";
import { createCompletionsProvider } from "./autocomplete";
import { Search } from "./search";
//import { getSuggestions } from './github-search';

export function activate(context: vscode.ExtensionContext) {
  const autoCompleteProvider = createCompletionsProvider(context);
  context.subscriptions.push(autoCompleteProvider, Search);
  console.log("code-finder loaded 🚀");
  //getSuggestions("import", "python").then(result => console.log(result));
}

export function deactivate() {}
