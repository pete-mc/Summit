(window.webpackJsonp = window.webpackJsonp || []).push([
    [195], {
        1253: function(t, e, o) {
            "use strict";
            o.r(e);
            var n = o(40),
                l = o(908),
                r = o(10),
                c = o(5),
                d = o(3),
                h = o(287),
                m = n.B.extend({
                    name: "IntroToSectionList",
                    data: () => ({
                        PATH: d,
                        ICONS: h,
                        INTRO_SECTION_IMAGE_NAMES: l.d,
                        SECTION_TYPE_NAME_MAP: c.z,
                        sectionSubmissions: [],
                        selectedForDelete: "",
                        model: !1
                    }),
                    mounted() {
                        this.init()
                    },
                    methods: {
                        init() {
                            this.sectionSubmissions = this.$accessor.pe.getSectionList.filter(p => p.section === this.$accessor.global.getAppSection).map(p => ({
                                id: p.id,
                                title: `Introduction to the ${this.sectionName(p)} Section`,
                                status: c.a[p.status],
                                ach_status: p.status,
                                imported: p.imported,
                                status_updated: p.status_updated,
                                colour: c.c.get(p.status),
                                actions: this.allowedActions(p)
                            }))
                        },
                        allowedActions(t) {
                            let e = [];
                            return [r.a.DRAFT_REVIEW, r.a.FEEDBACK_REVIEW].includes(t.status) ? (e.push({
                                title: c.i.EDIT,
                                callback: t => this.editAchievement(t.id),
                                iconPath: `${h.OUTLINE_PATH}/${h.OUTLINE.edit}`
                            }), this.$accessor.user.currentProfileIsAssumed || e.push({
                                title: c.i.DELETE,
                                callback: t => {
                                    this.model = !0, this.selectedForDelete = t.id
                                },
                                iconPath: `${h.OUTLINE_PATH}/${h.OUTLINE.delete}`
                            })) : e = this.itemViewState(t), e
                        },
                        itemViewState(t) {
                            return t.imported ? null : [{
                                title: c.i.VIEW,
                                callback: t => this.editAchievement(t.id),
                                iconPath: `${h.OUTLINE_PATH}/${h.OUTLINE.view}`
                            }]
                        },
                        sectionName: t => c.z.get(t.section),
                        deleteSubmission() {
                            this.deleteAchievement(this.selectedForDelete)
                        },
                        closeDialog() {
                            this.model = !1
                        }
                    }
                }),
                I = o(9),
                component = Object(I.a)(m, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("BaseList", {
                        attrs: {
                            title: t.overviewTitle,
                            subtitle: t.overviewSubtitle,
                            items: t.sectionSubmissions,
                            "delete-callback": t.deleteSubmission,
                            "confirmation-model": t.model,
                            "close-dialog": t.closeDialog,
                            "intro-section": ""
                        }
                    }, [e("template", {
                        slot: "sub-description-side"
                    }, [e("BaseOverviewSubDescription", {
                        attrs: {
                            text: t.subDescription,
                            links: t.subDescriptionLinks,
                            "image-src": t.fetchImage(t.INTRO_SECTION_IMAGE_NAMES.side)
                        }
                    })], 1), t._v(" "), e("template", {
                        slot: "sub-description-small"
                    }, [e("InfoDialogCard", {
                        attrs: {
                            title: "About " + t.overviewTemplate.title.label,
                            text: t.subDescription,
                            links: t.subDescriptionLinks,
                            "image-src": t.fetchImage(t.INTRO_SECTION_IMAGE_NAMES.side),
                            "image-alt": t.overviewTemplate.title.label
                        }
                    })], 1)], 2)
                }), [], !1, null, null, null);
            e.default = component.exports;
            installComponents(component, {
                BaseOverviewSubDescription: o(963).default,
                InfoDialogCard: o(962).default,
                BaseList: o(1201).default
            })
        },
        1448: function(t, e, o) {
            "use strict";
            o.r(e);
            var n = o(40),
                l = o(1325),
                r = o(1253),
                c = o(4),
                d = o(3),
                h = o(5),
                m = n.B.extend({
                    name: "IntroSectionPage",
                    components: {
                        IntroSectionOverview: l.default,
                        IntroSectionList: r.default
                    },
                    data: () => ({
                        templateData: {},
                        isReady: !1
                    }),
                    meta: {
                        theme: "blue"
                    },
                    async created() {
                        this.$accessor.global.setBreadcrumbs([{
                            text: h.l.INTRO_SECTION,
                            to: d.INTRO_SECTION,
                            exact: !0,
                            disabled: !0
                        }]), this.$accessor.pe.resetState();
                        try {
                            this.$data.templateData = await this.getOverviewData(c.INTRO_SECTION_PATH)
                        } catch (t) {
                            if (this.$nuxt.isOffline) return this.$nuxt.error({
                                statusCode: 503,
                                message: ""
                            });
                            throw new Error(t)
                        }
                        await this.loadList(), this.$data.isReady = !0
                    },
                    computed: {
                        showList() {
                            return this.currentSectionList.length > 0 && this.isReady
                        },
                        showOverview() {
                            return 0 === this.currentSectionList.length && this.isReady
                        },
                        currentSectionList() {
                            return this.$accessor.pe.getSectionList.filter(t => t.section === this.$accessor.global.getAppSection)
                        }
                    }
                }),
                I = o(9),
                component = Object(I.a)(m, (function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("div", [this.showList ? t("IntroSectionList", {
                        attrs: {
                            "overview-template": this.templateData
                        }
                    }) : this._e(), this._v(" "), this.showOverview ? t("IntroSectionOverview", {
                        attrs: {
                            "overview-template": this.templateData
                        }
                    }) : this._e()], 1)
                }), [], !1, null, null, null);
            e.default = component.exports;
            installComponents(component, {
                IntroSectionList: o(1253).default,
                IntroSectionOverview: o(1325).default
            })
        }
    }
]);