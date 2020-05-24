import * as vscode from "vscode";
import { AutoCompleteProvider } from "./autocomple";
import { Search } from "./search";

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(AutoCompleteProvider, Search);
	console.log("code-finder loaded 🚀");
}

export function deactivate() {}
