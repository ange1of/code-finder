import os
import json
import requests
import token
import tokenize
import io
from github import Github
from tqdm import tqdm
from ratelimit import limits, sleep_and_retry, RateLimitException
from backoff import on_exception, expo

REPO_COUNT = 5
CODE_COUNT = 10000
GITHUB_RAW_URL = "https://raw.githubusercontent.com/{full_name}/master/{path}"
USER_AGENT = "ange1of/code-finder v0.0.1"
CONSTRUCTIONS = [
    "import",
    "np",
    "requests",
    "tf",
    "pd",
    "plt",
    "django",
    "Flask"
]

COMPLETIONS_FILE_NAME = "resources/completions/completions_{language}.json"
REPOS_FILE_NAME = "resources/repos/repos_{language}.json"

LANGUAGES = [
    "Python"
]
BAN_WORDS = ["def", "#"]

def remove_comments(data):
    base = io.StringIO(data)
    tokgen = tokenize.generate_tokens(base.readline)
    prev_toktype = token.INDENT
    first_line = None
    last_lineno = -1
    last_col = 0

    clean_file = io.StringIO()

    for toktype, ttext, (slineno, scol), (elineno, ecol), ltext in tokgen:
        if slineno > last_lineno:
            last_col = 0
        if scol > last_col:
            clean_file.write(" " * (scol - last_col))
        if toktype == token.STRING and prev_toktype == token.INDENT:
            # Docstring
            # mod.write("#--")
            pass
        elif toktype == tokenize.COMMENT:
            # Comment
            # mod.write("##\n")
            pass
        else:
            clean_file.write(ttext)
        prev_toktype = toktype
        last_col = ecol
        last_lineno = elineno

    value = clean_file.getvalue()
    clean_file.close()
    return value

@sleep_and_retry
# @on_exception(expo, RateLimitException, max_tries=8)
@limits(calls=20, period=5)
def get_content(full_name, path):
    url = GITHUB_RAW_URL.format(full_name=full_name, path=path)
    r = requests.get(url)

    if not r.ok:
        raise requests.RequestException(f'API response: {r.status_code}', response=r)

    return r.text

def generate_completeions(g):
    completions = set()

    print(f"Parsing top {REPO_COUNT} repos")

    for language in LANGUAGES:
        try:
            for repo in g.search_repositories(f"language:{language}", order="desc", sort="stars")[:REPO_COUNT]:
                print(repo.full_name)
                for construction in CONSTRUCTIONS:
                    cursor = g.search_code(f"{construction} repo:{repo.full_name} language:{language}")
                    count = min(cursor.totalCount, CODE_COUNT)
                    print(count)
                    for code in tqdm(cursor[:count], total=count):
                        try:
                            content = get_content(code.repository.full_name, code.path)
                        except requests.RequestException as e:
                            tqdm.write(f"error: {e} {code.repository.full_name}/{code.path}")
                            continue
                            
                    content = remove_comments(content)
                    for line in content.splitlines():
                        if not any([x in line for x in BAN_WORDS]) and line.strip():
                            completions.add(line.strip())
                print()
        except KeyboardInterrupt:
            print("Saving state")
            pass
        
        with open(COMPLETIONS_FILE_NAME.format(language=language), "w") as f:
            f.write(json.dumps(list(completions)))

def generate_repos(g):
    for language in LANGUAGES:
        repos = set()
        for repo in g.search_repositories(f"language:{language}", order="desc", sort="stars")[:REPO_COUNT]:
            repos.add(repo.full_name)
        with open(REPOS_FILE_NAME.format(language=language), "w") as f:
            f.write(json.dumps(list(repos)))


if __name__ == "__main__":
    gh_token = os.environ.get("GITHUB_TOKEN")
    if not gh_token:
        print("GITHUB_TOKEN is not set!")
        exit(1)

    g = Github(gh_token)

    generate_repos(g)
    generate_completeions(g)

