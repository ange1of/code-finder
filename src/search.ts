import * as vscode from 'vscode';
import fs from "fs";
import path from "path";
import { GithubSearch } from './github-search';

const showdown = require('showdown');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

class ContentBlock {
	title: string;
	content: string;
	url: string;

	constructor(title: string, content: string, url:string) {
		this.title = title;
		this.content = content;
		this.url = url;
	}

	htmlRepresentation(): string {
		let converter = new showdown.Converter();

		let result = `<div class="result-block">
		<h3>${this.title}</h3>
<p>Source: <a href="${this.url}">${this.url}</a></p>
<pre><div class="code">${this.content}</div></pre></div>`;

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
				{
					localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'static'))]
				} // Webview options. More on these later.
			);
			
			try {
				let webviewManager = new WebviewManager(context.extensionPath, panel.webview);
				webviewManager.renderQuery(query);
			}
			catch (ex) {
				panel.webview.html = `<h2>Unable to display results<h2>\n
				<h3>${ex}</h3>`;
			}
    	});
	}
);};

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
							document.querySelector('#main-content').innerHTML += block.htmlRepresentation();
						}
					);
					this.updatePage();
				}
			);
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

	private async getContent(query: string): Promise<Array<ContentBlock>> {
		// return (await new GithubSearch(this.extensionPath).getAutocompletionSuggestions(query, 'python'))
		// 	.map(
		// 			suggestion => new ContentBlock('Code', suggestion.construction, '')
		// 		);
		return [
			new ContentBlock('Lol', 'kekes memes\nimport numpy as np\n vot eto viuha', 'http://lolkek.ru'), 
			new ContentBlock('Lol', 'kekes memes', 'http://lolkek.ru')
		];
	}
}
