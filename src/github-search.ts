import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { Octokit } from "@octokit/rest";
import * as superagent from "superagent";

export class GithubSearch {
  private octokit: Octokit;
  private TOKEN: string = "";
  private reposPath: string = "";

  constructor(private extensionPath: string) {
    this.octokit = new Octokit({
      auth: this.TOKEN || null,
      userAgent: "ange1of/code-finder v0.0.1",
    });
  }

  // type GithubRepo = {
  //    fullName: string;
  // } // { "fullName", "fdsm;kfn", "fmdf"}

  // type GithubFileCode = {
  //   fileUrl: string;
  //   codes: string[];
  //   fileName: string;
  // }

  // type ReposForLanguage = {
  //   repos: GithubRepo
  // }

  async getSuggestions(construction: string, language: string) {
    this.reposPath = `repos_${language}.json`;
    const constructions = (
      await this.getLocalConstructions(language)
    ).filter((x) => x.includes(construction));
    if (!Array.isArray(constructions) || !constructions.length) {
      return this.loadConstructions(construction, language);
    } else {
      return constructions;
    }
  }

  private async getLocalConstructions(language: string): Promise<string[]> {
    if (fs.existsSync(path.resolve(this.extensionPath, `DB_KEK_${language}`))) {
      const data = fs
        .readFileSync(`DB_KEK_${language}`, { encoding: "utf-8" })
        .toString();
      return JSON.parse(data);
    }

    return [];
  }

  private async loadConstructions(
    construction: string,
    language: string
  ): Promise<string[]> {
    const repos = await this.getReposByLanguage(language);
    const constructions: string[] = [];
    for (const repo of repos) {
      const codes = await this.getConstructionUrlsFromRepo(
        construction,
        language,
        repo
      ); //урлы конструкций
      for (const contentURL of codes) {
        const content = await this.getCodesFromUrl(contentURL);
        const contentToSave = Buffer.from(content, "base64").toString("binary");
        constructions.push(contentToSave);
      }
    }
    return constructions;
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
      per_page: 10,
    });
    console.log("repos search ok");
    const repoList: string[] = [];

    // for (const repo of repos.data.items) {
    //   repoList.push(repo.full_name);
    // }
    // fs.writeFileSync(
    //   path.resolve(this.extensionPath, this.reposPath),
    //   JSON.stringify(repoList),
    //   { encoding: "utf-8" }
    // );
    return repos.data.items.map((x) => x.full_name);
    //fs.writeFileSync(`repos_${language}.json`, JSON.stringify(repos));
  }

  private async getConstructionUrlsFromRepo(
    construction: string,
    language: string,
    repo: string
  ): Promise<string[]> {
    console.log("code search start");
    const codes = await this.octokit.search.code({
      q: `${construction} language:${language} repo:${repo}`,
    });
    console.log("code search ok");
    const codeUrlsList: string[] = [];

    for (const code of codes.data.items) {
      codeUrlsList.push(code.git_url);
    }
    return codeUrlsList;
  }

  private async getCodesFromUrl(url: string): Promise<string> {
    // let response = await fetch(url);
    const response = await superagent
      .get(url)
      .accept("json")
      .set("User-Agent", "ange1of/code-finder");
    console.log(url);
    const json = (await response.body) as Record<string, unknown>;
    return json["content"] as string;
  }
}
