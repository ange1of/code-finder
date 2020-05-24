import * as vscode from "vscode";

class ContentBlock {
	title: string;
	content: string;
	url: string;

	constructor(title: string, content: string, url:string) {
		this.title = title;
		this.content = content;
		this.url = url;
	}

	generateMarkdown(): string {
		return `<h1>${this.title}</h1>
				<hr/>
				<i>${this.url}</i>
				<hr/>
				${this.content}
				<hr/>
				<br/>`;
	}

}

export const Search = vscode.commands.registerCommand(
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

			getContent(query).forEach(contentBlock => content += contentBlock.generateMarkdown());
			panel.webview.html = content;
    	});
	}
);

function getContent(query: string): Array<ContentBlock> {
	return [
		new ContentBlock('Issue #123', 'The amazing content', 'http://abc.def'),
		new ContentBlock('Wiki page', 'The amazing content', 'http://omg.wtf')
	];
}