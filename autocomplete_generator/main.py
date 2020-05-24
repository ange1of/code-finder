from os import path
import requests
import base64
import json
import time

END_POINT = "https://api.github.com/"
SEARCH_REPOS_METHOD = "search/repositories"
SEARCH_CODE_METHOD = "search/code"

def get_request_json(url):
    response = requests.get(url)
    if int(response.headers['X-Ratelimit-Remaining']) < 2:
        print(response.headers['X-Ratelimit-Reset'])
        diff = int(response.headers['X-Ratelimit-Reset']) - int(time.time())
        print(diff)
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
    query = "?q=language:%s&order=desc" %(language)
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

def get_code_by_url(url):
    lines = get_request_json(url)
    if lines['encoding'] == 'base64':
        return base64.b64decode(lines['content'])
    else:
        return "???????????????"

def save_constructions(language, constructions):
    {k: v for k, v in sorted(constructions.items(), key=lambda item: item[1])}
    print(language)
    print(constructions)
    # with open("DATABASE_AI_500GPU_%s.json" %(language), 'w') as outfile:
    #     json.dump(constructions, outfile)


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

for language in mapped_constructions.keys():
    constructions = dict()
    repos = get_repos_by_language(language)
    for construction in mapped_constructions[language]:
        for repo in repos:
            urls = get_construction_urls_from_repo(construction, language, repo)
            for url in urls:
                code = get_code_by_url(url) # TODO: get more valuable information from this string
                if code in constructions:
                    constructions[code] += 1
                else:
                    constructions[code] = 1
    save_constructions(language, constructions)

    