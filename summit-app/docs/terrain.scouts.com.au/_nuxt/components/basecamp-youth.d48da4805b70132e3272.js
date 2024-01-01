(window.webpackJsonp = window.webpackJsonp || []).push([
    [18], {
        1149: function(t, e, n) {
            "use strict";
            n(1150);
            var o = n(458),
                r = n(61),
                l = n(67),
                c = n(146);
            e.a = c.a.extend({
                name: "v-window",
                directives: {
                    Touch: o.a
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
                        return { ...c.a.options.computed.classes.call(this),
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
                        var o, c, h;
                        const d = {
                                click: t => {
                                    t.stopPropagation(), this.changedByDelimiters = !0, n()
                                }
                            },
                            m = {
                                "aria-label": this.$vuetify.lang.t("$vuetify.carousel." + t)
                            },
                            v = null !== (h = null === (c = (o = this.$scopedSlots)[t]) || void 0 === c ? void 0 : c.call(o, {
                                on: d,
                                attrs: m
                            })) && void 0 !== h ? h : [this.$createElement(r.a, {
                                props: {
                                    icon: !0
                                },
                                attrs: m,
                                on: d
                            }, [this.$createElement(l.a, {
                                props: {
                                    large: !0
                                }
                            }, e)])];
                        return this.$createElement("div", {
                            staticClass: "v-window__" + t
                        }, v)
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
                            o = n - 1;
                        return n <= 2 ? t < e : t === o && 0 === e || (0 !== t || e !== o) && t < e
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
            var o = n(148),
                r = n(105),
                l = n(458),
                c = n(2),
                h = n(7);
            const d = Object(h.a)(o.a, Object(r.a)("windowGroup", "v-window-item", "v-window"));
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
                        this.inTransition || (this.inTransition = !0, 0 === this.windowGroup.transitionCount && (this.windowGroup.transitionHeight = Object(c.h)(this.windowGroup.$el.clientHeight)), this.windowGroup.transitionCount++)
                    },
                    onTransitionCancelled() {
                        this.onAfterTransition()
                    },
                    onEnter(t) {
                        this.inTransition && this.$nextTick(() => {
                            this.computedTransition && this.inTransition && (this.windowGroup.transitionHeight = Object(c.h)(t.clientHeight))
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
        1209: function(t, e, n) {
            t.exports = {}
        },
        1274: function(t, e, n) {
            t.exports = {}
        },
        1372: function(t, e, n) {
            "use strict";
            var o = n(1151),
                r = n(172),
                l = n(7),
                c = n(2),
                h = n(50);
            const d = Object(l.a)(o.a, h.a);
            e.a = d.extend().extend({
                name: "v-carousel-item",
                inject: {
                    parentTheme: {
                        default: {
                            isDark: !1
                        }
                    }
                },
                provide() {
                    return {
                        theme: this.parentTheme
                    }
                },
                inheritAttrs: !1,
                methods: {
                    genDefaultSlot() {
                        return [this.$createElement(r.a, {
                            staticClass: "v-carousel__item",
                            props: { ...this.$attrs,
                                height: this.windowGroup.internalHeight
                            },
                            on: this.$listeners,
                            scopedSlots: {
                                placeholder: this.$scopedSlots.placeholder
                            }
                        }, Object(c.r)(this))]
                    },
                    genWindowItem() {
                        const {
                            tag: t,
                            data: data
                        } = this.generateRouteLink();
                        return data.staticClass = "v-window-item", data.directives.push({
                            name: "show",
                            value: this.isActive
                        }), this.$createElement(t, data, this.genDefaultSlot())
                    }
                }
            })
        },
        1373: function(t, e, n) {
            "use strict";
            n(1274)
        },
        1416: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(870),
                r = n(1426),
                l = n(1372),
                c = n(885),
                h = n(869),
                d = n(40),
                m = n(5),
                v = n(79),
                _ = n(3),
                w = d.t.extend({
                    name: "BasecampYouth",
                    components: {
                        ConfirmationDialog: v.default
                    },
                    data: () => ({
                        LABEL: m.i,
                        section: "",
                        showSectionChangeDialog: !1,
                        stepKey: "pe",
                        PATH: _,
                        NAV_LABEL: m.l,
                        imgFallback: {
                            loading: "/images/image-placeholder-large-light.svg",
                            error: "/images/image-placeholder-large-light.svg"
                        }
                    }),
                    created() {
                        this.$accessor.global.setBreadcrumbs([{
                            text: this.isYouthMember ? m.l.BASECAMP : m.l.YOUTH_BASECAMP,
                            to: _.BASECAMP,
                            exact: !0,
                            disabled: !0
                        }]), this.$nuxt.isOffline ? this.setDefaultSection() : this.setSection()
                    },
                    computed: {
                        sectionModalTitle() {
                            return `You are viewing the ${m.z.get(this.$accessor.global.getAppSection)} Section`
                        },
                        sectionModalSubtitle() {
                            return this.$accessor.user.hasRoleSupportLeaderReadOrWrite ? "As a Support Leader you can view any requirements for this section." : this.isYouthMember ? this.profileSectionEqualsAppSection ? "This is your current section." : this.isMemberBelowAppSection ? `Check out what's coming up in this Section. To submit current Achievements, please switch to ${m.z.get(this.getCurrentProfileSection)} Section in Basecamp.` : this.isMemberAboveAppSection ? `You can view your past achievements and submissions if you were in this Section before. To submit current Achievements, please switch to ${m.z.get(this.getCurrentProfileSection)} Section in Basecamp.` : void 0 : "As an Adult Leader you can view Achievement Pathways requirements for this section."
                        },
                        sections: () => Object.values(m.y),
                        backgroundImage() {
                            return `background-image: url('/images/basecamp-${this.sectionKey}-desktop-illustration.svg');`
                        },
                        sectionKey() {
                            return Object.keys(m.y).find(t => m.y[t] === this.section)
                        },
                        steps() {
                            const t = {
                                pe: {
                                    title: "Program Essentials",
                                    subtitle: "Complete the Program Essentials through attendance & active participation in the Scout Program.",
                                    links: [{
                                        title: m.l.INTRO_SCOUTING,
                                        path: _.INTRO_SCOUTING
                                    }, {
                                        title: m.l.INTRO_SECTION,
                                        path: _.INTRO_SECTION
                                    }, {
                                        title: m.l.MILESTONES,
                                        path: _.MILESTONES
                                    }]
                                },
                                sia: {
                                    title: m.l.SIA,
                                    subtitle: "Explore six broad skill areas, tailored to your interests & goals.",
                                    links: [{
                                        title: m.l.SIA,
                                        path: _.SIA
                                    }]
                                },
                                oas: {
                                    title: m.l.OAS,
                                    subtitle: "Learn and undertake new adventurous activity skills and develop existing skills.",
                                    links: [{
                                        title: m.l.OAS,
                                        path: _.OAS
                                    }]
                                },
                                aj: {
                                    title: m.l.ADVENTUROUS_JOURNEY,
                                    subtitle: "Get out, explore and put in place the skills you have learnt in this Section.",
                                    links: [{
                                        title: m.l.ADVENTUROUS_JOURNEY,
                                        path: _.ADVENTUROUS_JOURNEY
                                    }]
                                },
                                pr: {
                                    title: m.l.PERSONAL_REFLECTION,
                                    subtitle: "Think about your time in the section, how you have achieved your goals and reflect on your development.",
                                    links: [{
                                        title: m.l.PERSONAL_REFLECTION,
                                        path: _.PERSONAL_REFLECTION
                                    }]
                                },
                                pd: {
                                    title: "Personal Development Course",
                                    subtitle: "Explore what leadership means, and focus your skill development.",
                                    links: [{
                                        title: "Personal Development Course",
                                        path: _.PERSONAL_DEVELOPMENT
                                    }]
                                },
                                peak: {
                                    title: m.l.MY_PROGRESS,
                                    subtitle: "View your progress towards the " + m.r[this.$accessor.global.getAppSection],
                                    links: []
                                }
                            };
                            return this.showMyProgress && t.peak.links.push({
                                title: m.l.MY_PROGRESS,
                                path: _.PEAK_AWARD
                            }), t
                        },
                        step() {
                            return this.steps[this.$data.stepKey]
                        },
                        getMobileImages() {
                            if (this.sectionKey) return Object.keys(this.steps).map(t => this.fetchImage(`${this.sectionKey}-basecamp/${this.sectionKey}-basecamp-${t}`))
                        },
                        showMyProgress() {
                            return this.$nuxt.isOnline && this.isYouthMember
                        }
                    },
                    methods: {
                        setSection() {
                            this.section = m.y[this.$accessor.global.getAppSection]
                        },
                        setDefaultSection() {
                            this.$accessor.global.setAppSection(this.getCurrentProfileSection), this.section = m.y[this.$accessor.global.getAppSection]
                        },
                        carouselChanged(t) {
                            this.stepKey = Object.keys(this.steps)[t]
                        },
                        changeSection(section) {
                            const t = m.w.get(section);
                            this.$accessor.global.setAppSection(t), setTimeout(() => {
                                this.showSectionChangeDialog = !0
                            }, 500)
                        }
                    },
                    watch: {
                        isAppOffline(t) {
                            t && this.setDefaultSection()
                        }
                    }
                }),
                f = (n(1373), n(9)),
                component = Object(f.a)(w, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "BasecampYouth pt-6 pb-12"
                    }, [t.$vuetify.breakpoint.lgAndUp ? e("div", [e(c.a, {
                        staticClass: "BasecampYouth__select"
                    }, [e("div", {
                        staticClass: "mr-2"
                    }, [t._v("You are a")]), t._v(" "), e(h.a, {
                        staticClass: "mb-0 mt-6",
                        attrs: {
                            disabled: t.$nuxt.isOffline,
                            items: t.sections
                        },
                        on: {
                            change: function(e) {
                                return t.changeSection(t.section)
                            }
                        },
                        model: {
                            value: t.section,
                            callback: function(e) {
                                t.section = e
                            },
                            expression: "section"
                        }
                    })], 1), t._v(" "), e("div", {
                        staticClass: "BasecampYouth__background",
                        style: t.backgroundImage
                    }, [e(c.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e("div", {
                        staticClass: "BasecampYouth__intro-buttons",
                        class: t.sectionKey
                    }, [e("button", {
                        staticClass: "BasecampYouth__button",
                        on: {
                            click: function(e) {
                                return t.$router.push({
                                    path: t.PATH.INTRO_SCOUTING
                                })
                            },
                            keydown: function(e) {
                                return t.$router.push({
                                    path: t.PATH.INTRO_SCOUTING
                                })
                            }
                        }
                    }, [t._v("\n            " + t._s(t.NAV_LABEL.INTRO_SCOUTING) + "\n          ")]), t._v(" "), e("nuxt-link", {
                        attrs: {
                            to: t.PATH.INTRO_SECTION
                        }
                    }, [e("button", {
                        staticClass: "BasecampYouth__button"
                    }, [t._v(t._s(t.NAV_LABEL.INTRO_SECTION))])]), t._v(" "), e("nuxt-link", {
                        attrs: {
                            to: t.PATH.MILESTONES
                        }
                    }, [e("button", {
                        staticClass: "BasecampYouth__button"
                    }, [t._v("Milestones")])])], 1), t._v(" "), e("div", {
                        staticClass: "BasecampYouth__special-interest-areas",
                        class: t.sectionKey
                    }, [e("nuxt-link", {
                        attrs: {
                            to: t.PATH.SIA
                        }
                    }, [e("button", {
                        staticClass: "BasecampYouth__button"
                    }, [t._v(t._s(t.NAV_LABEL.SIA))])])], 1)]), t._v(" "), e(c.a, [e("div", {
                        staticClass: "BasecampYouth__personal-development",
                        class: t.sectionKey
                    }, [e("nuxt-link", {
                        attrs: {
                            to: t.PATH.PERSONAL_DEVELOPMENT
                        }
                    }, [e("button", {
                        staticClass: "BasecampYouth__button"
                    }, [t._v("Personal Development Course")])])], 1)]), t._v(" "), t.$nuxt.isOnline ? e(c.a, [e("div", {
                        staticClass: "BasecampYouth__peak-award",
                        class: t.sectionKey
                    }, [t.showMyProgress ? e("nuxt-link", {
                        attrs: {
                            to: t.PATH.PEAK_AWARD
                        }
                    }, [e("button", {
                        staticClass: "BasecampYouth__button"
                    }, [t._v(t._s(t.NAV_LABEL.MY_PROGRESS))])]) : t._e()], 1)]) : t._e(), t._v(" "), e(c.a, [e("div", {
                        staticClass: "BasecampYouth__outdoor-adventure-skills",
                        class: t.sectionKey
                    }, [e("nuxt-link", {
                        attrs: {
                            to: t.PATH.OAS
                        }
                    }, [e("button", {
                        staticClass: "BasecampYouth__button"
                    }, [t._v(t._s(t.NAV_LABEL.OAS))])])], 1), t._v(" "), e("div", {
                        staticClass: "BasecampYouth__adventurous-journey",
                        class: t.sectionKey
                    }, [e("nuxt-link", {
                        attrs: {
                            to: t.PATH.ADVENTUROUS_JOURNEY
                        }
                    }, [e("button", {
                        staticClass: "BasecampYouth__button"
                    }, [t._v(t._s(t.NAV_LABEL.ADVENTUROUS_JOURNEY))])])], 1), t._v(" "), e("div", {
                        staticClass: "BasecampYouth__personal-reflection",
                        class: t.sectionKey
                    }, [e("nuxt-link", {
                        attrs: {
                            to: t.PATH.PERSONAL_REFLECTION
                        }
                    }, [e("button", {
                        staticClass: "BasecampYouth__button"
                    }, [t._v(t._s(t.NAV_LABEL.PERSONAL_REFLECTION))])])], 1)])], 1)], 1) : e("div", {
                        staticStyle: {
                            width: "100%"
                        }
                    }, [e(c.a, {
                        staticClass: "BasecampYouth__mobile-select px-6",
                        attrs: {
                            "no-gutters": "",
                            justify: "center"
                        }
                    }, [e(h.a, {
                        staticClass: "BasecampYouth__mobile-select-sections",
                        attrs: {
                            disabled: t.$nuxt.isOffline,
                            items: t.sections
                        },
                        on: {
                            change: function(e) {
                                return t.changeSection(t.section)
                            }
                        },
                        model: {
                            value: t.section,
                            callback: function(e) {
                                t.section = e
                            },
                            expression: "section"
                        }
                    })], 1), t._v(" "), e(c.a, {
                        attrs: {
                            "no-gutters": "",
                            justify: "center"
                        }
                    }, [e("div", {
                        staticClass: "BasecampYouth__mobile-title px-6 text-center"
                    }, [t._v(t._s(t.step.title))])]), t._v(" "), e(c.a, {
                        staticClass: "mb-8 px-6 text-center",
                        attrs: {
                            "no-gutters": "",
                            justify: "center"
                        }
                    }, [e("div", [t._v(t._s(t.step.subtitle))])]), t._v(" "), t._l(t.step.links, (function(link) {
                        return e(c.a, {
                            key: link.path,
                            attrs: {
                                justify: "center",
                                "no-gutters": ""
                            }
                        }, [e("nuxt-link", {
                            attrs: {
                                to: link.path
                            }
                        }, [e(o.a, {
                            staticClass: "mb-6"
                        }, [t._v(t._s(link.title))])], 1)], 1)
                    })), t._v(" "), e(r.a, {
                        staticClass: "mt-6 text-center",
                        attrs: {
                            "hide-delimiters": !0,
                            height: "auto"
                        },
                        on: {
                            change: t.carouselChanged
                        }
                    }, t._l(t.getMobileImages, (function(image, n) {
                        return e(l.a, {
                            key: n,
                            staticClass: "BasecampYouth__mobile-carousel-item"
                        }, [e(c.a, {
                            staticClass: "ma-0",
                            attrs: {
                                align: "center",
                                justify: "center"
                            }
                        }, [e("img", {
                            directives: [{
                                name: "img-fallback",
                                rawName: "v-img-fallback",
                                value: t.imgFallback,
                                expression: "imgFallback"
                            }],
                            staticClass: "BasecampYouth__mobile-carousel-image",
                            attrs: {
                                src: image,
                                alt: t.step.title
                            }
                        })])], 1)
                    })), 1)], 2), t._v(" "), e("ConfirmationDialog", {
                        attrs: {
                            model: t.showSectionChangeDialog,
                            title: t.sectionModalTitle,
                            subtitle: t.sectionModalSubtitle,
                            "hide-confirm": "",
                            "close-button-label": t.LABEL.OKAY,
                            "close-dialog": () => t.showSectionChangeDialog = !1
                        }
                    })], 1)
                }), [], !1, null, "2916eae8", null);
            e.default = component.exports;
            installComponents(component, {
                ConfirmationDialog: n(79).default
            })
        },
        1426: function(t, e, n) {
            "use strict";
            n(1209);
            var o = n(1149),
                r = n(61),
                l = n(67),
                c = n(451),
                h = n(146),
                d = h.a.extend({
                    name: "button-group",
                    provide() {
                        return {
                            btnToggle: this
                        }
                    },
                    computed: {
                        classes() {
                            return h.a.options.computed.classes.call(this)
                        }
                    },
                    methods: {
                        genData: h.a.options.methods.genData
                    }
                }),
                m = n(2),
                v = n(12);
            e.a = o.a.extend({
                name: "v-carousel",
                props: {
                    continuous: {
                        type: Boolean,
                        default: !0
                    },
                    cycle: Boolean,
                    delimiterIcon: {
                        type: String,
                        default: "$delimiter"
                    },
                    height: {
                        type: [Number, String],
                        default: 500
                    },
                    hideDelimiters: Boolean,
                    hideDelimiterBackground: Boolean,
                    interval: {
                        type: [Number, String],
                        default: 6e3,
                        validator: t => t > 0
                    },
                    mandatory: {
                        type: Boolean,
                        default: !0
                    },
                    progress: Boolean,
                    progressColor: String,
                    showArrows: {
                        type: Boolean,
                        default: !0
                    },
                    verticalDelimiters: {
                        type: String,
                        default: void 0
                    }
                },
                provide() {
                    return {
                        parentTheme: this.theme
                    }
                },
                data() {
                    return {
                        internalHeight: this.height,
                        slideTimeout: void 0
                    }
                },
                computed: {
                    classes() {
                        return { ...o.a.options.computed.classes.call(this),
                            "v-carousel": !0,
                            "v-carousel--hide-delimiter-background": this.hideDelimiterBackground,
                            "v-carousel--vertical-delimiters": this.isVertical
                        }
                    },
                    isDark() {
                        return this.dark || !this.light
                    },
                    isVertical() {
                        return null != this.verticalDelimiters
                    }
                },
                watch: {
                    internalValue: "restartTimeout",
                    interval: "restartTimeout",
                    height(t, e) {
                        t !== e && t && (this.internalHeight = t)
                    },
                    cycle(t) {
                        t ? this.restartTimeout() : (clearTimeout(this.slideTimeout), this.slideTimeout = void 0)
                    }
                },
                created() {
                    this.$attrs.hasOwnProperty("hide-controls") && Object(v.a)("hide-controls", ':show-arrows="false"', this)
                },
                mounted() {
                    this.startTimeout()
                },
                methods: {
                    genControlIcons() {
                        return this.isVertical ? null : o.a.options.methods.genControlIcons.call(this)
                    },
                    genDelimiters() {
                        return this.$createElement("div", {
                            staticClass: "v-carousel__controls",
                            style: {
                                left: "left" === this.verticalDelimiters && this.isVertical ? 0 : "auto",
                                right: "right" === this.verticalDelimiters ? 0 : "auto"
                            }
                        }, [this.genItems()])
                    },
                    genItems() {
                        const t = this.items.length,
                            e = [];
                        for (let i = 0; i < t; i++) {
                            const n = this.$createElement(r.a, {
                                staticClass: "v-carousel__controls__item",
                                attrs: {
                                    "aria-label": this.$vuetify.lang.t("$vuetify.carousel.ariaLabel.delimiter", i + 1, t)
                                },
                                props: {
                                    icon: !0,
                                    small: !0,
                                    value: this.getValue(this.items[i], i)
                                },
                                key: i
                            }, [this.$createElement(l.a, {
                                props: {
                                    size: 18
                                }
                            }, this.delimiterIcon)]);
                            e.push(n)
                        }
                        return this.$createElement(d, {
                            props: {
                                value: this.internalValue,
                                mandatory: this.mandatory
                            },
                            on: {
                                change: t => {
                                    this.internalValue = t
                                }
                            }
                        }, e)
                    },
                    genProgress() {
                        return this.$createElement(c.a, {
                            staticClass: "v-carousel__progress",
                            props: {
                                color: this.progressColor,
                                value: (this.internalIndex + 1) / this.items.length * 100
                            }
                        })
                    },
                    restartTimeout() {
                        this.slideTimeout && clearTimeout(this.slideTimeout), this.slideTimeout = void 0, window.requestAnimationFrame(this.startTimeout)
                    },
                    startTimeout() {
                        this.cycle && (this.slideTimeout = window.setTimeout(this.next, +this.interval > 0 ? +this.interval : 6e3))
                    }
                },
                render(t) {
                    const e = o.a.options.render.call(this, t);
                    return e.data.style = `height: ${Object(m.h)(this.height)};`, this.hideDelimiters || e.children.push(this.genDelimiters()), (this.progress || this.progressColor) && e.children.push(this.genProgress()), e
                }
            })
        },
        61: function(t, e, n) {
            "use strict";
            var o = n(870);
            e.a = o.a
        }
    }
]);