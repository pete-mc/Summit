(window.webpackJsonp = window.webpackJsonp || []).push([
    [234], {
        1073: function(e, t, n) {
            "use strict";
            n.d(t, "a", (function() {
                return h
            }));
            var r = n(38),
                o = n(31),
                l = n(14);

            function h(e, t) {
                Object(l.a)(2, arguments);
                var n = Object(o.a)(e),
                    h = Object(r.a)(t);
                if (isNaN(h)) return new Date(NaN);
                if (!h) return n;
                var d = n.getDate(),
                    c = new Date(n.getTime());
                c.setMonth(n.getMonth() + h + 1, 0);
                var m = c.getDate();
                return d >= m ? c : (n.setFullYear(c.getFullYear(), c.getMonth(), d), n)
            }
        },
        1089: function(e, t, n) {
            "use strict";
            n(993);
            var r = n(146),
                o = n(12);
            t.a = r.a.extend({
                name: "v-expansion-panels",
                provide() {
                    return {
                        expansionPanels: this
                    }
                },
                props: {
                    accordion: Boolean,
                    disabled: Boolean,
                    flat: Boolean,
                    hover: Boolean,
                    focusable: Boolean,
                    inset: Boolean,
                    popout: Boolean,
                    readonly: Boolean,
                    tile: Boolean
                },
                computed: {
                    classes() {
                        return { ...r.a.options.computed.classes.call(this),
                            "v-expansion-panels": !0,
                            "v-expansion-panels--accordion": this.accordion,
                            "v-expansion-panels--flat": this.flat,
                            "v-expansion-panels--hover": this.hover,
                            "v-expansion-panels--focusable": this.focusable,
                            "v-expansion-panels--inset": this.inset,
                            "v-expansion-panels--popout": this.popout,
                            "v-expansion-panels--tile": this.tile
                        }
                    }
                },
                created() {
                    this.$attrs.hasOwnProperty("expand") && Object(o.a)("expand", "multiple", this), Array.isArray(this.value) && this.value.length > 0 && "boolean" == typeof this.value[0] && Object(o.a)(':value="[true, false, true]"', ':value="[0, 2]"', this)
                },
                methods: {
                    updateItem(e, t) {
                        const n = this.getValue(e, t),
                            r = this.getValue(e, t + 1);
                        e.isActive = this.toggleMethod(n), e.nextIsActive = this.toggleMethod(r)
                    }
                }
            })
        },
        1090: function(e, t, n) {
            "use strict";
            var r = n(105),
                o = n(88),
                l = n(2),
                h = n(7);
            t.a = Object(h.a)(Object(r.a)("expansionPanels", "v-expansion-panel", "v-expansion-panels"), Object(o.b)("expansionPanel", !0)).extend({
                name: "v-expansion-panel",
                props: {
                    disabled: Boolean,
                    readonly: Boolean
                },
                data: () => ({
                    content: null,
                    header: null,
                    nextIsActive: !1
                }),
                computed: {
                    classes() {
                        return {
                            "v-expansion-panel--active": this.isActive,
                            "v-expansion-panel--next-active": this.nextIsActive,
                            "v-expansion-panel--disabled": this.isDisabled,
                            ...this.groupClasses
                        }
                    },
                    isDisabled() {
                        return this.expansionPanels.disabled || this.disabled
                    },
                    isReadonly() {
                        return this.expansionPanels.readonly || this.readonly
                    }
                },
                methods: {
                    registerContent(e) {
                        this.content = e
                    },
                    unregisterContent() {
                        this.content = null
                    },
                    registerHeader(e) {
                        this.header = e, e.$on("click", this.onClick)
                    },
                    unregisterHeader() {
                        this.header = null
                    },
                    onClick(e) {
                        e.detail && this.header.$el.blur(), this.$emit("click", e), this.isReadonly || this.isDisabled || this.toggle()
                    },
                    toggle() {
                        this.$nextTick(() => this.$emit("change"))
                    }
                },
                render(e) {
                    return e("div", {
                        staticClass: "v-expansion-panel",
                        class: this.classes,
                        attrs: {
                            "aria-expanded": String(this.isActive)
                        }
                    }, Object(l.r)(this))
                }
            })
        },
        1091: function(e, t, n) {
            "use strict";
            var r = n(99),
                o = n(67),
                l = n(18),
                h = n(88),
                d = n(60),
                c = n(2),
                m = n(7);
            const y = Object(m.a)(l.a, Object(h.a)("expansionPanel", "v-expansion-panel-header", "v-expansion-panel"));
            t.a = y.extend().extend({
                name: "v-expansion-panel-header",
                directives: {
                    ripple: d.a
                },
                props: {
                    disableIconRotate: Boolean,
                    expandIcon: {
                        type: String,
                        default: "$expand"
                    },
                    hideActions: Boolean,
                    ripple: {
                        type: [Boolean, Object],
                        default: !1
                    }
                },
                data: () => ({
                    hasMousedown: !1
                }),
                computed: {
                    classes() {
                        return {
                            "v-expansion-panel-header--active": this.isActive,
                            "v-expansion-panel-header--mousedown": this.hasMousedown
                        }
                    },
                    isActive() {
                        return this.expansionPanel.isActive
                    },
                    isDisabled() {
                        return this.expansionPanel.isDisabled
                    },
                    isReadonly() {
                        return this.expansionPanel.isReadonly
                    }
                },
                created() {
                    this.expansionPanel.registerHeader(this)
                },
                beforeDestroy() {
                    this.expansionPanel.unregisterHeader()
                },
                methods: {
                    onClick(e) {
                        this.$emit("click", e)
                    },
                    genIcon() {
                        const e = Object(c.r)(this, "actions", {
                            open: this.isActive
                        }) || [this.$createElement(o.a, this.expandIcon)];
                        return this.$createElement(r.c, [this.$createElement("div", {
                            staticClass: "v-expansion-panel-header__icon",
                            class: {
                                "v-expansion-panel-header__icon--disable-rotate": this.disableIconRotate
                            },
                            directives: [{
                                name: "show",
                                value: !this.isDisabled
                            }]
                        }, e)])
                    }
                },
                render(e) {
                    return e("button", this.setBackgroundColor(this.color, {
                        staticClass: "v-expansion-panel-header",
                        class: this.classes,
                        attrs: {
                            tabindex: this.isDisabled ? -1 : null,
                            type: "button",
                            "aria-expanded": this.isActive
                        },
                        directives: [{
                            name: "ripple",
                            value: this.ripple
                        }],
                        on: { ...this.$listeners,
                            click: this.onClick,
                            mousedown: () => this.hasMousedown = !0,
                            mouseup: () => this.hasMousedown = !1
                        }
                    }), [Object(c.r)(this, "default", {
                        open: this.isActive
                    }, !0), this.hideActions || this.genIcon()])
                }
            })
        },
        1092: function(e, t, n) {
            "use strict";
            var r = n(99),
                o = n(148),
                l = n(18),
                h = n(88),
                d = n(2),
                c = n(7);
            const m = Object(c.a)(o.a, l.a, Object(h.a)("expansionPanel", "v-expansion-panel-content", "v-expansion-panel"));
            t.a = m.extend().extend({
                name: "v-expansion-panel-content",
                data: () => ({
                    isActive: !1
                }),
                computed: {
                    parentIsActive() {
                        return this.expansionPanel.isActive
                    }
                },
                watch: {
                    parentIsActive: {
                        immediate: !0,
                        handler(e, t) {
                            e && (this.isBooted = !0), null == t ? this.isActive = e : this.$nextTick(() => this.isActive = e)
                        }
                    }
                },
                created() {
                    this.expansionPanel.registerContent(this)
                },
                beforeDestroy() {
                    this.expansionPanel.unregisterContent()
                },
                render(e) {
                    return e(r.a, this.showLazyContent(() => [e("div", this.setBackgroundColor(this.color, {
                        staticClass: "v-expansion-panel-content",
                        directives: [{
                            name: "show",
                            value: this.isActive
                        }]
                    }), [e("div", {
                        class: "v-expansion-panel-content__wrap"
                    }, Object(d.r)(this, "default", {
                        open: this.isActive
                    }))])]))
                }
            })
        },
        1118: function(e, t, n) {
            e.exports = {}
        },
        1162: function(e, t, n) {
            e.exports = {}
        },
        1206: function(e, t, n) {
            "use strict";
            n(1118);
            var r = n(143),
                o = n(267),
                l = n(2),
                h = n(12),
                d = n(36);
            t.a = r.a.extend({
                name: "v-file-input",
                model: {
                    prop: "value",
                    event: "change"
                },
                props: {
                    chips: Boolean,
                    clearable: {
                        type: Boolean,
                        default: !0
                    },
                    counterSizeString: {
                        type: String,
                        default: "$vuetify.fileInput.counterSize"
                    },
                    counterString: {
                        type: String,
                        default: "$vuetify.fileInput.counter"
                    },
                    hideInput: Boolean,
                    multiple: Boolean,
                    placeholder: String,
                    prependIcon: {
                        type: String,
                        default: "$file"
                    },
                    readonly: {
                        type: Boolean,
                        default: !1
                    },
                    showSize: {
                        type: [Boolean, Number],
                        default: !1,
                        validator: e => "boolean" == typeof e || [1e3, 1024].includes(e)
                    },
                    smallChips: Boolean,
                    truncateLength: {
                        type: [Number, String],
                        default: 22
                    },
                    type: {
                        type: String,
                        default: "file"
                    },
                    value: {
                        default: void 0,
                        validator: e => Object(l.F)(e).every(e => null != e && "object" == typeof e)
                    }
                },
                computed: {
                    classes() {
                        return { ...r.a.options.computed.classes.call(this),
                            "v-file-input": !0
                        }
                    },
                    computedCounterValue() {
                        const e = this.multiple && this.lazyValue ? this.lazyValue.length : this.lazyValue instanceof File ? 1 : 0;
                        if (!this.showSize) return this.$vuetify.lang.t(this.counterString, e);
                        const t = this.internalArrayValue.reduce((e, {
                            size: t = 0
                        }) => e + t, 0);
                        return this.$vuetify.lang.t(this.counterSizeString, e, Object(l.v)(t, 1024 === this.base))
                    },
                    internalArrayValue() {
                        return Object(l.F)(this.internalValue)
                    },
                    internalValue: {
                        get() {
                            return this.lazyValue
                        },
                        set(e) {
                            this.lazyValue = e, this.$emit("change", this.lazyValue)
                        }
                    },
                    isDirty() {
                        return this.internalArrayValue.length > 0
                    },
                    isLabelActive() {
                        return this.isDirty
                    },
                    text() {
                        return this.isDirty || !this.persistentPlaceholder && !this.isFocused && this.hasLabel ? this.internalArrayValue.map(e => {
                            const {
                                name: t = "",
                                size: n = 0
                            } = e, r = this.truncateText(t);
                            return this.showSize ? `${r} (${Object(l.v)(n,1024===this.base)})` : r
                        }) : [this.placeholder]
                    },
                    base() {
                        return "boolean" != typeof this.showSize ? this.showSize : void 0
                    },
                    hasChips() {
                        return this.chips || this.smallChips
                    }
                },
                watch: {
                    readonly: {
                        handler(e) {
                            !0 === e && Object(h.b)("readonly is not supported on <v-file-input>", this)
                        },
                        immediate: !0
                    },
                    value(e) {
                        const t = this.multiple ? e : e ? [e] : [];
                        Object(l.j)(t, this.$refs.input.files) || (this.$refs.input.value = "")
                    }
                },
                methods: {
                    clearableCallback() {
                        this.internalValue = this.multiple ? [] : null, this.$refs.input.value = ""
                    },
                    genChips() {
                        return this.isDirty ? this.text.map((text, e) => this.$createElement(o.a, {
                            props: {
                                small: this.smallChips
                            },
                            on: {
                                "click:close": () => {
                                    const t = this.internalValue;
                                    t.splice(e, 1), this.internalValue = t
                                }
                            }
                        }, [text])) : []
                    },
                    genControl() {
                        const e = r.a.options.methods.genControl.call(this);
                        return this.hideInput && (e.data.style = Object(d.d)(e.data.style, {
                            display: "none"
                        })), e
                    },
                    genInput() {
                        const input = r.a.options.methods.genInput.call(this);
                        return input.data.attrs.multiple = this.multiple, delete input.data.domProps.value, delete input.data.on.input, input.data.on.change = this.onInput, [this.genSelections(), input]
                    },
                    genPrependSlot() {
                        if (!this.prependIcon) return null;
                        const e = this.genIcon("prepend", () => {
                            this.$refs.input.click()
                        });
                        return this.genSlot("prepend", "outer", [e])
                    },
                    genSelectionText() {
                        const e = this.text.length;
                        return e < 2 ? this.text : this.showSize && !this.counter ? [this.computedCounterValue] : [this.$vuetify.lang.t(this.counterString, e)]
                    },
                    genSelections() {
                        const e = [];
                        return this.isDirty && this.$scopedSlots.selection ? this.internalArrayValue.forEach((t, n) => {
                            this.$scopedSlots.selection && e.push(this.$scopedSlots.selection({
                                text: this.text[n],
                                file: t,
                                index: n
                            }))
                        }) : e.push(this.hasChips && this.isDirty ? this.genChips() : this.genSelectionText()), this.$createElement("div", {
                            staticClass: "v-file-input__text",
                            class: {
                                "v-file-input__text--placeholder": this.placeholder && !this.isDirty, "v-file-input__text--chips": this.hasChips && !this.$scopedSlots.selection
                            }
                        }, e)
                    },
                    genTextFieldSlot() {
                        const e = r.a.options.methods.genTextFieldSlot.call(this);
                        return e.data.on = { ...e.data.on || {},
                            click: e => {
                                e.target && "LABEL" === e.target.nodeName || this.$refs.input.click()
                            }
                        }, e
                    },
                    onInput(e) {
                        const t = [...e.target.files || []];
                        this.internalValue = this.multiple ? t : t[0], this.initialValue = this.internalValue
                    },
                    onKeyDown(e) {
                        this.$emit("keydown", e)
                    },
                    truncateText(e) {
                        if (e.length < Number(this.truncateLength)) return e;
                        const t = Math.floor((Number(this.truncateLength) - 1) / 2);
                        return `${e.slice(0,t)}…${e.slice(e.length-t)}`
                    }
                }
            })
        },
        1286: function(e, t, n) {
            "use strict";
            n.d(t, "a", (function() {
                return l
            }));
            var r = n(76),
                o = n(2);
            const l = Object(o.i)("v-toolbar__title"),
                h = Object(o.i)("v-toolbar__items");
            r.a
        },
        1287: function(e, t, n) {
            e.exports = {}
        },
        1356: function(e, t, n) {
            "use strict";
            n(1162);
            var r = n(49),
                o = n(73),
                l = n(1).a.extend({
                    name: "transitionable",
                    props: {
                        mode: String,
                        origin: String,
                        transition: String
                    }
                }),
                h = n(57),
                d = n(7);
            t.a = Object(d.a)(o.a, r.a, l).extend({
                name: "v-speed-dial",
                directives: {
                    ClickOutside: h.a
                },
                props: {
                    direction: {
                        type: String,
                        default: "top",
                        validator: e => ["top", "right", "bottom", "left"].includes(e)
                    },
                    openOnHover: Boolean,
                    transition: {
                        type: String,
                        default: "scale-transition"
                    }
                },
                computed: {
                    classes() {
                        return {
                            "v-speed-dial": !0,
                            "v-speed-dial--top": this.top,
                            "v-speed-dial--right": this.right,
                            "v-speed-dial--bottom": this.bottom,
                            "v-speed-dial--left": this.left,
                            "v-speed-dial--absolute": this.absolute,
                            "v-speed-dial--fixed": this.fixed,
                            ["v-speed-dial--direction-" + this.direction]: !0,
                            "v-speed-dial--is-active": this.isActive
                        }
                    }
                },
                render(e) {
                    let t = [];
                    const data = {
                        class: this.classes,
                        directives: [{
                            name: "click-outside",
                            value: () => this.isActive = !1
                        }],
                        on: {
                            click: () => this.isActive = !this.isActive
                        }
                    };
                    if (this.openOnHover && (data.on.mouseenter = () => this.isActive = !0, data.on.mouseleave = () => this.isActive = !1), this.isActive) {
                        let n = 0;
                        t = (this.$slots.default || []).map((b, i) => !b.tag || void 0 === b.componentOptions || "v-btn" !== b.componentOptions.Ctor.options.name && "v-tooltip" !== b.componentOptions.Ctor.options.name ? (b.key = i, b) : (n++, e("div", {
                            style: {
                                transitionDelay: .05 * n + "s"
                            },
                            key: i
                        }, [b])))
                    }
                    const n = e("transition-group", {
                        class: "v-speed-dial__list",
                        props: {
                            name: this.transition,
                            mode: this.mode,
                            origin: this.origin,
                            tag: "div"
                        }
                    }, t);
                    return e("div", data, [this.$slots.activator, n])
                }
            })
        },
        1386: function(e, t, n) {
            e.exports = {}
        },
        1387: function(e, t, n) {
            e.exports = {}
        },
        1388: function(e, t, n) {
            e.exports = {}
        },
        143: function(e, t, n) {
            "use strict";
            var r = n(62);
            t.a = r.a
        },
        1433: function(e, t, n) {
            "use strict";
            n.d(t, "a", (function() {
                return h
            }));
            var r = n(459),
                o = n(14),
                l = n(38);

            function h(e, t) {
                Object(o.a)(2, arguments);
                var n = Object(l.a)(t);
                return Object(r.a)(e, -n)
            }
        },
        1438: function(e, t, n) {
            "use strict";
            n(1386);
            var r = n(60),
                o = n(7),
                l = n(18),
                h = n(1),
                d = h.a.extend({
                    name: "localable",
                    props: {
                        locale: String
                    },
                    computed: {
                        currentLocale() {
                            return this.locale || this.$vuetify.lang.current
                        }
                    }
                }),
                c = n(1268),
                m = n(13);

            function y(e, t, n) {
                const r = 7 + t - n;
                return -((7 + function(e, t = 0, n = 1) {
                    let r;
                    return e < 100 && e >= 0 ? (r = new Date(Date.UTC(e, t, n)), isFinite(r.getUTCFullYear()) && r.setUTCFullYear(e)) : r = new Date(Date.UTC(e, t, n)), r
                }(e, 0, r).getUTCDay() - t) % 7) + r - 1
            }

            function v(e, t, n) {
                const r = y(e, t, n),
                    o = y(e + 1, t, n);
                return ((k(e) ? 366 : 365) - r + o) / 7
            }

            function f(e, t, n, r, o) {
                const l = y(e, r, o),
                    h = Math.ceil((function(e, t, n, r) {
                        let o = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334][t];
                        return t > 1 && k(e) && o++, o + n
                    }(e, t, n) - l) / 7);
                return h < 1 ? h + v(e - 1, r, o) : h > v(e, r, o) ? h - v(e, r, o) : h
            }

            function k(e) {
                return e % 4 == 0 && e % 100 != 0 || e % 400 == 0
            }
            const x = /^(\d{4})-(\d{1,2})(-(\d{1,2}))?([^\d]+(\d{1,2}))?(:(\d{1,2}))?(:(\d{1,2}))?$/,
                C = /(\d\d?)(:(\d\d?)|)(:(\d\d?)|)/,
                w = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
                D = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

            function S(e) {
                const t = P(e);
                return t.day = 1, N(t), V(t), t
            }

            function E(e) {
                const t = P(e);
                return t.day = W(t.year, t.month), N(t), V(t), t
            }

            function I(input) {
                if ("number" == typeof input) return input;
                if ("string" == typeof input) {
                    const e = C.exec(input);
                    return !!e && 60 * parseInt(e[1]) + parseInt(e[3] || 0)
                }
                return "object" == typeof input && ("number" == typeof input.hour && "number" == typeof input.minute && 60 * input.hour + input.minute)
            }

            function T(input) {
                return "number" == typeof input && isFinite(input) || "string" == typeof input && !!x.exec(input) || input instanceof Date
            }

            function $(input, e = !1, t) {
                if ("number" == typeof input && isFinite(input) && (input = new Date(input)), input instanceof Date) {
                    const e = F(input);
                    return t && _(e, t, e.hasTime), e
                }
                if ("string" != typeof input) {
                    if (e) throw new Error(input + " is not a valid timestamp. It must be a Date, number of milliseconds since Epoch, or a string in the format of YYYY-MM-DD or YYYY-MM-DD hh:mm. Zero-padding is optional and seconds are ignored.");
                    return null
                }
                const n = x.exec(input);
                if (!n) {
                    if (e) throw new Error(input + " is not a valid timestamp. It must be a Date, number of milliseconds since Epoch, or a string in the format of YYYY-MM-DD or YYYY-MM-DD hh:mm. Zero-padding is optional and seconds are ignored.");
                    return null
                }
                const r = {
                    date: input,
                    time: "",
                    year: parseInt(n[1]),
                    month: parseInt(n[2]),
                    day: parseInt(n[4]) || 1,
                    hour: parseInt(n[6]) || 0,
                    minute: parseInt(n[8]) || 0,
                    weekday: 0,
                    hasDay: !!n[4],
                    hasTime: !(!n[6] || !n[8]),
                    past: !1,
                    present: !1,
                    future: !1
                };
                return N(r), V(r), t && _(r, t, r.hasTime), r
            }

            function F(e) {
                return V({
                    date: "",
                    time: "",
                    year: e.getFullYear(),
                    month: e.getMonth() + 1,
                    day: e.getDate(),
                    weekday: e.getDay(),
                    hour: e.getHours(),
                    minute: e.getMinutes(),
                    hasDay: !0,
                    hasTime: !0,
                    past: !1,
                    present: !0,
                    future: !1
                })
            }

            function M(e) {
                return 1e4 * e.year + 100 * e.month + e.day
            }

            function O(e) {
                return 100 * e.hour + e.minute
            }

            function A(e) {
                return 1e4 * M(e) + O(e)
            }

            function _(e, t, time = !1) {
                let a = M(t),
                    b = M(e),
                    n = a === b;
                return e.hasTime && time && n && (a = O(t), b = O(e), n = a === b), e.past = b < a, e.present = n, e.future = b > a, e
            }

            function H(input) {
                return input instanceof Date || "number" == typeof input && isFinite(input)
            }

            function j(e, t, n) {
                return e.hasTime !== t && (e.hasTime = t, t || (e.hour = 23, e.minute = 59, e.time = Y(e)), n && _(e, n, e.hasTime)), e
            }

            function B(e, t, n) {
                return e.hasTime = !0, e.hour = Math.floor(t / 60), e.minute = t % 60, e.time = Y(e), n && _(e, n, !0), e
            }

            function N(e) {
                return e.weekday = function(e) {
                    if (e.hasDay) {
                        const t = Math.floor,
                            n = e.day,
                            r = (e.month + 9) % 12 + 1,
                            o = t(e.year / 100),
                            l = e.year % 100 - (e.month <= 2 ? 1 : 0);
                        return ((n + t(2.6 * r - .2) - 2 * o + l + t(l / 4) + t(o / 4)) % 7 + 7) % 7
                    }
                    return e.weekday
                }(e), e
            }

            function V(e) {
                return e.time = Y(e), e.date = function(e) {
                    let t = `${L(e.year,4)}-${L(e.month,2)}`;
                    e.hasDay && (t += "-" + L(e.day, 2));
                    return t
                }(e), e
            }

            function W(e, t) {
                return k(e) ? D[t] : w[t]
            }

            function P(e) {
                const {
                    date: t,
                    time: time,
                    year: n,
                    month: r,
                    day: o,
                    weekday: l,
                    hour: h,
                    minute: d,
                    hasDay: c,
                    hasTime: m,
                    past: y,
                    present: v,
                    future: f
                } = e;
                return {
                    date: t,
                    time: time,
                    year: n,
                    month: r,
                    day: o,
                    weekday: l,
                    hour: h,
                    minute: d,
                    hasDay: c,
                    hasTime: m,
                    past: y,
                    present: v,
                    future: f
                }
            }

            function L(e, t) {
                let n = String(e);
                for (; n.length < t;) n = "0" + n;
                return n
            }

            function Y(e) {
                return e.hasTime ? `${L(e.hour,2)}:${L(e.minute,2)}` : ""
            }

            function R(e) {
                return e.day++, e.weekday = (e.weekday + 1) % 7, e.day > 28 && e.day > W(e.year, e.month) && (e.day = 1, e.month++, e.month > 12 && (e.month = 1, e.year++)), e
            }

            function z(e) {
                return e.day--, e.weekday = (e.weekday + 6) % 7, e.day < 1 && (e.month--, e.month < 1 && (e.year--, e.month = 12), e.day = W(e.year, e.month)), e
            }

            function U(e, t = R, n = 1) {
                for (; --n >= 0;) t(e);
                return e
            }

            function Z(e, t, n = R, r = 6) {
                for (; e.weekday !== t && --r >= 0;) n(e);
                return e
            }

            function K(e) {
                const time = `${L(e.hour,2)}:${L(e.minute,2)}`,
                    t = e.date;
                return new Date(`${t}T${time}:00+00:00`)
            }

            function J(e, t, n, r, o = 42, l = 0) {
                const h = M(t),
                    d = [];
                let c = P(e),
                    m = 0,
                    y = m === h;
                if (h < M(e)) throw new Error("End date is earlier than start date.");
                for (;
                    (!y || d.length < l) && d.length < o;) {
                    if (m = M(c), y = y || m === h, 0 === r[c.weekday]) {
                        c = R(c);
                        continue
                    }
                    const e = P(c);
                    V(e), _(e, n), d.push(e), c = U(c, R, r[c.weekday])
                }
                if (!d.length) throw new Error("No dates found using specified start date, end date, and weekdays.");
                return d
            }

            function G(e, t) {
                const n = (e, t) => "";
                return "undefined" == typeof Intl || void 0 === Intl.DateTimeFormat ? n : (n, r) => {
                    try {
                        return new Intl.DateTimeFormat(e || void 0, t(n, r)).format(K(n))
                    } catch (e) {
                        return ""
                    }
                }
            }
            var X = h.a.extend({
                    name: "times",
                    props: {
                        now: {
                            type: String,
                            validator: T
                        }
                    },
                    data: () => ({
                        times: {
                            now: $("0000-00-00 00:00", !0),
                            today: $("0000-00-00", !0)
                        }
                    }),
                    computed: {
                        parsedNow() {
                            return this.now ? $(this.now, !0) : null
                        }
                    },
                    watch: {
                        parsedNow: "updateTimes"
                    },
                    created() {
                        this.updateTimes(), this.setPresent()
                    },
                    methods: {
                        setPresent() {
                            this.times.now.present = this.times.today.present = !0, this.times.now.past = this.times.today.past = !1, this.times.now.future = this.times.today.future = !1
                        },
                        updateTimes() {
                            const e = this.parsedNow || this.getNow();
                            this.updateDay(e, this.times.now), this.updateTime(e, this.times.now), this.updateDay(e, this.times.today)
                        },
                        getNow: () => F(new Date),
                        updateDay(e, t) {
                            e.date !== t.date && (t.year = e.year, t.month = e.month, t.day = e.day, t.weekday = e.weekday, t.date = e.date)
                        },
                        updateTime(e, t) {
                            e.time !== t.time && (t.hour = e.hour, t.minute = e.minute, t.time = e.time)
                        }
                    }
                }),
                Q = n(106);

            function ee(e, t = 0) {
                const n = e.map(e => ({
                    event: e,
                    columnCount: 0,
                    column: 0,
                    left: 0,
                    width: 100
                }));
                return n.sort((a, b) => Math.max(t, a.event.startTimestampIdentifier) - Math.max(t, b.event.startTimestampIdentifier) || b.event.endTimestampIdentifier - a.event.endTimestampIdentifier), n
            }

            function te(e, t, n, r, o = !0) {
                return o ? !(e >= r || t <= n) : !(e > r || t < n)
            }

            function ne(e) {
                e.forEach(t => {
                    t.visuals.forEach(t => {
                        t.columnCount = e.length
                    })
                })
            }

            function se(e) {
                return [e.startTimestampIdentifier, e.endTimestampIdentifier]
            }

            function ie(e) {
                return [e.startIdentifier, e.endIdentifier]
            }

            function ae(e, t) {
                return [Math.max(t, e.startTimestampIdentifier), Math.min(t + 864e5, e.endTimestampIdentifier)]
            }

            function re(e) {
                const t = {
                    groups: [],
                    min: -1,
                    max: -1,
                    reset: () => {
                        t.groups = [], t.min = t.max = -1
                    },
                    getVisuals: (n, r, o, l = !1) => {
                        (n.weekday === e || l) && t.reset();
                        const h = ee(r, A(n));
                        return h.forEach(e => {
                            const [n, r] = o ? se(e.event) : ie(e.event);
                            t.groups.length > 0 && !te(n, r, t.min, t.max, o) && (ne(t.groups), t.reset());
                            let l = function(e, t, n, r) {
                                for (let i = 0; i < e.length; i++) {
                                    const o = e[i];
                                    let l = !1;
                                    if (te(t, n, o.start, o.end, r))
                                        for (let e = 0; e < o.visuals.length; e++) {
                                            const h = o.visuals[e],
                                                [d, c] = r ? se(h.event) : ie(h.event);
                                            if (te(t, n, d, c, r)) {
                                                l = !0;
                                                break
                                            }
                                        }
                                    if (!l) return i
                                }
                                return -1
                            }(t.groups, n, r, o); - 1 === l && (l = t.groups.length, t.groups.push({
                                start: n,
                                end: r,
                                visuals: []
                            }));
                            const h = t.groups[l];
                            h.visuals.push(e), h.start = Math.min(h.start, n), h.end = Math.max(h.end, r), e.column = l, -1 === t.min ? (t.min = n, t.max = r) : (t.min = Math.min(t.min, n), t.max = Math.max(t.max, r))
                        }), ne(t.groups), o && t.reset(), h
                    }
                };
                return t
            }

            function oe(e, t) {
                for (const n of e) {
                    const {
                        visual: r,
                        parent: o
                    } = n, l = me(n) + 1, h = o ? o.visual.left : 0, d = 100 - h, c = Math.min(5, 100 / l), m = le(n, e), y = d / (l - n.index + 1), v = d / (l - n.index + (n.sibling ? 1 : 0)) * m;
                    o && (r.left = n.sibling ? h + y : h + c), r.width = ue(n, e, t) ? 100 - r.left : Math.min(100 - r.left, 1.7 * v)
                }
            }

            function le(e, t) {
                if (!e.children.length) return 1;
                const n = e.index + t.length;
                return e.children.reduce((e, t) => Math.min(e, t.index), n) - e.index
            }

            function he(e, t) {
                const n = function(e, t) {
                    const n = [];
                    for (const r of t) te(e.start, e.end, r.start, r.end) && n.push(r.index);
                    return n
                }(e, t);
                n.sort();
                for (let i = 0; i < n.length; i++)
                    if (i < n[i]) return i;
                return !1
            }

            function de(e, t, n, r, o = !1) {
                const l = [];
                for (const o of t) o.index >= n && o.index <= r && te(e.start, e.end, o.start, o.end) && l.push(o);
                if (o && l.length > 0) {
                    const e = l.reduce((e, t) => Math.min(e, t.index), l[0].index);
                    return l.filter(t => t.index === e)
                }
                return l
            }

            function ce(e, t) {
                let n = null;
                for (const r of t) te(e.start, e.end, r.start, r.end) && (null === n || r.index > n.index) && (n = r);
                return n
            }

            function ue(e, t, n) {
                for (const r of t)
                    if (r !== e && r.index > e.index && te(e.start, ye(e.start, n), r.start, r.end)) return !1;
                return !0
            }

            function pe(e, t) {
                const [n, r] = ae(e.event, t);
                return {
                    parent: null,
                    sibling: !0,
                    index: 0,
                    visual: e,
                    start: n,
                    end: r,
                    children: []
                }
            }

            function me(e) {
                let t = e.index;
                for (const n of e.children) {
                    const e = me(n);
                    e > t && (t = e)
                }
                return t
            }

            function ye(e, t) {
                const n = e % 100,
                    r = n + t;
                return e - n + 100 * Math.floor(r / 60) + r % 60
            }
            const ve = {
                stack: (e, t, n) => {
                    const r = re(t);
                    return (e, t, o, l) => {
                        if (!o) return r.getVisuals(e, t, o, l);
                        const h = A(e),
                            d = ee(t, h),
                            c = function(e, t) {
                                const n = [];
                                for (const r of e) {
                                    const [e, o] = ae(r.event, t);
                                    let l = !1;
                                    for (const t of n)
                                        if (te(e, o, t.start, t.end)) {
                                            t.visuals.push(r), t.end = Math.max(t.end, o), l = !0;
                                            break
                                        }
                                    l || n.push({
                                        start: e,
                                        end: o,
                                        visuals: [r]
                                    })
                                }
                                return n
                            }(d, h);
                        for (const e of c) {
                            const t = [];
                            for (const r of e.visuals) {
                                const e = pe(r, h),
                                    o = he(e, t);
                                if (!1 === o) {
                                    const r = ce(e, t);
                                    r && (e.parent = r, e.sibling = te(e.start, e.end, r.start, ye(r.start, n)), e.index = r.index + 1, r.children.push(e))
                                } else {
                                    const [r] = de(e, t, o - 1, o - 1), l = de(e, t, o + 1, o + t.length, !0);
                                    e.children = l, e.index = o, r && (e.parent = r, e.sibling = te(e.start, e.end, r.start, ye(r.start, n)), r.children.push(e));
                                    for (const t of l) {
                                        t.parent === r && (t.parent = e);
                                        t.index - e.index <= 1 && e.sibling && te(e.start, ye(e.start, n), t.start, t.end) && (t.sibling = !0)
                                    }
                                }
                                t.push(e)
                            }
                            oe(t, n)
                        }
                        return d.sort((a, b) => a.left - b.left || a.event.startTimestampIdentifier - b.event.startTimestampIdentifier), d
                    }
                },
                column: (e, t, n) => {
                    const r = re(t);
                    return (e, t, n, o) => {
                        const l = r.getVisuals(e, t, n, o);
                        return n && l.forEach(e => {
                            e.left = 100 * e.column / e.columnCount, e.width = 100 / e.columnCount
                        }), l
                    }
                }
            };
            var ge = {
                base: {
                    start: {
                        type: [String, Number, Date],
                        validate: T,
                        default: () => F(new Date).date
                    },
                    end: {
                        type: [String, Number, Date],
                        validate: T
                    },
                    weekdays: {
                        type: [Array, String],
                        default: () => [0, 1, 2, 3, 4, 5, 6],
                        validate: function(input) {
                            "string" == typeof input && (input = input.split(","));
                            if (Array.isArray(input)) {
                                const e = input.map(e => parseInt(e));
                                if (e.length > 7 || 0 === e.length) return !1;
                                const t = {};
                                let n = !1;
                                for (let i = 0; i < e.length; i++) {
                                    const r = e[i];
                                    if (!isFinite(r) || r < 0 || r >= 7) return !1;
                                    if (i > 0) {
                                        const t = r - e[i - 1];
                                        if (t < 0) {
                                            if (n) return !1;
                                            n = !0
                                        } else if (0 === t) return !1
                                    }
                                    if (t[r]) return !1;
                                    t[r] = !0
                                }
                                return !0
                            }
                            return !1
                        }
                    },
                    hideHeader: {
                        type: Boolean
                    },
                    shortWeekdays: {
                        type: Boolean,
                        default: !0
                    },
                    weekdayFormat: {
                        type: Function,
                        default: null
                    },
                    dayFormat: {
                        type: Function,
                        default: null
                    }
                },
                intervals: {
                    maxDays: {
                        type: Number,
                        default: 7
                    },
                    shortIntervals: {
                        type: Boolean,
                        default: !0
                    },
                    intervalHeight: {
                        type: [Number, String],
                        default: 48,
                        validate: fe
                    },
                    intervalWidth: {
                        type: [Number, String],
                        default: 60,
                        validate: fe
                    },
                    intervalMinutes: {
                        type: [Number, String],
                        default: 60,
                        validate: fe
                    },
                    firstInterval: {
                        type: [Number, String],
                        default: 0,
                        validate: fe
                    },
                    firstTime: {
                        type: [Number, String, Object],
                        validate: function(input) {
                            return "number" == typeof input && isFinite(input) || !!C.exec(input) || "object" == typeof input && isFinite(input.hour) && isFinite(input.minute)
                        }
                    },
                    intervalCount: {
                        type: [Number, String],
                        default: 24,
                        validate: fe
                    },
                    intervalFormat: {
                        type: Function,
                        default: null
                    },
                    intervalStyle: {
                        type: Function,
                        default: null
                    },
                    showIntervalLabel: {
                        type: Function,
                        default: null
                    }
                },
                weeks: {
                    localeFirstDayOfYear: {
                        type: [String, Number],
                        default: 0
                    },
                    minWeeks: {
                        validate: fe,
                        default: 1
                    },
                    shortMonths: {
                        type: Boolean,
                        default: !0
                    },
                    showMonthOnFirst: {
                        type: Boolean,
                        default: !0
                    },
                    showWeek: Boolean,
                    monthFormat: {
                        type: Function,
                        default: null
                    }
                },
                calendar: {
                    type: {
                        type: String,
                        default: "month"
                    },
                    value: {
                        type: [String, Number, Date],
                        validate: T
                    }
                },
                category: {
                    categories: {
                        type: [Array, String],
                        default: ""
                    },
                    categoryText: {
                        type: [String, Function]
                    },
                    categoryHideDynamic: {
                        type: Boolean
                    },
                    categoryShowAll: {
                        type: Boolean
                    },
                    categoryForInvalid: {
                        type: String,
                        default: ""
                    },
                    categoryDays: {
                        type: [Number, String],
                        default: 1,
                        validate: e => isFinite(parseInt(e)) && parseInt(e) > 0
                    }
                },
                events: {
                    events: {
                        type: Array,
                        default: () => []
                    },
                    eventStart: {
                        type: String,
                        default: "start"
                    },
                    eventEnd: {
                        type: String,
                        default: "end"
                    },
                    eventTimed: {
                        type: [String, Function],
                        default: "timed"
                    },
                    eventCategory: {
                        type: [String, Function],
                        default: "category"
                    },
                    eventHeight: {
                        type: Number,
                        default: 20
                    },
                    eventColor: {
                        type: [String, Function],
                        default: "primary"
                    },
                    eventTextColor: {
                        type: [String, Function],
                        default: "white"
                    },
                    eventName: {
                        type: [String, Function],
                        default: "name"
                    },
                    eventOverlapThreshold: {
                        type: [String, Number],
                        default: 60
                    },
                    eventOverlapMode: {
                        type: [String, Function],
                        default: "stack",
                        validate: e => e in ve || "function" == typeof e
                    },
                    eventMore: {
                        type: Boolean,
                        default: !0
                    },
                    eventMoreText: {
                        type: String,
                        default: "$vuetify.calendar.moreEvents"
                    },
                    eventRipple: {
                        type: [Boolean, Object],
                        default: null
                    },
                    eventMarginBottom: {
                        type: Number,
                        default: 1
                    }
                }
            };

            function fe(input) {
                return isFinite(parseInt(input))
            }
            var be = Object(o.a)(l.a, d, c.a, m.a, X).extend({
                name: "calendar-base",
                directives: {
                    Resize: Q.a
                },
                props: ge.base,
                computed: {
                    parsedWeekdays() {
                        return Array.isArray(this.weekdays) ? this.weekdays : (this.weekdays || "").split(",").map(e => parseInt(e, 10))
                    },
                    weekdaySkips() {
                        return function(e) {
                            const t = [1, 1, 1, 1, 1, 1, 1],
                                n = [0, 0, 0, 0, 0, 0, 0];
                            for (let i = 0; i < e.length; i++) n[e[i]] = 1;
                            for (let e = 0; e < 7; e++) {
                                let r = 1;
                                for (let t = 1; t < 7; t++) {
                                    if (n[(e + t) % 7]) break;
                                    r++
                                }
                                t[e] = n[e] * r
                            }
                            return t
                        }(this.parsedWeekdays)
                    },
                    weekdaySkipsReverse() {
                        const e = this.weekdaySkips.slice();
                        return e.reverse(), e
                    },
                    parsedStart() {
                        return $(this.start, !0)
                    },
                    parsedEnd() {
                        const e = this.parsedStart,
                            t = this.end && $(this.end) || e;
                        return A(t) < A(e) ? e : t
                    },
                    days() {
                        return J(this.parsedStart, this.parsedEnd, this.times.today, this.weekdaySkips)
                    },
                    dayFormatter() {
                        if (this.dayFormat) return this.dayFormat;
                        const e = {
                            timeZone: "UTC",
                            day: "numeric"
                        };
                        return G(this.currentLocale, (t, n) => e)
                    },
                    weekdayFormatter() {
                        if (this.weekdayFormat) return this.weekdayFormat;
                        const e = {
                                timeZone: "UTC",
                                weekday: "long"
                            },
                            t = {
                                timeZone: "UTC",
                                weekday: "short"
                            };
                        return G(this.currentLocale, (n, r) => r ? t : e)
                    }
                },
                methods: {
                    getRelativeClasses: (e, t = !1) => ({
                        "v-present": e.present,
                        "v-past": e.past,
                        "v-future": e.future,
                        "v-outside": t
                    }),
                    getStartOfWeek(e) {
                        return function(e, t, n) {
                            const r = P(e);
                            return Z(r, t[0], z), V(r), n && _(r, n, r.hasTime), r
                        }(e, this.parsedWeekdays, this.times.today)
                    },
                    getEndOfWeek(e) {
                        return function(e, t, n) {
                            const r = P(e);
                            return Z(r, t[t.length - 1]), V(r), n && _(r, n, r.hasTime), r
                        }(e, this.parsedWeekdays, this.times.today)
                    },
                    getFormatter(e) {
                        return G(this.locale, (t, n) => e)
                    }
                }
            });

            function ke(e, t) {
                return t >= e.startIdentifier && t <= e.endIdentifier
            }

            function xe(e, t, n, r) {
                return n === e.startIdentifier || r === t.weekday && ke(e, n)
            }
            var Ce = be.extend({
                    name: "calendar-with-events",
                    directives: {
                        ripple: r.a
                    },
                    props: { ...ge.events,
                        ...ge.calendar,
                        ...ge.category
                    },
                    computed: {
                        noEvents() {
                            return 0 === this.events.length
                        },
                        parsedEvents() {
                            return this.events.map(this.parseEvent)
                        },
                        parsedEventOverlapThreshold() {
                            return parseInt(this.eventOverlapThreshold)
                        },
                        eventTimedFunction() {
                            return "function" == typeof this.eventTimed ? this.eventTimed : e => !!e[this.eventTimed]
                        },
                        eventCategoryFunction() {
                            return "function" == typeof this.eventCategory ? this.eventCategory : e => e[this.eventCategory]
                        },
                        eventTextColorFunction() {
                            return "function" == typeof this.eventTextColor ? this.eventTextColor : () => this.eventTextColor
                        },
                        eventNameFunction() {
                            return "function" == typeof this.eventName ? this.eventName : (e, t) => e.input[this.eventName] || ""
                        },
                        eventModeFunction() {
                            return "function" == typeof this.eventOverlapMode ? this.eventOverlapMode : ve[this.eventOverlapMode]
                        },
                        eventWeekdays() {
                            return this.parsedWeekdays
                        },
                        categoryMode() {
                            return "category" === this.type
                        }
                    },
                    methods: {
                        eventColorFunction(e) {
                            return "function" == typeof this.eventColor ? this.eventColor(e) : e.color || this.eventColor
                        },
                        parseEvent(input, e = 0) {
                            return function(input, e, t, n, r = !1, o = !1) {
                                const l = input[t],
                                    h = input[n],
                                    d = $(l, !0),
                                    c = h ? $(h, !0) : d,
                                    m = H(l) ? j(d, r) : d,
                                    y = H(h) ? j(c, r) : c,
                                    v = M(m),
                                    f = A(m),
                                    k = M(y),
                                    x = m.hasTime ? 0 : 2359;
                                return {
                                    input: input,
                                    start: m,
                                    startIdentifier: v,
                                    startTimestampIdentifier: f,
                                    end: y,
                                    endIdentifier: k,
                                    endTimestampIdentifier: A(y) + x,
                                    allDay: !m.hasTime,
                                    index: e,
                                    category: o
                                }
                            }(input, e, this.eventStart, this.eventEnd, this.eventTimedFunction(input), !!this.categoryMode && this.eventCategoryFunction(input))
                        },
                        formatTime(e, t) {
                            return this.getFormatter({
                                timeZone: "UTC",
                                hour: "numeric",
                                minute: e.minute > 0 ? "numeric" : void 0
                            })(e, !0)
                        },
                        updateEventVisibility() {
                            if (this.noEvents || !this.eventMore) return;
                            const e = this.eventHeight,
                                t = this.getEventsMap();
                            for (const n in t) {
                                const {
                                    parent: r,
                                    events: o,
                                    more: l
                                } = t[n];
                                if (!l) break;
                                const h = r.getBoundingClientRect(),
                                    d = o.length - 1,
                                    c = o.map(e => ({
                                        event: e,
                                        bottom: e.getBoundingClientRect().bottom
                                    })).sort((a, b) => a.bottom - b.bottom);
                                let m = 0;
                                for (let i = 0; i <= d; i++) {
                                    const t = c[i].bottom;
                                    (i === d ? t > h.bottom : t + e > h.bottom) && (c[i].event.style.display = "none", m++)
                                }
                                m ? (l.style.display = "", l.innerHTML = this.$vuetify.lang.t(this.eventMoreText, m)) : l.style.display = "none"
                            }
                        },
                        getEventsMap() {
                            const e = {},
                                t = this.$refs.events;
                            return t && t.forEach ? (t.forEach(t => {
                                const n = t.getAttribute("data-date");
                                t.parentElement && n && (n in e || (e[n] = {
                                    parent: t.parentElement,
                                    more: null,
                                    events: []
                                }), t.getAttribute("data-more") ? e[n].more = t : (e[n].events.push(t), t.style.display = ""))
                            }), e) : e
                        },
                        genDayEvent({
                            event: e
                        }, t) {
                            const n = this.eventHeight,
                                r = this.eventMarginBottom,
                                o = M(t),
                                l = t.week,
                                h = o === e.startIdentifier;
                            let d = o === e.endIdentifier,
                                c = 95;
                            if (!this.categoryMode)
                                for (let i = t.index + 1; i < l.length; i++) {
                                    const t = M(l[i]);
                                    if (!(e.endIdentifier >= t)) {
                                        d = !0;
                                        break
                                    }
                                    c += 100, d = d || t === e.endIdentifier
                                }
                            const m = {
                                eventParsed: e,
                                day: t,
                                start: h,
                                end: d,
                                timed: !1
                            };
                            return this.genEvent(e, m, !1, {
                                staticClass: "v-event",
                                class: {
                                    "v-event-start": h, "v-event-end": d
                                },
                                style: {
                                    height: n + "px",
                                    width: c + "%",
                                    "margin-bottom": r + "px"
                                },
                                attrs: {
                                    "data-date": t.date
                                },
                                key: e.index,
                                ref: "events",
                                refInFor: !0
                            })
                        },
                        genTimedEvent({
                            event: e,
                            left: t,
                            width: n
                        }, r) {
                            if (r.timeDelta(e.end) < 0 || r.timeDelta(e.start) >= 1 || function(e, t) {
                                    return "00:00" === e.end.time && e.end.date === t.date && e.start.date !== t.date
                                }(e, r)) return !1;
                            const o = M(r),
                                l = e.startIdentifier >= o,
                                h = e.endIdentifier > o,
                                d = l ? r.timeToY(e.start) : 0,
                                c = h ? r.timeToY(1440) : r.timeToY(e.end),
                                m = Math.max(this.eventHeight, c - d),
                                y = {
                                    eventParsed: e,
                                    day: r,
                                    start: l,
                                    end: h,
                                    timed: !0
                                };
                            return this.genEvent(e, y, !0, {
                                staticClass: "v-event-timed",
                                style: {
                                    top: d + "px",
                                    height: m + "px",
                                    left: t + "%",
                                    width: n + "%"
                                }
                            })
                        },
                        genEvent(e, t, n, data) {
                            var r;
                            const slot = this.$scopedSlots.event,
                                text = this.eventTextColorFunction(e.input),
                                o = this.eventColorFunction(e.input),
                                l = e.start.hour < 12 && e.end.hour >= 12,
                                h = (d = e.start, 525600 * ((c = e.end).year - d.year) + 43800 * (c.month - d.month) + 1440 * (c.day - d.day) + 60 * (c.hour - d.hour) + (c.minute - d.minute) <= this.parsedEventOverlapThreshold);
                            var d, c;
                            const m = this.formatTime,
                                y = () => m(e.start, l) + " - " + m(e.end, !0),
                                v = () => {
                                    const t = this.eventNameFunction(e, n);
                                    if (e.start.hasTime) {
                                        if (n) {
                                            const time = y(),
                                                e = h ? ", " : this.$createElement("br");
                                            return this.$createElement("span", {
                                                staticClass: "v-event-summary"
                                            }, [this.$createElement("strong", [t]), e, time])
                                        } {
                                            const time = m(e.start, !0);
                                            return this.$createElement("span", {
                                                staticClass: "v-event-summary"
                                            }, [this.$createElement("strong", [time]), " ", t])
                                        }
                                    }
                                    return this.$createElement("span", {
                                        staticClass: "v-event-summary"
                                    }, [t])
                                },
                                f = { ...t,
                                    event: e.input,
                                    outside: t.day.outside,
                                    singline: h,
                                    overlapsNoon: l,
                                    formatTime: m,
                                    timeSummary: y,
                                    eventSummary: v
                                };
                            return this.$createElement("div", this.setTextColor(text, this.setBackgroundColor(o, {
                                on: this.getDefaultMouseEventHandlers(":event", e => ({ ...f,
                                    nativeEvent: e
                                })),
                                directives: [{
                                    name: "ripple",
                                    value: null === (r = this.eventRipple) || void 0 === r || r
                                }],
                                ...data
                            })), slot ? slot(f) : [this.genName(v)])
                        },
                        genName(e) {
                            return this.$createElement("div", {
                                staticClass: "pl-1"
                            }, [e()])
                        },
                        genPlaceholder(e) {
                            const t = this.eventHeight + this.eventMarginBottom;
                            return this.$createElement("div", {
                                style: {
                                    height: t + "px"
                                },
                                attrs: {
                                    "data-date": e.date
                                },
                                ref: "events",
                                refInFor: !0
                            })
                        },
                        genMore(e) {
                            var t;
                            const n = this.eventHeight,
                                r = this.eventMarginBottom;
                            return this.$createElement("div", {
                                staticClass: "v-event-more pl-1",
                                class: {
                                    "v-outside": e.outside
                                },
                                attrs: {
                                    "data-date": e.date,
                                    "data-more": 1
                                },
                                directives: [{
                                    name: "ripple",
                                    value: null === (t = this.eventRipple) || void 0 === t || t
                                }],
                                on: this.getDefaultMouseEventHandlers(":more", t => ({
                                    nativeEvent: t,
                                    ...e
                                })),
                                style: {
                                    display: "none",
                                    height: n + "px",
                                    "margin-bottom": r + "px"
                                },
                                ref: "events",
                                refInFor: !0
                            })
                        },
                        getVisibleEvents() {
                            const e = M(this.days[0]),
                                t = M(this.days[this.days.length - 1]);
                            return this.parsedEvents.filter(n => function(e, t, n) {
                                return t <= e.endIdentifier && n >= e.startIdentifier
                            }(n, e, t))
                        },
                        isEventForCategory(e, t) {
                            return !this.categoryMode || "object" == typeof t && t.categoryName && t.categoryName === e.category || "string" == typeof e.category && t === e.category || "string" != typeof e.category && null === t
                        },
                        getEventsForDay(e) {
                            const t = M(e),
                                n = this.eventWeekdays[0];
                            return this.parsedEvents.filter(r => xe(r, e, t, n))
                        },
                        getEventsForDayAll(e) {
                            const t = M(e),
                                n = this.eventWeekdays[0];
                            return this.parsedEvents.filter(r => r.allDay && (this.categoryMode ? ke(r, t) : xe(r, e, t, n)) && this.isEventForCategory(r, e.category))
                        },
                        getEventsForDayTimed(e) {
                            const t = M(e);
                            return this.parsedEvents.filter(n => !n.allDay && ke(n, t) && this.isEventForCategory(n, e.category))
                        },
                        getScopedSlots() {
                            if (this.noEvents) return { ...this.$scopedSlots
                            };
                            const e = this.eventModeFunction(this.parsedEvents, this.eventWeekdays[0], this.parsedEventOverlapThreshold),
                                t = input => !!input,
                                n = (n, r, o, l) => {
                                    const h = r(n),
                                        d = e(n, h, l, this.categoryMode);
                                    if (l) return d.map(e => o(e, n)).filter(t);
                                    const c = [];
                                    return d.forEach((e, t) => {
                                        for (; c.length < e.column;) c.push(this.genPlaceholder(n));
                                        const r = o(e, n);
                                        r && c.push(r)
                                    }), c
                                },
                                r = this.$scopedSlots,
                                o = r.day,
                                l = r["day-header"],
                                h = r["day-body"];
                            return { ...r,
                                day: e => {
                                    let t = n(e, this.getEventsForDay, this.genDayEvent, !1);
                                    if (t && t.length > 0 && this.eventMore && t.push(this.genMore(e)), o) {
                                        const slot = o(e);
                                        slot && (t = t ? t.concat(slot) : slot)
                                    }
                                    return t
                                },
                                "day-header": e => {
                                    let t = n(e, this.getEventsForDayAll, this.genDayEvent, !1);
                                    if (l) {
                                        const slot = l(e);
                                        slot && (t = t ? t.concat(slot) : slot)
                                    }
                                    return t
                                },
                                "day-body": e => {
                                    const t = n(e, this.getEventsForDayTimed, this.genTimedEvent, !0);
                                    let r = [this.$createElement("div", {
                                        staticClass: "v-event-timed-container"
                                    }, t)];
                                    if (h) {
                                        const slot = h(e);
                                        slot && (r = r.concat(slot))
                                    }
                                    return r
                                }
                            }
                        }
                    }
                }),
                we = (n(1287), n(61)),
                De = n(2),
                Se = be.extend({
                    name: "v-calendar-weekly",
                    props: ge.weeks,
                    computed: {
                        staticClass: () => "v-calendar-weekly",
                        classes() {
                            return this.themeClasses
                        },
                        parsedMinWeeks() {
                            return parseInt(this.minWeeks)
                        },
                        days() {
                            const e = this.parsedMinWeeks * this.parsedWeekdays.length;
                            return J(this.getStartOfWeek(this.parsedStart), this.getEndOfWeek(this.parsedEnd), this.times.today, this.weekdaySkips, Number.MAX_SAFE_INTEGER, e)
                        },
                        todayWeek() {
                            const e = this.times.today;
                            return J(this.getStartOfWeek(e), this.getEndOfWeek(e), e, this.weekdaySkips, this.parsedWeekdays.length, this.parsedWeekdays.length)
                        },
                        monthFormatter() {
                            if (this.monthFormat) return this.monthFormat;
                            const e = {
                                    timeZone: "UTC",
                                    month: "long"
                                },
                                t = {
                                    timeZone: "UTC",
                                    month: "short"
                                };
                            return G(this.currentLocale, (n, r) => r ? t : e)
                        }
                    },
                    methods: {
                        isOutside(e) {
                            const t = M(e);
                            return t < M(this.parsedStart) || t > M(this.parsedEnd)
                        },
                        genHead() {
                            return this.$createElement("div", {
                                staticClass: "v-calendar-weekly__head",
                                attrs: {
                                    role: "row"
                                }
                            }, this.genHeadDays())
                        },
                        genHeadDays() {
                            const header = this.todayWeek.map(this.genHeadDay);
                            return this.showWeek && header.unshift(this.$createElement("div", {
                                staticClass: "v-calendar-weekly__head-weeknumber"
                            })), header
                        },
                        genHeadDay(e, t) {
                            const n = this.isOutside(this.days[t]),
                                r = e.present ? this.color : void 0;
                            return this.$createElement("div", this.setTextColor(r, {
                                key: e.date,
                                staticClass: "v-calendar-weekly__head-weekday",
                                class: this.getRelativeClasses(e, n),
                                attrs: {
                                    role: "columnheader"
                                }
                            }), this.weekdayFormatter(e, this.shortWeekdays))
                        },
                        genWeeks() {
                            const e = this.days,
                                t = this.parsedWeekdays.length,
                                n = [];
                            for (let i = 0; i < e.length; i += t) n.push(this.genWeek(e.slice(i, i + t), this.getWeekNumber(e[i])));
                            return n
                        },
                        genWeek(e, t) {
                            const n = e.map((t, n) => this.genDay(t, n, e));
                            return this.showWeek && n.unshift(this.genWeekNumber(t)), this.$createElement("div", {
                                key: e[0].date,
                                staticClass: "v-calendar-weekly__week",
                                attrs: {
                                    role: "row"
                                }
                            }, n)
                        },
                        getWeekNumber(e) {
                            return f(e.year, e.month - 1, e.day, this.parsedWeekdays[0], parseInt(this.localeFirstDayOfYear))
                        },
                        genWeekNumber(e) {
                            return this.$createElement("div", {
                                staticClass: "v-calendar-weekly__weeknumber"
                            }, [this.$createElement("small", String(e))])
                        },
                        genDay(e, t, n) {
                            const r = this.isOutside(e);
                            return this.$createElement("div", {
                                key: e.date,
                                staticClass: "v-calendar-weekly__day",
                                class: this.getRelativeClasses(e, r),
                                attrs: {
                                    role: "cell"
                                },
                                on: this.getDefaultMouseEventHandlers(":day", t => ({
                                    nativeEvent: t,
                                    ...e
                                }))
                            }, [this.genDayLabel(e), ...Object(De.r)(this, "day", () => ({
                                outside: r,
                                index: t,
                                week: n,
                                ...e
                            })) || []])
                        },
                        genDayLabel(e) {
                            return this.$createElement("div", {
                                staticClass: "v-calendar-weekly__day-label"
                            }, Object(De.r)(this, "day-label", e) || [this.genDayLabelButton(e)])
                        },
                        genDayLabelButton(e) {
                            const t = e.present ? this.color : "transparent",
                                n = 1 === e.day && this.showMonthOnFirst;
                            return this.$createElement(we.a, {
                                props: {
                                    color: t,
                                    fab: !0,
                                    depressed: !0,
                                    small: !0
                                },
                                on: this.getMouseEventHandlers({
                                    "click:date": {
                                        event: "click",
                                        stop: !0
                                    },
                                    "contextmenu:date": {
                                        event: "contextmenu",
                                        stop: !0,
                                        prevent: !0,
                                        result: !1
                                    }
                                }, t => ({
                                    nativeEvent: t,
                                    ...e
                                }))
                            }, n ? this.monthFormatter(e, this.shortMonths) + " " + this.dayFormatter(e, !1) : this.dayFormatter(e, !1))
                        },
                        genDayMonth(e) {
                            const t = e.present ? this.color : void 0;
                            return this.$createElement("div", this.setTextColor(t, {
                                staticClass: "v-calendar-weekly__day-month"
                            }), Object(De.r)(this, "day-month", e) || this.monthFormatter(e, this.shortMonths))
                        }
                    },
                    render(e) {
                        return e("div", {
                            staticClass: this.staticClass,
                            class: this.classes,
                            on: {
                                dragstart: e => {
                                    e.preventDefault()
                                }
                            }
                        }, [this.hideHeader ? "" : this.genHead(), ...this.genWeeks()])
                    }
                }),
                Ee = Se.extend({
                    name: "v-calendar-monthly",
                    computed: {
                        staticClass: () => "v-calendar-monthly v-calendar-weekly",
                        parsedStart() {
                            return S($(this.start, !0))
                        },
                        parsedEnd() {
                            return E($(this.end, !0))
                        }
                    }
                }),
                Ie = (n(1387), be.extend({
                    name: "calendar-with-intervals",
                    props: ge.intervals,
                    computed: {
                        parsedFirstInterval() {
                            return parseInt(this.firstInterval)
                        },
                        parsedIntervalMinutes() {
                            return parseInt(this.intervalMinutes)
                        },
                        parsedIntervalCount() {
                            return parseInt(this.intervalCount)
                        },
                        parsedIntervalHeight() {
                            return parseFloat(this.intervalHeight)
                        },
                        parsedFirstTime() {
                            return I(this.firstTime)
                        },
                        firstMinute() {
                            const time = this.parsedFirstTime;
                            return !1 !== time && time >= 0 && time <= 1440 ? time : this.parsedFirstInterval * this.parsedIntervalMinutes
                        },
                        bodyHeight() {
                            return this.parsedIntervalCount * this.parsedIntervalHeight
                        },
                        days() {
                            return J(this.parsedStart, this.parsedEnd, this.times.today, this.weekdaySkips, this.maxDays)
                        },
                        intervals() {
                            const e = this.days,
                                t = this.firstMinute,
                                n = this.parsedIntervalMinutes,
                                r = this.parsedIntervalCount,
                                o = this.times.now;
                            return e.map(e => function(e, t, n, r, o) {
                                const l = [];
                                for (let i = 0; i < r; i++) {
                                    const r = t + i * n,
                                        h = P(e);
                                    l.push(B(h, r, o))
                                }
                                return l
                            }(e, t, n, r, o))
                        },
                        intervalFormatter() {
                            if (this.intervalFormat) return this.intervalFormat;
                            const e = {
                                    timeZone: "UTC",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                },
                                t = {
                                    timeZone: "UTC",
                                    hour: "numeric",
                                    minute: "2-digit"
                                },
                                n = {
                                    timeZone: "UTC",
                                    hour: "numeric"
                                };
                            return G(this.currentLocale, (r, o) => o ? 0 === r.minute ? n : t : e)
                        }
                    },
                    methods: {
                        showIntervalLabelDefault(e) {
                            const t = this.intervals[0][0];
                            return !(t.hour === e.hour && t.minute === e.minute)
                        },
                        intervalStyleDefault(e) {},
                        getTimestampAtEvent(e, t) {
                            const n = P(t),
                                r = e.currentTarget.getBoundingClientRect(),
                                o = this.firstMinute,
                                l = e,
                                h = e,
                                d = l.changedTouches || l.touches,
                                c = ((d && d[0] ? d[0].clientY : h.clientY) - r.top) / this.parsedIntervalHeight;
                            return B(n, o + Math.floor(c * this.parsedIntervalMinutes), this.times.now)
                        },
                        getSlotScope(e) {
                            const t = P(e);
                            return t.timeToY = this.timeToY, t.timeDelta = this.timeDelta, t.minutesToPixels = this.minutesToPixels, t.week = this.days, t
                        },
                        scrollToTime(time) {
                            const e = this.timeToY(time),
                                t = this.$refs.scrollArea;
                            return !(!1 === e || !t) && (t.scrollTop = e, !0)
                        },
                        minutesToPixels(e) {
                            return e / this.parsedIntervalMinutes * this.parsedIntervalHeight
                        },
                        timeToY(time, e = !0) {
                            let t = this.timeDelta(time);
                            return !1 !== t && (t *= this.bodyHeight, e && (t < 0 && (t = 0), t > this.bodyHeight && (t = this.bodyHeight))), t
                        },
                        timeDelta(time) {
                            const e = I(time);
                            if (!1 === e) return !1;
                            return (e - this.firstMinute) / (this.parsedIntervalCount * this.parsedIntervalMinutes)
                        }
                    }
                }).extend({
                    name: "v-calendar-daily",
                    directives: {
                        Resize: Q.a
                    },
                    data: () => ({
                        scrollPush: 0
                    }),
                    computed: {
                        classes() {
                            return {
                                "v-calendar-daily": !0,
                                ...this.themeClasses
                            }
                        }
                    },
                    mounted() {
                        this.init()
                    },
                    methods: {
                        init() {
                            this.$nextTick(this.onResize)
                        },
                        onResize() {
                            this.scrollPush = this.getScrollPush()
                        },
                        getScrollPush() {
                            const area = this.$refs.scrollArea,
                                e = this.$refs.pane;
                            return area && e ? area.offsetWidth - e.offsetWidth : 0
                        },
                        genHead() {
                            return this.$createElement("div", {
                                staticClass: "v-calendar-daily__head",
                                style: {
                                    marginRight: this.scrollPush + "px"
                                }
                            }, [this.genHeadIntervals(), ...this.genHeadDays()])
                        },
                        genHeadIntervals() {
                            const e = Object(De.h)(this.intervalWidth);
                            return this.$createElement("div", {
                                staticClass: "v-calendar-daily__intervals-head",
                                style: {
                                    width: e
                                }
                            }, Object(De.r)(this, "interval-header"))
                        },
                        genHeadDays() {
                            return this.days.map(this.genHeadDay)
                        },
                        genHeadDay(e, t) {
                            return this.$createElement("div", {
                                key: e.date,
                                staticClass: "v-calendar-daily_head-day",
                                class: this.getRelativeClasses(e),
                                on: this.getDefaultMouseEventHandlers(":day", t => ({
                                    nativeEvent: t,
                                    ...this.getSlotScope(e)
                                }))
                            }, [this.genHeadWeekday(e), this.genHeadDayLabel(e), ...this.genDayHeader(e, t)])
                        },
                        genDayHeader(e, t) {
                            return Object(De.r)(this, "day-header", () => ({
                                week: this.days,
                                ...e,
                                index: t
                            })) || []
                        },
                        genHeadWeekday(e) {
                            const t = e.present ? this.color : void 0;
                            return this.$createElement("div", this.setTextColor(t, {
                                staticClass: "v-calendar-daily_head-weekday"
                            }), this.weekdayFormatter(e, this.shortWeekdays))
                        },
                        genHeadDayLabel(e) {
                            return this.$createElement("div", {
                                staticClass: "v-calendar-daily_head-day-label"
                            }, Object(De.r)(this, "day-label-header", e) || [this.genHeadDayButton(e)])
                        },
                        genHeadDayButton(e) {
                            const t = e.present ? this.color : "transparent";
                            return this.$createElement(we.a, {
                                props: {
                                    color: t,
                                    fab: !0,
                                    depressed: !0
                                },
                                on: this.getMouseEventHandlers({
                                    "click:date": {
                                        event: "click",
                                        stop: !0
                                    },
                                    "contextmenu:date": {
                                        event: "contextmenu",
                                        stop: !0,
                                        prevent: !0,
                                        result: !1
                                    }
                                }, t => ({
                                    nativeEvent: t,
                                    ...e
                                }))
                            }, this.dayFormatter(e, !1))
                        },
                        genBody() {
                            return this.$createElement("div", {
                                staticClass: "v-calendar-daily__body"
                            }, [this.genScrollArea()])
                        },
                        genScrollArea() {
                            return this.$createElement("div", {
                                ref: "scrollArea",
                                staticClass: "v-calendar-daily__scroll-area"
                            }, [this.genPane()])
                        },
                        genPane() {
                            return this.$createElement("div", {
                                ref: "pane",
                                staticClass: "v-calendar-daily__pane",
                                style: {
                                    height: Object(De.h)(this.bodyHeight)
                                }
                            }, [this.genDayContainer()])
                        },
                        genDayContainer() {
                            return this.$createElement("div", {
                                staticClass: "v-calendar-daily__day-container"
                            }, [this.genBodyIntervals(), ...this.genDays()])
                        },
                        genDays() {
                            return this.days.map(this.genDay)
                        },
                        genDay(e, t) {
                            return this.$createElement("div", {
                                key: e.date,
                                staticClass: "v-calendar-daily__day",
                                class: this.getRelativeClasses(e),
                                on: this.getDefaultMouseEventHandlers(":time", t => ({
                                    nativeEvent: t,
                                    ...this.getSlotScope(this.getTimestampAtEvent(t, e))
                                }))
                            }, [...this.genDayIntervals(t), ...this.genDayBody(e)])
                        },
                        genDayBody(e) {
                            return Object(De.r)(this, "day-body", () => this.getSlotScope(e)) || []
                        },
                        genDayIntervals(e) {
                            return this.intervals[e].map(this.genDayInterval)
                        },
                        genDayInterval(e) {
                            const t = Object(De.h)(this.intervalHeight),
                                n = this.intervalStyle || this.intervalStyleDefault,
                                data = {
                                    key: e.time,
                                    staticClass: "v-calendar-daily__day-interval",
                                    style: {
                                        height: t,
                                        ...n(e)
                                    }
                                },
                                r = Object(De.r)(this, "interval", () => this.getSlotScope(e));
                            return this.$createElement("div", data, r)
                        },
                        genBodyIntervals() {
                            const data = {
                                staticClass: "v-calendar-daily__intervals-body",
                                style: {
                                    width: Object(De.h)(this.intervalWidth)
                                },
                                on: this.getDefaultMouseEventHandlers(":interval", e => ({
                                    nativeEvent: e,
                                    ...this.getTimestampAtEvent(e, this.parsedStart)
                                }))
                            };
                            return this.$createElement("div", data, this.genIntervalLabels())
                        },
                        genIntervalLabels() {
                            return this.intervals.length ? this.intervals[0].map(this.genIntervalLabel) : null
                        },
                        genIntervalLabel(e) {
                            const t = Object(De.h)(this.intervalHeight),
                                n = this.shortIntervals,
                                label = (this.showIntervalLabel || this.showIntervalLabelDefault)(e) ? this.intervalFormatter(e, n) : void 0;
                            return this.$createElement("div", {
                                key: e.time,
                                staticClass: "v-calendar-daily__interval",
                                style: {
                                    height: t
                                }
                            }, [this.$createElement("div", {
                                staticClass: "v-calendar-daily__interval-text"
                            }, label)])
                        }
                    },
                    render(e) {
                        return e("div", {
                            class: this.classes,
                            on: {
                                dragstart: e => {
                                    e.preventDefault()
                                }
                            },
                            directives: [{
                                modifiers: {
                                    quiet: !0
                                },
                                name: "resize",
                                value: this.onResize
                            }]
                        }, [this.hideHeader ? "" : this.genHead(), this.genBody()])
                    }
                }));
            n(1388);

            function Te(e, t) {
                return "string" == typeof e ? e.split(/\s*,\s/) : Array.isArray(e) ? e.map(e => {
                    if ("string" == typeof e) return e;
                    const n = "string" == typeof e.categoryName ? e.categoryName : function(e, t) {
                        return "string" == typeof t && "object" == typeof e && e ? e[t] : "function" == typeof t ? t(e) : e
                    }(e, t);
                    return { ...e,
                        categoryName: n
                    }
                }) : []
            }
            var $e = Ie.extend({
                name: "v-calendar-category",
                props: ge.category,
                computed: {
                    classes() {
                        return {
                            "v-calendar-daily": !0,
                            "v-calendar-category": !0,
                            ...this.themeClasses
                        }
                    },
                    parsedCategories() {
                        return Te(this.categories, this.categoryText)
                    }
                },
                methods: {
                    genDayHeader(e, t) {
                        const n = {
                                week: this.days,
                                ...e,
                                index: t
                            },
                            r = this.parsedCategories.map(t => this.genDayHeaderCategory(e, this.getCategoryScope(n, t)));
                        return [this.$createElement("div", {
                            staticClass: "v-calendar-category__columns"
                        }, r)]
                    },
                    getCategoryScope(e, t) {
                        return { ...e,
                            category: "object" == typeof t && t && t.categoryName === this.categoryForInvalid ? null : t
                        }
                    },
                    genDayHeaderCategory(e, t) {
                        const n = "object" == typeof t.category ? t.category.categoryName : t.category;
                        return this.$createElement("div", {
                            staticClass: "v-calendar-category__column-header",
                            on: this.getDefaultMouseEventHandlers(":day-category", n => this.getCategoryScope(this.getSlotScope(e), t.category))
                        }, [Object(De.r)(this, "category", t) || this.genDayHeaderCategoryTitle(n), Object(De.r)(this, "day-header", t)])
                    },
                    genDayHeaderCategoryTitle(e) {
                        return this.$createElement("div", {
                            staticClass: "v-calendar-category__category"
                        }, null === e ? this.categoryForInvalid : e)
                    },
                    genDays() {
                        const e = [];
                        return this.days.forEach((t, n) => {
                            const r = new Array(this.parsedCategories.length || 1);
                            r.fill(t), e.push(...r.map((e, i) => this.genDay(e, n, i)))
                        }), e
                    },
                    genDay(e, t, n) {
                        const r = this.parsedCategories[n];
                        return this.$createElement("div", {
                            key: e.date + "-" + n,
                            staticClass: "v-calendar-daily__day",
                            class: this.getRelativeClasses(e),
                            on: this.getDefaultMouseEventHandlers(":time", t => this.getSlotScope(this.getTimestampAtEvent(t, e)))
                        }, [...this.genDayIntervals(t, r), ...this.genDayBody(e, r)])
                    },
                    genDayIntervals(e, t) {
                        return this.intervals[e].map(e => this.genDayInterval(e, t))
                    },
                    genDayInterval(e, t) {
                        const n = Object(De.h)(this.intervalHeight),
                            r = this.intervalStyle || this.intervalStyleDefault,
                            data = {
                                key: e.time,
                                staticClass: "v-calendar-daily__day-interval",
                                style: {
                                    height: n,
                                    ...r({ ...e,
                                        category: t
                                    })
                                }
                            },
                            o = Object(De.r)(this, "interval", () => this.getCategoryScope(this.getSlotScope(e), t));
                        return this.$createElement("div", data, o)
                    },
                    genDayBody(e, t) {
                        const n = [this.genDayBodyCategory(e, t)];
                        return [this.$createElement("div", {
                            staticClass: "v-calendar-category__columns"
                        }, n)]
                    },
                    genDayBodyCategory(e, t) {
                        const data = {
                                staticClass: "v-calendar-category__column",
                                on: this.getDefaultMouseEventHandlers(":time-category", n => this.getCategoryScope(this.getSlotScope(this.getTimestampAtEvent(n, e)), t))
                            },
                            n = Object(De.r)(this, "day-body", () => this.getCategoryScope(this.getSlotScope(e), t));
                        return this.$createElement("div", data, n)
                    }
                }
            });
            t.a = Ce.extend({
                name: "v-calendar",
                props: { ...ge.calendar,
                    ...ge.weeks,
                    ...ge.intervals,
                    ...ge.category
                },
                data: () => ({
                    lastStart: null,
                    lastEnd: null
                }),
                computed: {
                    parsedValue() {
                        return T(this.value) ? $(this.value, !0) : this.parsedStart || this.times.today
                    },
                    parsedCategoryDays() {
                        return parseInt(this.categoryDays) || 1
                    },
                    renderProps() {
                        const e = this.parsedValue;
                        let component = null,
                            t = this.maxDays,
                            n = this.parsedWeekdays,
                            r = this.parsedCategories,
                            o = e,
                            l = e;
                        switch (this.type) {
                            case "month":
                                component = Ee, o = S(e), l = E(e);
                                break;
                            case "week":
                                component = Ie, o = this.getStartOfWeek(e), l = this.getEndOfWeek(e), t = 7;
                                break;
                            case "day":
                                component = Ie, t = 1, n = [o.weekday];
                                break;
                            case "4day":
                                component = Ie, l = U(P(l), R, 3), V(l), t = 4, n = [o.weekday, (o.weekday + 1) % 7, (o.weekday + 2) % 7, (o.weekday + 3) % 7];
                                break;
                            case "custom-weekly":
                                component = Se, o = this.parsedStart || e, l = this.parsedEnd;
                                break;
                            case "custom-daily":
                                component = Ie, o = this.parsedStart || e, l = this.parsedEnd;
                                break;
                            case "category":
                                const h = this.parsedCategoryDays;
                                component = $e, l = U(P(l), R, h), V(l), t = h, n = [];
                                for (let i = 0; i < h; i++) n.push((o.weekday + i) % 7);
                                r = this.getCategoryList(r);
                                break;
                            default:
                                throw new Error(this.type + " is not a valid Calendar type")
                        }
                        return {
                            component: component,
                            start: o,
                            end: l,
                            maxDays: t,
                            weekdays: n,
                            categories: r
                        }
                    },
                    eventWeekdays() {
                        return this.renderProps.weekdays
                    },
                    categoryMode() {
                        return "category" === this.type
                    },
                    title() {
                        const {
                            start: e,
                            end: t
                        } = this.renderProps, n = e.year !== t.year, r = n || e.month !== t.month;
                        return n ? this.monthShortFormatter(e, !0) + " " + e.year + " - " + this.monthShortFormatter(t, !0) + " " + t.year : r ? this.monthShortFormatter(e, !0) + " - " + this.monthShortFormatter(t, !0) + " " + t.year : this.monthLongFormatter(e, !1) + " " + e.year
                    },
                    monthLongFormatter() {
                        return this.getFormatter({
                            timeZone: "UTC",
                            month: "long"
                        })
                    },
                    monthShortFormatter() {
                        return this.getFormatter({
                            timeZone: "UTC",
                            month: "short"
                        })
                    },
                    parsedCategories() {
                        return Te(this.categories, this.categoryText)
                    }
                },
                watch: {
                    renderProps: "checkChange"
                },
                mounted() {
                    this.updateEventVisibility(), this.checkChange()
                },
                updated() {
                    window.requestAnimationFrame(this.updateEventVisibility)
                },
                methods: {
                    checkChange() {
                        const {
                            lastStart: e,
                            lastEnd: t
                        } = this, {
                            start: n,
                            end: r
                        } = this.renderProps;
                        e && t && n.date === e.date && r.date === t.date || (this.lastStart = n, this.lastEnd = r, this.$emit("change", {
                            start: n,
                            end: r
                        }))
                    },
                    move(e = 1) {
                        const t = P(this.parsedValue),
                            n = e > 0,
                            r = n ? R : z,
                            o = n ? 31 : 1;
                        let l = n ? e : -e;
                        for (; --l >= 0;) switch (this.type) {
                            case "month":
                                t.day = o, r(t);
                                break;
                            case "week":
                                U(t, r, 7);
                                break;
                            case "day":
                                U(t, r, 1);
                                break;
                            case "4day":
                                U(t, r, 4);
                                break;
                            case "category":
                                U(t, r, this.parsedCategoryDays)
                        }
                        N(t), V(t), _(t, this.times.now), this.value instanceof Date ? this.$emit("input", K(t)) : "number" == typeof this.value ? this.$emit("input", K(t).getTime()) : this.$emit("input", t.date), this.$emit("moved", t)
                    },
                    next(e = 1) {
                        this.move(e)
                    },
                    prev(e = 1) {
                        this.move(-e)
                    },
                    timeToY(time, e = !0) {
                        const t = this.$children[0];
                        return !(!t || !t.timeToY) && t.timeToY(time, e)
                    },
                    timeDelta(time) {
                        const e = this.$children[0];
                        return !(!e || !e.timeDelta) && e.timeDelta(time)
                    },
                    minutesToPixels(e) {
                        const t = this.$children[0];
                        return t && t.minutesToPixels ? t.minutesToPixels(e) : -1
                    },
                    scrollToTime(time) {
                        const e = this.$children[0];
                        return !(!e || !e.scrollToTime) && e.scrollToTime(time)
                    },
                    parseTimestamp(input, e) {
                        return $(input, e, this.times.now)
                    },
                    timestampToDate: e => K(e),
                    getCategoryList(e) {
                        if (!this.noEvents) {
                            const t = e.reduce((map, e, t) => ("object" == typeof e && e.categoryName ? map[e.categoryName] = {
                                index: t,
                                count: 0
                            } : "string" == typeof e && (map[e] = {
                                index: t,
                                count: 0
                            }), map), {});
                            if (!this.categoryHideDynamic || !this.categoryShowAll) {
                                let n = e.length;
                                this.parsedEvents.forEach(e => {
                                    let r = e.category;
                                    "string" != typeof r && (r = this.categoryForInvalid), r && (r in t ? t[r].count++ : this.categoryHideDynamic || (t[r] = {
                                        index: n++,
                                        count: 1
                                    }))
                                })
                            }
                            if (!this.categoryShowAll)
                                for (const e in t) 0 === t[e].count && delete t[e];
                            e = e.filter(e => "object" == typeof e && e.categoryName ? t.hasOwnProperty(e.categoryName) : "string" == typeof e && t.hasOwnProperty(e))
                        }
                        return e
                    }
                },
                render(e) {
                    const {
                        start: t,
                        end: n,
                        maxDays: r,
                        component: component,
                        weekdays: o,
                        categories: l
                    } = this.renderProps;
                    return e(component, {
                        staticClass: "v-calendar",
                        class: {
                            "v-calendar-events": !this.noEvents
                        },
                        props: { ...this.$props,
                            start: t.date,
                            end: n.date,
                            maxDays: r,
                            weekdays: o,
                            categories: l
                        },
                        attrs: {
                            role: "grid"
                        },
                        directives: [{
                            modifiers: {
                                quiet: !0
                            },
                            name: "resize",
                            value: this.updateEventVisibility
                        }],
                        on: { ...this.$listeners,
                            "click:date": (e, t) => {
                                this.$listeners.input && this.$emit("input", e.date), this.$listeners["click:date"] && this.$emit("click:date", e, t)
                            }
                        },
                        scopedSlots: this.getScopedSlots()
                    })
                }
            })
        },
        943: function(e, t, n) {
            "use strict";
            var r = n(60),
                o = n(1);
            t.a = o.a.extend({
                name: "rippleable",
                directives: {
                    ripple: r.a
                },
                props: {
                    ripple: {
                        type: [Boolean, Object],
                        default: !0
                    }
                },
                methods: {
                    genRipple(data = {}) {
                        return this.ripple ? (data.staticClass = "v-input--selection-controls__ripple", data.directives = data.directives || [], data.directives.push({
                            name: "ripple",
                            value: {
                                center: !0
                            }
                        }), this.$createElement("div", data)) : null
                    }
                }
            })
        },
        944: function(e, t, n) {
            e.exports = {}
        },
        945: function(e, t, n) {
            "use strict";
            n.d(t, "b", (function() {
                return d
            }));
            var r = n(68),
                o = n(943),
                l = n(147),
                h = n(7);

            function d(e) {
                e.preventDefault()
            }
            t.a = Object(h.a)(r.a, o.a, l.a).extend({
                name: "selectable",
                model: {
                    prop: "inputValue",
                    event: "change"
                },
                props: {
                    id: String,
                    inputValue: null,
                    falseValue: null,
                    trueValue: null,
                    multiple: {
                        type: Boolean,
                        default: null
                    },
                    label: String
                },
                data() {
                    return {
                        hasColor: this.inputValue,
                        lazyValue: this.inputValue
                    }
                },
                computed: {
                    computedColor() {
                        if (this.isActive) return this.color ? this.color : this.isDark && !this.appIsDark ? "white" : "primary"
                    },
                    isMultiple() {
                        return !0 === this.multiple || null === this.multiple && Array.isArray(this.internalValue)
                    },
                    isActive() {
                        const e = this.value,
                            input = this.internalValue;
                        return this.isMultiple ? !!Array.isArray(input) && input.some(t => this.valueComparator(t, e)) : void 0 === this.trueValue || void 0 === this.falseValue ? e ? this.valueComparator(e, input) : Boolean(input) : this.valueComparator(input, this.trueValue)
                    },
                    isDirty() {
                        return this.isActive
                    },
                    rippleState() {
                        return this.isDisabled || this.validationState ? this.validationState : void 0
                    }
                },
                watch: {
                    inputValue(e) {
                        this.lazyValue = e, this.hasColor = e
                    }
                },
                methods: {
                    genLabel() {
                        const label = r.a.options.methods.genLabel.call(this);
                        return label ? (label.data.on = {
                            click: d
                        }, label) : label
                    },
                    genInput(e, t) {
                        return this.$createElement("input", {
                            attrs: Object.assign({
                                "aria-checked": this.isActive.toString(),
                                disabled: this.isDisabled,
                                id: this.computedId,
                                role: e,
                                type: e
                            }, t),
                            domProps: {
                                value: this.value,
                                checked: this.isActive
                            },
                            on: {
                                blur: this.onBlur,
                                change: this.onChange,
                                focus: this.onFocus,
                                keydown: this.onKeydown,
                                click: d
                            },
                            ref: "input"
                        })
                    },
                    onClick(e) {
                        this.onChange(), this.$emit("click", e)
                    },
                    onChange() {
                        if (!this.isInteractive) return;
                        const e = this.value;
                        let input = this.internalValue;
                        if (this.isMultiple) {
                            Array.isArray(input) || (input = []);
                            const t = input.length;
                            input = input.filter(t => !this.valueComparator(t, e)), input.length === t && input.push(e)
                        } else input = void 0 !== this.trueValue && void 0 !== this.falseValue ? this.valueComparator(input, this.trueValue) ? this.falseValue : this.trueValue : e ? this.valueComparator(input, e) ? null : e : !input;
                        this.validate(!0, input), this.internalValue = input, this.hasColor = input
                    },
                    onFocus(e) {
                        this.isFocused = !0, this.$emit("focus", e)
                    },
                    onBlur(e) {
                        this.isFocused = !1, this.$emit("blur", e)
                    },
                    onKeydown(e) {}
                }
            })
        },
        952: function(e, t, n) {
            e.exports = {}
        },
        993: function(e, t, n) {
            e.exports = {}
        },
        998: function(e, t, n) {
            "use strict";
            n(952), n(944);
            var r = n(67),
                o = n(68),
                l = n(945);
            t.a = l.a.extend({
                name: "v-checkbox",
                props: {
                    indeterminate: Boolean,
                    indeterminateIcon: {
                        type: String,
                        default: "$checkboxIndeterminate"
                    },
                    offIcon: {
                        type: String,
                        default: "$checkboxOff"
                    },
                    onIcon: {
                        type: String,
                        default: "$checkboxOn"
                    }
                },
                data() {
                    return {
                        inputIndeterminate: this.indeterminate
                    }
                },
                computed: {
                    classes() {
                        return { ...o.a.options.computed.classes.call(this),
                            "v-input--selection-controls": !0,
                            "v-input--checkbox": !0,
                            "v-input--indeterminate": this.inputIndeterminate
                        }
                    },
                    computedIcon() {
                        return this.inputIndeterminate ? this.indeterminateIcon : this.isActive ? this.onIcon : this.offIcon
                    },
                    validationState() {
                        if (!this.isDisabled || this.inputIndeterminate) return this.hasError && this.shouldValidate ? "error" : this.hasSuccess ? "success" : null !== this.hasColor ? this.computedColor : void 0
                    }
                },
                watch: {
                    indeterminate(e) {
                        this.$nextTick(() => this.inputIndeterminate = e)
                    },
                    inputIndeterminate(e) {
                        this.$emit("update:indeterminate", e)
                    },
                    isActive() {
                        this.indeterminate && (this.inputIndeterminate = !1)
                    }
                },
                methods: {
                    genCheckbox() {
                        const {
                            title: title,
                            ...e
                        } = this.attrs$;
                        return this.$createElement("div", {
                            staticClass: "v-input--selection-controls__input"
                        }, [this.$createElement(r.a, this.setTextColor(this.validationState, {
                            props: {
                                dense: this.dense,
                                dark: this.dark,
                                light: this.light
                            }
                        }), this.computedIcon), this.genInput("checkbox", { ...e,
                            "aria-checked": this.inputIndeterminate ? "mixed" : this.isActive.toString()
                        }), this.genRipple(this.setTextColor(this.rippleState))])
                    },
                    genDefaultSlot() {
                        return [this.genCheckbox(), this.genLabel()]
                    }
                }
            })
        }
    }
]);