import * as vscode from 'vscode';
import * as fs from 'fs';

const END_POINT: String = "https://api.github.com/"
const SEARCH_REPOS_METHOD: String = "search/repositories"
const SEARCH_CODE_METHOD: String = "search/code"

const TOKEN: String = ""

export function getSuggestions(construction: String, language: string) {

}

async function makeGithubCall(url: String) {
    const response = await fetch(url, {
      headers: {
        authorization: `token ${TOKEN}`
      }
    }).then(function(response: Response) {
      if (response.headers.get("X-Ratelimit-Remaining") == "0") {
        let diff = Number(response.headers.get("X-Ratelimit-Reset"))*1000 - Date.now().valueOf();
        function delay(ms: number) {
          return new Promise( resolve => setTimeout(resolve, ms) );
        }
        delay(diff)
      }
    }).then(
      async (result: any) => await result.json()
    )
}

function getReposForLanguage(language: string) {
    const filename = `repo_${language}.json`
    if (!fs.existsSync(filename)) {
      
    }
}


// function getWebhook() {
//     let promise = fetch('/api/webhook')
//     .then(
//         result => result.json()
//     ).then(
//         result => {
//             if (result.webhook) {
//                 $webhookUrl = result.webhook;
//             }
//             else {
//                 return Promise.reject();
//             }
//         }
//     );
// }