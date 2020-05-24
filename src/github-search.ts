import * as vscode from "vscode";
import * as fs from "fs";
import { Octokit } from "@octokit/rest";

const TOKEN: string = "";

const octokit = new Octokit({
  auth: TOKEN || null,
  userAgent: "ange1of/code-finder v0.0.1"
})

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

export async function getSuggestions(construction: string, language: string) {
  const constructions = (await getLocalConstructions(language))
    .filter( x => x.includes(construction) );
  if (!Array.isArray(constructions) || !constructions.length){
    return loadConstructions(construction, language);
  } else {
    return constructions;
  }
}

async function getLocalConstructions(language: string): Promise<string[]> {
  if (fs.existsSync(`DB_KEK_${language}`)){
    const data = fs.readFileSync(`DB_KEK_${language}`, {encoding: "utf-8"}).toString();
    return JSON.parse(data);
  } 
  
  return [];
}

async function loadConstructions(construction: string, language: string): Promise<string[]> {
  const repos = await getReposByLanguage(language);
  const constructions: string[] = [];
  for (const repo in repos) {
    const codes = await getConstructionUrlsFromRepo(construction, language, repo);//урлы конструкций
    for (const contentURL in codes){
      const content = await getCodesFromUrl(contentURL);
      const contentToSave = Buffer.from(content, 'base64').toString('binary');
      constructions.push(contentToSave);
    }
  }
  return constructions;
}

async function getReposByLanguage(language: string): Promise<string[]> {
  const filename = `repo_${language}.json`;
  if (!fs.existsSync(filename)) {
    await savePopularReposByLanguage(language);
  }
  const data = fs.readFileSync(filename, {encoding: "utf-8"}).toString();
  return JSON.parse(data);
}

async function savePopularReposByLanguage(language: string): Promise<void> {
    const repos = await octokit.search.repos({q: `language:${language}`, order: "desc", per_page: 10});
    const repoList: string[] = [];

    for (const repo of repos.data.items){
        repoList.push(repo.full_name);
    }

    fs.writeFileSync(`repos_${language}.json`, JSON.stringify(repos));
}

async function getConstructionUrlsFromRepo(construction: string, language: string, repo: string): Promise<string[]> {
  const codes = await octokit.search.code({q: `${construction} language:${language} repo:${repo}`});
  const codeUrlsList: string[] = [];
  
  for (const code of codes.data.items) {
    codeUrlsList.push(code.git_url);
  }
  return codeUrlsList;
}

async function getCodesFromUrl(url: string): Promise<string> {
  // return fetch(url).then( (res: Response) => res.json())
  // .then( (x: any) => x.content as string)
  
  let response = await fetch(url);
  let json = await response.json() as Record<string, unknown>;
  return json["content"] as string;

}

getSuggestions("import", "python").then(result => console.log(result));