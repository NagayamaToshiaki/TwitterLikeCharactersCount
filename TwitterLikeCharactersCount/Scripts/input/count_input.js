"use strict";
/* URLの文字長です。 */
const UrlWeight = 23;
/* 日中韓の文字長です。 */
const CJKWeight = 2;

/* 日中韓の文字を表す正規表現です。 */
const regexCjks = /([\p{Script=Katakana}\p{Script=Hiragana}\p{Script=Han}\p{Script=Hangul}\u{3000}-\u{303F}\u{FE30}-\u{FE4F}]+)/u;

/* 文中のURLを表す正規表現です。https://qiita.com/nagimaruxxx/items/c2f186a2df5e32233122 を参考に作成しました。 */
const regexUrl = /(https?:\/\/[-_.!~*'()a-zA-Z0-9;\/?:@&=+\$,%#]+)/;

/* 分割文字を表す正規表現です。 */
const splitter = /((?:[\p{Script=Katakana}\p{Script=Hiragana}\p{Script=Han}\p{Script=Hangul}\u{3000}-\u{303F}\u{FE30}-\u{FE4F}]+)|(?:\s+))/gmu;

/**
 * ローマ字入力時に走るイベントハンドラです。
 * @param {event} e イベント。
*/
const onInput = (e) => {
    if (!e.isComposing) {
        countInput(e.target);
    }
}

/**
 * 日本語入力時に走るイベントハンドラです。
 * @param {event} e イベント。
*/
const onCompositionEnd = (e) => {
    countInput(e.target);
}

/**
 * 送信時に走るイベントハンドラです。
 * @param {event} e イベント。
*/
const onSubmit = (e) => {
    e.preventDefault();
    let map = transpose();
    let transposeDoesntHaveExceededInputs = true;
    for(const [key, value] of map) {
        if(!value) {
            transposeDoesntHaveExceededInputs = false;
            addExceededValidation(key);
        } else {
            removeExceededValidation(key);
        }
    }

    if(transposeDoesntHaveExceededInputs){
        e.target.submit();
    }
}


/**
 * イベントを発生させたinput要素の文字数をカウントします。
 * @param {HtmlElement} target イベント発生要素 
 */
const countInput = (target) => {
    const counterId = target.id.substring(0, target.id.indexOf("_editor")) + "_counter";
    const counter = document.getElementById(counterId);
    const cjk = /[\p{Script=Katakana}\p{Script=Hiragana}\p{Script=Han}\p{Script=Hangul}\u{3000}-\u{303F}\u{FE30}-\u{FE4F}]/gu;
    const split = splitStrings(target.innerText);
    let length = 0;
    for (const str of split) {
        length += countString(str);
    }
    const dataMaxLength = target.dataset.maxLength;
    if (dataMaxLength) {
        if (length > dataMaxLength) {
            separateExcessiveInput(target, dataMaxLength);
            counter.parentElement.classList.add("text-danger");
        } else {
            const span = target.querySelector("span");
            if(span) {
                separateExcessiveInput(target, dataMaxLength);
            }
            counter.parentElement.classList.remove("text-danger");
        }
    }
    counter.textContent = Math.ceil(length / 2);
}

/**
 * 入力された内容から、最大文字数を超えた部分をspanに切り分けます。
 * @param {HtmlElement} target 入力
 * @param {Number} dataMaxLength 文字列の最大長
*/
const separateExcessiveInput = (target, dataMaxLength) => {
    const selection = window.getSelection();
    const anchorParent = selection.anchorNode.parentElement;
    let anchorOffset = selection.anchorOffset;
    const stringData = target.innerText;
    let count = 0;
    let previousCount = 0;
    let exceeded = "";
    let nonexceeded = "";
    let isExceeded = false;
    let splitStringData = splitStrings(stringData);
    for(const str of splitStringData) {
        count += countString(str);
        if(count > dataMaxLength) {
            if(regexUrl.test(str) || isExceeded){
                exceeded += str;
            } else {
                let amount = dataMaxLength - previousCount;
                if(regexCjks.test(str)) {
                    amount /= CJKWeight;
                }
                const exceededInput = str.substring(amount);
                const nonexceededInput = str.substring(0, amount);
                exceeded += exceededInput;
                nonexceeded += nonexceededInput;
            }
            isExceeded = true;
        } else {
            nonexceeded += str;
        }
        previousCount = count;
    }
    // バッファの内容をテンプレートに入力する
    target.textContent = nonexceeded;
    let template;
    if(exceeded) {
        const templateId = target.id.substring(0, target.id.indexOf("_editor")) + "_template";
        template = document.getElementById(templateId).content.cloneNode(true).querySelector("span");
        const exceededNode = document.createTextNode(exceeded);
        template.appendChild(exceededNode);
        target.appendChild(template);
    } else {
        target.replaceChildren(nonexceeded);
    }
    let anchorNode;
    if(anchorOffset > nonexceeded.length){
        anchorOffset -= nonexceeded.length;
        anchorNode = target.querySelector("span").firstChild;
    } else if(anchorParent.tagName == "SPAN") {
        anchorNode = target.querySelector("span").firstChild;
    }
    else {
        anchorNode = target.firstChild;
    }
    selection.collapse(anchorNode, anchorOffset); // rangeを指定しなくとも、この書き方なら一発で指定できる。
    target.focus();
    console.log(selection);
}

/* 文字数を「CJK文字」「URL」「それ以外」毎の方法で数えます。
 * @param {String} str 計測したい文字列
 * returns {Number} 文字列の長さ
*/
const countString = (str) => {
    if(regexUrl.test(str)) {
        return UrlWeight;
    } else if(regexCjks.test(str)) {
        return CJKWeight * str.length;
    } else {
        return str.length;
    }

}

/* 文字列を「CJK文字」「空白」「URL」「それ以外」に分けます。
 * @param {String} stringData 分けたい文字列
 * returns {[String]} 分類された配列
*/
const splitStrings = (stringData) => {
    const split = stringData.split(splitter);
    let splitStringData = [];
    for(const s of split) {
        splitStringData.push(s.split(regexUrl));
    }
    splitStringData = splitStringData.flat().filter(Boolean);
    return splitStringData;
}

/**
 * クリップボードのテキストのみをペーストします。
 * @param {e} event イベント。
*/
const cleanPaste = (e) => {
    const paste = (e.clipboardData || window.clipboardData).getData("text");

    const selection = window.getSelection();
    if (!selection.rangeCount) return false;
    selection.deleteFromDocument();
    selection.getRangeAt(0).insertNode(document.createTextNode(paste));

    let anchorNode = selection.anchorNode;
    if(anchorNode.nodeType != 1) {
        anchorNode = anchorNode.parentElement;
    }

    countInput(anchorNode);

    e.preventDefault();
}

/**
 * 入力ボックスの内容をフォーム送信用入力に移します。
 * returns {Map<string, bool>} 入力の状況を示したMap。
*/
const transpose = () => {
    const editors = document.getElementsByClassName("editor");
    let editorNonexceededMap = new Map();
    for(const editor of editors) {
        const inputId = editor.id.substring(0, editor.id.indexOf("_editor"));
        if(editor.childNodes.length > 1) {
            editorNonexceededMap.set(inputId, false);
            continue;
        }
        const input = document.getElementById(inputId);
        input.value = editor.textContent;
        editorNonexceededMap.set(inputId, true);
    }
    return editorNonexceededMap;
}

const addExceededValidation = (key) => {
    const validation = document.querySelector(`[data-valmsg-for="${key}"]`);
    validation.textContent = "最大文字数を超過しています。";
}

const removeExceededValidation = (key) => {
    const validation = document.querySelector(`[data-valmsg-for="${key}"]`);
    while(validation.firstChild){
        validation.removeChild(validation.lastChild);
    }
}

const editors = document.getElementsByClassName("editor");
for(const editor of editors) {
    editor.addEventListener("input", onInput);
    editor.addEventListener("compositionend", onCompositionEnd);
    editor.addEventListener("paste", cleanPaste);
}

const form = document.getElementById("form");
form.addEventListener("submit", onSubmit);