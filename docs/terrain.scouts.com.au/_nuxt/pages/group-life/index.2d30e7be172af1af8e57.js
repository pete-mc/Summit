(window.webpackJsonp = window.webpackJsonp || []).push([
    [191, 79, 80, 165], {
        1035: function(t, e, r) {
            "use strict";
            r.r(e);
            var o = r(236),
                n = r(35),
                l = r(890),
                c = r(237),
                d = r(1).a.extend({
                    name: "ProgressBar",
                    props: {
                        text: {
                            type: String,
                            default: ""
                        },
                        processing: {
                            type: Boolean
                        },
                        progress: {
                            type: Number,
                            default: 0
                        },
                        indeterminate: {
                            type: Boolean
                        }
                    },
                    computed: {
                        show() {
                            return this.processing
                        },
                        status() {
                            return this.progress
                        }
                    }
                }),
                m = (r(1051), r(9)),
                component = Object(m.a)(d, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e(l.a, {
                        attrs: {
                            "hide-overlay": "",
                            persistent: "",
                            width: "496"
                        },
                        model: {
                            value: t.show,
                            callback: function(e) {
                                t.show = e
                            },
                            expression: "show"
                        }
                    }, [e(o.a, {
                        staticClass: "ProgressBar__dialog_card",
                        attrs: {
                            color: "white",
                            dark: ""
                        }
                    }, [e(n.c, [e("p", {
                        staticClass: "ProgressBar__text"
                    }, [t._v(t._s(t.text))]), t._v(" "), e(c.a, {
                        attrs: {
                            indeterminate: t.indeterminate,
                            color: "var(--color-base-blue)",
                            "background-color": "var(--color-light-charcoal)"
                        },
                        model: {
                            value: t.status,
                            callback: function(e) {
                                t.status = e
                            },
                            expression: "status"
                        }
                    }), t._v(" "), t.progress ? e("p", {
                        staticClass: "ProgressBar__progress_percentage"
                    }, [t._v(t._s(Math.ceil(t.progress)) + "%")]) : t._e()], 1)], 1)], 1)
                }), [], !1, null, "881def16", null);
            e.default = component.exports
        },
        1050: function(t, e, r) {
            t.exports = {}
        },
        1051: function(t, e, r) {
            "use strict";
            r(996)
        },
        1093: function(t, e, r) {
            t.exports = {}
        },
        1124: function(t, e, r) {
            "use strict";
            r(1050)
        },
        1139: function(t, e, r) {
            "use strict";
            r.r(e);
            var o = r(1439),
                n = r(5),
                l = r(79),
                c = r(40),
                d = r(55),
                m = r(933),
                h = c.E.extend({
                    name: "UnitsTable",
                    components: {
                        ConfirmationDialog: l.default,
                        Icon: d.default
                    },
                    props: {
                        tableData: {
                            type: Array,
                            required: !0
                        }
                    },
                    data: () => ({
                        currentTooltip: null,
                        LABEL: n.i
                    }),
                    computed: {
                        hasUnitLifePermission() {
                            return this.$accessor.user.hasRoleSupportLeaderReadWrite || this.$accessor.user.hasRoleGroupLeader
                        },
                        formattedTableData() {
                            return this.tableData.map(t => new m.d(t))
                        },
                        showTooltip() {
                            return null !== this.$data.currentTooltip
                        },
                        tooltip() {
                            if (null === this.$data.currentTooltip) return {
                                title: "",
                                content: ""
                            };
                            return {
                                avg_attendance: {
                                    title: "Average Attendance",
                                    content: "Average attendance is the average number of activities a member attended over a period of 6 months."
                                },
                                total_progressions: {
                                    title: "Total Stage Progressions",
                                    content: "This is a tally of Outdoor Adventure Skills Stage Progressions of every youth member in a Unit."
                                }
                            }[this.$data.currentTooltip]
                        },
                        isTableDataReady() {
                            return !this.tableData
                        },
                        headers: () => [{
                            text: "Unit",
                            value: "name",
                            width: 160,
                            sortable: !1
                        }, {
                            text: "Avg. Attendance",
                            value: "avg_attendance",
                            tooltip: "avg_attendance",
                            width: 120,
                            sortable: !1
                        }, {
                            text: "Milestone 1 completion",
                            value: "milestone_one",
                            width: 120,
                            sortable: !1
                        }, {
                            text: "Milestone 2 completion",
                            value: "milestone_two",
                            width: 120,
                            sortable: !1
                        }, {
                            text: "Milestone 3 completion",
                            value: "milestone_three",
                            width: 120,
                            sortable: !1
                        }, {
                            text: "Special Interest Area projects completed",
                            value: "sia_completed",
                            width: 145,
                            sortable: !1
                        }, {
                            text: "Special Interest Area projects in progress",
                            value: "sia_inprogress",
                            width: 145,
                            sortable: !1
                        }, {
                            text: "Total Stage Progressions",
                            value: "oas_total_progressions",
                            tooltip: "total_progressions",
                            width: 120,
                            sortable: !1
                        }]
                    },
                    methods: {
                        gotoUnitLifePage(t) {
                            this.$emit("gotoUnitLife", t.unit_id)
                        },
                        setTooltip(t) {
                            this.$data.currentTooltip = t
                        },
                        closeTooltip() {
                            this.$data.currentTooltip = null
                        }
                    }
                }),
                _ = (r(1124), r(9)),
                component = Object(_.a)(h, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "UnitsTable"
                    }, [e(o.a, {
                        attrs: {
                            headers: t.headers,
                            items: t.formattedTableData,
                            loading: t.isTableDataReady,
                            "item-key": "id",
                            "hide-default-header": t.$vuetify.breakpoint.smAndUp
                        },
                        scopedSlots: t._u([{
                            key: "header",
                            fn: function(r) {
                                let {
                                    props: {
                                        headers: o,
                                        mobile: n
                                    }
                                } = r;
                                return [n ? t._e() : e("thead", {
                                    staticClass: "v-data-table-header"
                                }, [e("tr", t._l(o, (function(header) {
                                    return e("th", {
                                        key: header.name,
                                        staticClass: "UnitsTable__header text-start",
                                        style: {
                                            width: header.width + "px",
                                            "min-width": header.width + "px"
                                        },
                                        attrs: {
                                            scope: "col"
                                        }
                                    }, [e("div", {
                                        staticClass: "d-flex align-center"
                                    }, [e("div", {
                                        staticStyle: {
                                            "white-space": "initial"
                                        }
                                    }, [t._v(t._s(header.text))]), t._v(" "), header.tooltip ? e("Icon", {
                                        staticClass: "ml-2",
                                        staticStyle: {
                                            "min-width": "24px"
                                        },
                                        attrs: {
                                            name: "info",
                                            clickable: ""
                                        },
                                        on: {
                                            keydown: function(e) {
                                                return t.setTooltip(header.tooltip)
                                            }
                                        },
                                        nativeOn: {
                                            click: function(e) {
                                                return e.stopPropagation(), t.setTooltip(header.tooltip)
                                            }
                                        }
                                    }) : t._e()], 1)])
                                })), 0)])]
                            }
                        }, {
                            key: "item.name",
                            fn: function(r) {
                                let {
                                    item: o
                                } = r;
                                return [e("div", {
                                    class: {
                                        "UnitsTable__unit-name": t.hasUnitLifePermission
                                    },
                                    on: {
                                        click: function(e) {
                                            t.hasUnitLifePermission && t.gotoUnitLifePage(o)
                                        },
                                        keydown: function(e) {
                                            t.hasUnitLifePermission && t.gotoUnitLifePage(o)
                                        }
                                    }
                                }, [t._v("\n        " + t._s(o.name) + "\n      ")])]
                            }
                        }])
                    }), t._v(" "), e("ConfirmationDialog", {
                        attrs: {
                            title: t.tooltip.title,
                            model: t.showTooltip,
                            "hide-confirm": "",
                            "close-button-label": t.LABEL.CLOSE,
                            "close-dialog": t.closeTooltip
                        }
                    }, [e("template", {
                        slot: "content"
                    }, [t._v("\n      " + t._s(t.tooltip.content) + "\n    ")])], 2)], 1)
                }), [], !1, null, null, null);
            e.default = component.exports;
            installComponents(component, {
                Icon: r(55).default,
                ConfirmationDialog: r(79).default
            })
        },
        1160: function(t, e, r) {
            "use strict";
            r(1093)
        },
        1200: function(t, e, r) {
            "use strict";
            r.r(e);
            var o = r(870),
                n = r(886),
                l = r(885),
                c = r(11),
                d = r.n(c),
                m = r(23),
                h = r.n(m),
                _ = r(42),
                f = r(40),
                v = r(4),
                x = r(1139),
                w = r(1035),
                y = r(3),
                $ = f.z.extend({
                    name: "GroupsTable",
                    components: {
                        ProgressBar: w.default,
                        UnitsTable: x.default
                    },
                    props: {
                        groupId: {
                            type: String,
                            required: !0
                        },
                        canExportStats: {
                            type: Boolean
                        },
                        unitsPath: {
                            type: String,
                            required: !0
                        }
                    },
                    data: () => ({
                        timerInterval: null,
                        group: void 0,
                        metrics: [],
                        retrievedDate: null,
                        processing: !1,
                        isLoading: !0
                    }),
                    created() {
                        this.initData()
                    },
                    methods: {
                        async initData() {
                            this.$accessor.me.resetData(), await this.getAndSetGroupUnits(this.groupId), await this.loadData(!1)
                        },
                        async loadData(t) {
                            const e = this.$accessor.user.getGroup;
                            if (e) {
                                this.$data.group = e;
                                const data = await this.getUnitMetrics(e.id, t);
                                this.$data.metrics = data.results, this.$data.retrievedDate = data.retrieved_date
                            }
                        },
                        exportGroupStats() {
                            return this.$accessor.snackbar.setExportingGroupStats(!0), this.$accessor.snackbar.setSnack({
                                message: "Exporting stats now. You may leave this page while you wait.",
                                icon: "info"
                            }), d.a.get(`${this.$config.api.metrics}${y.GROUP_LIFE}/${this.$data.group.id}`).then(t => {
                                this.setGroupLifeDownloadStatus(t.data.file_key)
                            }).catch(t => {
                                _.c("Error: ", t), console.error("Error exporting Group stats: ", t)
                            })
                        },
                        setGroupLifeDownloadStatus(t) {
                            const e = setInterval(() => d.a.get(`${this.$config.api.metrics}/report-status?file_key=${t}`).then(t => {
                                if ("in_progress" === t.data.status) return !1;
                                "completed" === t.data.status ? (this.$accessor.snackbar.setExportGroupStatusSnackbarShowing(!0), this.$accessor.snackbar.setSnack({
                                    message: "Group Stats is ready to download",
                                    icon: "check",
                                    type: "download",
                                    path: t.data.download_url,
                                    filename: t.data.file_name,
                                    timeout: 99999999999999,
                                    closeButton: !0
                                })) : "failed" === t.data.status && (_.c("Group Stats Export for download failed"), this.$accessor.snackbar.setSnack({
                                    message: "Group Stats Export failed",
                                    icon: "nope"
                                })), this.$accessor.snackbar.setExportingGroupStats(!1), this.$accessor.global.stopStatsDownloadPolling()
                            }).catch(t => {
                                _.c("Error: ", t), console.error("Error exporting Group Stats: ", t)
                            }), 1e4);
                            this.$accessor.global.startStatsDownloadPolling(e)
                        },
                        getUnitMetrics(t) {
                            let e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
                            this.isLoading = !0;
                            const r = new Promise((r, o) => {
                                this.handleRequest({
                                    axiosRequest: d.a.get,
                                    url: `${this.$config.api.metrics}${v.GROUPS_PATH}/${t}${v.UNITS_PATH}?limit=999&force=${e?1:0}`,
                                    body: {},
                                    successResponseCode: h.a.OK,
                                    responseHandler: t => {
                                        r(t.data)
                                    },
                                    errorHandler: t => {
                                        _.c("Error: " + t.message), o(t)
                                    }
                                })
                            });
                            return r.finally(() => {
                                this.isLoading = !1
                            }), r
                        },
                        gotoUnitLife(t) {
                            const e = this.$accessor.me.getGroupUnitsData.find(e => e.id === t);
                            e ? (this.$accessor.me.setCurrentUnit(e), this.$router.push({
                                name: this.unitsPath,
                                params: {
                                    groupId: this.groupId ? this.groupId : this.$route.params.groupId
                                }
                            })) : console.error("No unit found")
                        }
                    }
                }),
                S = (r(1160), r(9)),
                component = Object(S.a)($, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e(l.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(n.a, {
                        attrs: {
                            sm: "12",
                            md: "12",
                            lg: "12"
                        }
                    }, [e("section", {
                        staticClass: "GroupsTable"
                    }, [e(l.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(n.a, {
                        staticClass: "d-flex flex-row flex-wrap justify-space-between"
                    }, [e("section", {
                        staticClass: "GroupsTable__header pr-6"
                    }, [e("h1", {
                        staticClass: "GroupsTable__title"
                    }, [t._v("Group Life")])]), t._v(" "), e("div", {
                        staticClass: "d-flex flex-column align-end"
                    }, [e("div", {
                        staticClass: "d-flex flex-row align-center"
                    }, [t.canExportStats ? e(o.a, {
                        attrs: {
                            primary: "",
                            disabled: !t.metrics.length || t.$accessor.snackbar.isExportingGroupStats || t.$accessor.snackbar.isExportGroupStatusSnackbarShowing || t.$nuxt.isOffline
                        },
                        on: {
                            click: function(e) {
                                return t.exportGroupStats()
                            }
                        }
                    }, [t._v("\n                " + t._s(t.$accessor.snackbar.isExportingGroupStats ? "Loading file..." : "Export Group stats") + "\n              ")]) : t._e(), t._v(" "), e(o.a, {
                        staticClass: "ml-3",
                        attrs: {
                            outlined: "",
                            disabled: t.isLoading || t.$nuxt.isOffline
                        },
                        on: {
                            click: function(e) {
                                return t.loadData(!0)
                            }
                        }
                    }, [t._v("\n                " + t._s(t.isLoading ? "Refreshing data..." : "Refresh") + "\n              ")])], 1), t._v(" "), t.retrievedDate ? e("div", {
                        staticClass: "GroupsTable__retrieved-date mt-2"
                    }, [t._v("\n              Displaying data from: " + t._s(t.formatLongDate(t.retrievedDate)) + "\n            ")]) : t._e()])])], 1), t._v(" "), e(l.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(n.a, [e("section", {
                        staticClass: "GroupsTable__main"
                    }, [e("div", {
                        staticClass: "GroupsTable__table"
                    }, [e("h4", {
                        staticClass: "GroupsTable__group-title"
                    }, [t._v("\n                " + t._s(void 0 === t.group || null === t.group ? "" : t.group.name) + "\n              ")]), t._v(" "), e("UnitsTable", {
                        attrs: {
                            "table-data": t.metrics
                        },
                        on: {
                            gotoUnitLife: t.gotoUnitLife
                        }
                    })], 1)])])], 1)], 1)]), t._v(" "), e("ProgressBar", {
                        attrs: {
                            text: "Exporting and downloading stats",
                            indeterminate: "",
                            processing: t.processing
                        }
                    })], 1)
                }), [], !1, null, "32bed5de", null);
            e.default = component.exports;
            installComponents(component, {
                ProgressBar: r(1035).default
            })
        },
        1446: function(t, e, r) {
            "use strict";
            r.r(e);
            var o = r(1),
                n = r(5),
                l = o.a.extend({
                    name: "GroupLifePage",
                    created() {
                        this.$accessor.user.hasRoleGroupLeader || this.$nuxt.error({
                            statusCode: 404,
                            message: ""
                        }), this.$accessor.global.setBreadcrumbs([{
                            text: n.l.GROUP_LIFE,
                            exact: !1,
                            disabled: !0
                        }])
                    }
                }),
                c = r(9),
                component = Object(c.a)(l, (function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("GroupsTable", {
                        attrs: {
                            "group-id": this.$accessor.user.getGroupId,
                            "can-export-stats": !0,
                            "units-path": "group-life-unit"
                        }
                    })
                }), [], !1, null, null, null);
            e.default = component.exports;
            installComponents(component, {
                GroupsTable: r(1200).default
            })
        },
        933: function(t, e, r) {
            "use strict";
            r.d(e, "d", (function() {
                return l
            })), r.d(e, "a", (function() {
                return c
            })), r.d(e, "c", (function() {
                return d
            })), r.d(e, "b", (function() {
                return m
            }));
            var o, n = r(171);
            ! function(t) {
                t.Community = "community", t.Outdoors = "outdoors", t.Creative = "creative", t.PersonalGrowth = "personal_growth"
            }(o || (o = {}));
            class l {
                constructor(t) {
                    this.metrics = t
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
                constructor(t) {
                    this.metrics = t
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
                constructor(t) {
                    this.metrics = t
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
                formatDate(t) {
                    if (null != t) {
                        const e = t.split(" ");
                        return Object(n.a)(new Date(e[0]), "yyyy-MM-dd")
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
        996: function(t, e, r) {
            t.exports = {}
        }
    }
]);