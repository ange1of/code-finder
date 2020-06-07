import * as vscode from 'vscode';
import fs from "fs";
import path from "path";
import { GithubSearch } from './github-search';
import { SearchSuggestion } from './suggestions';

const showdown = require('showdown');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

export const Search = (context: vscode.ExtensionContext) => {

	return vscode.commands.registerCommand(
		"code-finder.search",
		() => {
			const editor = vscode.window.activeTextEditor;
			const query = editor?.document.getText(editor.selection);
			console.info(`Query: ${query}`);

			if (!query) {
				return;
			}

			const panel = vscode.window.createWebviewPanel(
				'searchResults', // Identifies the type of the webview. Used internally
				'Search Results', // Title of the panel displayed to the user
				vscode.ViewColumn.One, // Editor column to show the new webview panel in.
				{
					localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'static'))]
				} // Webview options. More on these later.
			);

			try {
				let webviewManager = new WebviewManager(context.extensionPath, panel.webview);
				panel.webview.html = "<h1>Loading...</h1>";
				webviewManager.renderQuery(query);
			}
			catch (ex) {
				panel.webview.html = `<h2>Unable to display results<h2>\n
				<h3>${ex}</h3>`;
			}
		}
	);
};

export class WebviewManager {

	private filePath: string;
	private dom: any;

	constructor(private extensionPath: string, private webviewObject: vscode.Webview) {
		this.filePath = path.resolve(this.extensionPath, 'static', 'index.html');
		this.dom = new JSDOM(this.loadHtml());
		this.updatePage();
	}

	public renderQuery(query: string) {
		if (!query) { return; }

		this.getContent(query)
			.then(
				contentBlockArray => {
					let document = this.dom.window.document;
					document.querySelector('#query > div').textContent += query;
					this.updatePage();

					contentBlockArray.map(
						block => {
							document.querySelector('#main-content').innerHTML += this.renderBlock(block);
						}
					);
					this.updatePage();
				}
			);
	}

	private renderBlock(block: SearchSuggestion) {
		return `
<div class="result-block">
	<div class="block-header">
		<h3><a href=${block.fileUrl}>${block.fileName}</a></h3>
	</div>
	<div class="info">
		<p>Repository: <a href="${block.repoUrl}">${block.repoName}</a></p>
		<p>${block.repoDescription}</p>
	</div>
	<pre><div class="code">${block.construction}</div></pre>
</div>`;
	}

	private loadHtml(): string {
		if (!fs.existsSync(this.filePath)) {
			throw new Error('Main page loading failed');
		}

		const stylePath = vscode.Uri.file(path.join(this.extensionPath, 'static', 'style.css'));
		const styleSrc = this.webviewObject.asWebviewUri(stylePath);

		let data: string = fs
			.readFileSync(this.filePath, { encoding: "utf-8" })
			.toString()
			.replace('{{styleSrc}}', styleSrc.toString());

		return data;
	}

	private updatePage() {
		this.webviewObject.html = this.dom.serialize();
	}

	private async getContent(query: string): Promise<Array<SearchSuggestion>> {
		try {
			return (await new GithubSearch(this.extensionPath).getSearchSuggestions(query, 'python'));
		} catch (err) {
			vscode.window.showErrorMessage(err.toString());
			return [];
		}

		// return [
		// 	new SearchSuggestion(
		// 		'import numpy a np\nlolkek cheburek\n123',
		// 		'test_file.py',
		// 		'http://lolkek.ru/test_repo/test_file',
		// 		`Awesome repo Awesome repo Awesome repo Awesome repo Awesome repo 
		// 		Awesome repo Awesome repo Awesome repo Awesome repo Awesome repo Awesome 
		// 		repo Awesome repo Awesome repo Awesome repo`,
		// 		'test-repo',
		// 		'http://lolkek.ru/test_repo'
		// 	),
		// 	new SearchSuggestion(
		// 		'abc',
		// 		'a.py',
		// 		'http://lolkek.ru/test_repo/test_file',
		// 		`VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
		// 		VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV`,
		// 		'test-repo',
		// 		'http://lolkek.ru/test_repo'
		// 	),
		// ];
	}
}
