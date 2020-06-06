
export class AutoCompleteSuggestion {
    construction: string;

    constructor(construction: string) {
        this.construction = construction;
    }

}

export class SearchSuggestion {
    construction: string;
    url: string;

    constructor(construction: string, url: string) {
        this.construction = construction;
        this.url = url;
    }

}