class Key { 
  public en: string;
  public ru: string;
  public shiftEn: string;
  public shiftRu: string;
  
  public width: number;
  readonly eventCode: string;

  constructor({
    en, ru  = '',
    shiftEn = '',
    shiftRu = '',
    eventCode,
    width = 1
  }) {
    if (!eventCode) 
        throw new Error('Specify eventCode at "Key" class!')
    
    this.en = en;
    this.ru = ru === en ? '' : ru;
    this.shiftEn = shiftEn;
    this.shiftRu = shiftRu === shiftEn ? '' : shiftRu;
    this.eventCode = eventCode;
    this.width = width;
  }
}

interface KeyboardF {
  keys: Key[][]
}

class KeyboardDrawer implements KeyboardF {

  constructor(
    public keys: Key[][]
  ) { }

  private sizesCSS = {
    "0.5" : "k-0-5",
    "1"   : "k-1"  ,
    "1.5" : "k-1-5",
    "2"   : "k-2"  ,
    "2.5" : "k-2-5",
    "3"   : "k-3"  ,
    "3.5" : "k-3-5",
    "4"   : "k-4"  ,
    "4.5" : "k-4-5",
    "5"   : "k-5"  ,
  }

  private specialKeyCSS = {
    "Enter"      : "k--j-right",
    "Tab"        : "k--j-left" ,
    "Backspace"  : "k--j-right",
    "ShiftLeft"  : "k--j-left" ,
    "ShiftRight" : "k--j-right",
  }

  getKeyHTML(
    EN: string, RU: string, shiftEN: string, shiftRU: string, keyWidth: number, eventCode: string
  ): string {
    if ( RU === EN ) RU = '';
    if ( RU === shiftRU.toLowerCase() ) { RU = shiftRU; shiftRU = '' }
    if ( EN === shiftEN.toLowerCase() ) { EN = shiftEN; shiftEN = '' }

    const getKeyHTML = (innerHTML, sizeCSS: string, specialCSS: string = '') =>
    `<button class="key bubbly-button ${sizeCSS} ${specialCSS}" data-event-code="${eventCode}">${innerHTML}</button>`;
    
    const getKeyEN      = (innerHTML: any) => !innerHTML ? '' : `<span class="k-en">${innerHTML}</span>`;
    const getKeyRU      = (innerHTML: any) => !innerHTML ? '' : `<span class="k-ru">${innerHTML}</span>`;
    const getKeyShiftEN = (innerHTML: any) => !innerHTML ? '' : `<span class="k-shift-en">${innerHTML}</span>`;
    const getKeyShiftRU = (innerHTML: any) => !innerHTML ? '' : `<span class="k-shift-ru">${innerHTML}</span>`;

    const innerKey = getKeyEN(EN) + getKeyRU(RU) + getKeyShiftEN(shiftEN) + getKeyShiftRU(shiftRU);
    return getKeyHTML(innerKey, this.sizesCSS[keyWidth] || this.sizesCSS[1], this.specialKeyCSS[eventCode] || '');
  }

  getKeysRow(innerHTML: string): string {
    return `<div class="flex-row">${innerHTML}</div>`;
  }

  drawKeyboard(root: HTMLElement, doEvents: Boolean = true): void {
    const keyboard = document.createElement('template');

    for (let line of keys) {
      let row = "";
      for (let key of line) {
        let { en, ru, shiftEn, shiftRu, width, eventCode } = key;
        row += this.getKeyHTML(en, ru, shiftEn, shiftRu, width, eventCode);
      }
      keyboard.innerHTML += this.getKeysRow(row);
    }

    root.appendChild(keyboard.content);
    if (doEvents) this.startEvents();
  }

  /* ANIMATION EVENTS */

  private specialActiveCSS = {
    "CapsLock": "k-caps--active",
  }

  private swapSpecialActiveCSS(key: HTMLElement) {
    let eventCode = key.dataset.eventCode;
    if (eventCode in this.specialActiveCSS) {
      let activeClass = this.specialActiveCSS[eventCode];
      if (key.classList.contains(activeClass)) {
        key.classList.remove(activeClass);
      } else key.classList.add(activeClass);
    }
  }

