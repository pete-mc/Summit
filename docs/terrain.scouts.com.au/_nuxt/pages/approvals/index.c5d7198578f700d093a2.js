(window.webpackJsonp = window.webpackJsonp || []).push([
    [183, 7, 13, 35, 36, 49, 50, 51, 57, 73, 86, 89, 93, 94, 110, 111, 112, 114, 116, 121, 123, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 141, 144, 167, 170, 171, 172], {
        1002: function(e, t, n) {
            "use strict";
            n(970)
        },
        1003: function(e, t, n) {
            "use strict";
            n(971)
        },
        1007: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(40).h.extend({
                    name: "OasStageSidebarContent",
                    props: {
                        stage: {
                            type: Number,
                            required: !0
                        },
                        branch: {
                            type: String,
                            required: !0
                        },
                        path: {
                            type: String,
                            required: !0
                        }
                    },
                    methods: {
                        requirementFile() {
                            const path = this.$props.path.substring(0, this.$props.path.lastIndexOf("/"));
                            return this.templateFilepath(`/${path}/oas-${this.$props.branch}-${this.$props.stage}-requirement.pdf`)
                        }
                    }
                }),
                o = (n(1048), n(9)),
                component = Object(o.a)(r, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", {
                        staticClass: "OasStageSidebarContent"
                    }, [e._m(0), e._v(" "), t("p", [e._v("You don’t need to attach any document if you are verified by another Youth Member or an Adult Leader.")]), e._v(" "), t("a", {
                        staticClass: "OasStageSidebarContent__link",
                        class: {
                            "OasStageSidebarContent__link--disabled": e.$nuxt.isOffline
                        },
                        attrs: {
                            href: e.$nuxt.isOffline ? null : e.requirementFile(),
                            target: e.$nuxt.isOffline ? "none" : "_blank",
                            rel: "noopener noreferrer"
                        }
                    }, [e._v("\n    Download requirement\n  ")])])
                }), [function() {
                    var e = this._self._c;
                    this._self._setupProxy;
                    return e("p", [e("strong", [this._v("For external verifier:")]), this._v("\n    download & print the requirement then have your verifier sign it. They can verify multiple I-statements in one\n    single document. You only need to attach it once.\n  ")])
                }], !1, null, "6f96bcbe", null);
            t.default = component.exports
        },
        1008: function(e, t, n) {
            e.exports = {}
        },
        1009: function(e, t, n) {
            e.exports = {}
        },
        1010: function(e, t, n) {
            e.exports = {}
        },
        1021: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(886),
                o = n(243),
                l = n(885),
                c = n(1),
                d = n(149),
                m = c.a.extend({
                    name: "Milestone",
                    props: {
                        metrics: {
                            type: Object,
                            default: null
                        }
                    },
                    computed: {
                        assist() {
                            var e;
                            return (null === (e = this.milestone) || void 0 === e ? void 0 : e.total_assists) || 0
                        },
                        lead() {
                            var e;
                            return (null === (e = this.milestone) || void 0 === e ? void 0 : e.total_leads) || 0
                        },
                        totalParticipate() {
                            return this.participations.reduce((e, t) => t.total + e, 0)
                        },
                        participations() {
                            var e;
                            return (null === (e = this.milestone) || void 0 === e ? void 0 : e.participates) || []
                        },
                        milestone() {
                            var e;
                            return null === (e = this.metrics) || void 0 === e ? void 0 : e.milestone
                        },
                        show() {
                            return null != this.metrics
                        },
                        icons: () => ({
                            community: n(176),
                            outdoors: n(177),
                            creative: n(178),
                            personal_growth: n(179)
                        }),
                        labels: () => ({
                            community: "Community Challenge",
                            outdoors: "Outdoors Challenge",
                            creative: "Creative Challenge",
                            personal_growth: "Personal Growth Challenge"
                        }),
                        milestoneMaxes() {
                            var e;
                            const t = (null === (e = this.milestone) || void 0 === e ? void 0 : e.milestone) || 1;
                            return d.a.find(e => e.stage === t).maxTotals
                        },
                        maxAssist() {
                            return this.milestoneMaxes.assists
                        },
                        maxLead() {
                            return this.milestoneMaxes.leads
                        },
                        maxParticipateEntry() {
                            return this.milestoneMaxes.participates / 4
                        },
                        maxParticipate() {
                            return this.milestoneMaxes.participates
                        }
                    }
                }),
                v = (n(1002), n(9)),
                component = Object(v.a)(m, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", [t(l.a, {
                        staticClass: "MilestoneDialog__strong-row",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(r.a, [e._v("Participate")]), e._v(" "), t(r.a, {
                        staticClass: "MilestoneDialog__numbers",
                        attrs: {
                            cols: "3"
                        }
                    }, [e._v(e._s(e.totalParticipate) + " / " + e._s(e.maxParticipate))])], 1), e._v(" "), e._l(e.participations, (function(n) {
                        return t(l.a, {
                            key: n.challenge_area,
                            staticClass: "MilestoneDialog__normal-row",
                            attrs: {
                                "no-gutters": ""
                            }
                        }, [t(r.a, {
                            staticClass: "d-flex align-self-center",
                            attrs: {
                                cols: "auto"
                            }
                        }, [t("img", {
                            staticClass: "MilestoneDialog__icon",
                            attrs: {
                                src: e.icons[n.challenge_area],
                                alt: e.labels[n.challenge_area]
                            }
                        })]), e._v(" "), t(r.a, [e._v("\n      " + e._s(e.labels[n.challenge_area]) + "\n    ")]), e._v(" "), t(r.a, {
                            staticClass: "MilestoneDialog__numbers",
                            attrs: {
                                cols: "3"
                            }
                        }, [e._v(e._s(n.total) + " / " + e._s(e.maxParticipateEntry))])], 1)
                    })), e._v(" "), t(o.a, {
                        staticClass: "my-1"
                    }), e._v(" "), t(l.a, {
                        staticClass: "MilestoneDialog__strong-row",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(r.a, [e._v("Assist")]), e._v(" "), t(r.a, {
                        staticClass: "MilestoneDialog__numbers",
                        attrs: {
                            cols: "3"
                        }
                    }, [e._v(e._s(e.assist) + " / " + e._s(e.maxAssist))])], 1), e._v(" "), t(o.a, {
                        staticClass: "my-1"
                    }), e._v(" "), t(l.a, {
                        staticClass: "MilestoneDialog__strong-row",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(r.a, [e._v("Lead")]), e._v(" "), t(r.a, {
                        staticClass: "MilestoneDialog__numbers",
                        attrs: {
                            cols: "3"
                        }
                    }, [e._v(e._s(e.lead) + " / " + e._s(e.maxLead))])], 1)], 2)
                }), [], !1, null, "6ee7c5d4", null);
            t.default = component.exports
        },
        1022: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(886),
                o = n(243),
                l = n(885),
                c = n(1),
                d = n(958),
                m = c.a.extend({
                    name: "Sia",
                    props: {
                        metrics: {
                            type: Object,
                            default: null
                        },
                        section: {
                            type: String,
                            required: !0
                        }
                    },
                    computed: {
                        sia() {
                            var e;
                            return (null === (e = this.metrics) || void 0 === e ? void 0 : e.sia) || {
                                completed_projects: 0,
                                completed_areas: [],
                                in_progress: 0
                            }
                        },
                        projectsCompleted() {
                            return this.sia.completed_projects
                        },
                        maxProjectsCompleted() {
                            return d.b[this.section].projects
                        },
                        projectsInProgress() {
                            return this.sia.in_progress
                        },
                        areasCompleted() {
                            return this.sia.completed_areas.length
                        },
                        maxAreasCompleted() {
                            return d.b[this.section].areas
                        },
                        areas() {
                            return this.sia.completed_areas.map(e => d.a[e]).join(", ")
                        }
                    }
                }),
                v = (n(1003), n(9)),
                component = Object(v.a)(m, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", [t(l.a, {
                        staticClass: "SiaDialog__strong-row",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(r.a, [e._v("Projects completed")]), e._v(" "), t(r.a, {
                        staticClass: "SiaDialog__numbers",
                        attrs: {
                            cols: "3"
                        }
                    }, [e._v(e._s(e.projectsCompleted) + " / " + e._s(e.maxProjectsCompleted))])], 1), e._v(" "), t(o.a, {
                        staticClass: "my-1"
                    }), e._v(" "), t(l.a, {
                        staticClass: "SiaDialog__strong-row",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(r.a, [e._v("Areas completed")]), e._v(" "), t(r.a, {
                        staticClass: "SiaDialog__numbers",
                        attrs: {
                            cols: "3"
                        }
                    }, [e._v(e._s(e.areasCompleted) + " / " + e._s(e.maxAreasCompleted))])], 1), e._v(" "), t(l.a, {
                        staticClass: "SiaDialog__normal-row",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(r.a, [e._v("\n      " + e._s(e.areas) + "\n    ")])], 1), e._v(" "), t(o.a, {
                        staticClass: "my-1"
                    }), e._v(" "), t(l.a, {
                        staticClass: "SiaDialog__strong-row",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(r.a, [e._v("Projects in progress")]), e._v(" "), t(r.a, {
                        staticClass: "SiaDialog__numbers",
                        attrs: {
                            cols: "3"
                        }
                    }, [e._v(e._s(e.projectsInProgress))])], 1)], 1)
                }), [], !1, null, "29db777f", null);
            t.default = component.exports
        },
        1029: function(e, t, n) {
            "use strict";
            n(978)
        },
        1030: function(e, t, n) {
            var map = {
                "./icon-peak-award-cub-active.svg": 290,
                "./icon-peak-award-cub-disabled.svg": 291,
                "./icon-peak-award-joey-active.svg": 292,
                "./icon-peak-award-joey-disabled.svg": 293,
                "./icon-peak-award-rover-active.svg": 294,
                "./icon-peak-award-rover-disabled.svg": 295,
                "./icon-peak-award-scout-active.svg": 296,
                "./icon-peak-award-scout-disabled.svg": 297,
                "./icon-peak-award-venturer-active.svg": 298,
                "./icon-peak-award-venturer-disabled.svg": 299
            };

            function r(e) {
                var t = o(e);
                return n(t)
            }

            function o(e) {
                if (!n.o(map, e)) {
                    var t = new Error("Cannot find module '" + e + "'");
                    throw t.code = "MODULE_NOT_FOUND", t
                }
                return map[e]
            }
            r.keys = function() {
                return Object.keys(map)
            }, r.resolve = o, e.exports = r, r.id = 1030
        },
        1031: function(e, t, n) {
            "use strict";
            n(979)
        },
        1034: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(886),
                o = n(885),
                l = n(1),
                c = n(1102),
                d = n(1103),
                m = n(1131),
                v = n(1098),
                _ = n(1104),
                f = n(1099),
                h = n(4),
                y = l.a.extend({
                    name: "PeakAwardRequirements",
                    components: {
                        ProgramEssentialsCard: c.default,
                        SiaCard: d.default,
                        OasCard: m.default,
                        PersonalDevelopmentCard: v.default,
                        AdventurousJourneyCard: f.default,
                        PersonalReflectionCard: _.default
                    },
                    props: {
                        metrics: {
                            type: Object,
                            required: !0
                        },
                        section: {
                            type: String,
                            required: !0
                        }
                    },
                    data: () => ({
                        SECTION_TYPES: h.SECTION_TYPES
                    })
                }),
                w = n(9),
                component = Object(w.a)(y, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", {
                        staticClass: "PeakAwardRequirements"
                    }, [t(o.a, [t(r.a, {
                        attrs: {
                            cols: "12",
                            md: "6"
                        }
                    }, [t(o.a, [t(r.a, {
                        attrs: {
                            cols: "12"
                        }
                    }, [t("program-essentials-card", {
                        attrs: {
                            metrics: e.metrics
                        }
                    })], 1), e._v(" "), t(r.a, {
                        attrs: {
                            cols: "12"
                        }
                    }, [t("oas-card", {
                        attrs: {
                            metrics: e.metrics,
                            section: e.section
                        }
                    })], 1)], 1)], 1), e._v(" "), t(r.a, {
                        attrs: {
                            cols: "12",
                            md: "6"
                        }
                    }, [t(o.a, [t(r.a, {
                        attrs: {
                            cols: "12"
                        }
                    }, [t("sia-card", {
                        attrs: {
                            metrics: e.metrics,
                            section: e.section
                        }
                    })], 1), e._v(" "), t(r.a, {
                        attrs: {
                            cols: "12"
                        }
                    }, [e.section !== e.SECTION_TYPES.JOEY ? t("personal-development-card", {
                        attrs: {
                            metrics: e.metrics,
                            section: e.section
                        }
                    }) : e._e()], 1), e._v(" "), t(r.a, {
                        attrs: {
                            cols: "12"
                        }
                    }, [t("adventurous-journey-card", {
                        attrs: {
                            metrics: e.metrics,
                            section: e.section
                        }
                    })], 1), e._v(" "), t(r.a, {
                        attrs: {
                            cols: "12"
                        }
                    }, [t("personal-reflection-card", {
                        attrs: {
                            metrics: e.metrics,
                            section: e.section
                        }
                    })], 1)], 1)], 1)], 1)], 1)
                }), [], !1, null, null, null);
            t.default = component.exports
        },
        1038: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(886),
                o = n(243),
                l = n(885),
                c = n(1),
                d = n(5),
                m = n(28),
                v = c.a.extend({
                    name: "Oas",
                    props: {
                        metrics: {
                            type: Object,
                            default: null
                        }
                    },
                    computed: {
                        oas() {
                            var e;
                            return (null === (e = this.metrics) || void 0 === e ? void 0 : e.oas) || {
                                total_progressions: 0,
                                highest: []
                            }
                        },
                        coreSkills: () => d.m,
                        specialistSkills: () => d.n
                    },
                    methods: {
                        icon(e) {
                            const t = `icon--oas-${e}.svg`;
                            return n(903)("./" + t)
                        },
                        label: e => Object(m.h)(e.replace("-", " ")),
                        stages(e) {
                            const t = this.oas.highest.filter(t => t.stream === e).map(e => e.stream === e.branch ? "Stage " + e.stage : `Stage ${e.stage} (${this.label(e.branch)})`);
                            return 0 === t.length && t.push("Not started"), t
                        }
                    }
                }),
                _ = (n(1029), n(9)),
                component = Object(_.a)(v, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", [t(l.a, {
                        staticClass: "OasDialog__strong-row"
                    }, [t(r.a, [e._v("Core Skills")])], 1), e._v(" "), e._l(e.coreSkills, (function(n) {
                        return t(l.a, {
                            key: n,
                            staticClass: "OasDialog__normal-row"
                        }, [t(r.a, {
                            staticClass: "pl-0",
                            attrs: {
                                cols: "auto"
                            }
                        }, [t("img", {
                            staticClass: "OasDialog__icon",
                            attrs: {
                                src: e.icon(n),
                                alt: e.label(n)
                            }
                        })]), e._v(" "), t(r.a, [e._v("\n      " + e._s(e.label(n)) + "\n    ")]), e._v(" "), t(r.a, {
                            attrs: {
                                cols: "6"
                            }
                        }, e._l(e.stages(n), (function(n) {
                            return t(l.a, {
                                key: n,
                                staticClass: "OasDialog__inner-row"
                            }, [t(r.a, [e._v("\n          " + e._s(n) + "\n        ")])], 1)
                        })), 1)], 1)
                    })), e._v(" "), t(o.a, {
                        staticClass: "my-12"
                    }), e._v(" "), t(l.a, {
                        staticClass: "OasDialog__strong-row"
                    }, [t(r.a, [e._v("Specialist Skills")])], 1), e._v(" "), e._l(e.specialistSkills, (function(n) {
                        return t(l.a, {
                            key: n,
                            staticClass: "OasDialog__normal-row"
                        }, [t(r.a, {
                            staticClass: "pl-0",
                            attrs: {
                                cols: "auto"
                            }
                        }, [t("img", {
                            staticClass: "OasDialog__icon",
                            attrs: {
                                src: e.icon(n),
                                alt: e.label(n)
                            }
                        })]), e._v(" "), t(r.a, {
                            staticClass: "pr-0"
                        }, [e._v("\n      " + e._s(e.label(n)) + "\n    ")]), e._v(" "), t(r.a, {
                            attrs: {
                                cols: "6"
                            }
                        }, e._l(e.stages(n), (function(n) {
                            return t(l.a, {
                                key: n,
                                staticClass: "OasDialog__inner-row"
                            }, [t(r.a, [e._v("\n          " + e._s(n.replace(/-/g, " ")) + "\n        ")])], 1)
                        })), 1)], 1)
                    }))], 2)
                }), [], !1, null, "8e2fec9c", null);
            t.default = component.exports
        },
        1039: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(1),
                o = n(1007),
                l = n(964),
                c = r.a.extend({
                    name: "OasStageSidebar",
                    components: {
                        Accordion: l.default,
                        OasStageSidebarContent: o.default
                    },
                    props: {
                        stage: {
                            type: Number,
                            required: !0
                        },
                        branch: {
                            type: String,
                            required: !0
                        },
                        path: {
                            type: String,
                            required: !0
                        }
                    }
                }),
                d = (n(1069), n(9)),
                component = Object(d.a)(c, (function() {
                    var e = this._self._c;
                    this._self._setupProxy;
                    return e("div", {
                        staticClass: "OasStageSidebar"
                    }, [this.$vuetify.breakpoint.mdAndUp ? e("div", {
                        staticClass: "OasStageSidebar__default"
                    }, [e("OasStageSidebarContent", this._b({}, "OasStageSidebarContent", { ...this.$props
                    }, !1))], 1) : e("Accordion", {
                        attrs: {
                            title: "Requirements"
                        }
                    }, [e("OasStageSidebarContent", this._b({}, "OasStageSidebarContent", { ...this.$props
                    }, !1))], 1)], 1)
                }), [], !1, null, null, null);
            t.default = component.exports;
            installComponents(component, {
                OasStageSidebarContent: n(1007).default,
                Accordion: n(964).default
            })
        },
        1040: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(870),
                o = n(236),
                l = n(35),
                c = n(890),
                d = n(1133),
                m = n(1132),
                v = n(892),
                _ = n(62),
                f = n(1),
                h = n(5),
                y = f.a.extend({
                    name: "VerifierDialog",
                    props: {
                        model: {
                            type: Boolean
                        },
                        title: {
                            type: String,
                            required: !0
                        },
                        confirmButtonLabel: {
                            type: String,
                            default: h.i.ADD_VERIFIER
                        },
                        closeButtonLabel: {
                            type: String,
                            default: h.i.CANCEL
                        },
                        subtitle: {
                            type: String,
                            required: !0
                        },
                        confirmCallback: {
                            type: Function,
                            default: () => {}
                        },
                        closeDialog: {
                            type: Function,
                            required: !0
                        }
                    },
                    data: () => ({
                        LABEL: h.i,
                        type: "member",
                        name: "",
                        contact: "",
                        active: 0,
                        validateName: !1,
                        validateContact: !1
                    }),
                    computed: {
                        valid() {
                            return !(!this.validateName || !this.validateContact)
                        },
                        showDialog() {
                            return this.model
                        }
                    },
                    methods: {
                        confirm() {
                            this.closeDialog(), this.$props.confirmCallback(this.verifierDetails())
                        },
                        verifierDetails() {
                            return {
                                verifierType: this.type,
                                verifierName: this.name,
                                verifierContact: this.contact
                            }
                        }
                    }
                }),
                w = (n(1070), n(9)),
                component = Object(w.a)(y, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t(c.a, {
                        staticClass: "VerifierDialog",
                        on: {
                            "click:outside": e.closeDialog
                        },
                        scopedSlots: e._u([{
                            key: "activator",
                            fn: function(t) {
                                let {
                                    on: n
                                } = t;
                                return [e._t("dialogActivator", null, {
                                    parentEvents: n
                                })]
                            }
                        }], null, !0),
                        model: {
                            value: e.showDialog,
                            callback: function(t) {
                                e.showDialog = t
                            },
                            expression: "showDialog"
                        }
                    }, [e._v(" "), t(o.a, {
                        staticClass: "VerifierDialog__card"
                    }, [t(l.d, {
                        staticClass: "mt-0"
                    }, [t("div", [e._v(e._s(e.title))])]), e._v(" "), t(m.a, {
                        staticClass: "VerifierDialog__radio-group",
                        attrs: {
                            row: ""
                        },
                        model: {
                            value: e.type,
                            callback: function(t) {
                                e.type = t
                            },
                            expression: "type"
                        }
                    }, [t(d.a, {
                        key: "0",
                        staticClass: "VerifierDialog__radio",
                        attrs: {
                            name: "type",
                            label: "Another Scout Member",
                            value: "member"
                        }
                    }), e._v(" "), t(d.a, {
                        key: "1",
                        staticClass: "VerifierDialog__radio",
                        attrs: {
                            name: "type",
                            label: "Someone else",
                            value: "external"
                        }
                    })], 1), e._v(" "), t(_.a, {
                        ref: "name",
                        staticClass: "VerifierDialog__text-field",
                        attrs: {
                            "data-cy": "verifier-name",
                            label: "Verifier name"
                        },
                        on: {
                            input: function(t) {
                                e.validateName = !0
                            }
                        },
                        model: {
                            value: e.name,
                            callback: function(t) {
                                e.name = t
                            },
                            expression: "name"
                        }
                    }), e._v(" "), t(_.a, {
                        ref: "contact",
                        staticClass: "VerifierDialog__text-field",
                        attrs: {
                            "data-cy": "contact",
                            label: "Email or phone number"
                        },
                        on: {
                            input: function(t) {
                                e.validateContact = !0
                            }
                        },
                        model: {
                            value: e.contact,
                            callback: function(t) {
                                e.contact = t
                            },
                            expression: "contact"
                        }
                    }), e._v(" "), t("p", {
                        staticClass: "VerifierDialog__text"
                    }, [e._v("\n      You can be verified by a Youth Member in any section who is 2 stages above yours or an Adult Leader (except\n      Stage 6 and above).\n    ")]), e._v(" "), t("p", {
                        staticClass: "VerifierDialog__text"
                    }, [e._v("\n      If you are verified by a non-Scout member, please remember to attach a signed supporting document.\n    ")]), e._v(" "), t(l.a, {
                        staticClass: "VerifierDialog__actions pa-0"
                    }, [t(v.a), e._v(" "), t(r.a, {
                        attrs: {
                            text: ""
                        },
                        on: {
                            click: e.closeDialog
                        }
                    }, [e._v(e._s(e.closeButtonLabel))]), e._v(" "), t(r.a, {
                        staticClass: "VerifierDialog__saveBtn mr-4",
                        attrs: {
                            disabled: !e.valid,
                            "data-cy": "btn-verify",
                            text: ""
                        },
                        on: {
                            click: e.confirm
                        }
                    }, [e._v("\n        " + e._s(e.confirmButtonLabel) + "\n      ")])], 1)], 1)], 1)
                }), [], !1, null, "7222bfc8", null);
            t.default = component.exports
        },
        1044: function(e, t, n) {
            e.exports = {}
        },
        1045: function(e, t, n) {
            e.exports = {}
        },
        1046: function(e, t, n) {
            e.exports = {}
        },
        1047: function(e, t, n) {
            e.exports = {}
        },
        1048: function(e, t, n) {
            "use strict";
            n(994)
        },
        1049: function(e, t, n) {
            e.exports = {}
        },
        1068: function(e, t, n) {
            "use strict";
            n(1008)
        },
        1069: function(e, t, n) {
            "use strict";
            n(1009)
        },
        1070: function(e, t, n) {
            "use strict";
            n(1010)
        },
        1085: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(3),
                o = n(909),
                l = n(40),
                c = n(10),
                d = l.A.extend({
                    name: "IntroScoutingRequirements",
                    data: () => ({
                        PATH: r,
                        INTRO_SCOUTING_TITLE: o.INTRO_SCOUTING_TITLE,
                        INTRO_SCOUTING_SUBTITLE: o.INTRO_SCOUTING_SUBTITLE,
                        INTRO_SCOUTING_STATEMENTS: o.INTRO_SCOUTING_STATEMENTS,
                        isReady: !1
                    }),
                    async created() {
                        await this.loadTemplate(!0), this.isReady = !0
                    },
                    computed: {
                        draft() {
                            return this.$accessor.pe.getCurrentScoutingSubmission && (this.$accessor.pe.getCurrentScoutingSubmission.status === c.a.DRAFT_REVIEW || this.$accessor.pe.getCurrentScoutingSubmission.status === c.a.FEEDBACK_REVIEW)
                        }
                    }
                }),
                m = n(9),
                component = Object(m.a)(d, (function() {
                    var e, t, n = this,
                        r = n._self._c;
                    n._self._setupProxy;
                    return n.isReady ? r("BaseRequirements", {
                        attrs: {
                            title: n.INTRO_SCOUTING_TITLE,
                            subtitle: n.INTRO_SCOUTING_SUBTITLE,
                            "set-answer-function": n.$accessor.pe.setIntroScoutingAnswers,
                            "set-uploads-function": n.$accessor.pe.setIntroScoutingUploads,
                            "save-function": n.saveCurrent,
                            "submit-function": n.submitCurrent,
                            "spices-label": n.INTRO_SCOUTING_STATEMENTS.spices,
                            "pdr-label": n.INTRO_SCOUTING_STATEMENTS.planDoReview,
                            "back-path": "" + n.PATH.INTRO_SCOUTING,
                            "forward-path": "" + n.PATH.INTRO_SCOUTING,
                            draft: n.$nuxt.isOffline || n.draft,
                            "initial-answers": n.$accessor.pe.getCurrentScoutingSubmissionAnswers,
                            "initial-uploads": n.$accessor.pe.getScoutingUploads,
                            template: n.$accessor.pe.getIntroScoutingTemplate,
                            "is-reviewing": n.$accessor.approvals.getIsReviewing,
                            "is-loading": n.isCreating || n.isSaving,
                            "disabled-inputs": n.$nuxt.isOffline || !n.isYouthMember || n.$accessor.approvals.getIsReviewing,
                            status: null === (e = n.$accessor.pe.currentScoutingSubmission) || void 0 === e ? void 0 : e.status.valueOf(),
                            "latest-submission": null === (t = n.$accessor.pe.currentScoutingSubmission) || void 0 === t ? void 0 : t.latest_submission
                        }
                    }) : n._e()
                }), [], !1, null, null, null);
            t.default = component.exports;
            installComponents(component, {
                BaseRequirements: n(916).default
            })
        },
        1086: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(3),
                o = n(909),
                l = n(40),
                c = n(10),
                d = l.B.extend({
                    name: "IntroSectionRequirements",
                    data: () => ({
                        PATH: r,
                        INTRO_SECTION_SUBTITLE: o.INTRO_SECTION_SUBTITLE,
                        INTRO_SECTION_STATEMENTS: o.INTRO_SECTION_STATEMENTS,
                        INTRO_SECTION_CONFIRM_TITLE: o.INTRO_SECTION_CONFIRM_TITLE,
                        INTRO_SECTION_CONFIRM_SUBTITLE: o.INTRO_SECTION_CONFIRM_SUBTITLE,
                        isReady: !1
                    }),
                    async created() {
                        await this.loadTemplate(!0), this.isReady = !0
                    },
                    computed: {
                        draft() {
                            return this.$accessor.pe.getCurrentSectionSubmission && (this.$accessor.pe.getCurrentSectionSubmission.status === c.a.DRAFT_REVIEW || this.$accessor.pe.getCurrentSectionSubmission.status === c.a.FEEDBACK_REVIEW)
                        }
                    }
                }),
                m = n(9),
                component = Object(m.a)(d, (function() {
                    var e, t, n = this,
                        r = n._self._c;
                    n._self._setupProxy;
                    return n.isReady ? r("BaseRequirements", {
                        attrs: {
                            title: `The ${n.$accessor.global.getAppSectionFormatted} Section`,
                            subtitle: n.INTRO_SECTION_SUBTITLE,
                            "confirm-title": n.INTRO_SECTION_CONFIRM_TITLE,
                            "confirm-subtitle": n.INTRO_SECTION_CONFIRM_SUBTITLE,
                            "set-answer-function": n.$accessor.pe.setIntroSectionAnswers,
                            "set-uploads-function": n.$accessor.pe.setCurrentSectionUploads,
                            "save-function": n.saveCurrent,
                            "submit-function": n.submitCurrent,
                            "pdr-label": `What does Plan>Do>Review> look like in the ${n.$accessor.global.getAppSectionFormatted} section?`,
                            "back-path": "" + n.PATH.INTRO_SECTION,
                            "forward-path": "" + n.PATH.INTRO_SECTION,
                            draft: n.$nuxt.isOffline || n.draft,
                            "initial-answers": n.$accessor.pe.getCurrentSectionSubmissionAnswers,
                            "initial-uploads": n.$accessor.pe.getSectionUploads,
                            template: n.$accessor.pe.getIntroSectionTemplate,
                            "is-reviewing": n.$accessor.approvals.getIsReviewing,
                            "is-loading": n.isCreating || n.isSaving,
                            "disabled-inputs": n.$nuxt.isOffline || !n.isYouthMember || n.$accessor.approvals.getIsReviewing,
                            confirm: "",
                            status: null === (e = n.$accessor.pe.currentSectionSubmission) || void 0 === e ? void 0 : e.status.valueOf(),
                            "latest-submission": null === (t = n.$accessor.pe.currentSectionSubmission) || void 0 === t ? void 0 : t.latest_submission
                        }
                    }) : n._e()
                }), [], !1, null, null, null);
            t.default = component.exports;
            installComponents(component, {
                BaseRequirements: n(916).default
            })
        },
        1088: function(e, t, n) {
            e.exports = {}
        },
        1098: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(1),
                o = n(933),
                l = n(932),
                c = n(5),
                d = n(41);
            const m = {};
            m[d.b.CUB] = "Complete a Leadership / Personal Development Course of at least 1-day duration.", m[d.b.SCOUT] = "Complete a Leadership / Personal Development Course of at least two-days (one weekend) duration.", m[d.b.VENTURER] = "Complete a Leadership / Personal Development Course of at least a weekend’s duration.", m[d.b.ROVER] = "Complete a Leadership / Personal Development of at least 30 hours’ duration.";
            var v = r.a.extend({
                    name: "PersonalDevelopmentCard",
                    components: {
                        PeakAwardCard: l.default
                    },
                    props: {
                        metrics: {
                            type: Object,
                            required: !0
                        },
                        section: {
                            type: String,
                            required: !0
                        }
                    },
                    computed: {
                        requirements() {
                            return [{
                                description: m[this.section],
                                completed: null != this.metrics.personal_development
                            }]
                        },
                        percentage() {
                            return this.metrics.peak_award.personal_development / o.c.personal_development
                        },
                        title: () => c.l.PERSONAL_DEV_UNIT_MANAGEMENT
                    }
                }),
                _ = n(9),
                component = Object(_.a)(v, (function() {
                    var e = this._self._c;
                    this._self._setupProxy;
                    return e("peak-award-card", {
                        attrs: {
                            title: this.title,
                            percentage: this.percentage,
                            requirements: this.requirements
                        }
                    })
                }), [], !1, null, "0a441e09", null);
            t.default = component.exports;
            installComponents(component, {
                PeakAwardCard: n(932).default
            })
        },
        1099: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(1),
                o = n(932),
                l = n(933),
                c = n(5),
                d = n(41);
            const m = {};
            m[d.b.JOEY] = "Participate in an Adventurous Journey lasting at least 3 hours.", m[d.b.CUB] = "Plan> and lead an Adventurous Journey lasting at least 4 hours.", m[d.b.SCOUT] = "Plan> and lead an Adventurous Journey of at least 3 days, 2 nights.", m[d.b.VENTURER] = "Plan> and lead an Adventurous Journey of at least 4 days, 3 nights.", m[d.b.ROVER] = "Plan> and lead an Adventurous Journey of at least 4 days, 3 nights.";
            var v = r.a.extend({
                    name: "AdventurousJourneyCard",
                    components: {
                        PeakAwardCard: o.default
                    },
                    props: {
                        metrics: {
                            type: Object,
                            required: !0
                        },
                        section: {
                            type: String,
                            required: !0
                        }
                    },
                    computed: {
                        requirements() {
                            return [{
                                description: m[this.section],
                                completed: null != this.metrics.adventurous_journey
                            }]
                        },
                        percentage() {
                            return this.metrics.peak_award.adventurous_journey / l.c.adventurous_journey
                        },
                        title: () => c.l.ADVENTUROUS_JOURNEY
                    }
                }),
                _ = n(9),
                component = Object(_.a)(v, (function() {
                    var e = this._self._c;
                    this._self._setupProxy;
                    return e("peak-award-card", {
                        attrs: {
                            title: this.title,
                            percentage: this.percentage,
                            requirements: this.requirements
                        }
                    })
                }), [], !1, null, "68a747e8", null);
            t.default = component.exports;
            installComponents(component, {
                PeakAwardCard: n(932).default
            })
        },
        1100: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(40),
                o = n(3),
                l = n(916),
                c = n(79),
                d = n(10),
                m = n(5),
                v = r.j.extend({
                    name: "AdventurousJourneyRequirements",
                    components: {
                        BaseRequirements: l.default,
                        ConfirmationDialog: c.default
                    },
                    data: () => ({
                        LABEL: m.i,
                        PATH: o,
                        isReady: !1,
                        showResetDialog: !1
                    }),
                    async created() {
                        await this.loadTemplate(!0), this.isReady = !0
                    },
                    computed: {
                        draft() {
                            return this.$accessor.aj.getCurrentJourney && [d.a.DRAFT_APPROVAL, d.a.DRAFT_REVIEW, d.a.FEEDBACK_APPROVAL].includes(this.$accessor.aj.getCurrentJourney.status)
                        }
                    },
                    methods: {
                        openResetDialog() {
                            this.showResetDialog = !0
                        },
                        closeResetDialog() {
                            this.showResetDialog = !1
                        },
                        confirmReset() {
                            this.saveCurrent(!0), this.$router.push(o.ADVENTUROUS_JOURNEY)
                        }
                    }
                }),
                _ = (n(1119), n(9)),
                component = Object(_.a)(v, (function() {
                    var e, t, n = this,
                        r = n._self._c;
                    n._self._setupProxy;
                    return r("div", [n.isReady ? r("BaseRequirements", {
                        attrs: {
                            "confirm-title": "Review before submitting",
                            "confirm-subtitle": "Review your entry below before submitting it for approval. You can edit or discuss with a Leader or Mentor before submitting.",
                            "is-flat-layout": !0,
                            "set-answer-function": n.$accessor.aj.setJourneyAnswers,
                            "set-uploads-function": n.$accessor.aj.setUploads,
                            "save-function": n.saveCurrent,
                            "submit-function": n.submitCurrent,
                            "back-path": "" + n.PATH.ADVENTUROUS_JOURNEY,
                            "forward-path": "" + n.PATH.ADVENTUROUS_JOURNEY,
                            "initial-answers": n.$accessor.aj.getCurrentJourney.answers,
                            "initial-uploads": n.$accessor.aj.getUploads,
                            template: n.$accessor.aj.getJourneyTemplate,
                            draft: n.$nuxt.isOffline || n.draft && !n.$accessor.approvals.getIsReviewing,
                            "is-loading": n.isCreating || n.isSaving,
                            "is-reviewing": n.$accessor.approvals.getIsReviewing,
                            "reset-modal": "in_progress" === n.$accessor.aj.getCurrentJourney.status ? n.openResetDialog : null,
                            "disabled-inputs": n.$nuxt.isOffline || !n.isYouthMember || n.$accessor.approvals.getIsReviewing,
                            confirm: "",
                            status: null === (e = n.$accessor.aj.currentJourneySubmission) || void 0 === e ? void 0 : e.status.valueOf(),
                            "latest-submission": null === (t = n.$accessor.aj.currentJourneySubmission) || void 0 === t ? void 0 : t.latest_submission
                        }
                    }) : n._e(), n._v(" "), r("ConfirmationDialog", {
                        attrs: {
                            model: n.showResetDialog,
                            title: "Are you sure?",
                            subtitle: "If you reset your plan, it will return to draft so you can update it. You will need to resubmit your plan for approval once you have finished updating it.",
                            "confirm-button-label": n.LABEL.OKAY,
                            "close-button-label": n.LABEL.CANCEL,
                            "confirm-callback": n.confirmReset,
                            "close-dialog": n.closeResetDialog
                        }
                    })], 1)
                }), [], !1, null, null, null);
            t.default = component.exports;
            installComponents(component, {
                BaseRequirements: n(916).default,
                ConfirmationDialog: n(79).default
            })
        },
        1101: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(40),
                o = n(3),
                l = n(916),
                c = n(10),
                d = r.k.extend({
                    name: "AdventurousJourneyReview",
                    components: {
                        BaseRequirements: l.default
                    },
                    data: () => ({
                        PATH: o,
                        isReady: !1
                    }),
                    async created() {
                        await this.loadTemplate(), this.isReady = !0
                    },
                    computed: {
                        draft() {
                            return this.$accessor.aj.getCurrentJourney && [c.a.DRAFT_REVIEW, c.a.FEEDBACK_REVIEW, c.a.IN_PROGRESS].includes(this.$accessor.aj.getCurrentJourney.status)
                        },
                        getTemplate() {
                            return this.$accessor.aj.getCurrentJourney.status === c.a.AWARDED ? this.combinedTemplates(this.$accessor.aj.getJourneyTemplate, this.$accessor.aj.getReviewTemplate) : this.$accessor.aj.getReviewTemplate
                        }
                    }
                }),
                m = (n(1120), n(9)),
                component = Object(m.a)(d, (function() {
                    var e, t, n = this,
                        r = n._self._c;
                    n._self._setupProxy;
                    return n.isReady ? r("BaseRequirements", {
                        class: n.$options.name,
                        attrs: {
                            "is-aj": "",
                            title: "Review",
                            "confirm-title": "Good job on reviewing!",
                            "confirm-subtitle": "Have another look at your entry or edit it before submitting for approval.",
                            "is-flat-layout": !0,
                            "set-answer-function": n.$accessor.aj.setJourneyAnswers,
                            "set-uploads-function": n.$accessor.aj.setUploads,
                            "save-function": n.saveCurrent,
                            "submit-function": n.submitCurrent,
                            "back-path": "" + n.PATH.ADVENTUROUS_JOURNEY,
                            "forward-path": "" + n.PATH.ADVENTUROUS_JOURNEY,
                            "initial-answers": n.$accessor.aj.getCurrentJourney.answers,
                            "initial-uploads": n.$accessor.aj.getUploads,
                            template: n.getTemplate,
                            draft: n.$nuxt.isOffline || n.draft,
                            "is-loading": n.isCreating || n.isSaving,
                            "is-reviewing": n.$accessor.approvals.getIsReviewing,
                            "can-cancel": !0,
                            "disabled-inputs": n.$nuxt.isOffline || !n.isYouthMember || n.$accessor.approvals.getIsReviewing,
                            confirm: "",
                            status: null === (e = n.$accessor.aj.currentJourneySubmission) || void 0 === e ? void 0 : e.status.valueOf(),
                            "latest-submission": null === (t = n.$accessor.aj.currentJourneySubmission) || void 0 === t ? void 0 : t.latest_submission
                        }
                    }) : n._e()
                }), [], !1, null, null, null);
            t.default = component.exports;
            installComponents(component, {
                BaseRequirements: n(916).default
            })
        },
        1102: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(886),
                o = n(885),
                l = n(1),
                c = n(932),
                d = n(1021),
                m = n(933),
                v = l.a.extend({
                    name: "ProgramEssentialsCard",
                    components: {
                        PeakAwardCard: c.default,
                        MilestoneMetricDisplay: d.default
                    },
                    props: {
                        metrics: {
                            type: Object,
                            required: !0
                        }
                    },
                    computed: {
                        requirements() {
                            return [{
                                description: "Complete Introduction to Scouting",
                                completed: null != this.metrics.intro_to_scouts
                            }, {
                                description: "Complete Introduction to Section",
                                completed: null != this.metrics.intro_to_section
                            }, {
                                description: "Achieve Milestone 3",
                                completed: this.milestone.milestone > 3 || 3 === this.milestone.milestone && this.milestone.awarded
                            }]
                        },
                        milestone() {
                            return this.metrics.milestone || {
                                milestone: 1,
                                awarded: !1,
                                total_assists: 0,
                                total_leads: 0,
                                participates: []
                            }
                        },
                        milestoneNumber() {
                            return this.milestone.milestone
                        },
                        percentage() {
                            return this.metrics.peak_award.milestones / m.c.milestones
                        }
                    }
                }),
                _ = (n(1068), n(9)),
                component = Object(_.a)(v, (function() {
                    var e = this._self._c;
                    this._self._setupProxy;
                    return e("peak-award-card", {
                        attrs: {
                            title: "Program Essentials",
                            percentage: this.percentage,
                            requirements: this.requirements
                        }
                    }, [e(o.a, {}, [e(r.a, {
                        staticClass: "ProgramEssentialsCard__title pb-1",
                        attrs: {
                            cols: "12"
                        }
                    }, [this._v("You are in Milestone " + this._s(this.milestoneNumber))])], 1), this._v(" "), e(o.a, [e(r.a, {
                        staticClass: "pt-0 pb-0",
                        attrs: {
                            cols: "12"
                        }
                    }, [e("milestone-metric-display", {
                        attrs: {
                            metrics: this.metrics
                        }
                    })], 1)], 1)], 1)
                }), [], !1, null, "adfc770c", null);
            t.default = component.exports;
            installComponents(component, {
                PeakAwardCard: n(932).default
            })
        },
        1103: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(886),
                o = n(885),
                l = n(1),
                c = n(932),
                d = n(1022),
                m = n(933),
                v = n(958),
                _ = l.a.extend({
                    name: "SiaCard",
                    components: {
                        PeakAwardCard: c.default,
                        SiaMetricDisplay: d.default
                    },
                    props: {
                        metrics: {
                            type: Object,
                            required: !0
                        },
                        section: {
                            type: String,
                            required: !0
                        }
                    },
                    computed: {
                        requirements() {
                            const {
                                areas: e,
                                projects: t,
                                hours: n
                            } = v.b[this.section], r = `Complete ${t} projects across ${e} Special Interest Areas, each involving at least ${n} hours effort.`, o = this.metrics.sia;
                            return [{
                                description: r,
                                completed: o.completed_projects >= t && o.completed_areas.length >= e
                            }]
                        },
                        percentage() {
                            return this.metrics.peak_award.sia / m.c.sia
                        }
                    }
                }),
                f = n(9),
                component = Object(f.a)(_, (function() {
                    var e = this._self._c;
                    this._self._setupProxy;
                    return e("peak-award-card", {
                        attrs: {
                            title: "Special Interest Areas",
                            percentage: this.percentage,
                            requirements: this.requirements
                        }
                    }, [e(o.a, [e(r.a, {
                        staticClass: "pt-0 pb-0",
                        attrs: {
                            cols: "12"
                        }
                    }, [e("sia-metric-display", {
                        attrs: {
                            metrics: this.metrics,
                            section: this.section
                        }
                    })], 1)], 1)], 1)
                }), [], !1, null, "fe881dbc", null);
            t.default = component.exports;
            installComponents(component, {
                PeakAwardCard: n(932).default
            })
        },
        1104: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(1),
                o = n(932),
                l = n(933),
                c = n(5),
                d = r.a.extend({
                    name: "PersonalReflectionCard",
                    components: {
                        PeakAwardCard: o.default
                    },
                    props: {
                        metrics: {
                            type: Object,
                            required: !0
                        },
                        section: {
                            type: String,
                            required: !0
                        }
                    },
                    computed: {
                        requirements() {
                            return [{
                                description: "Reflect on your journey through the section and the award.",
                                completed: null != this.metrics.personal_reflection
                            }]
                        },
                        percentage() {
                            return this.metrics.peak_award.personal_reflection / l.c.personal_reflection
                        },
                        title: () => c.l.PERSONAL_REFLECTION
                    }
                }),
                m = n(9),
                component = Object(m.a)(d, (function() {
                    var e = this._self._c;
                    this._self._setupProxy;
                    return e("peak-award-card", {
                        attrs: {
                            title: this.title,
                            percentage: this.percentage,
                            requirements: this.requirements
                        }
                    })
                }), [], !1, null, "3239ba96", null);
            t.default = component.exports;
            installComponents(component, {
                PeakAwardCard: n(932).default
            })
        },
        1105: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(40),
                o = n(3),
                l = n(916),
                c = n(10),
                d = n(5);
            var m = r.u.extend({
                    name: "PersonalDevelopmentRequirements",
                    components: {
                        BaseRequirements: l.default
                    },
                    data: () => ({
                        PATH: o,
                        isReady: !1
                    }),
                    async created() {
                        await this.loadTemplate(), this.isReady = !0
                    },
                    computed: {
                        draft() {
                            return this.$accessor.personalDevelopment.getCurrent && [c.a.DRAFT_REVIEW, c.a.FEEDBACK_REVIEW].includes(this.$accessor.personalDevelopment.getCurrent.status)
                        },
                        disabledIds() {
                            const e = [];
                            return this.$accessor.personalDevelopment.getList.forEach(t => {
                                t.answers && "1" === t.answers.course_name ? e.push(d.s) : t.answers && "0" === t.answers.course_name && e.push(d.D)
                            }), e
                        }
                    }
                }),
                v = n(9),
                component = Object(v.a)(m, (function() {
                    var e, t, n = this,
                        r = n._self._c;
                    n._self._setupProxy;
                    return n.isReady ? r("BaseRequirements", {
                        attrs: {
                            title: "Review",
                            "confirm-title": "Review Before Submitting",
                            "confirm-subtitle": "Review your entry below before submitting it for approval.",
                            "is-flat-layout": !0,
                            "set-answer-function": n.$accessor.personalDevelopment.setAnswers,
                            "set-uploads-function": n.$accessor.personalDevelopment.setUploads,
                            "save-function": n.saveCurrent,
                            "submit-function": n.submitCurrent,
                            "back-path": "" + n.PATH.PERSONAL_DEVELOPMENT,
                            "forward-path": "" + n.PATH.PERSONAL_DEVELOPMENT,
                            "initial-answers": n.$accessor.personalDevelopment.getAnswers,
                            "initial-uploads": n.$accessor.personalDevelopment.getUploads,
                            template: n.$accessor.personalDevelopment.getTemplate,
                            draft: n.$nuxt.isOffline || n.draft,
                            "is-loading": n.isCreating || n.isSaving,
                            "is-reviewing": n.$accessor.approvals.getIsReviewing,
                            "disabled-ids": n.disabledIds,
                            "disabled-inputs": n.$nuxt.isOffline || !n.isYouthMember || n.$accessor.approvals.getIsReviewing,
                            confirm: "",
                            status: null === (e = n.$accessor.personalDevelopment.current) || void 0 === e ? void 0 : e.status.valueOf(),
                            "latest-submission": null === (t = n.$accessor.personalDevelopment.current) || void 0 === t ? void 0 : t.latest_submission
                        }
                    }) : n._e()
                }), [], !1, null, null, null);
            t.default = component.exports;
            installComponents(component, {
                BaseRequirements: n(916).default
            })
        },
        1106: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(40),
                o = n(3),
                l = n(916),
                c = n(10),
                d = r.v.extend({
                    name: "PersonalReflectionRequirements",
                    components: {
                        BaseRequirements: l.default
                    },
                    data: () => ({
                        PATH: o,
                        isReady: !1
                    }),
                    async created() {
                        await this.loadTemplate(!0), this.isReady = !0
                    },
                    computed: {
                        draft() {
                            return this.$accessor.personalReflection.getCurrent && [c.a.DRAFT_REVIEW, c.a.FEEDBACK_REVIEW].includes(this.$accessor.personalReflection.getCurrent.status)
                        }
                    }
                }),
                m = n(9),
                component = Object(m.a)(d, (function() {
                    var e, t, n = this,
                        r = n._self._c;
                    n._self._setupProxy;
                    return n.isReady ? r("BaseRequirements", {
                        attrs: {
                            title: "Do",
                            subtitle: "You should do this activity with your group’s Unit Council. The first two questions are compulsory. After that, you can choose three questions to answer from the rest.",
                            "confirm-title": "Review before submitting",
                            "confirm-subtitle": "Review your entry below before completing Personal Reflection. You can edit or discuss with a Leader or Mentor before submitting.",
                            "is-flat-layout": !0,
                            "set-answer-function": n.$accessor.personalReflection.setAnswers,
                            "set-uploads-function": n.$accessor.personalReflection.setUploads,
                            "save-function": n.saveCurrent,
                            "submit-function": n.submitCurrent,
                            "back-path": "" + n.PATH.PERSONAL_REFLECTION,
                            "forward-path": "" + n.PATH.PERSONAL_REFLECTION,
                            "initial-answers": n.$accessor.personalReflection.getAnswers,
                            "initial-uploads": n.$accessor.personalReflection.getUploads,
                            template: n.$accessor.personalReflection.getDoTemplate,
                            draft: n.$nuxt.isOffline || n.draft,
                            "is-loading": n.isCreating || n.isSaving,
                            "is-reviewing": n.$accessor.approvals.getIsReviewing,
                            "disabled-inputs": n.$nuxt.isOffline || !n.isYouthMember || n.$accessor.approvals.getIsReviewing,
                            confirm: "",
                            status: null === (e = n.$accessor.personalReflection.current) || void 0 === e ? void 0 : e.status.valueOf(),
                            "latest-submission": null === (t = n.$accessor.personalReflection.current) || void 0 === t ? void 0 : t.latest_submission
                        }
                    }) : n._e()
                }), [], !1, null, null, null);
            t.default = component.exports;
            installComponents(component, {
                BaseRequirements: n(916).default
            })
        },
        1107: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(3),
                o = n(40),
                l = n(10),
                c = n(5),
                d = o.C.extend({
                    name: "SiaRequirements",
                    data: () => ({
                        LABEL: c.i,
                        PATH: r,
                        isReady: !1,
                        showResetDialog: !1
                    }),
                    async created() {
                        await this.loadTemplate(!0), this.isReady = !0
                    },
                    computed: {
                        draft() {
                            return this.$accessor.sia.getCurrentSia && [l.a.DRAFT_APPROVAL, l.a.DRAFT_REVIEW, l.a.FEEDBACK_APPROVAL].includes(this.$accessor.sia.getCurrentSia.status)
                        }
                    },
                    methods: {
                        openResetDialog() {
                            this.showResetDialog = !0
                        },
                        closeResetDialog() {
                            this.showResetDialog = !1
                        },
                        confirmReset() {
                            this.saveCurrent(!0), this.$router.push(r.SIA)
                        }
                    }
                }),
                m = (n(1121), n(9)),
                component = Object(m.a)(d, (function() {
                    var e, t, n, r = this,
                        o = r._self._c;
                    r._self._setupProxy;
                    return o("div", [r.isReady ? o("BaseRequirements", {
                        staticClass: "SiaRequirements",
                        attrs: {
                            "confirm-title": "Good job on planning!",
                            "confirm-subtitle": "Have another look at your entry or edit it before submitting for approval.",
                            "set-answer-function": r.$accessor.sia.setAnswers,
                            "set-uploads-function": r.$accessor.sia.setUploads,
                            "save-function": r.saveCurrent,
                            "submit-function": r.submitCurrent,
                            "back-path": "" + r.PATH.SIA,
                            "forward-path": "" + r.PATH.SIA,
                            draft: r.$nuxt.isOffline || r.draft && !r.$accessor.approvals.getIsReviewing,
                            "disabled-inputs": r.$nuxt.isOffline || !r.isYouthMember || r.$accessor.approvals.getIsReviewing,
                            "initial-answers": r.$accessor.sia.getCurrentSiaAnswers,
                            "initial-uploads": r.$accessor.sia.getUploads,
                            template: r.$accessor.sia.getTemplate,
                            "is-loading": r.isCreating || r.isSaving,
                            "is-reviewing": r.$accessor.approvals.getIsReviewing,
                            "reset-modal": "in_progress" === (null === (e = r.$accessor.sia.getCurrentSia) || void 0 === e ? void 0 : e.status) ? r.openResetDialog : null,
                            confirm: "",
                            "is-flat-layout": "",
                            "is-sia": "",
                            status: null === (t = r.$accessor.sia.currentSia) || void 0 === t ? void 0 : t.status.valueOf(),
                            "latest-submission": null === (n = r.$accessor.sia.currentSia) || void 0 === n ? void 0 : n.latest_submission
                        }
                    }) : r._e(), r._v(" "), o("ConfirmationDialog", {
                        attrs: {
                            model: r.showResetDialog,
                            title: "Are you sure?",
                            subtitle: "If you reset your plan, it will return to draft so you can update it. You will need to resubmit your plan for approval once you have finished updating it.",
                            "confirm-button-label": r.LABEL.OKAY,
                            "close-button-label": r.LABEL.CANCEL,
                            "confirm-callback": r.confirmReset,
                            "close-dialog": r.closeResetDialog
                        }
                    })], 1)
                }), [], !1, null, null, null);
            t.default = component.exports;
            installComponents(component, {
                BaseRequirements: n(916).default,
                ConfirmationDialog: n(79).default
            })
        },
        1108: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(40),
                o = n(3),
                l = n(10),
                c = r.D.extend({
                    name: "SiaReview",
                    data: () => ({
                        PATH: o,
                        isReady: !1
                    }),
                    async created() {
                        await this.loadTemplate(), this.isReady = !0
                    },
                    computed: {
                        draft() {
                            return this.$accessor.sia.getCurrentSia && [l.a.DRAFT_REVIEW, l.a.FEEDBACK_REVIEW, l.a.IN_PROGRESS].includes(this.$accessor.sia.getCurrentSia.status)
                        },
                        getTemplate() {
                            var e;
                            return (null === (e = this.$accessor.sia.getCurrentSia) || void 0 === e ? void 0 : e.status) === l.a.AWARDED ? this.combinedTemplates(this.$accessor.sia.getTemplate, this.$accessor.sia.getReviewTemplate) : this.$accessor.sia.getReviewTemplate
                        }
                    }
                }),
                d = (n(1122), n(9)),
                component = Object(d.a)(c, (function() {
                    var e, t, n, r = this,
                        o = r._self._c;
                    r._self._setupProxy;
                    return r.isReady ? o("BaseRequirements", {
                        class: r.$options.name,
                        attrs: {
                            "is-sia": "",
                            title: "Review",
                            "confirm-title": "Good job on reviewing!",
                            "confirm-subtitle": "Have another look at your entry or edit it before submitting for approval.",
                            "is-flat-layout": !0,
                            "set-answer-function": r.$accessor.sia.setAnswers,
                            "set-uploads-function": r.$accessor.sia.setUploads,
                            "save-function": r.saveCurrent,
                            "submit-function": r.submitCurrent,
                            "back-path": "" + r.PATH.SIA,
                            "forward-path": "" + r.PATH.SIA,
                            "initial-answers": null === (e = r.$accessor.sia.getCurrentSia) || void 0 === e ? void 0 : e.answers,
                            "initial-uploads": r.$accessor.sia.getUploads,
                            template: r.getTemplate,
                            draft: r.$nuxt.isOffline || r.draft,
                            "is-loading": r.isCreating || r.isSaving,
                            "is-reviewing": r.$accessor.approvals.getIsReviewing,
                            "can-cancel": !0,
                            "disabled-inputs": r.$nuxt.isOffline || !r.isYouthMember || r.$accessor.approvals.getIsReviewing,
                            confirm: "",
                            status: null === (t = r.$accessor.sia.currentSia) || void 0 === t ? void 0 : t.status.valueOf(),
                            "latest-submission": null === (n = r.$accessor.sia.currentSia) || void 0 === n ? void 0 : n.latest_submission
                        }
                    }) : r._e()
                }), [], !1, null, null, null);
            t.default = component.exports;
            installComponents(component, {
                BaseRequirements: n(916).default
            })
        },
        1119: function(e, t, n) {
            "use strict";
            n(1044)
        },
        1120: function(e, t, n) {
            "use strict";
            n(1045)
        },
        1121: function(e, t, n) {
            "use strict";
            n(1046)
        },
        1122: function(e, t, n) {
            "use strict";
            n(1047)
        },
        1123: function(e, t, n) {
            "use strict";
            n(1049)
        },
        1131: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(886),
                o = n(885),
                l = n(1038),
                c = n(933),
                d = n(41),
                m = n(128),
                v = n(461).a.extend({
                    name: "OasCard",
                    components: {
                        OasMetricDisplay: l.default
                    },
                    props: {
                        metrics: {
                            type: Object,
                            required: !0
                        },
                        section: {
                            type: String,
                            required: !0
                        }
                    },
                    computed: {
                        percentage() {
                            return this.metrics.peak_award.oas / c.c.oas
                        },
                        requirements() {
                            let e = "";
                            if (this.section === d.b.JOEY) e = "Complete Stage 1 in all three core Outdoor Adventure Skills areas (Bushwalking, Bushcraft and Camping)";
                            else {
                                const t = m.b[this.section],
                                    n = t.extra ? ` (at least ${t.extra.count} of these should be at Stage ${t.extra.minLevel} or above)` : "";
                                e = `Complete ${t.totalProgressions} Stage progressions in the Outdoor Adventure Skills${n}. Peak Award recipients should have reached at least Stage ${t.coreStage} in the core areas (Bushwalking, Bushcraft and Camping).`
                            }
                            return [{
                                description: e,
                                completed: this.metrics.peak_award.oas === c.c.oas
                            }]
                        }
                    }
                }),
                _ = n(9),
                component = Object(_.a)(v, (function() {
                    var e = this._self._c;
                    this._self._setupProxy;
                    return e("peak-award-card", {
                        attrs: {
                            title: "Outdoor Adventure Skills",
                            percentage: this.percentage,
                            requirements: this.requirements
                        }
                    }, [e(o.a, [e(r.a, {
                        staticClass: "pt-0 pb-0",
                        attrs: {
                            cols: "12"
                        }
                    }, [e("oas-metric-display", {
                        attrs: {
                            metrics: this.metrics
                        }
                    })], 1)], 1)], 1)
                }), [], !1, null, "072a5ce6", null);
            t.default = component.exports;
            installComponents(component, {
                PeakAwardCard: n(932).default
            })
        },
        1135: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(870),
                o = n(886),
                l = n(1439),
                c = n(885),
                d = n(62),
                m = n(4),
                v = n(5),
                _ = n(40),
                f = n(287),
                h = _.d.extend({
                    name: "ApprovalsTable",
                    props: {
                        defaultTable: {
                            type: Boolean
                        },
                        headers: {
                            type: String,
                            default: "default"
                        },
                        tableData: {
                            type: Array,
                            required: !0
                        },
                        filterSearch: {
                            type: Boolean
                        }
                    },
                    data: () => ({
                        search: "",
                        API: m,
                        ICONS: f,
                        LABEL: v.i,
                        tableKey: "table-key",
                        oldBreakpoint: "",
                        headersList: {
                            default: [{
                                text: "Submitted date",
                                value: "date",
                                width: 120
                            }, {
                                text: "Name",
                                value: "submittedByString",
                                width: 220
                            }, {
                                text: "Achievement Pathway",
                                value: "pathway",
                                width: 190
                            }, {
                                text: "Request type",
                                value: "request_type",
                                width: 70
                            }, {
                                text: "Action",
                                value: "actions",
                                width: 180
                            }],
                            recent: [{
                                text: "Submitted date",
                                value: "date",
                                width: 120
                            }, {
                                text: "Name",
                                value: "submittedByString",
                                width: 220
                            }, {
                                text: "Achievement Pathway",
                                value: "pathway",
                                width: 190
                            }, {
                                text: "Request type",
                                value: "request_type",
                                width: 70
                            }, {
                                text: "Status",
                                value: "status",
                                width: 90
                            }, {
                                text: "Actioned by",
                                value: "actioned_by",
                                width: 270
                            }, {
                                text: "Action",
                                value: "actions",
                                width: 70
                            }]
                        }
                    }),
                    computed: {
                        isTableDataReady() {
                            return !!this.defaultTable && !this.approvalsDataTransformed
                        },
                        approvalsDataTransformed() {
                            const e = [];
                            return this.tableData.forEach(t => {
                                e.push(this.transformSubmission(t))
                            }), e
                        }
                    },
                    beforeDestroy() {
                        "undefined" != typeof window && window.removeEventListener("resize", this.onResize)
                    },
                    mounted() {
                        this.onResize(), window.addEventListener("resize", this.onResize, {
                            passive: !0
                        })
                    },
                    methods: {
                        getBreakpoint(e) {
                            return e < this.$vuetify.breakpoint.thresholds.xs ? "xs" : e < this.$vuetify.breakpoint.thresholds.sm ? "sm" : e < this.$vuetify.breakpoint.thresholds.md ? "md" : "lg"
                        },
                        onResize() {
                            const e = this.getBreakpoint(window.innerWidth);
                            e !== this.oldBreakpoint && setTimeout(() => {
                                this.tableKey = "table-key-" + e, this.oldBreakpoint = e
                            }, 200)
                        },
                        getHeaders() {
                            return "recent" === this.headers ? this.headersList.recent : this.headersList.default
                        }
                    }
                }),
                y = (n(1152), n(9)),
                component = Object(y.a)(h, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", {
                        staticClass: "ApprovalsTable"
                    }, [t(c.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(o.a, [t(l.a, {
                        key: e.tableKey,
                        attrs: {
                            headers: e.getHeaders(),
                            items: e.approvalsDataTransformed,
                            search: e.search,
                            "sort-by": ["date"],
                            "sort-desc": ""
                        },
                        scopedSlots: e._u([{
                            key: "top",
                            fn: function() {
                                return [t(d.a, {
                                    staticClass: "ApprovalsTable__filter",
                                    attrs: {
                                        label: "Filter",
                                        "append-icon": "mdi-magnify",
                                        "single-line": "",
                                        "hide-details": "",
                                        height: "40"
                                    },
                                    model: {
                                        value: e.search,
                                        callback: function(t) {
                                            e.search = t
                                        },
                                        expression: "search"
                                    }
                                })]
                            },
                            proxy: !0
                        }, {
                            key: "item.actions",
                            fn: function(n) {
                                let {
                                    item: o
                                } = n;
                                return [t("div", {
                                    staticClass: "ApprovalsTable__actions"
                                }, [t(r.a, {
                                    staticClass: "ApprovalsTable__action-btn",
                                    attrs: {
                                        "data-cy": "view",
                                        small: "",
                                        text: ""
                                    },
                                    on: {
                                        click: function(t) {
                                            return e.viewSubmission(o)
                                        }
                                    }
                                }, [t("Icon", {
                                    attrs: {
                                        name: "view",
                                        label: e.LABEL.VIEW,
                                        size: "small",
                                        outline: ""
                                    }
                                })], 1), e._v(" "), "default" === e.headers ? t(r.a, {
                                    staticClass: "ApprovalsTable__action-btn",
                                    attrs: {
                                        disabled: !o.currentUserCanAction,
                                        "data-cy": "approve",
                                        small: "",
                                        text: ""
                                    },
                                    on: {
                                        click: function(t) {
                                            return e.approve(o)
                                        }
                                    }
                                }, [t("Icon", {
                                    attrs: {
                                        name: "approve",
                                        disabled: !o.currentUserCanAction,
                                        label: e.LABEL.APPROVE,
                                        size: "small",
                                        outline: ""
                                    }
                                })], 1) : e._e(), e._v(" "), "default" === e.headers ? t(r.a, {
                                    staticClass: "ApprovalsTable__action-btn",
                                    attrs: {
                                        disabled: !o.currentUserCanAction,
                                        "data-cy": "reject",
                                        small: "",
                                        text: ""
                                    },
                                    on: {
                                        click: function(t) {
                                            return e.reject(o)
                                        }
                                    }
                                }, [t("Icon", {
                                    attrs: {
                                        name: "improve",
                                        disabled: !o.currentUserCanAction,
                                        label: e.LABEL.IMPROVE,
                                        size: "small",
                                        outline: ""
                                    }
                                })], 1) : e._e()], 1)]
                            }
                        }])
                    })], 1)], 1)], 1)
                }), [], !1, null, "4de1ab50", null);
            t.default = component.exports;
            installComponents(component, {
                Icon: n(55).default
            })
        },
        1136: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(40),
                o = n(3),
                l = n(916),
                c = n(10),
                d = n(5),
                m = r.p.extend({
                    name: "MilestoneReview",
                    components: {
                        BaseRequirements: l.default
                    },
                    data: () => ({
                        LABEL: d.i,
                        PATH: o,
                        isReady: !1
                    }),
                    async created() {
                        await this.loadTemplate(!0), this.isReady = !0
                    },
                    computed: {
                        draft() {
                            return this.$accessor.milestones.getCurrentMilestoneSubmission && [c.a.DRAFT_REVIEW, c.a.FEEDBACK_REVIEW, c.a.IN_PROGRESS].includes(this.$accessor.milestones.getCurrentMilestoneSubmission.status)
                        }
                    }
                }),
                v = n(9),
                component = Object(v.a)(m, (function() {
                    var e, t, n = this,
                        r = n._self._c;
                    n._self._setupProxy;
                    return n.isReady ? r("BaseRequirements", {
                        attrs: {
                            "is-milestone": !0,
                            title: `Milestone ${n.$accessor.milestones.getSelectedMilestoneStage} Review`,
                            "confirm-title": `Milestone ${n.$accessor.milestones.getSelectedMilestoneStage} Review`,
                            "is-flat-layout": !0,
                            "set-answer-function": n.$accessor.milestones.setAnswers,
                            "set-uploads-function": n.$accessor.milestones.setUploads,
                            "save-function": n.saveCurrent,
                            "submit-function": n.submitCurrent,
                            "back-path": "" + n.PATH.MILESTONES,
                            "forward-path": "" + n.PATH.MILESTONES,
                            "initial-answers": n.$accessor.milestones.getCurrentMilestoneSubmission.answers || {},
                            "initial-uploads": n.$accessor.milestones.getUploads,
                            template: n.$accessor.milestones.getReviewTemplate,
                            draft: n.$nuxt.isOffline || n.draft,
                            "is-loading": n.isCreating || n.isSaving,
                            "is-reviewing": n.$accessor.approvals.getIsReviewing,
                            "disabled-inputs": n.$nuxt.isOffline || !n.isYouthMember || n.$accessor.approvals.getIsReviewing,
                            confirm: "",
                            status: null === (e = n.$accessor.milestones.current) || void 0 === e ? void 0 : e.status.valueOf(),
                            "latest-submission": null === (t = n.$accessor.milestones.current) || void 0 === t ? void 0 : t.latest_submission,
                            "can-review-milestone": n.canReviewMilestone
                        }
                    }) : n._e()
                }), [], !1, null, null, null);
            t.default = component.exports;
            installComponents(component, {
                BaseRequirements: n(916).default
            })
        },
        1137: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(234),
                o = n(885),
                l = n(1034),
                c = n(990),
                d = n(40).t.extend({
                    name: "PeakAwardReview",
                    components: {
                        PeakAwardRequirements: l.default,
                        PeakAwardProgress: c.default
                    },
                    props: {
                        submission: {
                            type: Object,
                            required: !0
                        }
                    },
                    data: () => ({
                        metrics: null
                    }),
                    computed: {
                        loading() {
                            return null === this.$data.metrics
                        },
                        section() {
                            return this.$accessor.user.getCurrentMemberSection
                        },
                        progress() {
                            return this.$data.metrics.peak_award.total
                        }
                    },
                    async mounted() {
                        this.$data.metrics = await this.getMetrics(this.$accessor.user.getUnitId, this.submission.memberId)
                    },
                    methods: {}
                }),
                m = n(9),
                component = Object(m.a)(d, (function() {
                    var e = this._self._c;
                    this._self._setupProxy;
                    return e("div", [this.loading ? e(o.a, {
                        attrs: {
                            justify: "center"
                        }
                    }, [e(r.a, {
                        attrs: {
                            color: "primary",
                            indeterminate: ""
                        }
                    })], 1) : [e("peak-award-progress", {
                        attrs: {
                            progress: this.progress,
                            section: this.section,
                            reviewing: ""
                        }
                    }), this._v(" "), e("peak-award-requirements", {
                        attrs: {
                            metrics: this.metrics,
                            section: this.section
                        }
                    })]], 2)
                }), [], !1, null, null, null);
            t.default = component.exports;
            installComponents(component, {
                PeakAwardProgress: n(990).default,
                PeakAwardRequirements: n(1034).default
            })
        },
        1138: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(870),
                o = n(236),
                l = n(35),
                c = n(886),
                d = n(890),
                m = n(885),
                v = n(892),
                _ = n(916),
                f = n(79),
                h = n(144),
                y = n(100),
                w = n(1039),
                C = n(1040),
                S = n(5),
                A = n(128),
                T = n(10),
                E = n(3),
                R = n(40).s.extend({
                    name: "OasStage",
                    components: {
                        BaseRequirements: _.default,
                        ConfirmationDialog: f.default,
                        InfoCard: h.default,
                        NavLink: y.default,
                        OasStageSidebar: w.default,
                        VerifierDialog: C.default
                    },
                    data: () => ({
                        infoDialogText: "",
                        isReady: !1,
                        showInfoDialog: !1,
                        showCancelDialog: !1,
                        showRemoveDialog: !1,
                        LABEL: S.i,
                        PATH: E,
                        OAS_SUBTITLE: A.c,
                        verifierForRemoval: {},
                        hasFilesToSave: !1,
                        stageComplete: !1
                    }),
                    computed: {
                        getCol() {
                            return this.$accessor.approvals.getIsReviewing ? 12 : 8
                        },
                        stageTitle() {
                            return this.$accessor.oas.getOasTemplate.document[0].title
                        },
                        draft() {
                            return this.$accessor.oas.getCurrentOas && [T.a.DRAFT_REVIEW, T.a.FEEDBACK_REVIEW].includes(this.$accessor.oas.getCurrentOas.status)
                        },
                        verifierModalTitle() {
                            if (this.$accessor.oas.getStatementsForVerification.length) {
                                const e = this.$accessor.oas.getStatementsForVerification.length;
                                let text = "";
                                return text = e > 1 ? `these ${e} statements?` : "this statement?", "Who can verify " + text
                            }
                            return ""
                        },
                        branch() {
                            return this.$accessor.oas.getBranch.replace(/-/g, " ")
                        }
                    },
                    async created() {
                        if (this.$accessor.oas.isNewStageSubmission && !this.$accessor.approvals.isReviewing && this.$accessor.oas.resetSubmissionAnswers(), this.$accessor.approvals.getIsReviewing) await this.getAndSetOasStageTemplate();
                        else try {
                            await this.getAndSetStreamTree()
                        } catch (e) {
                            return this.$nuxt.error({
                                statusCode: 503,
                                message: ""
                            })
                        }
                        if (void 0 === this.$accessor.oas.getOasTemplate.document) return this.$router.go(-1), !1;
                        this.isReady = !0
                    },
                    beforeDestroy() {
                        this.$nuxt.$off("setAndUpdateAnswers")
                    },
                    mounted() {
                        this.$root.$on("guidanceStatement", this.openInfoDialog), this.$nuxt.$on("hasUploads", e => {
                            this.hasFilesToSave = e
                        }), this.$nuxt.$on("checkboxChanged", e => {
                            this.saveAnswer(e)
                        }), this.$nuxt.$on("fileChanged", e => {
                            this.$accessor.oas.updateFileUploads(e)
                        }), this.$nuxt.$on("stageComplete", e => {
                            this.stageComplete = e
                        })
                    },
                    methods: {
                        openInfoDialog(e) {
                            this.showInfoDialog = !0, this.infoDialogText = e
                        },
                        openCancelDialog() {
                            this.showCancelDialog = !0
                        },
                        verifyModal() {
                            this.$accessor.oas.setVerifyModal(!0)
                        },
                        closeDialogs() {
                            this.showCancelDialog = !1, this.showRemoveDialog = !1, this.$accessor.oas.setVerifyModal(!1)
                        },
                        confirmCancel() {
                            this.closeDialogs(), this.$router.go(-1)
                        },
                        storeVerifyStatements(e) {
                            this.$accessor.oas.setStatementsForVerification(e)
                        },
                        saveCurrentOasWithVerifer(e) {
                            this.addVerifiedStatementsToOasAnswers(e), this.$nextTick(() => {
                                this.$nuxt.$emit("setAndUpdateAnswers", this.$accessor.oas.getCurrentOas.answers, !1)
                            })
                        },
                        saveAnswer(e) {
                            e ? (this.$accessor.oas.addAnswer(), this.$nextTick(() => {
                                this.$nuxt.$emit("setAndUpdateLogbookAnswer", this.$accessor.oas.getCurrentOas.answers)
                            })) : (this.$accessor.oas.removeAnswer(), this.$nextTick(() => {
                                this.$nuxt.$emit("setAndUpdateLogbookAnswer", this.$accessor.oas.getCurrentOas.answers)
                            }))
                        },
                        removeVerifierFromAnswers() {
                            this.$accessor.oas.removeVerifiedStatement(this.verifierForRemoval), this.$nextTick(() => {
                                this.$nuxt.$emit("setAndUpdateAnswers", this.$accessor.oas.getCurrentOas.answers, !0)
                            })
                        },
                        removeVerified(e) {
                            this.verifierForRemoval = e, this.showRemoveDialog = !0
                        }
                    }
                }),
                k = (n(1123), n(9)),
                component = Object(k.a)(R, (function() {
                    var e, t, n = this,
                        _ = n._self._c;
                    n._self._setupProxy;
                    return _("div", {
                        staticClass: "OasStage"
                    }, [_(m.a, {
                        attrs: {
                            "no-gutters": n.$accessor.approvals.getIsReviewing
                        }
                    }, [_(c.a, {
                        staticClass: "pt-0",
                        attrs: {
                            xs: "12",
                            sm: "12",
                            md: n.getCol,
                            lg: n.getCol
                        }
                    }, [n.isReady ? _("BaseRequirements", {
                        attrs: {
                            "is-oas": "",
                            "answers-updated-function": n.answersUpdatedMessage,
                            "back-path": "" + n.PATH.OAS,
                            "cancel-modal": n.openCancelDialog,
                            "disabled-inputs": n.$nuxt.isOffline || !n.isYouthMember || n.$accessor.approvals.getIsReviewing,
                            draft: n.draft,
                            "forward-path": "" + n.PATH.OAS,
                            "has-uploads-to-save": n.hasFilesToSave,
                            "initial-answers": n.$accessor.oas.getCurrentOas.answers || {},
                            "initial-uploads": n.$accessor.oas.getUploads,
                            "is-reviewing": n.$accessor.approvals.getIsReviewing,
                            "modal-function": n.verifyModal,
                            "remove-verified-func": n.removeVerified,
                            "save-function": n.saveCurrentOas,
                            "set-answer-function": n.$accessor.oas.setOasAnswers,
                            "set-uploads-function": n.$accessor.oas.setUploads,
                            "submit-function": n.submitCurrentOas,
                            subtitle: n.OAS_SUBTITLE,
                            template: n.$accessor.oas.getOasTemplate,
                            title: n.stageTitle,
                            verifier: n.$accessor.oas.getVerifierForSelectedStatements,
                            "verify-function": n.storeVerifyStatements,
                            status: null === (e = n.$accessor.oas.currentOasSubmission) || void 0 === e ? void 0 : e.status.valueOf(),
                            "latest-submission": null === (t = n.$accessor.oas.currentOasSubmission) || void 0 === t ? void 0 : t.latest_submission
                        }
                    }, [n.stageComplete ? _("InfoCard", {
                        staticClass: "BaseList__info-card mt-6 mb-6",
                        attrs: {
                            slot: "info-card",
                            "small-text": "",
                            "info-type": "info",
                            title: "Stage is complete. Don’t forget to attach any supporting documents and submit to Unit Council for stage approval."
                        },
                        slot: "info-card"
                    }) : n._e(), n._v(" "), n.$accessor.approvals.getIsReviewing || n.$vuetify.breakpoint.mdAndUp || !n.$accessor.oas.getBranch ? n._e() : _("OasStageSidebar", {
                        staticClass: "mt-6",
                        attrs: {
                            branch: n.$accessor.oas.getBranch,
                            path: n.$accessor.oas.getCurrentStageTemplateLink,
                            stage: n.$accessor.oas.getStage
                        }
                    })], 1) : n._e()], 1), n._v(" "), !n.$accessor.approvals.getIsReviewing && n.$vuetify.breakpoint.mdAndUp ? _(c.a, {
                        attrs: {
                            xs: "12",
                            sm: "12",
                            md: "4",
                            lg: "4"
                        }
                    }, [n.$accessor.oas.getBranch ? _("OasStageSidebar", {
                        attrs: {
                            branch: n.$accessor.oas.getBranch,
                            stage: n.$accessor.oas.getStage,
                            path: n.$accessor.oas.getCurrentStageTemplateLink
                        }
                    }) : n._e()], 1) : n._e()], 1), n._v(" "), _(d.a, {
                        staticClass: "OasStage-info-modal",
                        model: {
                            value: n.showInfoDialog,
                            callback: function(e) {
                                n.showInfoDialog = e
                            },
                            expression: "showInfoDialog"
                        }
                    }, [_(o.a, [_(l.c, {
                        staticClass: "OasStage-info-modal__text"
                    }, [_("VueShowdown", {
                        attrs: {
                            markdown: n.infoDialogText
                        }
                    })], 1), n._v(" "), _(l.a, [_(v.a), n._v(" "), _(r.a, {
                        attrs: {
                            small: "",
                            text: ""
                        },
                        on: {
                            click: function(e) {
                                n.showInfoDialog = !1
                            }
                        }
                    }, [n._v("Close")])], 1)], 1)], 1), n._v(" "), _("VerifierDialog", {
                        attrs: {
                            model: n.$accessor.oas.showVerifierModal,
                            title: n.verifierModalTitle,
                            subtitle: "",
                            "close-button-label": n.LABEL.CANCEL,
                            "confirm-callback": n.saveCurrentOasWithVerifer,
                            "close-dialog": n.closeDialogs
                        }
                    }), n._v(" "), _("ConfirmationDialog", {
                        attrs: {
                            model: n.showCancelDialog,
                            title: "Are you sure?",
                            subtitle: "Any changes you made will not be saved.",
                            "confirm-button-label": n.LABEL.OKAY,
                            "close-button-label": n.LABEL.CANCEL,
                            "confirm-callback": n.confirmCancel,
                            "close-dialog": n.closeDialogs
                        }
                    }), n._v(" "), _("ConfirmationDialog", {
                        attrs: {
                            model: n.showRemoveDialog,
                            title: "Remove this statement?",
                            subtitle: "Are you sure? Verifier details will be removed.",
                            "confirm-button-label": n.LABEL.OKAY,
                            "close-button-label": n.LABEL.CANCEL,
                            "confirm-callback": n.removeVerifierFromAnswers,
                            "close-dialog": n.closeDialogs
                        }
                    })], 1)
                }), [], !1, null, null, null);
            t.default = component.exports;
            installComponents(component, {
                OasStageSidebar: n(1039).default,
                BaseRequirements: n(916).default,
                VerifierDialog: n(1040).default,
                ConfirmationDialog: n(79).default
            })
        },
        1152: function(e, t, n) {
            "use strict";
            n(1088)
        },
        1153: function(e, t, n) {
            e.exports = {}
        },
        1154: function(e, t, n) {
            e.exports = {}
        },
        1205: function(e, t, n) {
            "use strict";
            n(1153)
        },
        1207: function(e, t, n) {
            "use strict";
            n(1154)
        },
        1270: function(e, t, n) {
            e.exports = {}
        },
        1317: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(886),
                o = n(885),
                l = n(1430),
                c = n(1431),
                d = n(1497),
                m = n(1369),
                v = n(1135),
                _ = n(40).d.extend({
                    name: "ApprovalOverview",
                    components: {
                        ApprovalsTable: v.default
                    },
                    data: () => ({
                        dataReady: !1,
                        tabs: null,
                        tabsList: ["Approvals", "History"],
                        poller: null
                    }),
                    computed: {
                        isReady() {
                            return this.hasApprovalsData
                        }
                    },
                    created() {
                        this.getData(), this.initPollData(), this.dataReady = !0
                    },
                    beforeDestroy() {
                        this.stopPoller()
                    },
                    methods: {
                        stopPoller() {
                            clearInterval(this.$data.poller)
                        },
                        initPollData() {
                            this.$data.poller = setInterval(async () => {
                                await this.pollHandler()
                            }, 5e3)
                        },
                        async pollHandler() {
                            await this.getData() || (console.warn("getData() failed, stop polling"), this.stopPoller())
                        }
                    }
                }),
                f = (n(1205), n(9)),
                component = Object(f.a)(_, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", {
                        staticClass: "ApprovalOverview"
                    }, [t(o.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(r.a, {
                        attrs: {
                            sm: "12",
                            md: "12",
                            lg: "12"
                        }
                    }, [t("section", {
                        staticClass: "ApprovalOverview__header"
                    }, [t("h1", {
                        staticClass: "ApprovalOverview__title"
                    }, [e._v("Approvals")])]), e._v(" "), t("section", {
                        staticClass: "ApprovalOverview__nav"
                    }, [t("div", {
                        staticClass: "ApprovalOverview__tabs"
                    }, [t(d.a, {
                        attrs: {
                            "background-color": "grey lighten-5",
                            grow: "",
                            height: "40"
                        },
                        model: {
                            value: e.tabs,
                            callback: function(t) {
                                e.tabs = t
                            },
                            expression: "tabs"
                        }
                    }, e._l(e.tabsList, (function(n) {
                        return t(l.a, {
                            key: n
                        }, [e._v(e._s(n))])
                    })), 1)], 1)]), e._v(" "), t("section", {
                        staticClass: "ApprovalOverview__main"
                    }, [t(m.a, {
                        attrs: {
                            touchless: !0
                        },
                        model: {
                            value: e.tabs,
                            callback: function(t) {
                                e.tabs = t
                            },
                            expression: "tabs"
                        }
                    }, [t(c.a, [t("div", {
                        staticClass: "ApprovalOverview__subtitle"
                    }, [e._v("\n              Here is a list of approval requests from youth members that requires action.\n            ")]), e._v(" "), t("ApprovalsTable", {
                        attrs: {
                            loading: e.isReady,
                            "default-table": "",
                            headers: "default",
                            "show-select": "",
                            "table-data": e.$accessor.approvals.getApprovalsData
                        }
                    })], 1), e._v(" "), t(c.a, [t("div", {
                        staticClass: "ApprovalOverview__subtitle"
                    }, [e._v("Here is a recent history of past approvals.")]), e._v(" "), t("ApprovalsTable", {
                        attrs: {
                            loading: e.isReady,
                            headers: "recent",
                            "table-data": e.$accessor.approvals.getApprovalsHistoryData
                        }
                    })], 1)], 1)], 1)])], 1)], 1)
                }), [], !1, null, "586041e2", null);
            t.default = component.exports;
            installComponents(component, {
                ApprovalsTable: n(1135).default
            })
        },
        1318: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(870),
                o = n(886),
                l = n(885),
                c = n(4),
                d = n(287),
                m = n(3),
                v = n(40),
                _ = n(5),
                f = n(22),
                h = n(1100),
                y = n(1101),
                w = n(1085),
                C = n(1086),
                S = n(1136),
                A = n(1137),
                T = n(1105),
                E = n(1106),
                R = n(1107),
                k = n(1108),
                O = n(925),
                I = n(950),
                $ = v.d.extend({
                    name: "ApprovalsReview",
                    components: {
                        Loading: I.default,
                        AdventurousJourneyRequirements: h.default,
                        AdventurousJourneyReview: y.default,
                        IntroSectionRequirements: C.default,
                        IntroScoutingRequirements: w.default,
                        MilestoneReview: S.default,
                        PersonalDevelopmentRequirements: T.default,
                        PersonalReflectionRequirements: E.default,
                        PeakAwardReview: A.default,
                        SiaRequirements: R.default,
                        SiaReview: k.default,
                        SubmissionInformation: O.default
                    },
                    props: {
                        submission: {
                            type: Object,
                            required: !0
                        }
                    },
                    created() {
                        this.$accessor.global.setBreadcrumbs([{
                            text: _.l.APPROVALS,
                            to: m.APPROVALS,
                            exact: !0,
                            disabled: !0
                        }])
                    },
                    mounted() {
                        this.enableAchievementType(this.submission)
                    },
                    data: () => ({
                        prevRoute: null,
                        search: "",
                        API: c,
                        loading: !0,
                        ICONS: d,
                        LABEL: _.i,
                        isReviewing: {
                            adventurousJourneyApproval: !1,
                            adventurousJourneyReview: !1,
                            introScouting: !1,
                            introSection: !1,
                            milestone: !1,
                            oas: !1,
                            personalReflection: !1,
                            personalDevelopment: !1,
                            siaApproval: !1,
                            siaReview: !1,
                            peakAward: !1
                        },
                        showSubmissionDetails: !1
                    }),
                    computed: {
                        isReady() {
                            return Object.values(this.$data.isReviewing).find(e => e)
                        },
                        currentUserCanAction() {
                            return this.submission.currentUserCanAction
                        },
                        oasTitle() {
                            return this.$accessor.oas.getOasStageAndBranchTitle
                        },
                        canArchive() {
                            var e, t;
                            return !(null === (e = this.$accessor.approvals.getCurrentAchievement) || void 0 === e || !e.can_archive || null === (t = this.submission.unit_permissions) || void 0 === t || !t.write)
                        },
                        unitId() {
                            return this.$accessor.user.getUnitId
                        }
                    },
                    methods: {
                        previous() {
                            this.$accessor.global.getRoute === m.APPROVALS ? this.$accessor.approvals.setIsReviewing(!1) : this.$router.back()
                        },
                        enableAchievementType(e) {
                            const {
                                achievementType: t,
                                submissionType: n
                            } = e;
                            t === _.q.ADVENTUROUS_JOURNEY && n === f.b.APPROVAL ? this.isReviewing.adventurousJourneyApproval = !0 : t === _.q.ADVENTUROUS_JOURNEY && n === f.b.REVIEW ? this.isReviewing.adventurousJourneyReview = !0 : t === _.q.INTRO_SCOUTING ? this.isReviewing.introScouting = !0 : t === _.q.INTRO_SECTION ? this.isReviewing.introSection = !0 : t === _.q.MILESTONE ? this.isReviewing.milestone = !0 : t === _.q.OAS ? this.isReviewing.oas = !0 : t === _.q.PERSONAL_DEVELOPMENT ? this.isReviewing.personalDevelopment = !0 : t === _.q.PERSONAL_REFLECTION ? this.isReviewing.personalReflection = !0 : t === _.q.SIA && n === f.b.APPROVAL ? this.isReviewing.siaApproval = !0 : t === _.q.SIA && n === f.b.REVIEW ? this.isReviewing.siaReview = !0 : t === _.q.PEAK_AWARD && (this.isReviewing.peakAward = !0)
                        }
                    }
                }),
                P = (n(1207), n(9)),
                component = Object(P.a)($, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", {
                        staticClass: "ApprovalsReview"
                    }, [t(l.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(o.a, {
                        staticClass: "mx-auto",
                        attrs: {
                            lg: e.isReviewing.peakAward ? 10 : 8,
                            "offset-lg": "2",
                            md: e.isReviewing.peakAward ? 12 : 10,
                            "offset-md": "1",
                            sm: "12"
                        }
                    }, [t("NavLink", {
                        attrs: {
                            direction: "left",
                            text: "Previous"
                        },
                        nativeOn: {
                            click: function(t) {
                                return e.previous()
                            },
                            keydown: function(t) {
                                return e.previous()
                            }
                        }
                    }), e._v(" "), t(l.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(o.a, [t("h1", {
                        staticClass: "ApprovalsReview__title"
                    }, [e._v("Approval request")])])], 1), e._v(" "), t(l.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(o.a, [t("div", {
                        staticClass: "ApprovalsReview__name"
                    }, [t("div", {
                        staticClass: "ApprovalsReview__subtitle"
                    }, [e._v("Submitted by")]), e._v(" "), e.submission.submittedByName ? t("div", [t("p", [e._v("\n                " + e._s(e.submission.submittedByName) + "\n                "), t("br"), e._v("\n                on behalf of " + e._s(e.submission.name) + "\n              ")])]) : t("div", [t("p", [e._v(e._s(e.submission.name))])])]), e._v(" "), t("div", {
                        staticClass: "ApprovalsReview__date"
                    }, [t("div", {
                        staticClass: "ApprovalsReview__subtitle"
                    }, [e._v("Date")]), e._v(" "), t("div", [e._v(e._s(e.submission.date))])])]), e._v(" "), t(o.a, [t("div", {
                        staticClass: "ApprovalsReview__pathways"
                    }, [t("div", {
                        staticClass: "ApprovalsReview__subtitle"
                    }, [e._v("Achievement Pathways")]), e._v(" "), t("div", [e._v(e._s(e.submission.pathway))]), e._v(" "), e.isReviewing.oas ? t("div", [e._v(e._s(e.oasTitle))]) : e._e(), e._v(" "), t("div", [e._v(e._s(e.submission.request_type))])])])], 1), e._v(" "), t("hr", {
                        staticClass: "mt-3 mb-3"
                    }), e._v(" "), t("Loading", {
                        attrs: {
                            loading: !e.isReady
                        }
                    }), e._v(" "), e.isReady ? [e.isReviewing.adventurousJourneyApproval || e.isReviewing.adventurousJourneyReview ? t("AdventurousJourneyRequirements") : e._e(), e._v(" "), e.isReviewing.adventurousJourneyReview ? t("AdventurousJourneyReview") : e._e(), e._v(" "), e.isReviewing.introSection ? t("IntroSectionRequirements") : e._e(), e._v(" "), e.isReviewing.introScouting ? t("IntroScoutingRequirements") : e._e(), e._v(" "), e.isReviewing.milestone ? t("MilestoneReview") : e._e(), e._v(" "), e.isReviewing.oas ? t("OasStage") : e._e(), e._v(" "), e.isReviewing.personalDevelopment ? t("PersonalDevelopmentRequirements") : e._e(), e._v(" "), e.isReviewing.personalReflection ? t("PersonalReflectionRequirements") : e._e(), e._v(" "), e.isReviewing.siaApproval || e.isReviewing.siaReview ? t("SiaRequirements") : e._e(), e._v(" "), e.isReviewing.siaReview ? t("SiaReview") : e._e(), e._v(" "), e.isReviewing.peakAward ? t("PeakAwardReview", {
                        attrs: {
                            submission: e.submission
                        }
                    }) : e._e(), e._v(" "), t("section", {
                        staticClass: "ApprovalsReview__buttons mt-12"
                    }, [t(r.a, {
                        staticClass: "mr-4 mb-4",
                        attrs: {
                            outlined: "",
                            small: "",
                            "data-cy": "BACK"
                        },
                        on: {
                            click: function(t) {
                                return e.previous()
                            },
                            keydown: function(t) {
                                return e.previous()
                            }
                        }
                    }, [e._v("\n            " + e._s(e.LABEL.BACK) + "\n          ")]), e._v(" "), t("div", {
                        staticClass: "ApprovalsReview__buttons-action"
                    }, [t(r.a, {
                        staticClass: "ml-4 mb-4",
                        attrs: {
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(t) {
                                e.showSubmissionDetails = !0
                            }
                        }
                    }, [e._v("\n              " + e._s(e.LABEL.SUBMISSION_INFO) + "\n            ")]), e._v(" "), e.canArchive ? t(r.a, {
                        staticClass: "ml-4 mb-4",
                        attrs: {
                            outlined: "",
                            "data-cy": "ARCHIVE",
                            small: "",
                            text: ""
                        },
                        on: {
                            click: function(t) {
                                return e.archive(e.submission)
                            }
                        }
                    }, [e._v("\n              " + e._s(e.LABEL.ARCHIVE) + "\n            ")]) : e._e(), e._v(" "), t(r.a, {
                        staticClass: "ml-4 mb-4",
                        attrs: {
                            outlined: "",
                            disabled: !e.currentUserCanAction,
                            "data-cy": "REJECT",
                            small: ""
                        },
                        on: {
                            click: function(t) {
                                return e.reject(e.submission)
                            }
                        }
                    }, [e._v("\n              " + e._s(e.LABEL.IMPROVE) + "\n            ")]), e._v(" "), t(r.a, {
                        staticClass: "ml-4 mb-4",
                        attrs: {
                            disabled: !e.currentUserCanAction,
                            "data-cy": "APPROVE",
                            small: ""
                        },
                        on: {
                            click: function(t) {
                                return e.approve(e.submission)
                            }
                        }
                    }, [e._v("\n              " + e._s(e.LABEL.APPROVE) + "\n            ")])], 1)], 1)] : e._e()], 2)], 1), e._v(" "), t("InformationDialog", {
                        attrs: {
                            model: e.showSubmissionDetails,
                            title: "Submission Details",
                            "max-width": "800px !important",
                            persistent: !1,
                            "close-button-label": "close",
                            "close-dialog": () => e.showSubmissionDetails = !1
                        }
                    }, [t("div", {
                        attrs: {
                            slot: "content"
                        },
                        slot: "content"
                    }, [t("SubmissionInformation", {
                        attrs: {
                            "unit-id": e.unitId,
                            "submission-id": e.submission.submissionId
                        }
                    })], 1)])], 1)
                }), [], !1, null, "f03f25f6", null);
            t.default = component.exports;
            installComponents(component, {
                NavLink: n(100).default,
                Loading: n(950).default,
                AdventurousJourneyRequirements: n(1100).default,
                AdventurousJourneyReview: n(1101).default,
                IntroSectionRequirements: n(1086).default,
                IntroScoutingRequirements: n(1085).default,
                OasStage: n(1138).default,
                PersonalDevelopmentRequirements: n(1105).default,
                PersonalReflectionRequirements: n(1106).default,
                SiaRequirements: n(1107).default,
                SiaReview: n(1108).default,
                PeakAwardReview: n(1137).default,
                SubmissionInformation: n(925).default,
                InformationDialog: n(219).default
            })
        },
        1366: function(e, t, n) {
            "use strict";
            n(1270)
        },
        1442: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(11),
                o = n.n(r),
                l = n(23),
                c = n.n(l),
                d = n(40),
                m = n(5),
                v = n(4),
                _ = n(3),
                f = d.d.extend({
                    name: "ApprovalsPage",
                    data: () => ({
                        LABEL: m.i
                    }),
                    computed: {
                        isReviewing() {
                            return this.$accessor.approvals.getIsReviewing
                        }
                    },
                    created() {
                        if (this.$accessor.global.setBreadcrumbs([{
                                text: m.l.APPROVALS,
                                to: _.APPROVALS,
                                exact: !0,
                                disabled: !0
                            }]), !this.$storeUser.hasRoleGroupLeader && !this.$storeUser.hasRoleUnitCouncil) return this.$nuxt.error({
                            statusCode: 404,
                            message: ""
                        })
                    },
                    mounted() {
                        this.$accessor.global.setLoading(!1)
                    },
                    beforeDestroy() {
                        this.$accessor.approvals.resetState(), this.$accessor.pe.resetState()
                    },
                    methods: {
                        confirmApprove(e) {
                            const t = this.$accessor.approvals.getSubmissionId;
                            this.httpRequest({
                                axiosRequest: o.a.post,
                                url: `${this.$config.api.achievements}${v.SUBMISSIONS_PATH}/${t}${v.ASSESSMENTS_PATH}`,
                                body: {
                                    outcome: "approved",
                                    comment: e
                                },
                                successResponseCode: c.a.NO_CONTENT,
                                successMessage: "Request approved",
                                showSnackbar: !0,
                                responseHandler: async () => {
                                    this.$accessor.approvals.addSubmissionToQueue(t), await this.getData(), this.goBackToApprovals()
                                }
                            })
                        },
                        confirmReject(e) {
                            const t = this.$accessor.approvals.getSubmissionId;
                            this.httpRequest({
                                axiosRequest: o.a.post,
                                url: `${this.$config.api.achievements}${v.SUBMISSIONS_PATH}/${t}${v.ASSESSMENTS_PATH}`,
                                body: {
                                    outcome: "rejected",
                                    comment: e
                                },
                                successResponseCode: c.a.NO_CONTENT,
                                successMessage: "Improvement requested",
                                showSnackbar: !0,
                                responseHandler: async () => {
                                    this.$accessor.approvals.addSubmissionToQueue(t), await this.getData(), this.goBackToApprovals()
                                }
                            })
                        },
                        confirmArchive() {
                            const {
                                memberId: e,
                                achievementId: t,
                                submissionId: n
                            } = this.$accessor.approvals.getCurrentSubmission;
                            this.httpRequest({
                                axiosRequest: o.a.post,
                                url: `${this.$config.api.achievements}${v.MEMBERS_PATH}/${e}${v.ACHIEVEMENTS_PATH}/${t}/archive?submission_id=${encodeURIComponent(n)}`,
                                successResponseCode: c.a.NO_CONTENT,
                                successMessage: "Item archived",
                                showSnackbar: !0,
                                responseHandler: async () => {
                                    this.$accessor.approvals.addSubmissionToQueue(n), await this.getData(), this.goBackToApprovals()
                                }
                            })
                        }
                    }
                }),
                h = (n(1366), n(9)),
                component = Object(h.a)(f, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", {
                        staticClass: "ApprovalsPage"
                    }, [t("transition", {
                        attrs: {
                            name: "page",
                            mode: ""
                        }
                    }, [e.isReviewing ? e._e() : t("ApprovalsOverview")], 1), e._v(" "), t("transition", {
                        attrs: {
                            name: "page",
                            mode: ""
                        }
                    }, [e.isReviewing ? t("ApprovalsReview", {
                        attrs: {
                            submission: e.$accessor.approvals.getCurrentSubmission
                        }
                    }) : e._e()], 1), e._v(" "), t("ConfirmationDialog", {
                        attrs: {
                            model: e.$accessor.approvals.approveModal,
                            title: "Approve request",
                            subtitle: "Please make sure you have read through the request before approving.",
                            "confirm-button-label": e.LABEL.APPROVE,
                            "input-label": "Reason for response (optional)",
                            "close-button-label": e.LABEL.CANCEL,
                            "confirm-callback": e.confirmApprove,
                            "close-dialog": e.closeApprovalDialogs
                        }
                    }), e._v(" "), t("ConfirmationDialog", {
                        attrs: {
                            model: e.$accessor.approvals.rejectModal,
                            title: "Improvement required",
                            subtitle: "We recommend that you go through this submission with the youth member in person before or after requesting an improvement via Scouts | Terrain.",
                            "confirm-button-label": e.LABEL.REQUEST_IMPROVEMENT,
                            "input-label": "Reason for response (optional)",
                            "close-button-label": e.LABEL.CANCEL,
                            "confirm-callback": e.confirmReject,
                            "close-dialog": e.closeApprovalDialogs
                        }
                    }), e._v(" "), t("ConfirmationDialog", {
                        attrs: {
                            model: e.$accessor.approvals.archiveModal,
                            title: "Archive Item",
                            subtitle: "This will remove the item from both the member's view and this approvals view, but retain a copy within the system for reference.",
                            "confirm-button-label": e.LABEL.ARCHIVE_ITEM,
                            "close-button-label": e.LABEL.CANCEL,
                            "confirm-callback": e.confirmArchive,
                            "close-dialog": e.closeApprovalDialogs
                        }
                    })], 1)
                }), [], !1, null, "346866bd", null);
            t.default = component.exports;
            installComponents(component, {
                ApprovalsOverview: n(1317).default,
                ApprovalsReview: n(1318).default,
                ConfirmationDialog: n(79).default
            })
        },
        903: function(e, t, n) {
            var map = {
                "./icon--caution-inverse.svg": 215,
                "./icon--check-inverse.svg": 216,
                "./icon--hint-inverse.svg": 217,
                "./icon--locked.svg": 308,
                "./icon--logbook-distance-travelled.svg": 300,
                "./icon--logbook-nights-camped.svg": 301,
                "./icon--nope-inverse.svg": 218,
                "./icon--oas-alpine.svg": 309,
                "./icon--oas-aquatics.svg": 310,
                "./icon--oas-boating.svg": 311,
                "./icon--oas-bushcraft.svg": 312,
                "./icon--oas-bushwalking.svg": 313,
                "./icon--oas-camping.svg": 314,
                "./icon--oas-cycling.svg": 315,
                "./icon--oas-paddling.svg": 316,
                "./icon--oas-vertical.svg": 317,
                "./icon--plan.svg": 307,
                "./icon--review.svg": 318,
                "./icon--spices--3x2.svg": 319,
                "./icon--system-admin.svg": 320,
                "./icon--time-inverse.svg": 321,
                "./icon--time.svg": 322,
                "./icon-alert-blue-in-progress.svg": 323,
                "./icon-alert-green-check.svg": 324,
                "./icon-area-community.svg": 176,
                "./icon-area-creativity.svg": 178,
                "./icon-area-outdoors.svg": 177,
                "./icon-area-personal-growth.svg": 179,
                "./icon-attach.svg": 325,
                "./icon-caution.svg": 326,
                "./icon-check-grey.svg": 288,
                "./icon-check.svg": 289,
                "./icon-chevron-right.svg": 327,
                "./icon-danger.svg": 328,
                "./icon-hint-blue.svg": 302,
                "./icon-hint-grey.svg": 329,
                "./icon-in-progress.svg": 330,
                "./icon-info.svg": 331,
                "./icon-nope-grey.svg": 332,
                "./icon-nope.svg": 333,
                "./icon-peak-award-cub-active.svg": 290,
                "./icon-peak-award-cub-disabled.svg": 291,
                "./icon-peak-award-joey-active.svg": 292,
                "./icon-peak-award-joey-disabled.svg": 293,
                "./icon-peak-award-rover-active.svg": 294,
                "./icon-peak-award-rover-disabled.svg": 295,
                "./icon-peak-award-scout-active.svg": 296,
                "./icon-peak-award-scout-disabled.svg": 297,
                "./icon-peak-award-venturer-active.svg": 298,
                "./icon-peak-award-venturer-disabled.svg": 299,
                "./icon-pencil.svg": 334,
                "./icon-success.svg": 335,
                "./icon-view-doc.svg": 336,
                "./outline/icon--add-member.svg": 180,
                "./outline/icon--approve.svg": 181,
                "./outline/icon--archive.svg": 182,
                "./outline/icon--calendar-toggle.svg": 183,
                "./outline/icon--calendar.svg": 184,
                "./outline/icon--check-green.svg": 185,
                "./outline/icon--check-grey.svg": 186,
                "./outline/icon--clipboard-inverse.svg": 187,
                "./outline/icon--clipboard.svg": 188,
                "./outline/icon--close.svg": 189,
                "./outline/icon--comments.svg": 190,
                "./outline/icon--copy.svg": 191,
                "./outline/icon--delete.svg": 192,
                "./outline/icon--download.svg": 193,
                "./outline/icon--edit.svg": 194,
                "./outline/icon--hamburger.svg": 195,
                "./outline/icon--idea.svg": 196,
                "./outline/icon--import-inverse.svg": 197,
                "./outline/icon--import.svg": 198,
                "./outline/icon--improve.svg": 199,
                "./outline/icon--info.svg": 200,
                "./outline/icon--legal.svg": 201,
                "./outline/icon--logout.svg": 202,
                "./outline/icon--notification.svg": 203,
                "./outline/icon--offline.svg": 204,
                "./outline/icon--patrol.svg": 205,
                "./outline/icon--plan.svg": 206,
                "./outline/icon--privacy.svg": 207,
                "./outline/icon--reject.svg": 208,
                "./outline/icon--resource.svg": 209,
                "./outline/icon--review.svg": 210,
                "./outline/icon--support.svg": 211,
                "./outline/icon--time-blue.svg": 212,
                "./outline/icon--time.svg": 213,
                "./outline/icon--view.svg": 214,
                "./template-assets/adventure-sport--default.svg": 337,
                "./template-assets/adventure-sport--selected.svg": 338,
                "./template-assets/adventure-sport--unselected.svg": 339,
                "./template-assets/affordable-and-clean-energy--selected.svg": 340,
                "./template-assets/affordable-and-clean-energy--unselected.svg": 341,
                "./template-assets/art-literature--default.svg": 342,
                "./template-assets/art-literature--selected.svg": 343,
                "./template-assets/art-literature--unselected.svg": 344,
                "./template-assets/character--selected.svg": 345,
                "./template-assets/character--unselected.svg": 346,
                "./template-assets/clean-water-and-sanitation--selected.svg": 347,
                "./template-assets/clean-water-and-sanitation--unselected.svg": 348,
                "./template-assets/climate-action--selected.svg": 349,
                "./template-assets/climate-action--unselected.svg": 350,
                "./template-assets/community--default.svg": 303,
                "./template-assets/community--selected.svg": 351,
                "./template-assets/community--unselected.svg": 352,
                "./template-assets/community-involvement--default.svg": 353,
                "./template-assets/community-involvement--selected.svg": 354,
                "./template-assets/community-involvement--unselected.svg": 355,
                "./template-assets/creating-a-better-world--default.svg": 356,
                "./template-assets/creating-a-better-world--selected.svg": 357,
                "./template-assets/creating-a-better-world--unselected.svg": 358,
                "./template-assets/creative--default.svg": 304,
                "./template-assets/creative--selected.svg": 359,
                "./template-assets/creative--unselected.svg": 360,
                "./template-assets/decent-work-and-economic-growth--selected.svg": 361,
                "./template-assets/decent-work-and-economic-growth--unselected.svg": 362,
                "./template-assets/emotional--selected.svg": 363,
                "./template-assets/emotional--unselected.svg": 364,
                "./template-assets/environment--default.svg": 365,
                "./template-assets/environment--selected.svg": 366,
                "./template-assets/environment--unselected.svg": 367,
                "./template-assets/gender-equality--selected.svg": 368,
                "./template-assets/gender-equality--unselected.svg": 369,
                "./template-assets/good-health-and-wellbeing--selected.svg": 370,
                "./template-assets/good-health-and-wellbeing--unselected.svg": 371,
                "./template-assets/growth-development--default.svg": 372,
                "./template-assets/growth-development--selected.svg": 373,
                "./template-assets/growth-development--unselected.svg": 374,
                "./template-assets/industry-innovation-and-infrastructure--selected.svg": 375,
                "./template-assets/industry-innovation-and-infrastructure--unselected.svg": 376,
                "./template-assets/intellectual--selected.svg": 377,
                "./template-assets/intellectual--unselected.svg": 378,
                "./template-assets/learn-by-doing--default.svg": 379,
                "./template-assets/learn-by-doing--selected.svg": 380,
                "./template-assets/learn-by-doing--unselected.svg": 381,
                "./template-assets/life-below-water--selected.svg": 382,
                "./template-assets/life-below-water--unselected.svg": 383,
                "./template-assets/life-on-land--selected.svg": 384,
                "./template-assets/life-on-land--unselected.svg": 385,
                "./template-assets/nature-and-outdoors--default.svg": 386,
                "./template-assets/nature-and-outdoors--selected.svg": 387,
                "./template-assets/nature-and-outdoors--unselected.svg": 388,
                "./template-assets/no-poverty--selected.svg": 389,
                "./template-assets/no-poverty--unselected.svg": 390,
                "./template-assets/oas-alpine--selected.svg": 391,
                "./template-assets/oas-alpine--unselected.svg": 392,
                "./template-assets/oas-aquatics--selected.svg": 393,
                "./template-assets/oas-aquatics--unselected.svg": 394,
                "./template-assets/oas-boating--selected.svg": 395,
                "./template-assets/oas-boating--unselected.svg": 396,
                "./template-assets/oas-bushcraft--selected.svg": 397,
                "./template-assets/oas-bushcraft--unselected.svg": 398,
                "./template-assets/oas-bushwalking--selected.svg": 399,
                "./template-assets/oas-bushwalking--unselected.svg": 400,
                "./template-assets/oas-camping--selected.svg": 401,
                "./template-assets/oas-camping--unselected.svg": 402,
                "./template-assets/oas-cycling--selected.svg": 403,
                "./template-assets/oas-cycling--unselected.svg": 404,
                "./template-assets/oas-padding--unselected.svg": 405,
                "./template-assets/oas-paddling--selected.svg": 406,
                "./template-assets/oas-vertical--selected.svg": 407,
                "./template-assets/oas-vertical--unselected.svg": 408,
                "./template-assets/outdoors--default.svg": 305,
                "./template-assets/outdoors--selected.svg": 409,
                "./template-assets/outdoors--unselected.svg": 410,
                "./template-assets/partnerships-for-the-goals--selected.svg": 411,
                "./template-assets/partnerships-for-the-goals--unselected.svg": 412,
                "./template-assets/patrol-system--default.svg": 413,
                "./template-assets/patrol-system--selected.svg": 414,
                "./template-assets/patrol-system--unselected.svg": 415,
                "./template-assets/peace-justice-and-strong-institutions--selected.svg": 416,
                "./template-assets/peace-justice-and-strong-institutions--unselected.svg": 417,
                "./template-assets/personal-growth--default.svg": 306,
                "./template-assets/personal-growth--selected.svg": 418,
                "./template-assets/personal-growth--unselected.svg": 419,
                "./template-assets/personal-progression--default.svg": 420,
                "./template-assets/personal-progression--selected.svg": 421,
                "./template-assets/personal-progression--unselected.svg": 422,
                "./template-assets/physical--selected.svg": 423,
                "./template-assets/physical--unselected.svg": 424,
                "./template-assets/promise-and-law--default.svg": 425,
                "./template-assets/promise-and-law--selected.svg": 426,
                "./template-assets/promise-and-law--unselected.svg": 427,
                "./template-assets/quality-education--selected.svg": 428,
                "./template-assets/quality-education--unselected.svg": 429,
                "./template-assets/reduced-inequalities--selected.svg": 430,
                "./template-assets/reduced-inequalities--unselected.svg": 431,
                "./template-assets/responsible-consumption-and-production--selected.svg": 432,
                "./template-assets/responsible-consumption-and-production--unselected.svg": 433,
                "./template-assets/social--selected.svg": 434,
                "./template-assets/social--unselected.svg": 435,
                "./template-assets/spiritual--selected.svg": 436,
                "./template-assets/spiritual--unselected.svg": 437,
                "./template-assets/stem-innovation--default.svg": 438,
                "./template-assets/stem-innovation--selected.svg": 439,
                "./template-assets/stem-innovation--unselected.svg": 440,
                "./template-assets/sustainable-communities--selected.svg": 441,
                "./template-assets/sustainable-communities--unselected.svg": 442,
                "./template-assets/symbolic-framework--default.svg": 443,
                "./template-assets/symbolic-framework--selected.svg": 444,
                "./template-assets/symbolic-framework--unselected.svg": 445,
                "./template-assets/youth-leading-adult-supporting--default.svg": 446,
                "./template-assets/youth-leading-adult-supporting--selected.svg": 447,
                "./template-assets/youth-leading-adult-supporting--unselected.svg": 448,
                "./template-assets/zero-hunger--selected.svg": 449,
                "./template-assets/zero-hunger--unselected.svg": 450
            };

            function r(e) {
                var t = o(e);
                return n(t)
            }

            function o(e) {
                if (!n.o(map, e)) {
                    var t = new Error("Cannot find module '" + e + "'");
                    throw t.code = "MODULE_NOT_FOUND", t
                }
                return map[e]
            }
            r.keys = function() {
                return Object.keys(map)
            }, r.resolve = o, e.exports = r, r.id = 903
        },
        907: function(e, t, n) {
            "use strict";
            n.d(t, "a", (function() {
                return r
            }));
            const r = e => (null == e ? void 0 : e.includes("required")) ? [e => !!e || "This input is required"] : []
        },
        908: function(e, t, n) {
            "use strict";
            n.d(t, "b", (function() {
                return r
            })), n.d(t, "c", (function() {
                return o
            })), n.d(t, "d", (function() {
                return l
            })), n.d(t, "e", (function() {
                return c
            })), n.d(t, "f", (function() {
                return d
            })), n.d(t, "g", (function() {
                return m
            })), n.d(t, "j", (function() {
                return v
            })), n.d(t, "a", (function() {
                return _
            })), n.d(t, "h", (function() {
                return f
            })), n.d(t, "i", (function() {
                return h
            }));
            const r = {
                    spices: "intro-scouting--spices",
                    plan_do_review: "intro-scouting--plan-do-review"
                },
                o = {
                    overview: "intro-scouting--overview",
                    side: "intro-scouting--side"
                },
                l = {
                    overview_joey: "intro-section/joey--overview",
                    overview_cub: "intro-section/cub--overview",
                    overview_scout: "intro-section/scout--overview",
                    overview_venturer: "intro-section/venturer--overview",
                    overview_rover: "intro-section/rover--overview",
                    side: "intro-section/intro-section--side"
                },
                c = new Map([
                    ["joey", l.overview_joey],
                    ["cub", l.overview_cub],
                    ["scout", l.overview_scout],
                    ["venturer", l.overview_venturer],
                    ["rover", l.overview_rover]
                ]),
                d = {
                    side: "milestones--side"
                },
                m = {
                    welcome: "oas--welcome",
                    side: "oas--side"
                },
                v = {
                    overview: "sia--overview",
                    welcome: "sia--welcome",
                    side: "sia--side"
                },
                _ = {
                    overview: "adventurous-journey--overview",
                    side: "adventurous-journey--side"
                },
                f = {
                    overview: "personal-development--overview",
                    side: "personal-development--side"
                },
                h = {
                    overview: "programming--overview"
                }
        },
        909: function(e, t, n) {
            "use strict";
            n.r(t), n.d(t, "INTRO_SCOUTING_TITLE", (function() {
                return r
            })), n.d(t, "INTRO_SCOUTING_SUBTITLE", (function() {
                return o
            })), n.d(t, "INTRO_SCOUTING_DOC_TITLES", (function() {
                return l
            })), n.d(t, "INTRO_SCOUTING_STATEMENTS", (function() {
                return c
            })), n.d(t, "INTRO_SECTION_SUBTITLE", (function() {
                return d
            })), n.d(t, "INTRO_SECTION_CONFIRM_TITLE", (function() {
                return m
            })), n.d(t, "INTRO_SECTION_CONFIRM_SUBTITLE", (function() {
                return v
            })), n.d(t, "INTRO_SECTION_STATEMENTS", (function() {
                return _
            }));
            const r = "Introduction to Scouting",
                o = "Check the circle when you have discussed the topic with your Leader. You don’t have to do it all at once. Don’t forget to click Save after each session.",
                l = {
                    spices: "SPICES"
                },
                c = {
                    spices: "What are SPICES?",
                    planDoReview: "What does Plan>Do>Review> mean?"
                },
                d = "Check the circle when you have discussed the topic with your Leader. You don’t have to do it all at once. Don’t forget to click Save after each session.",
                m = "Review Before Submitting",
                v = "Review your entry below before submitting it for approval. You can edit or discuss with a Leader or Mentor before submitting.",
                _ = {
                    spices: "What are SPICES?"
                }
        },
        910: function(e, t, n) {
            e.exports = {}
        },
        913: function(e, t, n) {
            e.exports = {}
        },
        914: function(e, t, n) {
            e.exports = {}
        },
        915: function(e, t, n) {
            e.exports = {}
        },
        916: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(870),
                o = n(886),
                l = n(243),
                c = n(897),
                d = n(885),
                m = n(1271),
                v = n(1272),
                _ = n(906),
                f = n(1273),
                h = n(42),
                y = n(3),
                w = n(909),
                C = n(908),
                S = n(287),
                A = n(5),
                T = n(4),
                E = n(10),
                R = n(128),
                k = n(28),
                O = n(40),
                I = n(937),
                $ = n(938),
                P = O.p.extend({
                    name: "BaseRequirements",
                    components: {
                        PlanDoReview: I.default,
                        Spices: $.default
                    },
                    props: {
                        overviewTemplate: {
                            type: Object
                        },
                        isOas: {
                            type: Boolean
                        },
                        isMilestone: {
                            type: Boolean
                        },
                        isSia: {
                            type: Boolean
                        },
                        isAj: {
                            type: Boolean
                        },
                        title: {
                            type: String,
                            default: ""
                        },
                        subtitle: {
                            type: String,
                            default: ""
                        },
                        confirmTitle: {
                            type: String,
                            default: ""
                        },
                        confirmSubtitle: {
                            type: String,
                            default: ""
                        },
                        hasUploadsToSave: {
                            type: Boolean
                        },
                        submittedSubtitle: {
                            type: String
                        },
                        setAnswerFunction: {
                            type: Function,
                            required: !0
                        },
                        saveFunction: {
                            type: Function,
                            required: !0
                        },
                        removeVerifiedFunc: {
                            type: Function,
                            default: null
                        },
                        submitFunction: {
                            type: Function,
                            required: !0
                        },
                        verifyFunction: {
                            type: Function,
                            default: null
                        },
                        modalFunction: {
                            type: Function,
                            default: () => {}
                        },
                        cancelModal: {
                            type: Function,
                            default: null
                        },
                        resetModal: {
                            type: Function,
                            default: null
                        },
                        answersUpdatedFunction: {
                            type: Function,
                            default: null
                        },
                        canCancel: {
                            type: Boolean,
                            default: !1
                        },
                        verifier: {
                            type: Object,
                            default: () => {}
                        },
                        spicesLabel: {
                            type: String,
                            default: ""
                        },
                        pdrLabel: {
                            type: String,
                            default: ""
                        },
                        backPath: {
                            type: String,
                            required: !0
                        },
                        forwardPath: {
                            type: String,
                            required: !0
                        },
                        confirm: {
                            type: Boolean
                        },
                        draft: {
                            type: Boolean,
                            required: !0
                        },
                        initialAnswers: {
                            type: Object,
                            required: !0
                        },
                        initialUploads: {
                            type: Array,
                            required: !0
                        },
                        template: {
                            type: Object,
                            required: !0
                        },
                        isReviewing: {
                            type: Boolean
                        },
                        isFlatLayout: {
                            type: Boolean
                        },
                        isLoading: {
                            type: Boolean
                        },
                        disabledIds: {
                            type: Array,
                            default: () => []
                        },
                        disabledInputs: {
                            type: Boolean
                        },
                        submitText: {
                            type: String,
                            default: A.i.SUBMIT_FOR_REVIEW
                        },
                        setUploadsFunction: {
                            type: Function,
                            required: !0
                        },
                        status: {
                            type: String
                        },
                        latestSubmission: {
                            type: Object
                        },
                        canReviewMilestone: {
                            type: Boolean,
                            default: !1
                        }
                    },
                    data: () => ({
                        PATH: y,
                        PE: w,
                        ICON_PENCIL: S.ICON_PENCIL,
                        ICON_VIEW_DOC: S.ICON_VIEW_DOC,
                        INTRO_SCOUTING_IMAGE_NAMES: C.c,
                        LABEL: A.i,
                        populatedSteps: [],
                        uploads: [],
                        spicesModel: !1,
                        pdrModel: !1,
                        verifierModel: [],
                        confirmationMode: !1,
                        currentStep: 1,
                        hasVerifiedChanged: !1,
                        hasChanged: !1,
                        CHALLENGE_AREAS_TYPES: T.CHALLENGE_AREAS_TYPES,
                        statementIds: [],
                        submitting: !1,
                        valid: !0,
                        showSubmissionDetails: !1
                    }),
                    computed: {
                        readyToSubmit() {
                            return !this.confirm || this.$data.confirmationMode
                        },
                        hasUnverifiedChanges() {
                            return !!this.verifierModel.length
                        },
                        showPrevious() {
                            return this.draft && this.$data.confirmationMode
                        },
                        isCondensedLayout() {
                            return !this.draft || this.$data.confirmationMode
                        },
                        verifiedStatementsComplete() {
                            const e = [],
                                t = this.statementIds.splice(0).filter(e => "logbook_up_to_date" !== e),
                                n = Object.keys(JSON.parse(JSON.stringify(this.initialAnswers)));
                            return t.forEach(s => {
                                n.forEach(a => {
                                    s === a && e.push(a)
                                })
                            }), e.length === t.length ? (this.$root.$emit("stageComplete", !0), !0) : (this.$root.$emit("stageComplete", !1), !1)
                        },
                        answersComplete() {
                            return !(!this.verifiedStatementsComplete || !this.$accessor.oas.getCurrentOasAnswers.logbook_up_to_date)
                        },
                        showSumbissionDetailsButton() {
                            return [E.a.PENDING_APPROVAL.valueOf(), E.a.FEEDBACK_APPROVAL.valueOf(), E.a.PENDING_REVIEW.valueOf(), E.a.FEEDBACK_REVIEW.valueOf()].includes(this.status)
                        },
                        requiredMilestoneCredits() {
                            return this.maxParticipates / Object.keys(T.CHALLENGE_AREAS_TYPES).length
                        }
                    },
                    beforeDestroy() {
                        this.$nuxt.$off("stageComplete")
                    },
                    mounted() {
                        if (this.$root.$on("hasUploadedFilesChanged", () => {
                                this.hasChanged = !0
                            }), this.$root.$on("checkboxChanged", () => {
                                this.hasChanged = !0
                            }), this.uploads = this.cleanUploads(JSON.parse(JSON.stringify(this.initialUploads))), Object(k.d)(this.template)) throw new Error("Template error.");
                        this.populatedSteps = this.populateTemplate(this.template, this.initialAnswers), this.$root.$on("setAndUpdateAnswers", (e, t) => {
                            this.setUpdatedAnswers(e, t)
                        }), this.$root.$on("setAndUpdateLogbookAnswer", e => {
                            this.setAndUpdateLogbookAnswer(e)
                        }), this.initialAnswers.spices && (this.spicesModel = !0), this.initialAnswers.plan_do_review && (this.pdrModel = !0)
                    },
                    methods: {
                        setAnswers() {
                            return new Promise(e => {
                                this.setUploadsFunction(this.uploads);
                                let t = {};
                                if (this.isMilestone || this.isSia || this.isAj) {
                                    const e = JSON.parse(JSON.stringify(this.initialAnswers));
                                    t = Object.assign(e, this.populatedStepsToAnswers(this.populatedSteps))
                                } else t = this.populatedStepsToAnswers(this.populatedSteps);
                                this.setAnswerFunction(t), this.$nextTick(async () => {
                                    await this.saveFunction(), e()
                                })
                            })
                        },
                        setUpdatedAnswers(e, t) {
                            return new Promise(n => {
                                this.populatedSteps = this.populateTemplate(this.template, e), this.answersUpdatedFunction && this.answersUpdatedFunction(t), this.resetSelections(), this.hasVerifiedChanged = !0, this.hasChanged = !0, n()
                            })
                        },
                        setAndUpdateLogbookAnswer(e) {
                            return new Promise(t => {
                                this.populatedSteps = this.populateTemplate(this.template, e), this.hasChanged = !0, t()
                            })
                        },
                        exit() {
                            this.$router.push({
                                path: this.backPath
                            })
                        },
                        reset() {
                            this.resetModal()
                        },
                        cancel() {
                            this.hasChanged ? this.cancelModal() : this.$router.go(-1)
                        },
                        async saveAndExit() {
                            this.isLoading || (await this.setAnswers(), this.$nextTick(() => {
                                this.$router.push({
                                    path: this.backPath
                                })
                            }))
                        },
                        async toggleConfirmation() {
                            this.isLoading || (this.confirmationMode || (await this.setAnswers(), this.currentStep = this.populatedSteps.length), this.confirmationMode = !this.confirmationMode)
                        },
                        async submit() {
                            if (this.submitting = !0, !this.isLoading) try {
                                await this.setAnswers(), await this.submitFunction(), this.$nextTick(() => {
                                    this.$router.push({
                                        path: this.forwardPath
                                    })
                                })
                            } catch (e) {
                                throw this.submitting = !1, e
                            }
                        },
                        titleText() {
                            return this.draft && this.confirmationMode ? this.confirmTitle : this.title
                        },
                        subtitleText() {
                            return this.draft ? this.confirmationMode ? this.confirmSubtitle : this.subtitle : this.submittedSubtitle
                        },
                        pdrChange(e) {
                            this.pdrModel = e
                        },
                        spicesChange(e) {
                            this.spicesModel = e
                        },
                        selectionChange(e) {
                            this.updateVerifierModel(e), this.verifyFunction(JSON.parse(JSON.stringify(this.verifierModel))), this.hasChanged = !0
                        },
                        updateVerifierModel(e) {
                            if (!0 === e.answer) this.verifierModel.push(e);
                            else if (!1 === e.answer) {
                                const t = this.verifierModel.findIndex(t => t.id === e.id); - 1 !== t && this.verifierModel.splice(t, 1)
                            }
                        },
                        resetSelections() {
                            this.verifierModel = []
                        },
                        async toStep(e) {
                            let t = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
                            this.isLoading || (t && await this.setAnswers(), this.confirmationMode = !1, this.currentStep = e, this.scrollTop())
                        },
                        isSelector: e => [T.TEMPLATE_INPUT_TYPE.multiTab, T.TEMPLATE_INPUT_TYPE.singleTab].includes(e.type),
                        populateTemplate(template, e) {
                            this.statementIds.length = 0, e || (e = {});
                            const t = JSON.parse(JSON.stringify(template.document));
                            for (const n of t)
                                for (const t of n.input_groups)
                                    for (const input of t.inputs) {
                                        this.isOas && input.id !== T.TEMPLATE_INPUT_TYPE.fileUploader && this.statementIds.push(input.id);
                                        if (![T.TEMPLATE_INPUT_TYPE.markdown, T.TEMPLATE_INPUT_TYPE.riskAssessment, T.TEMPLATE_INPUT_TYPE.textEndLink].includes(input.type))
                                            if (this.isSelector(input)) {
                                                let t;
                                                t = input.type === T.TEMPLATE_INPUT_TYPE.singleTab ? input.selections : this.tabsToSelectionList(input.tabs);
                                                for (const n of t) e[input.id] ? Array.isArray(e[input.id]) ? n.selected = e[input.id].includes(n.id) : n.selected = e[input.id] === n.id : n.selected = !1
                                            } else if (input.type === T.TEMPLATE_INPUT_TYPE.checkbox) input.answer = void 0 !== e[input.id] && e[input.id];
                                        else if (input.type === T.TEMPLATE_INPUT_TYPE.checkboxVerifiable) input.answer = {}, void 0 !== e[input.id] ? (input.answer = e[input.id], input.verifierType = e[input.id + R.h], input.verifierName = e[input.id + R.g], input.verifierContact = e[input.id + R.e], input.verifiedDate = e[input.id + R.f], input.eventId = e[input.id + R.a]) : (input.answer = !1, input.verifierName = null, input.verifierContact = null, input.verifiedDate = null);
                                        else if ([T.TEMPLATE_INPUT_TYPE.text, T.TEMPLATE_INPUT_TYPE.radio].includes(input.type)) input.answer = void 0 !== e[input.id] ? e[input.id] : "";
                                        else if (input.type === T.TEMPLATE_INPUT_TYPE.dateRange) input.answer = void 0 !== e[input.id] ? e[input.id] : "";
                                        else if (input.type === T.TEMPLATE_INPUT_TYPE.fileUploader) input.answer = void 0 !== e[input.id] ? e[input.id] : [];
                                        else {
                                            const e = new Error(`Invalid input type "${input.type}" for input ${input.id}`);
                                            h.c(e)
                                        }
                                    }
                            return t
                        },
                        populatedStepsToAnswers(e) {
                            const t = {};
                            for (const n of e)
                                for (const e of n.input_groups)
                                    for (const input of e.inputs)
                                        if (input.type !== T.TEMPLATE_INPUT_TYPE.markdown)
                                            if (this.isSelector(input)) {
                                                let e;
                                                e = input.type === T.TEMPLATE_INPUT_TYPE.singleTab ? input.selections : this.tabsToSelectionList(input.tabs);
                                                for (const n of e) n.selected && (input.type === T.TEMPLATE_INPUT_TYPE.multiTab || input.multi_select && input.type === T.TEMPLATE_INPUT_TYPE.singleTab ? Array.isArray(t[input.id]) ? t[input.id].push(n.id) : t[input.id] = [n.id] : t[input.id] = n.id)
                                            } else input.answer && void 0 !== input.verifierName ? (t[input.id] = input.answer, t[input.id + R.h] = input.verifierType, t[input.id + R.g] = input.verifierName, t[input.id + R.e] = input.verifierContact, t[input.id + R.f] = input.verifiedDate, void 0 !== input.eventId && (t[input.id + R.a] = input.eventId)) : input.answer && !Object(k.d)(input.answer) && (t[input.id] = input.answer);
                            return this.spicesModel && (t.spices = !0), this.pdrModel && (t.plan_do_review = !0), t
                        },
                        tabsToSelectionList: e => [].concat(...e.map(e => e.selections)),
                        addUpload(e) {
                            this.uploads.push(e)
                        },
                        removeUpload(e) {
                            this.uploads = this.uploads.filter(t => t.key !== e)
                        }
                    },
                    watch: {
                        hasUploadedFilesChanged() {
                            this.hasChanged = !0
                        }
                    }
                }),
                L = (n(942), n(9)),
                component = Object(L.a)(P, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", [t(c.a, {
                        ref: "form",
                        staticClass: "BaseRequirements",
                        model: {
                            value: e.valid,
                            callback: function(t) {
                                e.valid = t
                            },
                            expression: "valid"
                        }
                    }, [t("section", {
                        staticClass: "BaseRequirements__main"
                    }, [e.$nuxt.isOffline || !e.isReviewing ? t("section", {
                        staticClass: "BaseRequirements__header"
                    }, [t("div", {
                        directives: [{
                            name: "show",
                            rawName: "v-show",
                            value: e.titleText(),
                            expression: "titleText()"
                        }],
                        staticClass: "BaseRequirements__title"
                    }, [e._v("\n          " + e._s(e.titleText()) + "\n        ")]), e._v(" "), e.subtitleText() ? t("div", {
                        staticClass: "BaseRequirements__subtitle"
                    }, [e._v("\n          " + e._s(e.subtitleText()) + "\n          "), t("hr")]) : e._e()]) : e._e(), e._v(" "), e.draft ? e._t("info-card") : e._e(), e._v(" "), e._t("default"), e._v(" "), 1 === e.populatedSteps.length ? [e._l(e.populatedSteps[0].input_groups, (function(n, i) {
                        return [t("TemplateGroup", {
                            key: i,
                            attrs: {
                                "remove-verified-func": e.removeVerifiedFunc,
                                "add-upload-func": e.addUpload,
                                "remove-upload-func": e.removeUpload,
                                "on-selection-change": e.selectionChange,
                                "input-group": n,
                                "flat-layout": e.isFlatLayout,
                                "condensed-layout": e.isCondensedLayout,
                                "disabled-oas": !e.verifiedStatementsComplete,
                                disabled: e.isCondensedLayout || e.disabledInputs,
                                "disabled-ids": e.disabledIds,
                                "initial-uploads": e.initialUploads
                            }
                        }), e._v(" "), e.isCondensedLayout ? t("hr", {
                            key: i + "-divider",
                            staticClass: "mt-4"
                        }) : e._e()]
                    })), e._v(" "), e.$props.pdrLabel ? t("PlanDoReview", {
                        attrs: {
                            "on-change": e.pdrChange,
                            label: e.$props.pdrLabel,
                            "flat-layout": e.isFlatLayout,
                            "condensed-layout": e.isCondensedLayout,
                            disabled: e.isCondensedLayout || e.disabledInputs,
                            "initial-state": !!e.initialAnswers.plan_do_review
                        }
                    }) : e._e(), e._v(" "), e.$props.spicesLabel ? t("Spices", {
                        attrs: {
                            "on-change": e.spicesChange,
                            label: e.$props.spicesLabel,
                            "flat-layout": e.isFlatLayout,
                            "condensed-layout": e.isCondensedLayout,
                            disabled: e.isCondensedLayout || e.disabledInputs,
                            "initial-state": !!e.initialAnswers.spices
                        }
                    }) : e._e()] : e._e(), e._v(" "), e.populatedSteps.length > 1 && !e.isCondensedLayout ? t(m.a, {
                        staticClass: "elevation-0",
                        model: {
                            value: e.currentStep,
                            callback: function(t) {
                                e.currentStep = t
                            },
                            expression: "currentStep"
                        }
                    }, [t(_.a, [e._l(e.populatedSteps, (function(r, i) {
                        return [t(f.a, {
                            key: i + "-step",
                            style: {
                                backgroundImage: "url(" + n(903)("./" + e.ICON_PENCIL) + ")"
                            },
                            attrs: {
                                complete: i + 1 < e.currentStep,
                                step: i + 1,
                                editable: i + 1 < e.currentStep,
                                "edit-icon": ""
                            }
                        }, [e._v("\n              " + e._s(r.title) + "\n            ")]), e._v(" "), i + 1 !== e.populatedSteps.length ? t(l.a, {
                            key: i + 1 + "-stepper-divider"
                        }) : e._e()]
                    }))], 2), e._v(" "), t(_.b, e._l(e.populatedSteps, (function(n, i) {
                        return t(v.a, {
                            key: i + "-content",
                            style: "transform-origin: center top 0px; " + (i === e.currentStep - 1 ? "display: block;" : "display: none;"),
                            attrs: {
                                step: i + 1,
                                complete: i + 1 < e.currentStep
                            }
                        }, [n.title ? t("div", {
                            staticClass: "BaseRequirements__title"
                        }, [e._v("\n              " + e._s(n.title) + "\n            ")]) : e._e(), e._v(" "), e.currentStep === i + 1 ? [e._l(n.input_groups, (function(n, r) {
                            return [t("TemplateGroup", {
                                key: r,
                                attrs: {
                                    "input-group": n,
                                    "flat-layout": e.isFlatLayout,
                                    "condensed-layout": e.isCondensedLayout,
                                    disabled: e.isCondensedLayout || e.disabledInputs,
                                    "initial-uploads": e.initialUploads,
                                    "add-upload-func": e.addUpload,
                                    "remove-upload-func": e.removeUpload
                                }
                            }), e._v(" "), e.isCondensedLayout ? t("hr", {
                                key: `${i}-${r}-inputgroup-divider`,
                                staticClass: "my-0"
                            }) : e._e()]
                        }))] : e._e()], 2)
                    })), 1)], 1) : e._e(), e._v(" "), e.populatedSteps.length > 1 && e.isCondensedLayout ? [e._l(e.populatedSteps, (function(l, i) {
                        return [l.title ? t("div", {
                            key: i + "-title",
                            staticClass: "BaseRequirements__title BaseRequirements__title--confirmation"
                        }, [t(d.a, [t(o.a, [t("span", [e._v(e._s(i + 1) + ". " + e._s(l.title))])]), e._v(" "), e.draft ? t(o.a, {
                            attrs: {
                                cols: "auto"
                            },
                            on: {
                                click: () => e.toStep(i + 1)
                            }
                        }, [e.$vuetify.breakpoint.smAndUp ? t(r.a, {
                            attrs: {
                                outlined: "",
                                small: ""
                            }
                        }, [e._v("\n                  " + e._s(e.LABEL.EDIT) + "\n                ")]) : t("a", [t("img", {
                            staticClass: "BaseRequirements__svg-edit",
                            attrs: {
                                src: n(903)("./" + e.ICON_PENCIL),
                                alt: "edit"
                            }
                        })])], 1) : e._e()], 1)], 1) : e._e(), e._v(" "), e._l(l.input_groups, (function(n, r) {
                            return [t("TemplateGroup", {
                                key: `${i}-${r}-group`,
                                attrs: {
                                    "input-group": n,
                                    "flat-layout": e.isFlatLayout,
                                    "condensed-layout": e.isCondensedLayout,
                                    disabled: e.isCondensedLayout || e.disabledInputs,
                                    "disabled-ids": e.disabledIds,
                                    "initial-uploads": e.initialUploads,
                                    "add-upload-func": e.addUpload,
                                    "remove-upload-func": e.removeUpload
                                }
                            }), e._v(" "), e.isCondensedLayout ? t("hr", {
                                key: `${i}-${r}-confirm-divider`,
                                staticClass: "my-0 mb-4"
                            }) : e._e()]
                        }))]
                    }))] : e._e(), e._v(" "), e.isMilestone && (e.draft && e.readyToSubmit || !e.draft) ? t("div", [t("h3", {
                        staticClass: "BaseRequirements__milestone-title mt-4 mb-12"
                    }, [e._v("Activities Completed")]), e._v(" "), t("h3", {
                        staticClass: "BaseRequirements__milestone-title mb-3"
                    }, [e._v("Participate")]), e._v(" "), t("div", {
                        staticClass: "mb-4"
                    }, [e._v("Participate in " + e._s(e.requiredMilestoneCredits) + " activities from each Challenge Area.")]), e._v(" "), t("MilestonesParticipatesSummary", {
                        attrs: {
                            "event-data": e.$accessor.milestones.getCurrentMilestoneEvents,
                            "import-data": e.$accessor.milestones.current.imported,
                            "challenge-area": e.CHALLENGE_AREAS_TYPES.COMMUNITY,
                            "required-credits": e.requiredMilestoneCredits
                        }
                    }), e._v(" "), t("MilestonesParticipatesSummary", {
                        attrs: {
                            "event-data": e.$accessor.milestones.getCurrentMilestoneEvents,
                            "import-data": e.$accessor.milestones.current.imported,
                            "challenge-area": e.CHALLENGE_AREAS_TYPES.OUTDOORS,
                            "required-credits": e.requiredMilestoneCredits
                        }
                    }), e._v(" "), t("MilestonesParticipatesSummary", {
                        attrs: {
                            "event-data": e.$accessor.milestones.getCurrentMilestoneEvents,
                            "import-data": e.$accessor.milestones.current.imported,
                            "challenge-area": e.CHALLENGE_AREAS_TYPES.CREATIVE,
                            "required-credits": e.requiredMilestoneCredits
                        }
                    }), e._v(" "), t("MilestonesParticipatesSummary", {
                        attrs: {
                            "event-data": e.$accessor.milestones.getCurrentMilestoneEvents,
                            "import-data": e.$accessor.milestones.current.imported,
                            "challenge-area": e.CHALLENGE_AREAS_TYPES.PERSONAL_GROWTH,
                            "required-credits": e.requiredMilestoneCredits
                        }
                    }), e._v(" "), t("MilestonesAssistLeadSummary", {
                        attrs: {
                            answers: e.initialAnswers,
                            "event-data": e.$accessor.milestones.getCurrentMilestoneEvents,
                            "import-data": e.$accessor.milestones.current.imported,
                            subtitle: `(${e.maxAssists} activities or more across 2 Challenge Areas)`,
                            title: "Assist",
                            type: "assist",
                            "credit-type": "assistant"
                        }
                    }), e._v(" "), t("MilestonesAssistLeadSummary", {
                        attrs: {
                            answers: e.initialAnswers,
                            "event-data": e.$accessor.milestones.getCurrentMilestoneEvents,
                            "import-data": e.$accessor.milestones.current.imported,
                            subtitle: `(${e.maxLeads} ${e.maxLeads>1?"activities":"activity"} from any Challenge Area)`,
                            title: "Lead",
                            type: "lead",
                            "credit-type": "leader"
                        }
                    })], 1) : e._e()], 2), e._v(" "), t("section", {
                        staticClass: "BaseRequirements__buttons mt-5"
                    }, [e.isOas && e.draft && !e.isReviewing ? [e.$nuxt.isOnline ? t(r.a, {
                        attrs: {
                            outlined: "",
                            small: "",
                            "data-cy": "qa-btn-cancel",
                            disabled: e.isLoading
                        },
                        on: {
                            click: function(t) {
                                return e.cancel()
                            }
                        }
                    }, [e._v("\n          " + e._s(e.LABEL.CANCEL) + "\n        ")]) : e._e(), e._v(" "), e.$nuxt.isOffline ? t(r.a, {
                        attrs: {
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(t) {
                                return e.exit()
                            }
                        }
                    }, [e._v("\n          " + e._s(e.LABEL.EXIT) + "\n        ")]) : e._e(), e._v(" "), e.isYouthMember ? t(r.a, {
                        attrs: {
                            disabled: e.$nuxt.isOffline || e.hasUnverifiedChanges || e.isLoading,
                            outlined: "",
                            small: "",
                            loading: e.isLoading
                        },
                        on: {
                            click: function(t) {
                                return e.saveAndExit()
                            }
                        }
                    }, [e._v("\n          " + e._s(e.LABEL.SAVE_EXIT) + "\n        ")]) : e._e(), e._v(" "), e.showSumbissionDetailsButton ? t(r.a, {
                        staticClass: "ml-4 mb-4",
                        attrs: {
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(t) {
                                e.showSubmissionDetails = !0
                            }
                        }
                    }, [e._v("\n          " + e._s(e.LABEL.SUBMISSION_INFO) + "\n        ")]) : e._e(), e._v(" "), e.isYouthMember ? t(r.a, {
                        staticClass: "float-right BaseRequirements__btn-submit-stage",
                        attrs: {
                            "data-cy": "qa-btn-submit-stage",
                            color: "primary",
                            disabled: e.$nuxt.isOffline || !e.answersComplete || e.isLoading || e.submitting,
                            small: "",
                            loading: e.isLoading
                        },
                        on: {
                            click: function(t) {
                                return e.submit()
                            }
                        }
                    }, [e._v("\n          " + e._s(e.LABEL.SUBMIT_STAGE) + "\n        ")]) : e._e(), e._v(" "), e.isYouthMember ? t(r.a, {
                        staticClass: "float-right",
                        attrs: {
                            "data-cy": "qa-btn-add-verifier",
                            color: "primary",
                            small: "",
                            loading: e.isLoading,
                            disabled: e.$nuxt.isOffline || !e.hasUnverifiedChanges || e.isLoading
                        },
                        on: {
                            click: function(t) {
                                return e.modalFunction()
                            }
                        }
                    }, [e._v("\n          " + e._s(e.LABEL.ADD_VERIFIER) + "\n        ")]) : e._e()] : e.draft && !e.isReviewing ? [!e.isYouthMember || e.canCancel ? t(r.a, {
                        attrs: {
                            outlined: "",
                            small: "",
                            disabled: e.isLoading
                        },
                        on: {
                            click: function(t) {
                                return e.cancel()
                            }
                        }
                    }, [e._v("\n          " + e._s(e.LABEL.CANCEL) + "\n        ")]) : e.$nuxt.isOffline ? t(r.a, {
                        attrs: {
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(t) {
                                return e.exit()
                            }
                        }
                    }, [e._v("\n          " + e._s(e.LABEL.EXIT) + "\n        ")]) : e._e(), e._v(" "), e.currentStep > 1 || e.confirmationMode ? t(r.a, {
                        attrs: {
                            outlined: "",
                            small: "",
                            disabled: e.isLoading
                        },
                        on: {
                            click: () => e.confirmationMode ? e.toStep(e.populatedSteps.length) : e.toStep(e.currentStep - 1)
                        }
                    }, [e._v("\n          " + e._s(e.LABEL.PREVIOUS) + "\n        ")]) : e._e(), e._v(" "), e.showSumbissionDetailsButton ? t(r.a, {
                        staticClass: "ml-4 mb-4",
                        attrs: {
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(t) {
                                e.showSubmissionDetails = !0
                            }
                        }
                    }, [e._v("\n          " + e._s(e.LABEL.SUBMISSION_INFO) + "\n        ")]) : e._e(), e._v(" "), e.currentStep === e.populatedSteps.length || e.confirmationMode ? [e.isYouthMember ? t(r.a, {
                        attrs: {
                            disabled: e.$nuxt.isOffline,
                            outlined: "",
                            small: "",
                            "data-cy": "qa-btn-exit",
                            loading: e.isLoading
                        },
                        on: {
                            click: function(t) {
                                return e.saveAndExit()
                            }
                        }
                    }, [e._v("\n            " + e._s(e.LABEL.SAVE_EXIT) + "\n          ")]) : e._e(), e._v(" "), e.isYouthMember && e.readyToSubmit ? t(r.a, {
                        staticClass: "float-right",
                        attrs: {
                            disabled: e.$nuxt.isOffline || e.isMilestone && !e.canReviewMilestone,
                            color: "primary",
                            "data-cy": "qa-btn-submit",
                            small: "",
                            loading: e.isLoading
                        },
                        on: {
                            click: function(t) {
                                return e.submit()
                            }
                        }
                    }, [e._v("\n            " + e._s(e.submitText) + "\n          ")]) : e.isYouthMember ? t(r.a, {
                        staticClass: "float-right",
                        attrs: {
                            disabled: e.$nuxt.isOffline,
                            color: "primary",
                            "data-cy": "qa-btn-save",
                            small: "",
                            loading: e.isLoading
                        },
                        on: {
                            click: function(t) {
                                return e.toggleConfirmation()
                            }
                        }
                    }, [e._v("\n            " + e._s(e.LABEL.SAVE_CONTINUE) + "\n          ")]) : e._e()] : [e.isYouthMember ? t(r.a, {
                        staticClass: "mr-4",
                        attrs: {
                            disabled: e.$nuxt.isOffline,
                            outlined: "",
                            small: "",
                            "data-cy": "qa-btn-exit",
                            loading: e.isLoading
                        },
                        on: {
                            click: function(t) {
                                return e.saveAndExit()
                            }
                        }
                    }, [e._v("\n            " + e._s(e.LABEL.SAVE_EXIT) + "\n          ")]) : e._e(), e._v(" "), e.isYouthMember ? t(r.a, {
                        staticClass: "float-right",
                        attrs: {
                            disabled: e.$nuxt.isOffline || !e.valid,
                            color: "primary",
                            "data-cy": "qa-btn-save",
                            small: "",
                            loading: e.isLoading
                        },
                        on: {
                            click: function(t) {
                                return e.toStep(e.currentStep + 1, !0)
                            }
                        }
                    }, [e._v("\n            " + e._s(e.LABEL.SAVE_CONTINUE) + "\n          ")]) : e._e()]] : e._e(), e._v(" "), e.draft || e.isReviewing ? e._e() : [t(r.a, {
                        staticClass: "mr-4",
                        attrs: {
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(t) {
                                return e.exit()
                            }
                        }
                    }, [e._v(e._s(e.LABEL.BACK))]), e._v(" "), e.resetModal ? t(r.a, {
                        staticClass: "mr-4",
                        attrs: {
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(t) {
                                return e.reset()
                            }
                        }
                    }, [e._v(e._s(e.LABEL.RESET))]) : e._e(), e._v(" "), e.showSumbissionDetailsButton ? t(r.a, {
                        staticClass: "ml-4 mb-4",
                        attrs: {
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(t) {
                                e.showSubmissionDetails = !0
                            }
                        }
                    }, [e._v("\n          " + e._s(e.LABEL.SUBMISSION_INFO) + "\n        ")]) : e._e()]], 2)]), e._v(" "), t("InformationDialog", {
                        attrs: {
                            model: e.showSubmissionDetails,
                            title: "Submission Details",
                            "max-width": "800px !important",
                            persistent: !1,
                            "close-button-label": "close",
                            "close-dialog": () => e.showSubmissionDetails = !1
                        }
                    }, [t("div", {
                        attrs: {
                            slot: "content"
                        },
                        slot: "content"
                    }, [e.latestSubmission ? t("SubmissionInformation", {
                        attrs: {
                            "unit-id": e.latestSubmission.unit_id,
                            "submission-id": e.latestSubmission.submission_id
                        }
                    }) : e._e()], 1)])], 1)
                }), [], !1, null, "81d1b748", null);
            t.default = component.exports;
            installComponents(component, {
                TemplateGroup: n(939).default,
                MilestonesParticipatesSummary: n(940).default,
                MilestonesAssistLeadSummary: n(941).default,
                SubmissionInformation: n(925).default,
                InformationDialog: n(219).default
            })
        },
        917: function(e, t, n) {
            var map = {
                "./achievements-empty.svg": 565,
                "./additional-award-badges/camper_award_10.svg": 597,
                "./additional-award-badges/camper_award_100.svg": 598,
                "./additional-award-badges/camper_award_25.svg": 599,
                "./additional-award-badges/camper_award_50.svg": 600,
                "./additional-award-badges/camper_award_75.svg": 601,
                "./additional-award-badges/champions_for_nature.svg": 602,
                "./additional-award-badges/duke_of_edinburgh_bronze.svg": 603,
                "./additional-award-badges/duke_of_edinburgh_gold.svg": 604,
                "./additional-award-badges/duke_of_edinburgh_silver.svg": 605,
                "./additional-award-badges/first_aid.svg": 606,
                "./additional-award-badges/international_ambassador.svg": 607,
                "./additional-award-badges/landcare.svg": 608,
                "./additional-award-badges/language_emblem.svg": 609,
                "./additional-award-badges/mental_health.svg": 610,
                "./additional-award-badges/messengers_of_peace.svg": 611,
                "./additional-award-badges/scout_wings.svg": 612,
                "./additional-award-badges/scouts_for_sdgs.svg": 613,
                "./additional-award-badges/scouts_go_solar.svg": 614,
                "./additional-award-badges/scouts_of_the_world.svg": 615,
                "./additional-award-badges/ses.svg": 616,
                "./additional-award-badges/their_service_our_heritage.svg": 617,
                "./additional-award-badges/tide_turners_plastic.svg": 618,
                "./additional-award-badges/walkabout_10.svg": 619,
                "./additional-award-badges/walkabout_100.svg": 620,
                "./additional-award-badges/walkabout_150.svg": 621,
                "./additional-award-badges/walkabout_200.svg": 622,
                "./additional-award-badges/walkabout_300.svg": 623,
                "./additional-award-badges/walkabout_400.svg": 624,
                "./additional-award-badges/walkabout_50.svg": 625,
                "./additional-award-badges/walkabout_500.svg": 626,
                "./additional-award-badges/world_scout_environment_badge.svg": 627,
                "./additional-award-badges/youth_helper.svg": 628,
                "./adventurous-journey--overview.svg": 629,
                "./adventurous-journey--side.svg": 630,
                "./cub-basecamp/cub-basecamp-aj.svg": 631,
                "./cub-basecamp/cub-basecamp-oas.svg": 632,
                "./cub-basecamp/cub-basecamp-patrol.svg": 633,
                "./cub-basecamp/cub-basecamp-pd.svg": 634,
                "./cub-basecamp/cub-basecamp-pe.svg": 635,
                "./cub-basecamp/cub-basecamp-peak.svg": 636,
                "./cub-basecamp/cub-basecamp-pr.svg": 637,
                "./cub-basecamp/cub-basecamp-sia.svg": 638,
                "./error/error--307.svg": 456,
                "./error/error--404.svg": 452,
                "./error/error--500.svg": 453,
                "./error/error--data-import.svg": 454,
                "./error/error--no-unit.svg": 455,
                "./intro-scouting--overview.svg": 639,
                "./intro-scouting--plan-do-review.svg": 640,
                "./intro-scouting--side.svg": 641,
                "./intro-scouting--spices.svg": 642,
                "./intro-section/cub--overview.svg": 643,
                "./intro-section/intro-section--side.svg": 644,
                "./intro-section/joey--overview.svg": 645,
                "./intro-section/rover--overview.svg": 646,
                "./intro-section/scout--overview.svg": 647,
                "./intro-section/venturer--overview.svg": 648,
                "./joey-basecamp/joey-basecamp-aj.svg": 649,
                "./joey-basecamp/joey-basecamp-oas.svg": 650,
                "./joey-basecamp/joey-basecamp-patrol.svg": 651,
                "./joey-basecamp/joey-basecamp-pd.svg": 652,
                "./joey-basecamp/joey-basecamp-pe.svg": 653,
                "./joey-basecamp/joey-basecamp-peak.svg": 654,
                "./joey-basecamp/joey-basecamp-pr.svg": 655,
                "./joey-basecamp/joey-basecamp-sia.svg": 656,
                "./leaders-basecamp/leaders-approvals.svg": 657,
                "./leaders-basecamp/leaders-branchlife.svg": 658,
                "./leaders-basecamp/leaders-grouplife.svg": 659,
                "./leaders-basecamp/leaders-members.svg": 660,
                "./leaders-basecamp/leaders-programming.svg": 661,
                "./leaders-basecamp/leaders-resources.svg": 662,
                "./leaders-basecamp/leaders-youthbasecamp.svg": 663,
                "./logbook--welcome.svg": 664,
                "./milestones-challenge-areas.svg": 665,
                "./milestones/cub/milestone-1-inactive.svg": 567,
                "./milestones/cub/milestone-1.svg": 568,
                "./milestones/cub/milestone-2-inactive.svg": 569,
                "./milestones/cub/milestone-2.svg": 570,
                "./milestones/cub/milestone-3-inactive.svg": 571,
                "./milestones/cub/milestone-3.svg": 572,
                "./milestones/joey/milestone-1-inactive.svg": 573,
                "./milestones/joey/milestone-1.svg": 574,
                "./milestones/joey/milestone-2-inactive.svg": 575,
                "./milestones/joey/milestone-2.svg": 576,
                "./milestones/joey/milestone-3-inactive.svg": 577,
                "./milestones/joey/milestone-3.svg": 578,
                "./milestones/rover/milestone-1-inactive.svg": 579,
                "./milestones/rover/milestone-1.svg": 580,
                "./milestones/rover/milestone-2-inactive.svg": 581,
                "./milestones/rover/milestone-2.svg": 582,
                "./milestones/rover/milestone-3-inactive.svg": 583,
                "./milestones/rover/milestone-3.svg": 584,
                "./milestones/scout/milestone-1-inactive.svg": 585,
                "./milestones/scout/milestone-1.svg": 586,
                "./milestones/scout/milestone-2-inactive.svg": 587,
                "./milestones/scout/milestone-2.svg": 588,
                "./milestones/scout/milestone-3-inactive.svg": 589,
                "./milestones/scout/milestone-3.svg": 590,
                "./milestones/venturer/milestone-1-inactive.svg": 591,
                "./milestones/venturer/milestone-1.svg": 592,
                "./milestones/venturer/milestone-2-inactive.svg": 593,
                "./milestones/venturer/milestone-2.svg": 594,
                "./milestones/venturer/milestone-3-inactive.svg": 595,
                "./milestones/venturer/milestone-3.svg": 596,
                "./oas--side.svg": 666,
                "./oas--welcome.svg": 667,
                "./personal-development--overview.svg": 668,
                "./personal-development--side.svg": 669,
                "./programming--overview.svg": 670,
                "./risk-identification/environment-risk.svg": 671,
                "./risk-identification/equipment-risk.svg": 672,
                "./risk-identification/human-risk.svg": 673,
                "./risk-identification/risk-accept.svg": 674,
                "./risk-identification/risk-avoid.svg": 675,
                "./risk-identification/risk-reduce.svg": 676,
                "./risk-identification/risk-transfer.svg": 677,
                "./rover-basecamp/rover-basecamp-aj.svg": 678,
                "./rover-basecamp/rover-basecamp-oas.svg": 679,
                "./rover-basecamp/rover-basecamp-patrol.svg": 680,
                "./rover-basecamp/rover-basecamp-pd.svg": 681,
                "./rover-basecamp/rover-basecamp-pe.svg": 682,
                "./rover-basecamp/rover-basecamp-peak.svg": 683,
                "./rover-basecamp/rover-basecamp-pr.svg": 684,
                "./rover-basecamp/rover-basecamp-sia.svg": 685,
                "./scout-basecamp/scout-basecamp-aj.svg": 686,
                "./scout-basecamp/scout-basecamp-oas.svg": 687,
                "./scout-basecamp/scout-basecamp-patrol.svg": 688,
                "./scout-basecamp/scout-basecamp-pd.svg": 689,
                "./scout-basecamp/scout-basecamp-pe.svg": 690,
                "./scout-basecamp/scout-basecamp-peak.svg": 691,
                "./scout-basecamp/scout-basecamp-pr.svg": 692,
                "./scout-basecamp/scout-basecamp-sia.svg": 693,
                "./sia--overview.svg": 694,
                "./sia--side.svg": 695,
                "./sia--welcome.svg": 696,
                "./system-admin/access.svg": 697,
                "./system-admin/finduser.svg": 698,
                "./venturer-basecamp/venturer-basecamp-aj.svg": 699,
                "./venturer-basecamp/venturer-basecamp-oas.svg": 700,
                "./venturer-basecamp/venturer-basecamp-patrol.svg": 701,
                "./venturer-basecamp/venturer-basecamp-pd.svg": 702,
                "./venturer-basecamp/venturer-basecamp-pe.svg": 703,
                "./venturer-basecamp/venturer-basecamp-peak.svg": 704,
                "./venturer-basecamp/venturer-basecamp-pr.svg": 705,
                "./venturer-basecamp/venturer-basecamp-sia.svg": 706
            };

            function r(e) {
                var t = o(e);
                return n(t)
            }

            function o(e) {
                if (!n.o(map, e)) {
                    var t = new Error("Cannot find module '" + e + "'");
                    throw t.code = "MODULE_NOT_FOUND", t
                }
                return map[e]
            }
            r.keys = function() {
                return Object.keys(map)
            }, r.resolve = o, e.exports = r, r.id = 917
        },
        918: function(e, t, n) {
            e.exports = {}
        },
        919: function(e, t, n) {
            e.exports = {}
        },
        920: function(e, t, n) {
            e.exports = {}
        },
        921: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(870),
                o = n(62),
                l = n(948),
                c = n(1432),
                d = n(1197),
                m = n(1036),
                v = n(171),
                _ = (n(947), n(87)),
                f = n(907),
                h = _.a.extend({
                    components: {
                        Vue2DatePicker: l.a
                    },
                    props: {
                        cypress: {
                            type: String,
                            default: null
                        },
                        label: {
                            type: String
                        },
                        dateRange: {
                            type: String
                        },
                        dateRangeMin: {
                            type: Boolean
                        },
                        dateRangeMax: {
                            type: Boolean
                        },
                        initialDate: {
                            type: String,
                            default: ""
                        },
                        disabled: {
                            type: Boolean
                        },
                        rules: {
                            type: String,
                            default: ""
                        }
                    },
                    data: () => ({
                        date: new Date,
                        placeholder: "DD/MM/YYYY",
                        isReady: !1,
                        open: !1
                    }),
                    watch: {
                        date() {
                            this.$data.isReady && this.$emit("dateChange", this.parseDate(this.date))
                        }
                    },
                    created() {
                        if (this.date = this.initialDate ? new Date(this.initialDate) : "", this.placeholder = this.initialDate ? this.formatDate(this.initialDate) : this.placeholder, this.dateRangeMin && this.dateRangeMax) throw new Error("Use only a min or max date range.");
                        this.isReady = !0
                    },
                    computed: {
                        isDateSelected() {
                            return !!this.date
                        }
                    },
                    methods: {
                        rulesFromString: f.a,
                        cancel() {
                            this.open = !1
                        },
                        disabledDateRange(e) {
                            let t = 0;
                            return this.dateRangeMin ? t = Object(c.a)(e, Object(d.a)(this.dateRange)) : this.dateRangeMax && (t = Object(m.a)(e, Object(d.a)(this.dateRange))), 1 === t
                        },
                        parseDate: e => e ? Object(v.a)(new Date(e), "yyyy-MM-dd") : null
                    }
                }),
                y = (n(923), n(9)),
                component = Object(y.a)(h, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", {
                        staticClass: "DatePicker",
                        class: {
                            disabled: e.disabled
                        }
                    }, [t("Icon", {
                        staticClass: "DatePicker__icon",
                        attrs: {
                            outline: "",
                            name: "calendar"
                        }
                    }), e._v(" "), e.label ? t("div", {
                        staticClass: "DatePicker__label"
                    }, [e._v(e._s(e.label))]) : e._e(), e._v(" "), t("Vue2DatePicker", {
                        staticClass: "DatePicker__date-picker",
                        attrs: {
                            open: e.open,
                            clearable: !1,
                            disabled: e.disabled,
                            placeholder: e.placeholder,
                            format: "DD/MM/YYYY",
                            "disabled-date": e.disabledDateRange
                        },
                        on: {
                            "update:open": function(t) {
                                e.open = t
                            }
                        },
                        scopedSlots: e._u([{
                            key: "footer",
                            fn: function() {
                                return [t(r.a, {
                                    staticClass: "DatePicker__btn-cancel",
                                    attrs: {
                                        small: "",
                                        outlined: "",
                                        type: "button"
                                    },
                                    on: {
                                        keydown: function(t) {
                                            return !t.type.indexOf("key") && e._k(t.keyCode, "enter", 13, t.key, "Enter") ? null : e.cancel.apply(null, arguments)
                                        },
                                        click: e.cancel
                                    }
                                }, [e._v("\n        Cancel\n      ")])]
                            },
                            proxy: !0
                        }]),
                        model: {
                            value: e.date,
                            callback: function(t) {
                                e.date = t
                            },
                            expression: "date"
                        }
                    }), e._v(" "), e.rules ? [t(o.a, {
                        staticClass: "d-none",
                        attrs: {
                            value: e.isDateSelected,
                            rules: e.rulesFromString(e.rules)
                        }
                    })] : e._e()], 2)
                }), [], !1, null, null, null);
            t.default = component.exports;
            installComponents(component, {
                Icon: n(55).default
            })
        },
        922: function(e, t, n) {
            e.exports = {}
        },
        923: function(e, t, n) {
            "use strict";
            n(910)
        },
        924: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(236),
                o = n(132),
                l = n(241),
                c = n(33),
                d = n(62),
                m = n(1),
                v = n(907),
                _ = n(287),
                f = m.a.extend({
                    name: "TwoColumnSelectableList",
                    props: {
                        items: {
                            type: Array,
                            required: !0
                        },
                        enumerated: {
                            type: Boolean
                        },
                        iconSize: {
                            type: String,
                            default: "48px"
                        },
                        single: {
                            type: Boolean
                        },
                        disabled: {
                            type: Boolean
                        },
                        selectedCallback: {
                            type: Function,
                            default: null
                        },
                        rules: {
                            type: String,
                            default: ""
                        }
                    },
                    data: () => ({
                        ICONS: _
                    }),
                    computed: {
                        isSomethingSelected() {
                            return !!this.items.find(e => e.selected)
                        }
                    },
                    methods: {
                        rulesFromString: v.a,
                        selectItem(e) {
                            if (!this.disabled) {
                                if (!e.selected && this.single)
                                    for (let i = 0; i < this.items.length; i++) this.items[i].selected = !1;
                                return e.selected = !e.selected, this.selectedCallback ? this.selectedCallback(e) : void 0
                            }
                        },
                        fetchIcon(e, t) {
                            return n(707)(`./icons${this.ICONS.TEMPLATE_ASSETS_PATH}/${this.ICONS.TEMPLATE_ASSET_ICON_NAMES[e]}${this.disabled||!t?this.ICONS.UNSELECTED_SUFFIX:this.ICONS.SELECTED_SUFFIX}.svg`)
                        }
                    }
                }),
                h = (n(926), n(9)),
                component = Object(h.a)(f, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", {
                        class: "TwoColumnSelectableList" + (e.disabled ? " disabled" : "")
                    }, [e._l(e.disabled ? e.items.filter(e => e.selected) : e.items, (function(n, i) {
                        return t(r.a, {
                            key: i,
                            staticClass: "TwoColumnSelectableList__card",
                            class: {
                                "--selected": n.selected
                            },
                            attrs: {
                                flat: ""
                            },
                            on: {
                                click: function(t) {
                                    return t.stopPropagation(), e.selectItem(n)
                                }
                            }
                        }, [t(o.a, [t(l.a, {
                            attrs: {
                                size: e.iconSize,
                                tile: ""
                            }
                        }, [t("img", {
                            directives: [{
                                name: "show",
                                rawName: "v-show",
                                value: n.selected,
                                expression: "item.selected"
                            }],
                            attrs: {
                                alt: n.title,
                                src: e.fetchIcon(n.asset, !0)
                            }
                        }), e._v(" "), t("img", {
                            directives: [{
                                name: "show",
                                rawName: "v-show",
                                value: !n.selected,
                                expression: "!item.selected"
                            }],
                            attrs: {
                                alt: n.title,
                                src: e.fetchIcon(n.asset, !1)
                            }
                        })]), e._v(" "), t(c.a, [t(c.b, [e._v(e._s(e.enumerated ? i + ". " : "") + e._s(n.title))])], 1)], 1)], 1)
                    })), e._v(" "), e.rules ? [t(d.a, {
                        staticClass: "d-none",
                        attrs: {
                            value: e.isSomethingSelected,
                            rules: e.rulesFromString(e.rules)
                        }
                    })] : e._e()], 2)
                }), [], !1, null, "7eb8e8c4", null);
            t.default = component.exports
        },
        925: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(886),
                o = n(1439),
                l = n(885),
                c = n(11),
                d = n.n(c),
                m = n(171),
                v = n(40),
                _ = n(4);
            const f = n(23);
            var h = v.c.extend({
                    name: "SubmissionsResponses",
                    props: {
                        unitId: {
                            type: String,
                            required: !0
                        },
                        submissionId: {
                            type: String,
                            required: !0
                        }
                    },
                    data: () => ({
                        isFinalised: !1,
                        tableKey: "submission-responses",
                        submissionHeaders: [{
                            text: "Reviewed by",
                            value: "name"
                        }, {
                            text: "Date",
                            value: "date"
                        }, {
                            text: "Response",
                            value: "response"
                        }, {
                            text: "Comment",
                            value: "comment"
                        }],
                        submissionData: [{}]
                    }),
                    beforeMount() {
                        this.getSubmissionData()
                    },
                    methods: {
                        getSubmissionData() {
                            this.handleRequest({
                                axiosRequest: d.a.get,
                                url: `${this.$config.api.achievements}${_.UNITS_PATH}/${this.unitId}${_.SUBMISSIONS_PATH}/${this.submissionId}`,
                                successResponseCode: f.OK,
                                responseHandler: e => {
                                    this.transformSubmissionData(e.data.submission)
                                }
                            })
                        },
                        transformSubmissionData(e) {
                            this.submissionData = e.actioned_by.map(e => ({
                                name: `${e.member_first_name} ${e.member_last_name}`,
                                date: Object(m.a)(new Date(e.time), "yyyy-MM-dd"),
                                response: e.outcome.toUpperCase(),
                                comment: e.comment
                            })), this.isFinalised = "finalised" === e.status
                        }
                    }
                }),
                y = n(9),
                component = Object(y.a)(h, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", [t(l.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(r.a, [t(o.a, {
                        key: e.tableKey,
                        attrs: {
                            headers: e.submissionHeaders,
                            items: e.submissionData,
                            "hide-default-footer": ""
                        }
                    })], 1)], 1), e._v(" "), e.isFinalised ? e._e() : t("div", {
                        staticClass: "mt-8"
                    }, [t("p", [e._v("This achievement will remain read-only until either:")]), e._v(" "), e._m(0), e._v(" "), t("p", [e._v("or")]), e._v(" "), e._m(1)])], 1)
                }), [function() {
                    var e = this._self._c;
                    this._self._setupProxy;
                    return e("ul", [e("li", [this._v("Two members of the unit council approve the submission")])])
                }, function() {
                    var e = this._self._c;
                    this._self._setupProxy;
                    return e("ul", [e("li", [this._v("Two members of the unit council request changes")])])
                }], !1, null, null, null);
            t.default = component.exports
        },
        926: function(e, t, n) {
            "use strict";
            n(913)
        },
        927: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(886),
                o = n(1206),
                l = n(885),
                c = n(11),
                d = n.n(c),
                m = n(4),
                v = n(55),
                _ = n(79),
                f = n(5),
                h = n(220);
            var y = h.a.extend({
                    name: "FileUploader",
                    components: {
                        Icon: v.default,
                        ConfirmationDialog: _.default
                    },
                    props: {
                        addUploadFunc: {
                            type: Function,
                            default: null
                        },
                        removeUploadFunc: {
                            type: Function,
                            default: null
                        },
                        disabled: {
                            type: Boolean
                        },
                        input: {
                            type: Object,
                            required: !0
                        },
                        initialUploads: {
                            type: Array,
                            required: !0
                        },
                        uploadUrl: {
                            type: String,
                            default: null
                        },
                        reduceGutter: {
                            type: Boolean,
                            default: !1
                        }
                    },
                    data: () => ({
                        uploads: [],
                        model: null,
                        answer: [],
                        dialog: !1,
                        toBeDeleted: null,
                        LABEL: f.i,
                        firstLoad: !0
                    }),
                    computed: {
                        counterString() {
                            return this.uploads.length + " files"
                        },
                        getUploadUrl() {
                            return this.uploadUrl ? this.uploadUrl : `${this.$config.api.achievements}${m.MEMBERS_PATH}/${this.$accessor.user.getUserId}${m.UPLOADS_PATH}`
                        }
                    },
                    watch: {
                        uploads() {
                            this.firstLoad || this.$nuxt.$emit("hasUploadedFilesChanged"), this.uploads.length ? this.$nuxt.$emit("hasUploads", !0) : this.$nuxt.$emit("hasUploads", !1), this.firstLoad = !1
                        },
                        input: function(e) {
                            !this.answer || this.input.answer !== [] && "" !== this.input.answer || (this.input.answer = this.answer.slice(0))
                        },
                        initialUploads: function(e, t) {
                            e.slice(0).filter(e => this.input.answer.includes(e.id)).filter(e => !this.uploads.includes(e)).filter(e => {
                                const t = this.uploads.find(t => e.key === t.key);
                                if (void 0 !== t) {
                                    if (void 0 !== t.url) return !1;
                                    this.uploads = this.uploads.filter(e => e.key !== t.key)
                                }
                                return !0
                            }).forEach(e => this.uploads.push(e))
                        }
                    },
                    created() {
                        this.input.answer || (this.input.answer = []), this.answer = this.input.answer.slice(0), this.uploads = this.initialUploads.slice(0).filter(e => this.answer.includes(e.id))
                    },
                    beforeDestroy() {
                        this.$nuxt.$off("hasUploadedFilesChanged"), this.$root.$off("fileChanged")
                    },
                    methods: {
                        fileUploaded(e) {
                            if (!e || 0 === e.length) return;
                            const t = [];
                            for (const n of e) n.size > 10485760 ? t.push(n.name) : d.a.post(this.getUploadUrl, {
                                filename: n.name
                            }).then(e => {
                                this.answer.push(e.data.id), this.input.answer = this.answer.slice(0);
                                (new FormData).append("file", n);
                                const t = new XMLHttpRequest;
                                t.open("PUT", e.data.upload_url), t.setRequestHeader("Content-Type", " "), t.send(n);
                                const r = {
                                    bucket: e.data.bucket,
                                    filename: e.data.filename,
                                    key: e.data.key,
                                    uploaded_on: new Date
                                };
                                this.addUploadFunc(r), this.uploads.push({
                                    id: e.data.id,
                                    bucket: e.data.bucket,
                                    filename: e.data.filename,
                                    key: e.data.key,
                                    uploaded_on: new Date
                                })
                            }).catch(e => {
                                this.$accessor.snackbar.setSnack({
                                    message: "File could not be uploaded. Please try again",
                                    icon: "nope"
                                }), console.error("File upload error: ", e)
                            }).then(e => {
                                this.model = null, this.$nuxt.$emit("fileChanged", this.answer)
                            });
                            t.length > 0 && this.$accessor.snackbar.setSnack({
                                message: `${t.join(", ")} ${t.length>1?"are":"is"} greater than 10MB in size. Please try again`,
                                icon: "nope"
                            })
                        },
                        deleteUploadedFile() {
                            if (!this.toBeDeleted) return;
                            const e = this.toBeDeleted;
                            this.uploads = this.uploads.filter(u => u.id !== e.id), d.a.delete(`${this.getUploadUrl}/${e.id}`).then(t => {
                                this.removeUploadFunc(e.key), this.input.answer = this.input.answer.filter(t => t !== e.id)
                            }).catch(e => {
                                this.$accessor.snackbar.setSnack({
                                    message: "File could not be deleted. Please try again",
                                    icon: "nope"
                                }), console.error("File deletion error: ", e)
                            }).then(e => {
                                this.toBeDeleted = null, this.$nuxt.$emit("fileChanged", this.answer)
                            })
                        },
                        openDialog(e) {
                            this.toBeDeleted = e, this.dialog = !0
                        },
                        closeDialog() {
                            this.dialog = !1
                        },
                        clearFiles() {
                            this.uploads.slice(0).forEach(e => {
                                this.toBeDeleted = e, this.deleteUploadedFile()
                            })
                        }
                    }
                }),
                w = (n(929), n(9)),
                component = Object(w.a)(y, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", {
                        staticClass: "FileUploader pl-2 mb-6"
                    }, [e.disabled && 0 !== e.uploads.length ? e._e() : t(l.a, {
                        staticClass: "mb-0",
                        class: e.reduceGutter ? "pr-2" : "px-2"
                    }, [t(o.a, {
                        staticClass: "mb-0",
                        attrs: {
                            label: e.input.label,
                            disabled: e.disabled,
                            multiple: "",
                            clearable: !1,
                            counter: "",
                            "counter-string": e.counterString
                        },
                        on: {
                            change: function(t) {
                                return e.fileUploaded(t)
                            }
                        },
                        model: {
                            value: e.model,
                            callback: function(t) {
                                e.model = t
                            },
                            expression: "model"
                        }
                    })], 1), e._v(" "), e.input.alt && !e.disabled ? t(l.a, {
                        staticClass: "mb-4 px-3"
                    }, [t("div", {
                        staticClass: "FileUploader__alt-text ml-1"
                    }, [e._v(e._s(e.input.alt))])]) : e._e(), e._v(" "), e.uploads.length > 0 ? t(l.a, {
                        staticClass: "pl-5 mb-2"
                    }, [t(r.a, [t("div", {
                        staticClass: "FileUploader__uploaded-files"
                    }, [e._v("Uploaded Files")])])], 1) : e._e(), e._v(" "), e._l(e.uploads, (function(n) {
                        return t(l.a, {
                            key: n.id,
                            staticClass: "pl-5 py-2",
                            attrs: {
                                align: "center"
                            }
                        }, [t(r.a, {
                            staticClass: "d-flex justify-space-between"
                        }, [t("div", [e.disabled ? e._e() : t("Icon", {
                            staticClass: "d-inline mr-4",
                            staticStyle: {
                                cursor: "pointer"
                            },
                            attrs: {
                                name: "nope-grey"
                            },
                            nativeOn: {
                                click: function(t) {
                                    return t.stopPropagation(), e.openDialog(n)
                                }
                            }
                        }), e._v(" "), t("a", {
                            staticClass: "FileUploader__filename",
                            class: {
                                "ml-1": e.disabled, "no-link": !n.url
                            },
                            attrs: {
                                href: n.url,
                                download: ""
                            }
                        }, [e._v("\n          " + e._s(n.filename) + "\n        ")])], 1), e._v(" "), t("div", {
                            staticClass: "FileUploader__uploaded"
                        }, [e._v("Uploaded on: " + e._s(new Date(n.uploaded_on).toLocaleDateString()))])])], 1)
                    })), e._v(" "), t("ConfirmationDialog", {
                        attrs: {
                            model: e.dialog,
                            title: "Delete file?",
                            subtitle: "File will be permanently deleted",
                            "confirm-button-label": e.LABEL.OK,
                            "close-button-label": e.LABEL.CANCEL,
                            "confirm-callback": e.deleteUploadedFile,
                            "close-dialog": e.closeDialog
                        }
                    })], 2)
                }), [], !1, null, "f885b948", null);
            t.default = component.exports;
            installComponents(component, {
                Icon: n(55).default,
                ConfirmationDialog: n(79).default
            })
        },
        928: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(870),
                o = n(40),
                l = n(5),
                c = n(3),
                d = o.z.extend({
                    name: "RiskAssessment",
                    data: () => ({
                        PATH: c,
                        EXTERNAL_LINKS: l.h
                    }),
                    props: {
                        fieldName: {
                            type: String,
                            default: "Upload Supporting Files"
                        }
                    }
                }),
                m = (n(930), n(9)),
                component = Object(m.a)(d, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("section", {
                        staticClass: "RiskAssessment"
                    }, [t("div", {
                        staticClass: "RiskAssessment__header"
                    }, [e._v("Risk assessment")]), e._v(" "), t("div", {
                        staticClass: "RiskAssessment__text"
                    }, [e._v("\n    If you are running an activity that requires Risk Assessment, please complete the Scouts Australia Youth Program\n    Risk Identification Template, download it from Google Docs and attach it along with other supporting documents\n    using the " + e._s(e.fieldName) + " field below.\n  ")]), e._v(" "), t("div", {
                        staticClass: "RiskAssessment__actions"
                    }, [t(r.a, {
                        staticClass: "RiskAssessment__button",
                        attrs: {
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(t) {
                                return e.openLinkNewTab(e.EXTERNAL_LINKS.RISK_TEMPLATE)
                            }
                        }
                    }, [e._v("\n      Youth Program Risk Identification Table\n    ")]), e._v(" "), t("a", {
                        staticClass: "RiskAssessment__link",
                        attrs: {
                            href: e.PATH.RISK_ASSESSMENT,
                            target: "_blank",
                            rel: "noopener noreferrer"
                        }
                    }, [e._v("\n      What is Risk Assessment?\n    ")])], 1)])
                }), [], !1, null, "264ea88e", null);
            t.default = component.exports
        },
        929: function(e, t, n) {
            "use strict";
            n(914)
        },
        930: function(e, t, n) {
            "use strict";
            n(915)
        },
        932: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(236),
                o = n(886),
                l = n(243),
                c = n(237),
                d = n(885),
                m = n(1).a.extend({
                    name: "PeakAwardCard",
                    props: {
                        title: {
                            type: String,
                            required: !0
                        },
                        percentage: {
                            type: Number,
                            required: !0
                        },
                        requirements: {
                            type: Array,
                            required: !0
                        }
                    },
                    methods: {
                        requirementDescriptionStyle: e => ({
                            color: e.completed ? "#40526" : "#748494"
                        })
                    }
                }),
                v = (n(986), n(9)),
                component = Object(v.a)(m, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t(r.a, {
                        staticClass: "py-9 xl-8 PeakAwardCard"
                    }, [t(d.a, [t(o.a, {
                        staticClass: "PeakAwardCard__title",
                        attrs: {
                            cols: "auto"
                        }
                    }, [e._v(e._s(e.title))])], 1), e._v(" "), t(d.a, [t(o.a, {
                        attrs: {
                            cols: "12"
                        }
                    }, [t(c.a, {
                        attrs: {
                            value: 100 * e.percentage,
                            rounded: "",
                            "background-color": "#E5E9EC",
                            color: "#00348D",
                            height: "8"
                        }
                    })], 1)], 1), e._v(" "), t(d.a, {
                        attrs: {
                            justify: "end"
                        }
                    }, [t(o.a, {
                        staticClass: "PeakAwardCard__progress-desc",
                        attrs: {
                            cols: "auto"
                        }
                    }, [e._v("Requirement for peak award")])], 1), e._v(" "), t(d.a, {
                        staticClass: "mb-10",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(o.a, {
                        attrs: {
                            cols: "12"
                        }
                    }, [e._l(e.requirements, (function(r, i) {
                        return [t(d.a, {
                            key: "desc" + i,
                            staticClass: "PeakAwardCard__progress-desc-row",
                            attrs: {
                                "no-gutters": ""
                            }
                        }, [t(o.a, {
                            attrs: {
                                cols: e.$vuetify.breakpoint.xs ? 2 : 1,
                                "align-self": "flex-start"
                            }
                        }, [r.completed ? t("img", {
                            staticClass: "PeakAwardCard__icon",
                            attrs: {
                                src: n(289),
                                alt: "Completed check mark"
                            }
                        }) : t("img", {
                            staticClass: "PeakAwardCard__icon",
                            attrs: {
                                src: n(288),
                                alt: "Incompleted check mark"
                            }
                        })]), e._v(" "), t(o.a, {
                            staticClass: "PeakAwardCard__requirement-desc my-3",
                            style: e.requirementDescriptionStyle(r),
                            attrs: {
                                cols: e.$vuetify.breakpoint.xs ? 10 : 11,
                                "align-self": "center"
                            }
                        }, [e._v("\n            " + e._s(r.description) + "\n          ")])], 1), e._v(" "), i != e.requirements.length - 1 ? t(l.a, {
                            key: "break" + i,
                            staticClass: "mt-0 mb-0"
                        }) : e._e()]
                    }))], 2)], 1), e._v(" "), t(d.a, {
                        attrs: {
                            justify: "end"
                        }
                    }, [t(o.a, {
                        attrs: {
                            cols: e.$vuetify.breakpoint.xs ? 12 : 11
                        }
                    }, [e._t("default")], 2)], 1)], 1)
                }), [], !1, null, "0c476014", null);
            t.default = component.exports
        },
        933: function(e, t, n) {
            "use strict";
            n.d(t, "d", (function() {
                return l
            })), n.d(t, "a", (function() {
                return c
            })), n.d(t, "c", (function() {
                return d
            })), n.d(t, "b", (function() {
                return m
            }));
            var r, o = n(171);
            ! function(e) {
                e.Community = "community", e.Outdoors = "outdoors", e.Creative = "creative", e.PersonalGrowth = "personal_growth"
            }(r || (r = {}));
            class l {
                constructor(e) {
                    this.metrics = e
                }
                get milestone_one() {
                    return this.metrics.milestones.milestone_one + "%"
                }
                get milestone_two() {
                    return this.metrics.milestones.milestone_two + "%"
                }
                get milestone_three() {
                    return this.metrics.milestones.milestone_three + "%"
                }
                get name() {
                    return this.metrics.name
                }
                get unit_id() {
                    return this.metrics.unit_id
                }
                get avg_attendance() {
                    return this.metrics.avg_attendance.toPrecision(2)
                }
                get sia_completed() {
                    return this.metrics.sia.completed
                }
                get sia_inprogress() {
                    return this.metrics.sia.in_progress
                }
                get oas_total_progressions() {
                    return this.metrics.oas.total_progressions
                }
            }
            class c {
                constructor(e) {
                    this.metrics = e
                }
                get milestone_one() {
                    return this.metrics.milestones.milestone_one ? this.metrics.milestones.milestone_one + "%" : "0%"
                }
                get milestone_two() {
                    return this.metrics.milestones.milestone_two ? this.metrics.milestones.milestone_two + "%" : "0%"
                }
                get milestone_three() {
                    return this.metrics.milestones.milestone_three ? this.metrics.milestones.milestone_three + "%" : "0%"
                }
                get name() {
                    return this.metrics.name
                }
                get unit_id() {
                    return this.metrics.unit_id
                }
                get avg_attendance() {
                    return this.metrics.avg_attendance.toPrecision(2)
                }
                get sia_completed() {
                    return this.metrics.sia.completed
                }
                get sia_inprogress() {
                    return this.metrics.sia.in_progress
                }
                get oas_total_progressions() {
                    return this.metrics.oas.total_progressions
                }
                get region() {
                    return this.metrics.region || "-"
                }
                get district() {
                    return this.metrics.district || "-"
                }
                get formation_number() {
                    return this.metrics.formation_number
                }
            }
            const d = {
                milestones: 30,
                oas: 30,
                sia: 25,
                personal_development: 5,
                personal_reflection: 2,
                adventurous_journey: 8,
                total: 100
            };
            class m {
                constructor(e) {
                    this.metrics = e
                }
                get sia() {
                    return this.metrics.sia.completed_projects
                }
                get name() {
                    return this.metrics.name
                }
                get age() {
                    return this.metrics.age
                }
                get unit_attendance() {
                    return this.metrics.unit_attendance
                }
                get total_attendance() {
                    return this.metrics.total_attendance
                }
                get peak_award() {
                    return Math.ceil(this.metrics.peak_award.total) + "%"
                }
                formatDate(e) {
                    if (null != e) {
                        const t = e.split(" ");
                        return Object(o.a)(new Date(t[0]), "yyyy-MM-dd")
                    }
                    return "Not complete"
                }
                get adventurous_journey() {
                    return this.formatDate(this.metrics.adventurous_journey)
                }
                get intro_to_scouts() {
                    return this.formatDate(this.metrics.intro_to_scouts)
                }
                get intro_to_section() {
                    return this.formatDate(this.metrics.intro_to_section)
                }
                get personal_reflection() {
                    return this.formatDate(this.metrics.personal_reflection)
                }
                get personal_development() {
                    return this.formatDate(this.metrics.personal_development)
                }
                get oas_progress() {
                    return "View Progress"
                }
                get has_milestone() {
                    return null != this.metrics.milestone
                }
                get current_milestone() {
                    return null != this.metrics.milestone ? "Milestone " + this.metrics.milestone.milestone : "None"
                }
                get oas_stage_progressions() {
                    return this.metrics.oas.total_progressions.toString()
                }
            }
        },
        934: function(e, t, n) {
            "use strict";
            n(918)
        },
        935: function(e, t, n) {
            "use strict";
            n(919)
        },
        936: function(e, t, n) {
            "use strict";
            n(920)
        },
        937: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(236),
                o = n(998),
                l = n(886),
                c = n(172),
                d = n(885),
                m = n(1),
                v = n(909),
                _ = n(908),
                f = n(287),
                h = n(5),
                y = m.a.extend({
                    name: "PlanDoReview",
                    props: {
                        onChange: {
                            type: Function,
                            required: !0
                        },
                        label: {
                            type: String,
                            required: !0
                        },
                        disabled: {
                            type: Boolean,
                            required: !0
                        },
                        condensedLayout: {
                            type: Boolean
                        },
                        flatLayout: {
                            type: Boolean
                        },
                        initialState: {
                            type: Boolean,
                            required: !0
                        }
                    },
                    data() {
                        return {
                            PE: v,
                            INTRO_IMAGE_NAMES: _.b,
                            ICON_VIEW_DOC: f.ICON_VIEW_DOC,
                            state: !!this.$props.initialState
                        }
                    },
                    computed: {
                        getLayoutStyle() {
                            return this.condensedLayout ? h.C.CONDENSED : this.flatLayout ? h.C.FLAT : h.C.CARDED
                        }
                    },
                    methods: {
                        fetchImage: e => n(917)(`./${e}.svg`)
                    }
                }),
                w = n(9),
                component = Object(w.a)(y, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t(r.a, {
                        class: ["TemplateGroup", "TemplateGroup--" + e.getLayoutStyle],
                        attrs: {
                            flat: ""
                        }
                    }, [t("div", {
                        staticClass: "TemplateGroup__statements"
                    }, [t(d.a, {
                        staticClass: "TemplateGroup__statements-inner-container"
                    }, [t(l.a, [t(o.a, {
                        staticClass: "BaseRequirements__PlanDoReview",
                        attrs: {
                            "on-icon": "mdi-checkbox-marked-circle",
                            "off-icon": "mdi-checkbox-blank-circle-outline",
                            label: e.label,
                            disabled: e.disabled
                        },
                        on: {
                            change: e.onChange
                        },
                        model: {
                            value: e.state,
                            callback: function(t) {
                                e.state = t
                            },
                            expression: "state"
                        }
                    })], 1), e._v(" "), t(l.a, {
                        attrs: {
                            "align-self": "center",
                            cols: "auto"
                        }
                    }, [e.$vuetify.breakpoint.smAndUp ? t("a", {
                        staticClass: "TemplateGroup__link",
                        attrs: {
                            href: "https://templates.develop.scouts.twobulls.dev/resources/intro-scouting/plan_do_review.pdf",
                            target: "_blank",
                            rel: "noopener noreferrer"
                        }
                    }, [e._v("\n          More Information\n        ")]) : t("a", {
                        attrs: {
                            href: "https://templates.develop.scouts.twobulls.dev/resources/intro-scouting/plan_do_review.pdf",
                            target: "_blank",
                            rel: "noopener noreferrer"
                        }
                    }, [t(c.a, {
                        staticClass: "TemplateGroup__icon--view-doc ml-4",
                        attrs: {
                            src: n(903)("./" + e.ICON_VIEW_DOC),
                            alt: "More Information about Plan Do Review"
                        }
                    })], 1)])], 1), e._v(" "), e.condensedLayout ? e._e() : t("img", {
                        staticClass: "BaseRequirements__statement-image",
                        attrs: {
                            src: e.fetchImage(e.INTRO_IMAGE_NAMES.plan_do_review),
                            alt: "plan-do-review"
                        }
                    })], 1)])
                }), [], !1, null, null, null);
            t.default = component.exports
        },
        938: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(236),
                o = n(998),
                l = n(886),
                c = n(172),
                d = n(885),
                m = n(1),
                v = n(909),
                _ = n(908),
                f = n(287),
                h = n(5),
                y = m.a.extend({
                    name: "Spices",
                    props: {
                        onChange: {
                            type: Function,
                            required: !0
                        },
                        label: {
                            type: String,
                            required: !0
                        },
                        disabled: {
                            type: Boolean,
                            required: !0
                        },
                        condensedLayout: {
                            type: Boolean
                        },
                        flatLayout: {
                            type: Boolean
                        },
                        initialState: {
                            type: Boolean,
                            required: !0
                        }
                    },
                    data() {
                        return {
                            PE: v,
                            INTRO_IMAGE_NAMES: _.b,
                            ICON_VIEW_DOC: f.ICON_VIEW_DOC,
                            state: !!this.initialState
                        }
                    },
                    computed: {
                        getLayoutStyle() {
                            return this.condensedLayout ? h.C.CONDENSED : this.flatLayout ? h.C.FLAT : h.C.CARDED
                        }
                    },
                    methods: {
                        fetchImage: e => n(917)(`./${e}.svg`)
                    }
                }),
                w = n(9),
                component = Object(w.a)(y, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t(r.a, {
                        class: ["TemplateGroup", "TemplateGroup--" + e.getLayoutStyle],
                        attrs: {
                            flat: ""
                        }
                    }, [t("div", {
                        staticClass: "TemplateGroup__header"
                    }, [t("div", {
                        staticClass: "TemplateGroup__title"
                    }, [e._v(e._s(e.PE.INTRO_SCOUTING_DOC_TITLES.spices))])]), e._v(" "), t("div", {
                        staticClass: "TemplateGroup__statements"
                    }, [t(d.a, {
                        staticClass: "TemplateGroup__statements-inner-container"
                    }, [t(l.a, [t(o.a, {
                        attrs: {
                            "on-icon": "mdi-checkbox-marked-circle",
                            "off-icon": "mdi-checkbox-blank-circle-outline",
                            label: e.label,
                            disabled: e.disabled
                        },
                        on: {
                            change: e.onChange
                        },
                        model: {
                            value: e.state,
                            callback: function(t) {
                                e.state = t
                            },
                            expression: "state"
                        }
                    })], 1), e._v(" "), t(l.a, {
                        attrs: {
                            "align-self": "center",
                            cols: "auto"
                        }
                    }, [e.$vuetify.breakpoint.smAndUp ? t("a", {
                        staticClass: "TemplateGroup__link",
                        attrs: {
                            href: "https://templates.develop.scouts.twobulls.dev/resources/intro-scouting/spices.pdf",
                            target: "_blank",
                            rel: "noopener noreferrer"
                        }
                    }, [e._v("\n          More Information\n        ")]) : t("a", {
                        attrs: {
                            href: "https://templates.develop.scouts.twobulls.dev/resources/intro-scouting/spices.pdf",
                            target: "_blank",
                            rel: "noopener noreferrer"
                        }
                    }, [t(c.a, {
                        staticClass: "TemplateGroup__icon--view-doc ml-4",
                        attrs: {
                            src: n(903)("./" + e.ICON_VIEW_DOC),
                            alt: "More Information about SPICES"
                        }
                    })], 1)])], 1), e._v(" "), e.condensedLayout ? e._e() : t("img", {
                        staticClass: "BaseRequirements__statement-image",
                        attrs: {
                            src: e.fetchImage(e.INTRO_IMAGE_NAMES.spices),
                            alt: "SPICES: Social, Physical, Intellextual, Character, Emotional, Spiritual"
                        }
                    })], 1)])
                }), [], !1, null, null, null);
            t.default = component.exports
        },
        939: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(236),
                o = n(998),
                l = n(886),
                c = n(1133),
                d = n(1132),
                m = n(885),
                v = n(1430),
                _ = n(1431),
                f = n(1497),
                h = n(1370),
                y = n(891),
                w = n(287),
                C = n(4),
                S = n(5),
                A = n(924),
                T = n(27),
                E = n(907),
                R = T.a.extend({
                    name: "TemplateGroup",
                    components: {
                        TwoColumnSelectableList: A.default
                    },
                    props: {
                        disabledOas: {
                            type: Boolean
                        },
                        inputGroup: {
                            type: Object,
                            required: !0
                        },
                        condensedLayout: {
                            type: Boolean
                        },
                        flatLayout: {
                            type: Boolean
                        },
                        disabled: {
                            type: Boolean
                        },
                        disabledIds: {
                            type: Array,
                            default: () => []
                        },
                        onSelectionChange: {
                            type: Function,
                            default: () => {}
                        },
                        removeVerifiedFunc: {
                            type: Function,
                            default: null
                        },
                        addUploadFunc: {
                            type: Function,
                            default: null
                        },
                        removeUploadFunc: {
                            type: Function,
                            default: null
                        },
                        initialUploads: {
                            type: Array,
                            default: () => []
                        }
                    },
                    data: () => ({
                        uploads: [],
                        ICON: w,
                        ICON_VIEW_DOC: w.ICON_VIEW_DOC,
                        TEMPLATE_INPUT_TYPE: C.TEMPLATE_INPUT_TYPE,
                        TEMPLATE_GROUP_LAYOUT: S.C
                    }),
                    computed: {
                        getLayoutStyle() {
                            return this.condensedLayout ? S.C.CONDENSED : this.flatLayout ? S.C.FLAT : S.C.CARDED
                        }
                    },
                    mounted() {
                        setTimeout(this.updateSlider, 3e3)
                    },
                    beforeDestroy() {
                        this.$nuxt.$off("checkboxChanged"), this.$nuxt.$off("guidanceStatement")
                    },
                    methods: {
                        rulesFromString: E.a,
                        initialStartDate(input) {
                            var e;
                            return null === (e = input.answer) || void 0 === e ? void 0 : e.start_date
                        },
                        initialEndDate(input) {
                            var e;
                            return null === (e = input.answer) || void 0 === e ? void 0 : e.end_date
                        },
                        startDateChangeAp(e, input) {
                            e && input && ("string" == typeof input.answer && (input.answer = {}), input.answer.start_date = e, this.minEndDate = new Date(e).toISOString().substr(0, 10))
                        },
                        endDateChangeAp(e, input) {
                            e && input && ("string" == typeof input.answer && (input.answer = {}), input.answer.end_date = e, this.maxStartDate = new Date(e).toISOString().substr(0, 10))
                        },
                        removeVerified(e) {
                            this.removeVerifiedFunc(e)
                        },
                        updateSlider() {
                            if (void 0 !== this.$refs.slider) {
                                const e = this.$refs.slider[0].$el.parentElement,
                                    t = e.nextElementSibling;
                                e.style.width = t.offsetWidth + "px"
                            }
                        },
                        fetchUrlLink(link) {
                            return Object.prototype.hasOwnProperty.call(link, "path") ? `${this.$config.api.templates}${link.path}` : Object.prototype.hasOwnProperty.call(link, "url") ? link.url : "#"
                        },
                        isVerifierAdded: e => !!e,
                        addUpload(e) {
                            this.addUploadFunc(e)
                        },
                        removeUpload(e) {
                            this.removeUploadFunc(e)
                        }
                    }
                }),
                k = (n(934), n(9)),
                component = Object(k.a)(R, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t(r.a, {
                        class: ["TemplateGroup", "TemplateGroup--" + e.getLayoutStyle],
                        attrs: {
                            flat: ""
                        }
                    }, ["title" in e.inputGroup ? t("div", {
                        staticClass: "TemplateGroup__header"
                    }, [t("div", {
                        staticClass: "TemplateGroup__title"
                    }, [e._v(e._s(e.inputGroup.title))]), e._v(" "), e.inputGroup.links && 1 === e.inputGroup.links.length ? [e.$vuetify.breakpoint.smAndUp ? t("a", {
                        staticClass: "TemplateGroup__link",
                        attrs: {
                            href: e.fetchUrlLink(e.inputGroup.links[0]),
                            target: "_blank",
                            rel: "noopener noreferrer"
                        }
                    }, [e._v("\n        " + e._s(e.inputGroup.links[0].text) + "\n      ")]) : t("a", {
                        staticClass: "TemplateGroup__icon--view-doc-container",
                        attrs: {
                            href: e.fetchUrlLink(e.inputGroup.links[0]),
                            target: "_blank",
                            rel: "noopener noreferrer"
                        }
                    }, [t("img", {
                        staticClass: "TemplateGroup__icon--view-doc",
                        attrs: {
                            src: n(903)("./" + e.ICON_VIEW_DOC),
                            alt: e.inputGroup.links[0].text
                        }
                    })])] : e._e()], 2) : e._e(), e._v(" "), e._l(e.inputGroup.inputs, (function(input, r) {
                        return t("div", {
                            key: r,
                            class: [{
                                "TemplateGroup__statements--pad-adjacent": input.type === e.TEMPLATE_INPUT_TYPE.text || input.type === e.TEMPLATE_INPUT_TYPE.dateRange || input.type === e.TEMPLATE_INPUT_TYPE.fileUploader || input.type === e.TEMPLATE_INPUT_TYPE.radio
                            }, "TemplateGroup__statements"]
                        }, [t("div", {
                            staticClass: "TemplateGroup__statements-inner-container",
                            class: {
                                "no-wrap-item": !e.condensedLayout && input.links && 1 === input.links.length
                            }
                        }, [input.type === e.TEMPLATE_INPUT_TYPE.dateRange ? t(m.a, {
                            staticClass: "mt-4"
                        }, [t(l.a, {
                            attrs: {
                                cols: "12",
                                md: "3"
                            }
                        }, [t("DatePicker", {
                            staticClass: "TemplateGroup__date-picker",
                            attrs: {
                                label: "Start date",
                                "data-cy": "start_date",
                                disabled: e.$props.disabled,
                                "initial-date": e.initialStartDate(input),
                                "date-range": e.maxStartDate,
                                "date-range-max": "",
                                rules: input.rules
                            },
                            on: {
                                dateChange: function(t) {
                                    return e.startDateChangeAp(t, input)
                                }
                            }
                        })], 1), e._v(" "), t(l.a, {
                            attrs: {
                                cols: "12",
                                md: "3"
                            }
                        }, [t("DatePicker", {
                            staticClass: "TemplateGroup__date-picker",
                            attrs: {
                                label: "End date",
                                disabled: e.$props.disabled,
                                "data-cy": "end_date",
                                "initial-date": e.initialEndDate(input),
                                "date-range": e.minEndDate,
                                "date-range-min": "",
                                rules: input.rules
                            },
                            on: {
                                dateChange: function(t) {
                                    return e.endDateChangeAp(t, input)
                                }
                            }
                        })], 1)], 1) : e._e(), e._v(" "), input.type === e.TEMPLATE_INPUT_TYPE.checkbox ? t(o.a, {
                            attrs: {
                                label: input.label,
                                disabled: e.$props.disabled || e.disabledOas,
                                "on-icon": "mdi-checkbox-marked-circle",
                                "off-icon": "mdi-checkbox-blank-circle-outline"
                            },
                            on: {
                                change: function(t) {
                                    return e.$nuxt.$emit("checkboxChanged", t)
                                }
                            },
                            model: {
                                value: input.answer,
                                callback: function(t) {
                                    e.$set(input, "answer", t)
                                },
                                expression: "input.answer"
                            }
                        }) : e._e(), e._v(" "), input.type === e.TEMPLATE_INPUT_TYPE.checkboxVerifiable ? t("div", {
                            staticClass: "TemplateGroup__checkbox-verify-and-info"
                        }, [t("div", {
                            staticClass: "TemplateGroup__checkbox-verify-and-info-inner"
                        }, [t(o.a, {
                            attrs: {
                                label: input.label,
                                disabled: e.isVerifierAdded(input.verifierName) || e.$props.disabled,
                                "on-icon": "mdi-checkbox-marked-circle",
                                "off-icon": "mdi-checkbox-blank-circle-outline"
                            },
                            on: {
                                change: function(t) {
                                    return e.onSelectionChange(input)
                                }
                            },
                            model: {
                                value: input.answer,
                                callback: function(t) {
                                    e.$set(input, "answer", t)
                                },
                                expression: "input.answer"
                            }
                        }), e._v(" "), input.verifierName ? t("div", {
                            staticClass: "TemplateGroup__verified-details"
                        }, [e._v("\n            Verified by " + e._s(input.verifierName) + "\n            " + e._s(input.verifierContact ? `(${input.verifierContact})` : "(No contact details)") + ". Date\n            " + e._s(input.verifiedDate) + "\n          ")]) : e._e(), e._v(" "), input.eventId && !e.disabled ? t("div", {
                            staticClass: "TemplateGroup__event-statement"
                        }, [e._v("\n            The above statement was applied at the conclusion of an event and cannot be removed\n          ")]) : e._e()], 1), e._v(" "), t("div", {
                            staticClass: "TemplateGroup__action-icons"
                        }, [!input.verifierName || e.disabled || input.eventId ? e._e() : t("Icon", {
                            staticClass: "TemplateGroup__action-icon",
                            attrs: {
                                name: "nope-grey"
                            },
                            nativeOn: {
                                click: function(t) {
                                    t.stopPropagation(), !e.disabled && e.removeVerified(input)
                                }
                            }
                        }), e._v(" "), input.dialog_text ? t("Icon", {
                            staticClass: "TemplateGroup__action-icon",
                            attrs: {
                                name: "info",
                                clickable: ""
                            },
                            nativeOn: {
                                click: function(t) {
                                    return t.stopPropagation(), e.$nuxt.$emit("guidanceStatement", input.dialog_text)
                                }
                            }
                        }) : e._e()], 1)]) : e._e(), e._v(" "), input.type === e.TEMPLATE_INPUT_TYPE.markdown ? t("VueShowdown", {
                            staticClass: "TemplateGroup__markdown",
                            attrs: {
                                markdown: input.label
                            }
                        }) : e._e(), e._v(" "), input.type === e.TEMPLATE_INPUT_TYPE.text ? t(y.a, {
                            staticClass: "TemplateGroup__text-area",
                            attrs: {
                                "auto-grow": "",
                                "row-height": 6,
                                label: input.label,
                                disabled: e.$props.disabled,
                                readonly: e.$props.disabled,
                                color: "#B7C2CC",
                                counter: "",
                                maxlength: input.limit || 1e3,
                                rules: e.rulesFromString(input.rules)
                            },
                            model: {
                                value: input.answer,
                                callback: function(t) {
                                    e.$set(input, "answer", t)
                                },
                                expression: "input.answer"
                            }
                        }) : e._e(), e._v(" "), input.type === e.TEMPLATE_INPUT_TYPE.radio ? [t("div", {
                            staticClass: "TemplateGroup__subtitle-1"
                        }, [e._v(e._s(input.label))]), e._v(" "), input.type === e.TEMPLATE_INPUT_TYPE.radio ? t(d.a, {
                            attrs: {
                                disabled: e.$props.disabled,
                                row: "",
                                rules: e.rulesFromString(input.rules)
                            },
                            model: {
                                value: input.answer,
                                callback: function(t) {
                                    e.$set(input, "answer", t)
                                },
                                expression: "input.answer"
                            }
                        }, e._l(input.selections, (function(n, r) {
                            return t(c.a, {
                                key: r,
                                attrs: {
                                    label: n.title,
                                    value: n.id,
                                    disabled: e.disabledIds.includes(n.id)
                                }
                            })
                        })), 1) : e._e()] : e._e(), e._v(" "), input.type === e.TEMPLATE_INPUT_TYPE.multiTab ? [t("div", {
                            staticClass: "TemplateGroup__subtitle-1"
                        }, [e._v(e._s(input.label))]), e._v(" "), e.condensedLayout ? t("TwoColumnSelectableList", {
                            attrs: {
                                disabled: "",
                                items: input.tabs.reduce((e, t) => e.concat(t.selections), [])
                            }
                        }) : t(f.a, {
                            staticClass: "TemplateGroup__multi-tab-selector",
                            attrs: {
                                centered: "",
                                grow: ""
                            }
                        }, [t(h.a, {
                            ref: "slider",
                            refInFor: !0
                        }), e._v(" "), e._l(input.tabs, (function(n, r) {
                            return t(v.a, {
                                key: r,
                                attrs: {
                                    href: "#tab-" + r
                                }
                            }, [e._v("\n            " + e._s(n.title) + e._s(n.selections.filter(e => e.selected).length ? ` (${n.selections.filter(e=>e.selected).length})` : "") + "\n          ")])
                        })), e._v(" "), e._l(input.tabs, (function(n, r) {
                            return t(_.a, {
                                key: r,
                                attrs: {
                                    value: "tab-" + r
                                }
                            }, [t("TwoColumnSelectableList", {
                                attrs: {
                                    disabled: e.condensedLayout,
                                    items: n.selections
                                }
                            })], 1)
                        }))], 2)] : e._e(), e._v(" "), input.type === e.TEMPLATE_INPUT_TYPE.singleTab ? [t("div", {
                            staticClass: "TemplateGroup__subtitle-1"
                        }, [e._v(e._s(input.label))]), e._v(" "), t("TwoColumnSelectableList", {
                            staticClass: "mb-4",
                            attrs: {
                                items: input.selections,
                                single: !input.multi_select,
                                disabled: e.condensedLayout,
                                rules: input.rules
                            }
                        })] : e._e(), e._v(" "), input.type === e.TEMPLATE_INPUT_TYPE.textEndLink ? [t("div", {
                            staticClass: "TemplateGroup__text-link"
                        }, [e._v("\n          " + e._s(input.label) + "\n          "), t("a", {
                            staticClass: "TemplateGroup__link pl-0",
                            attrs: {
                                href: input.link.url,
                                target: "_blank",
                                rel: "noopener noreferrer"
                            }
                        }, [e._v("\n            " + e._s(input.link.label) + "\n          ")])])] : e._e(), e._v(" "), input.type === e.TEMPLATE_INPUT_TYPE.fileUploader ? t("FileUploader", {
                            staticClass: "TemplateGroup__file-uploader mt-4",
                            attrs: {
                                input: input,
                                disabled: e.$props.disabled,
                                "add-upload-func": e.addUpload,
                                "remove-upload-func": e.removeUpload,
                                "initial-uploads": e.initialUploads,
                                "reduce-gutter": !0
                            }
                        }) : e._e(), e._v(" "), input.links && 1 === input.links.length ? [e.$vuetify.breakpoint.smAndUp ? t("a", {
                            staticClass: "TemplateGroup__link",
                            attrs: {
                                href: e.fetchUrlLink(input.links[0]),
                                target: "_blank"
                            }
                        }, [e._v("\n          " + e._s(input.links[0].text) + "\n        ")]) : t("a", {
                            staticClass: "my-auto ml-4",
                            attrs: {
                                href: e.fetchUrlLink(input.links[0])
                            }
                        }, [t("img", {
                            staticClass: "TemplateGroup__icon--view-doc",
                            attrs: {
                                src: n(903)("./" + e.ICON_VIEW_DOC),
                                alt: input.links[0].text
                            }
                        })])] : e._e(), e._v(" "), input.type === e.TEMPLATE_INPUT_TYPE.riskAssessment ? t("RiskAssessment", {
                            attrs: {
                                "field-name": input.fieldName
                            }
                        }) : e._e()], 2), e._v(" "), input.alt && input.type !== e.TEMPLATE_INPUT_TYPE.fileUploader ? t("div", {
                            staticClass: "TemplateGroup__description"
                        }, [e._v("\n      " + e._s(input.alt) + "\n    ")]) : e._e(), e._v(" "), !e.condensedLayout && input.links && input.links.length > 1 ? [t("ol", {
                            attrs: {
                                type: "a"
                            }
                        }, e._l(input.links, (function(link, n) {
                            return t("li", {
                                key: n
                            }, [t("a", {
                                attrs: {
                                    href: e.fetchUrlLink(input.links[n]),
                                    target: "_blank",
                                    rel: "noopener noreferrer"
                                }
                            }, [e._v("\n            " + e._s(input.links[n].text) + "\n          ")])])
                        })), 0)] : e._e()], 2)
                    })), e._v(" "), !e.condensedLayout && e.inputGroup.links && e.inputGroup.links.length > 1 ? e._l(e.inputGroup.links, (function(link, i) {
                        return t("a", {
                            key: i,
                            class: "TemplateGroup__input-links" + (e.inputGroup.links.length > 1 ? "--single" : "--multi"),
                            attrs: {
                                href: e.fetchUrlLink(e.inputGroup.links[i]),
                                target: "_blank",
                                rel: "noopener noreferrer"
                            }
                        }, [e._v("\n      " + e._s(e.inputGroup.links[i].text) + "\n    ")])
                    })) : e._e()], 2)
                }), [], !1, null, null, null);
            t.default = component.exports;
            installComponents(component, {
                DatePicker: n(921).default,
                Icon: n(55).default,
                FileUploader: n(927).default,
                RiskAssessment: n(928).default
            })
        },
        940: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(1090),
                o = n(1092),
                l = n(1091),
                c = n(1089),
                d = n(237),
                m = n(171),
                v = n(40),
                _ = n(5),
                f = n(55),
                h = n(144),
                y = v.p.extend({
                    name: "MilestonesParticipatesSummary",
                    components: {
                        Icon: f.default,
                        InfoCard: h.default
                    },
                    props: {
                        challengeArea: {
                            type: String,
                            required: !0
                        },
                        eventData: {
                            type: Array,
                            required: !0
                        },
                        importData: {
                            type: Object,
                            default: () => ({})
                        },
                        requiredCredits: {
                            type: Number,
                            required: !0
                        }
                    },
                    data: () => ({
                        LABEL: _.i,
                        CHALLENGE_AREAS_NAME_MAP: _.f,
                        MILESTONE_EVENT_TYPE: _.k
                    }),
                    computed: {
                        challengeAreaEvents() {
                            return this.eventData.filter(e => e.credit_type === _.k.PARTICIPANT && e.challenge_area === this.challengeArea)
                        },
                        importedCredits() {
                            return this.importData.event_count ? this.importData.event_count.participant[this.challengeArea] : 0
                        },
                        receivedCredits() {
                            return this.importedCredits + this.challengeAreaEvents.length
                        }
                    },
                    methods: {
                        formatDate: e => null != e ? Object(m.a)(new Date(e), "yyyy-MM-dd") : "Not complete"
                    }
                }),
                w = (n(935), n(9)),
                component = Object(w.a)(y, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t(c.a, [t(r.a, {
                        staticClass: "MilestonesParticipatesSummary__expansion_panel"
                    }, [t(l.a, {
                        staticClass: "MilestonesParticipatesSummary__header"
                    }, [t("div", {
                        staticClass: "MilestonesParticipatesSummary__header-title"
                    }, [t("img", {
                        staticClass: "MilestonesParticipatesSummary__icon",
                        attrs: {
                            src: e.challengeAreaIcons[e.challengeArea],
                            alt: e.CHALLENGE_AREAS_NAME_MAP.get(e.challengeArea)
                        }
                    }), e._v("\n        " + e._s(e.CHALLENGE_AREAS_NAME_MAP.get(e.challengeArea)) + "\n      ")]), e._v(" "), t("div", {
                        staticClass: "MilestonesParticipatesSummary__header-progress"
                    }, [t(d.a, {
                        staticClass: "MilestonesParticipatesSummary__progress-bar",
                        attrs: {
                            value: 100 * e.receivedCredits / e.requiredCredits,
                            rounded: "",
                            height: "8"
                        }
                    }), e._v(" "), t("span", [e._v(e._s(e.receivedCredits) + " / " + e._s(e.requiredCredits))])], 1)]), e._v(" "), t(o.a, [e.receivedCredits !== e.requiredCredits ? t("InfoCard", {
                        staticClass: "mt-6 mb-6",
                        attrs: {
                            "info-type": "caution",
                            title: "One or more credits are missing. Please speak to your Unit Council to clarify."
                        }
                    }) : e._e(), e._v(" "), e._l(e.challengeAreaEvents, (function(n, r) {
                        return [t("div", {
                            key: r,
                            staticClass: "MilestonesParticipatesSummary__item"
                        }, [t("div", {
                            staticClass: "MilestonesParticipatesSummary__item-name"
                        }, [e._v(e._s(n.event_name))]), e._v(" "), t("div", {
                            staticClass: "MilestonesParticipatesSummary__item-date"
                        }, [e._v(e._s(e.formatDate(n.event_start_datetime)))])])]
                    })), e._v(" "), e._l(e.importedCredits, (function(n) {
                        return t("div", {
                            key: n
                        }, [t("p", {
                            staticClass: "MilestonesParticipatesSummary__item"
                        }, [e._v("Imported event")])])
                    }))], 2)], 1)], 1)
                }), [], !1, null, "0baa634a", null);
            t.default = component.exports
        },
        941: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(870),
                o = n(171),
                l = n(40),
                c = n(4),
                d = n(5),
                m = l.p.extend({
                    name: "MilestonesAssistLeadSummary",
                    props: {
                        type: {
                            type: String,
                            required: !0
                        },
                        answers: {
                            type: Object,
                            required: !0
                        },
                        title: {
                            type: String,
                            required: !0
                        },
                        subtitle: {
                            type: String,
                            required: !0
                        },
                        eventData: {
                            type: Array,
                            required: !0
                        },
                        creditType: {
                            type: String,
                            required: !0
                        },
                        importData: {
                            type: Object,
                            default: () => ({})
                        }
                    },
                    data: () => ({
                        LABEL: d.i,
                        CHALLENGE_AREAS_TYPES: c.CHALLENGE_AREAS_TYPES,
                        CHALLENGE_AREAS_NAME_MAP: d.f,
                        showReviewDialog: !1,
                        reviewType: {
                            assist: {
                                title: "Review (Assist)",
                                question: "What did you learn while assisting this activity?"
                            },
                            lead: {
                                title: "Review (Lead)",
                                question: "What did you learn while leading this activity?"
                            }
                        },
                        reviewAnswer: ""
                    }),
                    computed: {
                        events() {
                            return this.eventData.filter(e => e.credit_type === this.creditType)
                        },
                        importedCredits() {
                            let e = 0;
                            return this.importData.event_count && (e += this.importData.event_count[this.creditType].community, e += this.importData.event_count[this.creditType].creative, e += this.importData.event_count[this.creditType].outdoors, e += this.importData.event_count[this.creditType].personal_growth), e
                        }
                    },
                    methods: {
                        openReview(e) {
                            const t = Object.entries(this.$accessor.milestones.getAnswers);
                            this.$data.reviewAnswer = t.filter(t => t[0] === `${this.type}_review_${e.event_id}`)[0][1], this.showReviewDialog = !0
                        },
                        formatDate: e => null != e ? Object(o.a)(new Date(e), "yyyy-MM-dd") : "Not complete"
                    }
                }),
                v = (n(936), n(9)),
                component = Object(v.a)(m, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", {
                        staticClass: "MilestonesAssistLeadSummary"
                    }, [t("div", {
                        staticClass: "MilestonesAssistLeadSummary__header"
                    }, [t("span", {
                        staticClass: "MilestonesAssistLeadSummary__title"
                    }, [e._v(e._s(e.title))]), e._v(" "), t("span", {
                        staticClass: "MilestonesAssistLeadSummary__subtitle"
                    }, [e._v(e._s(e.subtitle))])]), e._v(" "), e._l(e.events, (function(n, o) {
                        return [t("div", {
                            key: o,
                            staticClass: "MilestonesAssistLeadSummary__item"
                        }, [t("div", {
                            staticClass: "MilestonesAssistLeadSummary__item-name"
                        }, [e._v(e._s(n.event_name))]), e._v(" "), t("div", {
                            staticClass: "MilestonesAssistLeadSummary__item-date"
                        }, [e._v(e._s(e.formatDate(n.event_start_datetime)))]), e._v(" "), t(r.a, {
                            staticClass: "pr-0",
                            attrs: {
                                small: "",
                                text: ""
                            },
                            on: {
                                click: function(t) {
                                    return e.openReview(n)
                                }
                            }
                        }, [t("Icon", {
                            attrs: {
                                name: "view",
                                label: e.LABEL.VIEW,
                                size: "small",
                                outline: ""
                            }
                        })], 1)], 1)]
                    })), e._v(" "), e._l(e.importedCredits, (function(n) {
                        return t("div", {
                            key: n
                        }, [t("p", {
                            staticClass: "MilestonesAssistLeadSummary__item"
                        }, [e._v("Imported event")])])
                    })), e._v(" "), t("ConfirmationDialog", {
                        attrs: {
                            model: e.showReviewDialog,
                            title: `Review (${e.title})`,
                            "hide-confirm": "",
                            "close-button-label": e.LABEL.CLOSE,
                            "close-dialog": () => {
                                e.showReviewDialog = !1
                            }
                        }
                    }, [t("div", {
                        attrs: {
                            slot: "content"
                        },
                        slot: "content"
                    }, [t("div", {
                        staticClass: "MilestonesAssistLeadSummary__dialog-question"
                    }, [e._v(e._s(e.reviewType[e.type].question))]), e._v(" "), t("div", {
                        staticClass: "MilestonesAssistLeadSummary__dialog-answer"
                    }, [e._v(e._s(e.reviewAnswer))])])])], 2)
                }), [], !1, null, "0f827d8c", null);
            t.default = component.exports;
            installComponents(component, {
                Icon: n(55).default,
                ConfirmationDialog: n(79).default
            })
        },
        942: function(e, t, n) {
            "use strict";
            n(922)
        },
        949: function(e, t, n) {
            e.exports = {}
        },
        950: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(235),
                o = n(234),
                l = {
                    props: {
                        loading: {
                            type: Boolean
                        },
                        overlay: {
                            type: Boolean
                        },
                        size: {
                            type: Number,
                            default: 50
                        },
                        overlayColor: {
                            type: String,
                            default: "#ffffff"
                        }
                    }
                },
                c = (n(961), n(9)),
                component = Object(c.a)(l, (function() {
                    var e = this._self._c;
                    return e("div", {
                        staticClass: "Loading"
                    }, [this.loading && this.overlay ? e(r.a, {
                        attrs: {
                            color: this.overlayColor,
                            opacity: "0.8"
                        }
                    }, [e(o.a, {
                        attrs: {
                            indeterminate: "",
                            size: this.size,
                            color: "primary"
                        }
                    })], 1) : this.loading ? e("div", [e(o.a, {
                        attrs: {
                            indeterminate: "",
                            size: this.size,
                            color: "primary"
                        }
                    })], 1) : this._e()], 1)
                }), [], !1, null, "f099b51a", null);
            t.default = component.exports
        },
        957: function(e, t, n) {
            e.exports = {}
        },
        958: function(e, t, n) {
            "use strict";
            n.d(t, "a", (function() {
                return o
            })), n.d(t, "b", (function() {
                return l
            }));
            var r = n(41);
            const o = {
                    sia_art_literature: "Art & Literature",
                    sia_stem_innovation: "STEM & Innovation",
                    sia_environment: "Environment",
                    sia_better_world: "Creating a Better World",
                    sia_growth_development: "Growth & Development",
                    sia_adventure_sport: "Adventure & Sport"
                },
                l = {};
            l[r.b.JOEY] = {
                areas: 2,
                projects: 6,
                hours: 2
            }, l[r.b.CUB] = {
                areas: 2,
                projects: 6,
                hours: 4
            }, l[r.b.SCOUT] = {
                areas: 3,
                projects: 6,
                hours: 8
            }, l[r.b.VENTURER] = {
                areas: 3,
                projects: 6,
                hours: 12
            }, l[r.b.ROVER] = {
                areas: 4,
                projects: 6,
                hours: 18
            }
        },
        960: function(e, t, n) {
            e.exports = {}
        },
        961: function(e, t, n) {
            "use strict";
            n(949)
        },
        964: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(1090),
                o = n(1092),
                l = n(1091),
                c = n(1089),
                d = n(1).a.extend({
                    name: "Accordion",
                    props: {
                        title: {
                            type: String,
                            required: !0
                        },
                        themeAlt: {
                            type: Boolean
                        }
                    }
                }),
                m = (n(995), n(9)),
                component = Object(m.a)(d, (function() {
                    var e = this._self._c;
                    this._self._setupProxy;
                    return e("div", {
                        staticClass: "Accordion",
                        class: {
                            "Accordion--theme-alt": this.themeAlt
                        }
                    }, [e(c.a, [e(r.a, {
                        staticClass: "Accordion__panel"
                    }, [e(l.a, [this._v(this._s(this.title))]), this._v(" "), e(o.a, [this._t("default")], 2)], 1)], 1)], 1)
                }), [], !1, null, null, null);
            t.default = component.exports
        },
        970: function(e, t, n) {
            e.exports = {}
        },
        971: function(e, t, n) {
            e.exports = {}
        },
        978: function(e, t, n) {
            e.exports = {}
        },
        979: function(e, t, n) {
            e.exports = {}
        },
        986: function(e, t, n) {
            "use strict";
            n(957)
        },
        990: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(886),
                o = n(885),
                l = n(1),
                c = n(5),
                d = l.a.extend({
                    name: "PeakAwardProgress",
                    components: {},
                    props: {
                        progress: {
                            type: Number,
                            required: !0
                        },
                        reviewing: {
                            type: Boolean,
                            default: !1
                        },
                        approved: {
                            type: Boolean,
                            default: !1
                        },
                        section: {
                            type: String,
                            required: !0
                        },
                        awardedViaImport: {
                            type: Boolean,
                            default: !1
                        },
                        awardedLabel: {
                            type: String,
                            required: !0
                        }
                    },
                    data: () => ({}),
                    computed: {
                        icon() {
                            return n(1030)(`./icon-peak-award-${this.section}-${this.completed||this.awardedViaImport?"active":"disabled"}.svg`)
                        },
                        awardName() {
                            return c.r[this.section]
                        },
                        completed() {
                            return 100 === this.progress
                        },
                        progressDisplay() {
                            return Math.ceil(this.progress).toString()
                        },
                        awardIconStyle() {
                            const e = this.approved ? "200px" : "128px";
                            return {
                                "min-width": e,
                                "min-height": e
                            }
                        },
                        descriptionText() {
                            return this.reviewing ? "progress towards the " + this.awardName : this.approved ? "congratulations. you have earned the" : "your progress towards the " + this.awardName
                        }
                    }
                }),
                m = (n(1031), n(9)),
                component = Object(m.a)(d, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", [t(o.a, {
                        attrs: {
                            justify: "center"
                        }
                    }, [t(r.a, {
                        attrs: {
                            cols: "auto"
                        }
                    }, [t("img", {
                        style: e.awardIconStyle,
                        attrs: {
                            src: e.icon,
                            alt: "icon"
                        }
                    })])], 1), e._v(" "), t(o.a, {
                        attrs: {
                            justify: "center"
                        }
                    }, [t(r.a, {
                        staticClass: "PeakAward_progressText",
                        attrs: {
                            cols: "auto"
                        }
                    }, [e._v(e._s(e.descriptionText))])], 1), e._v(" "), e.approved ? t(o.a, {
                        attrs: {
                            justify: "center"
                        }
                    }, [t(r.a, {
                        staticClass: "pt-0",
                        attrs: {
                            cols: "auto"
                        }
                    }, [t(o.a, {
                        staticClass: "PeakAward__awarded"
                    }, [e._v(e._s(e.awardName))]), e._v(" "), t(o.a, {
                        staticClass: "PeakAward__awarded_date pt-2"
                    }, [e._v(e._s(e.awardedLabel))])], 1)], 1) : t(o.a, {
                        staticClass: "mb-10",
                        attrs: {
                            justify: "center"
                        }
                    }, [t(r.a, {
                        staticClass: "PeakAward_progressValue",
                        attrs: {
                            cols: "auto"
                        }
                    }, [e._v(e._s(e.progressDisplay) + "%")])], 1)], 1)
                }), [], !1, null, null, null);
            t.default = component.exports
        },
        994: function(e, t, n) {
            e.exports = {}
        },
        995: function(e, t, n) {
            "use strict";
            n(960)
        }
    }
]);