
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

export class IssueSuggestion {
    constructor(
        public issueUrl: string,
        public repoUrl: string,
        public title: string,
        public state: string,
        public createdAt: string,
        public updatedAt: string,
        public closedAt: string | null,
        public body: string,
        public userLogin: string,
        public userUrl: string,
        public commentsCount: number
    ) {
        this.createdAt = (new Date(createdAt)).toDateString();
        this.updatedAt = (new Date(updatedAt)).toDateString();
        this.closedAt = closedAt ? (new Date(closedAt)).toDateString() : 'Not closed';
    }
}