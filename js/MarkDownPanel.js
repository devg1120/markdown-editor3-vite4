import { MarkDownEditor } from "./MarkDownEditor.js";
import { Contents } from "./Contents.js";
//import { marked } from "./marked/lib/marked.esm.js";
import { marked } from "../node_modules/marked/lib/marked.esm.js";

import "./file-tree/file-tree.js";
import { FileTreeControl } from "./file-tree/fileTreeControl.js";
import "../css/file-tree.css";

export class MarkDownPanel {
  constructor(parent_id) {
    this.parent_id = parent_id;
    this.parent = document.querySelector(parent_id);
    this.hasEdited = false;
    this.scrollBarSync = false;
    this.hasEdited2 = false;
    this.scrollBarSync2 = false;

    this.localStorageNamespace = "com.markdownlivepreview";
    this.localStorageKey = "last_state";
    this.localStorageScrollBarKey = "scroll_bar_settings";
    this.confirmationMessage = this.init_html(this.parent);

    //let fc = new FileTreeControl(this);
    this.fileTreeControl = new FileTreeControl(this);

    //fc.set_ace_editor();

    this.open_button = document.querySelector(parent_id + " " + "#openfile");
    this.saveAs_button = document.querySelector(
      parent_id + " " + "#saveAsfile",
    );
    this.save_button = document.querySelector(parent_id + " " + "#savefile");
    this.filename_label = document.querySelector(parent_id + " " + "#filename");
    this.schemeToggl_button = document.querySelector(
      parent_id + " " + "#schemeToggle",
    );
    this.keybindChange_button = document.querySelector(
      parent_id + " " + "#keybindChange",
    );
    this.swap_button = document.querySelector(parent_id + " " + "#swap");
    this.split_select = document.querySelector(
      parent_id + " " + "#split-select",
    );
    this.contents_select = document.querySelector(
      parent_id + " " + "#contents-select",
    );
    this.fontsize_number = document.querySelector(
      parent_id + " " + "#fontsize-number",
    );
    this.cursor_color_select = document.querySelector(
      parent_id + " " + "#cursor-color-select",
    );
    this.separator_color_select = document.querySelector(
      parent_id + " " + "#separator-color-select",
    );
    this.toc_swtch = document.querySelector(parent_id + " " + "#tocSwtch");
    this.toc_toggle = document.querySelector(parent_id + " " + "#tocToggle");

    this.filepath = null;
    this.fileHandle = null;
    this.localFileSaveContent = "";

    let that = this;

    this.open_button.addEventListener(
      "click",
      function (ev) {
        that.openFile();
      },
      false,
    );

    this.save_button.addEventListener(
      "click",
      function (ev) {
        that.saveFile();
      },
      false,
    );

    this.saveAs_button.addEventListener(
      "click",
      function (ev) {
        that.saveAsFile();
      },
      false,
    );

    this.schemeToggl_button.addEventListener(
      "click",
      function (ev) {
        that.schemeChange();
      },
      false,
    );

    this.keybindChange_button.addEventListener(
      "click",
      function (ev) {
        that.keybindChange();
      },
      false,
    );

    this.swap_button.addEventListener(
      "click",
      function (ev) {
        that.swap();
      },
      false,
    );

    this.split_select.addEventListener(
      "change",
      function (ev) {
        that.splitting();
      },
      false,
    );

    this.contents_select.addEventListener(
      "change",
      function (ev) {
        that.content_change();
      },
      false,
    );

    this.fontsize_number.addEventListener(
      "change",
      function (ev) {
        that.fontsize_change();
      },
      false,
    );

    this.cursor_color_select.addEventListener(
      "input",
      function (ev) {
        that.cursor_color_change();
      },
      false,
    );

    this.separator_color_select.addEventListener(
      "input",
      function (ev) {
        that.separator_color_change();
      },
      false,
    );
    /*
        this.toc_swtch.addEventListener(
            "click",
            function (ev) {
                toc_switch();
            },
            false,
        );
*/
    this.toc_toggle.addEventListener(
      "click",
      function (ev) {
        that.toc_switch();
      },
      false,
    );

  this.fileTree = document.querySelector("file-tree");
   console.log(this.fileTree);

  this.fileTree.addEventListener("ready", this.onReady);

  //this.query = document.querySelector('[name="query"]');
  //this.searchResults = document.querySelector("#search-results");
  //this.searchTypes = [...document.querySelectorAll('[name="search-type"]')];

  } // end constructor

