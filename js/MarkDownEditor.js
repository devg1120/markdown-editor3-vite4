//import { marked } from "./marked/lib/marked.esm.js";
//import { marked } from '../node_modules/marked/lib/marked.esm.js';
import { marked } from "marked";
//import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import { TreeViewNavigation } from "./aria-practices/treeview/js/treeview-navigation.js";
import "./aria-practices/treeview/css/treeview-navigation.css";

import * as ace from "ace-builds/src-noconflict/ace";

import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-idle_fingers";
import "ace-builds/src-noconflict/theme-one_dark";

import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-html";

import DOMPurify from "dompurify";
import "flex-splitter-directive/index.js";
import "flex-splitter-directive/styles.min.css";

import * as monaco from "monaco-editor";

export class MarkDownEditor {
  constructor(parent_id, name, base, no, editor_id, preview_id, panel) {
    this.panel = panel;
    this.parent_id = parent_id;

    this.active = false;
    this.name = name;
    this.no = String(no);
    this.markdown_panel = base;
    this.hasEdited = false;

    //this.editor = ace.edit(editor_id);

    let ele = document.querySelector(parent_id + " " + "#" + editor_id);
    let new_id = parent_id + "-" + editor_id;
    ele.setAttribute("id", new_id);
    this.editor = ace.edit(new_id);

    this.editor.preview_id = preview_id;
    this.editor.getSession().setUseWrapMode(true);
    this.editor.setOptions({
      maxLines: Infinity,
      indentedSoftWrap: false,
      //fontSize: 16,
      fontSize: 18,
      autoScrollEditorIntoView: true,
      // https://ace.c9.io/build/kitchen-sink.html
      // https://gist.github.com/RyanNutt/cb8d60997d97905f0b2aea6c3b5c8ee0
      //theme: 'ace/theme/chrome',
      //theme: 'ace/theme/monokai',
      //theme: 'ace/theme/cobalt',
      theme: "ace/theme/one_dark",
    });

    //var MarkdownMode = ace.require("ace/mode/markdown").Mode;
    //this.editor.session.setMode(new MarkdownMode());
    //editor.setKeyboardHandler("ace/keyboard/vim");
    this.editor.setShowPrintMargin(false);
    this.editor.resize(true);

    this.editor.on("change", () => {
      //let changed = editor.getValue() != defaultInput;
      //if (changed) {
      //    hasEdited = true;
      //}
      this.hasEdited = true;
      let value = this.editor.getValue();
      this.convert(preview_id, value);
      this.markdown_panel.update_sync(value);
      //diff_ck_localFileSaveContent(value);
      //saveLastContent(value);
    });

    let that = this;

    this.editor.on("dblclick", function () {
      setTimeout(() => {
        var selected_word = that.editor.getSelectedText();
        console.log("dbclick select:" + selected_word);
      }, 10);
    });

    this.editor.on("focus", function () {
      //console.log("focus:" + that.name);
      that.active = true;
    });
    this.editor.on("blur", function () {
      //console.log("blur:" + that.name);
      that.active = false;
    });

    //domElement.addEventListener('click', (event) =>
    //  openCodeEditor(event, domElement, language)
    //);

    //this.editor.session.selection.on("changeCursor", function (e) {
    this.editor.on("click", function (e) {
      console.log("editor click");

      //setTimeout(function() {

      let c = that.editor.selection.getCursor();
      let linenum = Number(c.row) + 1;
      if (that.toc_index) {
        console.log("toc_index:", that.toc_index);
        if (that.toc_index.length == 0) {
          console.log("toc_index: enpty!!");
          return;
        }
        for (let i = 0; i < that.toc_index.length; i++) {
          if (that.toc_index[i].element.hasAttribute("aria-current")) {
            that.toc_index[i].element.removeAttribute("aria-current");
          }
        }
        let match = false;
        let match_index = 0;
        for (let i = 0; i < that.toc_index.length - 1; i++) {
          let a = Number(that.toc_index[i].linenum);
          let b = Number(that.toc_index[i + 1].linenum);
          if (a <= linenum && linenum < b) {
            //console.log(that.toc_index[i].text);
            that.toc_index[i].element.setAttribute("aria-current", "page");
            match = true;
            match_index = i;
            break;
          }
        }
        if (!match) {
          let i = that.toc_index.length - 1;
          let a = Number(that.toc_index[i].linenum);
          if (a <= linenum) {
            // console.log(that.toc_index[i].text);
            that.toc_index[i].element.setAttribute("aria-current", "page");
            match_index = i;
          }
        }
        //console.log("match_index:" + match_index);
        if (match_index > 0) {
          for (let i = match_index - 1; (i) => 0; i--) {
            if (that.toc_index[i].subtree) {
              //console.log(that.toc_index[i].text);
              that.toc_index[i].element.setAttribute("aria-expanded", "true");
            }
            if (that.toc_index[i].level == 1) {
              break;
            }
          }
        }
      }
      //}, 3);
    });

    this.toc = null;
  }
  setToc(toc) {
    this.toc = toc;
    this.toc_build();
  }
  getValue() {
    return this.editor.getValue();
  }
  setKeyboardHandler(value) {
    this.editor.setKeyboardHandler(value);
  }
  setFontSize(value) {
    this.editor.setFontSize(value);
  }

