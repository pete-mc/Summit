(window.webpackJsonp = window.webpackJsonp || []).push([
    [23, 81, 104, 109], {
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
                _ = h.a.extend({
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
                v = (n(1125), n(9)),
                component = Object(v.a)(_, (function() {
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
        1162: function(t, e, n) {
            t.exports = {}
        },
        1186: function(t, e, n) {
            t.exports = {}
        },
        1187: function(t, e, n) {
            t.exports = {}
        },
        1238: function(t, e, n) {
            "use strict";
            n(1186)
        },
        1239: function(t, e, n) {
            "use strict";
            n(1187)
        },
        1302: function(t, e, n) {
            t.exports = {}
        },
        1347: function(t, e, n) {
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
                _ = n(4);
            const v = n(23);
            var I = f.c.extend({
                    name: "RemoveUnitMemberDialog",
                    props: {
                        unit: {
                            type: Object,
                            required: !0
                        },
                        member: {
                            type: Object,
                            required: !0
                        }
                    },
                    data: () => ({
                        requestPending: !1,
                        model: !1
                    }),
                    computed: {
                        memberFullName() {
                            return `${this.member.first_name} ${this.member.last_name}`
                        },
                        units() {
                            return this.$accessor.me.getGroupUnitsData
                        }
                    },
                    methods: {
                        cancel() {
                            this.model = !1
                        },
                        removeUnitMember() {
                            this.$data.requestPending = !0, this.handleRequest({
                                axiosRequest: h.a.delete,
                                url: `${this.$config.api.members}${_.GROUPS_PATH}/${this.$accessor.user.getGroupId}${_.UNITS_PATH}/${this.unit.id}${_.MEMBERS_PATH}/${this.member.id}`,
                                successResponseCode: v.NO_CONTENT,
                                successMessage: this.memberFullName + " removed from Unit",
                                showSnackbar: !0,
                                responseHandler: async () => {
                                    const t = await this.getUnitMembers(this.unit.id);
                                    this.$accessor.me.setUnitMembersData(t), this.$data.requestPending = !1
                                },
                                errorHandler: () => {
                                    this.$data.requestPending = !1
                                }
                            })
                        }
                    }
                }),
                D = (n(1238), n(9)),
                component = Object(D.a)(I, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e(c.a, {
                        staticClass: "RemoveUnitMemberDialog",
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
                        staticClass: "RemoveUnitMemberDialog__card"
                    }, [e(l.d, {
                        staticClass: "pb-0 mt-0 mb-8"
                    }, [e("div", [t._v("Remove " + t._s(t.memberFullName) + " from this Unit")])]), t._v(" "), e(l.b, {
                        staticClass: "pa-0"
                    }, [t._v("Are you sure you want to do this?")]), t._v(" "), e(l.a, {
                        staticClass: "px-2 py-0 mt-2"
                    }, [e(d.a), t._v(" "), e(o.a, {
                        attrs: {
                            text: ""
                        },
                        on: {
                            click: t.cancel
                        }
                    }, [t._v("Cancel")]), t._v(" "), e(o.a, {
                        attrs: {
                            text: "",
                            disabled: t.requestPending
                        },
                        nativeOn: {
                            click: function(e) {
                                return e.stopPropagation(), t.removeUnitMember()
                            }
                        }
                    }, [t._v("Confirm")])], 1)], 1)], 1)
                }), [], !1, null, "1baecfd6", null);
            e.default = component.exports
        },
        1348: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(998),
                r = n(11),
                l = n.n(r),
                c = n(40),
                d = n(4);
            const m = n(23);
            var h = c.c.extend({
                    name: "UnitCouncilCheckbox",
                    props: {
                        member: {
                            type: Object,
                            required: !0
                        },
                        responseHandler: {
                            type: Function,
                            default: null
                        }
                    },
                    data() {
                        return {
                            checked: this.member.unitCouncil,
                            loading: !1
                        }
                    },
                    computed: {
                        disabled() {
                            const t = this.member.unit;
                            return !t || 0 === Object.keys(t).length && t.constructor === Object
                        },
                        unitCouncil() {
                            return this.member.unitCouncil
                        }
                    },
                    watch: {
                        unitCouncil(t) {
                            this.checked = t
                        }
                    },
                    methods: {
                        toggleUnitCouncil(t) {
                            this.handleRequest({
                                axiosRequest: l.a.put,
                                url: `${this.$config.api.members}${d.GROUPS_PATH}/${this.$accessor.user.getGroupId}${d.UNITS_PATH}/${this.member.unit.id}${d.MEMBERS_PATH}/${this.member.id}`,
                                body: {
                                    duty: this.member.unit.duty,
                                    unit_council: this.checked
                                },
                                successResponseCode: m.NO_CONTENT,
                                successMessage: `${this.member.first_name} ${this.member.last_name} ${this.checked?"added to":"removed from"} Unit Council.`,
                                responseHandler: this.handleResponse,
                                showSnackbar: !0
                            })
                        },
                        handleResponse(t) {
                            this.getAndSetGroupMembers(), this.responseHandler && this.responseHandler(t)
                        }
                    }
                }),
                f = (n(1239), n(9)),
                component = Object(f.a)(h, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e(o.a, {
                        staticClass: "UnitCouncilCheckbox",
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.disabled
                        },
                        on: {
                            change: t.toggleUnitCouncil
                        },
                        model: {
                            value: t.checked,
                            callback: function(e) {
                                t.checked = e
                            },
                            expression: "checked"
                        }
                    })
                }), [], !1, null, "e9aa8cfc", null);
            e.default = component.exports
        },
        1356: function(t, e, n) {
            "use strict";
            n(1162);
            var o = n(49),
                r = n(73),
                l = n(1).a.extend({
                    name: "transitionable",
                    props: {
                        mode: String,
                        origin: String,
                        transition: String
                    }
                }),
                c = n(57),
                d = n(7);
            e.a = Object(d.a)(r.a, o.a, l).extend({
                name: "v-speed-dial",
                directives: {
                    ClickOutside: c.a
                },
                props: {
                    direction: {
                        type: String,
                        default: "top",
                        validator: t => ["top", "right", "bottom", "left"].includes(t)
                    },
                    openOnHover: Boolean,
                    transition: {
                        type: String,
                        default: "scale-transition"
                    }
                },
                computed: {
                    classes() {
                        return {
                            "v-speed-dial": !0,
                            "v-speed-dial--top": this.top,
                            "v-speed-dial--right": this.right,
                            "v-speed-dial--bottom": this.bottom,
                            "v-speed-dial--left": this.left,
                            "v-speed-dial--absolute": this.absolute,
                            "v-speed-dial--fixed": this.fixed,
                            ["v-speed-dial--direction-" + this.direction]: !0,
                            "v-speed-dial--is-active": this.isActive
                        }
                    }
                },
                render(t) {
                    let e = [];
                    const data = {
                        class: this.classes,
                        directives: [{
                            name: "click-outside",
                            value: () => this.isActive = !1
                        }],
                        on: {
                            click: () => this.isActive = !this.isActive
                        }
                    };
                    if (this.openOnHover && (data.on.mouseenter = () => this.isActive = !0, data.on.mouseleave = () => this.isActive = !1), this.isActive) {
                        let n = 0;
                        e = (this.$slots.default || []).map((b, i) => !b.tag || void 0 === b.componentOptions || "v-btn" !== b.componentOptions.Ctor.options.name && "v-tooltip" !== b.componentOptions.Ctor.options.name ? (b.key = i, b) : (n++, t("div", {
                            style: {
                                transitionDelay: .05 * n + "s"
                            },
                            key: i
                        }, [b])))
                    }
                    const n = t("transition-group", {
                        class: "v-speed-dial__list",
                        props: {
                            name: this.transition,
                            mode: this.mode,
                            origin: this.origin,
                            tag: "div"
                        }
                    }, e);
                    return t("div", data, [this.$slots.activator, n])
                }
            })
        },
        1403: function(t, e, n) {
            "use strict";
            n(1302)
        },
        1425: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(870),
                r = n(267),
                l = n(1439),
                c = n(163),
                d = n(869),
                m = n(1356),
                h = n(11),
                f = n.n(h),
                _ = n(4),
                v = n(3),
                I = n(5),
                D = n(287),
                y = n(41),
                A = n(40),
                T = n(55),
                $ = n(79),
                U = n(1087),
                M = n(1347),
                C = n(1348),
                R = A.E.extend({
                    name: "MembersUnitTable",
                    components: {
                        ConfirmationDialog: $.default,
                        Icon: T.default,
                        ImportDataDialog: U.default,
                        RemoveUnitMemberDialog: M.default,
                        UnitCouncilCheckbox: C.default
                    },
                    props: {
                        tableData: {
                            type: Array,
                            required: !0
                        },
                        unitData: {
                            type: Object,
                            required: !0
                        }
                    },
                    data: () => ({
                        API: _,
                        PATH: v,
                        fab: !1,
                        icon: D,
                        LABEL: I.i,
                        showImportDataDialog: !1,
                        showImportInfoDialog: !1,
                        userIdForImport: ""
                    }),
                    computed: {
                        section() {
                            return this.unitData.section
                        },
                        unitName() {
                            return this.unitData.name
                        },
                        isTableDataReady() {
                            return !this.tableData
                        },
                        tableDataTransformed() {
                            const t = JSON.parse(JSON.stringify(this.tableData)),
                                e = this.filterUnitList,
                                n = this.filterPatrolList;
                            return t.forEach(t => {
                                let o;
                                t.unit && t.unit.id && (o = t.unit.id), e.forEach(e => {
                                    t.unit || (t.unit = {}), e.id === o && (t.unit.name = e.name, t.sectionName = e.section)
                                }), t.unitCouncil = t.unit && t.unit.unit_council, t.unitRole = t.unit.duty.replace("_", " "), t.patrol && t.patrol.duty ? t.patrolDuty = t.patrol.duty.toLowerCase() : t.patrolDuty = "member", null !== t.patrolunitId && n.forEach(e => {
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
                        headersList: () => ({
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
                                text: "Duty",
                                value: "patrolDuty",
                                width: 220,
                                sortable: !1
                            }, {
                                text: "Patrol",
                                value: "patrol",
                                width: 180,
                                sortable: !1
                            }, {
                                text: "Unit Council",
                                value: "unitCouncil",
                                width: 50
                            }, {
                                text: "Baseline Achievements",
                                value: "import",
                                width: 200,
                                sortable: !1
                            }, {
                                text: "Actions",
                                value: "actions",
                                width: 120,
                                sortable: !1
                            }]
                        })
                    },
                    methods: {
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
                        setUserToImport(t) {
                            try {
                                this.userIdForImport = t
                            } catch (e) {
                                console.error("User id not found: ", t)
                            }
                        },
                        dataImport(t) {
                            this.$accessor.me.setImportedMember(t), this.$router.push({
                                path: v.DATA_IMPORT
                            })
                        },
                        getPatrolList(t) {
                            if (!t.unit || !t.unit.id) return;
                            const e = this.filterPatrolList.filter(e => e.unit_id === t.unit.id),
                                n = [{
                                    id: "",
                                    name: "None",
                                    unit_id: ""
                                }];
                            return e.length ? n.concat(e) : n
                        },
                        getDutyList(t) {
                            if (t.unit && t.unit.id) return t.patrol && t.patrol.id ? _.MEMBERS_TABLE_DUTIES_ALL : _.MEMBERS_TABLE_DUTIES_UNIT_LEADER
                        },
                        isPatrolDisabled: t => !t.unit || !t.unit.id,
                        isDutyDisabled: t => !t.unit || !t.unit.id,
                        preselectDropdown(input, t) {
                            switch (t.toLowerCase()) {
                                case y.a.PATROL:
                                    return null === input.patrol ? "" : this.filterPatrolList.find(t => t.id === input.patrol.id) || "None";
                                case y.a.DUTY:
                                    return input.unit || input.patrol ? input.unit.duty === _.UNIT_DUTY.UNIT_LEADER ? _.MEMBERS_TABLE_DUTIES_ALL.find(t => t.value === _.UNIT_DUTY.UNIT_LEADER) : input.unit.duty === _.UNIT_DUTY.ADULT_LEADER ? _.MEMBERS_TABLE_DUTIES_ALL.find(t => t.value === _.UNIT_DUTY.ADULT_LEADER) : void 0 !== this.getDutyList(input) ? this.getDutyList(input).find(t => t.value === input.patrolDuty) : "Scout" : "";
                                default:
                                    return "None"
                            }
                        },
                        fireResponse(t, e) {
                            t && (204 === t.status ? this.$store.dispatch("snackbar/setSnack", {
                                message: e || "Updated",
                                icon: "check"
                            }) : this.$store.dispatch("snackbar/setSnack", {
                                message: I.j.FAILURE,
                                icon: "nope"
                            }))
                        },
                        fireError(t, e) {
                            console.warn(`Failed to update '${e}' membership for member. Error: ${t}`), this.$store.dispatch("snackbar/setSnack", {
                                message: I.j.FAILURE,
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
                                const t = await f.a.put(`${this.$config.api.members}${_.GROUPS_PATH}/${this.$accessor.user.getGroupId}/${_.FORMATION_PATHS.UNIT}/${n}${_.MEMBERS_PATH}/${e}`, {
                                    duty: o,
                                    unit_council: r
                                });
                                return t.status && 204 === t.status ? t : void this.$store.dispatch("snackbar/setSnack", {
                                    message: I.j.FAILURE,
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
                                const t = await f.a.put(`${this.$config.api.members}${_.GROUPS_PATH}/${this.$accessor.user.getGroupId}/${n}/${o}${_.MEMBERS_PATH}/${r}`, e === _.FORMATIONS.PATROL ? {
                                    duty: l
                                } : {
                                    duty: l,
                                    unit_council: !1
                                });
                                return t.status && 204 === t.status ? t : void this.$store.dispatch("snackbar/setSnack", {
                                    message: I.j.FAILURE,
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
                                const t = await f.a.delete(`${this.$config.api.members}${_.GROUPS_PATH}/${this.$accessor.user.getGroupId}/${n}/${o}${_.MEMBERS_PATH}/${r}`);
                                return t.status && 204 === t.status ? t : void this.$store.dispatch("snackbar/setSnack", {
                                    message: I.j.FAILURE,
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
                            const n = _.FORMATIONS.UNIT,
                                o = _.FORMATION_NAMES.UNIT,
                                r = _.FORMATION_PATHS.UNIT,
                                l = e.id,
                                c = e.first_name,
                                d = t.id ? t.id : "",
                                m = t.name ? t.name : "",
                                h = e[n] ? e[n].id : "",
                                f = _.UNIT_DUTY.MEMBER,
                                v = {
                                    _formation: n,
                                    _formationName: o,
                                    _newFormationId: d,
                                    _newFormationName: m,
                                    _formationPath: r,
                                    _oldFormationId: h,
                                    _memberId: l,
                                    _memberName: c,
                                    duty: f
                                },
                                I = await this.apiFormationRequests(v);
                            I && 204 === I.status && ("put" === I.config.method ? this.$accessor.me.setMemberUpdatedFormation({
                                memberId: l,
                                formation: {
                                    unit: {
                                        id: d,
                                        duty: f,
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
                            const n = _.FORMATIONS.PATROL,
                                o = _.FORMATION_NAMES.PATROL,
                                r = _.FORMATION_PATHS.PATROL,
                                l = e.id,
                                c = e.first_name,
                                d = t.id ? t.id : "",
                                m = t.name ? t.name : "",
                                h = e[n] ? e[n].id : "",
                                f = _.UNIT_DUTY.MEMBER,
                                v = {
                                    _formation: n,
                                    _formationName: o,
                                    _formationPath: r,
                                    _newFormationId: d,
                                    _newFormationName: m,
                                    _oldFormationId: h,
                                    _memberId: l,
                                    _memberName: c,
                                    duty: f
                                },
                                I = await this.apiFormationRequests(v);
                            I && 204 === I.status && ("put" === I.config.method ? this.$accessor.me.setMemberUpdatedFormation({
                                memberId: l,
                                formation: {
                                    patrol: {
                                        id: d,
                                        duty: f
                                    }
                                }
                            }) : this.$accessor.me.setMemberUpdatedFormation({
                                memberId: l,
                                formation: {
                                    patrol: null
                                }
                            })), this.loading = !1
                        },
                        resolveDuty: (t, e, n) => Object.values(e).includes(t) ? t : n,
                        async handleDutyChange(t, e) {
                            this.loading = !0;
                            const n = e.id,
                                o = e.first_name,
                                r = e.unit && e.unit.id ? e.unit.id : null,
                                l = e.patrol && e.patrol.id ? e.patrol.id : null,
                                c = this.resolveDuty(t.value, _.UNIT_DUTY, _.UNIT_DUTY.MEMBER),
                                d = this.resolveDuty(t.value, _.PATROL_DUTY, _.PATROL_DUTY.MEMBER),
                                m = !(!e.unit || !e.unit.unit_council) && e.unit.unit_council,
                                h = {
                                    _memberId: n,
                                    _unitId: r,
                                    _unitDuty: c,
                                    _unitCouncil: m
                                },
                                f = {
                                    _memberId: n,
                                    _memberName: o,
                                    _formation: _.FORMATIONS.PATROL,
                                    _formationName: _.FORMATION_NAMES.PATROL,
                                    _formationPath: _.FORMATION_PATHS.PATROL,
                                    _newFormationId: l,
                                    duty: d
                                },
                                v = await this.apiDutyRequests(f, h);
                            v && 204 === v.status && (this.$accessor.me.setMemberUpdatedFormation({
                                memberId: n,
                                formation: {
                                    patrol: {
                                        id: l,
                                        duty: d
                                    }
                                }
                            }), this.$accessor.me.setMemberUpdatedFormation({
                                memberId: n,
                                formation: {
                                    unit: {
                                        id: r,
                                        duty: c,
                                        unit_council: m
                                    }
                                }
                            })), this.loading = !1
                        }
                    }
                }),
                E = (n(1403), n(9)),
                component = Object(E.a)(R, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "MembersUnitTable"
                    }, [e("div", {
                        staticClass: "MembersUnitTable__header"
                    }, [e("div", {
                        staticClass: "MembersUnitTable__subtitle"
                    }, [t._v("Section: " + t._s(t.section))]), t._v(" "), e("div", {
                        staticClass: "MembersUnitTable__title"
                    }, [t._v(t._s(t.unitName))]), t._v(" "), t.$accessor.user.hasRoleSupportLeaderReadOnly ? t._e() : e("nuxt-link", {
                        staticClass: "MembersUnitTable__header-button",
                        attrs: {
                            to: t.PATH.ADD_UNIT_MEMBER
                        }
                    }, [e(o.a, {
                        attrs: {
                            disabled: t.$nuxt.isOffline
                        }
                    }, [t._v("\n        " + t._s(t.LABEL.ADD_UNIT_MEMBER) + "\n      ")])], 1)], 1), t._v(" "), e(l.a, {
                        attrs: {
                            headers: t.headersList.default,
                            items: t.tableDataTransformed,
                            loading: t.isTableDataReady,
                            "item-key": "id"
                        },
                        scopedSlots: t._u([{
                            key: "header.import",
                            fn: function(n) {
                                let {} = n;
                                return [e("div", {
                                    staticClass: "d-flex align-center"
                                }, [e("div", [t._v("Baseline Achievements")]), t._v(" "), e("Icon", {
                                    staticClass: "MembersUnitTable__achievement-modal-icon",
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
                        }, {
                            key: "item.patrolDuty",
                            fn: function(n) {
                                let {
                                    item: o
                                } = n;
                                return [e(d.a, {
                                    staticClass: "MembersUnitTable__dropdown dropdown__duty",
                                    attrs: {
                                        label: "Duty",
                                        items: t.getDutyList(o),
                                        value: t.preselectDropdown(o, "duty"),
                                        disabled: t.$nuxt.isOffline || t.isDutyDisabled(o),
                                        "item-text": "name",
                                        "return-object": "",
                                        "single-line": "",
                                        dense: ""
                                    },
                                    on: {
                                        change: function(e) {
                                            return t.handleDutyChange(e, o)
                                        }
                                    }
                                })]
                            }
                        }, {
                            key: "item.patrol",
                            fn: function(n) {
                                let {
                                    item: o
                                } = n;
                                return [e(d.a, {
                                    staticClass: "MembersUnitTable__dropdown dropdown__patrol",
                                    attrs: {
                                        label: "Patrol",
                                        items: t.getPatrolList(o),
                                        value: t.preselectDropdown(o, "patrol"),
                                        disabled: t.$nuxt.isOffline || t.isPatrolDisabled(o),
                                        "item-text": "name",
                                        "return-object": "",
                                        "single-line": "",
                                        dense: ""
                                    },
                                    on: {
                                        change: function(e) {
                                            return t.handlePatrolChange(e, o)
                                        }
                                    }
                                })]
                            }
                        }, {
                            key: "item.import",
                            fn: function(n) {
                                let {
                                    item: r
                                } = n;
                                return [e("div", {
                                    staticClass: "MembersUnitTable__actions"
                                }, [t.isUserActivated(r) ? e("div", {
                                    staticClass: "MembersUnitTable__actions-complete"
                                }, [t._v("Complete")]) : e("div", {
                                    staticClass: "MembersUnitTable__actions-container"
                                }, [e(o.a, {
                                    staticClass: "MembersUnitTable__actions-button",
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
                                }, [t._v("\n            " + t._s(t.LABEL.BASELINE) + "\n          ")]), t._v(" "), e("span", {
                                    staticClass: "MembersUnitTable__actions-container-divider"
                                }, [t._v("|")]), t._v(" "), e(o.a, {
                                    staticClass: "MembersUnitTable__actions-button",
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
                                }, [t._v("\n            " + t._s(t.LABEL.NOT_REQUIRED) + "\n          ")])], 1)])]
                            }
                        }, {
                            key: "item.actions",
                            fn: function(n) {
                                let {
                                    item: r
                                } = n;
                                return [e("RemoveUnitMemberDialog", {
                                    attrs: {
                                        member: r,
                                        unit: t.unitData
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
                                                    label: t.LABEL.REMOVE,
                                                    size: "small",
                                                    outline: ""
                                                }
                                            })], 1)]
                                        }
                                    }], null, !0)
                                })]
                            }
                        }, {
                            key: "item.unitCouncil",
                            fn: function(t) {
                                let {
                                    item: n
                                } = t;
                                return [e("UnitCouncilCheckbox", {
                                    attrs: {
                                        member: n
                                    }
                                })]
                            }
                        }])
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
                    }), t._v(" "), t.$nuxt.isOnline && t.$vuetify.breakpoint.xs ? e(m.a, {
                        attrs: {
                            fixed: "",
                            bottom: "",
                            right: "",
                            direction: "top",
                            transition: "slide-y-reverse-transition",
                            "data-cy": "qa-speed-dial-unit"
                        },
                        scopedSlots: t._u([{
                            key: "activator",
                            fn: function() {
                                return [e(o.a, {
                                    attrs: {
                                        dark: "",
                                        fab: ""
                                    },
                                    model: {
                                        value: t.fab,
                                        callback: function(e) {
                                            t.fab = e
                                        },
                                        expression: "fab"
                                    }
                                }, [t.fab ? e(c.a, [t._v("mdi-close")]) : e(c.a, [t._v("mdi-plus")])], 1)]
                            },
                            proxy: !0
                        }], null, !1, 3560665882),
                        model: {
                            value: t.fab,
                            callback: function(e) {
                                t.fab = e
                            },
                            expression: "fab"
                        }
                    }, [t._v(" "), e(o.a, {
                        attrs: {
                            disabled: t.$nuxt.isOffline,
                            fab: "",
                            dark: "",
                            small: "",
                            to: t.PATH.ADD_UNIT_MEMBER,
                            "data-cy": "qa-add-unit-member"
                        }
                    }, [e(r.a, {
                        attrs: {
                            label: ""
                        }
                    }, [t._v("\n        " + t._s(t.LABEL.ADD_UNIT_MEMBER) + "\n      ")]), t._v(" "), e("Icon", {
                        attrs: {
                            outline: "",
                            name: "patrol",
                            alt: "Add Unit Member"
                        }
                    })], 1)], 1) : t._e()], 1)
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