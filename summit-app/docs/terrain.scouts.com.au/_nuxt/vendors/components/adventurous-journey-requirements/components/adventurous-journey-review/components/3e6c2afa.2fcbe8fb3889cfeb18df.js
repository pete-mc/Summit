(window.webpackJsonp = window.webpackJsonp || []).push([
    [2], {
        1149: function(t, e, n) {
            "use strict";
            n(1150);
            var r = n(458),
                o = n(61),
                l = n(67),
                h = n(146);
            e.a = h.a.extend({
                name: "v-window",
                directives: {
                    Touch: r.a
                },
                provide() {
                    return {
                        windowGroup: this
                    }
                },
                props: {
                    activeClass: {
                        type: String,
                        default: "v-window-item--active"
                    },
                    continuous: Boolean,
                    mandatory: {
                        type: Boolean,
                        default: !0
                    },
                    nextIcon: {
                        type: [Boolean, String],
                        default: "$next"
                    },
                    prevIcon: {
                        type: [Boolean, String],
                        default: "$prev"
                    },
                    reverse: Boolean,
                    showArrows: Boolean,
                    showArrowsOnHover: Boolean,
                    touch: Object,
                    touchless: Boolean,
                    value: {
                        required: !1
                    },
                    vertical: Boolean
                },
                data: () => ({
                    changedByDelimiters: !1,
                    internalHeight: void 0,
                    transitionHeight: void 0,
                    transitionCount: 0,
                    isBooted: !1,
                    isReverse: !1
                }),
                computed: {
                    isActive() {
                        return this.transitionCount > 0
                    },
                    classes() {
                        return { ...h.a.options.computed.classes.call(this),
                            "v-window--show-arrows-on-hover": this.showArrowsOnHover
                        }
                    },
                    computedTransition() {
                        if (!this.isBooted) return "";
                        return `v-window-${this.vertical?"y":"x"}${(this.internalReverse?!this.isReverse:this.isReverse)?"-reverse":""}-transition`
                    },
                    hasActiveItems() {
                        return Boolean(this.items.find(t => !t.disabled))
                    },
                    hasNext() {
                        return this.continuous || this.internalIndex < this.items.length - 1
                    },
                    hasPrev() {
                        return this.continuous || this.internalIndex > 0
                    },
                    internalIndex() {
                        return this.items.findIndex((t, i) => this.internalValue === this.getValue(t, i))
                    },
                    internalReverse() {
                        return this.$vuetify.rtl ? !this.reverse : this.reverse
                    }
                },
                watch: {
                    internalIndex(t, e) {
                        this.isReverse = this.updateReverse(t, e)
                    }
                },
                mounted() {
                    window.requestAnimationFrame(() => this.isBooted = !0)
                },
                methods: {
                    genDefaultSlot() {
                        return this.$slots.default
                    },
                    genContainer() {
                        const t = [this.genDefaultSlot()];
                        return this.showArrows && t.push(this.genControlIcons()), this.$createElement("div", {
                            staticClass: "v-window__container",
                            class: {
                                "v-window__container--is-active": this.isActive
                            },
                            style: {
                                height: this.internalHeight || this.transitionHeight
                            }
                        }, t)
                    },
                    genIcon(t, e, n) {
                        var r, h, c;
                        const d = {
                                click: t => {
                                    t.stopPropagation(), this.changedByDelimiters = !0, n()
                                }
                            },
                            v = {
                                "aria-label": this.$vuetify.lang.t("$vuetify.carousel." + t)
                            },
                            f = null !== (c = null === (h = (r = this.$scopedSlots)[t]) || void 0 === h ? void 0 : h.call(r, {
                                on: d,
                                attrs: v
                            })) && void 0 !== c ? c : [this.$createElement(o.a, {
                                props: {
                                    icon: !0
                                },
                                attrs: v,
                                on: d
                            }, [this.$createElement(l.a, {
                                props: {
                                    large: !0
                                }
                            }, e)])];
                        return this.$createElement("div", {
                            staticClass: "v-window__" + t
                        }, f)
                    },
                    genControlIcons() {
                        const t = [],
                            e = this.$vuetify.rtl ? this.nextIcon : this.prevIcon;
                        if (this.hasPrev && e && "string" == typeof e) {
                            const n = this.genIcon("prev", e, this.prev);
                            n && t.push(n)
                        }
                        const n = this.$vuetify.rtl ? this.prevIcon : this.nextIcon;
                        if (this.hasNext && n && "string" == typeof n) {
                            const e = this.genIcon("next", n, this.next);
                            e && t.push(e)
                        }
                        return t
                    },
                    getNextIndex(t) {
                        const e = (t + 1) % this.items.length;
                        return this.items[e].disabled ? this.getNextIndex(e) : e
                    },
                    getPrevIndex(t) {
                        const e = (t + this.items.length - 1) % this.items.length;
                        return this.items[e].disabled ? this.getPrevIndex(e) : e
                    },
                    next() {
                        if (!this.hasActiveItems || !this.hasNext) return;
                        const t = this.getNextIndex(this.internalIndex),
                            e = this.items[t];
                        this.internalValue = this.getValue(e, t)
                    },
                    prev() {
                        if (!this.hasActiveItems || !this.hasPrev) return;
                        const t = this.getPrevIndex(this.internalIndex),
                            e = this.items[t];
                        this.internalValue = this.getValue(e, t)
                    },
                    updateReverse(t, e) {
                        const n = this.items.length,
                            r = n - 1;
                        return n <= 2 ? t < e : t === r && 0 === e || (0 !== t || e !== r) && t < e
                    }
                },
                render(t) {
                    const data = {
                        staticClass: "v-window",
                        class: this.classes,
                        directives: []
                    };
                    if (!this.touchless) {
                        const t = this.touch || {
                            left: () => {
                                this.$vuetify.rtl ? this.prev() : this.next()
                            },
                            right: () => {
                                this.$vuetify.rtl ? this.next() : this.prev()
                            },
                            end: t => {
                                t.stopPropagation()
                            },
                            start: t => {
                                t.stopPropagation()
                            }
                        };
                        data.directives.push({
                            name: "touch",
                            value: t
                        })
                    }
                    return t("div", data, [this.genContainer()])
                }
            })
        },
        1150: function(t, e, n) {
            t.exports = {}
        },
        1151: function(t, e, n) {
            "use strict";
            var r = n(148),
                o = n(105),
                l = n(458),
                h = n(2),
                c = n(7);
            const d = Object(c.a)(r.a, Object(o.a)("windowGroup", "v-window-item", "v-window"));
            e.a = d.extend().extend().extend({
                name: "v-window-item",
                directives: {
                    Touch: l.a
                },
                props: {
                    disabled: Boolean,
                    reverseTransition: {
                        type: [Boolean, String],
                        default: void 0
                    },
                    transition: {
                        type: [Boolean, String],
                        default: void 0
                    },
                    value: {
                        required: !1
                    }
                },
                data: () => ({
                    isActive: !1,
                    inTransition: !1
                }),
                computed: {
                    classes() {
                        return this.groupClasses
                    },
                    computedTransition() {
                        return this.windowGroup.internalReverse ? void 0 !== this.reverseTransition ? this.reverseTransition || "" : this.windowGroup.computedTransition : void 0 !== this.transition ? this.transition || "" : this.windowGroup.computedTransition
                    }
                },
                methods: {
                    genDefaultSlot() {
                        return this.$slots.default
                    },
                    genWindowItem() {
                        return this.$createElement("div", {
                            staticClass: "v-window-item",
                            class: this.classes,
                            directives: [{
                                name: "show",
                                value: this.isActive
                            }],
                            on: this.$listeners
                        }, this.genDefaultSlot())
                    },
                    onAfterTransition() {
                        this.inTransition && (this.inTransition = !1, this.windowGroup.transitionCount > 0 && (this.windowGroup.transitionCount--, 0 === this.windowGroup.transitionCount && (this.windowGroup.transitionHeight = void 0)))
                    },
                    onBeforeTransition() {
                        this.inTransition || (this.inTransition = !0, 0 === this.windowGroup.transitionCount && (this.windowGroup.transitionHeight = Object(h.h)(this.windowGroup.$el.clientHeight)), this.windowGroup.transitionCount++)
                    },
                    onTransitionCancelled() {
                        this.onAfterTransition()
                    },
                    onEnter(t) {
                        this.inTransition && this.$nextTick(() => {
                            this.computedTransition && this.inTransition && (this.windowGroup.transitionHeight = Object(h.h)(t.clientHeight))
                        })
                    }
                },
                render(t) {
                    return t("transition", {
                        props: {
                            name: this.computedTransition
                        },
                        on: {
                            beforeEnter: this.onBeforeTransition,
                            afterEnter: this.onAfterTransition,
                            enterCancelled: this.onTransitionCancelled,
                            beforeLeave: this.onBeforeTransition,
                            afterLeave: this.onAfterTransition,
                            leaveCancelled: this.onTransitionCancelled,
                            enter: this.onEnter
                        }
                    }, this.showLazyContent(() => [this.genWindowItem()]))
                }
            })
        },
        1367: function(t, e, n) {
            t.exports = {}
        },
        1368: function(t, e, n) {
            t.exports = {}
        },
        1369: function(t, e, n) {
            "use strict";
            var r = n(1149),
                o = n(146);
            e.a = r.a.extend({
                name: "v-tabs-items",
                props: {
                    mandatory: {
                        type: Boolean,
                        default: !1
                    }
                },
                computed: {
                    classes() {
                        return { ...r.a.options.computed.classes.call(this),
                            "v-tabs-items": !0
                        }
                    },
                    isDark() {
                        return this.rootIsDark
                    }
                },
                methods: {
                    getValue(t, i) {
                        return t.id || o.a.options.methods.getValue.call(this, t, i)
                    }
                }
            })
        },
        1370: function(t, e, n) {
            "use strict";
            var r = n(18),
                o = n(7);
            e.a = Object(o.a)(r.a).extend({
                name: "v-tabs-slider",
                render(t) {
                    return t("div", this.setBackgroundColor(this.color, {
                        staticClass: "v-tabs-slider"
                    }))
                }
            })
        },
        1430: function(t, e, n) {
            "use strict";
            var r = n(105),
                o = n(50),
                l = n(13),
                h = n(2),
                c = n(7);
            const d = Object(c.a)(o.a, Object(r.a)("tabsBar"), l.a);
            e.a = d.extend().extend().extend({
                name: "v-tab",
                props: {
                    ripple: {
                        type: [Boolean, Object],
                        default: !0
                    },
                    tabValue: {
                        required: !1
                    }
                },
                data: () => ({
                    proxyClass: "v-tab--active"
                }),
                computed: {
                    classes() {
                        return {
                            "v-tab": !0,
                            ...o.a.options.computed.classes.call(this),
                            "v-tab--disabled": this.disabled,
                            ...this.groupClasses
                        }
                    },
                    value() {
                        if (null != this.tabValue) return this.tabValue;
                        let t = this.to || this.href;
                        if (null == t) return t;
                        if (this.$router && this.to === Object(this.to)) {
                            t = this.$router.resolve(this.to, this.$route, this.append).href
                        }
                        return t.replace("#", "")
                    }
                },
                methods: {
                    click(t) {
                        this.disabled ? t.preventDefault() : (this.href && this.href.indexOf("#") > -1 && t.preventDefault(), t.detail && this.$el.blur(), this.$emit("click", t), this.to || this.toggle())
                    },
                    toggle() {
                        this.isActive && (this.tabsBar.mandatory || this.to) || this.$emit("change")
                    }
                },
                render(t) {
                    const {
                        tag: e,
                        data: data
                    } = this.generateRouteLink();
                    return data.attrs = { ...data.attrs,
                        "aria-selected": String(this.isActive),
                        role: "tab",
                        tabindex: this.disabled ? -1 : 0
                    }, data.on = { ...data.on,
                        keydown: t => {
                            t.keyCode === h.x.enter && this.click(t), this.$emit("keydown", t)
                        }
                    }, t(e, data, this.$slots.default)
                }
            })
        },
        1431: function(t, e, n) {
            "use strict";
            var r = n(1151);
            e.a = r.a.extend({
                name: "v-tab-item",
                props: {
                    id: String
                },
                methods: {
                    genWindowItem() {
                        const t = r.a.options.methods.genWindowItem.call(this);
                        return t.data.domProps = t.data.domProps || {}, t.data.domProps.id = this.id || this.value, t
                    }
                }
            })
        },
        1497: function(t, e, n) {
            "use strict";
            n(1367), n(1368);
            var r = n(67),
                o = n(99),
                l = n(146),
                h = n(227),
                c = n(106),
                d = n(458),
                v = n(7),
                f = n(2);

            function w(t) {
                const e = Math.abs(t);
                return Math.sign(t) * (e / ((1 / .501 - 2) * (1 - e) + 1))
            }

            function m(t, e, n, r) {
                const o = t.clientWidth,
                    l = n ? e.content - t.offsetLeft - o : t.offsetLeft;
                n && (r = -r);
                const h = e.wrapper + r,
                    c = o + l,
                    d = .4 * o;
                return l <= r ? r = Math.max(l - d, 0) : h <= c && (r = Math.min(r - (h - c - d), e.content - e.wrapper)), n ? -r : r
            }
            const $ = Object(v.a)(l.a, h.a).extend({
                name: "base-slide-group",
                directives: {
                    Resize: c.a,
                    Touch: d.a
                },
                props: {
                    activeClass: {
                        type: String,
                        default: "v-slide-item--active"
                    },
                    centerActive: Boolean,
                    nextIcon: {
                        type: String,
                        default: "$next"
                    },
                    prevIcon: {
                        type: String,
                        default: "$prev"
                    },
                    showArrows: {
                        type: [Boolean, String],
                        validator: t => "boolean" == typeof t || ["always", "never", "desktop", "mobile"].includes(t)
                    }
                },
                data: () => ({
                    isOverflowing: !1,
                    resizeTimeout: 0,
                    startX: 0,
                    isSwipingHorizontal: !1,
                    isSwiping: !1,
                    scrollOffset: 0,
                    widths: {
                        content: 0,
                        wrapper: 0
                    }
                }),
                computed: {
                    canTouch: () => "undefined" != typeof window,
                    __cachedNext() {
                        return this.genTransition("next")
                    },
                    __cachedPrev() {
                        return this.genTransition("prev")
                    },
                    classes() {
                        return { ...l.a.options.computed.classes.call(this),
                            "v-slide-group": !0,
                            "v-slide-group--has-affixes": this.hasAffixes,
                            "v-slide-group--is-overflowing": this.isOverflowing
                        }
                    },
                    hasAffixes() {
                        switch (this.showArrows) {
                            case "always":
                                return !0;
                            case "desktop":
                                return !this.isMobile;
                            case !0:
                                return this.isOverflowing || Math.abs(this.scrollOffset) > 0;
                            case "mobile":
                                return this.isMobile || this.isOverflowing || Math.abs(this.scrollOffset) > 0;
                            case "never":
                                return !1;
                            default:
                                return !this.isMobile && (this.isOverflowing || Math.abs(this.scrollOffset) > 0)
                        }
                    },
                    hasNext() {
                        if (!this.hasAffixes) return !1;
                        const {
                            content: content,
                            wrapper: t
                        } = this.widths;
                        return content > Math.abs(this.scrollOffset) + t
                    },
                    hasPrev() {
                        return this.hasAffixes && 0 !== this.scrollOffset
                    }
                },
                watch: {
                    internalValue: "setWidths",
                    isOverflowing: "setWidths",
                    scrollOffset(t) {
                        this.$vuetify.rtl && (t = -t);
                        let e = t <= 0 ? w(-t) : t > this.widths.content - this.widths.wrapper ? -(this.widths.content - this.widths.wrapper) + w(this.widths.content - this.widths.wrapper - t) : -t;
                        this.$vuetify.rtl && (e = -e), this.$refs.content.style.transform = `translateX(${e}px)`
                    }
                },
                mounted() {
                    if ("undefined" != typeof ResizeObserver) {
                        const t = new ResizeObserver(() => {
                            this.onResize()
                        });
                        t.observe(this.$el), t.observe(this.$refs.content), this.$on("hook:destroyed", () => {
                            t.disconnect()
                        })
                    } else {
                        let t = 0;
                        this.$on("hook:beforeUpdate", () => {
                            var e;
                            t = ((null === (e = this.$refs.content) || void 0 === e ? void 0 : e.children) || []).length
                        }), this.$on("hook:updated", () => {
                            var e;
                            t !== ((null === (e = this.$refs.content) || void 0 === e ? void 0 : e.children) || []).length && this.setWidths()
                        })
                    }
                },
                methods: {
                    onScroll() {
                        this.$refs.wrapper.scrollLeft = 0
                    },
                    onFocusin(t) {
                        if (this.isOverflowing)
                            for (const e of Object(f.g)(t))
                                for (const t of this.items)
                                    if (t.$el === e) return void(this.scrollOffset = m(t.$el, this.widths, this.$vuetify.rtl, this.scrollOffset))
                    },
                    genNext() {
                        const slot = this.$scopedSlots.next ? this.$scopedSlots.next({}) : this.$slots.next || this.__cachedNext;
                        return this.$createElement("div", {
                            staticClass: "v-slide-group__next",
                            class: {
                                "v-slide-group__next--disabled": !this.hasNext
                            },
                            on: {
                                click: () => this.onAffixClick("next")
                            },
                            key: "next"
                        }, [slot])
                    },
                    genContent() {
                        return this.$createElement("div", {
                            staticClass: "v-slide-group__content",
                            ref: "content",
                            on: {
                                focusin: this.onFocusin
                            }
                        }, this.$slots.default)
                    },
                    genData() {
                        return {
                            class: this.classes,
                            directives: [{
                                name: "resize",
                                value: this.onResize
                            }]
                        }
                    },
                    genIcon(t) {
                        let e = t;
                        this.$vuetify.rtl && "prev" === t ? e = "next" : this.$vuetify.rtl && "next" === t && (e = "prev");
                        const n = this["has" + `${t[0].toUpperCase()}${t.slice(1)}`];
                        return this.showArrows || n ? this.$createElement(r.a, {
                            props: {
                                disabled: !n
                            }
                        }, this[e + "Icon"]) : null
                    },
                    genPrev() {
                        const slot = this.$scopedSlots.prev ? this.$scopedSlots.prev({}) : this.$slots.prev || this.__cachedPrev;
                        return this.$createElement("div", {
                            staticClass: "v-slide-group__prev",
                            class: {
                                "v-slide-group__prev--disabled": !this.hasPrev
                            },
                            on: {
                                click: () => this.onAffixClick("prev")
                            },
                            key: "prev"
                        }, [slot])
                    },
                    genTransition(t) {
                        return this.$createElement(o.c, [this.genIcon(t)])
                    },
                    genWrapper() {
                        return this.$createElement("div", {
                            staticClass: "v-slide-group__wrapper",
                            directives: [{
                                name: "touch",
                                value: {
                                    start: t => this.overflowCheck(t, this.onTouchStart),
                                    move: t => this.overflowCheck(t, this.onTouchMove),
                                    end: t => this.overflowCheck(t, this.onTouchEnd)
                                }
                            }],
                            ref: "wrapper",
                            on: {
                                scroll: this.onScroll
                            }
                        }, [this.genContent()])
                    },
                    calculateNewOffset(t, e, n, r) {
                        const o = n ? -1 : 1,
                            l = o * r + ("prev" === t ? -1 : 1) * e.wrapper;
                        return o * Math.max(Math.min(l, e.content - e.wrapper), 0)
                    },
                    onAffixClick(t) {
                        this.$emit("click:" + t), this.scrollTo(t)
                    },
                    onResize() {
                        this._isDestroyed || this.setWidths()
                    },
                    onTouchStart(t) {
                        const {
                            content: content
                        } = this.$refs;
                        this.startX = this.scrollOffset + t.touchstartX, content.style.setProperty("transition", "none"), content.style.setProperty("willChange", "transform")
                    },
                    onTouchMove(t) {
                        if (this.canTouch) {
                            if (!this.isSwiping) {
                                const e = t.touchmoveX - t.touchstartX,
                                    n = t.touchmoveY - t.touchstartY;
                                this.isSwipingHorizontal = Math.abs(e) > Math.abs(n), this.isSwiping = !0
                            }
                            this.isSwipingHorizontal && (this.scrollOffset = this.startX - t.touchmoveX, document.documentElement.style.overflowY = "hidden")
                        }
                    },
                    onTouchEnd() {
                        if (!this.canTouch) return;
                        const {
                            content: content,
                            wrapper: t
                        } = this.$refs, e = content.clientWidth - t.clientWidth;
                        content.style.setProperty("transition", null), content.style.setProperty("willChange", null), this.$vuetify.rtl ? this.scrollOffset > 0 || !this.isOverflowing ? this.scrollOffset = 0 : this.scrollOffset <= -e && (this.scrollOffset = -e) : this.scrollOffset < 0 || !this.isOverflowing ? this.scrollOffset = 0 : this.scrollOffset >= e && (this.scrollOffset = e), this.isSwiping = !1, document.documentElement.style.removeProperty("overflow-y")
                    },
                    overflowCheck(t, e) {
                        t.stopPropagation(), this.isOverflowing && e(t)
                    },
                    scrollIntoView() {
                        if (!this.selectedItem && this.items.length) {
                            const t = this.items[this.items.length - 1].$el.getBoundingClientRect(),
                                e = this.$refs.wrapper.getBoundingClientRect();
                            (this.$vuetify.rtl && e.right < t.right || !this.$vuetify.rtl && e.left > t.left) && this.scrollTo("prev")
                        }
                        this.selectedItem && (0 === this.selectedIndex || !this.centerActive && !this.isOverflowing ? this.scrollOffset = 0 : this.centerActive ? this.scrollOffset = function(t, e, n) {
                            const {
                                offsetLeft: r,
                                clientWidth: o
                            } = t;
                            if (n) {
                                const t = e.content - r - o / 2 - e.wrapper / 2;
                                return -Math.min(e.content - e.wrapper, Math.max(0, t))
                            } {
                                const t = r + o / 2 - e.wrapper / 2;
                                return Math.min(e.content - e.wrapper, Math.max(0, t))
                            }
                        }(this.selectedItem.$el, this.widths, this.$vuetify.rtl) : this.isOverflowing && (this.scrollOffset = m(this.selectedItem.$el, this.widths, this.$vuetify.rtl, this.scrollOffset)))
                    },
                    scrollTo(t) {
                        this.scrollOffset = this.calculateNewOffset(t, {
                            content: this.$refs.content ? this.$refs.content.clientWidth : 0,
                            wrapper: this.$refs.wrapper ? this.$refs.wrapper.clientWidth : 0
                        }, this.$vuetify.rtl, this.scrollOffset)
                    },
                    setWidths() {
                        window.requestAnimationFrame(() => {
                            if (this._isDestroyed) return;
                            const {
                                content: content,
                                wrapper: t
                            } = this.$refs;
                            this.widths = {
                                content: content ? content.clientWidth : 0,
                                wrapper: t ? t.clientWidth : 0
                            }, this.isOverflowing = this.widths.wrapper + 1 < this.widths.content, this.scrollIntoView()
                        })
                    }
                },
                render(t) {
                    return t("div", this.genData(), [this.genPrev(), this.genWrapper(), this.genNext()])
                }
            });
            $.extend({
                name: "v-slide-group",
                provide() {
                    return {
                        slideGroup: this
                    }
                }
            });
            var x = n(13),
                y = n(91),
                O = Object(v.a)($, y.a, x.a).extend({
                    name: "v-tabs-bar",
                    provide() {
                        return {
                            tabsBar: this
                        }
                    },
                    computed: {
                        classes() {
                            return { ...$.options.computed.classes.call(this),
                                "v-tabs-bar": !0,
                                "v-tabs-bar--is-mobile": this.isMobile,
                                "v-tabs-bar--show-arrows": this.showArrows,
                                ...this.themeClasses
                            }
                        }
                    },
                    watch: {
                        items: "callSlider",
                        internalValue: "callSlider",
                        $route: "onRouteChange"
                    },
                    methods: {
                        callSlider() {
                            this.isBooted && this.$emit("call:slider")
                        },
                        genContent() {
                            const t = $.options.methods.genContent.call(this);
                            return t.data = t.data || {}, t.data.staticClass += " v-tabs-bar__content", t
                        },
                        onRouteChange(t, e) {
                            if (this.mandatory) return;
                            const n = this.items,
                                r = t.path,
                                o = e.path;
                            let l = !1,
                                h = !1;
                            for (const t of n)
                                if (t.to === o ? h = !0 : t.to === r && (l = !0), l && h) break;
                            !l && h && (this.internalValue = void 0)
                        }
                    },
                    render(t) {
                        const e = $.options.render.call(this, t);
                        return e.data.attrs = {
                            role: "tablist"
                        }, e
                    }
                }),
                C = n(1369),
                S = n(1370),
                T = n(18),
                I = n(155);
            const B = Object(v.a)(T.a, I.a, x.a);
            e.a = B.extend().extend({
                name: "v-tabs",
                directives: {
                    Resize: c.a
                },
                props: {
                    activeClass: {
                        type: String,
                        default: ""
                    },
                    alignWithTitle: Boolean,
                    backgroundColor: String,
                    centerActive: Boolean,
                    centered: Boolean,
                    fixedTabs: Boolean,
                    grow: Boolean,
                    height: {
                        type: [Number, String],
                        default: void 0
                    },
                    hideSlider: Boolean,
                    iconsAndText: Boolean,
                    mobileBreakpoint: [String, Number],
                    nextIcon: {
                        type: String,
                        default: "$next"
                    },
                    optional: Boolean,
                    prevIcon: {
                        type: String,
                        default: "$prev"
                    },
                    right: Boolean,
                    showArrows: [Boolean, String],
                    sliderColor: String,
                    sliderSize: {
                        type: [Number, String],
                        default: 2
                    },
                    vertical: Boolean
                },
                data: () => ({
                    resizeTimeout: 0,
                    slider: {
                        height: null,
                        left: null,
                        right: null,
                        top: null,
                        width: null
                    },
                    transitionTime: 300
                }),
                computed: {
                    classes() {
                        return {
                            "v-tabs--align-with-title": this.alignWithTitle,
                            "v-tabs--centered": this.centered,
                            "v-tabs--fixed-tabs": this.fixedTabs,
                            "v-tabs--grow": this.grow,
                            "v-tabs--icons-and-text": this.iconsAndText,
                            "v-tabs--right": this.right,
                            "v-tabs--vertical": this.vertical,
                            ...this.themeClasses
                        }
                    },
                    isReversed() {
                        return this.$vuetify.rtl && this.vertical
                    },
                    sliderStyles() {
                        return {
                            height: Object(f.h)(this.slider.height),
                            left: this.isReversed ? void 0 : Object(f.h)(this.slider.left),
                            right: this.isReversed ? Object(f.h)(this.slider.right) : void 0,
                            top: this.vertical ? Object(f.h)(this.slider.top) : void 0,
                            transition: null != this.slider.left ? null : "none",
                            width: Object(f.h)(this.slider.width)
                        }
                    },
                    computedColor() {
                        return this.color ? this.color : this.isDark && !this.appIsDark ? "white" : "primary"
                    }
                },
                watch: {
                    alignWithTitle: "callSlider",
                    centered: "callSlider",
                    centerActive: "callSlider",
                    fixedTabs: "callSlider",
                    grow: "callSlider",
                    iconsAndText: "callSlider",
                    right: "callSlider",
                    showArrows: "callSlider",
                    vertical: "callSlider",
                    "$vuetify.application.left": "onResize",
                    "$vuetify.application.right": "onResize",
                    "$vuetify.rtl": "onResize"
                },
                mounted() {
                    if ("undefined" != typeof ResizeObserver) {
                        const t = new ResizeObserver(() => {
                            this.onResize()
                        });
                        t.observe(this.$el), this.$on("hook:destroyed", () => {
                            t.disconnect()
                        })
                    }
                    this.$nextTick(() => {
                        window.setTimeout(this.callSlider, 30)
                    })
                },
                methods: {
                    callSlider() {
                        return !this.hideSlider && this.$refs.items && this.$refs.items.selectedItems.length ? (this.$nextTick(() => {
                            const t = this.$refs.items.selectedItems[0];
                            if (!t || !t.$el) return this.slider.width = 0, void(this.slider.left = 0);
                            const e = t.$el;
                            this.slider = {
                                height: this.vertical ? e.scrollHeight : Number(this.sliderSize),
                                left: this.vertical ? 0 : e.offsetLeft,
                                right: this.vertical ? 0 : e.offsetLeft + e.offsetWidth,
                                top: e.offsetTop,
                                width: this.vertical ? Number(this.sliderSize) : e.scrollWidth
                            }
                        }), !0) : (this.slider.width = 0, !1)
                    },
                    genBar(t, e) {
                        const data = {
                            style: {
                                height: Object(f.h)(this.height)
                            },
                            props: {
                                activeClass: this.activeClass,
                                centerActive: this.centerActive,
                                dark: this.dark,
                                light: this.light,
                                mandatory: !this.optional,
                                mobileBreakpoint: this.mobileBreakpoint,
                                nextIcon: this.nextIcon,
                                prevIcon: this.prevIcon,
                                showArrows: this.showArrows,
                                value: this.internalValue
                            },
                            on: {
                                "call:slider": this.callSlider,
                                change: t => {
                                    this.internalValue = t
                                }
                            },
                            ref: "items"
                        };
                        return this.setTextColor(this.computedColor, data), this.setBackgroundColor(this.backgroundColor, data), this.$createElement(O, data, [this.genSlider(e), t])
                    },
                    genItems(t, e) {
                        return t || (e.length ? this.$createElement(C.a, {
                            props: {
                                value: this.internalValue
                            },
                            on: {
                                change: t => {
                                    this.internalValue = t
                                }
                            }
                        }, e) : null)
                    },
                    genSlider(t) {
                        return this.hideSlider ? null : (t || (t = this.$createElement(S.a, {
                            props: {
                                color: this.sliderColor
                            }
                        })), this.$createElement("div", {
                            staticClass: "v-tabs-slider-wrapper",
                            style: this.sliderStyles
                        }, [t]))
                    },
                    onResize() {
                        this._isDestroyed || (clearTimeout(this.resizeTimeout), this.resizeTimeout = window.setTimeout(this.callSlider, 0))
                    },
                    parseNodes() {
                        let t = null,
                            e = null;
                        const n = [],
                            r = [],
                            slot = this.$slots.default || [],
                            o = slot.length;
                        for (let i = 0; i < o; i++) {
                            const o = slot[i];
                            if (o.componentOptions) switch (o.componentOptions.Ctor.options.name) {
                                case "v-tabs-slider":
                                    e = o;
                                    break;
                                case "v-tabs-items":
                                    t = o;
                                    break;
                                case "v-tab-item":
                                    n.push(o);
                                    break;
                                default:
                                    r.push(o)
                            } else r.push(o)
                        }
                        return {
                            tab: r,
                            slider: e,
                            items: t,
                            item: n
                        }
                    }
                },
                render(t) {
                    const {
                        tab: e,
                        slider: n,
                        items: r,
                        item: o
                    } = this.parseNodes();
                    return t("div", {
                        staticClass: "v-tabs",
                        class: this.classes,
                        directives: [{
                            name: "resize",
                            modifiers: {
                                quiet: !0
                            },
                            value: this.onResize
                        }]
                    }, [this.genBar(e, n), this.genItems(r, o)])
                }
            })
        }
    }
]);