  sessionSync(editor2) {
    editor2.setSession(this.editor.getSession());
    let value = editor2.getValue();
    convert(editor2.preview_id, value);
  }

  convert_org(id, markdown) {
    let options = {
      headerIds: false,
      mangle: false,
    };
    let html = marked.parse(markdown, options);
    let sanitized = DOMPurify.sanitize(html);
    //document.querySelector('#output').innerHTML = sanitized;
    document.querySelector(this.parent_id + " " + "#" + id).innerHTML =
      sanitized;
    if (this.toc != null) {
      console.log("building toc");
    }
  }

  href_jump(e, href) {
    //console.log("href_jump", href);
    //console.log(e);
    this.panel.change_file(href);
  }

  convert(id, markdown) {
    let that = this;
    function href_jump(e) {
      console.log("href_jump");
      console.log(e);
    }
    function change(child) {
      //console.log(child.tagName);
      if (child.tagName == "A") {
        //console.log(child);
        let href = child.getAttribute("href");
        child.setAttribute("href", "#");

        child.addEventListener("click", (e) => {
          that.href_jump(e, href);
        });
      }
      //<img alt="CAT" src="/images/cat.svg">
      if (child.tagName == "IMG") {
        //console.log("IMG",child.getAttribute("src"));
        let src = child.getAttribute("src");
          if (src.startsWith("http")) {
            return;
          }
        if (that.filepath) {
          let dir = that.filepath.split("/");
          let B_path = "";
          for (let i = 0; i < dir.length - 1; i++) {
            B_path = B_path + "/" + dir[i];
          }
          //child.setAttribute("src", "/development-diary" + src);
          if (!src.startsWith(B_path)) {
            if (src.startsWith(".")) {
              src = src.slice(1);
            }
            if (!src.startsWith("/")) {
              src = "/" + src;
            }

            child.setAttribute("src", B_path + src);
          }
        }
      }
    }

    function allDescendants(node) {
      for (var i = 0; i < node.childNodes.length; i++) {
        var child = node.childNodes[i];
        allDescendants(child);
        change(child);
      }
    }

    let options = {
      headerIds: false,
      mangle: false,
    };
    let html = marked.parse(markdown, options);
    let sanitized = DOMPurify.sanitize(html);
    //document.querySelector('#output').innerHTML = sanitized;
    //console.log("id:" +id);
    document.querySelector(this.parent_id + " " + "#" + id).innerHTML =
      sanitized;
    let parent = document.querySelector(this.parent_id + " " + "#" + id);
    allDescendants(parent);

    if (this.toc != null) {
      /*
          const lexer = new marked.Lexer(options);
	  const tokens = lexer.lex(markdown);
          console.log("building toc");
          console.dir(tokens);
	  */
      this.toc_build();
    }
  }

