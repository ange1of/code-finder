import requests
import json

constructions_to_fill = {
    ("javascript", "let"),
    ("java" , "String"),
    ("c++", "zalupa"),
    ("kotlin", "Glide")
}
mapped_constructions = dict()

for language, construction in constructions_to_fill:
    if language in mapped_constructions:
        mapped_constructions[language].append(construction)
    else:
        mapped_constructions[language] = [construction]

languages_lines = dict()
for language in mapped_constructions.keys():
    languages_lines[language] = dict()
    for construction in mapped_constructions[language]:
        for i in range(50):
            link = "https://searchcode.com/api/codesearch_I/?q=%s+lang:%s&per_page=99&p=%s" %(construction, language, i)
            resp = requests.get(link)
            results = resp.json()['results']
            if results == None:
                break
            for source in results:
                for _, value in source['lines'].items():
                    if not value.strip().startswith(construction):
                        continue
                    if value in languages_lines:
                        languages_lines[language][value.strip()] += 1
                    else:
                        languages_lines[language][value.strip()] = 1

for language in languages_lines:
    {k: v for k, v in sorted(languages_lines[language].items(), key=lambda item: item[1])}
    with open("DATABASE_AI_500GPU_%s.json" %(language), 'w') as outfile:
        json.dump(languages_lines[language], outfile)