  onReady() {
  this.query = document.querySelector('[name="query"]');
  this.searchResults = document.querySelector("#search-results");
  this.searchTypes = [...document.querySelectorAll('[name="search-type"]')];
    console.log("onReady");
    console.log(this.query);
     this.query.disabled = false
  }
  init_html(parent) {
    parent.innerHTML = `

    <header>
      <div id="menu-items">
	<!--
        <div><a href="/">Markdown Live Preview</a></div>
        -->
        <label for="contents-select">ref</label>
        &ensp;
        <select id="contents-select">
          <option value="---">----</option>
        </select>
        <div id="reset-button"><a href="#">Reset</a></div>
        <div id="copy-button"><a href="#">Copy</a></div>
        <div id="sync-button1">
          <input type="checkbox" id="sync-scroll-checkbox1" /><label
            for="sync-scroll-checkbox"
            >Sync scroll</label
          >
        </div>
        <div id="sync-button2">
          <input type="checkbox" id="sync-scroll-checkbox2" /><label
            for="sync-scroll-checkbox"
            >Sync scroll</label
          >
        </div>
        <div id="sync-button3">
          <input type="checkbox" id="sync-scroll-checkbox3" /><label
            for="sync-scroll-checkbox"
            >Sync scroll</label
          >
        </div>
        &ensp; &ensp;
        <!--
	    <input type="file" id="openfile">
	     -->
        <button id="openfile">Open File</button>
        &ensp;
        <label id="filename">....</label>
        &ensp;
        <button id="savefile">Seve File</button>
        &ensp;
        <button id="saveAsfile">Seve As File</button>
        &ensp; &ensp; &ensp;
        <button id="tocSwtch">toc</button>
	<label >
		  <input id="tocToggle" type="checkbox" value="show" checked>toc
	</label>
        &ensp; &ensp; &ensp;
        <input type="number" id="fontsize-number" name="fontsize" min="16" max="40" value="20"/>
        &ensp; &ensp; &ensp;
        <button id="schemeToggle">Dark</button>
        &ensp;
        <button id="keybindChange">none</button>
        &ensp;
        <button id="swap">swap</button>
        &ensp; &ensp;
        <label>split</label>
        &ensp;
        <select name="split" id="split-select">
          <option value="">0</option>
          <option value="">2</option>
          <option value="">3</option>
        </select>
        &ensp;
        <label for="cursor-color-select">cursor</label>
        &ensp;
	<input type="color" id="cursor-color-select" name="body" value="#f6b73c" />
        &ensp;
        <label for="separator-color-select">separator</label>
        &ensp;
	<input type="color" id="separator-color-select" name="body" value="#FF8000" />
      </div>
      <div id="github">
        <a href="https://github.com/tanabe/markdown-live-preview"
          ><img src="image/GitHub-Mark-Light-32px.webp"
        /></a>
      </div>
    </header>


    <main data-flex-splitter-vertical  style="flex: auto">

         <file-tree >
          <button type="button" slot="browse-button">Open directory</button>
          <label id="topdir" slot="browse-path">-------------</label>
        </file-tree>

       <div id="search">
          <div id="search-container">
            <div class="controls">
              <div id="search-type">
                <label>
                  <input
                    type="radio"
                    name="search-type"
                    value="files"
                    checked
                  />
                  Search path-names
                </label>

                <label>
                  <input type="radio" name="search-type" value="in-files" />
                  Search in files
                </label>
              </div>
              <input
                id="search-input"
                type="text"
                name="query"
                placeholder="gsSearch"
                disabled
              />
            </div>
            <div id="search-results"></div>
          </div>
        </div>

        <div id="filetree-separator1" role="separator" tabindex="1" class="separator"></div>
      <div
        data-flex-splitter-horizontal
        id="container1"
        class="container"
        style="flex: auto"
      >

<!--
         <file-tree style="height: 100%%">
          <button type="button" slot="browse-button">Open directory</button>
          <label id="topdir" slot="browse-path">-------------</label>
        </file-tree>

        <div id="filetree-separator1" role="separator" tabindex="1" class="separator"></div>
-->
        <div id="toc1" class="toc dark" style="flex: auto">

          <!---------------------------->
          <nav aria-label="Mythical University">
          </nav>
          <!---------------------------->
        </div>

        <div id="toc-separator1" role="separator" tabindex="1" class="separator"></div>

        <div id="edit1" class="edit column" style="flex: auto">
          <div id="editor-wrapper1" class="editor-wrapper">
            <div id="editor1"></div>
          </div>
        </div>

        <div role="separator" tabindex="1" class="separator"></div>

        <div id="preview1" class="preview column dark" style="width: 50%">
          <div id="preview-wrapper1" class="preview-wrapper dark">
            <div id="output1" class="content markdown-body dark"></div>
          </div>
        </div>
      </div>

      <div
        role="separator"
        tabindex="1"
        class="separator hide"
        id="separator2"
      ></div>

      <div
        data-flex-splitter-horizontal
        id="container2"
        class="container hide"
        style="flex: auto; height: 30%"
      >
        <div id="toc2" class="toc dark" style="flex: auto">

          <!---------------------------->
          <nav aria-label="Mythical University">
          </nav>
          <!---------------------------->
        </div>

        <div id="toc-separator2" role="separator" tabindex="1" class="separator"></div>

        <div id="edit2" class="edit column" style="flex: auto">
          <div id="editor-wrapper2" class="editor-wrapper">
            <div id="editor2"></div>
          </div>
        </div>

        <div role="separator" tabindex="1" class="separator"></div>

        <div id="preview2" class="preview column dark" style="width: 50%">
          <div id="preview-wrapper2" class="preview-wrapper dark">
            <div id="output2" class="content markdown-body dark"></div>
          </div>
        </div>
      </div>

      <div
        role="separator"
        tabindex="1"
        class="separator hide"
        id="separator3"
      ></div>

      <div
        data-flex-splitter-horizontal
        id="container3"
        class="container hide"
        style="flex: auto; height: 30%"
      >
        <div id="toc3" class="toc dark" style="flex: auto">

          <!---------------------------->
          <nav aria-label="Mythical University">
          </nav>
          <!---------------------------->
        </div>

        <div id="toc-separator3" role="separator" tabindex="1" class="separator"></div>

        <div id="edit3" class="edit column" style="flex: auto">
          <div id="editor-wrapper3" class="editor-wrapper">
            <div id="editor3"></div>
          </div>
        </div>

        <div role="separator" tabindex="1" class="separator"></div>

        <div id="preview3" class="preview column dark" style="width: 50%">
          <div id="preview-wrapper3" class="preview-wrapper dark">
            <div id="output3" class="content markdown-body dark"></div>
          </div>
        </div>
      </div>
    </main>
	`;
  }
  toc_switch() {

    var toc1 = document.querySelector(this.parent_id + " " + "#toc1");
    var toc_separator1 = document.querySelector(
      this.parent_id + " " + "#toc-separator1",
    );
    var toc2 = document.querySelector(this.parent_id + " " + "#toc2");
    var toc_separator2 = document.querySelector(
      this.parent_id + " " + "#toc-separator2",
    );
    var toc3 = document.querySelector(this.parent_id + " " + "#toc3");
    var toc_separator3 = document.querySelector(
      this.parent_id + " " + "#toc-separator3",
    );

    if (this.toc_toggle.checked) {
      display(toc1, "show");
      display(toc_separator1, "show");
      display(toc2, "show");
      display(toc_separator2, "show");
      display(toc3, "show");
      display(toc_separator3, "show");
    } else {
      display(toc1, "hide");
      display(toc_separator1, "hide");
      display(toc2, "hide");
      display(toc_separator2, "hide");
      display(toc3, "hide");
      display(toc_separator3, "hide");
    }

    function display(element, op) {
      if (op == "show") {
        if (element.classList.contains("hide")) {
          element.classList.remove("hide");
        }
      } else if (op == "hide") {
        if (!element.classList.contains("hide")) {
          element.classList.add("hide");
        }
      }
    }
  }

