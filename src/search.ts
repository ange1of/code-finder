import * as vscode from 'vscode';
import fs from "fs";
import path from "path";
import { GithubSearch } from './github-search';
import { SearchSuggestion, IssueSuggestion } from './suggestions';

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

export const Search = (context: vscode.ExtensionContext) => {
	return vscode.commands.registerCommand(
		"code-finder.search",
		() => handleQuery(WebviewManager.prototype.getCode, context)
	);
};

export const SearchIssues = (context: vscode.ExtensionContext) => {
	return vscode.commands.registerCommand(
		"code-finder.searchIssues",
		() => handleQuery(WebviewManager.prototype.getIssue, context)
	);
};

function handleQuery(handler: Function, context: vscode.ExtensionContext): void {
	const editor = vscode.window.activeTextEditor;
	const query = editor?.document.getText(editor.selection);
	const language = editor?.document.languageId;
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
		let webviewManager = new WebviewManager(context.extensionPath, panel.webview, handler);
		panel.webview.html = '<h1 style="font-weight: lighter">Loading...</h1>';
		webviewManager.renderQuery(query, language);
	}
	catch (ex) {
		panel.webview.html = `<h2>Unable to display results<h2>\n
		<h3>${ex}</h3>`;
	}
}

export class WebviewManager {

	private filePath: string;
	private dom: any;

	constructor(
		private extensionPath: string, 
		private webviewObject: vscode.Webview, 
		private getContentFunc: Function
	) {
		this.filePath = path.resolve(this.extensionPath, 'static', 'index.html');
		this.dom = new JSDOM(this.loadHtml());
		this.updatePage();
	}

	public renderQuery(query: string, language: string | undefined) {
		if (!query) { return; }

		language = language || 'python';

		this.getContentFunc.call(this, query, language)
			.then(
				(contentBlockArray: Array<IssueSuggestion | SearchSuggestion>) => {
					let document = this.dom.window.document;
					document.querySelector('#query > div').textContent += query;
					this.updatePage();
					
					if (!contentBlockArray.length) {
						document.querySelector('#main-content').innerHTML += '<h3>Nothing found :(</h3>';
					}
					
					contentBlockArray.map(
						block => {
							document.querySelector('#main-content').innerHTML += block.renderBlock();
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

	public async getCode(query: string, language: string): Promise<Array<SearchSuggestion>> {
		try {
			return (await new GithubSearch(this.extensionPath).getSearchSuggestions(query, language));
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

	public async getIssue(query: string, language: string): Promise<Array<IssueSuggestion>> {
		try {
			return (await new GithubSearch(this.extensionPath).getIssuesSuggestions(query, language));
		} catch (err) {
			vscode.window.showErrorMessage(err.toString());
			return [];
		}
		
		// return [
		// 	new IssueSuggestion(
		// 		"https://api.github.com/repos/batterseapower/pinyin-toolkit/issues/132",
		// 		"https://api.github.com/repos/batterseapower/pinyin-toolkit",
		// 		"Line Number Indexes Beyond 20 Not Displayed",
		// 		"open",
		// 		"2009-07-12T20:10:41Z",
		// 		"2009-07-19T09:23:43Z",
		// 		null,
		// 		"Awesome body Awesome body Awesome body Awesome body Awesome body",
		// 		"Nick3C",
		// 		"https://api.github.com/users/Nick3C",
		// 		15
		// 	)
		// ];
	}
}
