(window.webpackJsonp = window.webpackJsonp || []).push([
    [193], {
        1252: function(t, e, o) {
            "use strict";
            o.r(e);
            var n = o(40),
                r = o(10),
                c = o(5),
                l = o(3),
                d = o(287),
                h = o(908),
                m = n.A.extend({
                    name: "IntroToScoutingList",
                    props: {},
                    data: () => ({
                        PATH: l,
                        ICONS: d,
                        INTRO_SCOUTING_IMAGE_NAMES: h.c,
                        scoutingSubmissions: [],
                        selectedForDelete: "",
                        model: !1
                    }),
                    mounted() {
                        this.init()
                    },
                    methods: {
                        init() {
                            this.scoutingSubmissions = this.$accessor.pe.getScoutingList.map(p => ({
                                id: p.id,
                                title: "Introduction to Scouting",
                                status: c.a[p.status],
                                ach_status: p.status,
                                section: p.section,
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
                                iconPath: `${d.OUTLINE_PATH}/${d.OUTLINE.edit}`
                            }), this.$accessor.user.currentProfileIsAssumed || e.push({
                                title: c.i.DELETE,
                                callback: t => {
                                    this.model = !0, this.selectedForDelete = t.id
                                },
                                iconPath: `${d.OUTLINE_PATH}/${d.OUTLINE.delete}`
                            })) : e = this.itemViewState(t), e
                        },
                        itemViewState(t) {
                            return t.imported ? null : [{
                                title: c.i.VIEW,
                                callback: t => this.editAchievement(t.id),
                                iconPath: `${d.OUTLINE_PATH}/${d.OUTLINE.view}`
                            }]
                        },
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
                            title: "Introduction to Scouting",
                            subtitle: "This marks the beginning of your Scouting journey.",
                            items: t.scoutingSubmissions,
                            "delete-callback": t.deleteSubmission,
                            "confirmation-model": t.model,
                            "close-dialog": t.closeDialog,
                            "intro-scouting": ""
                        }
                    }, [e("template", {
                        slot: "sub-description-side"
                    }, [e("BaseOverviewSubDescription", {
                        attrs: {
                            text: t.subDescription,
                            links: t.subDescriptionLinks,
                            "image-src": t.fetchImage(t.INTRO_SCOUTING_IMAGE_NAMES.side)
                        }
                    })], 1), t._v(" "), e("template", {
                        slot: "sub-description-small"
                    }, [e("InfoDialogCard", {
                        attrs: {
                            title: "About Introduction to Scouting",
                            text: t.subDescription,
                            links: t.subDescriptionLinks,
                            "image-src": t.fetchImage(t.INTRO_SCOUTING_IMAGE_NAMES.side),
                            "image-alt": "Introduction to Scouting"
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
        1447: function(t, e, o) {
            "use strict";
            o.r(e);
            var n = o(40),
                r = o(1324),
                c = o(1252),
                l = o(4),
                d = o(5),
                h = o(3),
                m = o(10),
                I = n.A.extend({
                    name: "IntroScoutingPage",
                    components: {
                        IntroScoutingOverview: r.default,
                        IntroScoutingList: c.default
                    },
                    data: () => ({
                        templateData: {},
                        isReady: !1
                    }),
                    async created() {
                        this.$accessor.global.setBreadcrumbs([{
                            text: d.l.INTRO_SCOUTING,
                            to: h.INTRO_SCOUTING,
                            exact: !0,
                            disabled: !0
                        }]), this.$accessor.pe.resetState();
                        try {
                            this.$data.templateData = await this.getOverviewData(l.INTRO_SCOUTING_PATH)
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
                            return this.currentScoutingList.length > 0 && this.isReady
                        },
                        showOverview() {
                            return 0 === this.currentScoutingList.length && this.isReady
                        },
                        currentScoutingList() {
                            return this.$accessor.pe.getScoutingList.filter(t => t.section === this.$accessor.global.getAppSection || t.status === m.a.AWARDED)
                        }
                    }
                }),
                S = o(9),
                component = Object(S.a)(I, (function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("div", [this.showList ? t("IntroScoutingList", {
                        attrs: {
                            "overview-template": this.templateData
                        }
                    }) : this._e(), this._v(" "), this.showOverview ? t("IntroScoutingOverview", {
                        attrs: {
                            "overview-template": this.templateData
                        }
                    }) : this._e()], 1)
                }), [], !1, null, null, null);
            e.default = component.exports;
            installComponents(component, {
                IntroScoutingList: o(1252).default,
                IntroScoutingOverview: o(1324).default
            })
        }
    }
]);