  content_change() {
      console.log("presetValue call 5");
    this.editor1.presetValue(
      this.contents.getContent(this.contents_select.value),
	    this.detail.path
    );
  }

  cursor_color_change_() {
    //console.log("cursor_color:" + cursor_color_select.value);
    //console.log(document.styleSheets.length);
    /*
   for ( var s = 0; s < document.styleSheets.length; s++) {
       const stylesheet = document.styleSheets[s];
       console.log("");
       console.log(s);
       console.log(stylesheet.ownerNode);
       console.log(stylesheet.href);
       //console.dir(stylesheet);
       
       for ( var i = 0; i < stylesheet.cssRules.length ; i++) {
          console.log(stylesheet.cssRules[i].selectorText);
          if (stylesheet.cssRules[i].selectorText == ".ace_cursor") {
               console.dir(stylesheet.cssRules[i]);
          }
       }
   }
 */
    const stylesheet = document.styleSheets[5];
    const roule33 = document.styleSheets[5].cssRules[33];
    const roule34 = document.styleSheets[5].cssRules[34];
    roule33.style.borderLeft = "5px solid yellow";
    roule33.style.borderLeftColor = "yellow";
    roule33.style.color = "yellow";
    roule34.style.backgroundColor = "yellow";
    cursor_color_change_();
  }