  private clickActiveCSS = {
    "AltLeft"      : false,
    "AltRight"     : false,
    "ShiftLeft"    : false,
    "ShiftRight"   : false,
    "ControlLeft"  : false,
    "ControlRight" : false,
  }

  private removeClickActiveCSS() {
    for (let eventCode in this.clickActiveCSS) {
      let element: HTMLElement = document.querySelector(`[data-event-code=${eventCode}]`);
      if(element && this.clickActiveCSS[eventCode]) this.endKeyAnimation(element);
      this.clickActiveCSS[eventCode] = false;
    }
  }

  animateKey(key: HTMLElement) {
    this.startKeyAnimation(key);
    this.endKeyAnimation(key);
  } 
  startKeyAnimation(key: HTMLElement) {    
    key.classList.add('active');
  } 
  endKeyAnimation(key: HTMLElement) {
    key.classList.add('animate');
    setTimeout(() => key.classList.remove('active'), 100);
    setTimeout(() => key.classList.remove('animate'), 700);
  }

  /**
   * RECURSION LEVEL: 1
   */
  private getParentTarget(currentNode: HTMLElement): [string, HTMLElement] {
    let eventCode, target;
    if (currentNode.dataset.eventCode) {
      target = currentNode;
      eventCode = currentNode.dataset.eventCode;
    } else if (currentNode.parentNode.dataset.eventCode) {
      target = currentNode.parentNode;
      eventCode = currentNode.parentNode.dataset.eventCode;
    }
    return [eventCode, target];
  }

  private isClickActiveCombination() {
    let toCompare = [
      [ this.clickActiveCSS["ShiftLeft"]   , this.clickActiveCSS["ShiftRight"]   ],
      [ this.clickActiveCSS["ControlLeft"] , this.clickActiveCSS["ControlRight"] ],
    ];
    return toCompare.reduce((bool, subarray) => bool && subarray.includes(true), true);
  }

  private startEvents() {
    const handleClickEvent = e => {
      const [eventCode, target] = this.getParentTarget(e.target);
      if (!eventCode) return;
      if (eventCode in this.clickActiveCSS) {
        this.clickActiveCSS[eventCode] = !this.clickActiveCSS[eventCode];
        if (this.isClickActiveCombination()) {
          this.animateKey(target);
          this.removeClickActiveCSS();  
        } else if (this.clickActiveCSS[eventCode]) this.startKeyAnimation(target);
        else this.endKeyAnimation(target);
      } else {
        this.animateKey(target);
        this.removeClickActiveCSS();
      } this.swapSpecialActiveCSS(target);
    }; 
    document.addEventListener('click', handleClickEvent);

    const handleKeyDown = e => {
      let target: HTMLElement = document.querySelector(`[data-event-code="${e.code}"]`);
      if (target) this.startKeyAnimation(target);
    }; 
    document.addEventListener('keydown', handleKeyDown);

    const handleKeyUp = e => {
      let target: HTMLElement = document.querySelector(`[data-event-code=${e.code}]`);
      if (this.specialActiveCSS[e.code]) this.swapSpecialActiveCSS(target);
      if (target) this.endKeyAnimation(target);
      this.removeClickActiveCSS();
    }; 
    document.addEventListener('keyup', handleKeyUp);

    window.onblur = function() {
      let activeElements = document.querySelectorAll(`.active[data-event-code]`);
      activeElements.forEach(el => el.classList.remove('active'));
    };
  }
}

class KeyboardEventHandler implements KeyboardF {
  
  private flatKeys: Key[];
  private eventCodes: string[];

  private output: HTMLTextAreaElement;
  private keysLayoutInfo: HTMLElement;

  private modifiers = {
    "AltLeft": false,
    "AltRight": false,
    "ShiftLeft": false,
    "ShiftRight": false,
    "ControlLeft": false,
    "ControlRight": false,
  };

  private activatable = {
    "CapsLock": false
  }

