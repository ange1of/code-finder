
export class AutoCompleteSuggestion {
    construction: string;

    constructor(construction: string) {
        this.construction = construction;
    }

}

export class SearchSuggestion {
    construction: string;
    fileName: string;
    fileUrl: string;
    repoDescription: string;
    repoName: string;
    repoUrl: string;

    constructor(
        construction: string, 
        fileName: string,
        fileUrl: string,
        repoDescription: string,
        repoName: string,
        repoUrl: string
    ) {
        this.construction = construction;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.repoDescription = repoDescription;
        this.repoName = repoName;
        this.repoUrl = repoUrl;
    }

}