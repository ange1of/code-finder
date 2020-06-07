import fs from "fs";
import path from "path";
import { Octokit } from "@octokit/rest";
import superagent from "superagent";
import { AutoCompleteSuggestion, SearchSuggestion, IssueSuggestion } from "./suggestions";

export class GithubSearch {
  private octokit: Octokit;
  private TOKEN: string = "";

  private CODE_URL: string = "https://raw.githubusercontent.com/";

  constructor(private extensionPath: string) {
    this.octokit = new Octokit({
      auth: this.TOKEN || null,
      userAgent: "ange1of/code-finder v0.0.1",
    });
  }

  getAutocompletionSuggestions(construction: string, language: string): AutoCompleteSuggestion[] {
    return this.getLocalConstructions(language)
      .map(x => new AutoCompleteSuggestion(x));
  }

  async getSearchSuggestions(construction: string, language: string, count: number = 5): Promise<SearchSuggestion[]> {
    return (await this.loadConstructions(construction, language, count));
  }

  async getIssuesSuggestions(construction: string, language: string): Promise<IssueSuggestion[]> {
    return (await this.octokit.search.issuesAndPullRequests({
      q: `${construction} language:${language}`,
      sort: "reactions-+1",
      order: "asc"
    }))
      .data
      .items
      .map(x => new IssueSuggestion(
        x.html_url,
        x.repository_url,
        x.title,
        x.state,
        x.created_at,
        x.updated_at,
        x.closed_at,
        x.body,
        x.user.login,
        x.user.html_url,
        x.comments
      ));
  }

  private getLocalConstructions(language: string): string[] {
    const suggestionsFilename = this.extensionPath + `resources/completions/completions_${language}.json`;
    if (!fs.existsSync(path.resolve(this.extensionPath, suggestionsFilename))) {
      return [];
    }

    const data = fs
      .readFileSync(suggestionsFilename, { encoding: "utf-8" })
      .toString();
    return JSON.parse(data);
  }

  private async loadConstructions(
    construction: string,
    language: string,
    count: number
  ): Promise<SearchSuggestion[]> {
    let remaining = count;
    const repos = await this.getReposByLanguage(language);
    const constructionsSet: Set<SearchSuggestion> = new Set<SearchSuggestion>();
    for (const repo of repos) {
      if (remaining <= 0) { break; }
      (await this.getCodeSuggestionsFromRepo(construction, language, repo, remaining))
        .forEach(x => constructionsSet.add(x));
      remaining = count - constructionsSet.size;
    }
    return [...constructionsSet];
  }

  private async getReposByLanguage(language: string): Promise<string[]> {
    const repoFilename = path.join(this.extensionPath, 'resources', 'repos', `repos_${language}.json`);
    const filename = path.resolve(this.extensionPath, repoFilename);

    if (!fs.existsSync(filename)) {
      const repos = await this.savePopularReposByLanguage(language);
      fs.writeFileSync(
        path.resolve(this.extensionPath, repoFilename),
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
    repo: string,
    count: number
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
