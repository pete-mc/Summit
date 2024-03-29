(window.webpackJsonp = window.webpackJsonp || []).push([
    [11, 81, 101, 102, 105, 106], {
        1052: function(t, e, n) {
            t.exports = {}
        },
        1087: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(870),
                r = n(236),
                l = n(35),
                c = n(998),
                d = n(890),
                m = n(892),
                h = n(1),
                f = n(5),
                v = h.a.extend({
                    name: "ImportDataDialog",
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
                            default: f.i.CONFIRM
                        },
                        closeButtonLabel: {
                            type: String,
                            default: f.i.CANCEL
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
                        },
                        statements: {
                            type: Array,
                            required: !0
                        }
                    },
                    data: () => ({
                        LABEL: f.i,
                        statementsModel: [],
                        isValid: !1
                    }),
                    computed: {
                        showDialog() {
                            return this.model
                        }
                    },
                    mounted() {
                        this.$data.statementsModel = this.statements.map(() => !1)
                    },
                    methods: {
                        reset() {
                            this.$data.statementsModel = this.statements.map(() => !1), this.isValid = !1
                        },
                        resetDialog() {
                            this.reset(), this.closeDialog()
                        },
                        validate() {
                            const t = this.statementsModel.every(t => !0 === t);
                            this.statements.length === this.statementsModel.length ? this.isValid = t : this.isValid = !1
                        },
                        confirm() {
                            this.$props.confirmCallback(), this.resetDialog()
                        }
                    }
                }),
                _ = (n(1125), n(9)),
                component = Object(_.a)(v, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e(d.a, {
                        staticClass: "ImportDataDialog",
                        on: {
                            "click:outside": t.closeDialog
                        },
                        scopedSlots: t._u([{
                            key: "activator",
                            fn: function(e) {
                                let {
                                    on: n
                                } = e;
                                return [t._t("dialogActivator", null, {
                                    parentEvents: n
                                })]
                            }
                        }], null, !0),
                        model: {
                            value: t.showDialog,
                            callback: function(e) {
                                t.showDialog = e
                            },
                            expression: "showDialog"
                        }
                    }, [t._v(" "), e(r.a, {
                        staticClass: "ImportDataDialog__card"
                    }, [e(l.d, {
                        staticClass: "mt-0"
                    }, [e("div", [t._v(t._s(t.title))])]), t._v(" "), e(l.b, {
                        staticClass: "pa-0"
                    }, [e("span", [t._v("\n        " + t._s(t.subtitle) + "\n      ")])]), t._v(" "), t._l(t.statements, (function(n, o) {
                        return e("div", {
                            key: o
                        }, [e(c.a, {
                            attrs: {
                                label: n
                            },
                            on: {
                                change: function(e) {
                                    return t.validate()
                                }
                            },
                            model: {
                                value: t.statementsModel[o],
                                callback: function(e) {
                                    t.$set(t.statementsModel, o, e)
                                },
                                expression: "statementsModel[index]"
                            }
                        })], 1)
                    })), t._v(" "), e(l.a, {
                        staticClass: "ImportDataDialog__actions pa-0"
                    }, [e(m.a), t._v(" "), e(o.a, {
                        attrs: {
                            text: ""
                        },
                        on: {
                            click: t.resetDialog
                        }
                    }, [t._v(t._s(t.closeButtonLabel))]), t._v(" "), e(o.a, {
                        staticClass: "ImportDataDialog__saveBtn mr-4",
                        attrs: {
                            disabled: !t.isValid,
                            text: ""
                        },
                        on: {
                            click: t.confirm
                        }
                    }, [t._v("\n        " + t._s(t.confirmButtonLabel) + "\n      ")])], 1)], 2)], 1)
                }), [], !1, null, "551ce9f9", null);
            e.default = component.exports
        },
        1125: function(t, e, n) {
            "use strict";
            n(1052)
        },
        1165: function(t, e, n) {
            t.exports = {}
        },
        1166: function(t, e, n) {
            t.exports = {}
        },
        1167: function(t, e, n) {
            t.exports = {}
        },
        1168: function(t, e, n) {
            t.exports = {}
        },
        1218: function(t, e, n) {
            "use strict";
            n(1165)
        },
        1219: function(t, e, n) {
            "use strict";
            n(1166)
        },
        1220: function(t, e, n) {
            "use strict";
            n(1167)
        },
        1221: function(t, e, n) {
            "use strict";
            n(1168)
        },
        1280: function(t, e, n) {
            t.exports = {}
        },
        1329: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(870),
                r = n(236),
                l = n(35),
                c = n(890),
                d = n(892),
                m = n(11),
                h = n.n(m),
                f = n(40),
                v = n(4);
            const _ = n(23);
            var w = f.c.extend({
                    name: "DeletePatrolDialog",
                    props: {
                        patrol: {
                            type: Object,
                            required: !0
                        },
                        prerequestHandler: {
                            type: Function,
                            default: null
                        },
                        responseHandler: {
                            type: Function,
                            default: null
                        }
                    },
                    data: () => ({
                        model: !1
                    }),
                    methods: {
                        deletePatrol() {
                            this.model = !1, this.handleRequest({
                                axiosRequest: h.a.delete,
                                url: `${this.$config.api.members}${v.GROUPS_PATH}/${this.$accessor.user.getGroupId}${v.PATROLS_PATH}/${this.patrol.id}`,
                                successResponseCode: _.NO_CONTENT,
                                successMessage: `Patrol "${this.patrol.name}" deleted`,
                                responseHandler: this.handleResponse,
                                showSnackbar: !0
                            })
                        },
                        async handleResponse(t) {
                            await this.getAndSetGroupPatrols(), await this.getAndSetGroupMembers(), this.responseHandler && this.responseHandler(t)
                        }
                    }
                }),
                D = (n(1218), n(9)),
                component = Object(D.a)(w, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e(c.a, {
                        staticClass: "DeletePatrolDialog",
                        attrs: {
                            "max-width": "600px"
                        },
                        scopedSlots: t._u([{
                            key: "activator",
                            fn: function(e) {
                                let {
                                    on: n
                                } = e;
                                return [t._t("dialogActivator", null, {
                                    parentEvents: n
                                })]
                            }
                        }], null, !0),
                        model: {
                            value: t.model,
                            callback: function(e) {
                                t.model = e
                            },
                            expression: "model"
                        }
                    }, [t._v(" "), e(r.a, {
                        staticClass: "DeletePatrolDialog__card"
                    }, [e(l.d, {
                        staticClass: "mt-0"
                    }, [e("div", [t._v("Delete Patrol?")])]), t._v(" "), e(l.b, {
                        staticClass: "mt-4 px-0 pt-4"
                    }, [e("span", [t._v('All members will be removed from patrol "' + t._s(t.patrol.name) + '" and will become unassigned.')])]), t._v(" "), e(l.a, {
                        staticClass: "mt-4 px-3 py-0"
                    }, [e(d.a), t._v(" "), e(o.a, {
                        attrs: {
                            color: "blue darken-1",
                            text: ""
                        },
                        on: {
                            click: function(e) {
                                t.model = !1
                            }
                        }
                    }, [t._v("CANCEL")]), t._v(" "), e(o.a, {
                        staticClass: "DeletePatrolDialog__saveBtn",
                        attrs: {
                            text: ""
                        },
                        on: {
                            click: function(e) {
                                return t.deletePatrol()
                            }
                        }
                    }, [t._v("DELETE")])], 1)], 1)], 1)
                }), [], !1, null, "9c4c0ec0", null);
            e.default = component.exports
        },
        1330: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(870),
                r = n(236),
                l = n(35),
                c = n(890),
                d = n(892),
                m = n(11),
                h = n.n(m),
                f = n(40),
                v = n(4);
            const _ = n(23);
            var w = f.c.extend({
                    name: "DeleteUnitDialog",
                    props: {
                        unit: {
                            type: Object,
                            required: !0
                        },
                        prerequestHandler: {
                            type: Function,
                            default: null
                        },
                        responseHandler: {
                            type: Function,
                            default: null
                        }
                    },
                    data: () => ({
                        model: !1
                    }),
                    methods: {
                        deleteUnit() {
                            this.model = !1, this.handleRequest({
                                axiosRequest: h.a.delete,
                                url: `${this.$config.api.members}${v.GROUPS_PATH}/${this.$accessor.user.getGroupId}${v.UNITS_PATH}/${this.unit.id}`,
                                successResponseCode: _.NO_CONTENT,
                                successMessage: `Unit "${this.unit.name}" deleted`,
                                responseHandler: this.handleResponse,
                                showSnackbar: !0
                            })
                        },
                        async handleResponse(t) {
                            await this.getAndSetGroupUnits(this.$accessor.user.getGroupId), await this.getAndSetGroupPatrols(), await this.getAndSetGroupMembers(), this.responseHandler && this.responseHandler(t)
                        }
                    }
                }),
                D = (n(1219), n(9)),
                component = Object(D.a)(w, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e(c.a, {
                        staticClass: "DeleteUnitDialog",
                        attrs: {
                            "max-width": "600px"
                        },
                        scopedSlots: t._u([{
                            key: "activator",
                            fn: function(e) {
                                let {
                                    on: n
                                } = e;
                                return [t._t("dialogActivator", null, {
                                    parentEvents: n
                                })]
                            }
                        }], null, !0),
                        model: {
                            value: t.model,
                            callback: function(e) {
                                t.model = e
                            },
                            expression: "model"
                        }
                    }, [t._v(" "), e(r.a, {
                        staticClass: "DeleteUnitDialog__card"
                    }, [e(l.d, {
                        staticClass: "mt-0"
                    }, [e("div", [t._v("Delete Unit?")])]), t._v(" "), e(l.b, {
                        staticClass: "px-0 pt-4"
                    }, [e("span", [t._v('All patrols associated with "' + t._s(t.unit.name) + '" will be removed and members will become unassigned.')])]), t._v(" "), e(l.a, {
                        staticClass: "pa-0 mt-0"
                    }, [e(d.a), t._v(" "), e(o.a, {
                        attrs: {
                            color: "blue darken-1",
                            text: ""
                        },
                        on: {
                            click: function(e) {
                                t.model = !1
                            }
                        }
                    }, [t._v("CANCEL")]), t._v(" "), e(o.a, {
                        staticClass: "DeleteUnitDialog__saveBtn",
                        attrs: {
                            text: ""
                        },
                        on: {
                            click: function(e) {
                                return t.deleteUnit()
                            }
                        }
                    }, [t._v("DELETE")])], 1)], 1)], 1)
                }), [], !1, null, "5ca40065", null);
            e.default = component.exports
        },
        1331: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(870),
                r = n(236),
                l = n(35),
                c = n(886),
                d = n(901),
                m = n(890),
                h = n(885),
                f = n(892),
                v = n(62),
                _ = n(11),
                w = n.n(_),
                D = n(40),
                I = n(4);
            const P = n(23);
            var y = D.c.extend({
                    name: "RenamePatrolDialog",
                    props: {
                        patrol: {
                            type: Object,
                            required: !0
                        },
                        prerequestHandler: {
                            type: Function,
                            default: null
                        },
                        responseHandler: {
                            type: Function,
                            default: null
                        }
                    },
                    data: () => ({
                        model: !1,
                        name: "",
                        validate: !1
                    }),
                    computed: {
                        patrols() {
                            return this.$accessor.me.getGroupPatrolsData
                        },
                        valid() {
                            return !!this.validate && 0 === this.nameErrorMessages.length
                        },
                        nameErrorMessages() {
                            return this.validate ? this.getErrorMessages(this.patrolNameValidations, this.name) : []
                        }
                    },
                    methods: {
                        cancel() {
                            this.model = !1, this.name = this.patrol.name.toString(), this.validate = !1
                        },
                        renamePatrol() {
                            this.valid && (this.model = !1, this.handleRequest({
                                axiosRequest: w.a.put,
                                url: `${this.$config.api.members}${I.GROUPS_PATH}/${this.$accessor.user.getGroupId}${I.PATROLS_PATH}/${this.patrol.id}`,
                                body: {
                                    name: this.name
                                },
                                successResponseCode: P.OK,
                                successMessage: `Patrol "${this.patrol.name}" renamed to "${this.name}"`,
                                responseHandler: this.handleResponse,
                                showSnackbar: !0
                            }), this.validate = !1)
                        },
                        async handleResponse(t) {
                            t.status !== P.OK && (this.name = this.patrol.name.toString()), await this.getAndSetGroupPatrols(), await this.getAndSetGroupMembers(), this.responseHandler && this.responseHandler(t)
                        }
                    },
                    watch: {
                        model: function(t) {
                            t && this.focusTextField(this.$refs.name.$el)
                        }
                    },
                    mounted() {
                        this.name = this.patrol.name.toString()
                    }
                }),
                R = (n(1220), n(9)),
                component = Object(R.a)(y, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e(m.a, {
                        staticClass: "RenamePatrolDialog",
                        attrs: {
                            eager: "",
                            "max-width": "600px"
                        },
                        scopedSlots: t._u([{
                            key: "activator",
                            fn: function(e) {
                                let {
                                    on: n
                                } = e;
                                return [t._t("dialogActivator", null, {
                                    parentEvents: n
                                })]
                            }
                        }], null, !0),
                        model: {
                            value: t.model,
                            callback: function(e) {
                                t.model = e
                            },
                            expression: "model"
                        }
                    }, [t._v(" "), e(r.a, {
                        staticClass: "RenamePatrolDialog__card"
                    }, [e(l.d, {
                        staticClass: "pb-0 mt-0 mb-8"
                    }, [e("div", [t._v("Rename Patrol")])]), t._v(" "), e(l.c, {
                        staticClass: "py-0 px-0 mt-1 mb-0"
                    }, [e(d.a, {
                        staticClass: "pa-0 mt-0"
                    }, [e(h.a, [e(c.a, {
                        staticClass: "pb-0"
                    }, [e(v.a, {
                        ref: "name",
                        attrs: {
                            "error-messages": t.nameErrorMessages,
                            label: "Patrol Name"
                        },
                        on: {
                            input: function(e) {
                                t.validate = !0
                            }
                        },
                        model: {
                            value: t.name,
                            callback: function(e) {
                                t.name = e
                            },
                            expression: "name"
                        }
                    })], 1)], 1)], 1)], 1), t._v(" "), e(l.a, {
                        staticClass: "pa-0 mt-0"
                    }, [e(f.a), t._v(" "), e(o.a, {
                        attrs: {
                            color: "blue darken-1",
                            text: ""
                        },
                        on: {
                            click: function(e) {
                                return e.stopPropagation(), t.cancel.apply(null, arguments)
                            }
                        }
                    }, [t._v("Cancel")]), t._v(" "), e(o.a, {
                        class: ["RenamePatrolDialog__saveBtn", t.valid ? "active" : "inactive"],
                        attrs: {
                            text: ""
                        },
                        on: {
                            click: function(e) {
                                return t.renamePatrol()
                            }
                        }
                    }, [t._v("\n        Save\n      ")])], 1)], 1)], 1)
                }), [], !1, null, "37780d3e", null);
            e.default = component.exports
        },
        1332: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(870),
                r = n(236),
                l = n(35),
                c = n(886),
                d = n(901),
                m = n(890),
                h = n(885),
                f = n(892),
                v = n(62),
                _ = n(11),
                w = n.n(_),
                D = n(40),
                I = n(4);
            const P = n(23);
            var y = D.c.extend({
                    name: "RenameUnitDialog",
                    props: {
                        unit: {
                            type: Object,
                            required: !0
                        },
                        prerequestHandler: {
                            type: Function,
                            default: null
                        },
                        responseHandler: {
                            type: Function,
                            default: null
                        }
                    },
                    data: () => ({
                        model: !1,
                        name: "",
                        validate: !1
                    }),
                    computed: {
                        units() {
                            return this.$accessor.me.getGroupUnitsData
                        },
                        valid() {
                            return !!this.validate && 0 === this.nameErrorMessages.length
                        },
                        nameErrorMessages() {
                            return this.validate ? this.getErrorMessages(this.unitNameValidations, this.name) : []
                        }
                    },
                    methods: {
                        cancel() {
                            this.model = !1, this.name = this.unit.name.toString(), this.validate = !1
                        },
                        renameUnit() {
                            this.valid && (this.model = !1, this.handleRequest({
                                axiosRequest: w.a.put,
                                url: `${this.$config.api.members}${I.GROUPS_PATH}/${this.$accessor.user.getGroupId}${I.UNITS_PATH}/${this.unit.id}`,
                                body: {
                                    name: this.name
                                },
                                successResponseCode: P.OK,
                                successMessage: `Unit "${this.unit.name}" renamed to "${this.name}"`,
                                responseHandler: this.handleResponse,
                                showSnackbar: !0
                            }), this.validate = !1)
                        },
                        async handleResponse(t) {
                            t.status !== P.OK && (this.name = this.unit.name.toString()), await this.getAndSetGroupUnits(this.$accessor.user.getGroupId), await this.getAndSetGroupMembers(), this.responseHandler && this.responseHandler(t)
                        }
                    },
                    watch: {
                        model: function(t) {
                            t && this.focusTextField(this.$refs.name.$el)
                        }
                    },
                    mounted() {
                        this.name = this.unit.name.toString()
                    }
                }),
                R = (n(1221), n(9)),
                component = Object(R.a)(y, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e(m.a, {
                        staticClass: "RenameUnitDialog",
                        attrs: {
                            eager: "",
                            "max-width": "600px"
                        },
                        scopedSlots: t._u([{
                            key: "activator",
                            fn: function(e) {
                                let {
                                    on: n
                                } = e;
                                return [t._t("dialogActivator", null, {
                                    parentEvents: n
                                })]
                            }
                        }], null, !0),
                        model: {
                            value: t.model,
                            callback: function(e) {
                                t.model = e
                            },
                            expression: "model"
                        }
                    }, [t._v(" "), e(r.a, {
                        staticClass: "RenameUnitDialog__card"
                    }, [e(l.d, {
                        staticClass: "pb-0 mt-0 mb-8"
                    }, [e("div", [t._v("Rename Unit")])]), t._v(" "), e(l.c, {
                        staticClass: "py-0 px-0 mt-1 mb-0"
                    }, [e(d.a, {
                        staticClass: "pa-0 mt-0"
                    }, [e(h.a, [e(c.a, {
                        staticClass: "py-0",
                        attrs: {
                            cols: "12"
                        }
                    }, [e(v.a, {
                        ref: "name",
                        attrs: {
                            "error-messages": t.nameErrorMessages,
                            label: "Unit Name"
                        },
                        on: {
                            input: function(e) {
                                t.validate = !0
                            }
                        },
                        model: {
                            value: t.name,
                            callback: function(e) {
                                t.name = e
                            },
                            expression: "name"
                        }
                    })], 1)], 1)], 1)], 1), t._v(" "), e(l.a, {
                        staticClass: "px-2 py-0 mt-2"
                    }, [e(f.a), t._v(" "), e(o.a, {
                        attrs: {
                            text: ""
                        },
                        on: {
                            click: function(e) {
                                return e.stopPropagation(), t.cancel.apply(null, arguments)
                            }
                        }
                    }, [t._v("Cancel")]), t._v(" "), e(o.a, {
                        class: ["RenameUnitDialog__saveBtn", t.valid ? "active" : "inactive"],
                        attrs: {
                            text: ""
                        },
                        on: {
                            click: function(e) {
                                return t.renameUnit()
                            }
                        }
                    }, [t._v("\n        Save\n      ")])], 1)], 1)], 1)
                }), [], !1, null, "0d0146c6", null);
            e.default = component.exports
        },
        1379: function(t, e, n) {
            "use strict";
            n(1280)
        },
        1418: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(870),
                r = n(1439),
                l = n(62),
                c = n(11),
                d = n.n(c),
                m = n(4),
                h = n(41),
                f = n(3),
                v = n(5),
                _ = n(287),
                w = n(40),
                D = n(1329),
                I = n(1330),
                P = n(55),
                y = n(79),
                R = n(1087),
                $ = n(1331),
                C = n(1332);
            const x = n(23);
            var A = w.o.extend({
                    name: "MembersTable",
                    components: {
                        ConfirmationDialog: y.default,
                        DeletePatrolDialog: D.default,
                        DeleteUnitDialog: I.default,
                        Icon: P.default,
                        ImportDataDialog: R.default,
                        RenamePatrolDialog: $.default,
                        RenameUnitDialog: C.default
                    },
                    props: {
                        defaultTable: {
                            type: Boolean
                        },
                        tableData: {
                            type: Array,
                            required: !0
                        },
                        headers: {
                            type: String,
                            default: "default"
                        },
                        filterSearch: {
                            type: Boolean
                        },
                        group: {
                            type: Object,
                            required: !1
                        }
                    },
                    data: () => ({
                        API: m,
                        PATH: f,
                        search: "",
                        unitValue: null,
                        sectionValue: null,
                        patrolValue: null,
                        icon: _,
                        LABEL: v.i,
                        showImportDataDialog: !1,
                        showImportInfoDialog: !1,
                        showConfirmPasswordResetDialog: !1,
                        showPasswordResetSuccessDialog: !1,
                        userIdForImport: "",
                        resetPasswordData: {
                            memberId: "",
                            memberName: "",
                            newPassword: ""
                        },
                        requestPending: !1
                    }),
                    computed: {
                        isTableDataReady() {
                            return !!this.defaultTable && !this.tableData.length
                        },
                        tableDataTransformed() {
                            const t = JSON.parse(JSON.stringify(this.tableData)),
                                e = this.filterUnitList,
                                n = this.filterPatrolList;
                            return t.forEach(t => {
                                let o;
                                t.unit && t.unit.id && (o = t.unit.id), e.forEach(e => {
                                    t.unit || (t.unit = {}), e.id === o && (t.unit.name = e.name, t.sectionName = e.section)
                                }), null !== t.patrolunitId && n.forEach(e => {
                                    t.patrol || (t.patrol = {}), e.unit_id === o && (t.patrol.name = e.name, t.patrolName = e.name)
                                })
                            }), this.loading = !1, t
                        },
                        filterUnitList() {
                            return this.$accessor && this.$accessor.me.getGroupUnitsData ? this.$accessor.me.getGroupUnitsData : []
                        },
                        filterPatrolList() {
                            return this.$accessor && this.$accessor.me.getGroupUnitsData ? this.$accessor.me.getGroupPatrolsData : []
                        },
                        actionColumnWidth() {
                            return this.$vuetify.breakpoint.smAndDown ? 60 : 260
                        },
                        headersList() {
                            return {
                                default: [{
                                    text: "Member No.",
                                    value: "member_number",
                                    width: 10
                                }, {
                                    text: "First Name",
                                    value: "first_name",
                                    width: 130
                                }, {
                                    text: "Last Name",
                                    value: "last_name",
                                    width: 130
                                }, {
                                    text: "Unit",
                                    value: "unit",
                                    width: 210,
                                    sortable: !1
                                }, {
                                    text: "Section",
                                    value: "section",
                                    width: 140,
                                    sortable: !1
                                }, {
                                    text: "Status",
                                    value: "status",
                                    width: 90
                                }, {
                                    text: "Action",
                                    value: "manage_user",
                                    width: 130
                                }, {
                                    text: "",
                                    value: "reset_password",
                                    width: 130
                                }, {
                                    text: "Baseline Achievements",
                                    value: "actions",
                                    width: this.actionColumnWidth,
                                    sortable: !1
                                }],
                                units: [{
                                    text: "Unit Name",
                                    value: "name"
                                }, {
                                    text: "Action",
                                    value: "actions",
                                    width: this.actionColumnWidth
                                }, {
                                    text: "Record Achievements",
                                    value: "award",
                                    width: 200,
                                    sortable: !1
                                }],
                                patrols: [{
                                    text: "Patrol Name",
                                    value: "name"
                                }, {
                                    text: "Action",
                                    value: "actions",
                                    width: this.actionColumnWidth
                                }]
                            }
                        }
                    },
                    methods: {
                        goToMembersUnitPage(t) {
                            this.$accessor.me.setCurrentUnit(t), this.$router.push({
                                path: f.MEMBERS_UNITS,
                                params: {
                                    unit: t
                                }
                            })
                        },
                        memberUnitNames: t => t.map(t => t.name).join(", "),
                        memberRoles: t => t.map(t => t.duty).join(", ").replace(/_/g, " "),
                        memberSections: t => t.map(t => t.section).join(", "),
                        isUserActivated(t) {
                            var e;
                            return (null === (e = t.metadata) || void 0 === e ? void 0 : e["achievement-import"]) || !1
                        },
                        openImportInfoDialog() {
                            this.showImportInfoDialog = !0
                        },
                        closeImportInfoDialog() {
                            this.showImportInfoDialog = !1
                        },
                        openImportDataDialog() {
                            this.showImportDataDialog = !0
                        },
                        closeImportDataDialog() {
                            this.showImportDataDialog = !1
                        },
                        openConfirmPasswordResetDialog(t) {
                            this.resetPasswordData.memberId = t.id, this.resetPasswordData.memberName = t.first_name + " " + t.last_name, this.showConfirmPasswordResetDialog = !0
                        },
                        closeConfirmPasswordResetDialog() {
                            this.showConfirmPasswordResetDialog = !1
                        },
                        openPasswordResetSuccessDialog() {
                            this.showPasswordResetSuccessDialog = !0
                        },
                        closePasswordResetSuccessDialog() {
                            this.showPasswordResetSuccessDialog = !1, Object.keys(this.resetPasswordData).forEach(t => {
                                this.resetPasswordData[t] = ""
                            })
                        },
                        setUserToImport(t) {
                            try {
                                this.userIdForImport = t
                            } catch (e) {
                                console.error("User id not found: ", t)
                            }
                        },
                        dataImport(t) {
                            this.$accessor.me.setImportedMember(t), this.$router.push({
                                path: f.DATA_IMPORT
                            })
                        },
                        sectionFilterItems: () => [{
                            text: "All",
                            value: null
                        }].concat(Object.entries(h.b).map(t => {
                            let [e, n] = t;
                            return {
                                text: n,
                                value: n
                            }
                        })),
                        patrolFilterItems() {
                            const t = [];
                            return t.push({
                                text: "All",
                                value: null
                            }), this.filterPatrolList.forEach(e => {
                                t.push({
                                    text: e.name,
                                    value: e.name
                                })
                            }), t
                        },
                        getHeaders(header) {
                            return "patrols" === header ? this.headersList.patrols : "units" === header ? this.headersList.units : this.headersList.default
                        },
                        fireResponse(t, e) {
                            t && (204 === t.status ? this.$store.dispatch("snackbar/setSnack", {
                                message: e || "Updated",
                                icon: "check"
                            }) : this.$store.dispatch("snackbar/setSnack", {
                                message: v.j.FAILURE,
                                icon: "nope"
                            }))
                        },
                        fireError(t, e) {
                            console.warn(`Failed to update '${e}' membership for member. Error: ${t}`), this.$store.dispatch("snackbar/setSnack", {
                                message: v.j.FAILURE,
                                icon: "nope"
                            })
                        },
                        async unitLeadershipPutRequest(t) {
                            const {
                                _memberId: e,
                                _unitId: n,
                                _unitDuty: o,
                                _unitCouncil: r
                            } = t;
                            try {
                                const t = await d.a.put(`${this.$config.api.members}${m.GROUPS_PATH}/${this.group.id}/${m.FORMATION_PATHS.UNIT}/${n}${m.MEMBERS_PATH}/${e}`, {
                                    duty: o,
                                    unit_council: r
                                });
                                return t.status && 204 === t.status ? t : void this.$store.dispatch("snackbar/setSnack", {
                                    message: v.j.FAILURE,
                                    icon: "nope"
                                })
                            } catch (t) {
                                this.fireError(t, "unit")
                            }
                        },
                        async formationPutRequest(t) {
                            const {
                                _formation: e,
                                _formationPath: n,
                                _newFormationId: o,
                                _memberId: r,
                                duty: l
                            } = t;
                            try {
                                const t = await d.a.put(`${this.$config.api.members}${m.GROUPS_PATH}/${this.group.id}/${n}/${o}${m.MEMBERS_PATH}/${r}`, e === m.FORMATIONS.PATROL ? {
                                    duty: l
                                } : {
                                    duty: l,
                                    unit_council: !1
                                });
                                return t.status && 204 === t.status ? t : void this.$store.dispatch("snackbar/setSnack", {
                                    message: v.j.FAILURE,
                                    icon: "nope"
                                })
                            } catch (t) {
                                this.fireError(t, e)
                            }
                        },
                        async formationDeleteRequest(t) {
                            const {
                                _formationName: e,
                                _formationPath: n,
                                _oldFormationId: o,
                                _memberId: r
                            } = t;
                            try {
                                const t = await d.a.delete(`${this.$config.api.members}${m.GROUPS_PATH}/${this.group.id}/${n}/${o}${m.MEMBERS_PATH}/${r}`);
                                return t.status && 204 === t.status ? t : void this.$store.dispatch("snackbar/setSnack", {
                                    message: v.j.FAILURE,
                                    icon: "nope"
                                })
                            } catch (t) {
                                return this.fireError(t, e)
                            }
                        },
                        async apiFormationRequests(t) {
                            const {
                                _memberName: e,
                                _formation: n,
                                _newFormationId: o,
                                _newFormationName: r,
                                _oldFormationId: l
                            } = t, c = `${e} is now in ${r}`;
                            if (o && l) {
                                const e = await this.formationPutRequest(t),
                                    n = await this.formationDeleteRequest(t);
                                return await this.fireResponse(n, c), n && 204 === n.status ? e : null
                            }
                            if (l) {
                                const o = await this.formationDeleteRequest(t);
                                return await this.fireResponse(o, `${e} is now not in a ${n}`), o
                            }
                            if (o) {
                                const e = await this.formationPutRequest(t);
                                return await this.fireResponse(e, c), e
                            }
                        },
                        async apiDutyRequests(t, e) {
                            const {
                                _memberName: n,
                                _newFormationId: o
                            } = t, r = n + "'s duty is updated";
                            if (o) {
                                const n = await this.formationPutRequest(t),
                                    o = await this.unitLeadershipPutRequest(e);
                                return await this.fireResponse(o, r), o && 204 === o.status ? n : null
                            } {
                                const t = await this.unitLeadershipPutRequest(e);
                                return await this.fireResponse(t, r), t && 204 === t.status ? t : null
                            }
                        },
                        async handleUnitChange(t, e) {
                            this.loading = !0;
                            const n = m.FORMATIONS.UNIT,
                                o = m.FORMATION_NAMES.UNIT,
                                r = m.FORMATION_PATHS.UNIT,
                                l = e.id,
                                c = e.first_name,
                                d = t.id ? t.id : "",
                                h = t.name ? t.name : "",
                                f = e[n] ? e[n].id : "",
                                v = m.UNIT_DUTY.MEMBER,
                                _ = {
                                    _formation: n,
                                    _formationName: o,
                                    _newFormationId: d,
                                    _newFormationName: h,
                                    _formationPath: r,
                                    _oldFormationId: f,
                                    _memberId: l,
                                    _memberName: c,
                                    duty: v
                                },
                                w = await this.apiFormationRequests(_);
                            w && 204 === w.status && ("put" === w.config.method ? this.$accessor.me.setMemberUpdatedFormation({
                                memberId: l,
                                formation: {
                                    unit: {
                                        id: d,
                                        duty: v,
                                        unit_council: !1
                                    }
                                }
                            }) : this.$accessor.me.setMemberUpdatedFormation({
                                memberId: l,
                                formation: {
                                    unit: null
                                }
                            }), this.$accessor.me.setMemberUpdatedFormation({
                                memberId: l,
                                formation: {
                                    patrol: null
                                }
                            })), this.loading = !1
                        },
                        async handlePatrolChange(t, e) {
                            this.loading = !0;
                            const n = m.FORMATIONS.PATROL,
                                o = m.FORMATION_NAMES.PATROL,
                                r = m.FORMATION_PATHS.PATROL,
                                l = e.id,
                                c = e.first_name,
                                d = t.id ? t.id : "",
                                h = t.name ? t.name : "",
                                f = e[n] ? e[n].id : "",
                                v = m.UNIT_DUTY.MEMBER,
                                _ = {
                                    _formation: n,
                                    _formationName: o,
                                    _formationPath: r,
                                    _newFormationId: d,
                                    _newFormationName: h,
                                    _oldFormationId: f,
                                    _memberId: l,
                                    _memberName: c,
                                    duty: v
                                },
                                w = await this.apiFormationRequests(_);
                            w && 204 === w.status && ("put" === w.config.method ? this.$accessor.me.setMemberUpdatedFormation({
                                memberId: l,
                                formation: {
                                    patrol: {
                                        id: d,
                                        duty: v
                                    }
                                }
                            }) : this.$accessor.me.setMemberUpdatedFormation({
                                memberId: l,
                                formation: {
                                    patrol: null
                                }
                            })), this.loading = !1
                        },
                        getConfirmPasswordResetMessage() {
                            return "Are you sure you want to reset the password for " + this.resetPasswordData.memberName + "?"
                        },
                        resetMemberPassword() {
                            this.requestPending || (this.requestPending = !0, this.httpRequest({
                                axiosRequest: d.a.post,
                                url: `${this.$config.api.members}${m.MEMBERS_PATH}/${this.resetPasswordData.memberId}/reset`,
                                successResponseCode: x.OK,
                                successMessage: "Password reset for member " + this.resetPasswordData.memberName,
                                responseHandler: t => {
                                    this.requestPending = !1, this.resetPasswordData.newPassword = t.data.password, this.openPasswordResetSuccessDialog()
                                },
                                errorHandler: () => {
                                    this.requestPending = !1, this.$accessor.snackbar.setSnack({
                                        message: "An error occurred. Password was not reset.",
                                        icon: "nope"
                                    })
                                }
                            }))
                        },
                        getSuccessfulPasswordResetMessage() {
                            return "New password for " + this.resetPasswordData.memberName + ":\n\n" + this.resetPasswordData.newPassword + "\n\n IMPORTANT: Copy this password down now. Once this window closes you will not be able to retrieve it again."
                        }
                    }
                }),
                S = (n(1379), n(9)),
                component = Object(S.a)(A, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "MembersTable"
                    }, [e(r.a, {
                        attrs: {
                            headers: t.getHeaders(t.headers),
                            items: t.defaultTable ? t.tableDataTransformed : t.tableData,
                            search: t.search,
                            loading: t.isTableDataReady,
                            "item-key": "id"
                        },
                        scopedSlots: t._u([t.defaultTable ? {
                            key: "header.actions",
                            fn: function(n) {
                                let {} = n;
                                return [e("div", {
                                    staticClass: "d-flex align-center"
                                }, [e("div", [t._v("Baseline Achievements")]), t._v(" "), e("Icon", {
                                    staticClass: "MembersTable__achievement-modal-icon",
                                    attrs: {
                                        name: "info"
                                    },
                                    on: {
                                        keydown: function(e) {
                                            return t.openImportInfoDialog()
                                        }
                                    },
                                    nativeOn: {
                                        click: function(e) {
                                            return e.stopPropagation(), t.openImportInfoDialog()
                                        }
                                    }
                                })], 1)]
                            }
                        } : null, {
                            key: "top",
                            fn: function() {
                                return [t.filterSearch ? e(l.a, {
                                    staticClass: "MembersTable__search",
                                    attrs: {
                                        label: "Filter",
                                        "append-icon": "mdi-magnify",
                                        "single-line": "",
                                        "hide-details": "",
                                        height: "40",
                                        width: "33%"
                                    },
                                    model: {
                                        value: t.search,
                                        callback: function(e) {
                                            t.search = e
                                        },
                                        expression: "search"
                                    }
                                }) : t._e()]
                            },
                            proxy: !0
                        }, {
                            key: "item.unit",
                            fn: function(e) {
                                let {
                                    item: n
                                } = e;
                                return [t._v("\n      " + t._s(t.memberUnitNames(n.units)) + "\n    ")]
                            }
                        }, {
                            key: "item.role",
                            fn: function(e) {
                                let {
                                    item: n
                                } = e;
                                return [t._v("\n      " + t._s(t.memberRoles(n.units)) + "\n    ")]
                            }
                        }, {
                            key: "item.section",
                            fn: function(e) {
                                let {
                                    item: n
                                } = e;
                                return [t._v("\n      " + t._s(t.memberSections(n.units)) + "\n    ")]
                            }
                        }, {
                            key: "item.manage_user",
                            fn: function(n) {
                                let {
                                    item: r
                                } = n;
                                return [e("div", {
                                    staticClass: "MembersTable__actions"
                                }, [e(o.a, {
                                    attrs: {
                                        disabled: !t.canManageAchievementPathways(r.id),
                                        "data-cy": "manage-achievement-pathways",
                                        small: "",
                                        text: ""
                                    },
                                    on: {
                                        click: function(e) {
                                            return t.openManageUserDialogMembers(r)
                                        }
                                    }
                                }, [t._v("\n          Manage Achievement Pathways\n        ")])], 1)]
                            }
                        }, {
                            key: "item.reset_password",
                            fn: function(n) {
                                let {
                                    item: r
                                } = n;
                                return [e("div", {
                                    staticClass: "MembersTable__actions"
                                }, [e(o.a, {
                                    attrs: {
                                        disabled: t.$nuxt.isOffline,
                                        small: "",
                                        text: ""
                                    },
                                    on: {
                                        click: function(e) {
                                            return t.openConfirmPasswordResetDialog(r)
                                        }
                                    }
                                }, [t._v("\n          Reset Password\n        ")])], 1)]
                            }
                        }, "units" === t.headers ? {
                            key: "item.name",
                            fn: function(n) {
                                let {
                                    item: o
                                } = n;
                                return [e("nuxt-link", {
                                    attrs: {
                                        to: t.PATH.MEMBERS_UNITS,
                                        tabindex: "-1"
                                    }
                                }), t._v(" "), e("a", {
                                    staticClass: "Link-alt Link-alt--inline",
                                    attrs: {
                                        tabindex: "0"
                                    },
                                    on: {
                                        click: function(e) {
                                            return t.goToMembersUnitPage(o)
                                        },
                                        keydown: function(e) {
                                            return !e.type.indexOf("key") && t._k(e.keyCode, "enter", 13, e.key, "Enter") ? null : t.goToMembersUnitPage(o)
                                        }
                                    }
                                }, [t._v("\n        " + t._s(o.name) + "\n      ")])]
                            }
                        } : null, t.$accessor.user.hasRoleGroupLeader ? {
                            key: "item.actions",
                            fn: function(n) {
                                let {
                                    item: r
                                } = n;
                                return ["default" === t.headers ? e("div", {
                                    staticClass: "MembersTable__actions"
                                }, [t.isUserActivated(r) ? e("div", {
                                    staticClass: "MembersTable__actions-complete"
                                }, [t._v("Complete")]) : e("div", {
                                    staticClass: "MembersTable__actions-container"
                                }, [e(o.a, {
                                    attrs: {
                                        disabled: t.$nuxt.isOffline,
                                        small: "",
                                        text: ""
                                    },
                                    on: {
                                        click: function(e) {
                                            return t.dataImport(r)
                                        }
                                    }
                                }, [t._v(t._s(t.LABEL.BASELINE))]), t._v(" "), e("span", {
                                    staticClass: "MembersTable__actions-container-divider"
                                }, [t._v("|")]), t._v(" "), e(o.a, {
                                    attrs: {
                                        disabled: t.$nuxt.isOffline,
                                        small: "",
                                        text: ""
                                    },
                                    on: {
                                        click: function(e) {
                                            e.stopPropagation(), t.setUserToImport(r.id), t.openImportDataDialog()
                                        },
                                        keydown: function(e) {
                                            t.setUserToImport(r.id), t.openImportDataDialog()
                                        }
                                    }
                                }, [t._v("\n            " + t._s(t.LABEL.NOT_REQUIRED) + "\n          ")])], 1)]) : t._e(), t._v(" "), "units" === t.headers ? e("div", {
                                    staticClass: "MembersTable__actions"
                                }, [e("RenameUnitDialog", {
                                    attrs: {
                                        unit: r
                                    },
                                    scopedSlots: t._u([{
                                        key: "dialogActivator",
                                        fn: function(n) {
                                            return [e(o.a, t._g({
                                                attrs: {
                                                    disabled: t.$nuxt.isOffline,
                                                    small: "",
                                                    text: ""
                                                }
                                            }, n.parentEvents), [e("Icon", {
                                                staticClass: "mr-2",
                                                attrs: {
                                                    name: "edit",
                                                    label: t.LABEL.RENAME,
                                                    size: "small",
                                                    outline: ""
                                                }
                                            })], 1)]
                                        }
                                    }], null, !0)
                                }), t._v(" "), t.$accessor.user.hasRoleGroupLeader ? e("DeleteUnitDialog", {
                                    attrs: {
                                        unit: r
                                    },
                                    scopedSlots: t._u([{
                                        key: "dialogActivator",
                                        fn: function(n) {
                                            return [e(o.a, t._g({
                                                attrs: {
                                                    disabled: t.$nuxt.isOffline,
                                                    small: "",
                                                    text: ""
                                                }
                                            }, n.parentEvents), [e("Icon", {
                                                staticClass: "mr-2",
                                                attrs: {
                                                    name: "delete",
                                                    label: t.LABEL.DELETE,
                                                    size: "small",
                                                    outline: ""
                                                }
                                            })], 1)]
                                        }
                                    }], null, !0)
                                }) : t._e()], 1) : t._e(), t._v(" "), "patrols" === t.headers ? e("div", {
                                    staticClass: "MembersTable__actions"
                                }, [e("RenamePatrolDialog", {
                                    attrs: {
                                        patrol: r
                                    },
                                    scopedSlots: t._u([{
                                        key: "dialogActivator",
                                        fn: function(n) {
                                            return [e(o.a, t._g({
                                                attrs: {
                                                    disabled: t.$nuxt.isOffline,
                                                    small: "",
                                                    text: ""
                                                }
                                            }, n.parentEvents), [e("Icon", {
                                                staticClass: "mr-2",
                                                attrs: {
                                                    name: "edit",
                                                    label: t.LABEL.RENAME,
                                                    size: "small",
                                                    outline: ""
                                                }
                                            })], 1)]
                                        }
                                    }], null, !0)
                                }), t._v(" "), e("DeletePatrolDialog", {
                                    attrs: {
                                        patrol: r
                                    },
                                    scopedSlots: t._u([{
                                        key: "dialogActivator",
                                        fn: function(n) {
                                            return [e(o.a, t._g({
                                                attrs: {
                                                    disabled: t.$nuxt.isOffline,
                                                    small: "",
                                                    text: ""
                                                }
                                            }, n.parentEvents), [e("Icon", {
                                                staticClass: "mr-2",
                                                attrs: {
                                                    name: "delete",
                                                    label: t.LABEL.DELETE,
                                                    size: "small",
                                                    outline: ""
                                                }
                                            })], 1)]
                                        }
                                    }], null, !0)
                                })], 1) : t._e()]
                            }
                        } : null, {
                            key: "item.award",
                            fn: function(n) {
                                let {
                                    item: r
                                } = n;
                                return [e(o.a, {
                                    staticClass: "px-0",
                                    attrs: {
                                        disabled: t.$nuxt.isOffline,
                                        "data-cy": "record-achievements",
                                        small: "",
                                        text: ""
                                    },
                                    on: {
                                        click: function(e) {
                                            return t.$router.push({
                                                name: "members-record-achievements",
                                                params: {
                                                    unitId: r.id
                                                }
                                            })
                                        }
                                    }
                                }, [t._v("\n        Record Achievements\n      ")])]
                            }
                        }], null, !0)
                    }), t._v(" "), e("ImportDataDialog", {
                        attrs: {
                            model: t.showImportDataDialog,
                            title: "Import not required",
                            subtitle: "This is a once-off step required to activate a youth member’s progression in Scouts | Terrain.",
                            "confirm-button-label": t.LABEL.CONFIRM,
                            "close-button-label": t.LABEL.CANCEL,
                            "confirm-callback": t.finaliseImportedAchievementData,
                            "close-dialog": t.closeImportDataDialog,
                            statements: ["I confirm that all the Achievement Pathways data of this youth member are correct and up-to-date and I do not need to import any prior data into Scouts | Terrain.", "I understand that once submitted the Baseline feature will be disabled."]
                        }
                    }), t._v(" "), e("ConfirmationDialog", {
                        attrs: {
                            model: t.showImportInfoDialog,
                            title: t.importInfoModalTitle,
                            subtitle: t.importInfoModalSubtitle,
                            "close-button-label": t.LABEL.CLOSE,
                            "close-dialog": t.closeImportInfoDialog,
                            "hide-confirm": ""
                        }
                    }), t._v(" "), e("ConfirmationDialog", {
                        attrs: {
                            model: t.showConfirmPasswordResetDialog,
                            title: "Reset Member password",
                            subtitle: t.getConfirmPasswordResetMessage(),
                            "confirm-button-label": t.LABEL.RESET,
                            "confirm-callback": t.resetMemberPassword,
                            "close-dialog": t.closeConfirmPasswordResetDialog
                        }
                    }), t._v(" "), e("ConfirmationDialog", {
                        attrs: {
                            model: t.showPasswordResetSuccessDialog,
                            title: "Password reset successful",
                            subtitle: t.getSuccessfulPasswordResetMessage(),
                            "close-button-label": t.LABEL.CLOSE,
                            "close-dialog": t.closePasswordResetSuccessDialog,
                            "hide-confirm": ""
                        }
                    }), t._v(" "), e("ConfirmationDialog", {
                        attrs: {
                            model: t.manageUserDialog,
                            title: "Manage Achievement Pathways",
                            subtitle: t.manageSubtitle,
                            "confirm-button-label": t.LABEL.CONTINUE,
                            "close-button-label": t.LABEL.CANCEL,
                            "confirm-callback": t.actOnBehalfOfMember,
                            "close-dialog": () => t.manageUserDialog = !1
                        }
                    })], 1)
                }), [], !1, null, null, null);
            e.default = component.exports;
            installComponents(component, {
                Icon: n(55).default,
                ImportDataDialog: n(1087).default,
                ConfirmationDialog: n(79).default
            })
        },
        943: function(t, e, n) {
            "use strict";
            var o = n(60),
                r = n(1);
            e.a = r.a.extend({
                name: "rippleable",
                directives: {
                    ripple: o.a
                },
                props: {
                    ripple: {
                        type: [Boolean, Object],
                        default: !0
                    }
                },
                methods: {
                    genRipple(data = {}) {
                        return this.ripple ? (data.staticClass = "v-input--selection-controls__ripple", data.directives = data.directives || [], data.directives.push({
                            name: "ripple",
                            value: {
                                center: !0
                            }
                        }), this.$createElement("div", data)) : null
                    }
                }
            })
        },
        944: function(t, e, n) {
            t.exports = {}
        },
        945: function(t, e, n) {
            "use strict";
            n.d(e, "b", (function() {
                return d
            }));
            var o = n(68),
                r = n(943),
                l = n(147),
                c = n(7);

            function d(t) {
                t.preventDefault()
            }
            e.a = Object(c.a)(o.a, r.a, l.a).extend({
                name: "selectable",
                model: {
                    prop: "inputValue",
                    event: "change"
                },
                props: {
                    id: String,
                    inputValue: null,
                    falseValue: null,
                    trueValue: null,
                    multiple: {
                        type: Boolean,
                        default: null
                    },
                    label: String
                },
                data() {
                    return {
                        hasColor: this.inputValue,
                        lazyValue: this.inputValue
                    }
                },
                computed: {
                    computedColor() {
                        if (this.isActive) return this.color ? this.color : this.isDark && !this.appIsDark ? "white" : "primary"
                    },
                    isMultiple() {
                        return !0 === this.multiple || null === this.multiple && Array.isArray(this.internalValue)
                    },
                    isActive() {
                        const t = this.value,
                            input = this.internalValue;
                        return this.isMultiple ? !!Array.isArray(input) && input.some(e => this.valueComparator(e, t)) : void 0 === this.trueValue || void 0 === this.falseValue ? t ? this.valueComparator(t, input) : Boolean(input) : this.valueComparator(input, this.trueValue)
                    },
                    isDirty() {
                        return this.isActive
                    },
                    rippleState() {
                        return this.isDisabled || this.validationState ? this.validationState : void 0
                    }
                },
                watch: {
                    inputValue(t) {
                        this.lazyValue = t, this.hasColor = t
                    }
                },
                methods: {
                    genLabel() {
                        const label = o.a.options.methods.genLabel.call(this);
                        return label ? (label.data.on = {
                            click: d
                        }, label) : label
                    },
                    genInput(t, e) {
                        return this.$createElement("input", {
                            attrs: Object.assign({
                                "aria-checked": this.isActive.toString(),
                                disabled: this.isDisabled,
                                id: this.computedId,
                                role: t,
                                type: t
                            }, e),
                            domProps: {
                                value: this.value,
                                checked: this.isActive
                            },
                            on: {
                                blur: this.onBlur,
                                change: this.onChange,
                                focus: this.onFocus,
                                keydown: this.onKeydown,
                                click: d
                            },
                            ref: "input"
                        })
                    },
                    onClick(t) {
                        this.onChange(), this.$emit("click", t)
                    },
                    onChange() {
                        if (!this.isInteractive) return;
                        const t = this.value;
                        let input = this.internalValue;
                        if (this.isMultiple) {
                            Array.isArray(input) || (input = []);
                            const e = input.length;
                            input = input.filter(e => !this.valueComparator(e, t)), input.length === e && input.push(t)
                        } else input = void 0 !== this.trueValue && void 0 !== this.falseValue ? this.valueComparator(input, this.trueValue) ? this.falseValue : this.trueValue : t ? this.valueComparator(input, t) ? null : t : !input;
                        this.validate(!0, input), this.internalValue = input, this.hasColor = input
                    },
                    onFocus(t) {
                        this.isFocused = !0, this.$emit("focus", t)
                    },
                    onBlur(t) {
                        this.isFocused = !1, this.$emit("blur", t)
                    },
                    onKeydown(t) {}
                }
            })
        },
        952: function(t, e, n) {
            t.exports = {}
        },
        998: function(t, e, n) {
            "use strict";
            n(952), n(944);
            var o = n(67),
                r = n(68),
                l = n(945);
            e.a = l.a.extend({
                name: "v-checkbox",
                props: {
                    indeterminate: Boolean,
                    indeterminateIcon: {
                        type: String,
                        default: "$checkboxIndeterminate"
                    },
                    offIcon: {
                        type: String,
                        default: "$checkboxOff"
                    },
                    onIcon: {
                        type: String,
                        default: "$checkboxOn"
                    }
                },
                data() {
                    return {
                        inputIndeterminate: this.indeterminate
                    }
                },
                computed: {
                    classes() {
                        return { ...r.a.options.computed.classes.call(this),
                            "v-input--selection-controls": !0,
                            "v-input--checkbox": !0,
                            "v-input--indeterminate": this.inputIndeterminate
                        }
                    },
                    computedIcon() {
                        return this.inputIndeterminate ? this.indeterminateIcon : this.isActive ? this.onIcon : this.offIcon
                    },
                    validationState() {
                        if (!this.isDisabled || this.inputIndeterminate) return this.hasError && this.shouldValidate ? "error" : this.hasSuccess ? "success" : null !== this.hasColor ? this.computedColor : void 0
                    }
                },
                watch: {
                    indeterminate(t) {
                        this.$nextTick(() => this.inputIndeterminate = t)
                    },
                    inputIndeterminate(t) {
                        this.$emit("update:indeterminate", t)
                    },
                    isActive() {
                        this.indeterminate && (this.inputIndeterminate = !1)
                    }
                },
                methods: {
                    genCheckbox() {
                        const {
                            title: title,
                            ...t
                        } = this.attrs$;
                        return this.$createElement("div", {
                            staticClass: "v-input--selection-controls__input"
                        }, [this.$createElement(o.a, this.setTextColor(this.validationState, {
                            props: {
                                dense: this.dense,
                                dark: this.dark,
                                light: this.light
                            }
                        }), this.computedIcon), this.genInput("checkbox", { ...t,
                            "aria-checked": this.inputIndeterminate ? "mixed" : this.isActive.toString()
                        }), this.genRipple(this.setTextColor(this.rippleState))])
                    },
                    genDefaultSlot() {
                        return [this.genCheckbox(), this.genLabel()]
                    }
                }
            })
        }
    }
]);