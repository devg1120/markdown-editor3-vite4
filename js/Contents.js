import * as content1 from "./contents/content1.js";
import * as content2 from "./contents/content2.js";
import * as content3 from "./contents/content3.js";

export class Contents {
  constructor() {
    this.dict = {
      content1: { content: content1.content, url: content1.url },
      content2: { content: content2.content, url: content2.url },
      content3: { content: content3.content, url: content3.url },
    };
  }

  length() {
    return this.dict.length;
  }

  getNamelist() {
    let names = [];
    for (let key in this.dict) {
      names.push(key);
    }
    return names;
  }

  getContent(name) {
    return this.dict[name].content;
  }
  getUrl(name) {
    return this.dict[name].url;
  }
}
