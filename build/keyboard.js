var Key = /** @class */ (function () {
    function Key(_a) {
        var en = _a.en, _b = _a.ru, ru = _b === void 0 ? '' : _b, _c = _a.shiftEn, shiftEn = _c === void 0 ? '' : _c, _d = _a.shiftRu, shiftRu = _d === void 0 ? '' : _d, eventCode = _a.eventCode, _e = _a.width, width = _e === void 0 ? 1 : _e;
        if (!eventCode)
            throw new Error('Specify eventCode at "Key" class!');
        this.en = en;
        this.ru = ru === en ? '' : ru;
        this.shiftEn = shiftEn;
        this.shiftRu = shiftRu === shiftEn ? '' : shiftRu;
        this.eventCode = eventCode;
        this.width = width;
    }
    return Key;
}());
var KeyboardDrawer = /** @class */ (function () {
    function KeyboardDrawer(keys) {
        this.keys = keys;
        this.sizesCSS = {
            "0.5": "k-0-5",
            "1": "k-1",
            "1.5": "k-1-5",
            "2": "k-2",
            "2.5": "k-2-5",
            "3": "k-3",
            "3.5": "k-3-5",
            "4": "k-4",
            "4.5": "k-4-5",
            "5": "k-5",
        };
        this.specialKeyCSS = {
            "Enter": "k--j-right",
            "Tab": "k--j-left",
            "Backspace": "k--j-right",
            "ShiftLeft": "k--j-left",
            "ShiftRight": "k--j-right",
        };
        /* ANIMATION EVENTS */
        this.specialActiveCSS = {
            "CapsLock": "k-caps--active",
        };
        this.clickActiveCSS = {
            "AltLeft": false,
            "AltRight": false,
            "ShiftLeft": false,
            "ShiftRight": false,
            "ControlLeft": false,
            "ControlRight": false,
        };
    }
    KeyboardDrawer.prototype.getKeyHTML = function (EN, RU, shiftEN, shiftRU, keyWidth, eventCode) {
        if (RU === EN)
            RU = '';
        if (RU === shiftRU.toLowerCase()) {
            RU = shiftRU;
            shiftRU = '';
        }
        if (EN === shiftEN.toLowerCase()) {
            EN = shiftEN;
            shiftEN = '';
        }
        var getKeyHTML = function (innerHTML, sizeCSS, specialCSS) {
            if (specialCSS === void 0) { specialCSS = ''; }
            return "<button class=\"key bubbly-button " + sizeCSS + " " + specialCSS + "\" data-event-code=\"" + eventCode + "\">" + innerHTML + "</button>";
        };
        var getKeyEN = function (innerHTML) { return !innerHTML ? '' : "<span class=\"k-en\">" + innerHTML + "</span>"; };
        var getKeyRU = function (innerHTML) { return !innerHTML ? '' : "<span class=\"k-ru\">" + innerHTML + "</span>"; };
        var getKeyShiftEN = function (innerHTML) { return !innerHTML ? '' : "<span class=\"k-shift-en\">" + innerHTML + "</span>"; };
        var getKeyShiftRU = function (innerHTML) { return !innerHTML ? '' : "<span class=\"k-shift-ru\">" + innerHTML + "</span>"; };
        var innerKey = getKeyEN(EN) + getKeyRU(RU) + getKeyShiftEN(shiftEN) + getKeyShiftRU(shiftRU);
        return getKeyHTML(innerKey, this.sizesCSS[keyWidth] || this.sizesCSS[1], this.specialKeyCSS[eventCode] || '');
    };
    KeyboardDrawer.prototype.getKeysRow = function (innerHTML) {
        return "<div class=\"flex-row\">" + innerHTML + "</div>";
    };
    KeyboardDrawer.prototype.drawKeyboard = function (root, doEvents) {
        if (doEvents === void 0) { doEvents = true; }
        var keyboard = document.createElement('template');
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var line = keys_1[_i];
            var row = "";
            for (var _a = 0, line_1 = line; _a < line_1.length; _a++) {
                var key = line_1[_a];
                var en = key.en, ru = key.ru, shiftEn = key.shiftEn, shiftRu = key.shiftRu, width = key.width, eventCode = key.eventCode;
                row += this.getKeyHTML(en, ru, shiftEn, shiftRu, width, eventCode);
            }
            keyboard.innerHTML += this.getKeysRow(row);
        }
        root.appendChild(keyboard.content);
        if (doEvents)
            this.startEvents();
    };
    KeyboardDrawer.prototype.swapSpecialActiveCSS = function (key) {
        var eventCode = key.dataset.eventCode;
        if (eventCode in this.specialActiveCSS) {
            var activeClass = this.specialActiveCSS[eventCode];
            if (key.classList.contains(activeClass)) {
                key.classList.remove(activeClass);
            }
            else
                key.classList.add(activeClass);
        }
    };
    KeyboardDrawer.prototype.removeClickActiveCSS = function () {
        for (var eventCode in this.clickActiveCSS) {
            var element = document.querySelector("[data-event-code=" + eventCode + "]");
            if (element && this.clickActiveCSS[eventCode])
                this.endKeyAnimation(element);
            this.clickActiveCSS[eventCode] = false;
        }
    };
    KeyboardDrawer.prototype.animateKey = function (key) {
        var _this = this;
        this.startKeyAnimation(key);
        setTimeout(function () { return _this.endKeyAnimation(key); }, 175);
    };
    KeyboardDrawer.prototype.startKeyAnimation = function (key) {
        key.classList.add('active');
    };
    KeyboardDrawer.prototype.endKeyWithNoAnimation = function (key) {
        setTimeout(function () { return key.classList.remove('active'); }, 175);
    };
    KeyboardDrawer.prototype.endKeyAnimation = function (key) {
        key.classList.add('animate');
        setTimeout(function () { return key.classList.remove('active'); }, 175);
        setTimeout(function () { return key.classList.remove('animate'); }, 700);
    };
    /**
     * RECURSION LEVEL: 1
     */
    KeyboardDrawer.prototype.getParentTarget = function (currentNode) {
        var eventCode, target;
        if (!currentNode)
            return [null, null];
        if (currentNode.dataset.eventCode) {
            target = currentNode;
            eventCode = currentNode.dataset.eventCode;
        }
        else if (currentNode.parentNode.dataset.eventCode) {
            target = currentNode.parentNode;
            eventCode = currentNode.parentNode.dataset.eventCode;
        }
        return [eventCode, target];
    };
    KeyboardDrawer.prototype.isClickActiveCombination = function () {
        var toCompare = [
            [this.clickActiveCSS["ShiftLeft"], this.clickActiveCSS["ShiftRight"]],
            [this.clickActiveCSS["ControlLeft"], this.clickActiveCSS["ControlRight"]],
        ];
        return toCompare.reduce(function (bool, subarray) { return bool && subarray.includes(true); }, true);
    };
    KeyboardDrawer.prototype.startEvents = function () {
        var _this = this;
        var handleClickEvent = function (e) {
            var _a = _this.getParentTarget(e.detail.target || e.target), eventCode = _a[0], target = _a[1];
            if (!eventCode)
                return;
            e.preventDefault();
            if (eventCode in _this.clickActiveCSS) {
                _this.clickActiveCSS[eventCode] = !_this.clickActiveCSS[eventCode];
                if (_this.isClickActiveCombination()) {
                    _this.animateKey(target);
                    _this.removeClickActiveCSS();
                }
                else if (_this.clickActiveCSS[eventCode])
                    _this.startKeyAnimation(target);
                else
                    _this.endKeyAnimation(target);
            }
            else {
                _this.animateKey(target);
                _this.removeClickActiveCSS();
            }
            _this.swapSpecialActiveCSS(target);
            _this.prevMouseDown = null;
        };
        document.addEventListener('click', handleClickEvent);
        var handleMouseDown = function (e) {
            var _a = _this.getParentTarget(e.target), eventCode = _a[0], target = _a[1];
            if (!eventCode)
                return;
            if (!target.classList.contains('active')) {
                _this.startKeyAnimation(target);
                _this.prevMouseDown = target;
            }
        };
        document.addEventListener('mousedown', handleMouseDown);
        var handleMouseUp = function (e) {
            var _a = _this.getParentTarget(_this.prevMouseDown), eventCode = _a[0], target = _a[1];
            if (!eventCode)
                return;
            if (e.target === target)
                return;
            if (target.contains(e.target))
                return;
            if (eventCode in _this.clickActiveCSS) {
                if (target.classList.contains('active'))
                    _this.endKeyWithNoAnimation(target);
            }
            else {
                var modifiedEvent = new CustomEvent('click', {
                    detail: { target: target }
                });
                handleClickEvent(modifiedEvent);
            }
            _this.prevMouseDown = null;
        };
        document.addEventListener('mouseup', handleMouseUp);
        var handleKeyDown = function (e) {
            var target = document.querySelector("[data-event-code=\"" + e.code + "\"]");
            if (target)
                _this.startKeyAnimation(target);
        };
        document.addEventListener('keydown', handleKeyDown);
        var handleKeyUp = function (e) {
            var target = document.querySelector("[data-event-code=" + e.code + "]");
            if (_this.specialActiveCSS[e.code])
                _this.swapSpecialActiveCSS(target);
            if (target)
                _this.endKeyAnimation(target);
            _this.removeClickActiveCSS();
        };
        document.addEventListener('keyup', handleKeyUp);
        window.onblur = function () {
            var activeElements = document.querySelectorAll(".active[data-event-code]");
            activeElements.forEach(function (el) { return el.classList.remove('active'); });
        };
    };
    return KeyboardDrawer;
}());
var KeyboardEventHandler = /** @class */ (function () {
    function KeyboardEventHandler(_keys) {
        var _this = this;
        this._keys = _keys;
        this.modifiers = {
            "AltLeft": false,
            "AltRight": false,
            "ShiftLeft": false,
            "ShiftRight": false,
            "ControlLeft": false,
            "ControlRight": false,
        };
        this.activatable = {
            "CapsLock": false
        };
        this.specialBehavior = {
            "Backspace": function () {
                var start = _this.output.selectionStart;
                var end = _this.output.selectionEnd;
                if (start === end) {
                    _this.output.value =
                        _this.output.value.slice(0, start - 1)
                            +
                                _this.output.value.slice(end);
                }
                else
                    _this.type('');
            },
            "Tab": function () {
                _this.type('    ');
            },
            "Enter": function () { return _this.type("\n"); },
            "ArrowUp": function () {
                var end = _this.output.selectionEnd;
                _this.specialBehavior.arrowSelect([0, end], [0, 0]);
            },
            "ArrowDown": function () {
                var length = _this.output.value.length;
                var start = _this.output.selectionStart;
                _this.specialBehavior.arrowSelect([start, length], [length, length]);
            },
            "ArrowLeft": function () {
                var start = _this.output.selectionStart;
                var end = _this.output.selectionEnd;
                _this.specialBehavior.arrowSelect([start - 1, end], [start - 1, start - 1]);
            },
            "ArrowRight": function () {
                var start = _this.output.selectionStart;
                var end = _this.output.selectionEnd;
                _this.specialBehavior.arrowSelect([start, end + 1], [end + 1, end + 1]);
            },
            arrowSelect: function (onSelect, nonSelect) {
                var start1 = onSelect[0], end1 = onSelect[1];
                var start2 = nonSelect[0], end2 = nonSelect[1];
                var length = _this.output.value.length;
                var start = _this.output.selectionStart;
                var end = _this.output.selectionEnd;
                if ((start !== end
                    || _this.modifiers["ShiftLeft"]
                    || _this.modifiers["ShiftRight"]) && end - start !== length)
                    _this.output.setSelectionRange(start1, end1);
                else
                    _this.output.setSelectionRange(start2, end2);
            }
        };
        this.currentLanguage = "EN";
        this.keyCombination = new Set();
        this.getEventCode = function (e) {
            switch (e.type) {
                case "keypress":
                case "keyup":
                case "keydown":
                    return e.code;
                case "click":
                case "mouseup":
                case "mousedown":
                default:
                    return e.target.dataset.eventCode ||
                        e.target.parentNode.dataset.eventCode;
            }
        };
        this.handleClick = function (e) {
            var eventCode = _this.getEventCode(e);
            if (!eventCode)
                return;
            e.preventDefault();
            _this.output.focus();
            if (eventCode in _this.modifiers) {
                _this.modifiers[eventCode] = !_this.modifiers[eventCode];
                _this.combinationHandler(eventCode, true);
                // this.resetModifiers(); this.keyCombination.clear();
            }
            else if (eventCode in _this.activatable) {
                _this.activatable[eventCode] = !_this.activatable[eventCode];
            }
            else if (eventCode in _this.specialBehavior) {
                _this.specialBehavior[eventCode]();
                _this.resetModifiers();
                _this.keyCombination.clear();
            }
            else {
                var key = _this.findKey(eventCode);
                if (!_this.combinationHandler(eventCode, false)) {
                    if (_this.currentLanguage === "EN")
                        _this.typeKey(key, "EN");
                    if (_this.currentLanguage === "RU")
                        _this.typeKey(key, "RU");
                }
                _this.resetModifiers();
                _this.keyCombination.clear();
            }
        };
        this.handleMouseDown = function (e) {
            var eventCode = _this.getEventCode(e);
            if (!eventCode)
                return;
            e.preventDefault();
            var DELAY = 500, INTERVAL = 50;
            _this.previousTimeout = setTimeout(function () {
                _this.previousInterval = setInterval(function () {
                    _this.handleClick(e);
                }, INTERVAL);
            }, DELAY);
        };
        this.handleMouseUp = function (e) {
            clearInterval(_this.previousInterval);
            clearTimeout(_this.previousTimeout);
        };
        this.handleKeyDown = function (e) {
            if (e.code === "Tab")
                return;
            _this.output.focus();
            if (e.code === "Enter") {
                e.preventDefault();
                _this.handleClick(e);
            }
            else {
                if (e.code in _this.modifiers)
                    _this.modifiers[e.code] = true;
                _this.combinationHandler(e.code, false);
            }
        };
        this.handleKeyUp = function (e) {
            if (e.code in _this.activatable)
                _this.activatable[e.code] = !_this.activatable[e.code];
            else if (e.code in _this.modifiers)
                _this.modifiers[e.code] = false;
            _this.keyCombination.delete(e.code);
        };
        this.changeLayout = function () {
            _this.output.focus();
            _this.currentLanguage = _this.currentLanguage === "EN" ? "RU" : "EN";
            _this.keysLayoutInfo.innerText = _this.currentLanguage;
        };
        this.flatKeys = _keys.flat();
        this.eventCodes = this.flatKeys.map(function (el) { return el.eventCode; });
    }
    KeyboardEventHandler.prototype.resetModifiers = function () {
        for (var modifier in this.modifiers) {
            if (this.modifiers[modifier])
                this.modifiers[modifier] = false;
        }
    };
    Object.defineProperty(KeyboardEventHandler.prototype, "keys", {
        get: function () {
            return this._keys;
        },
        set: function (keys) {
            this._keys = keys;
            this.flatKeys = keys.flat();
            this.eventCodes = this.flatKeys.map(function (el) { return el.eventCode; });
        },
        enumerable: false,
        configurable: true
    });
    KeyboardEventHandler.prototype.findKey = function (eventCode) {
        var index = this.eventCodes.indexOf(eventCode);
        if (index !== -1)
            return this.flatKeys[index];
        return null;
    };
    KeyboardEventHandler.prototype.type = function (value) {
        if (!this.output)
            throw new Error('No textarea output Element');
        var start = this.output.selectionStart;
        var end = this.output.selectionEnd;
        var offset = start + value.length;
        this.output.value =
            this.output.value.slice(0, start)
                + value +
                this.output.value.slice(end);
        this.output.setSelectionRange(offset, offset);
    };
    KeyboardEventHandler.prototype.typeKey = function (key, lang) {
        if (this.activatable["CapsLock"]) {
            if (key.en.toUpperCase() === key.shiftEn) {
                if (lang === "EN")
                    this.type(key.shiftEn);
                if (lang === "RU" && key.ru)
                    this.type(key.shiftRu);
                if (lang === "RU" && !key.ru)
                    this.type(key.shiftEn);
            }
            else {
                if (lang === "EN")
                    this.type(key.en);
                if (lang === "RU" && key.ru)
                    this.type(key.ru);
                if (lang === "RU" && !key.ru)
                    this.type(key.en);
            }
        }
        else if (this.modifiers["ShiftLeft"] || this.modifiers["ShiftRight"]) {
            if (lang === "EN")
                this.type(key.shiftEn);
            if (lang === "RU" && key.ru)
                this.type(key.shiftRu);
            if (lang === "RU" && !key.ru)
                this.type(key.shiftEn);
        }
        else {
            if (lang === "EN")
                this.type(key.en);
            if (lang === "RU" && key.ru)
                this.type(key.ru);
            if (lang === "RU" && !key.ru)
                this.type(key.en);
        }
    };
    KeyboardEventHandler.prototype.combinationHandler = function (eventCode, isReset) {
        var _this = this;
        this.keyCombination.add(eventCode);
        var reset = function () {
            if (isReset) {
                _this.resetModifiers();
                _this.keyCombination.clear();
            }
            return true;
        };
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
    };
    KeyboardEventHandler.prototype.startEvents = function (output, keysLayoutInfo) {
        this.output = output;
        this.keysLayoutInfo = keysLayoutInfo;
        keysLayoutInfo.addEventListener('click', this.changeLayout);
        document.addEventListener('click', this.handleClick);
        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('keyup', this.handleKeyUp);
        document.addEventListener('keydown', this.handleKeyDown);
    };
    return KeyboardEventHandler;
}());
var Keyboard = /** @class */ (function () {
    function Keyboard(keys, keysRoot, keysLayoutInfo, typeOutput) {
        this.keys = keys;
        this.keysRoot = keysRoot;
        this.drawer = new KeyboardDrawer(keys);
        this.drawer.drawKeyboard(keysRoot);
        this.handler = new KeyboardEventHandler(keys);
        this.handler.startEvents(typeOutput, keysLayoutInfo);
        this.keysRoot.addEventListener('click', function (e) { return typeOutput.focus(); });
    }
    Keyboard.prototype.hideKeyboard = function () {
        if (this.keysRoot.classList.contains('hide')) {
            this.handler.output.focus();
            this.keysRoot.classList.remove('hide');
        }
        else
            this.keysRoot.classList.add('hide');
    };
    return Keyboard;
}());
var Backquote = new Key({ en: '`', ru: '', shiftEn: '~', shiftRu: 'Ё', eventCode: 'Backquote', width: 1 });
var Digit1 = new Key({ en: '1', ru: '', shiftEn: '!', shiftRu: '', eventCode: 'Digit1', width: 1 });
var Digit2 = new Key({ en: '2', ru: '', shiftEn: '@', shiftRu: '"', eventCode: 'Digit2', width: 1 });
var Digit3 = new Key({ en: '3', ru: '', shiftEn: '#', shiftRu: '№', eventCode: 'Digit3', width: 1 });
var Digit4 = new Key({ en: '4', ru: '', shiftEn: '$', shiftRu: ';', eventCode: 'Digit4', width: 1 });
var Digit5 = new Key({ en: '5', ru: '', shiftEn: '%', shiftRu: '', eventCode: 'Digit5', width: 1 });
var Digit6 = new Key({ en: '6', ru: '', shiftEn: '^', shiftRu: ':', eventCode: 'Digit6', width: 1 });
var Digit7 = new Key({ en: '7', ru: '', shiftEn: '&', shiftRu: '?', eventCode: 'Digit7', width: 1 });
var Digit8 = new Key({ en: '8', ru: '', shiftEn: '*', shiftRu: '', eventCode: 'Digit8', width: 1 });
var Digit9 = new Key({ en: '9', ru: '', shiftEn: '(', shiftRu: '', eventCode: 'Digit9', width: 1 });
var Digit0 = new Key({ en: '0', ru: '', shiftEn: ')', shiftRu: '', eventCode: 'Digit0', width: 1 });
var Minus = new Key({ en: '-', ru: '', shiftEn: '_', shiftRu: '', eventCode: 'Minus', width: 1 });
var Equal = new Key({ en: '=', ru: '', shiftEn: '+', shiftRu: '', eventCode: 'Equal', width: 1 });
var Backspace = new Key({ en: 'backspace', ru: '', shiftEn: '', shiftRu: '', eventCode: 'Backspace', width: 2 });
var Tab = new Key({ en: 'tab', ru: '', shiftEn: '', shiftRu: '', eventCode: 'Tab', width: 2 });
var KeyQ = new Key({ en: 'q', ru: 'й', shiftEn: 'Q', shiftRu: 'Й', eventCode: 'KeyQ', width: 1 });
var KeyW = new Key({ en: 'w', ru: 'ц', shiftEn: 'W', shiftRu: 'Ц', eventCode: 'KeyW', width: 1 });
var KeyE = new Key({ en: 'e', ru: 'у', shiftEn: 'E', shiftRu: 'У', eventCode: 'KeyE', width: 1 });
var KeyR = new Key({ en: 'r', ru: 'к', shiftEn: 'R', shiftRu: 'К', eventCode: 'KeyR', width: 1 });
var KeyT = new Key({ en: 't', ru: 'е', shiftEn: 'T', shiftRu: 'Е', eventCode: 'KeyT', width: 1 });
var KeyY = new Key({ en: 'y', ru: 'н', shiftEn: 'Y', shiftRu: 'Н', eventCode: 'KeyY', width: 1 });
var KeyU = new Key({ en: 'u', ru: 'г', shiftEn: 'U', shiftRu: 'Г', eventCode: 'KeyU', width: 1 });
var KeyI = new Key({ en: 'i', ru: 'ш', shiftEn: 'I', shiftRu: 'Ш', eventCode: 'KeyI', width: 1 });
var KeyO = new Key({ en: 'o', ru: 'щ', shiftEn: 'O', shiftRu: 'Щ', eventCode: 'KeyO', width: 1 });
var KeyP = new Key({ en: 'p', ru: 'з', shiftEn: 'P', shiftRu: 'З', eventCode: 'KeyP', width: 1 });
var BracketLeft = new Key({ en: '[', ru: 'х', shiftEn: '{', shiftRu: 'Х', eventCode: 'BracketLeft', width: 1 });
var BracketRight = new Key({ en: ']', ru: 'ъ', shiftEn: '}', shiftRu: 'Ъ', eventCode: 'BracketRight', width: 1 });
var Backslash = new Key({ en: '\\', ru: '', shiftEn: '|', shiftRu: '/', eventCode: 'Backslash', width: 1 });
var CapsLock = new Key({ en: 'caps lock', ru: 'caps lock', shiftEn: '', shiftRu: '', eventCode: 'CapsLock', width: 2 });
var KeyA = new Key({ en: 'a', ru: 'ф', shiftEn: 'A', shiftRu: 'Ф', eventCode: 'KeyA', width: 1 });
var KeyS = new Key({ en: 's', ru: 'ы', shiftEn: 'S', shiftRu: 'Ы', eventCode: 'KeyS', width: 1 });
var KeyD = new Key({ en: 'd', ru: 'в', shiftEn: 'D', shiftRu: 'В', eventCode: 'KeyD', width: 1 });
var KeyF = new Key({ en: 'f', ru: 'а', shiftEn: 'F', shiftRu: 'А', eventCode: 'KeyF', width: 1 });
var KeyG = new Key({ en: 'g', ru: 'п', shiftEn: 'G', shiftRu: 'П', eventCode: 'KeyG', width: 1 });
var KeyH = new Key({ en: 'h', ru: 'р', shiftEn: 'H', shiftRu: 'Р', eventCode: 'KeyH', width: 1 });
var KeyJ = new Key({ en: 'j', ru: 'о', shiftEn: 'J', shiftRu: 'О', eventCode: 'KeyJ', width: 1 });
var KeyK = new Key({ en: 'k', ru: 'л', shiftEn: 'K', shiftRu: 'Л', eventCode: 'KeyK', width: 1 });
var KeyL = new Key({ en: 'l', ru: 'д', shiftEn: 'L', shiftRu: 'Д', eventCode: 'KeyL', width: 1 });
var Semicolon = new Key({ en: ';', ru: 'ж', shiftEn: ':', shiftRu: 'Ж', eventCode: 'Semicolon', width: 1 });
var Quote = new Key({ en: '\'', ru: 'э', shiftEn: '"', shiftRu: 'Э', eventCode: 'Quote', width: 1 });
var Enter = new Key({ en: 'enter', ru: '', shiftEn: '', shiftRu: '', eventCode: 'Enter', width: 1.5 });
var ShiftLeft = new Key({ en: 'shift', ru: '', shiftEn: '', shiftRu: '', eventCode: 'ShiftLeft', width: 2 });
var KeyZ = new Key({ en: 'z', ru: 'я', shiftEn: 'Z', shiftRu: 'Я', eventCode: 'KeyZ', width: 1 });
var KeyX = new Key({ en: 'x', ru: 'ч', shiftEn: 'X', shiftRu: 'Ч', eventCode: 'KeyX', width: 1 });
var KeyC = new Key({ en: 'c', ru: 'с', shiftEn: 'C', shiftRu: 'С', eventCode: 'KeyC', width: 1 });
var KeyV = new Key({ en: 'v', ru: 'м', shiftEn: 'V', shiftRu: 'М', eventCode: 'KeyV', width: 1 });
var KeyB = new Key({ en: 'b', ru: 'и', shiftEn: 'B', shiftRu: 'И', eventCode: 'KeyB', width: 1 });
var KeyN = new Key({ en: 'n', ru: 'т', shiftEn: 'N', shiftRu: 'Т', eventCode: 'KeyN', width: 1 });
var KeyM = new Key({ en: 'm', ru: 'ь', shiftEn: 'M', shiftRu: 'Ь', eventCode: 'KeyM', width: 1 });
var Comma = new Key({ en: ',', ru: 'б', shiftEn: '<', shiftRu: 'Б', eventCode: 'Comma', width: 1 });
var Period = new Key({ en: '.', ru: 'ю', shiftEn: '>', shiftRu: 'Ю', eventCode: 'Period', width: 1 });
var Slash = new Key({ en: '/', ru: '.', shiftEn: '?', shiftRu: ',', eventCode: 'Slash', width: 1 });
var ShiftRight = new Key({ en: 'shift', ru: '', shiftEn: '', shiftRu: '', eventCode: 'ShiftRight', width: 2 });
var ControlLeft = new Key({ en: 'ctrl', ru: '', shiftEn: '', shiftRu: '', eventCode: 'ControlLeft', width: 1 });
var OSLeft = new Key({ en: '⌘', ru: '', shiftEn: '', shiftRu: '', eventCode: 'OSLeft', width: 1 });
var AltLeft = new Key({ en: 'alt', ru: '', shiftEn: '', shiftRu: '', eventCode: 'AltLeft', width: 1 });
var Space = new Key({ en: ' ', ru: '', shiftEn: '', shiftRu: '', eventCode: 'Space', width: 4.5 });
var AltRight = new Key({ en: 'alt', ru: '', shiftEn: '', shiftRu: '', eventCode: 'AltRight', width: 1 });
var ControlRight = new Key({ en: 'ctrl', ru: '', shiftEn: '', shiftRu: '', eventCode: 'ControlRight', width: 1 });
var ArrowLeft = new Key({ en: '←', ru: '', shiftEn: '', shiftRu: '', eventCode: 'ArrowLeft', width: 1 });
var ArrowUp = new Key({ en: '↑', ru: '', shiftEn: '', shiftRu: '', eventCode: 'ArrowUp', width: 1 });
var ArrowDown = new Key({ en: '↓', ru: '', shiftEn: '', shiftRu: '', eventCode: 'ArrowDown', width: 1 });
var ArrowRight = new Key({ en: '→', ru: '', shiftEn: '', shiftRu: '', eventCode: 'ArrowRight', width: 1 });
// ⌘ ⏎ ⭾ ⌫
var keys = [
    [Backquote, Digit1, Digit2, Digit3, Digit4, Digit5, Digit6, Digit7, Digit8, Digit9, Digit0, Minus, Equal, Backspace],
    [Tab, KeyQ, KeyW, KeyE, KeyR, KeyT, KeyY, KeyU, KeyI, KeyO, KeyP, BracketLeft, BracketRight, Backslash],
    [CapsLock, KeyA, KeyS, KeyD, KeyF, KeyG, KeyH, KeyJ, KeyK, KeyL, Semicolon, Quote, Enter],
    [ShiftLeft, KeyZ, KeyX, KeyC, KeyV, KeyB, KeyN, KeyM, Comma, Period, Slash, ShiftRight],
    [ControlLeft, OSLeft, AltLeft, Space, AltRight, ControlRight, ArrowLeft, ArrowUp, ArrowDown, ArrowRight],
];
var keyboard = new Keyboard(keys, document.querySelector('#keys-root'), document.querySelector('#key-layout-info'), document.querySelector('#type-output'));
document.querySelector('.hide-keyboard').addEventListener('click', function (e) { return keyboard.hideKeyboard(); });