  private specialBehavior = {
    "Backspace": () => {
      const start = this.output.selectionStart;
      const end = this.output.selectionEnd;
      if (start === end) {
        this.output.value = 
          this.output.value.slice(0, start - 1) 
          + 
          this.output.value.slice(end);
      } else this.type('');
    },
    "Tab": () => {
      this.type('    ');
    },
    "Enter": () => this.type("\n"),
    
    "ArrowUp": () => {
      const end = this.output.selectionEnd;
      this.specialBehavior.arrowSelect([0, end], [0, 0]);
    },
    "ArrowDown": () => {
      const length = this.output.value.length;
      const start = this.output.selectionStart;
      this.specialBehavior.arrowSelect([start, length], [length, length]);
    },
    "ArrowLeft": () => {
      const start = this.output.selectionStart;
      const end = this.output.selectionEnd;
      this.specialBehavior.arrowSelect([start - 1, end], [start - 1, start - 1]);
    },
    "ArrowRight": () => {
      const start = this.output.selectionStart;
      const end = this.output.selectionEnd;
      this.specialBehavior.arrowSelect([start, end + 1], [end + 1, end + 1]);
    },

    arrowSelect: (onSelect: [number, number], nonSelect: [number, number]): void => {
      const [start1, end1] = onSelect; const [start2, end2] = nonSelect;
      
      const length = this.output.value.length;
      const start = this.output.selectionStart;
      const end = this.output.selectionEnd;

      if (
        (start !== end
          || this.modifiers["ShiftLeft"]
          || this.modifiers["ShiftRight"]
          ) && end - start !== length
      ) this.output.setSelectionRange(start1, end1);
      else this.output.setSelectionRange(start2, end2);
    }
  }

  private resetModifiers() {
    for (let modifier in this.modifiers) {
      if (this.modifiers[modifier])
        this.modifiers[modifier] = false;
    }
  }

  private currentLanguage: "EN" | "RU" = "EN";
  private keyCombination = new Set();

  constructor(
    private _keys: Key[][]
  ) { 
    this.flatKeys = _keys.flat();
    this.eventCodes = this.flatKeys.map(el => el.eventCode);
  }
  
  get keys() {
    return this._keys;
  }
  set keys(keys: Key[][]) {
    this._keys = keys;
    this.flatKeys = keys.flat();
    this.eventCodes = this.flatKeys.map(el => el.eventCode);
  }

  private findKey(eventCode: string) {
    let index = this.eventCodes.indexOf(eventCode);
    if (index !== -1) return this.flatKeys[index];
    return null; 
  }

  private type(value: any): void {
    if (!this.output) throw new Error('No textarea output Element');
    const start = this.output.selectionStart;
    const end = this.output.selectionEnd;
    let offset = start + value.length;
    this.output.value = 
      this.output.value.slice(0, start)
      + value +
      this.output.value.slice(end);
    this.output.setSelectionRange(offset, offset);
  }

  private typeKey(key: Key, lang: "EN" | "RU") {
    if (this.activatable["CapsLock"]) {
      if (key.en.toUpperCase() === key.shiftEn) {
        if (lang === "EN") this.type(key.shiftEn);
        if (lang === "RU") this.type(key.shiftRu);
      } else {
        if (lang === "EN") this.type(key.en);
        if (lang === "RU") this.type(key.ru);
      }
    } else if (this.modifiers["ShiftLeft"] || this.modifiers["ShiftRight"]) {
      if (lang === "EN") this.type(key.shiftEn);
      if (lang === "RU") this.type(key.shiftRu);
    } else {
      if (lang === "EN") this.type(key.en);
      if (lang === "RU") this.type(key.ru);
    }
  }
  
  private handleClick = (e: Event) => {
    const eventCode = e.target.dataset.eventCode ||
      e.target.parentNode.dataset.eventCode;
    if (!eventCode) return; 
    this.output.focus();
    if (eventCode in this.modifiers) {
      this.modifiers[eventCode] = !this.modifiers[eventCode];
      this.combinationHandler(eventCode, true);
      // this.resetModifiers(); this.keyCombination.clear();
    } else if (eventCode in this.activatable) {
      this.activatable[eventCode] = !this.activatable[eventCode];
    } else if (eventCode in this.specialBehavior) {
      this.specialBehavior[eventCode]();
      this.resetModifiers(); 
      this.keyCombination.clear();
    } else {
      const key = this.findKey(eventCode);
      if(!this.combinationHandler(eventCode, true)) {
        if (this.currentLanguage === "EN") this.typeKey(key, "EN");
        if (this.currentLanguage === "RU") this.typeKey(key, "RU");
      }
      // this.resetModifiers(); this.keyCombination.clear();
    }
  }