  getRoule(selector) {
    for (var s = 0; s < document.styleSheets.length; s++) {
      const stylesheet = document.styleSheets[s];
      for (var i = 0; i < stylesheet.cssRules.length; i++) {
        if (stylesheet.cssRules[i].selectorText == selector) {
          return stylesheet.cssRules[i];
        }
      }
    }
    return null;
  }

  cursor_color_change() {
    let cursor_color = this.cursor_color_select.value;

    let style_order = [
      {
        selector: ".ace_cursor-layer .ace_cursor",
        style: {
          borderLeft: "5px solid $",
          borderLeftColor: "$",
          color: "$",
        },
      },
      {
        selector: ".ace_cursor-layer.ace_overwrite-cursors .ace_cursor",
        style: {
          backgroundColor: "$",
        },
      },
    ];
    for (let i = 0; i < style_order.length; i++) {
      let roule = this.getRoule(style_order[i].selector);
      if (roule == null) {
        console.log("css null:" + style_order[i].selector);
      } else {
        for (name in style_order[i].style) {
          let value = style_order[i].style[name];
          value = value.replace("$", cursor_color);
          let cmd = "roule.style." + name + '="' + value + '";';
          eval(cmd);
        }
      }
    }
  }

  separator_color_change() {
    let _color = this.separator_color_select.value;

    let style_order = [
      {
        selector: ".separator",
        style: {
          backgroundColor: "$",
        },
      },
    ];
    for (let i = 0; i < style_order.length; i++) {
      let roule = this.getRoule(style_order[i].selector);
      if (roule == null) {
        console.log("css null:" + style_order[i].selector);
      } else {
        for (name in style_order[i].style) {
          let value = style_order[i].style[name];
          value = value.replace("$", _color);
          let cmd = "roule.style." + name + '="' + value + '";';
          eval(cmd);
        }
      }
    }
  }

