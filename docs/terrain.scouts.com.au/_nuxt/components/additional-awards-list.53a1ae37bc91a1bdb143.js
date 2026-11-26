(window.webpackJsonp = window.webpackJsonp || []).push([
    [16], {
        1267: function(t, e, r) {
            t.exports = {}
        },
        1314: function(t, e, r) {
            "use strict";
            r.r(e);
            var n = r(267),
                d = r(886),
                l = r(885),
                o = (r(1359), r(156)),
                c = r(110),
                h = r(13),
                _ = r(7),
                v = r(2),
                w = Object(_.a)(o.a, c.a, h.a).extend({
                    name: "VSkeletonLoader",
                    props: {
                        boilerplate: Boolean,
                        loading: Boolean,
                        loadingText: {
                            type: String,
                            default: "$vuetify.loading"
                        },
                        tile: Boolean,
                        transition: String,
                        type: String,
                        types: {
                            type: Object,
                            default: () => ({})
                        }
                    },
                    computed: {
                        attrs() {
                            return this.isLoading ? {
                                "aria-busy": !this.boilerplate || void 0,
                                "aria-live": this.boilerplate ? void 0 : "polite",
                                "aria-label": this.boilerplate ? void 0 : this.$vuetify.lang.t(this.loadingText),
                                role: this.boilerplate ? void 0 : "alert",
                                ...this.$attrs
                            } : this.$attrs
                        },
                        classes() {
                            return {
                                "v-skeleton-loader--boilerplate": this.boilerplate,
                                "v-skeleton-loader--is-loading": this.isLoading,
                                "v-skeleton-loader--tile": this.tile,
                                ...this.themeClasses,
                                ...this.elevationClasses
                            }
                        },
                        isLoading() {
                            return !("default" in this.$scopedSlots) || this.loading
                        },
                        rootTypes() {
                            return {
                                actions: "button@2",
                                article: "heading, paragraph",
                                avatar: "avatar",
                                button: "button",
                                card: "image, card-heading",
                                "card-avatar": "image, list-item-avatar",
                                "card-heading": "heading",
                                chip: "chip",
                                "date-picker": "list-item, card-heading, divider, date-picker-options, date-picker-days, actions",
                                "date-picker-options": "text, avatar@2",
                                "date-picker-days": "avatar@28",
                                heading: "heading",
                                image: "image",
                                "list-item": "text",
                                "list-item-avatar": "avatar, text",
                                "list-item-two-line": "sentences",
                                "list-item-avatar-two-line": "avatar, sentences",
                                "list-item-three-line": "paragraph",
                                "list-item-avatar-three-line": "avatar, paragraph",
                                paragraph: "text@3",
                                sentences: "text@2",
                                table: "table-heading, table-thead, table-tbody, table-tfoot",
                                "table-heading": "heading, text",
                                "table-thead": "heading@6",
                                "table-tbody": "table-row-divider@6",
                                "table-row-divider": "table-row, divider",
                                "table-row": "table-cell@6",
                                "table-cell": "text",
                                "table-tfoot": "text@2, avatar@2",
                                text: "text",
                                ...this.types
                            }
                        }
                    },
                    methods: {
                        genBone(text, t) {
                            return this.$createElement("div", {
                                staticClass: `v-skeleton-loader__${text} v-skeleton-loader__bone`
                            }, t)
                        },
                        genBones(t) {
                            const [e, r] = t.split("@");
                            return Array.from({
                                length: r
                            }).map(() => this.genStructure(e))
                        },
                        genStructure(t) {
                            let e = [];
                            t = t || this.type || "";
                            const r = this.rootTypes[t] || "";
                            if (t === r);
                            else {
                                if (t.indexOf(",") > -1) return this.mapBones(t);
                                if (t.indexOf("@") > -1) return this.genBones(t);
                                r.indexOf(",") > -1 ? e = this.mapBones(r) : r.indexOf("@") > -1 ? e = this.genBones(r) : r && e.push(this.genStructure(r))
                            }
                            return [this.genBone(t, e)]
                        },
                        genSkeleton() {
                            const t = [];
                            return this.isLoading ? t.push(this.genStructure()) : t.push(Object(v.r)(this)), this.transition ? this.$createElement("transition", {
                                props: {
                                    name: this.transition
                                },
                                on: {
                                    afterEnter: this.resetStyles,
                                    beforeEnter: this.onBeforeEnter,
                                    beforeLeave: this.onBeforeLeave,
                                    leaveCancelled: this.resetStyles
                                }
                            }, t) : t
                        },
                        mapBones(t) {
                            return t.replace(/\s/g, "").split(",").map(this.genStructure)
                        },
                        onBeforeEnter(t) {
                            this.resetStyles(t), this.isLoading && (t._initialStyle = {
                                display: t.style.display,
                                transition: t.style.transition
                            }, t.style.setProperty("transition", "none", "important"))
                        },
                        onBeforeLeave(t) {
                            t.style.setProperty("display", "none", "important")
                        },
                        resetStyles(t) {
                            t._initialStyle && (t.style.display = t._initialStyle.display || "", t.style.transition = t._initialStyle.transition, delete t._initialStyle)
                        }
                    },
                    render(t) {
                        return t("div", {
                            staticClass: "v-skeleton-loader",
                            attrs: this.attrs,
                            on: this.$listeners,
                            class: this.classes,
                            style: this.isLoading ? this.measurableStyles : void 0
                        }, [this.genSkeleton()])
                    }
                }),
                m = r(892),
                A = r(11),
                y = r.n(A),
                f = r(171),
                S = r(40),
                x = r(5),
                C = r(3),
                E = r(10);
            const T = ["world_scout_environment_badge", "scouts_of_the_world", "ses", "landcare", "messengers_of_peace"];
            var $ = S.b.extend({
                    name: "AdditionalAwardsList",
                    data: () => ({
                        LABEL: x.i,
                        PATH: C,
                        awards: {},
                        isReady: !1,
                        achievements: [],
                        awardModal: !1,
                        award: {
                            sections: []
                        },
                        ACHIEVEMENT_STATUS_TYPE: x.b,
                        ACHIEVEMENT_STATUS_TYPE_COLOUR_MAP: x.c
                    }),
                    props: {
                        title: {
                            type: String,
                            required: !0
                        },
                        filename: {
                            type: String,
                            required: !0
                        }
                    },
                    async mounted() {
                        try {
                            await this.fetchAdditionalAwardsList()
                        } catch (t) {
                            if (this.$nuxt.isOffline) return this.$nuxt.error({
                                statusCode: 503,
                                message: ""
                            });
                            throw new Error(t)
                        }
                        this.isYouthMember && (this.achievements = await this.getUserAchievements(this.$accessor.user.getUserId, E.b.ADDITIONAL_AWARD)), this.isReady = !0
                    },
                    computed: {
                        awardSectionText() {
                            var t, e, r, n;
                            if ((null === (e = null === (t = this.$data.award) || void 0 === t ? void 0 : t.sections) || void 0 === e ? void 0 : e.length) > 1) {
                                return "This award is for " + [...this.$data.award.sections.map(section => x.z.get(section) + "s")].join(", ").replace(/, ([^,]*)$/, " and $1.")
                            }
                            if (1 === (null === (n = null === (r = this.$data.award) || void 0 === r ? void 0 : r.sections) || void 0 === n ? void 0 : n.length)) return `This award is for ${x.z.get(this.$data.award.sections[0])}s only.`
                        }
                    },
                    methods: {
                        awardTitle(t) {
                            return T.includes(t.id) ? `${t.title} (${this.$accessor.global.getAppSectionFormatted})` : t.title
                        },
                        openAwardDialog(t) {
                            this.award = t, this.awardModal = !0
                        },
                        additionalAwardAchievedDate(t) {
                            const e = this.achievements.find(e => e.achievement_meta.additional_award_id === t);
                            return this.achievedDate(e)
                        },
                        isAwarded(t) {
                            const e = this.achievements.find(e => e.achievement_meta.additional_award_id === t && e.status === E.a.AWARDED);
                            if (e) {
                                if (T.includes(e.achievement_meta.additional_award_id)) return e.section === this.$accessor.global.getAppSection
                            }
                            return !!e
                        },
                        expiryDate(t) {
                            const e = this.achievements.find(e => e.achievement_meta.additional_award_id === t);
                            return Object(f.a)(new Date(e.expiry_date), "dd/MM/yyyy")
                        },
                        fetchAdditionalAwardsList() {
                            return y.a.get(`${this.$config.api.templates}/additional-awards/${this.filename}.json`).then(t => {
                                this.awards = t.data
                            })
                        }
                    }
                }),
                k = (r(1360), r(9)),
                component = Object(k.a)($, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "AdditionalAwardsList"
                    }, [e(l.a, [e(d.a, {
                        attrs: {
                            cols: "12",
                            sm: "6"
                        }
                    }, [e("h1", {
                        staticClass: "AdditionalAwards__title"
                    }, [t._v(t._s(t.title))])])], 1), t._v(" "), e(m.a, {
                        staticClass: "mb-12"
                    }), t._v(" "), t.isReady ? e(l.a, t._l(t.awards, (function(r, l) {
                        return e(d.a, {
                            key: l,
                            staticClass: "AdditionalAwards__award-container",
                            attrs: {
                                cols: "12",
                                sm: "6",
                                md: "4",
                                lg: "3"
                            }
                        }, [e("div", {
                            staticClass: "AdditionalAwards__award"
                        }, [e("div", {
                            staticClass: "AdditionalAwards__award-badge-container"
                        }, [t.isAwarded(r.id) ? e("div", {
                            staticClass: "AdditionalAwards__award-trophy"
                        }) : t._e(), t._v(" "), e("div", {
                            staticClass: "AdditionalAwards__award-badge-image-container"
                        }, [e("img", {
                            staticClass: "AdditionalAwards__award-badge",
                            attrs: {
                                src: t.fetchImage(r.id, "additional-award-badges"),
                                alt: "No achievements recorded."
                            }
                        })])]), t._v(" "), e("div", {
                            staticClass: "AdditionalAwards__award-content"
                        }, [e("Icon", {
                            staticClass: "AdditionalAwards__info-icon",
                            attrs: {
                                name: "info",
                                clickable: ""
                            },
                            nativeOn: {
                                click: function(e) {
                                    return t.openAwardDialog(r)
                                }
                            }
                        }), t._v(" "), e("div", {
                            staticClass: "AdditionalAwards__award-title"
                        }, [t._v(t._s(t.awardTitle(r)))]), t._v(" "), e("nuxt-link", {
                            attrs: {
                                to: {
                                    name: "additional-awards-requirement",
                                    params: {
                                        award: r
                                    }
                                }
                            }
                        }, [e("span", {
                            staticClass: "Link-alt my-2"
                        }, [t._v("View requirement")])]), t._v(" "), t.isAwarded(r.id) && r.expiry ? e("div", {
                            staticClass: "AdditionalAwards__award-expiry"
                        }, [t._v("\n            Expires on " + t._s(t.expiryDate(r.id)) + "\n          ")]) : t._e(), t._v(" "), t.isAwarded(r.id) ? e(n.a, {
                            staticClass: "AdditionalAwards__award-status mt-2",
                            style: {
                                background: t.ACHIEVEMENT_STATUS_TYPE_COLOUR_MAP.get(t.ACHIEVEMENT_STATUS_TYPE.AWARDED)
                            },
                            attrs: {
                                label: ""
                            }
                        }, [t._v("\n            " + t._s(t.additionalAwardAchievedDate(r.id)) + "\n          ")]) : t._e()], 1)])])
                    })), 1) : e(l.a, t._l(12, (function(t) {
                        return e(d.a, {
                            key: t,
                            staticClass: "AdditionalAwards__award-container",
                            attrs: {
                                cols: "12",
                                sm: "6",
                                md: "4",
                                lg: "3"
                            }
                        }, [e(w, {
                            staticClass: "mx-auto",
                            attrs: {
                                type: "image"
                            }
                        })], 1)
                    })), 1), t._v(" "), e("InformationDialog", {
                        attrs: {
                            model: t.awardModal,
                            title: t.award.title,
                            subtitle: t.awardSectionText,
                            "close-button-label": t.LABEL.OKAY,
                            "close-dialog": () => t.awardModal = !1
                        }
                    })], 1)
                }), [], !1, null, "3e55e5bd", null);
            e.default = component.exports;
            installComponents(component, {
                Icon: r(55).default,
                InformationDialog: r(219).default
            })
        },
        1359: function(t, e, r) {
            t.exports = {}
        },
        1360: function(t, e, r) {
            "use strict";
            r(1267)
        }
    }
]);