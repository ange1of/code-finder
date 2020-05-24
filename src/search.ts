import * as vscode from "vscode";

export const Search = vscode.commands.registerCommand(
  "code-finder.search",
  () => {
    vscode.window
      .showInputBox({ prompt: "Enter query" })
      .then((query) =>
        query ? vscode.window.showInformationMessage(query) : null
      );
  }
);