  private previousTimeout: number;
  private previousInterval: number;

  private handleMouseDown = e => {
    const DELAY = 500, INTERVAL = 50;
    this.previousTimeout = setTimeout(() => {
      this.previousInterval = setInterval(() => {
        this.handleClick(e);
      }, INTERVAL)
    }, DELAY)
  }

  private handleMouseUp = e => {
    clearInterval(this.previousInterval);
    clearTimeout(this.previousTimeout);
  }

  private handleKeyDown = e => {
    this.output.focus();
    if (e.code in this.modifiers) 
      this.modifiers[e.code] = true;
    this.combinationHandler(e.code, false);
  }

  private handleKeyUp = e => {
    if (e.code in this.activatable)
      this.activatable[e.code] = !this.activatable[e.code];
    else if (e.code in this.modifiers) this.modifiers[e.code] = false;
    this.keyCombination.delete(e.code);
  }

  private combinationHandler(eventCode: string, isReset: Boolean): Boolean {
    this.keyCombination.add(eventCode);
    const reset = (): true => { 
      if (isReset) {
        this.resetModifiers(); 
        this.keyCombination.clear();
      } return true }

    if (this.keyCombination.size === 2) {
      if (this.keyCombination.has("ControlLeft")) {
        if (this.keyCombination.has("KeyA")) {
          this.output.select();
          return reset();
        }

        if (this.keyCombination.has("ShiftLeft")) {
          this.changeLayout();
          return reset();
        }
      }
    }

    return false;
  }

  private changeLayout = () => {
    this.currentLanguage = this.currentLanguage === "EN" ? "RU" : "EN";
    this.keysLayoutInfo.innerText = this.currentLanguage;
  }
  
  startEvents(output: HTMLTextAreaElement, keysLayoutInfo: HTMLElement) {
    this.output = output; this.keysLayoutInfo = keysLayoutInfo;
    keysLayoutInfo.addEventListener('click', this.changeLayout);
    
    document.addEventListener('click', this.handleClick);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('mousedown', this.handleMouseDown);

    document.addEventListener('keyup', this.handleKeyUp);
    document.addEventListener('keydown', this.handleKeyDown);
  }

}

class Keyboard implements KeyboardF {
  
  public drawer: KeyboardDrawer;
  public handler: KeyboardEventHandler;

  constructor(
    public keys: Key[][],
    private keysRoot: HTMLElement,
    keysLayoutInfo: HTMLElement,
    typeOutput: HTMLTextAreaElement
  ) {
    this.drawer = new KeyboardDrawer(keys);
    this.drawer.drawKeyboard(keysRoot);
    this.handler = new KeyboardEventHandler(keys);
    this.handler.startEvents(typeOutput, keysLayoutInfo);
  }

  hideKeyboard() {
    if (this.keysRoot.classList.contains('hide')) {
      this.handler.output.focus();
      this.keysRoot.classList.remove('hide');
    } else this.keysRoot.classList.add('hide');
  }
}

