import { marked } from "marked";

import * as ace from "ace-builds/src-noconflict/ace";

import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-idle_fingers";
import "ace-builds/src-noconflict/theme-one_dark";

import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-html";

import "flex-splitter-directive/index.js";
import "flex-splitter-directive/styles.min.css";

import * as monaco from "monaco-editor";

export class FileTreeControl {
  constructor(markDownPanel) {
    this.markDownPanel = markDownPanel;
    //this.fileContent = document.querySelector("#file-content");
    this.fileTree = document.querySelector("file-tree");
    //this.saveButton = document.querySelector("#save-button");
    //this.saveAsButton = document.querySelector("#save-as-button");
    //this.query = document.querySelector('[name="query"]');
    //this.searchResults = document.querySelector("#search-results");
    //this.searchTypes = [...document.querySelectorAll('[name="search-type"]')];

    //this.saveButton.addEventListener("click", this.saveFile);
    //this.saveAsButton.addEventListener("click", this.saveFileAs);
    //this.fileTree.addEventListener("ready", this.onReady);
    //this.fileTree.addEventListener("browsing", this.onBrowsing);
    this.fileTree.addEventListener("file-selected", this.openFile);
    //this.query.addEventListener("keyup", this.debouncedSearch);
    //this.searchResults.addEventListener("click", this.openFoundFile);

    this.editor = null;
    this.ace_editor_use = false;
    this.monaco_editor_use = false;
  }

  set_ace_editor() {
    this.ace_editor_use = true;
    this.monaco_editor_use = false;
  }

  set_monaco_editor() {
    this.monaco_editor_use = true;
    this.ace_editor_use = false;
  }

  openFile = ({ detail }) => {
    //console.log("openFile");
    //console.log(detail.handle);
    //let currentPath = await this.fileTree.currentDirectory.handle.resolve(detail,handle) ;
    //this.markDownPanel.openFileHandle(detail.handle);
    this.markDownPanel.openFileHandle(detail);

    //this.saveButton.disabled = true;
    //this.saveAsButton.disabled = true;

    const { type, contents } = detail.file;

    switch (type) {
      case "":
        //console.log("name:", detail.file.name);
        let name_split = detail.file.name.split(".");
        //console.log("ext:", name_split[name_split.length-1]);
        if (name_split[name_split.length - 1] == "md") {
          //console.log("md:"+ detail.file.name);
          //console.log(contents);
        }
    }
  };

  openFile_org = ({ detail }) => {
    console.log("openFile");

    //this.saveButton.disabled = true;
    //this.saveAsButton.disabled = true;

    const { type, contents } = detail.file;
    switch (type) {
      case "image/png":
      case "image/jpg":
      case "image/jpeg":
      case "image/gif":
        this.fileContent.innerHTML = `<img src="${contents}">`;

        break;
      case "image/svg+xml":
        this.fileContent.innerHTML = contents;

        break;
      /*
      case "":
        //console.log("name:", detail.file.name);
        let name_split = detail.file.name.split(".");
        //console.log("ext:", name_split[name_split.length-1]);
        if (name_split[name_split.length - 1] == "md") {
          this.fileContent.innerHTML = marked.parse(contents);
          break;
        }
*/
      default:
        if (this.ace_editor_use) {
          if (this.editor != null) {
            this.editor.destroy();
          }
          this.editor = ace.edit("file-content");

          //this.editor.setTheme("ace/theme/monokai");
          //this.editor.setTheme("ace/theme/idle_fingers");
          this.editor.setTheme("ace/theme/one_dark");
          this.editor.getSession().setMode("ace/mode/python");
          this.editor.setFontSize(18);
          this.editor.setValue(contents);
        } else if (this.monaco_editor_use) {
          //if ( this.editor != null) {
          //    this.editor.dispose() ;
          //}
          /*
            const myNode = document.getElementById("file-content");
	    while (myNode.firstChild) {
		      myNode.removeChild(myNode.lastChild);
	    }
            myNode.removeAttribute("context")
		console.dir(myNode);
	*/
          //    const parent = document.getElementById("file-content")
          //    while (parent.firstChild) {
          //		    parent.firstChild.remove()
          //    }
          //	parent.textContent = "";

          if (this.editor != null) {
            this.editor.dispose();
          }
          var element = document.getElementById("file-content");
          while (element.firstChild) {
            element.removeChild(element.firstChild);
            // OR
            //     element.firstChild.remove();
          }

          this.editor = monaco.editor.create(
            document.getElementById("file-content"),
            {
              value: contents,
              //language: "javascript",
            },
          );
        } else {
          this.fileContent.innerHTML = `<textarea>${contents}</textarea>`;
        }
        this.saveButton.disabled = false;
        this.saveAsButton.disabled = false;
    }
  };

