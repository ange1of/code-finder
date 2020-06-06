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
    return (await this.loadConstructions(construction, language))
      .map(x => new SearchSuggestion(x[0], x[1]));
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
  ): Promise<[string, string][]> {
    const repos = await this.getReposByLanguage(language);
    const constructionsSet: Set<[string, string]> = new Set<[string, string]>();
    for (const repo of repos) {
      const paths = await this.getCodePaths(construction, language, repo);
      for (const path of paths) {
        const content = await this.getCodesFromUrl(
          this.CODE_URL + repo + "/master/" + path[0]
        );
        content
          .split(String.fromCharCode(10))
          .filter((x) => x.startsWith(construction))
          .forEach(x => constructionsSet.add([x[0], path[1]]));
      }
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

  private async getCodePaths(
    construction: string,
    language: string,
    repo: string
  ): Promise<[string, string][]> {
    console.log("code search start");
    const codes = await this.octokit.search.code({
      q: `${construction} language:${language} repo:${repo}`,
    });
    console.log("code search ok");
    const pathsList: [string, string][] = [];

    for (const code of codes.data.items) {
      pathsList.push([code.path, code.html_url]);
    }
    return pathsList;
  }

  private async getCodesFromUrl(url: string): Promise<string> {
    console.log(url);
    return await superagent.get(url).then((x) => x.text);
  }
}
