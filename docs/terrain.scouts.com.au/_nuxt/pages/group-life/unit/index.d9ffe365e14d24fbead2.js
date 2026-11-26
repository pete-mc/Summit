(window.webpackJsonp = window.webpackJsonp || []).push([
    [192, 176], {
        1054: function(e, t, r) {
            e.exports = {}
        },
        1128: function(e, t, r) {
            "use strict";
            r(1054)
        },
        1143: function(e, t, r) {
            "use strict";
            r.r(t);
            var n = r(870),
                o = r(886),
                c = r(885),
                l = r(11),
                m = r.n(l),
                d = r(42),
                h = r(23),
                _ = r.n(h),
                f = r(40),
                v = r(4),
                w = r(933),
                $ = f.z.extend({
                    name: "UnitLife",
                    props: {
                        backButtonConfig: {
                            type: Object,
                            required: !0
                        }
                    },
                    data: () => ({
                        metrics: [],
                        retrievedDate: null,
                        isLoading: !0,
                        isReady: !1
                    }),
                    computed: {
                        unitName() {
                            return this.unit.name
                        },
                        section() {
                            return this.$storeUser.hasRoleGroupLeader ? this.unit.section : this.$accessor.user.getCurrentMemberSection
                        },
                        unit() {
                            return this.$storeUser.hasRoleGroupLeader || this.$storeUser.hasRoleSupportLeaderReadOrWrite ? this.$accessor.me.getCurrentUnit : this.$accessor.user.getUnit
                        }
                    },
                    mounted() {
                        this.initData()
                    },
                    methods: {
                        async initData() {
                            await this.loadData(!1), this.isReady = !0
                        },
                        async loadData(e) {
                            const t = this.unit.id;
                            if (t) {
                                const data = await this.getMemberMetrics(t, e);
                                this.$data.metrics = data.results.map(e => new w.b(e)), this.$data.retrievedDate = data.retrieved_date
                            }
                        },
                        getMemberMetrics(e, t) {
                            this.isLoading = !0;
                            const r = new Promise((r, n) => {
                                this.handleRequest({
                                    axiosRequest: m.a.get,
                                    url: `${this.$config.api.metrics}${v.UNITS_PATH}/${e}${v.MEMBERS_PATH}?limit=999&force=${t?1:0}`,
                                    body: {},
                                    successResponseCode: _.a.OK,
                                    responseHandler: e => {
                                        const data = e.data;
                                        r(data)
                                    },
                                    errorHandler: e => {
                                        d.c("Error: " + e.message), n(e)
                                    }
                                })
                            });
                            return r.finally(() => {
                                this.isLoading = !1
                            }), r
                        }
                    }
                }),
                L = (r(1128), r(9)),
                component = Object(L.a)($, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t(c.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e.isReady && e.backButtonConfig.enabled ? t("NavLink", {
                        attrs: {
                            direction: "left",
                            text: e.backButtonConfig.label
                        },
                        nativeOn: {
                            click: function(t) {
                                return e.$router.push({
                                    name: e.backButtonConfig.pathName,
                                    params: {
                                        groupId: e.$route.params.groupId
                                    }
                                })
                            },
                            keydown: function(t) {
                                return e.$router.push({
                                    name: e.backButtonConfig.pathName,
                                    params: {
                                        groupId: e.$route.params.groupId
                                    }
                                })
                            }
                        }
                    }) : e._e(), e._v(" "), t(o.a, {
                        attrs: {
                            sm: "12",
                            md: "12",
                            lg: "12"
                        }
                    }, [t("section", {
                        staticClass: "UnitLife"
                    }, [t(c.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(o.a, {
                        staticClass: "d-flex flex-row flex-wrap justify-space-between"
                    }, [t("section", {
                        staticClass: "MembersOverview__header"
                    }, [t("h1", {
                        staticClass: "MembersOverview__title"
                    }, [e._v(e._s(e.unitName))])]), e._v(" "), t("div", {
                        staticClass: "d-flex flex-column align-end"
                    }, [t("div", {
                        staticClass: "d-flex flex-row align-center"
                    }, [t(n.a, {
                        staticClass: "ml-3",
                        attrs: {
                            outlined: "",
                            disabled: e.isLoading || e.$nuxt.isOffline
                        },
                        on: {
                            click: function(t) {
                                return e.loadData(!0)
                            }
                        }
                    }, [e._v("\n                " + e._s(e.isLoading ? "Refreshing data..." : "Refresh") + "\n              ")])], 1), e._v(" "), e.retrievedDate ? t("div", {
                        staticClass: "MembersOverview__retrieved-date mt-2"
                    }, [e._v("\n              Displaying data from: " + e._s(e.formatLongDate(e.retrievedDate)) + "\n            ")]) : e._e()])])], 1), e._v(" "), t(c.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(o.a, [t("section", {
                        staticClass: "MembersOverview__main"
                    }, [t("div", {
                        staticClass: "MembersOverview__table"
                    }, [e.isReady ? t("GroupLifeMembersTable", {
                        attrs: {
                            "table-data": e.metrics,
                            section: e.section
                        }
                    }) : e._e()], 1)])])], 1)], 1)])], 1)
                }), [], !1, null, "a15101f8", null);
            t.default = component.exports;
            installComponents(component, {
                NavLink: r(100).default,
                GroupLifeMembersTable: r(1202).default
            })
        },
        1470: function(e, t, r) {
            "use strict";
            r.r(t);
            var n = r(1),
                o = r(3),
                c = r(5),
                l = n.a.extend({
                    name: "GroupLifeUnitPage",
                    created() {
                        this.$accessor.user.hasRoleGroupLeader || this.$accessor.user.hasRoleUnitCouncil || this.$accessor.user.hasRoleUnitLeader || this.$accessor.user.hasRoleUnitLeader || this.$accessor.user.hasRoleSupportLeaderReadWrite || this.$nuxt.error({
                            statusCode: 404,
                            message: ""
                        }), this.$accessor.global.setBreadcrumbs([{
                            text: c.l.GROUP_LIFE,
                            to: o.GROUP_LIFE,
                            exact: !0,
                            disabled: !1
                        }, {
                            text: "Unit",
                            exact: !0,
                            disabled: !0
                        }])
                    }
                }),
                m = r(9),
                component = Object(m.a)(l, (function() {
                    var e = this._self._c;
                    this._self._setupProxy;
                    return e("UnitLife", {
                        attrs: {
                            "back-button-config": {
                                enabled: !0,
                                label: "Back to Group Life",
                                pathName: "group-life"
                            }
                        }
                    })
                }), [], !1, null, "48088bb2", null);
            t.default = component.exports;
            installComponents(component, {
                UnitLife: r(1143).default
            })
        },
        933: function(e, t, r) {
            "use strict";
            r.d(t, "d", (function() {
                return c
            })), r.d(t, "a", (function() {
                return l
            })), r.d(t, "c", (function() {
                return m
            })), r.d(t, "b", (function() {
                return d
            }));
            var n, o = r(171);
            ! function(e) {
                e.Community = "community", e.Outdoors = "outdoors", e.Creative = "creative", e.PersonalGrowth = "personal_growth"
            }(n || (n = {}));
            class c {
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
            class l {
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
            const m = {
                milestones: 30,
                oas: 30,
                sia: 25,
                personal_development: 5,
                personal_reflection: 2,
                adventurous_journey: 8,
                total: 100
            };
            class d {
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
        }
    }
]);