  saveFile = () => {
    if (!this.ace_editor_use && !this.monaco_editor_use) {
      this.fileTree.saveFile(this.fileContent.querySelector("textarea").value);
    } else {
      this.fileTree.saveFile(this.editor.getValue());
    }
  };

  saveFileAs = () => {
    if (!this.ace_editor_use && !this.monaco_editor_use) {
      this.fileTree.saveFileAs(
        this.fileContent.querySelector("textarea").value,
      );
    } else {
      this.fileTree.saveFileAs(this.editor.getValue());
    }
  };

  search = async () => {
    //console.log("search");
    const searchType = this.searchTypes.find((type) => type.checked).value;

    const term = this.query.value;

    if (term.trim() !== "") {
      const { results } =
        searchType === "files"
          ? this.fileTree.findFile(term)
          : await tthis.fileTree.findInFiles(term);
      //console.log(results);
      const listFoundFiles = (list, { path, highlight }) => {
        list.insertAdjacentHTML(
          "beforeend",
          `<li data-path="${path}">${highlight[1]} <span class="path">${highlight[0]}</span></li>`,
        );

        return list;
      };

      const listFoundInFiles = (list, { path, rows }) => {
        const file = path.split("/").pop();
        list.insertAdjacentHTML(
          "beforeend",
          `<li data-path="${path}"><strong>${file}</strong></li>`,
        );

        rows.forEach(({ line, content }) =>
          list.insertAdjacentHTML(
            "beforeend",
            `<li data-path="${path}" data-line="${line}">${line}: ${content}</li>`,
          ),
        );

        return list;
      };

      const listSearchResults =
        searchType === "files" ? listFoundFiles : listFoundInFiles;

      const resultsList = results.reduce(
        listSearchResults,
        document.createElement("ul"),
      );

      this.searchResults.innerHTML = "";
      this.searchResults.insertAdjacentElement("beforeend", resultsList);
    } else {
      this.searchResults.innerHTML = "";
    }
  };

  selectLine = (line) => {
    const textarea = this.fileContent.querySelector("textarea");
    const lineNum = line - 1;
    const lines = textarea.value.split("\n");
    const startPos = lines
      .slice(0, lineNum)
      .reduce((sum, line) => sum + line.length + 1, 0);
    const endPos = lines[lineNum].length + startPos;

    textarea.focus();
    textarea.selectionStart = startPos;
    textarea.selectionEnd = endPos;
  };

  openFileByPath = (path) => {
    this.fileTree.openFileByPath(path);
  };

  openFoundFile = (e) => {
    const li = [...e.composedPath()].find(
      (el) => el.matches && el.matches("li"),
    );

    if (li) {
      const file = li.dataset.path;
      this.fileTree.openFileByPath(file);

      if (li.dataset.line !== undefined) {
        setTimeout(() => this.selectLine(li.dataset.line), 250);
      }
    }
  };

  debounce = (func, delay, immediate) => {
    let timeout;

    return function () {
      const context = this;
      const args = arguments;

      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };

      const callNow = immediate && !timeout;

      clearTimeout(timeout);
      timeout = setTimeout(later, delay);

      if (callNow) {
        func.apply(context, args);
      }
    };
  };

  onReady = () => {
    //console.log(this.query);
    this.query.disabled = false;
  };
  onBrowsing = () => {
    //console.log(this.query);
    this.query.disabled = true;
  };
  debouncedSearch = () => {
    //console.log("debouncedSearch");
    this.debounce(this.search, 500)();
  };
}