const Backquote    = new Key({ en: '`'          ,  ru: ''           ,  shiftEn: '~' ,  shiftRu: 'Ё' ,  eventCode: 'Backquote'    ,  width: 1   });
const Digit1       = new Key({ en: '1'          ,  ru: ''           ,  shiftEn: '!' ,  shiftRu: ''  ,  eventCode: 'Digit1'       ,  width: 1   });
const Digit2       = new Key({ en: '2'          ,  ru: ''           ,  shiftEn: '@' ,  shiftRu: '"' ,  eventCode: 'Digit2'       ,  width: 1   });
const Digit3       = new Key({ en: '3'          ,  ru: ''           ,  shiftEn: '#' ,  shiftRu: '№' ,  eventCode: 'Digit3'       ,  width: 1   });
const Digit4       = new Key({ en: '4'          ,  ru: ''           ,  shiftEn: '$' ,  shiftRu: ';' ,  eventCode: 'Digit4'       ,  width: 1   });
const Digit5       = new Key({ en: '5'          ,  ru: ''           ,  shiftEn: '%' ,  shiftRu: ''  ,  eventCode: 'Digit5'       ,  width: 1   });
const Digit6       = new Key({ en: '6'          ,  ru: ''           ,  shiftEn: '^' ,  shiftRu: ':' ,  eventCode: 'Digit6'       ,  width: 1   });
const Digit7       = new Key({ en: '7'          ,  ru: ''           ,  shiftEn: '&' ,  shiftRu: '?' ,  eventCode: 'Digit7'       ,  width: 1   });
const Digit8       = new Key({ en: '8'          ,  ru: ''           ,  shiftEn: '*' ,  shiftRu: ''  ,  eventCode: 'Digit8'       ,  width: 1   });
const Digit9       = new Key({ en: '9'          ,  ru: ''           ,  shiftEn: '(' ,  shiftRu: ''  ,  eventCode: 'Digit9'       ,  width: 1   });
const Digit0       = new Key({ en: '0'          ,  ru: ''           ,  shiftEn: ')' ,  shiftRu: ''  ,  eventCode: 'Digit0'       ,  width: 1   });
const Minus        = new Key({ en: '-'          ,  ru: ''           ,  shiftEn: '_' ,  shiftRu: ''  ,  eventCode: 'Minus'        ,  width: 1   });
const Equal        = new Key({ en: '='          ,  ru: ''           ,  shiftEn: '+' ,  shiftRu: ''  ,  eventCode: 'Equal'        ,  width: 1   });
const Backspace    = new Key({ en: 'backspace'  ,  ru: ''           ,  shiftEn: ''  ,  shiftRu: ''  ,  eventCode: 'Backspace'    ,  width: 2   });

const Tab          = new Key({ en: 'tab'        ,  ru: ''           ,  shiftEn: ''  ,  shiftRu: ''  ,  eventCode: 'Tab'          ,  width: 2   });
const KeyQ         = new Key({ en: 'q'          ,  ru: 'й'          ,  shiftEn: 'Q' ,  shiftRu: 'Й' ,  eventCode: 'KeyQ'         ,  width: 1   });
const KeyW         = new Key({ en: 'w'          ,  ru: 'ц'          ,  shiftEn: 'W' ,  shiftRu: 'Ц' ,  eventCode: 'KeyW'         ,  width: 1   });
const KeyE         = new Key({ en: 'e'          ,  ru: 'у'          ,  shiftEn: 'E' ,  shiftRu: 'У' ,  eventCode: 'KeyE'         ,  width: 1   });
const KeyR         = new Key({ en: 'r'          ,  ru: 'к'          ,  shiftEn: 'R' ,  shiftRu: 'К' ,  eventCode: 'KeyR'         ,  width: 1   });
const KeyT         = new Key({ en: 't'          ,  ru: 'е'          ,  shiftEn: 'T' ,  shiftRu: 'Е' ,  eventCode: 'KeyT'         ,  width: 1   });
const KeyY         = new Key({ en: 'y'          ,  ru: 'н'          ,  shiftEn: 'Y' ,  shiftRu: 'Н' ,  eventCode: 'KeyY'         ,  width: 1   });
const KeyU         = new Key({ en: 'u'          ,  ru: 'г'          ,  shiftEn: 'U' ,  shiftRu: 'Г' ,  eventCode: 'KeyU'         ,  width: 1   });
const KeyI         = new Key({ en: 'i'          ,  ru: 'ш'          ,  shiftEn: 'I' ,  shiftRu: 'Ш' ,  eventCode: 'KeyI'         ,  width: 1   });
const KeyO         = new Key({ en: 'o'          ,  ru: 'щ'          ,  shiftEn: 'O' ,  shiftRu: 'Щ' ,  eventCode: 'KeyO'         ,  width: 1   });
const KeyP         = new Key({ en: 'p'          ,  ru: 'з'          ,  shiftEn: 'P' ,  shiftRu: 'З' ,  eventCode: 'KeyP'         ,  width: 1   });
const BracketLeft  = new Key({ en: '['          ,  ru: 'х'          ,  shiftEn: '{' ,  shiftRu: 'Х' ,  eventCode: 'BracketLeft'  ,  width: 1   });
const BracketRight = new Key({ en: ']'          ,  ru: 'ъ'          ,  shiftEn: '}' ,  shiftRu: 'Ъ' ,  eventCode: 'BracketRight' ,  width: 1   });
const Backslash    = new Key({ en: '\\'         ,  ru: ''           ,  shiftEn: '|' ,  shiftRu: '/' ,  eventCode: 'Backslash'    ,  width: 1   });

