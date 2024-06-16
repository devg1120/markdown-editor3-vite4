import { MarkDownPanel } from "./MarkDownPanel.js";
import * as S from "./storehouse.js";

/*
let base1 = document.querySelector("#markdown-editor1");
let mp1 = new MarkDownPanel(base1);
mp1.init();

let base2 = document.querySelector("#markdown-editor2");
let mp2 = new MarkDownPanel(base2);
mp2.init();
*/
let mp1 = new MarkDownPanel("#markdown-editor1");
mp1.init("content1");

//let mp2 = new MarkDownPanel("#markdown-editor2");
//mp2.init("content2");

//let mp3 = new MarkDownPanel("#markdown-editor3");
//mp3.init("content3");