  fontsize_change() {
    var size = Number(this.fontsize_number.value);
    this.editor1.setFontSize(size);
    this.editor2.setFontSize(size);
    this.editor3.setFontSize(size);
  }

  splitting() {
    var container1 = document.querySelector(
      this.parent_id + " " + "#container1",
    );
    var separator2 = document.querySelector(
      this.parent_id + " " + "#separator2",
    );
    var container2 = document.querySelector(
      this.parent_id + " " + "#container2",
    );
    var separator3 = document.querySelector(
      this.parent_id + " " + "#separator3",
    );
    var container3 = document.querySelector(
      this.parent_id + " " + "#container3",
    );

    if (this.split_select.selectedIndex == 0) {
      console.log("split:0");

      display(container1, "show");
      display(separator2, "hide");
      display(container2, "hide");
      display(separator3, "hide");
      display(container3, "hide");
    } else if (this.split_select.selectedIndex == 1) {
      console.log("split:1");

      display(container1, "show");
      display(separator2, "show");
      display(container2, "show");
      display(separator3, "hide");
      display(container3, "hide");
    } else if (this.split_select.selectedIndex == 2) {
      console.log("split:2");

      display(container1, "show");
      display(separator2, "show");
      display(container2, "show");
      display(separator3, "show");
      display(container3, "show");
    }

    function display(element, op) {
      if (op == "show") {
        if (element.classList.contains("hide")) {
          element.classList.remove("hide");
        }
      } else if (op == "hide") {
        if (!element.classList.contains("hide")) {
          element.classList.add("hide");
        }
      }
    }
  }

  swap() {
    var a = document.querySelector(this.parent_id + " " + "#edit1");
    var b = document.querySelector(this.parent_id + " " + "#preview1");
    this.swap_panel(a, b);

    var a2 = document.querySelector(this.parent_id + " " + "#edit2");
    var b2 = document.querySelector(this.parent_id + " " + "#preview2");
    this.swap_panel(a2, b2);

    var a2 = document.querySelector(this.parent_id + " " + "#edit3");
    var b2 = document.querySelector(this.parent_id + " " + "#preview3");
    this.swap_panel(a2, b2);
  }

  swap_panel(a, b) {
    var p1 = a.parentNode,
      p2 = b.parentNode,
      i1,
      i2;

    if (!p1 || !p2 || p1.isEqualNode(b) || p2.isEqualNode(a)) return;

    for (var i = 0; i < p1.children.length; i++) {
      if (p1.children[i].isEqualNode(a)) {
        i1 = i;
      }
    }
    for (var i = 0; i < p2.children.length; i++) {
      if (p2.children[i].isEqualNode(b)) {
        i2 = i;
      }
    }

    if (p1.isEqualNode(p2) && i1 < i2) {
      i2++;
    }
    p1.insertBefore(b, p1.children[i1]);
    p2.insertBefore(a, p2.children[i2]);
  }

  keybindChange(e) {
    if (this.keybindChange_button.textContent == "none") {
      this.keybindChange_button.textContent = "vim";
      this.editor1.setKeyboardHandler("ace/keyboard/vim");
      this.editor2.setKeyboardHandler("ace/keyboard/vim");
      this.editor3.setKeyboardHandler("ace/keyboard/vim");
    } else if (this.keybindChange_button.textContent == "vim") {
      this.keybindChange_button.textContent = "none";
      this.editor1.setKeyboardHandler("");
      this.editor2.setKeyboardHandler("");
      this.editor3.setKeyboardHandler("");
    }
  }
  schemeChange(e) {
    if (this.schemeToggl_button.textContent == "Dark") {
      this.schemeToggl_button.textContent = "Light";

      this.editor1.schemeChange_light();
      this.editor2.schemeChange_light();
      this.editor3.schemeChange_light();
    } else if (this.schemeToggl_button.textContent == "Light") {
      this.schemeToggl_button.textContent = "Dark";

      this.editor1.schemeChange_dark();
      this.editor2.schemeChange_dark();
      this.editor3.schemeChange_dark();
    }
  }

