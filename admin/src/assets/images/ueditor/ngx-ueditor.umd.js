(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/common'), require('@angular/core'), require('@angular/forms'), require('@angular/router'), require('rxjs/operators'), require('rxjs/Subject')) :
	typeof define === 'function' && define.amd ? define(['exports', '@angular/common', '@angular/core', '@angular/forms', '@angular/router', 'rxjs/operators', 'rxjs/Subject'], factory) :
	(factory((global['ngx-ueditor'] = {}),global.ng.common,global.ng.core,global.ng.forms,global.ng.router,global.Rx.Observable.prototype,global.Rx));
}(this, (function (exports,common,core,forms,router,operators,Subject) { 'use strict';

var ScriptService = (function () {
    function ScriptService() {
        this.loaded = false;
        this.list = {};
        this.emitter = new Subject.Subject();
    }
    ScriptService.prototype.getChangeEmitter = function () {
        return this.emitter;
    };
    ScriptService.prototype.load = function (path, debug) {
        var _this = this;
        if (this.loaded)
            return this;
        this.loaded = true;
        var promises = [];
        if (!path.endsWith('/'))
            path += '/';
        [path + "ueditor.config.js", debug === true ? path + "ueditor.all.js" : path + "ueditor.all.min.js"].forEach(function (script) { return promises.push(_this.loadScript(script)); });
        Promise.all(promises).then(function (res) {
            _this.emitter.next(true);
        });
        return this;
    };
    ScriptService.prototype.loadScript = function (path) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.list[path] === true) {
                resolve({
                    path: path,
                    loaded: true,
                    status: 'Loaded'
                });
                return;
            }
            _this.list[path] = true;
            var node = document.createElement('script');
            node.type = 'text/javascript';
            node.src = path;
            node.charset = 'utf-8';
            if (node.readyState) {
                // IE
                node.onreadystatechange = function () {
                    if (node.readyState === 'loaded' || node.readyState === 'complete') {
                        node.onreadystatechange = null;
                        resolve({
                            path: path,
                            loaded: true,
                            status: 'Loaded'
                        });
                    }
                };
            }
            else {
                node.onload = function () {
                    resolve({
                        path: path,
                        loaded: true,
                        status: 'Loaded'
                    });
                };
            }
            node.onerror = function (error) {
                return resolve({
                    path: path,
                    loaded: false,
                    status: 'Loaded'
                });
            };
            document.getElementsByTagName('head')[0].appendChild(node);
        });
    };
    ScriptService.decorators = [
        { type: core.Injectable },
    ];
    /** @nocollapse */
    ScriptService.ctorParameters = function () { return []; };
    return ScriptService;
}());

var UEditorConfig = (function () {
    function UEditorConfig() {
        // 用于标记hook是否已经注册完成
        this._hook_finished = false;
    }
    return UEditorConfig;
}());