  set_tree(array, level, depth, text, linenum) {
    //console.log("->text:" + text + " " +  depth )
    level++;
    if (level == depth) {
      array.push({
        text: text,
        depth: depth,
        child: [],
        linenum: linenum,
      });
    } else {
      if (array.length == 0) {
        array.push({
          text: text,
          depth: depth,
          child: [],
          linenum: linenum,
        });
      } else {
        this.set_tree(
          array[array.length - 1].child,
          level++,
          depth,
          text,
          linenum,
        );
      }
    }
  }

  lookup_toctree(array, level, linenum, start) {
    level++;
    for (let i = 0; i < array.length; i++) {
      //console.log(
      //  "   ".repeat(level - 1) + array[i].text + "    " + array[i].linenum,
      //);

      if (array[i].child.length > 0) {
        this.lookup_toctree(array[i].child, level, linenum, start);
      }
    }
  }

  dump_toctree(array, level) {
    level++;
    for (let i = 0; i < array.length; i++) {
      console.log(
        "   ".repeat(level - 1) + array[i].text + "    " + array[i].linenum,
      );
      if (array[i].child.length > 0) {
        this.dump_toctree(array[i].child, level);
      }
    }
  }

  /*
 lineNumberByIndex(index,string){
var char = string.indexOf(index) ;
//var line = lineOfChar(string, char) ;
 return char;
}
*/

  lineOf(substring, text) {
    var line = 1,
      matchedChars = 0;

    for (var i = 0; i < text.length; i++) {
      text[i] === substring[matchedChars] ? matchedChars++ : (matchedChars = 0);

      if (matchedChars === substring.length) {
        return line;
      }
      if (text[i] === "\n") {
        line++;
      }
    }

    return -1;
  }

  toc_build() {
    let that = this;

    function toc_callback(linkURL, linkName, moveFocus) {
      //console.log(
      //  "*updateCallback:" + linkURL + " [" + linkName + "] focus:" + moveFocus,
      //);
      let linenum = Number(linkURL.split("#")[1]);
      //console.log(linenum);
      //console.log(that.editor);
      if (isNaN(linenum)) {
        return;
      }
      that.editor.focus();
      that.editor.scrollToLine(linenum, true, true, function () {});
      that.editor.gotoLine(linenum, 0, true);
    }

    if (this.toc != null) {
      let options = {
        headerIds: false,
        mangle: false,
      };
      const lexer = new marked.Lexer(options);
      let markdown = this.editor.getValue();
      const tokens = lexer.lex(markdown);
      //console.log("building toc");
      //console.dir(tokens);

      this.toctree = [];
      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type == "heading") {
          //console.log("text:" + tokens[i].text + " " +  tokens[i].depth )
          let d = tokens[i].depth;
          //let linenum =this.lineNumberByIndex( tokens[i].raw.replace('\n',''), markdown);
          let linenum = this.lineOf(tokens[i].raw.replace("\n", ""), markdown);
          this.set_tree(this.toctree, 0, d, tokens[i].text, linenum);
        }
      }