  //    editor.setFontSize(14);
  //
  async openFile() {
    const pickerOpts = {
      types: [
        {
          description: "Markdown",
          accept: {
            "text/markdown": [".md"],
          },
        },
      ],
      excludeAcceptAllOption: true,
      multiple: false,
    };

    //const [fileHandle] = await window.showOpenFilePicker(pickerOpts);
    [this.fileHandle] = await window.showOpenFilePicker(pickerOpts);

    this.filepath = await this.fileHandle.getFile();

    console.log(this.filepath.name);
    this.filename_label.innerText = " [ " + this.filepath.name + " ] ";

    var reader = new FileReader();
    //console.dir(this.filepath);
    reader.readAsText(this.filepath);
    let that = this;
    reader.onload = function (e) {
      let input = reader.result;
      //presetValue(input);
      //presetValue(editor, input);
      console.log("presetValue call 1");
      that.editor1.presetValue(input);
      document
        .querySelectorAll(this.parent_id + " " + ".column")
        .forEach((element) => {
          element.scrollTo({ top: 0 });
        });
      that.localFileSaveContent = input;
      that.diff_ck_localFileSaveContent(input);
    };
  }

  async openFileHandle(detail) {
    console.log("openFIleHandle detail: ", detail);
    /*
        const pickerOpts = {
            types: [
                {
                    description: "Markdown",
                    accept: {
                        "text/markdown": [".md"],
                    },
                },
            ],
            excludeAcceptAllOption: true,
            multiple: false,
        };

        //const [fileHandle] = await window.showOpenFilePicker(pickerOpts);
        [this.fileHandle] = await window.showOpenFilePicker(pickerOpts);
         */

    this.detail = detail;
    this.fileHandle = detail.handle;
    console.log("*** MarkDownPanel:fn: ", this.fileHandle);
    console.log("*** MarkDownPanel:fn: ", this.detail.path);

    this.filepath = await this.fileHandle.getFile();

    //console.log("Open",this.filepath.name);
    this.filename_label.innerText = " [ " + this.filepath.name + " ] ";

    var reader = new FileReader();
    //console.dir(this.filepath);
    reader.readAsText(this.filepath);
    let that = this;
    reader.onload = function (e) {
      let input = reader.result;
      //presetValue(input);
      //presetValue(editor, input);
      console.log("presetValue call 2", that.detail);
      that.editor1.presetValue(input, that.detail.path);
      document
        .querySelectorAll(this.parent_id + " " + ".column")
        .forEach((element) => {
          element.scrollTo({ top: 0 });
        });
      that.localFileSaveContent = input;
      that.diff_ck_localFileSaveContent(input);
    };
  }
  async saveAsFile() {
    const saveFileOptions = {
      types: [
        {
          description: "Markdown",
          accept: {
            "text/markdown": [".md"],
          },
        },
      ],
    };

    let value = this.editor1.getValue();
    const newHandle = await window.showSaveFilePicker(saveFileOptions);

    const writableStream = await newHandle.createWritable();

    await writableStream.write(value);

    await writableStream.close();

    this.localFileSaveContent = value;
    this.diff_ck_localFileSaveContent(value);
    /********************************************/
    this.filepath = await newHandle.getFile();

    //console.log(this.filepath.name);
    this.filename_label.innerText = " [ " + this.filepath.name + " ] ";
    this.fileHandle = newHandle;
  }

  async saveFile() {
    if (this.filepath == null) {
      alert("filepath null!!!");
      return;
    }
    let value = this.editor1.getValue();
    //const newHandle = await window.showSaveFilePicker(saveFileOptions);

    const writableStream = await this.fileHandle.createWritable();

    await writableStream.write(value);

    await writableStream.close();
    this.localFileSaveContent = value;
    this.diff_ck_localFileSaveContent(value);
  }