const CapsLock     = new Key({ en: 'caps lock'  ,  ru: 'caps lock'  ,  shiftEn: ''  ,  shiftRu: ''  ,  eventCode: 'CapsLock'     ,  width: 2   });
const KeyA         = new Key({ en: 'a'          ,  ru: 'ф'          ,  shiftEn: 'A' ,  shiftRu: 'Ф' ,  eventCode: 'KeyA'         ,  width: 1   });
const KeyS         = new Key({ en: 's'          ,  ru: 'ы'          ,  shiftEn: 'S' ,  shiftRu: 'Ы' ,  eventCode: 'KeyS'         ,  width: 1   });
const KeyD         = new Key({ en: 'd'          ,  ru: 'в'          ,  shiftEn: 'D' ,  shiftRu: 'В' ,  eventCode: 'KeyD'         ,  width: 1   });
const KeyF         = new Key({ en: 'f'          ,  ru: 'а'          ,  shiftEn: 'F' ,  shiftRu: 'А' ,  eventCode: 'KeyF'         ,  width: 1   });
const KeyG         = new Key({ en: 'g'          ,  ru: 'п'          ,  shiftEn: 'G' ,  shiftRu: 'П' ,  eventCode: 'KeyG'         ,  width: 1   });
const KeyH         = new Key({ en: 'h'          ,  ru: 'р'          ,  shiftEn: 'H' ,  shiftRu: 'Р' ,  eventCode: 'KeyH'         ,  width: 1   });
const KeyJ         = new Key({ en: 'j'          ,  ru: 'о'          ,  shiftEn: 'J' ,  shiftRu: 'О' ,  eventCode: 'KeyJ'         ,  width: 1   });
const KeyK         = new Key({ en: 'k'          ,  ru: 'л'          ,  shiftEn: 'K' ,  shiftRu: 'Л' ,  eventCode: 'KeyK'         ,  width: 1   });
const KeyL         = new Key({ en: 'l'          ,  ru: 'д'          ,  shiftEn: 'L' ,  shiftRu: 'Д' ,  eventCode: 'KeyL'         ,  width: 1   });
const Semicolon    = new Key({ en: ';'          ,  ru: 'ж'          ,  shiftEn: ':' ,  shiftRu: 'Ж' ,  eventCode: 'Semicolon'    ,  width: 1   });
const Quote        = new Key({ en: '\''         ,  ru: 'э'          ,  shiftEn: '"' ,  shiftRu: 'Э' ,  eventCode: 'Quote'        ,  width: 1   });
const Enter        = new Key({ en: 'enter'      ,  ru: ''           ,  shiftEn: ''  ,  shiftRu: ''  ,  eventCode: 'Enter'        ,  width: 1.5 });

const ShiftLeft    = new Key({ en: 'shift'      ,  ru: ''           ,  shiftEn: ''  ,  shiftRu: ''  ,  eventCode: 'ShiftLeft'    ,  width: 2   });
const KeyZ         = new Key({ en: 'z'          ,  ru: 'я'          ,  shiftEn: 'Z' ,  shiftRu: 'Я' ,  eventCode: 'KeyZ'         ,  width: 1   });
const KeyX         = new Key({ en: 'x'          ,  ru: 'ч'          ,  shiftEn: 'X' ,  shiftRu: 'Ч' ,  eventCode: 'KeyX'         ,  width: 1   });
const KeyC         = new Key({ en: 'c'          ,  ru: 'с'          ,  shiftEn: 'C' ,  shiftRu: 'С' ,  eventCode: 'KeyC'         ,  width: 1   });
const KeyV         = new Key({ en: 'v'          ,  ru: 'м'          ,  shiftEn: 'V' ,  shiftRu: 'М' ,  eventCode: 'KeyV'         ,  width: 1   });
const KeyB         = new Key({ en: 'b'          ,  ru: 'и'          ,  shiftEn: 'B' ,  shiftRu: 'И' ,  eventCode: 'KeyB'         ,  width: 1   });
const KeyN         = new Key({ en: 'n'          ,  ru: 'т'          ,  shiftEn: 'N' ,  shiftRu: 'Т' ,  eventCode: 'KeyN'         ,  width: 1   });
const KeyM         = new Key({ en: 'm'          ,  ru: 'ь'          ,  shiftEn: 'M' ,  shiftRu: 'Ь' ,  eventCode: 'KeyM'         ,  width: 1   });
const Comma        = new Key({ en: ','          ,  ru: 'б'          ,  shiftEn: '<' ,  shiftRu: 'Б' ,  eventCode: 'Comma'        ,  width: 1   });
const Period       = new Key({ en: '.'          ,  ru: 'ю'          ,  shiftEn: '>' ,  shiftRu: 'Ю' ,  eventCode: 'Period'       ,  width: 1   });
const Slash        = new Key({ en: '/'          ,  ru: '.'          ,  shiftEn: '?' ,  shiftRu: ',' ,  eventCode: 'Slash'        ,  width: 1   });
const ShiftRight   = new Key({ en: 'shift'      ,  ru: ''           ,  shiftEn: ''  ,  shiftRu: ''  ,  eventCode: 'ShiftRight'   ,  width: 2   });