      //this.dump_toctree(this.toctree, 0);
      let nav = this.create_toc_doc();
      this.toc.replaceChildren();
      this.toc.appendChild(nav);
      //var toc1 = document.querySelector('#toc1 nav');
      var tocnav = new TreeViewNavigation(this.toc, toc_callback);
    }
  }

  toc_subtree(parent_node, tree, label, level) {
    level++;
    let ul = document.createElement("ul");
    //ul.classList.add("treeview-navigation");
    ul.setAttribute("id", "id-about-subtree");
    ul.setAttribute("role", "group");
    ul.setAttribute("aria-label", label);
    parent_node.appendChild(ul);
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].child.length > 0) {
        let li = document.createElement("li");
        li.setAttribute("role", "none");
        ul.appendChild(li);
        let a = document.createElement("a");
        a.setAttribute("role", "treeitem");
        a.setAttribute("aria-expanded", "false");
        a.setAttribute("aria-owns", "id-about-subtree");
        //a.setAttribute("href", "#" + this.conv(tree[i].text));
        a.setAttribute("href", "#" + tree[i].linenum);
        a.setAttribute("linenum", tree[i].linenum);
        li.appendChild(a);
        //this.toc_index.push({linenum:tree[i].linenum, element:a});
        this.toc_index.push({
          linenum: tree[i].linenum,
          text: tree[i].text,
          level: level,
          subtree: true,
          element: a,
        });
        let span = document.createElement("span");
        span.classList.add("label");
        //span.textContent = this.toctree[i].text;
        a.appendChild(span);
        let span2 = document.createElement("span");
        span2.classList.add("icon");
        span.appendChild(span2);
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        svg.setAttribute("width", "13");
        svg.setAttribute("height", "10");
        svg.setAttribute("viewBox", "0 0 13 10");
        let polygon = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "polygon",
        );
        polygon.setAttribute("points", "2 1, 12 1, 7 9");
        svg.appendChild(polygon);
        span2.appendChild(svg);
        var add_text = document.createTextNode(tree[i].text);
        span.appendChild(add_text);

        this.toc_subtree(li, tree[i].child, tree[i].text, level);
      } else {
        let li = document.createElement("li");
        li.setAttribute("role", "none");
        ul.appendChild(li);
        let a = document.createElement("a");
        a.setAttribute("role", "treeitem");
        //a.setAttribute("href", "#" + this.conv(tree[i].text));
        a.setAttribute("href", "#" + tree[i].linenum);
        a.setAttribute("linenum", tree[i].linenum);
        a.setAttribute("aria-current", "page");
        li.appendChild(a);
        this.toc_index.push({
          linenum: tree[i].linenum,
          text: tree[i].text,
          level: level,
          subtree: false,
          element: a,
        });
        let span = document.createElement("span");
        span.classList.add("label");
        span.textContent = tree[i].text;
        a.appendChild(span);
      }
    }
  }

  conv(str) {
    let str2 = str.replace(" ", "-");
    let ans = str2.toLowerCase();
    return ans;
  }
  create_toc_doc() {
    this.toc_index = [];
    //let nav = document.createElement('nav');
    // nav.setAttribute('aria-label', 'TOC');
    let ul = document.createElement("ul");
    ul.classList.add("treeview-navigation");
    ul.setAttribute("role", "tree");
    ul.setAttribute("aria-label", "TOC");
    //nav.appendChild(ul);
    let level = 1;
    for (let i = 0; i < this.toctree.length; i++) {
      if (this.toctree[i].child.length > 0) {
        let li = document.createElement("li");
        li.setAttribute("role", "none");
        ul.appendChild(li);
        let a = document.createElement("a");
        a.setAttribute("role", "treeitem");
        a.setAttribute("aria-expanded", "false");
        a.setAttribute("aria-owns", "id-about-subtree");
        //a.setAttribute("href", "#" + this.conv(this.toctree[i].text));
        a.setAttribute("href", "#" + this.toctree[i].linenum);
        a.setAttribute("linenum", this.toctree[i].linenum);
        li.appendChild(a);
        //this.toc_index.push({linenum:this.toctree[i].linenum, element:a});
        this.toc_index.push({
          linenum: this.toctree[i].linenum,
          text: this.toctree[i].text,
          level: level,
          subtree: true,
          element: a,
        });
        let span = document.createElement("span");
        span.classList.add("label");
        //span.textContent = this.toctree[i].text;
        a.appendChild(span);
        let span2 = document.createElement("span");
        span2.classList.add("icon");
        span.appendChild(span2);
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        svg.setAttribute("width", "13");
        svg.setAttribute("height", "10");
        svg.setAttribute("viewBox", "0 0 13 10");
        let polygon = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "polygon",
        );
        polygon.setAttribute("points", "2 1, 12 1, 7 9");
        svg.appendChild(polygon);
        span2.appendChild(svg);
        var add_text = document.createTextNode(this.toctree[i].text);
        span.appendChild(add_text);

        this.toc_subtree(
          li,
          this.toctree[i].child,
          this.toctree[i].text,
          level,
        );
      } else {
        let li = document.createElement("li");
        li.setAttribute("role", "none");
        ul.appendChild(li);
        let a = document.createElement("a");
        a.setAttribute("role", "treeitem");
        //a.setAttribute("href", "#" + this.conv(this.toctree[i].text));
        a.setAttribute("href", "#" + this.toctree[i].linenum);
        a.setAttribute("linenum", this.toctree[i].linenum);
        a.setAttribute("aria-current", "page");
        li.appendChild(a);
        //this.toc_index.push({linenum:this.toctree[i].linenum, element:a});
        this.toc_index.push({
          linenum: this.toctree[i].linenum,
          text: this.toctree[i].text,
          level: level,
          subtree: false,
          element: a,
        });
        let span = document.createElement("span");
        span.classList.add("label");
        span.textContent = this.toctree[i].text;
        a.appendChild(span);
      }
    }
    //return nav;
    return ul;
  }

  // Reset input text
  reset() {
    let changed = editor.getValue() != defaultInput;
    if (hasEdited || changed) {
      var confirmed = window.confirm(confirmationMessage);
      if (!confirmed) {
        return;
      }
    }
    //presetValue(defaultInput);
    presetValue(editor, defaultInput);
    document
      .querySelectorAll(this.parent_id + " " + ".column")
      .forEach((element) => {
        element.scrollTo({ top: 0 });
      });
  }

  //let presetValue = (value) => {
  presetValue(value, filepath) {
    this.filepath = filepath;
    this.editor.setValue(value);
    this.editor.moveCursorTo(0, 0);
    this.editor.focus();
    this.editor.navigateLineEnd();
    this.hasEdited = false;
  }

  // ----- sync scroll position -----

  initScrollBarSync(settings) {
    let checkbox = document.querySelector(
      this.parent_id + " " + "#sync-scroll-checkbox" + this.no,
    );
    checkbox.checked = settings;
    this.scrollBarSync = settings;

    checkbox.addEventListener("change", (event) => {
      let checked = event.currentTarget.checked;
      this.scrollBarSync = checked;
      //saveScrollBarSettings(checked);
    });

    document
      .querySelector(this.parent_id + " " + "#edit" + this.no)
      .addEventListener("scroll", (event) => {
        if (!this.scrollBarSync) {
          return;
        }
        let editorElement = event.currentTarget;
        let ratio =
          editorElement.scrollTop /
          (editorElement.scrollHeight - editorElement.clientHeight);

        let previewElement = document.querySelector(
          this.parent_id + " " + "#preview" + this.no,
        );
        let targetY =
          (previewElement.scrollHeight - previewElement.clientHeight) * ratio;
        previewElement.scrollTo(0, targetY);
      });
  }
  enableScrollBarSync() {
    scrollBarSync = true;
  }

  disableScrollBarSync() {
    scrollBarSync = false;
  }

  schemeChange_dark() {
    var output = document.querySelector(
      this.parent_id + " " + "#output" + this.no,
    );
    output.classList.remove("light");
    output.classList.add("dark");

    var preview = document.querySelector(
      this.parent_id + " " + "#preview" + this.no,
    );
    preview.classList.remove("light");
    preview.classList.add("dark");
    var preview_w = document.querySelector(
      this.parent_id + " " + "#preview-wrapper" + this.no,
    );
    preview_w.classList.remove("light");
    preview_w.classList.add("dark");

    this.editor.setTheme("ace/theme/one_dark");

    var toc = document.querySelector(this.parent_id + " " + "#toc" + this.no);
    toc.classList.add("dark");
  }

  schemeChange_light() {
    var output = document.querySelector(
      this.parent_id + " " + "#output" + this.no,
    );
    output.classList.remove("dark");
    output.classList.add("light");

    var preview = document.querySelector(
      this.parent_id + " " + "#preview" + this.no,
    );
    preview.classList.remove("dark");
    preview.classList.add("light");
    var preview_w = document.querySelector(
      this.parent_id + " " + "#preview-wrapper" + this.no,
    );
    preview_w.classList.remove("dark");
    preview_w.classList.add("light");

    this.editor.setTheme("ace/theme/chrome");

    var toc = document.querySelector(this.parent_id + " " + "#toc" + this.no);
    toc.classList.remove("dark");
  }
}
