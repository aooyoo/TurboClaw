export namespace main {
	
	export class Message {
	    id: string;
	    role: string;
	    content: string;
	    files?: string[];
	    timestamp: number;
	
	    static createFrom(source: any = {}) {
	        return new Message(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.role = source["role"];
	        this.content = source["content"];
	        this.files = source["files"];
	        this.timestamp = source["timestamp"];
	    }
	}
	export class ChatSession {
	    id: string;
	    name: string;
	    // Go type: time
	    created_at: any;
	    messages: Message[];
	
	    static createFrom(source: any = {}) {
	        return new ChatSession(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.messages = this.convertValues(source["messages"], Message);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Config {
	    telegram_bot_token: string;
	    model_provider: string;
	    model_api_key: string;
	    model_name: string;
	    base_url: string;
	    extra_settings: Record<string, string>;
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.telegram_bot_token = source["telegram_bot_token"];
	        this.model_provider = source["model_provider"];
	        this.model_api_key = source["model_api_key"];
	        this.model_name = source["model_name"];
	        this.base_url = source["base_url"];
	        this.extra_settings = source["extra_settings"];
	    }
	}
	
	export class Skill {
	    name: string;
	    description: string;
	    source: string;
	    emoji: string;
	    enabled: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Skill(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.description = source["description"];
	        this.source = source["source"];
	        this.emoji = source["emoji"];
	        this.enabled = source["enabled"];
	    }
	}

}