var UEditorComponent = (function () {
    function UEditorComponent(el, ss, router$$1, defConfig, cd) {
        this.el = el;
        this.ss = ss;
        this.router = router$$1;
        this.defConfig = defConfig;
        this.cd = cd;
        this.inited = false;
        this.events = {};
        this.loading = true;
        this.id = "_ueditor-" + Math.random().toString(36).substring(2);
        this.loadingTip = '加载中...';
        this.onPreReady = new core.EventEmitter();
        this.onReady = new core.EventEmitter();
        this.onDestroy = new core.EventEmitter();
        this.onContentChange = new core.EventEmitter();
        this.onChange = Function.prototype;
        this.onTouched = Function.prototype;
    }
    UEditorComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.inited = true;
        this.path = this.defConfig && this.defConfig.path;
        if (!this.path)
            this.path = './assets/ueditor/';
        this.route$ = this.router.events.pipe(operators.filter(function (e) { return e instanceof router.ActivationEnd; }), operators.debounceTime(100), operators.filter(function (e) { return !!document.querySelector('#' + _this.id); })).subscribe(function (res) {
            _this.destroy();
            _this.init();
        });
    };
    UEditorComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        // 已经存在对象无须进入懒加载模式
        if (window.UE) {
            this.init();
            return;
        }
        this.ss.load(this.path, true).getChangeEmitter().subscribe(function (res) {
            _this.init();
        });
    };
    UEditorComponent.prototype.ngOnChanges = function (changes) {
        if (this.inited && changes.config) {
            this.destroy();
            this.init();
        }
    };
    UEditorComponent.prototype.init = function (options) {
        var _this = this;
        if (!window.UE)
            throw new Error('uedito js文件加载失败');
        if (this.instance)
            return;
        // registrer hook
        if (this.defConfig && this.defConfig.hook) {
            if (!this.defConfig._hook_finished) {
                this.defConfig._hook_finished = true;
                this.defConfig.hook(UE);
            }
        }
        this.onPreReady.emit(this);
        var opt = Object.assign({
            UEDITOR_HOME_URL: this.path
        }, this.defConfig && this.defConfig.options, this.config, options);
        var ueditor = UE.getEditor(this.id, opt);
        ueditor.ready(function () {
            _this.loading = false;
            _this.instance = ueditor;
            _this.value && _this.instance.setContent(_this.value);
            _this.onReady.emit(_this);
            _this.cd.markForCheck();
        });
        ueditor.addListener('contentChange', function () {
            _this.value = ueditor.getContent();
            _this.onChange(_this.value);
            _this.onTouched(_this.value);
            _this.onContentChange.emit(_this.value);
        });
    };
    UEditorComponent.prototype.destroy = function () {
        if (this.instance) {
            for (var _i = 0, _a = this.events; _i < _a.length; _i++) {
                var ki = _a[_i];
                this.instance.removeListener(ki, this.events[ki]);
            }
            this.instance.removeListener('ready');
            this.instance.removeListener('contentChange');
            this.instance.destroy();
            this.instance = null;
        }
        this.onDestroy.emit();
    };
    Object.defineProperty(UEditorComponent.prototype, "Instance", {
        /**
         * 获取UE实例
         *
         * @readonly
         */
        get: /**
             * 获取UE实例
             *
             * @readonly
             */
        function () {
            return this.instance;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 设置编辑器语言
     *
     * @param {('zh-cn' | 'en')} lang
     */
    /**
         * 设置编辑器语言
         *
         * @param {('zh-cn' | 'en')} lang
         */
    UEditorComponent.prototype.setLanguage = /**
         * 设置编辑器语言
         *
         * @param {('zh-cn' | 'en')} lang
         */
    function (lang) {
        var _this = this;
        this.ss.loadScript(this.path + "/lang/" + lang + "/" + lang + ".js").then(function (res) {
            _this.destroy();
            // 清空语言
            if (!UE._bak_I18N) {
                UE._bak_I18N = UE.I18N;
            }
            UE.I18N = {};
            UE.I18N[lang] = UE._bak_I18N[lang];
            _this.init();
        });
    };
    /**
     * 添加编辑器事件
     */
    /**
         * 添加编辑器事件
         */
    UEditorComponent.prototype.addListener = /**
         * 添加编辑器事件
         */
    function (eventName, fn) {
        if (this.events[eventName])
            return;
        this.events[eventName] = fn;
        this.instance.addListener(eventName, fn);
    };
    /**
     * 移除编辑器事件
     */
    /**
         * 移除编辑器事件
         */
    UEditorComponent.prototype.removeListener = /**
         * 移除编辑器事件
         */
    function (eventName) {
        if (!this.events[eventName])
            return;
        this.instance.removeListener(eventName, this.events[eventName]);
        delete this.events[eventName];
    };
    UEditorComponent.prototype.ngOnDestroy = function () {
        this.destroy();
        if (this.route$)
            this.route$.unsubscribe();
    };
    UEditorComponent.prototype.writeValue = function (value) {
        this.value = value;
        if (this.instance) {
            this.instance.setContent(this.value);
        }
    };
    UEditorComponent.prototype.registerOnChange = function (fn) { this.onChange = fn; };
    UEditorComponent.prototype.registerOnTouched = function (fn) { this.onTouched = fn; };
    UEditorComponent.prototype.setDisabledState = function (isDisabled) {
        if (isDisabled) {
            this.instance.setDisabled();
        }
        else {
            this.instance.setEnabled();
        }
    };
    UEditorComponent.decorators = [
        { type: core.Component, args: [{
                    selector: 'ueditor',
                    template: "\n    <textarea #host id=\"{{id}}\" class=\"ueditor-textarea\"></textarea>\n    <div class=\"loading\" *ngIf=\"loading\" [innerHTML]=\"loadingTip\"></div>\n    ",
                    encapsulation: core.ViewEncapsulation.Emulated,
                    styles: [".ueditor-textarea{display:none;}"],
                    providers: [{
                            provide: forms.NG_VALUE_ACCESSOR,
                            useExisting: core.forwardRef(function () { return UEditorComponent; }),
                            multi: true
                        }],
                    changeDetection: core.ChangeDetectionStrategy.OnPush
                },] },
    ];
    /** @nocollapse */
    UEditorComponent.ctorParameters = function () { return [
        { type: core.ElementRef, },
        { type: ScriptService, },
        { type: router.Router, decorators: [{ type: core.Optional },] },
        { type: UEditorConfig, },
        { type: core.ChangeDetectorRef, },
    ]; };
    UEditorComponent.propDecorators = {
        "config": [{ type: core.Input },],
        "loadingTip": [{ type: core.Input },],
        "host": [{ type: core.ViewChild, args: ['host',] },],
        "onPreReady": [{ type: core.Output },],
        "onReady": [{ type: core.Output },],
        "onDestroy": [{ type: core.Output },],
        "onContentChange": [{ type: core.Output },],
    };
    return UEditorComponent;
}());

var UEditorModule = (function () {
    function UEditorModule() {
    }
    UEditorModule.forRoot = function (config) {
        return {
            ngModule: UEditorModule,
            providers: [
                { provide: UEditorConfig, useValue: config }
            ]
        };
    };
    UEditorModule.decorators = [
        { type: core.NgModule, args: [{
                    imports: [common.CommonModule],
                    providers: [ScriptService],
                    declarations: [UEditorComponent],
                    exports: [UEditorComponent]
                },] },
    ];
    /** @nocollapse */
    UEditorModule.ctorParameters = function () { return []; };
    return UEditorModule;
}());

exports.UEditorModule = UEditorModule;
exports.UEditorComponent = UEditorComponent;
exports.UEditorConfig = UEditorConfig;

Object.defineProperty(exports, '__esModule', { value: true });

})));
