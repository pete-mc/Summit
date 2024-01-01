(window.webpackJsonp = window.webpackJsonp || []).push([
    [220, 94, 128, 147, 149, 152, 163, 164, 165], {
        1005: function(t, e, r) {
            "use strict";
            r(973)
        },
        1023: function(t, e, r) {
            "use strict";
            r.r(e);
            var n = r(886),
                o = r(894),
                l = r(885),
                c = r(1).a.extend({
                    name: "PopupDrawer",
                    props: {
                        titleText: {
                            type: String,
                            default: ""
                        },
                        width: {
                            type: String,
                            default: "700px"
                        },
                        largePadding: {
                            type: Boolean
                        }
                    },
                    data: () => ({
                        drawer: !1
                    }),
                    methods: {
                        show(t) {
                            this.drawer = t
                        }
                    }
                }),
                d = (r(1005), r(9)),
                component = Object(d.a)(c, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e(o.a, {
                        staticClass: "PopupDrawer",
                        class: {
                            "PopupDrawer--large-padding": t.largePadding
                        },
                        style: "min-width: 300px; max-width: 770px; width: " + t.width,
                        attrs: {
                            app: "",
                            temporary: "",
                            right: ""
                        },
                        model: {
                            value: t.drawer,
                            callback: function(e) {
                                t.drawer = e
                            },
                            expression: "drawer"
                        }
                    }, [e(l.a, {
                        staticClass: "mb-4",
                        attrs: {
                            "no-gutters": "",
                            align: "center",
                            justify: "space-between"
                        }
                    }, [e(n.a, {
                        staticClass: "PopupDrawer__title ma-0"
                    }, [t._v(t._s(t.titleText))]), t._v(" "), e(n.a, {
                        attrs: {
                            align: "right"
                        }
                    }, [e("img", {
                        staticClass: "PopupDrawer__close",
                        attrs: {
                            alt: "Close popup drawer button",
                            src: "/images/icon-x.svg"
                        },
                        on: {
                            click: function(e) {
                                t.drawer = !1
                            },
                            keydown: function(e) {
                                t.drawer = !1
                            }
                        }
                    })])], 1), t._v(" "), t._t("default")], 2)
                }), [], !1, null, "6ff45cbe", null);
            e.default = component.exports
        },
        1035: function(t, e, r) {
            "use strict";
            r.r(e);
            var n = r(236),
                o = r(35),
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
                v = (r(1051), r(9)),
                component = Object(v.a)(d, (function() {
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
                    }, [e(n.a, {
                        staticClass: "ProgressBar__dialog_card",
                        attrs: {
                            color: "white",
                            dark: ""
                        }
                    }, [e(o.c, [e("p", {
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
        1051: function(t, e, r) {
            "use strict";
            r(996)
        },
        1095: function(t, e, r) {
            t.exports = {}
        },
        1142: function(t, e, r) {
            "use strict";
            r.r(e);
            var n = r(27).a.extend({
                    name: "ProgrammingSidebarContent"
                }),
                o = (r(1178), r(9)),
                component = Object(o.a)(n, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "ProgrammingSidebarContent"
                    }, [t.$vuetify.breakpoint.mdAndUp ? e("h2", {
                        staticClass: "ProgrammingSidebarContent__title"
                    }, [t._v("Programming in Scouts | Terrain")]) : t._e(), t._v(" "), t._m(0), t._v(" "), t._m(1), t._v(" "), t._m(2), t._v(" "), t._m(3), t._v(" "), t._m(4), t._v(" "), e("p", [t._v("\n    Let’s Review after each activity. Think about what was achieved and what was enjoyed. What SPICES did you achieve?\n  ")]), t._v(" "), e("a", {
                        staticClass: "Link-alt mt-12 mb-8",
                        attrs: {
                            href: t.templateFilepath("/resources/programming/joey_scout_program_planning.pdf"),
                            target: "_blank",
                            rel: "noopener noreferrer"
                        }
                    }, [t._v("\n    Joey Scout Program Planning\n  ")]), t._v(" "), e("a", {
                        staticClass: "Link-alt mb-8",
                        attrs: {
                            href: t.templateFilepath("/resources/programming/cub_scout_program_planning.pdf"),
                            target: "_blank",
                            rel: "noopener noreferrer"
                        }
                    }, [t._v("\n    Cub Scout Program Planning\n  ")]), t._v(" "), e("a", {
                        staticClass: "Link-alt mb-8",
                        attrs: {
                            href: t.templateFilepath("/resources/programming/scout_program_planning.pdf"),
                            target: "_blank",
                            rel: "noopener noreferrer"
                        }
                    }, [t._v("\n    Scout Program Planning\n  ")]), t._v(" "), e("a", {
                        staticClass: "Link-alt mb-8",
                        attrs: {
                            href: t.templateFilepath("/resources/programming/venturer_scout_program_planning.pdf"),
                            target: "_blank",
                            rel: "noopener noreferrer"
                        }
                    }, [t._v("\n    Venturer Scout Program Planning\n  ")]), t._v(" "), e("a", {
                        staticClass: "Link-alt mb-8",
                        attrs: {
                            href: t.templateFilepath("/resources/programming/rover_scout_program_planning.pdf"),
                            target: "_blank",
                            rel: "noopener noreferrer"
                        }
                    }, [t._v("\n    Rover Scout Program Planning\n  ")]), t._v(" "), e("a", {
                        staticClass: "Link-alt mb-8",
                        attrs: {
                            href: "/programming/risk-assessment",
                            target: "_blank",
                            rel: "noopener noreferrer"
                        }
                    }, [t._v("\n    What is Risk Identification?\n  ")])])
                }), [function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("p", {
                        staticClass: "ProgrammingSidebarContent__subtitle"
                    }, [t("strong", [this._v("Plan>")])])
                }, function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("ol", [t("li", [this._v("Gather all the information you need for the Unit Council to build the program.")]), this._v(" "), t("li", [this._v("Come up with ideas & goals for this program cycle.")]), this._v(" "), t("li", [this._v("The Unit Council refines all of these ideas and goals into the Program.")])])
                }, function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("p", {
                        staticClass: "ProgrammingSidebarContent__subtitle"
                    }, [t("strong", [this._v("Do>")])])
                }, function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("ol", [t("li", [this._v("The Unit Council plans the activities and helps them get to a starting point of information.")]), this._v(" "), t("li", [this._v("The individuals running each activity build them out in more detail.")])])
                }, function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("p", {
                        staticClass: "ProgrammingSidebarContent__subtitle"
                    }, [t("strong", [this._v("Review>")])])
                }], !1, null, "70f3c971", null);
            e.default = component.exports
        },
        1177: function(t, e, r) {
            t.exports = {}
        },
        1178: function(t, e, r) {
            "use strict";
            r(1095)
        },
        1179: function(t, e, r) {
            t.exports = {}
        },
        1180: function(t, e, r) {
            t.exports = {}
        },
        1181: function(t, e, r) {
            t.exports = {}
        },
        1182: function(t, e, r) {
            t.exports = {}
        },
        1229: function(t, e, r) {
            "use strict";
            r(1177)
        },
        1230: function(t, e, r) {
            "use strict";
            r(1179)
        },
        1231: function(t, e, r) {
            "use strict";
            r(1180)
        },
        1232: function(t, e, r) {
            "use strict";
            r(1181)
        },
        1233: function(t, e, r) {
            "use strict";
            r(1182)
        },
        1260: function(t, e, r) {
            "use strict";
            r.r(e);
            var n = r(1),
                o = r(964),
                l = r(1142),
                c = n.a.extend({
                    name: "ProgrammingSidebar",
                    components: {
                        Accordion: o.default,
                        ProgrammingSidebarContent: l.default
                    }
                }),
                d = (r(1230), r(9)),
                component = Object(d.a)(c, (function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("div", {
                        staticClass: "ProgrammingSidebar"
                    }, [this.$vuetify.breakpoint.mdAndUp ? t("div", {
                        staticClass: "ProgrammingSidebar__default"
                    }, [t("ProgrammingSidebarContent", this._b({}, "ProgrammingSidebarContent", { ...this.$props
                    }, !1))], 1) : t("Accordion", {
                        attrs: {
                            title: "Programming in Scouts | Terrain"
                        }
                    }, [t("ProgrammingSidebarContent", this._b({}, "ProgrammingSidebarContent", { ...this.$props
                    }, !1))], 1)], 1)
                }), [], !1, null, null, null);
            e.default = component.exports;
            installComponents(component, {
                ProgrammingSidebarContent: r(1142).default,
                Accordion: r(964).default
            })
        },
        1288: function(t, e, r) {
            t.exports = {}
        },
        1337: function(t, e, r) {
            "use strict";
            r.r(e);
            var n = r(870),
                o = r(886),
                l = r(1439),
                c = r(885),
                d = r(62),
                v = r(171),
                h = r(28),
                _ = r(4),
                m = r(5),
                f = r(40),
                y = r(287),
                C = r(17),
                A = f.z.extend({
                    name: "ActivitiesTable",
                    props: {
                        defaultTable: {
                            type: Boolean,
                            default: !1
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
                        },
                        updateDataFunc: {
                            type: Function,
                            default: () => {}
                        },
                        viewActivityFunc: {
                            type: Function,
                            default: () => {}
                        }
                    },
                    data: () => ({
                        search: "",
                        API: _,
                        ICONS: y,
                        LABEL: m.i,
                        ROLES: C,
                        approveModal: !1,
                        removeModal: !1,
                        tableKey: "table-key",
                        oldBreakpoint: "",
                        headersList: {
                            default: [{
                                text: "Activity name",
                                value: "title",
                                width: 230
                            }, {
                                text: "Challenge Areas",
                                value: "challengeArea",
                                width: 180
                            }, {
                                text: "Date submitted",
                                value: "date",
                                width: 150
                            }, {
                                text: "Suggested Lead",
                                value: "leader",
                                width: 250
                            }, {
                                text: "Patrol",
                                value: "patrol",
                                width: 200
                            }, {
                                text: "Action",
                                value: "actions",
                                width: 350
                            }],
                            completed: [{
                                text: "Activity name",
                                value: "title",
                                width: 230
                            }, {
                                text: "Challenge Areas",
                                value: "challengeArea",
                                width: 180
                            }, {
                                text: "Date completed",
                                value: "date",
                                width: 150
                            }, {
                                text: "Action",
                                value: "actions",
                                width: 150
                            }]
                        },
                        itemToBeRemoved: null
                    }),
                    computed: {
                        proposedDataTransformed() {
                            const t = [];
                            return this.tableData.forEach(e => {
                                const r = {};
                                r.id = e.id, r.title = e.title, r.description = e.description, r.justification = e.justification, r.challengeArea = Object(h.h)(e.challenge_area.replace(/_/g, " ")), r.date = e.created_at, r.formattedDate = Object(v.a)(new Date(e.created_at), "dd-MM-yyyy"), r.leader = e.leader, r.patrol = e.proposing_member.patrol_name, t.push(r)
                            }), t
                        },
                        completedDataTransformed() {
                            const t = [];
                            return this.tableData.forEach(e => {
                                const r = {};
                                r.id = e.id, r.title = e.title, r.challengeArea = Object(h.h)(e.challenge_area.replace(/_/g, " ")), r.date = e.end_datetime, r.formattedDate = Object(v.a)(new Date(e.end_datetime), "dd-MM-yyyy"), t.push(r)
                            }), t
                        }
                    },
                    methods: {
                        styleChallengeAreaText(t) {
                            let e;
                            switch (t) {
                                case m.d.COMMUNITY:
                                    return e = "ActivitiesTable__challenge-area-chip  is-community", e;
                                case m.d.CREATIVE:
                                    return e = "ActivitiesTable__challenge-area-chip  is-creative", e;
                                case "Outdoors":
                                    return e = "ActivitiesTable__challenge-area-chip  is-outdoors", e;
                                case m.d.PERSONAL_GROWTH:
                                    return e = "ActivitiesTable__challenge-area-chip  is-personal-growth", e
                            }
                        },
                        removeDialog(t) {
                            this.itemToBeRemoved = t, this.removeModal = !0
                        },
                        getHeaders() {
                            return "completed" === this.headers ? this.headersList.completed : this.headersList.default
                        },
                        removeProposalFromTable() {
                            if (!this.itemToBeRemoved) return;
                            const t = this.itemToBeRemoved;
                            this.removeProposal(t).then(t => {
                                this.itemToBeRemoved = null, this.$props.updateDataFunc()
                            })
                        },
                        closeRemoveDialog() {
                            this.removeModal = !1
                        }
                    }
                }),
                w = (r(1229), r(9)),
                component = Object(w.a)(A, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "ActivitiesTable"
                    }, [e(c.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(o.a, [e(l.a, {
                        key: t.tableKey,
                        attrs: {
                            headers: t.getHeaders(),
                            items: t.defaultTable ? t.proposedDataTransformed : t.completedDataTransformed,
                            search: t.search,
                            "sort-by": ["date"],
                            "sort-desc": [!0]
                        },
                        scopedSlots: t._u([{
                            key: "top",
                            fn: function() {
                                return [e(d.a, {
                                    staticClass: "ActivitiesTable__filter",
                                    attrs: {
                                        label: "Filter",
                                        "append-icon": "mdi-magnify",
                                        "single-line": "",
                                        "hide-details": "",
                                        height: "40"
                                    },
                                    model: {
                                        value: t.search,
                                        callback: function(e) {
                                            t.search = e
                                        },
                                        expression: "search"
                                    }
                                })]
                            },
                            proxy: !0
                        }, {
                            key: "item.challengeArea",
                            fn: function(r) {
                                let {
                                    item: n
                                } = r;
                                return [e("div", {
                                    staticClass: "ActivitiesTable__challenge-area",
                                    class: t.styleChallengeAreaText(n.challengeArea)
                                }, [t._v("\n            " + t._s(n.challengeArea) + "\n          ")])]
                            }
                        }, {
                            key: "item.date",
                            fn: function(e) {
                                let {
                                    item: r
                                } = e;
                                return [t._v("\n          " + t._s(r.formattedDate) + "\n        ")]
                            }
                        }, "default" === t.headers ? {
                            key: "item.actions",
                            fn: function(r) {
                                let {
                                    item: o
                                } = r;
                                return [e("div", {
                                    staticClass: "ActivitiesTable__actions"
                                }, [e(n.a, {
                                    staticClass: "ActivitiesTable__action-btn",
                                    attrs: {
                                        disabled: t.$nuxt.isOffline,
                                        "data-cy": "VIEW",
                                        small: "",
                                        text: ""
                                    },
                                    on: {
                                        click: function(e) {
                                            return t.viewProposal(o)
                                        }
                                    }
                                }, [e("Icon", {
                                    attrs: {
                                        name: "view",
                                        label: t.LABEL.VIEW,
                                        size: "small",
                                        outline: ""
                                    }
                                })], 1), t._v(" "), t.$storeUser.hasRoleUnitCouncil || t.$storeUser.hasRoleGroupLeader ? e(n.a, {
                                    staticClass: "ActivitiesTable__action-btn",
                                    attrs: {
                                        disabled: t.$nuxt.isOffline || o.currentUserHasActioned,
                                        small: "",
                                        text: ""
                                    },
                                    on: {
                                        click: function(e) {
                                            return t.removeDialog(o)
                                        }
                                    }
                                }, [e("Icon", {
                                    attrs: {
                                        name: "reject",
                                        "data-cy": "REMOVE",
                                        disabled: o.currentUserHasActioned,
                                        label: t.LABEL.REMOVE,
                                        size: "small",
                                        outline: ""
                                    }
                                })], 1) : t._e(), t._v(" "), t.$storeUser.hasRoleUnitCouncil ? e(n.a, {
                                    staticClass: "ActivitiesTable__action-btn",
                                    attrs: {
                                        disabled: t.$nuxt.isOffline,
                                        "data-cy": "PLAN",
                                        small: "",
                                        text: ""
                                    },
                                    on: {
                                        click: function(e) {
                                            return t.planProposedActivityById(o.id)
                                        }
                                    }
                                }, [e("Icon", {
                                    attrs: {
                                        name: "clipboard",
                                        label: t.LABEL.PLAN,
                                        size: "small",
                                        outline: ""
                                    }
                                })], 1) : t._e()], 1)]
                            }
                        } : "completed" === t.headers ? {
                            key: "item.actions",
                            fn: function(r) {
                                let {
                                    item: o
                                } = r;
                                return [e("div", {
                                    staticClass: "ActivitiesTable__actions"
                                }, [e(n.a, {
                                    staticClass: "ActivitiesTable__action-btn",
                                    attrs: {
                                        disabled: t.$nuxt.isOffline,
                                        small: "",
                                        text: ""
                                    },
                                    on: {
                                        click: function(e) {
                                            return t.viewActivityFunc(o.id)
                                        }
                                    }
                                }, [e("Icon", {
                                    attrs: {
                                        name: "view",
                                        label: "View",
                                        size: "small",
                                        outline: ""
                                    }
                                })], 1)], 1)]
                            }
                        } : null], null, !0)
                    })], 1)], 1), t._v(" "), e("ConfirmationDialog", {
                        attrs: {
                            model: t.removeModal,
                            title: "Remove proposal?",
                            subtitle: "This idea will be removed from the proposed activity list.",
                            "confirm-button-label": t.LABEL.OKAY,
                            "confirm-callback": t.removeProposalFromTable,
                            "close-dialog": t.closeRemoveDialog
                        }
                    })], 1)
                }), [], !1, null, null, null);
            e.default = component.exports;
            installComponents(component, {
                Icon: r(55).default,
                ConfirmationDialog: r(79).default
            })
        },
        1338: function(t, e, r) {
            "use strict";
            r.r(e);
            var n = r(870),
                o = r(236),
                l = r(886),
                c = r(885),
                d = r(40),
                v = r(5),
                h = r(287),
                _ = r(55),
                m = d.z.extend({
                    name: "ActivityList",
                    components: {
                        Icon: _.default
                    },
                    data: () => ({
                        ICONS: h,
                        LABEL: v.i
                    }),
                    props: {
                        title: {
                            type: String,
                            default: ""
                        },
                        items: {
                            type: Array,
                            default: () => []
                        },
                        iconName: {
                            type: String,
                            default: ""
                        },
                        iconLabel: {
                            type: String,
                            default: ""
                        },
                        useIconOutline: {
                            type: Boolean,
                            default: !1
                        }
                    },
                    methods: {
                        onRowButtonClicked(t, e) {
                            this.$emit("onRowButtonClicked", {
                                eventId: t,
                                groupId: e
                            })
                        }
                    }
                }),
                f = (r(1231), r(9)),
                component = Object(f.a)(m, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "ActivityList"
                    }, [e("div", {
                        staticClass: "ActivityList__title"
                    }, [t._v("\n    " + t._s(t.title) + "\n  ")]), t._v(" "), e("div", {
                        staticClass: "ActivityList__container"
                    }, t._l(t.items, (function(r, i) {
                        return e(o.a, {
                            key: i,
                            staticClass: "ActivityListItem",
                            attrs: {
                                height: "max-content",
                                flat: ""
                            }
                        }, [e(c.a, {
                            attrs: {
                                align: "center"
                            }
                        }, [e(l.a, {
                            staticClass: "ActivityListItem__title-col"
                        }, [e("div", {
                            staticClass: "ActivityListItem__title"
                        }, [t._v("\n            " + t._s(r.title) + "\n          ")])]), t._v(" "), e(n.a, {
                            attrs: {
                                disabled: t.$nuxt.isOffline,
                                "data-cy": "EDIT_PLAN",
                                text: ""
                            },
                            on: {
                                click: function(e) {
                                    return t.onRowButtonClicked(r.id, r.group_id)
                                }
                            }
                        }, [e("Icon", {
                            attrs: {
                                name: t.iconName,
                                disabled: t.$nuxt.isOffline,
                                label: t.iconLabel,
                                size: "small",
                                outline: t.useIconOutline
                            }
                        })], 1)], 1)], 1)
                    })), 1)])
                }), [], !1, null, "08cdebe4", null);
            e.default = component.exports;
            installComponents(component, {
                Icon: r(55).default
            })
        },
        1339: function(t, e, r) {
            "use strict";
            r.r(e);
            var n = r(870),
                o = r(998),
                l = r(1090),
                c = r(1092),
                d = r(1091),
                v = r(1089),
                h = r(40),
                _ = r(4);
            const {
                GROUP: m,
                UNIT: f,
                PATROL: y,
                MEMBER: C
            } = _.ACTIVITY_ENTITY;
            var A = h.z.extend({
                    name: "CalendarToggle",
                    props: {
                        calendars: {
                            type: Object,
                            required: !0
                        }
                    },
                    data: () => ({
                        calendarTypeCounter: {
                            group: 0,
                            unit: {
                                joey: 0,
                                cub: 0,
                                scout: 0,
                                rover: 0,
                                venturer: 0
                            },
                            patrol: 0
                        }
                    }),
                    created() {
                        this.setAllCalendarColours()
                    },
                    computed: {
                        hasOtherCalendars() {
                            var t;
                            return !!(null === (t = this.calendars) || void 0 === t ? void 0 : t.other_calendars.length)
                        }
                    },
                    methods: {
                        setCalendarColours(t) {
                            t.forEach(t => {
                                t.type === m ? (t.colour = `color-event-${m}-${this.$data.calendarTypeCounter.group+1}`, this.$data.calendarTypeCounter.group++) : t.type === f ? (t.colour = `color-event-${f}-${t.section}-${this.$data.calendarTypeCounter.unit[t.section]+1}`, 5 === this.$data.calendarTypeCounter.unit[t.section] && (this.$data.calendarTypeCounter.unit[t.section] = 0), this.$data.calendarTypeCounter.unit[t.section]++) : t.type === y ? (t.colour = `color-event-${y}-${this.$data.calendarTypeCounter.patrol+1}`, this.$data.calendarTypeCounter.patrol++) : t.type === C && (t.colour = "color-event-project-patrol")
                            })
                        },
                        setAllCalendarColours() {
                            this.calendarTypeCounter = {
                                group: 0,
                                unit: {
                                    joey: 0,
                                    cub: 0,
                                    scout: 0,
                                    rover: 0,
                                    venturer: 0
                                },
                                patrol: 0
                            }, this.setCalendarColours(this.calendars.own_calendars), this.setCalendarColours(this.calendars.other_calendars)
                        }
                    }
                }),
                w = (r(1232), r(9)),
                component = Object(w.a)(A, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "CalendarToggle"
                    }, [t._m(0), t._v(" "), t._l(t.calendars.own_calendars, (function(r, i) {
                        return e("div", {
                            key: `${i}-${r.id}`
                        }, [e(o.a, {
                            staticClass: "CalendarToggle__checkbox",
                            class: "CalendarToggle__checkbox--" + r.colour,
                            attrs: {
                                disabled: t.$nuxt.isOffline,
                                label: r.title,
                                "on-icon": "mdi-checkbox-marked-circle"
                            },
                            on: {
                                click: function(e) {
                                    return t.$emit("toggle-calendar", t.calendars)
                                }
                            },
                            model: {
                                value: r.selected,
                                callback: function(e) {
                                    t.$set(r, "selected", e)
                                },
                                expression: "calendar.selected"
                            }
                        })], 1)
                    })), t._v(" "), t.hasOtherCalendars ? [e(v.a, {
                        staticClass: "CalendarToggle__expansion-panel",
                        attrs: {
                            flat: ""
                        }
                    }, [e(l.a, [e(d.a, {
                        staticClass: "CalendarToggle__expansion-panel-header CalendarToggle__expansion-panel-background pl-0"
                    }, [e("div", {
                        staticClass: "CalendarToggle__title mt-8"
                    }, [e("strong", [t._v("Other Units")])])]), t._v(" "), e(c.a, {
                        staticClass: "CalendarToggle__expansion-panel-background"
                    }, t._l(t.calendars.other_calendars, (function(r, n) {
                        return e("div", {
                            key: `${n}-${r.id}`
                        }, [e(o.a, {
                            staticClass: "CalendarToggle__checkbox",
                            class: "CalendarToggle__checkbox--" + r.colour,
                            attrs: {
                                disabled: t.$nuxt.isOffline,
                                label: r.title,
                                "on-icon": "mdi-checkbox-marked-circle"
                            },
                            on: {
                                click: function(e) {
                                    return t.$emit("toggle-calendar", t.calendars)
                                }
                            },
                            model: {
                                value: r.selected,
                                callback: function(e) {
                                    t.$set(r, "selected", e)
                                },
                                expression: "calendar.selected"
                            }
                        })], 1)
                    })), 0)], 1)], 1)] : t._e(), t._v(" "), e(n.a, {
                        staticClass: "mt-4",
                        attrs: {
                            disabled: t.$nuxt.isOffline,
                            outlined: ""
                        },
                        on: {
                            click: function(e) {
                                return t.$emit("open-subscribe-modal")
                            }
                        }
                    }, [t._v("\n    Subscribe to calendar\n  ")])], 2)
                }), [function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("div", {
                        staticClass: "CalendarToggle__title"
                    }, [t("strong", [this._v("My Group & Unit")])])
                }], !1, null, null, null);
            e.default = component.exports
        },
        1340: function(t, e, r) {
            "use strict";
            r.r(e);
            var n = r(886),
                o = r(885),
                l = r(1),
                c = r(11),
                d = r.n(c),
                v = r(23),
                h = r.n(v),
                _ = r(5),
                m = r(219),
                f = r(4),
                y = r(950),
                C = l.a.extend({
                    name: "ProgrammingPage",
                    components: {
                        Loading: y.default,
                        InformationDialog: m.default
                    },
                    props: {
                        show: {
                            type: Boolean
                        }
                    },
                    data: () => ({
                        LABEL: _.i,
                        loading: !0,
                        ownCalendarSubscriptions: "",
                        otherCalendarSubscriptions: ""
                    }),
                    async mounted() {
                        var t;
                        let e;
                        if (e = await this.getAllCalendarFeeds(this.$accessor.user.getUserId), (null === (t = null == e ? void 0 : e.response) || void 0 === t ? void 0 : t.status) === h.a.NOT_FOUND) {
                            try {
                                await this.createCalendarFeeds(this.$accessor.user.getUserId)
                            } catch (t) {
                                console.error("Failed creating calendar feeds for member. Error: ", t)
                            }
                            e = await this.getAllCalendarFeeds(this.$accessor.user.getUserId)
                        }
                        this.$data.ownCalendarSubscriptions = await this.getCalendarFeeds(e.member_id, e.feeds.own_feed_id), this.$data.otherCalendarSubscriptions = await this.getCalendarFeeds(e.member_id, e.feeds.others_feed_id), this.loading = !1
                    },
                    methods: {
                        copyURL(link) {
                            navigator.clipboard.writeText(link).then(() => {
                                this.$accessor.snackbar.setSnack({
                                    message: "URL copied to clipboard.",
                                    icon: "check"
                                })
                            }, t => {
                                console.error("Async: Could not copy text: ", t)
                            })
                        },
                        getCalendarFeeds(t, e) {
                            return `${this.$config.api.events}${f.CALENDAR_FEEDS_PATH}/${t}/${e}`
                        },
                        getAllCalendarFeeds(t) {
                            return d.a.get(`${this.$config.api.events}${f.MEMBERS_PATH}/${t}${f.CALENDAR_SUBSCRIPTION_PATH}`).then(t => t.data).catch(t => t)
                        },
                        createCalendarFeeds(t) {
                            return d.a.post(`${this.$config.api.events}${f.MEMBERS_PATH}/${t}${f.CALENDAR_SUBSCRIPTION_PATH}`, {})
                        }
                    }
                }),
                A = (r(1233), r(9)),
                component = Object(A.a)(C, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("InformationDialog", {
                        staticClass: "SubscriptionModal",
                        attrs: {
                            model: t.show,
                            "close-button-label": t.LABEL.CLOSE,
                            "close-dialog": () => t.$emit("close-subscribe-modal")
                        }
                    }, [e("div", {
                        attrs: {
                            slot: "content"
                        },
                        slot: "content"
                    }, [e("h2", {
                        staticClass: "SubscriptionModal__title"
                    }, [t._v("Subscribe to Terrain Calendar")]), t._v(" "), e("Loading", {
                        attrs: {
                            loading: t.loading
                        }
                    }), t._v(" "), t.loading ? t._e() : e("div", [e("div", {
                        staticClass: "body-2"
                    }, [t._v("\n        See this Terrain calendar in your calendar app on iOS, Google or Outlook. Copy and paste the following link in\n        your favourite app. Please note that each calendar app has different ways to add the URL & unsubscribe.\n      ")]), t._v(" "), e(o.a, [e(n.a, [e("div", {
                        staticClass: "body-1-semibold"
                    }, [t._v("My Group & Unit")])])], 1), t._v(" "), e(o.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(n.a, {
                        attrs: {
                            cols: "10"
                        }
                    }, [e("span", {
                        staticStyle: {
                            color: "var(--color-neutral-charcoal)"
                        }
                    }, [t._v(t._s(t.ownCalendarSubscriptions))])]), t._v(" "), e(n.a, {
                        staticClass: "d-flex justify-end",
                        attrs: {
                            cols: "2"
                        }
                    }, [e("div", {
                        staticClass: "SubscriptionModal__copy-button",
                        on: {
                            click: function(e) {
                                return t.copyURL(t.ownCalendarSubscriptions)
                            },
                            keydown: function(e) {
                                return !e.type.indexOf("key") && t._k(e.keyCode, "enter", 13, e.key, "Enter") ? null : t.copyURL(t.ownCalendarSubscriptions)
                            }
                        }
                    }, [e("Icon", {
                        attrs: {
                            name: "copy",
                            outline: "",
                            size: "small"
                        }
                    })], 1)])], 1), t._v(" "), e(o.a, [e(n.a, [e("div", {
                        staticClass: "body-1-semibold"
                    }, [t._v("Other Units")])])], 1), t._v(" "), e(o.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(n.a, {
                        attrs: {
                            cols: "10"
                        }
                    }, [e("span", {
                        ref: "feedLinkOther",
                        staticStyle: {
                            color: "var(--color-neutral-charcoal)"
                        }
                    }, [t._v("\n            " + t._s(t.otherCalendarSubscriptions) + "\n          ")])]), t._v(" "), e(n.a, {
                        staticClass: "d-flex justify-end",
                        attrs: {
                            cols: "2"
                        }
                    }, [e("div", {
                        staticClass: "SubscriptionModal__copy-button",
                        on: {
                            click: function(e) {
                                return t.copyURL(t.otherCalendarSubscriptions)
                            },
                            keydown: function(e) {
                                return !e.type.indexOf("key") && t._k(e.keyCode, "enter", 13, e.key, "Enter") ? null : t.copyURL(t.otherCalendarSubscriptions)
                            }
                        }
                    }, [e("Icon", {
                        attrs: {
                            name: "copy",
                            outline: "",
                            size: "small"
                        }
                    })], 1)])], 1)], 1)], 1)])
                }), [], !1, null, "40aee17a", null);
            e.default = component.exports;
            installComponents(component, {
                Loading: r(950).default,
                Icon: r(55).default,
                InformationDialog: r(219).default
            })
        },
        1389: function(t, e, r) {
            "use strict";
            r(1288)
        },
        1458: function(t, e, r) {
            "use strict";
            r.r(e);
            var n = r(870),
                o = r(1438),
                l = r(236),
                c = r(35),
                d = r(267),
                v = r(886),
                h = r(890),
                _ = r(1206),
                m = r(163),
                f = r(885),
                y = r(47),
                C = r(892),
                A = r(1356),
                w = r(1430),
                $ = r(1431),
                P = r(1497),
                x = r(1369),
                T = r(76),
                k = r(1286),
                S = r(11),
                O = r.n(S),
                E = r(23),
                L = r.n(E),
                I = r(1073),
                U = r(1433),
                R = r(459),
                M = r(171),
                D = r(40),
                N = r(5),
                B = r(17),
                j = r(3),
                H = r(4),
                F = r(908),
                G = r(1337),
                V = r(1260),
                Y = r(1338),
                z = r(89),
                W = r(1339),
                J = r(1340),
                K = r(28);
            var Z = D.z.extend({
                    name: "ProgrammingPage",
                    components: {
                        CalendarToggle: W.default,
                        ActivityList: Y.default,
                        ActivitiesTable: G.default,
                        ProgrammingSidebar: V.default,
                        SubscriptionModal: J.default
                    },
                    data: () => ({
                        processing: !1,
                        allCalendars: {},
                        calendar: null,
                        calendarStart: null,
                        calendarType: "month",
                        completedEvents: [],
                        DAY_CALENDAR_TYPE: "day",
                        events: [],
                        eventProfile: {
                            event: {
                                id: ""
                            },
                            newProfileIndex: 0,
                            day: {
                                date: ""
                            }
                        },
                        fab: !1,
                        importActivityModel: !1,
                        importedActivity: null,
                        lastDate: {
                            start: "",
                            end: ""
                        },
                        LABEL: N.i,
                        MONTH_CALENDAR_TYPE: "month",
                        openSubscribeModal: !1,
                        organisedActivities: [],
                        PATH: j,
                        PROGRAMMING_IMAGE_NAMES: F.i,
                        ROLES: B,
                        showCalenderToggle: !0,
                        switchProfileModal: !1,
                        switchProfileCallback: () => {},
                        switchProfileModalSubtitle: "",
                        tabs: null,
                        UPCOMING_MONTHS: 6,
                        upcomingActivites: []
                    }),
                    beforeCreate() {
                        this.$accessor.global.setLoading(!0)
                    },
                    async created() {
                        if (this.$accessor.user.hasRoleSupportLeader) return this.$nuxt.error({
                            statusCode: 404,
                            message: ""
                        });
                        this.$accessor.global.setBreadcrumbs([{
                            text: N.l.PROGRAMMING,
                            to: j.PROGRAMMING,
                            exact: !0,
                            disabled: !1
                        }]), this.$data.calendar = this.$accessor.programming.getCalendarDate, await this.setNonCalendarData(), this.$accessor.global.setLoading(!1)
                    },
                    computed: {
                        activityBtnsDisplay() {
                            return this.$vuetify.breakpoint.mdAndUp && (!this.$storeUser.hasNoGroupOrUnit || this.$storeUser.hasRoleSupportLeaderReadWrite)
                        },
                        activityBtnsMobileDisplay() {
                            return this.$nuxt.isOnline && this.$vuetify.breakpoint.smAndDown && (!this.$storeUser.hasNoGroupOrUnit || this.$storeUser.hasRoleSupportLeaderReadWrite)
                        },
                        isLoading() {
                            return this.$accessor.global.isAppLoading
                        },
                        hasActionableActivities() {
                            return this.canShowAssignedActivities || this.canShowConcludableActivities
                        },
                        calendarTitle() {
                            if (!this.$data.calendarStart) return "";
                            const t = this.$refs.calendar.getFormatter({
                                timeZone: "UTC",
                                month: "long"
                            });
                            return "month" === this.$data.calendarType ? `${t(this.$data.calendarStart)} ${this.$data.calendarStart.year}` : `${this.$data.calendarStart.day} ${t(this.$data.calendarStart)} ${this.$data.calendarStart.year}`
                        },
                        canShowAssignedActivities() {
                            return !!this.assignedActivities.length
                        },
                        assignedActivities() {
                            return this.$data.organisedActivities.filter(t => this.isActivityAssigned(t))
                        },
                        canShowConcludableActivities() {
                            return !!this.concludableActivities.length
                        },
                        concludableActivities() {
                            return this.$data.organisedActivities.filter(t => this.isActivityConcludable(t))
                        }
                    },
                    methods: {
                        async editActivity(t) {
                            let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 1;
                            this.$accessor.global.setLoading(!0);
                            const r = await this.getEvent(t);
                            this.$accessor.programming.setActivity(r), this.$accessor.programming.setActivityFlow(z.a.EDIT), this.$accessor.programming.setStep(e), this.$router.push({
                                path: "" + j.PLAN_ACTIVITY
                            })
                        },
                        viewCalendarActivity() {
                            var t;
                            this.$accessor.global.setLoading(!0), this.viewActivity(null === (t = this.$data.eventProfile) || void 0 === t ? void 0 : t.id)
                        },
                        switchUserProfile() {
                            this.switchProfile(this.$data.eventProfile.newProfileIndex), this.$data.switchProfileCallback()
                        },
                        checkActivityForUserRole(t, e) {
                            var r, n;
                            this.$data.eventProfile.id = t.eventId;
                            if (this.$accessor.user.getCurrentProfile.group.id === t.groupId) e();
                            else {
                                if (this.$data.eventProfile.newProfileIndex = this.$accessor.user.getProfiles.findIndex(e => {
                                        var r;
                                        return (null === (r = e.group) || void 0 === r ? void 0 : r.id) === t.groupId
                                    }), -1 === this.$data.eventProfile.newProfileIndex) throw new Error("No matching profile found.");
                                const o = this.$accessor.user.getProfiles[this.$data.eventProfile.newProfileIndex],
                                    l = o.group.name,
                                    c = (null === (r = null == o ? void 0 : o.unit) || void 0 === r ? void 0 : r.name) ? ", " + (null === (n = null == o ? void 0 : o.unit) || void 0 === n ? void 0 : n.name) : "",
                                    d = `${o.group.name}${c}`;
                                this.$data.switchProfileModalSubtitle = `This activity is only viewable with a ${l} profile. Switch to ${d} now? `, this.$data.switchProfileCallback = e, this.$data.switchProfileModal = !0
                            }
                        },
                        async downloadUpcomingActivitiesCSV(t) {
                            this.processing = !0;
                            const e = `ScoutsTerrain-upcoming-activities-${Object(M.a)(new Date,"dd-MM-yyyy")}.csv`,
                                r = (new Date).toISOString().split(".")[0],
                                n = Object(I.a)(new Date, t).toISOString().split(".")[0].replace("00:00:00", "23:59:59"),
                                o = await this.getMemberActivities(r, n, !0);
                            this.downloadFile(o, e), this.$store.dispatch("snackbar/setSnack", {
                                message: "Upcoming activities downloaded",
                                icon: "check"
                            }), this.processing = !1
                        },
                        isActivityConcludable(t) {
                            const e = t.status === H.EVENT_STATUS.PLANNED,
                                r = this.hasActivityEnded(t.end_datetime);
                            return e && r
                        },
                        getMemberActivities(t, e) {
                            let r = arguments.length > 2 && void 0 !== arguments[2] && arguments[2],
                                n = "";
                            return r && (n = "&download_format=csv&download_tz=Australia/Melbourne"), O.a.get(`${this.$config.api.events}${H.MEMBERS_PATH}/${this.$accessor.user.getUserId}${H.EVENTS_PATH}?start_datetime=${t}&end_datetime=${e}${n}`).then(t => r ? t.data : t.data.results).catch(t => {
                                console.error("Failed to get member activities. Error: " + t)
                            })
                        },
                        showCalendarToggles() {
                            this.$refs.toggleDrawer.show(!0)
                        },
                        async setNonCalendarData() {
                            this.$accessor.user.getUnitId && this.getAndSetProposedActivitiesData(), this.$data.allCalendars = await this.getAllCalendars(), this.$data.organisedActivities = await this.getOrganisedEvents(), await this.getCompletedActivities().catch(t => console.error("Failed retrieving completed activities: ", t))
                        },
                        getAllCalendars() {
                            return O.a.get(`${this.$config.api.events}${H.MEMBERS_PATH}/${this.$storeUser.getUserId}${H.CALENDARS_PATH}`).then(t => t.data).catch(t => {
                                if (this.$nuxt.isOffline) return this.$nuxt.error({
                                    statusCode: 503,
                                    message: t
                                });
                                console.error("Failed to retrieve calendars Error:", t)
                            })
                        },
                        getOrganisedEvents() {
                            return O.a.get(`${this.$config.api.events}${H.MEMBERS_PATH}/${this.$accessor.user.getUserId}${H.ORGANISED_EVENTS_PATH}`).then(t => t.data.results).catch(t => {
                                console.warn("Failed to retrieve the organised events. Error: " + t)
                            })
                        },
                        async getAndSetProposedActivitiesData() {
                            await O.a.get(`${this.$config.api.events}${H.UNITS_PATH}/${this.$accessor.user.getUnitId}${H.PROPOSALS_PATH}`).then(t => {
                                t.data.results.sort(Object(K.g)("id")), this.$accessor.programming.setProposedActivitiesData(t.data.results)
                            }).catch(t => {
                                if (console.warn("Failed to retrieve the proposals. Error: " + t), this.$nuxt.isOffline) return this.$nuxt.error({
                                    statusCode: 503,
                                    message: ""
                                })
                            })
                        },
                        toggleCalendar(t) {
                            this.handleRequest({
                                axiosRequest: O.a.put,
                                url: `${this.$config.api.events}${H.MEMBERS_PATH}/${this.$storeUser.getUserId}${H.CALENDARS_PATH}`,
                                body: t,
                                successResponseCode: L.a.OK,
                                responseHandler: () => {
                                    this.updateCalendar(this.$data.lastDate)
                                },
                                showSnackbar: !0
                            })
                        },
                        async updateCalendar(t) {
                            let {
                                start: e,
                                end: r
                            } = t;
                            const n = new Date(e.date).toISOString().split(".")[0],
                                o = new Date(r.date).toISOString().split(".")[0].replace("00:00:00", "23:59:59");
                            this.$data.calendarStart = e;
                            const l = await this.getMemberActivities(n, o);
                            if (void 0 !== l) {
                                const t = l.map(t => this.convertEventToCalendarEvent(t));
                                this.$data.events = t
                            }
                            return this.$data.lastDate = {
                                start: e,
                                end: r
                            }, l
                        },
                        async getCompletedActivities() {
                            const t = Object(U.a)(new Date, 90).toISOString().split(".")[0],
                                e = Object(R.a)(new Date, 1).toISOString().split(".")[0],
                                r = await this.getMemberActivities(t, e);
                            this.$data.completedEvents = r.filter(t => t.status === H.EVENT_STATUS.CONCLUDED)
                        },
                        convertEventToCalendarEvent(t) {
                            const e = Object(M.a)(new Date(t.start_datetime), "yyyy-MM-dd kk:mm"),
                                r = Object(M.a)(new Date(t.end_datetime), "yyyy-MM-dd kk:mm");
                            return {
                                name: t.invitee_name ? `[${t.invitee_name}] ${t.title}` : t.title,
                                groupId: t.group_id,
                                id: t.id,
                                inviteeId: t.invitee_id,
                                inviteeName: t.invitee_name,
                                inviteeType: t.invitee_type,
                                section: t.section,
                                start: e,
                                end: r
                            }
                        },
                        next() {
                            this.$refs.calendar.next()
                        },
                        prev() {
                            this.$refs.calendar.prev()
                        },
                        setToday() {
                            this.$data.calendar = void 0
                        },
                        formatDate: t => `${t.getFullYear()}-${t.getMonth()+1}-${t.getDate()}`,
                        setEventColour(t) {
                            const e = [...this.$data.allCalendars.own_calendars, ...this.$data.allCalendars.other_calendars].find(e => t.inviteeId === e.id);
                            return (null == e ? void 0 : e.colour) ? `var(--${e.colour})` : "var(--color-light-mid-charcoal)"
                        },
                        setEventTextColour(t) {
                            return this.$data.events.find(() => t.inviteeType === H.ACTIVITY_ENTITY.UNIT && t.section === H.SECTION_TYPES.CUB) ? "var(--color-slate)" : "white"
                        },
                        setCalendarTypeDay(t) {
                            let {
                                date: e
                            } = t;
                            this.$data.calendar = e, this.$data.calendarType = this.$data.DAY_CALENDAR_TYPE
                        },
                        setCalendarTypeMonth() {
                            this.$data.calendarType = this.$data.MONTH_CALENDAR_TYPE
                        },
                        onCalendarEventClicked(t) {
                            this.checkActivityForUserRole({
                                eventId: t.event.id,
                                groupId: t.event.groupId
                            }, this.viewCalendarActivity)
                        },
                        importActivity() {
                            const t = new FileReader;
                            t.onload = t => {
                                const e = t.target.result,
                                    r = JSON.parse(e);
                                this.planImportedActivity(r)
                            }, t.readAsText(this.importedActivity)
                        }
                    },
                    watch: {
                        calendar(t) {
                            this.$accessor.programming.setCalendarDate(t)
                        }
                    }
                }),
                Q = (r(1389), r(9)),
                component = Object(Q.a)(Z, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return t.isLoading ? t._e() : e("div", {
                        staticClass: "Programming"
                    }, [e(f.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(v.a, {
                        staticClass: "pt-0"
                    }, [e("PageHeader", {
                        attrs: {
                            title: "Programming",
                            subtitle: "Planning is undertaken as a partnership of youth and adults. It's about: ideas, supporting each other, being\n          a team and thinking about what you want to achieve.",
                            href: "https://pr.scouts.com.au/the-weekly-program/",
                            "link-open-context": "_blank",
                            "link-title": "Learn more"
                        }
                    }, [t.activityBtnsDisplay ? e("div", {
                        staticClass: "Programming__buttons",
                        attrs: {
                            slot: "buttons"
                        },
                        slot: "buttons"
                    }, [t.$storeUser.hasRoleGroupLeader || t.$storeUser.hasRoleUnitCouncil || t.$storeUser.hasRoleSupportLeaderReadWrite ? e(n.a, {
                        staticClass: "ml-3",
                        attrs: {
                            disabled: t.$nuxt.isOffline,
                            "data-cy": "ImportActivity",
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                t.importActivityModel = !0
                            }
                        }
                    }, [t._v("\n            Import Activity\n          ")]) : t._e(), t._v(" "), t.$storeUser.hasRoleGroupLeader || t.$storeUser.hasRoleUnitCouncil || t.$storeUser.hasRoleSupportLeaderReadWrite ? e(n.a, {
                        staticClass: "ml-3",
                        attrs: {
                            disabled: t.$nuxt.isOffline,
                            "data-cy": "PlanActivity",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.planActivity()
                            }
                        }
                    }, [t._v("\n            " + t._s(t.LABEL.PLAN_ACTIVITY) + "\n          ")]) : t._e(), t._v(" "), t.$storeUser.hasRoleUnitMember ? e(n.a, {
                        staticClass: "ml-3",
                        attrs: {
                            disabled: t.$nuxt.isOffline,
                            "data-cy": "ProposeIdea",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.proposeActivity()
                            }
                        }
                    }, [t._v("\n            " + t._s(t.LABEL.PROPOSE_IDEA) + "\n          ")]) : t._e()], 1) : t._e()])], 1)], 1), t._v(" "), e(f.a, {
                        staticClass: "mt-n4"
                    }, [t.$vuetify.breakpoint.mdAndUp && t.$storeUser.hasNoGroupOrUnit ? e("div", {
                        staticClass: "Programming__buttons",
                        attrs: {
                            slot: "buttons"
                        },
                        slot: "buttons"
                    }, [t.$storeUser.hasNoGroupOrUnit || t.$storeUser.hasRoleSupportLeaderReadWrite ? e(n.a, {
                        staticClass: "ml-3",
                        attrs: {
                            disabled: t.$nuxt.isOffline,
                            "data-cy": "Plan_Activity",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.planActivity()
                            }
                        }
                    }, [t._v("\n        Plan Activity\n      ")]) : t._e()], 1) : t._e()]), t._v(" "), e(f.a, {
                        directives: [{
                            name: "show",
                            rawName: "v-show",
                            value: !t.$storeUser.hasNoGroupOrUnit,
                            expression: "!$storeUser.hasNoGroupOrUnit"
                        }],
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(v.a, [e("section", {
                        staticClass: "Programming__nav"
                    }, [e("div", {
                        staticClass: "Programming__tabs"
                    }, [e(P.a, {
                        attrs: {
                            "background-color": "grey lighten-5",
                            grow: "",
                            height: "40"
                        },
                        model: {
                            value: t.tabs,
                            callback: function(e) {
                                t.tabs = e
                            },
                            expression: "tabs"
                        }
                    }, [e(w.a, [t._v("Upcoming activities")]), t._v(" "), !t.$storeUser.hasNoGroupOrUnit && t.$storeUser.hasRoleUnitMember ? e(w.a, {
                        attrs: {
                            disabled: t.$nuxt.isOffline
                        }
                    }, [t._v("\n              Proposed activities\n            ")]) : t._e(), t._v(" "), t.$storeUser.hasNoGroupOrUnit ? t._e() : e(w.a, {
                        attrs: {
                            disabled: t.$nuxt.isOffline
                        }
                    }, [t._v("Concluded activities")])], 1)], 1)])])], 1), t._v(" "), e(f.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(v.a, [e(x.a, {
                        attrs: {
                            touchless: !0
                        },
                        model: {
                            value: t.tabs,
                            callback: function(e) {
                                t.tabs = e
                            },
                            expression: "tabs"
                        }
                    }, [e($.a, [e(f.a, {
                        staticClass: "flex-nowrap",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e("div", [e("CalendarToggle", {
                        directives: [{
                            name: "show",
                            rawName: "v-show",
                            value: t.showCalenderToggle && t.allCalendars && t.$vuetify.breakpoint.mdAndUp,
                            expression: "showCalenderToggle && allCalendars && $vuetify.breakpoint.mdAndUp"
                        }],
                        staticClass: "Programming__calendar-toggle",
                        attrs: {
                            calendars: t.allCalendars
                        },
                        on: {
                            "toggle-calendar": function(e) {
                                return t.toggleCalendar(e)
                            },
                            "open-subscribe-modal": () => t.openSubscribeModal = !0
                        }
                    })], 1), t._v(" "), e(v.a, [e(f.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(v.a, [t.$storeUser.hasNoGroupOrUnit ? t._e() : e(T.a, {
                        staticClass: "Programming__calendar-toolbar mb-4",
                        attrs: {
                            flat: "",
                            height: "48"
                        }
                    }, [t.$vuetify.breakpoint.smAndDown ? e("div", {
                        staticClass: "Programming__calendar-toggle-icon",
                        on: {
                            click: function(e) {
                                return t.showCalendarToggles()
                            },
                            keydown: function(e) {
                                return !e.type.indexOf("key") && t._k(e.keyCode, "enter", 13, e.key, "Enter") ? null : t.showCalendarToggles()
                            }
                        }
                    }, [e("Icon", {
                        attrs: {
                            name: "calendar-toggle",
                            outline: ""
                        }
                    })], 1) : e("div", {
                        staticClass: "Programming__calendar-toggle-icon",
                        class: {
                            "Programming__calendar-toggle-icon--on": t.showCalenderToggle
                        },
                        on: {
                            click: function(e) {
                                t.showCalenderToggle = !t.showCalenderToggle
                            },
                            keydown: function(e) {
                                if (!e.type.indexOf("key") && t._k(e.keyCode, "enter", 13, e.key, "Enter")) return null;
                                t.showCalenderToggle = !t.showCalenderToggle
                            }
                        }
                    }, [e("Icon", {
                        attrs: {
                            name: "calendar-toggle",
                            outline: ""
                        }
                    })], 1), t._v(" "), t.calendarType === t.MONTH_CALENDAR_TYPE ? e("div", {
                        staticClass: "Programming__calendar-button ml-2 mr-0 ml-md-4 mr-md-4",
                        attrs: {
                            disabled: t.$nuxt.isOffline
                        },
                        on: {
                            click: function(e) {
                                return t.setToday()
                            },
                            keydown: function(e) {
                                return !e.type.indexOf("key") && t._k(e.keyCode, "enter", 13, e.key, "Enter") ? null : t.setToday()
                            }
                        }
                    }, [t._v("\n                      Today\n                    ")]) : e("div", {
                        staticClass: "Programming__calendar-button ml-2 mr-2 ml-md-4 mr-md-4",
                        attrs: {
                            disabled: t.$nuxt.isOffline
                        },
                        on: {
                            click: function(e) {
                                return t.setCalendarTypeMonth()
                            },
                            keydown: function(e) {
                                return !e.type.indexOf("key") && t._k(e.keyCode, "enter", 13, e.key, "Enter") ? null : t.setCalendarTypeMonth()
                            }
                        }
                    }, [t._v("\n                      Monthly View\n                    ")]), t._v(" "), e(n.a, {
                        staticClass: "Programming__calendar-nav-button",
                        attrs: {
                            disabled: t.$nuxt.isOffline,
                            fab: "",
                            text: "",
                            small: "",
                            color: "grey darken-2"
                        },
                        on: {
                            click: t.prev
                        }
                    }, [e(m.a, {
                        attrs: {
                            color: "var(--color-slate)"
                        }
                    }, [t._v("mdi-chevron-left")])], 1), t._v(" "), e(n.a, {
                        staticClass: "Programming__calendar-nav-button",
                        attrs: {
                            disabled: t.$nuxt.isOffline,
                            fab: "",
                            text: "",
                            small: "",
                            color: "grey darken-2"
                        },
                        on: {
                            click: t.next
                        }
                    }, [e(m.a, {
                        attrs: {
                            color: "var(--color-slate)"
                        }
                    }, [t._v("mdi-chevron-right")])], 1), t._v(" "), e(k.a, {
                        staticClass: "text-left Programming__month-title"
                    }, [t._v(t._s(t.calendarTitle))]), t._v(" "), e(n.a, {
                        staticClass: "pl-4 px-0 justify-right",
                        staticStyle: {
                            "min-width": "auto"
                        },
                        attrs: {
                            disabled: t.$nuxt.isOffline,
                            text: ""
                        },
                        on: {
                            click: function(e) {
                                return t.downloadUpcomingActivitiesCSV(t.UPCOMING_MONTHS)
                            }
                        }
                    }, [e("Icon", {
                        staticClass: "mr-2",
                        attrs: {
                            size: "small",
                            name: "download",
                            outline: ""
                        }
                    }), t._v(" "), t.$vuetify.breakpoint.smAndUp ? e("span", [t._v("Upcoming " + t._s(t.UPCOMING_MONTHS) + " months")]) : t._e()], 1)], 1)], 1)], 1), t._v(" "), e(f.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(v.a, [t.$storeUser.hasNoGroupOrUnit ? t._e() : e(y.a, {
                        staticClass: "Programming__calendar mb-12",
                        attrs: {
                            height: "700"
                        }
                    }, [e(o.a, {
                        ref: "calendar",
                        attrs: {
                            color: "primary",
                            events: t.events,
                            "event-color": t.setEventColour,
                            "event-text-color": t.setEventTextColour,
                            type: t.calendarType,
                            "event-more-text": "see all"
                        },
                        on: {
                            change: t.updateCalendar,
                            "click:event": t.onCalendarEventClicked,
                            "click:date": t.setCalendarTypeDay,
                            "click:more": t.setCalendarTypeDay
                        },
                        model: {
                            value: t.calendar,
                            callback: function(e) {
                                t.calendar = e
                            },
                            expression: "calendar"
                        }
                    })], 1)], 1)], 1)], 1)], 1), t._v(" "), e(f.a, {
                        class: {
                            "Programming--no-cal-margin": t.$storeUser.hasNoGroupOrUnit
                        }
                    }, [t.hasActionableActivities ? e(v.a, {
                        attrs: {
                            cols: "12",
                            lg: "8",
                            sm: "12"
                        }
                    }, [t.canShowAssignedActivities ? e("ActivityList", {
                        attrs: {
                            title: "Assigned activities",
                            items: t.assignedActivities,
                            "icon-name": "edit",
                            "icon-label": t.LABEL.EDIT_PLAN,
                            "data-cy": "EDIT_PLAN",
                            "use-icon-outline": ""
                        },
                        on: {
                            onRowButtonClicked: function(e) {
                                t.checkActivityForUserRole(e, t.editActivity.bind(this, e.eventId, 1))
                            }
                        }
                    }) : t._e(), t._v(" "), t.canShowConcludableActivities ? e("ActivityList", {
                        staticClass: "mt-7",
                        attrs: {
                            title: "Activities to be concluded",
                            items: t.concludableActivities,
                            "icon-name": "clipboard",
                            "icon-label": t.LABEL.CONCLUDE_ACTIVITY,
                            "use-icon-outline": ""
                        },
                        on: {
                            onRowButtonClicked: function(e) {
                                t.checkActivityForUserRole(e, t.editActivity.bind(this, e.eventId, 4))
                            }
                        }
                    }) : t._e()], 1) : t._e(), t._v(" "), t.hasActionableActivities ? t._e() : e(v.a, [e("img", {
                        staticClass: "Programming__calendar-image",
                        attrs: {
                            src: t.fetchImage(t.PROGRAMMING_IMAGE_NAMES.overview),
                            alt: "programming-overview"
                        }
                    })]), t._v(" "), e(v.a, {
                        attrs: {
                            cols: "12",
                            lg: "4",
                            sm: "12"
                        }
                    }, [e("ProgrammingSidebar")], 1)], 1)], 1), t._v(" "), e($.a, [e("ActivitiesTable", {
                        attrs: {
                            "default-table": "",
                            headers: "default",
                            "show-select": "",
                            "table-data": t.$accessor.programming.getProposedActivitiesData,
                            "update-data-func": t.setNonCalendarData
                        }
                    })], 1), t._v(" "), e($.a, [e("ActivitiesTable", {
                        attrs: {
                            headers: "completed",
                            "show-select": "",
                            "table-data": t.completedEvents,
                            "view-activity-func": t.viewActivity
                        }
                    })], 1)], 1)], 1)], 1), t._v(" "), t.activityBtnsMobileDisplay ? e(A.a, {
                        attrs: {
                            absolute: "",
                            bottom: "",
                            right: "",
                            fixed: "",
                            direction: "top",
                            transition: "slide-y-reverse-transition",
                            "data-cy": "qa-speed-dial-programming"
                        },
                        scopedSlots: t._u([{
                            key: "activator",
                            fn: function() {
                                return [e(n.a, {
                                    attrs: {
                                        fab: ""
                                    },
                                    model: {
                                        value: t.fab,
                                        callback: function(e) {
                                            t.fab = e
                                        },
                                        expression: "fab"
                                    }
                                }, [t.fab ? e(m.a, [t._v("mdi-close")]) : e(m.a, [t._v("mdi-plus")])], 1)]
                            },
                            proxy: !0
                        }], null, !1, 3174303952),
                        model: {
                            value: t.fab,
                            callback: function(e) {
                                t.fab = e
                            },
                            expression: "fab"
                        }
                    }, [t._v(" "), t.$storeUser.hasRoleGroupLeader || t.$storeUser.hasRoleUnitCouncil || t.$storeUser.hasRoleSupportLeaderReadWrite ? e(n.a, {
                        attrs: {
                            fab: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                t.importActivityModel = !0
                            }
                        }
                    }, [e(d.a, {
                        attrs: {
                            label: ""
                        }
                    }, [t._v("Import Activity")]), t._v(" "), e("Icon", {
                        attrs: {
                            outline: "",
                            name: "import-inverse"
                        }
                    })], 1) : t._e(), t._v(" "), t.$storeUser.hasRoleGroupLeader || t.$storeUser.hasRoleUnitCouncil || t.$storeUser.hasNoGroupOrUnit || t.$storeUser.hasRoleSupportLeaderReadWrite ? e(n.a, {
                        attrs: {
                            fab: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.planActivity()
                            }
                        }
                    }, [e(d.a, {
                        attrs: {
                            label: ""
                        }
                    }, [t._v(t._s(t.LABEL.PLAN_ACTIVITY))]), t._v(" "), e("Icon", {
                        attrs: {
                            outline: "",
                            name: "plan"
                        }
                    })], 1) : t._e(), t._v(" "), t.$storeUser.hasRoleUnitMember ? e(n.a, {
                        attrs: {
                            fab: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.proposeActivity()
                            }
                        }
                    }, [e(d.a, {
                        attrs: {
                            label: ""
                        }
                    }, [t._v("\n        " + t._s(t.LABEL.PROPOSE_IDEA) + "\n      ")]), t._v(" "), e("Icon", {
                        attrs: {
                            outline: "",
                            name: "idea"
                        }
                    })], 1) : t._e()], 1) : t._e(), t._v(" "), e(h.a, {
                        model: {
                            value: t.importActivityModel,
                            callback: function(e) {
                                t.importActivityModel = e
                            },
                            expression: "importActivityModel"
                        }
                    }, [e(l.a, [e(c.d, [t._v("Import Activity")]), t._v(" "), e(c.b, {
                        staticClass: "px-0"
                    }, [e("span", [t._v("Insert the JSON file and complete the remaining steps of the activity plan.")])]), t._v(" "), e(_.a, {
                        staticStyle: {
                            cursor: "pointer"
                        },
                        attrs: {
                            accept: "application/json",
                            label: "Upload JSON file"
                        },
                        model: {
                            value: t.importedActivity,
                            callback: function(e) {
                                t.importedActivity = e
                            },
                            expression: "importedActivity"
                        }
                    }), t._v(" "), e(c.a, {
                        staticClass: "pa-0 mt-0"
                    }, [e(C.a), t._v(" "), e(n.a, {
                        attrs: {
                            disabled: t.$nuxt.isOffline,
                            text: ""
                        },
                        on: {
                            click: function(e) {
                                t.importActivityModel = !1
                            }
                        }
                    }, [t._v(t._s(t.LABEL.CANCEL))]), t._v(" "), e(n.a, {
                        staticClass: "mr-4",
                        attrs: {
                            disabled: t.$nuxt.isOffline || !t.importedActivity,
                            text: ""
                        },
                        on: {
                            click: t.importActivity
                        }
                    }, [t._v("\n          " + t._s(t.LABEL.IMPORT) + "\n        ")])], 1)], 1)], 1), t._v(" "), e("PopupDrawer", {
                        directives: [{
                            name: "show",
                            rawName: "v-show",
                            value: t.$vuetify.breakpoint.smAndDown,
                            expression: "$vuetify.breakpoint.smAndDown"
                        }],
                        ref: "toggleDrawer",
                        attrs: {
                            width: "267px"
                        }
                    }, [e("CalendarToggle", {
                        staticClass: "mb-12",
                        attrs: {
                            calendars: t.allCalendars
                        },
                        on: {
                            "toggle-calendar": function(e) {
                                return t.toggleCalendar(e)
                            },
                            "open-subscribe-modal": () => {
                                t.openSubscribeModal = !0, t.$refs.toggleDrawer.show(!1)
                            }
                        }
                    })], 1), t._v(" "), e("ProgressBar", {
                        attrs: {
                            text: "Downloading calendar events",
                            indeterminate: "",
                            processing: t.processing
                        }
                    }), t._v(" "), t.openSubscribeModal ? e("SubscriptionModal", {
                        attrs: {
                            show: t.openSubscribeModal
                        },
                        on: {
                            "close-subscribe-modal": () => t.openSubscribeModal = !1
                        }
                    }) : t._e(), t._v(" "), e("ConfirmationDialog", {
                        attrs: {
                            model: t.switchProfileModal,
                            title: "Switch role",
                            subtitle: t.switchProfileModalSubtitle,
                            "confirm-button-label": t.LABEL.SWITCH_ROLE,
                            "confirm-callback": t.switchUserProfile,
                            "close-button-label": t.LABEL.CANCEL,
                            "close-dialog": () => t.switchProfileModal = !1
                        }
                    })], 1)
                }), [], !1, null, "022e1a9d", null);
            e.default = component.exports;
            installComponents(component, {
                PageHeader: r(953).default,
                Icon: r(55).default,
                ProgrammingSidebar: r(1260).default,
                PopupDrawer: r(1023).default,
                ProgressBar: r(1035).default,
                ConfirmationDialog: r(79).default
            })
        },
        908: function(t, e, r) {
            "use strict";
            r.d(e, "b", (function() {
                return n
            })), r.d(e, "c", (function() {
                return o
            })), r.d(e, "d", (function() {
                return l
            })), r.d(e, "e", (function() {
                return c
            })), r.d(e, "f", (function() {
                return d
            })), r.d(e, "g", (function() {
                return v
            })), r.d(e, "j", (function() {
                return h
            })), r.d(e, "a", (function() {
                return _
            })), r.d(e, "h", (function() {
                return m
            })), r.d(e, "i", (function() {
                return f
            }));
            const n = {
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
                v = {
                    welcome: "oas--welcome",
                    side: "oas--side"
                },
                h = {
                    overview: "sia--overview",
                    welcome: "sia--welcome",
                    side: "sia--side"
                },
                _ = {
                    overview: "adventurous-journey--overview",
                    side: "adventurous-journey--side"
                },
                m = {
                    overview: "personal-development--overview",
                    side: "personal-development--side"
                },
                f = {
                    overview: "programming--overview"
                }
        },
        946: function(t, e, r) {
            t.exports = {}
        },
        949: function(t, e, r) {
            t.exports = {}
        },
        950: function(t, e, r) {
            "use strict";
            r.r(e);
            var n = r(235),
                o = r(234),
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
                c = (r(961), r(9)),
                component = Object(c.a)(l, (function() {
                    var t = this._self._c;
                    return t("div", {
                        staticClass: "Loading"
                    }, [this.loading && this.overlay ? t(n.a, {
                        attrs: {
                            color: this.overlayColor,
                            opacity: "0.8"
                        }
                    }, [t(o.a, {
                        attrs: {
                            indeterminate: "",
                            size: this.size,
                            color: "primary"
                        }
                    })], 1) : this.loading ? t("div", [t(o.a, {
                        attrs: {
                            indeterminate: "",
                            size: this.size,
                            color: "primary"
                        }
                    })], 1) : this._e()], 1)
                }), [], !1, null, "f099b51a", null);
            e.default = component.exports
        },
        953: function(t, e, r) {
            "use strict";
            r.r(e);
            var n = r(886),
                o = r(885),
                l = r(1).a.extend({
                    name: "PageHeader",
                    props: {
                        title: {
                            type: String,
                            required: !0
                        },
                        subtitle: {
                            type: String,
                            required: !0
                        },
                        href: {
                            type: String,
                            default: null
                        },
                        imageSrc: {
                            type: String,
                            default: ""
                        },
                        imageAlt: {
                            type: String,
                            default: "Header icon"
                        },
                        linkOpenContext: {
                            type: String,
                            default: "_self"
                        },
                        linkTitle: {
                            type: String,
                            default: ""
                        },
                        isAp: {
                            type: Boolean
                        }
                    }
                }),
                c = (r(959), r(9)),
                component = Object(c.a)(l, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("section", {
                        staticClass: "PageHeader"
                    }, [e(o.a, {
                        staticClass: "pt-0 align-center",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(n.a, {
                        staticClass: "py-0"
                    }, [e("div", {
                        staticClass: "PageHeader__container"
                    }, [e("div", {
                        staticClass: "PageHeader__title-container"
                    }, [t.isAp ? e("h2", {
                        staticClass: "PageHeader__ap"
                    }, [t._v("Achievement Pathway")]) : t._e(), t._v(" "), e("h1", {
                        staticClass: "PageHeader__title"
                    }, [t._v(t._s(t.title))])]), t._v(" "), t._t("buttons"), t._v(" "), t.imageSrc ? e("img", {
                        attrs: {
                            src: t.imageSrc,
                            alt: "Page Header image"
                        }
                    }) : t._e()], 2), t._v(" "), e(o.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(n.a, {
                        attrs: {
                            sm: "12",
                            md: "9",
                            lg: "10"
                        }
                    }, [e("div", {
                        staticClass: "PageHeader__subtitle"
                    }, [t._v("\n            " + t._s(t.subtitle) + "\n            "), t.href ? e("a", {
                        staticClass: "Link-alt",
                        attrs: {
                            href: t.href,
                            target: t.linkOpenContext
                        }
                    }, [t._v(t._s(t.linkTitle))]) : t._e()])])], 1)], 1), t._v(" "), t.$slots.infoBox && t.$vuetify.breakpoint.smOnly ? e("div", {
                        staticClass: "PageHeader__infobox-container--large"
                    }, [t._t("infoBox")], 2) : t._e()], 1), t._v(" "), t.$slots.infoBox && t.$vuetify.breakpoint.xsOnly ? e("div", {
                        staticClass: "PageHeader__infobox-container--small"
                    }, [t._t("infoBox")], 2) : t._e()], 1)
                }), [], !1, null, "5317aa88", null);
            e.default = component.exports
        },
        959: function(t, e, r) {
            "use strict";
            r(946)
        },
        960: function(t, e, r) {
            t.exports = {}
        },
        961: function(t, e, r) {
            "use strict";
            r(949)
        },
        964: function(t, e, r) {
            "use strict";
            r.r(e);
            var n = r(1090),
                o = r(1092),
                l = r(1091),
                c = r(1089),
                d = r(1).a.extend({
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
                v = (r(995), r(9)),
                component = Object(v.a)(d, (function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("div", {
                        staticClass: "Accordion",
                        class: {
                            "Accordion--theme-alt": this.themeAlt
                        }
                    }, [t(c.a, [t(n.a, {
                        staticClass: "Accordion__panel"
                    }, [t(l.a, [this._v(this._s(this.title))]), this._v(" "), t(o.a, [this._t("default")], 2)], 1)], 1)], 1)
                }), [], !1, null, null, null);
            e.default = component.exports
        },
        973: function(t, e, r) {
            t.exports = {}
        },
        995: function(t, e, r) {
            "use strict";
            r(960)
        },
        996: function(t, e, r) {
            t.exports = {}
        }
    }
]);