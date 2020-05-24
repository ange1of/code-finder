from os import path
import requests
import base64
import json
import time

END_POINT = "https://api.github.com/"
SEARCH_REPOS_METHOD = "search/repositories"
SEARCH_CODE_METHOD = "search/code"

USERNAME = ""
TOKEN = ""

def get_request_json(url):
    response = gh_session.get(url)
    if int(response.headers['X-Ratelimit-Remaining']) < 2:
        diff = int(response.headers['X-Ratelimit-Reset']) - int(time.time())
        time.sleep(diff)
    return response.json()

def get_repos_by_language(language):
    filename = "repos_%s.json" %(language)
    if not path.exists(filename):
        if not save_popular_repos_by_language(language):
            return []
    with open(filename) as repos:
        return json.load(repos)

def save_popular_repos_by_language(language):
    query = "?q=language:%s&order=desc&sort=stars" %(language)
    repos = get_request_json(END_POINT + SEARCH_REPOS_METHOD + query)
    repo_list = []
    if repos['total_count'] == 0 : return False
    for repo in repos['items']:
        repo_list.append(repo['full_name'])
    filename = "repos_%s.json" %(language)
    with open(filename, 'w') as repos:
        json.dump(repo_list[:10], repos)
    return True

def get_construction_urls_from_repo(construction, language, repo):
    query = "?q=%s+in:file+language:%s+repo:%s" %(construction, language, repo)
    codes = get_request_json(END_POINT + SEARCH_CODE_METHOD + query)
    urls_list = []
    if codes['total_count'] != 0:
        for code in codes['items']:
            urls_list.append(code['git_url'])
    return urls_list

def get_code_by_url(url, construction):
    lines = get_request_json(url)
    if lines['encoding'] == 'base64':
        lines_decoded = str(base64.b64decode(lines['content'])).split("\\n")
        lines_with_construction = list(filter(lambda x: construction in x, lines_decoded))
        return list(map(lambda x: x.strip(), lines_with_construction))
    else:
        return []

def save_constructions(language, constructions):
    with open("DATABASE_AI_500GPU_%s.json" %(language), 'w') as outfile:
        json.dump(sorted(constructions.items(), key=lambda x: x[1], reverse=True), outfile)


constructions_to_fill = {
    ("kotlin", "Glide"),
    ("python", "import")
}

mapped_constructions = dict()
for language, construction in constructions_to_fill:
    if language in mapped_constructions:
        mapped_constructions[language].append(construction)
    else:
        mapped_constructions[language] = [construction]

gh_session = requests.Session()
gh_session.auth = (USERNAME, TOKEN)

for language in mapped_constructions.keys():
    constructions = dict()
    repos = get_repos_by_language(language)
    for construction in mapped_constructions[language]:
        for repo in repos:
            urls = get_construction_urls_from_repo(construction, language, repo)
            for url in urls:
                codes = get_code_by_url(url, construction)
                for code in codes:
                    if code in constructions:
                        constructions[code] += 1
                    else:
                        constructions[code] = 1
    save_constructions(language, constructions)

