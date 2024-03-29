(window.webpackJsonp = window.webpackJsonp || []).push([
    [6, 76, 77, 78, 110, 111, 112], {
        1002: function(e, t, o) {
            "use strict";
            o(970)
        },
        1003: function(e, t, o) {
            "use strict";
            o(971)
        },
        1021: function(e, t, o) {
            "use strict";
            o.r(t);
            var n = o(886),
                l = o(243),
                r = o(885),
                c = o(1),
                d = o(149),
                h = c.a.extend({
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
                            community: o(176),
                            outdoors: o(177),
                            creative: o(178),
                            personal_growth: o(179)
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
                m = (o(1002), o(9)),
                component = Object(m.a)(h, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", [t(r.a, {
                        staticClass: "MilestoneDialog__strong-row",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(n.a, [e._v("Participate")]), e._v(" "), t(n.a, {
                        staticClass: "MilestoneDialog__numbers",
                        attrs: {
                            cols: "3"
                        }
                    }, [e._v(e._s(e.totalParticipate) + " / " + e._s(e.maxParticipate))])], 1), e._v(" "), e._l(e.participations, (function(o) {
                        return t(r.a, {
                            key: o.challenge_area,
                            staticClass: "MilestoneDialog__normal-row",
                            attrs: {
                                "no-gutters": ""
                            }
                        }, [t(n.a, {
                            staticClass: "d-flex align-self-center",
                            attrs: {
                                cols: "auto"
                            }
                        }, [t("img", {
                            staticClass: "MilestoneDialog__icon",
                            attrs: {
                                src: e.icons[o.challenge_area],
                                alt: e.labels[o.challenge_area]
                            }
                        })]), e._v(" "), t(n.a, [e._v("\n      " + e._s(e.labels[o.challenge_area]) + "\n    ")]), e._v(" "), t(n.a, {
                            staticClass: "MilestoneDialog__numbers",
                            attrs: {
                                cols: "3"
                            }
                        }, [e._v(e._s(o.total) + " / " + e._s(e.maxParticipateEntry))])], 1)
                    })), e._v(" "), t(l.a, {
                        staticClass: "my-1"
                    }), e._v(" "), t(r.a, {
                        staticClass: "MilestoneDialog__strong-row",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(n.a, [e._v("Assist")]), e._v(" "), t(n.a, {
                        staticClass: "MilestoneDialog__numbers",
                        attrs: {
                            cols: "3"
                        }
                    }, [e._v(e._s(e.assist) + " / " + e._s(e.maxAssist))])], 1), e._v(" "), t(l.a, {
                        staticClass: "my-1"
                    }), e._v(" "), t(r.a, {
                        staticClass: "MilestoneDialog__strong-row",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(n.a, [e._v("Lead")]), e._v(" "), t(n.a, {
                        staticClass: "MilestoneDialog__numbers",
                        attrs: {
                            cols: "3"
                        }
                    }, [e._v(e._s(e.lead) + " / " + e._s(e.maxLead))])], 1)], 2)
                }), [], !1, null, "6ee7c5d4", null);
            t.default = component.exports
        },
        1022: function(e, t, o) {
            "use strict";
            o.r(t);
            var n = o(886),
                l = o(243),
                r = o(885),
                c = o(1),
                d = o(958),
                h = c.a.extend({
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
                m = (o(1003), o(9)),
                component = Object(m.a)(h, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", [t(r.a, {
                        staticClass: "SiaDialog__strong-row",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(n.a, [e._v("Projects completed")]), e._v(" "), t(n.a, {
                        staticClass: "SiaDialog__numbers",
                        attrs: {
                            cols: "3"
                        }
                    }, [e._v(e._s(e.projectsCompleted) + " / " + e._s(e.maxProjectsCompleted))])], 1), e._v(" "), t(l.a, {
                        staticClass: "my-1"
                    }), e._v(" "), t(r.a, {
                        staticClass: "SiaDialog__strong-row",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(n.a, [e._v("Areas completed")]), e._v(" "), t(n.a, {
                        staticClass: "SiaDialog__numbers",
                        attrs: {
                            cols: "3"
                        }
                    }, [e._v(e._s(e.areasCompleted) + " / " + e._s(e.maxAreasCompleted))])], 1), e._v(" "), t(r.a, {
                        staticClass: "SiaDialog__normal-row",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(n.a, [e._v("\n      " + e._s(e.areas) + "\n    ")])], 1), e._v(" "), t(l.a, {
                        staticClass: "my-1"
                    }), e._v(" "), t(r.a, {
                        staticClass: "SiaDialog__strong-row",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(n.a, [e._v("Projects in progress")]), e._v(" "), t(n.a, {
                        staticClass: "SiaDialog__numbers",
                        attrs: {
                            cols: "3"
                        }
                    }, [e._v(e._s(e.projectsInProgress))])], 1)], 1)
                }), [], !1, null, "29db777f", null);
            t.default = component.exports
        },
        1029: function(e, t, o) {
            "use strict";
            o(978)
        },
        1038: function(e, t, o) {
            "use strict";
            o.r(t);
            var n = o(886),
                l = o(243),
                r = o(885),
                c = o(1),
                d = o(5),
                h = o(28),
                m = c.a.extend({
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
                            return o(903)("./" + t)
                        },
                        label: e => Object(h.h)(e.replace("-", " ")),
                        stages(e) {
                            const t = this.oas.highest.filter(t => t.stream === e).map(e => e.stream === e.branch ? "Stage " + e.stage : `Stage ${e.stage} (${this.label(e.branch)})`);
                            return 0 === t.length && t.push("Not started"), t
                        }
                    }
                }),
                v = (o(1029), o(9)),
                component = Object(v.a)(m, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", [t(r.a, {
                        staticClass: "OasDialog__strong-row"
                    }, [t(n.a, [e._v("Core Skills")])], 1), e._v(" "), e._l(e.coreSkills, (function(o) {
                        return t(r.a, {
                            key: o,
                            staticClass: "OasDialog__normal-row"
                        }, [t(n.a, {
                            staticClass: "pl-0",
                            attrs: {
                                cols: "auto"
                            }
                        }, [t("img", {
                            staticClass: "OasDialog__icon",
                            attrs: {
                                src: e.icon(o),
                                alt: e.label(o)
                            }
                        })]), e._v(" "), t(n.a, [e._v("\n      " + e._s(e.label(o)) + "\n    ")]), e._v(" "), t(n.a, {
                            attrs: {
                                cols: "6"
                            }
                        }, e._l(e.stages(o), (function(o) {
                            return t(r.a, {
                                key: o,
                                staticClass: "OasDialog__inner-row"
                            }, [t(n.a, [e._v("\n          " + e._s(o) + "\n        ")])], 1)
                        })), 1)], 1)
                    })), e._v(" "), t(l.a, {
                        staticClass: "my-12"
                    }), e._v(" "), t(r.a, {
                        staticClass: "OasDialog__strong-row"
                    }, [t(n.a, [e._v("Specialist Skills")])], 1), e._v(" "), e._l(e.specialistSkills, (function(o) {
                        return t(r.a, {
                            key: o,
                            staticClass: "OasDialog__normal-row"
                        }, [t(n.a, {
                            staticClass: "pl-0",
                            attrs: {
                                cols: "auto"
                            }
                        }, [t("img", {
                            staticClass: "OasDialog__icon",
                            attrs: {
                                src: e.icon(o),
                                alt: e.label(o)
                            }
                        })]), e._v(" "), t(n.a, {
                            staticClass: "pr-0"
                        }, [e._v("\n      " + e._s(e.label(o)) + "\n    ")]), e._v(" "), t(n.a, {
                            attrs: {
                                cols: "6"
                            }
                        }, e._l(e.stages(o), (function(o) {
                            return t(r.a, {
                                key: o,
                                staticClass: "OasDialog__inner-row"
                            }, [t(n.a, [e._v("\n          " + e._s(o.replace(/-/g, " ")) + "\n        ")])], 1)
                        })), 1)], 1)
                    }))], 2)
                }), [], !1, null, "8e2fec9c", null);
            t.default = component.exports
        },
        1202: function(e, t, o) {
            "use strict";
            o.r(t);
            var n = o(870),
                l = o(1439),
                r = o(62),
                c = o(5),
                d = o(79),
                h = o(1342),
                m = o(1343),
                v = o(1344),
                _ = o(40),
                f = o(55),
                w = _.i.extend({
                    name: "GroupLifeMembersTable",
                    components: {
                        ConfirmationDialog: d.default,
                        MilestoneDialog: h.default,
                        SiaDialog: m.default,
                        OasDialog: v.default,
                        Icon: f.default
                    },
                    props: {
                        tableData: {
                            type: Array,
                            required: !0
                        },
                        section: {
                            type: String,
                            required: !0
                        }
                    },
                    data: () => ({
                        currentTooltip: null,
                        LABEL: c.i,
                        search: "",
                        displayMilestone: null,
                        displaySia: null,
                        displayOas: null
                    }),
                    computed: {
                        canManageUser() {
                            return this.$accessor.user.hasDutyAdultLeader || this.$accessor.user.hasRoleUnitLeader
                        },
                        showTooltip() {
                            return null !== this.$data.currentTooltip
                        },
                        tooltip() {
                            return null === this.$data.currentTooltip ? {
                                title: "",
                                content: []
                            } : this.tooltipData[this.$data.currentTooltip]
                        },
                        tooltipData() {
                            const e = {
                                    unit_attendance: {
                                        title: "Unit Activities Attendance",
                                        content: ["This is a total count of Unit activities that a youth member attended over the last 6 months."]
                                    },
                                    total_attendance: {
                                        title: "Total Attendance",
                                        content: ["This is a total count of activities (both Unit activities & non-Unit activities) attended over the last 6 months."]
                                    },
                                    current_milestone: {
                                        title: c.l.CURRENT_MILESTONE,
                                        content: ["Youth members gain Milestone achievements by participating, assisting and leading in activities in their section. These activities are based on the four Challenge Areas. There are three Milestones; each Milestone should take 6-12 months.", "This column shows the Milestone the youth member is currently undertaking."]
                                    },
                                    intro_to_scouts: {
                                        title: c.l.INTRO_SCOUTING,
                                        content: ["One of the first things to do joining the Scouting movement is to learn about Scouting. All youth members should complete Introduction to Scouting. This will help a youth member understand what Scouting is all about."]
                                    },
                                    intro_to_section: {
                                        title: c.l.INTRO_SECTION,
                                        content: ["Along with Introduction to Scouting, youth members should complete ‘Introduction to Section’. This covers what they will do in their section."]
                                    },
                                    personal_reflection: {
                                        title: c.l.PERSONAL_REFLECTION,
                                        content: ["Reflect on their journey through the section and the award."]
                                    },
                                    oas_progress: {
                                        title: c.l.OAS_PROGRESS,
                                        content: ["This column shows the Outdoor Adventure Skills a youth member is currently undertaking."]
                                    }
                                },
                                t = {
                                    peak_award: {
                                        title: c.l.PEAK_AWARD + " (Joey Scout)",
                                        content: ["Complete Milestone 3 in the Program Essentials.", "Complete Stage 1 in all three core Outdoor Adventure Skills areas (Bushwalking, Bushcraft and Camping).", "Complete 6 Special Interest Area badges in at least 2 different areas, each with a duration of at least 2 hours.", "Participate in an Adventurous Journey lasting at least 3 hours. Reflect on their journey through the section and the award.", "Reflect on their journey through the section and the award."]
                                    },
                                    intro_to_scouts: {
                                        title: c.l.INTRO_SCOUTING,
                                        content: ["One of the first things to do joining the Scouting movement is to learn about Scouting. All youth members should complete Introduction to Scouting. This will help a youth member understand what Scouting is all about. This should occur before investiture."]
                                    },
                                    intro_to_section: {
                                        title: c.l.INTRO_SECTION,
                                        content: ["When a youth member commences in a section, they should complete the Introduction to Section. This helps them to understand how the section works.", "This should occur before investiture or re-affirmation of promise."]
                                    },
                                    sia: {
                                        title: c.l.SIA,
                                        content: ["Peak Award requirement: complete 6 Special Interest Area badges in at least 2 different areas, each with a duration of at least 2 hours."]
                                    },
                                    adventurous_journey: {
                                        title: c.l.ADVENTUROUS_JOURNEY,
                                        content: ["Participate in an Adventurous Journey lasting at least 3 hours.", "The Adventurous Journey should occur while the youth member is working on Milestone 3."]
                                    },
                                    personal_reflection: {
                                        title: c.l.PERSONAL_REFLECTION,
                                        content: ["The personal reflection is the final element that a youth member completes towards their Peak Award. The youth member should reflect on their time in the section and their journey through their award.", "The personal reflection occurs with peers, supported by adults."]
                                    },
                                    oas_progress: {
                                        title: c.l.OAS_PROGRESS,
                                        content: ["This column shows the Outdoor Adventure Skills a youth member is currently undertaking", "Peak Award requirement: Peak Award recipients should have reached at least Stage 1 in each of the core areas (Bushwalking, Bushcraft and Camping)"]
                                    }
                                },
                                o = {
                                    peak_award: {
                                        title: c.l.PEAK_AWARD + " (Cub Scout)",
                                        content: ["Complete Milestone 3 in the Program Essentials.", "Complete 8 Stage progressions in the Outdoor Adventure Skills. Peak awardrecipients should have reached at least Stage 3 in the core areas (Bushwalking, Bushcraft and Camping).", "Complete 6 Special Interest Area badges in at least 2 different areas, each with a duration of at least 4 hours.", "Complete a Leadership or Personal Development Course of at least 1-day duration.", "Plan and lead an Adventurous Journey lasting at least 4 hours.", "Reflect on their journey through the section and the award."]
                                    },
                                    intro_to_scouts: {
                                        title: c.l.INTRO_SCOUTING,
                                        content: ["One of the first things to do joining the Scouting movement is to learn about Scouting. All youth members should complete Introduction to Scouting. This will help a youth member understand what Scouting is all about. This should occur before investiture."]
                                    },
                                    intro_to_section: {
                                        title: c.l.INTRO_SECTION,
                                        content: ["When a youth member commences in a section, they should complete the Introduction to Section. This helps them to understand how the section works.", "This should occur before investiture or re-affirmation of promise."]
                                    },
                                    sia: {
                                        title: c.l.SIA,
                                        content: ["Peak Award requirement: complete 6 Special Interest Area badges in at least 2 different areas, each with a duration of at least 4 hours."]
                                    },
                                    adventurous_journey: {
                                        title: c.l.ADVENTUROUS_JOURNEY,
                                        content: ["Peak Award requirement: Plan and lead an Adventurous Journey of at least 4 hours’ duration.", "The Adventurous Journey should occur while the youth member is working on Milestone 3."]
                                    },
                                    personal_reflection: {
                                        title: c.l.PERSONAL_REFLECTION,
                                        content: ["The personal reflection is the final element that a youth member completes towards their Peak Award. The youth member should reflect on their time in the section and their journey through their award.", "The personal reflection occurs with peers, supported by adults."]
                                    },
                                    oas_stage_progressions: {
                                        title: c.l.OAS_STAGE_PROGRESSION + " (Cub Scout)",
                                        content: ["Peak Award requirement: Complete 8 Stage progressions in the Outdoor Adventure Skills."]
                                    },
                                    personal_development: {
                                        title: c.l.PERSONAL_DEV_UNIT_MANAGEMENT,
                                        content: ["Peak Award requirement: complete a Leadership or Personal Development Course of at least 1-day duration."]
                                    },
                                    oas_progress: {
                                        title: c.l.OAS_PROGRESS,
                                        content: ["This column shows the Outdoor Adventure Skills a youth member is currently undertaking.", "Peak Award requirement: Peak Award recipients should have reached at least Stage 3 in the core areas (Bushwalking, Bushcraft and Camping) – any progressions experienced here count as part of their 8."]
                                    }
                                },
                                n = {
                                    peak_award: {
                                        title: c.l.PEAK_AWARD + " (Scout)",
                                        content: ["Complete Milestone 3 in the Program Essentials.", "Complete 10 stage progressions in the Outdoor Adventure Skills. Peak Award recipients should have reached at least Stage 5 in the core areas (Bushwalking, Bushcraft and Camping).", "Complete 6 Special Interest Area badges in at least 3 different areas, each involving at least 8 hours effort.", "Complete a Leadership or Personal Development Course of at least two days in duration.", "Plan and lead an Adventurous Journey of at least 3 days, 2 nights.", "Reflect on their journey through the section and the award."]
                                    },
                                    intro_to_scouts: {
                                        title: c.l.INTRO_SCOUTING,
                                        content: ["One of the first things to do joining the Scouting movement is to learn about Scouting. All youth members should complete Introduction to Scouting. This will help a youth member understand what Scouting is all about. This should occur before investiture."]
                                    },
                                    intro_to_section: {
                                        title: c.l.INTRO_SECTION,
                                        content: ["When a youth member commences in a section, they should complete the Introduction to Section. This helps them to understand how the section works.", "This should occur before investiture or re-affirmation of promise."]
                                    },
                                    sia: {
                                        title: c.l.SIA,
                                        content: ["Peak Award requirement: complete 6 Special Interest Area badges in at least 3 different areas, each with a duration of at least 8 hours."]
                                    },
                                    adventurous_journey: {
                                        title: c.l.ADVENTUROUS_JOURNEY,
                                        content: ["Peak Award requirement: Plan and lead an Adventurous Journey of at least 3 days, 2 nights.", "The Adventurous Journey should occur while the youth member is working on Milestone 3."]
                                    },
                                    personal_reflection: {
                                        title: c.l.PERSONAL_REFLECTION,
                                        content: ["The personal reflection is the final element that a youth member completes towards their Peak Award. The youth member should reflect on their time in the section and their journey through their award.", "The personal reflection occurs with peers, supported by adults."]
                                    },
                                    oas_stage_progressions: {
                                        title: c.l.OAS_STAGE_PROGRESSION + " (Scout)",
                                        content: ["Peak Award requirement: Complete 10 stage progressions in the Outdoor Adventure Skills."]
                                    },
                                    personal_development: {
                                        title: c.l.PERSONAL_DEV_UNIT_MANAGEMENT,
                                        content: ["Peak Award requirement: complete a Leadership or Personal Development Course of at least 2-days duration."]
                                    },
                                    oas_progress: {
                                        title: c.l.OAS_PROGRESS,
                                        content: ["This column shows the Outdoor Adventure Skills a youth member is currently undertaking.", "Peak Award requirement: Peak Award recipients should have reached at least Stage 5 in the core areas (Bushwalking, Bushcraft and Camping) – any progressions experienced here count as part of their 10."]
                                    }
                                },
                                l = {
                                    peak_award: {
                                        title: c.l.PEAK_AWARD + " (Venturer)",
                                        content: ["Complete Milestone 3 in the Program Essentials.", "Complete 12 Stage progressions in the Outdoor Adventure Skills (at least 4 of these should be at Stage 4 or above). Peak Award recipients should have reached at least Stage 5 in the core areas (Bushwalking, Bushcraft and Camping).", "Complete 6 Special Interest Area badges in at least 3 different areas, each involving at least 12 hours’ effort.", "Complete a Leadership or Personal Development Course of at least a weekend’s duration.", "Plan and lead an Adventurous Journey of at least 4 days, 3 nights.", "Reflect on their journey through the section and the award."]
                                    },
                                    intro_to_scouts: {
                                        title: c.l.INTRO_SCOUTING,
                                        content: ["One of the first things to do joining the Scouting movement is to learn about Scouting. All youth members should complete Introduction to Scouting. This will help a youth member understand what Scouting is all about. This should occur before investiture."]
                                    },
                                    intro_to_section: {
                                        title: c.l.INTRO_SECTION,
                                        content: ["When a youth member commences in a section, they should complete the Introduction to Section. This helps them to understand how the section works.", "This should occur before investiture or re-affirmation of promise."]
                                    },
                                    sia: {
                                        title: c.l.SIA,
                                        content: ["Peak Award requirement: complete 6 Special Interest Area badges in at least 3 different areas, each with a duration of at least 12 hours."]
                                    },
                                    adventurous_journey: {
                                        title: c.l.ADVENTUROUS_JOURNEY,
                                        content: ["Peak Award requirement: Plan and lead an Adventurous Journey of at least 4 days, 3 nights.", "The Adventurous Journey should occur while the youth member is working on Milestone 3."]
                                    },
                                    personal_reflection: {
                                        title: c.l.PERSONAL_REFLECTION,
                                        content: ["The personal reflection is the final element that a youth member completes towards their Peak Award. The youth member should reflect on their time in the section and their journey through their award.", "The personal reflection occurs with peers, supported by adults."]
                                    },
                                    oas_stage_progressions: {
                                        title: c.l.OAS_STAGE_PROGRESSION + " (Venturer)",
                                        content: ["Peak Award requirement: Complete 12 Stage progressions in the Outdoor Adventure Skills (at least 4 of these should be at Stage 4 or above)."]
                                    },
                                    personal_development: {
                                        title: c.l.PERSONAL_DEV_UNIT_MANAGEMENT,
                                        content: ["Peak Award requirement: complete a Leadership or Personal Development Course of at least 2-days duration."]
                                    },
                                    oas_progress: {
                                        title: c.l.OAS_PROGRESS,
                                        content: ["This column shows the Outdoor Adventure Skills a youth member is currently undertaking.", "Peak Award requirement:  Peak Award recipients should have reached at least Stage 5 in the core areas (Bushwalking, Bushcraft and Camping) – any progressions experienced here count as part of their 12."]
                                    }
                                },
                                r = {
                                    current_milestone: {
                                        title: c.l.CURRENT_MILESTONE,
                                        content: ["Youth members gain Milestone achievements by participating, assisting and leading in activities in their section. These activities are based on the four Challenge Areas. There are three Milestones; each Milestone should take 12 - 18 months.", "This column shows the Milestone the youth member is currently undertaking."]
                                    },
                                    peak_award: {
                                        title: c.l.PEAK_AWARD + " (Rover)",
                                        content: ["Complete Milestone 3 in the Program Essentials.", "Complete 14 Stage progressions in the Outdoor Adventure Skills (at least 6 of these should be at Stage 4 or above). Peak Award recipients should have reached at least Stage 5 in the core areas (Bushwalking, Bushcraft and Camping).", "Complete 6 Special Interest Area badges in at least 4 different areas, each involving at least 18 hours’ effort.", "Complete a Leadership or Personal Development Course of at least 30 hours’ duration.", "Plan and lead an Adventurous Journey of at least 4 days, 3 nights.", "Reflect on their journey through the section and the award."]
                                    },
                                    intro_to_scouts: {
                                        title: c.l.INTRO_SCOUTING,
                                        content: ["One of the first things to do joining the Scouting movement is to learn about Scouting. All youth members should complete Introduction to Scouting. This will help a youth member understand what Scouting is all about. This should occur before investiture."]
                                    },
                                    intro_to_section: {
                                        title: c.l.INTRO_SECTION,
                                        content: ["When a youth member commences in a section, they should complete the Introduction to Section. This helps them to understand how the section works.", "This should occur before investiture or re-affirmation of promise."]
                                    },
                                    sia: {
                                        title: c.l.SIA,
                                        content: ["Peak Award requirement: complete 6 Special Interest Area badges in at least 4 different areas, each with a duration of at least 18 hours."]
                                    },
                                    adventurous_journey: {
                                        title: c.l.ADVENTUROUS_JOURNEY,
                                        content: ["Peak Award requirement: Plan and lead an Adventurous Journey of at least 4 days, 3 nights.", "The Adventurous Journey should occur while the youth member is working on Milestone 3."]
                                    },
                                    personal_reflection: {
                                        title: c.l.PERSONAL_REFLECTION,
                                        content: ["The personal reflection is the final element that a youth member completes towards their Peak Award. The youth member should reflect on their time in the section and their journey through their award.", "The personal reflection occurs with peers, supported by adults."]
                                    },
                                    oas_stage_progressions: {
                                        title: c.l.OAS_STAGE_PROGRESSION + " (Rover)",
                                        content: ["Peak Award requirement: Complete 14 Stage progressions in the Outdoor Adventure Skills (at least 6 of these should be at Stage 4 or above)."]
                                    },
                                    personal_development: {
                                        title: c.l.PERSONAL_DEV_UNIT_MANAGEMENT,
                                        content: ["Peak Award requirement: complete a Leadership or Personal Development Course of at least 30 hours' duration."]
                                    },
                                    oas_progress: {
                                        title: c.l.OAS_PROGRESS,
                                        content: ["This column shows the Outdoor Adventure Skills a youth member is currently undertaking.", "Peak Award requirement: Peak Award recipients should have reached at least Stage 5 in the core areas (Bushwalking, Bushcraft and Camping) – any progressions experienced here count as part of their 14."]
                                    }
                                };
                            return "cub" === this.section ? { ...e,
                                ...o
                            } : "joey" === this.section ? { ...e,
                                ...t
                            } : "scout" === this.section ? { ...e,
                                ...n
                            } : "rover" === this.section ? { ...e,
                                ...r
                            } : "venturer" === this.section ? { ...e,
                                ...l
                            } : e
                        },
                        isTableDataReady() {
                            return this.tableData.length > 0
                        },
                        headers() {
                            const e = [{
                                    text: "Unit member",
                                    value: "name",
                                    width: 180
                                }, {
                                    text: "Age",
                                    value: "age",
                                    width: 140
                                }, {
                                    text: "Unit Activities Attendance",
                                    value: "unit_attendance",
                                    width: 140
                                }, {
                                    text: "Total Attendance",
                                    value: "total_attendance",
                                    width: 140
                                }, {
                                    text: "Current Milestone",
                                    value: "current_milestone",
                                    width: 140
                                }, {
                                    text: "Previous Milestone awards",
                                    value: "previous_milestone_awards",
                                    width: 205
                                }, {
                                    text: "Peak Award",
                                    value: "peak_award",
                                    width: 140
                                }, {
                                    text: "Special Interest Areas",
                                    value: "sia",
                                    width: 140
                                }, {
                                    text: "Outdoor Adventure Skills Progress",
                                    value: "oas_progress",
                                    width: 180
                                }, {
                                    text: "OAS Stage Progressions",
                                    value: "oas_stage_progressions",
                                    width: 140
                                }, {
                                    text: "Introduction to Scouting",
                                    value: "intro_to_scouts",
                                    width: 140
                                }, {
                                    text: "Introduction to Section",
                                    value: "intro_to_section",
                                    width: 140
                                }, {
                                    text: "Personal Development Course",
                                    value: "personal_development",
                                    width: 200
                                }, {
                                    text: "Adventurous Journey",
                                    value: "adventurous_journey",
                                    width: 140
                                }, {
                                    text: "Personal Reflection",
                                    value: "personal_reflection",
                                    width: 140
                                }, {
                                    text: "Action",
                                    value: "manage_user",
                                    width: 130
                                }],
                                t = ["oas_stage_progressions", "personal_development"];
                            return "joey" === this.section ? e.filter(e => !t.includes(e.value)) : e
                        }
                    },
                    methods: {
                        milestonesAchievements(e) {
                            return e.awarded ? `Milestone ${e.milestone} - ${this.achievedDate(e,!1)}` : e.milestone ? "-" : `Milestone ${e.milestone} - Not complete`
                        },
                        setTooltip(e) {
                            this.$data.currentTooltip = e
                        },
                        closeTooltip() {
                            this.$data.currentTooltip = null
                        },
                        columnHasTooltip(header) {
                            return void 0 !== this.tooltipData[header.value]
                        },
                        milestoneClass: e => e.has_milestone ? "GroupLifeMembersTable__showModal" : "",
                        showMilestone(e) {
                            e.has_milestone && (this.$data.displayMilestone = e.metrics)
                        },
                        hideMilestone() {
                            this.$data.displayMilestone = null
                        },
                        showSia(e) {
                            this.$data.displaySia = e.metrics
                        },
                        hideSia() {
                            this.$data.displaySia = null
                        },
                        showOas(e) {
                            this.$data.displayOas = e.metrics
                        },
                        hideOas() {
                            this.$data.displayOas = null
                        }
                    }
                }),
                y = (o(1393), o(9)),
                component = Object(y.a)(w, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", {
                        staticClass: "GroupLifeMembersTable"
                    }, [t(r.a, {
                        staticClass: "GroupLifeMembersTable__search",
                        attrs: {
                            "append-icon": "mdi-magnify",
                            label: "Search",
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
                    }), e._v(" "), t(l.a, {
                        staticClass: "GroupLifeMembersTable__table",
                        attrs: {
                            headers: e.headers,
                            items: e.tableData,
                            loading: !e.isTableDataReady,
                            "item-key": "id",
                            "hide-default-header": e.$vuetify.breakpoint.smAndUp,
                            "disable-sort": "",
                            search: e.search
                        },
                        scopedSlots: e._u([{
                            key: "header",
                            fn: function(o) {
                                let {
                                    props: {
                                        headers: n,
                                        mobile: l
                                    }
                                } = o;
                                return [l ? e._e() : t("thead", {
                                    staticClass: "v-data-table-header"
                                }, [t("tr", e._l(n, (function(header) {
                                    return t("th", {
                                        key: header.name,
                                        staticClass: "GroupLifeMembersTable__table-header text-start",
                                        style: {
                                            width: header.width + "px",
                                            "min-width": header.width + "px"
                                        },
                                        attrs: {
                                            scope: "col"
                                        }
                                    }, [t("div", {
                                        staticClass: "d-flex align-center"
                                    }, [t("div", {
                                        staticStyle: {
                                            "white-space": "initial"
                                        }
                                    }, [e._v(e._s(header.text))]), e._v(" "), e.columnHasTooltip(header) ? t("Icon", {
                                        staticClass: "ml-2",
                                        staticStyle: {
                                            "min-width": "24px"
                                        },
                                        attrs: {
                                            name: "info",
                                            clickable: ""
                                        },
                                        on: {
                                            keydown: function(t) {
                                                return e.setTooltip(header.value)
                                            }
                                        },
                                        nativeOn: {
                                            click: function(t) {
                                                return t.stopPropagation(), e.setTooltip(header.value)
                                            }
                                        }
                                    }) : e._e()], 1)])
                                })), 0)])]
                            }
                        }, {
                            key: "item.current_milestone",
                            fn: function(o) {
                                let {
                                    item: n
                                } = o;
                                return [t("div", {
                                    class: e.milestoneClass(n),
                                    on: {
                                        click: function(t) {
                                            return e.showMilestone(n)
                                        },
                                        keydown: function(t) {
                                            return e.showMilestone(n)
                                        }
                                    }
                                }, [e._v("\n        " + e._s(n.current_milestone) + "\n      ")])]
                            }
                        }, {
                            key: "item.previous_milestone_awards",
                            fn: function(o) {
                                let {
                                    item: n
                                } = o;
                                return [n.metrics.milestones.length ? t("div", e._l(n.metrics.milestones, (function(o, n) {
                                    return t("div", {
                                        key: n,
                                        staticClass: "GroupLifeMembersTable__prev-milestone"
                                    }, [e._v("\n          " + e._s(e.milestonesAchievements(o)) + "\n        ")])
                                })), 0) : t("div", [e._v("-")])]
                            }
                        }, {
                            key: "item.sia",
                            fn: function(o) {
                                let {
                                    item: n
                                } = o;
                                return [t("div", {
                                    staticClass: "GroupLifeMembersTable__showModal",
                                    on: {
                                        click: function(t) {
                                            return e.showSia(n)
                                        },
                                        keydown: function(t) {
                                            return e.showSia(n)
                                        }
                                    }
                                }, [e._v("\n        " + e._s(n.sia) + "\n      ")])]
                            }
                        }, {
                            key: "item.oas_progress",
                            fn: function(o) {
                                let {
                                    item: n
                                } = o;
                                return [t("div", {
                                    staticClass: "GroupLifeMembersTable__showModal",
                                    on: {
                                        click: function(t) {
                                            return e.showOas(n)
                                        },
                                        keydown: function(t) {
                                            return e.showOas(n)
                                        }
                                    }
                                }, [e._v("\n        " + e._s(n.oas_progress) + "\n      ")])]
                            }
                        }, {
                            key: "item.manage_user",
                            fn: function(o) {
                                let {
                                    item: l
                                } = o;
                                return [t("div", [t(n.a, {
                                    staticClass: "px-0",
                                    attrs: {
                                        disabled: !e.canManageAchievementPathways(l.metrics.member_id) || !e.canManageUser,
                                        small: "",
                                        text: ""
                                    },
                                    on: {
                                        click: function(t) {
                                            return e.openManageUserDialogGroupLife(l.metrics)
                                        }
                                    }
                                }, [e._v("\n          Manage Achievement Pathways\n        ")])], 1)]
                            }
                        }])
                    }), e._v(" "), t("ConfirmationDialog", {
                        attrs: {
                            title: e.tooltip.title,
                            model: e.showTooltip,
                            "hide-confirm": "",
                            "close-button-label": e.LABEL.CLOSE,
                            "close-dialog": e.closeTooltip
                        }
                    }, [t("template", {
                        slot: "content"
                    }, e._l(e.tooltip.content, (function(o, i) {
                        return t("p", {
                            key: i
                        }, [e._v("\n        " + e._s(o) + "\n      ")])
                    })), 0)], 2), e._v(" "), t("milestone-dialog", {
                        attrs: {
                            metrics: e.displayMilestone
                        },
                        on: {
                            close: e.hideMilestone
                        }
                    }), e._v(" "), t("sia-dialog", {
                        attrs: {
                            metrics: e.displaySia,
                            section: e.section
                        },
                        on: {
                            close: e.hideSia
                        }
                    }), e._v(" "), t("oas-dialog", {
                        attrs: {
                            metrics: e.displayOas
                        },
                        on: {
                            close: e.hideOas
                        }
                    }), e._v(" "), t("ConfirmationDialog", {
                        attrs: {
                            model: e.manageUserDialog,
                            title: "Manage Achievement Pathways",
                            subtitle: e.manageSubtitle,
                            "confirm-button-label": e.LABEL.CONTINUE,
                            "close-button-label": e.LABEL.CANCEL,
                            "confirm-callback": e.actOnBehalfOfMember,
                            "close-dialog": () => e.manageUserDialog = !1
                        }
                    })], 1)
                }), [], !1, null, null, null);
            t.default = component.exports;
            installComponents(component, {
                Icon: o(55).default,
                ConfirmationDialog: o(79).default
            })
        },
        1292: function(e, t, o) {
            e.exports = {}
        },
        1342: function(e, t, o) {
            "use strict";
            o.r(t);
            var n = o(1),
                l = o(79),
                r = o(1021),
                c = o(5),
                d = n.a.extend({
                    name: "MilestoneDialog",
                    components: {
                        ConfirmationDialog: l.default,
                        MilestoneMetricsDisplay: r.default
                    },
                    props: {
                        metrics: {
                            type: Object,
                            default: null
                        }
                    },
                    data: () => ({
                        LABEL: c.i
                    }),
                    computed: {
                        milestone() {
                            var e;
                            return null === (e = this.metrics) || void 0 === e ? void 0 : e.milestone
                        },
                        show() {
                            return null != this.metrics
                        },
                        title() {
                            var e;
                            return "Milestone " + (null === (e = this.milestone) || void 0 === e ? void 0 : e.milestone)
                        },
                        subtitle() {
                            var e;
                            return null === (e = this.metrics) || void 0 === e ? void 0 : e.name.toUpperCase()
                        }
                    },
                    beforeDestroy() {
                        this.$emit("close")
                    },
                    methods: {
                        close() {
                            this.$emit("close")
                        }
                    }
                }),
                h = o(9),
                component = Object(h.a)(d, (function() {
                    var e = this._self._c;
                    this._self._setupProxy;
                    return e("ConfirmationDialog", {
                        staticClass: "MilestoneDialog",
                        attrs: {
                            title: this.title,
                            subtitle: this.subtitle,
                            model: this.show,
                            "hide-confirm": "",
                            "close-button-label": this.LABEL.CLOSE,
                            "close-dialog": this.close
                        }
                    }, [e("template", {
                        slot: "content"
                    }, [e("milestone-metrics-display", {
                        attrs: {
                            metrics: this.metrics
                        }
                    })], 1)], 2)
                }), [], !1, null, "40bef0ff", null);
            t.default = component.exports;
            installComponents(component, {
                ConfirmationDialog: o(79).default
            })
        },
        1343: function(e, t, o) {
            "use strict";
            o.r(t);
            var n = o(1),
                l = o(5),
                r = o(1022),
                c = n.a.extend({
                    name: "SiaDialog",
                    components: {
                        SiaMetricsDisplay: r.default
                    },
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
                    data: () => ({
                        LABEL: l.i
                    }),
                    computed: {
                        show() {
                            return null != this.metrics
                        },
                        subtitle() {
                            var e;
                            return null === (e = this.metrics) || void 0 === e ? void 0 : e.name.toUpperCase()
                        }
                    },
                    methods: {
                        close() {
                            this.$emit("close")
                        }
                    }
                }),
                d = o(9),
                component = Object(d.a)(c, (function() {
                    var e = this._self._c;
                    this._self._setupProxy;
                    return e("ConfirmationDialog", {
                        staticClass: "SiaDialog",
                        attrs: {
                            title: "Special Interest Areas",
                            subtitle: this.subtitle,
                            model: this.show,
                            "hide-confirm": "",
                            "close-button-label": this.LABEL.CLOSE,
                            "close-dialog": this.close
                        }
                    }, [e("template", {
                        slot: "content"
                    }, [e("sia-metrics-display", {
                        attrs: {
                            section: this.section,
                            metrics: this.metrics
                        }
                    })], 1)], 2)
                }), [], !1, null, "3f1b1c92", null);
            t.default = component.exports;
            installComponents(component, {
                ConfirmationDialog: o(79).default
            })
        },
        1344: function(e, t, o) {
            "use strict";
            o.r(t);
            var n = o(1),
                l = o(79),
                r = o(1038),
                c = o(5),
                d = n.a.extend({
                    name: "OasDialog",
                    components: {
                        ConfirmationDialog: l.default,
                        OasMetricsDisplay: r.default
                    },
                    props: {
                        metrics: {
                            type: Object,
                            default: null
                        }
                    },
                    data: () => ({
                        LABEL: c.i
                    }),
                    computed: {
                        show() {
                            return null != this.metrics
                        },
                        subtitle() {
                            var e;
                            return null === (e = this.metrics) || void 0 === e ? void 0 : e.name.toUpperCase()
                        }
                    },
                    methods: {
                        close() {
                            this.$emit("close")
                        }
                    }
                }),
                h = o(9),
                component = Object(h.a)(d, (function() {
                    var e = this._self._c;
                    this._self._setupProxy;
                    return e("ConfirmationDialog", {
                        staticClass: "OasDialog",
                        attrs: {
                            title: "Outdoor Adventure Skills Progress",
                            subtitle: this.subtitle,
                            model: this.show,
                            "hide-confirm": "",
                            "close-button-label": this.LABEL.CLOSE,
                            "close-dialog": this.close
                        }
                    }, [e("template", {
                        slot: "content"
                    }, [e("oas-metrics-display", {
                        attrs: {
                            metrics: this.metrics
                        }
                    })], 1)], 2)
                }), [], !1, null, "099d8fa9", null);
            t.default = component.exports;
            installComponents(component, {
                ConfirmationDialog: o(79).default
            })
        },
        1393: function(e, t, o) {
            "use strict";
            o(1292)
        },
        903: function(e, t, o) {
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

            function n(e) {
                var t = l(e);
                return o(t)
            }

            function l(e) {
                if (!o.o(map, e)) {
                    var t = new Error("Cannot find module '" + e + "'");
                    throw t.code = "MODULE_NOT_FOUND", t
                }
                return map[e]
            }
            n.keys = function() {
                return Object.keys(map)
            }, n.resolve = l, e.exports = n, n.id = 903
        },
        958: function(e, t, o) {
            "use strict";
            o.d(t, "a", (function() {
                return l
            })), o.d(t, "b", (function() {
                return r
            }));
            var n = o(41);
            const l = {
                    sia_art_literature: "Art & Literature",
                    sia_stem_innovation: "STEM & Innovation",
                    sia_environment: "Environment",
                    sia_better_world: "Creating a Better World",
                    sia_growth_development: "Growth & Development",
                    sia_adventure_sport: "Adventure & Sport"
                },
                r = {};
            r[n.b.JOEY] = {
                areas: 2,
                projects: 6,
                hours: 2
            }, r[n.b.CUB] = {
                areas: 2,
                projects: 6,
                hours: 4
            }, r[n.b.SCOUT] = {
                areas: 3,
                projects: 6,
                hours: 8
            }, r[n.b.VENTURER] = {
                areas: 3,
                projects: 6,
                hours: 12
            }, r[n.b.ROVER] = {
                areas: 4,
                projects: 6,
                hours: 18
            }
        },
        970: function(e, t, o) {
            e.exports = {}
        },
        971: function(e, t, o) {
            e.exports = {}
        },
        978: function(e, t, o) {
            e.exports = {}
        }
    }
]);