  sessionSync(editor1, editor2) {
    editor2.editor.setSession(editor1.editor.getSession());
    let value = editor2.getValue();
    //convert(editor2.editor.preview_id, value);
    editor2.convert(editor2.editor.preview_id, value);
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
      console.log("presetValue call 3");
    presetValue(editor, defaultInput);
    document
      .querySelectorAll(this.parent_id + " " + ".column")
      .forEach((element) => {
        element.scrollTo({ top: 0 });
      });
  }

  //let presetValue = (value) => {
  presetValue(editor, value) {
    this.editor.setValue(value);
    this.editor.moveCursorTo(0, 0);
    this.editor.focus();
    this.editor.navigateLineEnd();
    this.hasEdited = false;
  }

  // ----- sync scroll position -----

  initScrollBarSync(settings) {
    let checkbox = document.querySelector(
      this.parent_id + " " + "#sync-scroll-checkbox",
    );
    checkbox.checked = settings;
    scrollBarSync = settings;

    checkbox.addEventListener("change", (event) => {
      let checked = event.currentTarget.checked;
      scrollBarSync = checked;
      saveScrollBarSettings(checked);
    });

    document
      .querySelector(this.parent_id + " " + "#edit")
      .addEventListener("scroll", (event) => {
        if (!scrollBarSync) {
          return;
        }
        let editorElement = event.currentTarget;
        let ratio =
          editorElement.scrollTop /
          (editorElement.scrollHeight - editorElement.clientHeight);

        let previewElement = document.querySelector(
          this.parent_id + " " + "#preview",
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

  // ----- sync scroll position 2-----
  //
  initScrollBarSync2(settings) {
    let checkbox = document.querySelector(
      this.parent_id + " " + "#sync-scroll-checkbox2",
    );
    checkbox.checked = settings;
    scrollBarSync2 = settings;

    checkbox.addEventListener("change", (event) => {
      let checked = event.currentTarget.checked;
      scrollBarSync2 = checked;
      saveScrollBarSettings(checked);
    });

    document
      .querySelector(this.parent_id + " " + "#edit2")
      .addEventListener("scroll", (event) => {
        if (!scrollBarSync2) {
          return;
        }
        let editorElement = event.currentTarget;
        let ratio =
          editorElement.scrollTop /
          (editorElement.scrollHeight - editorElement.clientHeight);

        let previewElement = document.querySelector(
          this.parent_id + " " + "#preview2",
        );
        let targetY =
          (previewElement.scrollHeight - previewElement.clientHeight) * ratio;
        previewElement.scrollTo(0, targetY);
      });
  }

  enableScrollBarSync2() {
    scrollBarSync2 = true;
  }

  disableScrollBarSync2() {
    scrollBarSync2 = false;
  }

  // ----- clipboard utils -----

  copyToClipboard(text, successHandler, errorHandler) {
    navigator.clipboard.writeText(text).then(
      () => {
        successHandler();
      },

      () => {
        errorHandler();
      },
    );
  }

  notifyCopied() {
    let labelElement = document.querySelector(
      this.parent_id + " " + "#copy-button a",
    );
    labelElement.innerHTML = "Copied!";
    setTimeout(() => {
      labelElement.innerHTML = "Copy";
    }, 1000);
  }

  // ----- setup -----

  // setup navigation actions
  setupResetButton() {
    document
      .querySelector(this.parent_id + " " + "#reset-button")
      .addEventListener("click", (event) => {
        event.preventDefault();
        reset();
      });
  }

  setupCopyButton(editor) {
    document
      .querySelector(this.parent_id + " " + "#copy-button")
      .addEventListener("click", (event) => {
        event.preventDefault();
        let value = editor.getValue();
        copyToClipboard(
          value,
          () => {
            notifyCopied();
          },
          () => {
            // nothing to do
          },
        );
      });
  }

  // ----- local file save check -----
  diff_ck_localFileSaveContent(content) {
    if (this.localFileSaveContent != content) {
      if (this.save_button.classList.contains("diff")) {
      } else {
        this.save_button.classList.add("diff");
      }
    } else {
      if (this.save_button.classList.contains("diff")) {
        this.save_button.classList.remove("diff");
      } else {
      }
    }
  }
  // ----- local state -----

  loadLastContent() {
    let lastContent = Storehouse.getItem(
      localStorageNamespace,
      localStorageKey,
    );
    return lastContent;
  }

  saveLastContent(content) {
    let expiredAt = new Date(2099, 1, 1);
    Storehouse.setItem(
      this.localStorageNamespace,
      this.localStorageKey,
      this.content,
      this.expiredAt,
    );
  }

  loadScrollBarSettings() {
    let lastContent = Storehouse.getItem(
      this.localStorageNamespace,
      this.localStorageScrollBarKey,
    );
    return lastContent;
  }

  saveScrollBarSettings(settings) {
    let expiredAt = new Date(2099, 1, 1);
    Storehouse.setItem(
      this.localStorageNamespace,
      this.localStorageScrollBarKey,
      settings,
      expiredAt,
    );
  }

  // ----- entry point -----
  /*
    let lastContent = loadLastContent();
    let editor = setupEditor();
    if (lastContent) {
        presetValue(lastContent);
    } else {
        presetValue(defaultInput);
    }
*/

  update_sync(value) {
    //console.log("update_sync");
    this.diff_ck_localFileSaveContent(value);
    this.saveLastContent(value);
  }

  change_file(href) {
    console.log("change_file::", this.filepath.name, href);
    this.fileTreeControl.openFileByPath(href);
    //this.fileTreeControl.openFileByPath(href.slice(1));
  }

  init(content) {
    this.contents = new Contents();

    let names = this.contents.getNamelist();

    for (let i = 0; i < names.length; i++) {
      //console.log(names[i]);
      let name = names[i];
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      this.contents_select.appendChild(option);
    }

    function test_callback(linkURL, linkName, moveFocus) {
      console.log(
        "*updateCallback:" + linkURL + " [" + linkName + "] focus:" + moveFocus,
      );
    }

    var toc1 = document.querySelector(this.parent_id + " " + "#toc1 nav");
    //var toc1tree = new TreeViewNavigation(toc1, test_callback);

    var toc2 = document.querySelector(this.parent_id + " " + "#toc2 nav");
    //var toc2tree = new TreeViewNavigation(toc2, test_callback);

    var toc3 = document.querySelector(this.parent_id + " " + "#toc3 nav");
    //var toc3tree = new TreeViewNavigation(toc3, test_callback);

    //let editor = new MarkDownEditor(update_sync, 1);
    this.editor1 = new MarkDownEditor(
      this.parent_id,
      "editor1",
      //this.update_sync,
      this,
      1,
      "editor1",
      "output1",
      //this.change_file,
      this,
    );
    //editor1.presetValue(defaultInput);
    //this.editor1.presetValue(this.contents.getContent("content1"));
      console.log("presetValue call 4");
    this.editor1.presetValue(this.contents.getContent(content));
    this.contents_select.options[1].selected = true;

    let scrollBarSettings = this.loadScrollBarSettings() || false;
    this.editor1.initScrollBarSync(scrollBarSettings);

    this.editor2 = new MarkDownEditor(
      this.parent_id,
      "editor2",
      //this.update_sync,
      this,
      2,
      "editor2",
      "output2",
    );
    this.editor2.initScrollBarSync(scrollBarSettings);

    this.sessionSync(this.editor1, this.editor2);

    this.editor3 = new MarkDownEditor(
      this.parent_id,
      "editor3",
      //this..update_sync,
      this,
      3,
      "editor3",
      "output3",
    );
    this.editor3.initScrollBarSync(scrollBarSettings);

    this.sessionSync(this.editor1, this.editor3);
    this.editor1.setToc(toc1);
    this.editor2.setToc(toc2);
    this.editor3.setToc(toc3);
  }
} // class end
