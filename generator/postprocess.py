import json

if __name__ == "__main__":
    with open("completions.json", "r") as f:
        data = f.read()
        parsed = json.loads(data)
    
    comp = [x for x in parsed if "import" in x]
    comp.sort()
    with open("completions_clean.json", "w") as f:
        f.write(json.dumps(comp))
    
