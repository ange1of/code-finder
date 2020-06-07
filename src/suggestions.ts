
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

    public renderBlock(): string {
		return `
<div class="result-block">
	<div class="block-header">
		<h3><a href=${this.fileUrl}>${this.fileName}</a></h3>
	</div>
	<div class="info">
		<p>Repository: <a href="${this.repoUrl}">${this.repoName}</a></p>
		<p>${this.repoDescription}</p>
	</div>
	<pre><div class="code">${this.construction}</div></pre>
</div>`;
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

    public renderBlock(): string {
		return `
<div class="result-block">
	<div class="block-header">
        <h3><a href=${this.issueUrl}>${this.title}</a>  <span class="issue-state">[${this.state}]</span></h3>
        <div class="time-info">
            <p>Created: ${this.createdAt}</p>
            <p>Updated: ${this.updatedAt}</p>
            <p>Closed: ${this.closedAt}</p>
        </div>
	</div>
	<div class="info">
		<p>Repository: <a href="${this.repoUrl}">${this.repoUrl}</a></p>
    </div>
    <div class="code">${this.body}</div>
    <div class="block-header time-info">
        <span>${this.commentsCount} comments</span>
        <span>Created by <a href="${this.userUrl}">${this.userLogin}</a></span>
    </div>
</div>`;
	}
}