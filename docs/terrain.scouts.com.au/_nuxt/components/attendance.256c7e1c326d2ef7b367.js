(window.webpackJsonp = window.webpackJsonp || []).push([
    [52], {
        1117: function(t, e, n) {
            "use strict";
            n.r(e);
            var l = n(870),
                r = n(236),
                c = n(35),
                o = n(998),
                d = n(1439),
                h = n(890),
                m = n(892),
                v = n(5),
                f = n(40),
                k = n(28),
                y = f.z.extend({
                    name: "Attendance",
                    props: {
                        isConcluded: {
                            type: Boolean
                        },
                        disabled: {
                            type: Boolean
                        },
                        attendanceData: {
                            type: Object,
                            default: {},
                            required: !0
                        },
                        inviteeType: {
                            type: String,
                            required: !0
                        },
                        entityMembers: {
                            type: Array,
                            default: [],
                            required: !0
                        }
                    },
                    data: () => ({
                        LABEL: v.i,
                        attendees: [],
                        attendance: [],
                        participation: [],
                        participationModal: !1
                    }),
                    computed: {
                        headers: () => [{
                            text: "Name",
                            value: "full_name",
                            width: 160
                        }, {
                            text: "Attendance",
                            value: "attendance",
                            width: 145,
                            sortable: !1
                        }, {
                            text: "Participation",
                            value: "participation",
                            tooltip: "participation",
                            width: 145,
                            sortable: !1
                        }]
                    },
                    methods: {
                        getAttendanceList() {
                            var t, e, n, l, r, c;
                            const o = null !== (e = null === (t = this.attendanceData) || void 0 === t ? void 0 : t.attendee_members.map(t => t.id)) && void 0 !== e ? e : [],
                                d = null !== (l = null === (n = this.attendanceData) || void 0 === n ? void 0 : n.participant_members.map(t => t.id)) && void 0 !== l ? l : [],
                                h = [...this.entityMembers];
                            h.forEach(t => {
                                t.attended = o.includes(t.id), t.participated = d.includes(t.id)
                            });
                            const m = new Set(h.map(t => t.id)),
                                v = t => {
                                    m.has(t.id) || (t.attended = o.includes(t.id), t.participated = d.includes(t.id), h.push(t), m.add(t.id))
                                };
                            return null === (r = this.attendanceData) || void 0 === r || r.attendee_members.forEach(v), null === (c = this.attendanceData) || void 0 === c || c.participant_members.forEach(v), h.sort(Object(k.g)("first_name")), h
                        },
                        selectAttendee(t) {
                            t.attended = !t.attended
                        },
                        selectParticipant(t) {
                            t.participated = !t.participated, t.participated && !t.attended && (t.attended = !0, this.$data.attendance = [...this.$data.attendance, t])
                        },
                        changeAllAttendance(t) {
                            this.attendees.forEach(e => e.attended = t), this.$data.attendance = t ? this.attendees.map(t => t) : []
                        },
                        changeAllParticipants(t) {
                            this.attendees.forEach(e => e.participated = t), this.$data.participation = t ? this.attendees.map(t => t) : [], t && this.changeAllAttendance(t)
                        },
                        updateAttendees() {
                            const t = this.getAttendanceList();
                            this.attendees = t, this.$data.attendance = t.filter(t => t.attended), this.$data.participation = t.filter(t => t.participated)
                        }
                    },
                    created() {
                        this.updateAttendees()
                    },
                    watch: {
                        entityMembers() {
                            this.updateAttendees()
                        },
                        attendance() {
                            this.$root.$emit("attendance", this.attendance)
                        },
                        participation() {
                            this.$root.$emit("participation", this.participation)
                        }
                    }
                }),
                A = n(9),
                component = Object(A.a)(y, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "ViewActivity__attendee-list"
                    }, [e(d.a, {
                        attrs: {
                            headers: t.headers,
                            items: t.attendees,
                            "item-key": "id",
                            loading: !1
                        },
                        scopedSlots: t._u([{
                            key: "item.full_name",
                            fn: function(e) {
                                let {
                                    item: n
                                } = e;
                                return [t._v(t._s(n.first_name) + " " + t._s(n.last_name))]
                            }
                        }, {
                            key: "header.name",
                            fn: function(n) {
                                let {} = n;
                                return [e("span", [t._v("Name")])]
                            }
                        }, {
                            key: "header.attendance",
                            fn: function(n) {
                                let {} = n;
                                return [e("div", {
                                    staticClass: "d-flex align-center"
                                }, [e(o.a, {
                                    staticClass: "ma-0 pa-0",
                                    attrs: {
                                        disabled: t.disabled
                                    },
                                    on: {
                                        change: t.changeAllAttendance
                                    }
                                }), t._v(" "), e("div", [t._v("Attendance")])], 1)]
                            }
                        }, {
                            key: "header.participation",
                            fn: function(n) {
                                let {} = n;
                                return [e("div", {
                                    staticClass: "d-flex align-center"
                                }, [e(o.a, {
                                    staticClass: "ma-0 pa-0",
                                    attrs: {
                                        disabled: t.disabled
                                    },
                                    on: {
                                        change: t.changeAllParticipants
                                    }
                                }), t._v(" "), e("div", [t._v("Participation")]), t._v(" "), e("Icon", {
                                    staticClass: "ml-2",
                                    attrs: {
                                        clickable: "",
                                        name: "info"
                                    },
                                    on: {
                                        keydown: function(e) {
                                            t.participationModal = !0
                                        }
                                    },
                                    nativeOn: {
                                        click: function(e) {
                                            e.stopPropagation(), t.participationModal = !0
                                        }
                                    }
                                })], 1)]
                            }
                        }, {
                            key: "item.attendance",
                            fn: function(n) {
                                let {
                                    item: l
                                } = n;
                                return [e(o.a, {
                                    staticClass: "AttendanceCheckbox",
                                    attrs: {
                                        value: l,
                                        disabled: t.disabled
                                    },
                                    on: {
                                        click: function(e) {
                                            return e.preventDefault(), t.selectAttendee(l)
                                        }
                                    },
                                    model: {
                                        value: t.attendance,
                                        callback: function(e) {
                                            t.attendance = e
                                        },
                                        expression: "attendance"
                                    }
                                })]
                            }
                        }, {
                            key: "item.participation",
                            fn: function(n) {
                                let {
                                    item: l
                                } = n;
                                return [e(o.a, {
                                    staticClass: "AttendanceCheckbox",
                                    attrs: {
                                        value: l,
                                        disabled: t.disabled
                                    },
                                    on: {
                                        click: function(e) {
                                            return e.preventDefault(), t.selectParticipant(l)
                                        }
                                    },
                                    model: {
                                        value: t.participation,
                                        callback: function(e) {
                                            t.participation = e
                                        },
                                        expression: "participation"
                                    }
                                })]
                            }
                        }])
                    }), t._v(" "), e(h.a, {
                        model: {
                            value: t.participationModal,
                            callback: function(e) {
                                t.participationModal = e
                            },
                            expression: "participationModal"
                        }
                    }, [e(r.a, [e(c.d, {
                        staticClass: "pb-0 mt-0 mb-4"
                    }, [t._v("Participation")]), t._v(" "), e(c.c, [e("p", [t._v("\n          By checking this, attendees will be awarded the Milestone credits and any Achievement Pathway associated to\n          this event.\n        ")])]), t._v(" "), e(c.a, [e(m.a), t._v(" "), e(l.a, {
                        attrs: {
                            small: "",
                            text: ""
                        },
                        on: {
                            click: function(e) {
                                t.participationModal = !1
                            }
                        }
                    }, [t._v("Close")])], 1)], 1)], 1)], 1)
                }), [], !1, null, "a6f9506a", null);
            e.default = component.exports;
            installComponents(component, {
                Icon: n(55).default
            })
        },
        943: function(t, e, n) {
            "use strict";
            var l = n(60),
                r = n(1);
            e.a = r.a.extend({
                name: "rippleable",
                directives: {
                    ripple: l.a
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
            var l = n(68),
                r = n(943),
                c = n(147),
                o = n(7);

            function d(t) {
                t.preventDefault()
            }
            e.a = Object(o.a)(l.a, r.a, c.a).extend({
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
                        const label = l.a.options.methods.genLabel.call(this);
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
            var l = n(67),
                r = n(68),
                c = n(945);
            e.a = c.a.extend({
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
                        }, [this.$createElement(l.a, this.setTextColor(this.validationState, {
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