import fs from "fs";
import path from "path";
import { Octokit } from "@octokit/rest";
import superagent from "superagent";
import { AutoCompleteSuggestion, SearchSuggestion } from "./suggestions";

export class GithubSearch {
  private octokit: Octokit;
  private TOKEN: string = "";
  private reposPath: string = "";

  private CODE_URL: string = "https://raw.githubusercontent.com/";

  constructor(private extensionPath: string) {
    this.octokit = new Octokit({
      auth: this.TOKEN || null,
      userAgent: "ange1of/code-finder v0.0.1",
    });
  }

  async getAutocompletionSuggestions(construction: string, language: string) {
    return (await this.getLocalConstructions(language))
      .filter(x => x.startsWith(construction))
      .map(x => new AutoCompleteSuggestion(x)); 
  }

  async getSearchSuggestions(construction: string, language: string) {
    return (await this.loadConstructions(construction, language));
  }

  private async getLocalConstructions(language: string): Promise<string[]> {
    if (!fs.existsSync(path.resolve(this.extensionPath, `suggestions_${language}.json`))) {
      return [];
    }

    const data = fs
      .readFileSync(`suggestions_${language}.json`, { encoding: "utf-8" })
      .toString();
    return JSON.parse(data);
  }

  private async loadConstructions(
    construction: string,
    language: string
  ): Promise<SearchSuggestion[]> {
    const repos = await this.getReposByLanguage(language);
    const constructionsSet: Set<SearchSuggestion> = new Set<SearchSuggestion>();
    for (const repo of repos) {
      (await this.getCodeSuggestionsFromRepo(construction, language, repo))
        .forEach(x => constructionsSet.add(x));
    }
    return [...constructionsSet];
  }

  private async getReposByLanguage(language: string): Promise<string[]> {
    const filename = path.resolve(this.extensionPath, this.reposPath);

    if (!fs.existsSync(filename)) {
      const repos = await this.savePopularReposByLanguage(language);
      fs.writeFileSync(
        path.resolve(this.extensionPath, this.reposPath),
        JSON.stringify(repos),
        { encoding: "utf-8" }
      );
      return repos;
    }
    const data = fs.readFileSync(filename, { encoding: "utf-8" }).toString();
    return JSON.parse(data);
  }

  private async savePopularReposByLanguage(
    language: string
  ): Promise<string[]> {
    console.log("repos search start");
    const repos = await this.octokit.search.repos({
      q: `language:${language}`,
      order: "desc",
      per_page: 5,
    });
    console.log("repos search ok");

    return repos.data.items.map((x) => x.full_name);
  }

  private async getCodeSuggestionsFromRepo(
    construction: string,
    language: string,
    repo: string
  ): Promise<SearchSuggestion[]> {
    console.log("code search start");
    const codes = await this.octokit.search.code({
      q: `${construction} language:${language} repo:${repo}`,
    });
    console.log("code search ok");
    const pathsList: SearchSuggestion[] = [];

    for (const code of codes.data.items) {
      (await this.getCodesFromUrl(this.CODE_URL + repo + "/master/" + code.path))
        .split(String.fromCharCode(10))
        .filter(x => x.startsWith(construction))
        .forEach(x => pathsList.push(
          new SearchSuggestion(
            x,
            code.name,
            code.html_url,
            code.repository.description,
            code.repository.full_name,
            code.repository.html_url
          )
        ));
    }
    return pathsList;
  }

  private async getCodesFromUrl(url: string): Promise<string> {
    console.log(url);
    return await superagent.get(url).then((x) => x.text);
  }
}
