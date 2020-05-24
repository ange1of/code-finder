import * as vscode from "vscode";
import { AutoCompleteProvider } from "./autocomple";
import { Search } from "./search";
//import { getSuggestions } from './github-search';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(AutoCompleteProvider, Search);
  console.log("code-finder loaded 🚀");
  //getSuggestions("import", "python").then(result => console.log(result));
}

export function deactivate() {}
