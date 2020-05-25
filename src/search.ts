import * as vscode from 'vscode';
import { GithubSearch } from './github-search';
let showdown = require('showdown');

class ContentBlock {
	title: string;
	content: string;
	url: string;

	constructor(title: string, content: string, url:string) {
		this.title = title;
		this.content = content;
		this.url = url;
	}

	generateHtml(): string {
		let converter = new showdown.Converter();

		let result = `## ${this.title}
*[${this.url}] (${this.url})*

\`${this.content}\`
* * *
`;

		return converter.makeHtml(result);
	}

}

export const Search = (context: vscode.ExtensionContext) => { 
	
	return vscode.commands.registerCommand(
	"code-finder.search",
	() => {
    vscode.window
    	.showInputBox({ prompt: "Enter query" })
    	.then((query) => {
			if (!query) {
				return;
			}

			const panel = vscode.window.createWebviewPanel(
				'searchResults', // Identifies the type of the webview. Used internally
				'Search Results', // Title of the panel displayed to the user
				vscode.ViewColumn.One, // Editor column to show the new webview panel in.
				{} // Webview options. More on these later.
			);

			let content: string = '';
			getContent(query, context).then(result => result.forEach(contentBlock => content += contentBlock.generateHtml()));
			panel.webview.html = content;
    	});
	}
);};

async function getContent(query: string, context: vscode.ExtensionContext): Promise<Array<ContentBlock>> {
	return (await new GithubSearch(context.extensionPath).getSuggestions(query, 'python'))
		.map(
				suggestion => new ContentBlock('Code', suggestion, '')
			);

//   return [
//     new ContentBlock("Issue #123", "The amazing content", "http://abc.def"),
//     new ContentBlock("Wiki page", "The amazing content", "http://omg.wtf"),
//   ];
}