const ControlLeft  = new Key({ en: 'ctrl'       ,  ru: ''           ,  shiftEn: ''  ,  shiftRu: ''  ,  eventCode: 'ControlLeft'  ,  width: 1   });
const OSLeft       = new Key({ en: '⌘'         ,  ru: ''           ,  shiftEn: ''  ,  shiftRu: ''  ,  eventCode: 'OSLeft'       ,  width: 1   });
const AltLeft      = new Key({ en: 'alt'        ,  ru: ''           ,  shiftEn: ''  ,  shiftRu: ''  ,  eventCode: 'AltLeft'      ,  width: 1   });
const Space        = new Key({ en: ' '          ,  ru: ''           ,  shiftEn: ''  ,  shiftRu: ''  ,  eventCode: 'Space'        ,  width: 4.5 });
const AltRight     = new Key({ en: 'alt'        ,  ru: ''           ,  shiftEn: ''  ,  shiftRu: ''  ,  eventCode: 'AltRight'     ,  width: 1   });
const ControlRight = new Key({ en: 'ctrl'       ,  ru: ''           ,  shiftEn: ''  ,  shiftRu: ''  ,  eventCode: 'ControlRight' ,  width: 1   });
const ArrowLeft    = new Key({ en: '←'          ,  ru: ''           ,  shiftEn: ''  ,  shiftRu: ''  ,  eventCode: 'ArrowLeft'    ,  width: 1   });
const ArrowUp      = new Key({ en: '↑'          ,  ru: ''           ,  shiftEn: ''  ,  shiftRu: ''  ,  eventCode: 'ArrowUp'      ,  width: 1   });
const ArrowDown    = new Key({ en: '↓'          ,  ru: ''           ,  shiftEn: ''  ,  shiftRu: ''  ,  eventCode: 'ArrowDown'    ,  width: 1   });
const ArrowRight   = new Key({ en: '→'          ,  ru: ''           ,  shiftEn: ''  ,  shiftRu: ''  ,  eventCode: 'ArrowRight'   ,  width: 1   }); 
// ⌘ ⏎ ⭾ ⌫
const keys = [
  [ Backquote, Digit1, Digit2, Digit3, Digit4, Digit5, Digit6, Digit7, Digit8, Digit9, Digit0, Minus, Equal, Backspace ],
  [ Tab, KeyQ, KeyW, KeyE, KeyR, KeyT, KeyY, KeyU, KeyI, KeyO, KeyP, BracketLeft, BracketRight, Backslash              ], 
  [ CapsLock, KeyA, KeyS, KeyD, KeyF, KeyG, KeyH, KeyJ, KeyK, KeyL, Semicolon, Quote, Enter                            ],
  [ ShiftLeft, KeyZ, KeyX, KeyC, KeyV, KeyB, KeyN, KeyM, Comma, Period, Slash, ShiftRight                              ],
  [ ControlLeft, OSLeft, AltLeft, Space, AltRight, ControlRight, ArrowLeft, ArrowUp, ArrowDown, ArrowRight             ],
];

const keyboard = new Keyboard(
  keys, 
  document.querySelector('#keys-root'), 
  document.querySelector('#key-layout-info'), 
  document.querySelector('#type-output')
); 
document.querySelector('.hide-keyboard').addEventListener('click', e => keyboard.hideKeyboard());