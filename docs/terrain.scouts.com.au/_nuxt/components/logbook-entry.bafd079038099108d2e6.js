(window.webpackJsonp = window.webpackJsonp || []).push([
    [10, 73], {
        1006: function(t, e, o) {
            "use strict";
            var l;
            o.d(e, "a", (function() {
                    return l
                })),
                function(t) {
                    t.CAMPING_CATEGORY = "camping", t.WALKING_HIKE_CATEGORY = "walking_hike"
                }(l || (l = {}))
        },
        1027: function(t, e, o) {
            t.exports = {}
        },
        1028: function(t, e, o) {
            t.exports = {}
        },
        1132: function(t, e, o) {
            "use strict";
            o(944), o(1027);
            var l = o(68),
                r = o(146),
                n = o(7);
            const c = Object(n.a)(r.a, l.a);
            e.a = c.extend({
                name: "v-radio-group",
                provide() {
                    return {
                        radioGroup: this
                    }
                },
                props: {
                    column: {
                        type: Boolean,
                        default: !0
                    },
                    height: {
                        type: [Number, String],
                        default: "auto"
                    },
                    name: String,
                    row: Boolean,
                    value: null
                },
                computed: {
                    classes() {
                        return { ...l.a.options.computed.classes.call(this),
                            "v-input--selection-controls v-input--radio-group": !0,
                            "v-input--radio-group--column": this.column && !this.row,
                            "v-input--radio-group--row": this.row
                        }
                    }
                },
                methods: {
                    genDefaultSlot() {
                        return this.$createElement("div", {
                            staticClass: "v-input--radio-group__input",
                            attrs: {
                                id: this.id,
                                role: "radiogroup",
                                "aria-labelledby": this.computedId
                            }
                        }, l.a.options.methods.genDefaultSlot.call(this))
                    },
                    genInputSlot() {
                        const t = l.a.options.methods.genInputSlot.call(this);
                        return delete t.data.on.click, t
                    },
                    genLabel() {
                        const label = l.a.options.methods.genLabel.call(this);
                        return label ? (label.data.attrs.id = this.computedId, delete label.data.attrs.for, label.tag = "legend", label) : null
                    },
                    onClick: r.a.options.methods.onClick
                },
                render(t) {
                    const e = l.a.options.render.call(this, t);
                    return this._b(e.data, "div", this.attrs$), e
                }
            })
        },
        1133: function(t, e, o) {
            "use strict";
            o(1028);
            var l = o(150),
                r = o(67),
                n = o(68),
                c = o(72),
                d = o(18),
                h = o(105),
                v = o(943),
                m = o(13),
                k = o(945),
                _ = o(2),
                y = o(7),
                f = o(36);
            const R = Object(y.a)(c.a, d.a, v.a, Object(h.a)("radioGroup"), m.a);
            e.a = R.extend().extend({
                name: "v-radio",
                inheritAttrs: !1,
                props: {
                    disabled: {
                        type: Boolean,
                        default: null
                    },
                    id: String,
                    label: String,
                    name: String,
                    offIcon: {
                        type: String,
                        default: "$radioOff"
                    },
                    onIcon: {
                        type: String,
                        default: "$radioOn"
                    },
                    readonly: {
                        type: Boolean,
                        default: null
                    },
                    value: {
                        default: null
                    }
                },
                data: () => ({
                    isFocused: !1
                }),
                computed: {
                    classes() {
                        return {
                            "v-radio--is-disabled": this.isDisabled,
                            "v-radio--is-focused": this.isFocused,
                            ...this.themeClasses,
                            ...this.groupClasses
                        }
                    },
                    computedColor() {
                        if (!this.isDisabled) return k.a.options.computed.computedColor.call(this)
                    },
                    computedIcon() {
                        return this.isActive ? this.onIcon : this.offIcon
                    },
                    computedId() {
                        return n.a.options.computed.computedId.call(this)
                    },
                    hasLabel: n.a.options.computed.hasLabel,
                    hasState() {
                        return (this.radioGroup || {}).hasState
                    },
                    isDisabled() {
                        var t;
                        return null !== (t = this.disabled) && void 0 !== t ? t : !!this.radioGroup && this.radioGroup.isDisabled
                    },
                    isReadonly() {
                        var t;
                        return null !== (t = this.readonly) && void 0 !== t ? t : !!this.radioGroup && this.radioGroup.isReadonly
                    },
                    computedName() {
                        return this.name || !this.radioGroup ? this.name : this.radioGroup.name || "radio-" + this.radioGroup._uid
                    },
                    rippleState() {
                        return k.a.options.computed.rippleState.call(this)
                    },
                    validationState() {
                        return (this.radioGroup || {}).validationState || this.computedColor
                    }
                },
                methods: {
                    genInput(t) {
                        return k.a.options.methods.genInput.call(this, "radio", t)
                    },
                    genLabel() {
                        return this.hasLabel ? this.$createElement(l.a, {
                            on: {
                                click: k.b
                            },
                            attrs: {
                                for: this.computedId
                            },
                            props: {
                                color: this.validationState,
                                focused: this.hasState
                            }
                        }, Object(_.r)(this, "label") || this.label) : null
                    },
                    genRadio() {
                        const {
                            title: title,
                            ...t
                        } = this.attrs$;
                        return this.$createElement("div", {
                            staticClass: "v-input--selection-controls__input"
                        }, [this.$createElement(r.a, this.setTextColor(this.validationState, {
                            props: {
                                dense: this.radioGroup && this.radioGroup.dense
                            }
                        }), this.computedIcon), this.genInput({
                            name: this.computedName,
                            value: this.value,
                            ...t
                        }), this.genRipple(this.setTextColor(this.rippleState))])
                    },
                    onFocus(t) {
                        this.isFocused = !0, this.$emit("focus", t)
                    },
                    onBlur(t) {
                        this.isFocused = !1, this.$emit("blur", t)
                    },
                    onChange() {
                        this.isDisabled || this.isReadonly || this.isActive || this.toggle()
                    },
                    onKeydown: () => {}
                },
                render(t) {
                    return t("div", {
                        staticClass: "v-radio",
                        class: this.classes,
                        on: Object(f.c)({
                            click: this.onChange
                        }, this.listeners$),
                        attrs: {
                            title: this.attrs$.title
                        }
                    }, [this.genRadio(), this.genLabel()])
                }
            })
        },
        1297: function(t, e, o) {
            t.exports = {}
        },
        1345: function(t, e, o) {
            "use strict";
            o.r(e);
            var l = o(870),
                r = o(886),
                n = o(897),
                c = o(1133),
                d = o(1132),
                h = o(885),
                v = o(869),
                m = o(62),
                k = o(891),
                _ = o(11),
                y = o.n(_),
                f = o(5),
                R = o(28),
                w = o(4),
                A = o(3),
                C = o(27),
                D = o(1006),
                E = {
                    name: "LogbookEntry",
                    components: {
                        InfoCard: o(144).default
                    },
                    mixins: [C.a],
                    props: {
                        model: {
                            type: Object,
                            default: () => ({
                                achievement_meta: {},
                                details: {
                                    verifier: {}
                                },
                                categories: []
                            })
                        }
                    },
                    data: () => ({
                        LogbookAward: D.a,
                        achievement_meta: "",
                        valid: !0,
                        initialStartDate: "",
                        initialEndDate: "",
                        campingAwardModel: "no",
                        walkaboutAwardModel: "no",
                        saving: !1,
                        distanceTravelled: "",
                        distanceWalkabout: "",
                        streams: [],
                        showWalkaboutDialog: !1,
                        LABEL: f.i
                    }),
                    computed: {
                        validateTravelledDistance() {
                            return this.distanceTravelled < 999999999
                        },
                        validateWalkaboutDistance() {
                            return this.distanceWalkabout <= this.distanceTravelled || 0 === this.distanceWalkabout
                        },
                        validateLeader() {
                            return !!this.logbookRecord.details.event_id || !!this.logbookRecord.details.who_lead
                        },
                        datePickerEnabled() {
                            return this.activityAreaIsOas || this.activityAreaIsOther
                        },
                        activityAreas: () => Object.values(f.o).map(t => ({
                            text: Object(R.h)(t),
                            value: t
                        })),
                        activityAreaIsOther() {
                            var t;
                            return (null === (t = this.achievement_meta) || void 0 === t ? void 0 : t.stream) === f.o.OTHER
                        },
                        activityAreaIsOas() {
                            var t, e;
                            return !!(null === (t = this.achievement_meta) || void 0 === t ? void 0 : t.stream) && (null === (e = this.achievement_meta) || void 0 === e ? void 0 : e.stream) !== f.o.OTHER
                        },
                        logbookRecord() {
                            return this.model
                        }
                    },
                    watch: {
                        walkaboutAwardModel(t) {
                            "no" === t && (this.distanceWalkabout = 0)
                        }
                    },
                    created() {
                        this.achievement_meta = this.logbookRecord.achievement_meta || {
                            stream: f.o.OTHER
                        }, this.logbookRecord.details.verifier || this.$set(this.logbookRecord.details, "verifier", {
                            name: "",
                            contact: ""
                        }), this.logbookRecord.id && (this.logbookRecord.categories.includes(D.a.CAMPING_CATEGORY) && (this.campingAwardModel = D.a.CAMPING_CATEGORY), this.logbookRecord.categories.includes(D.a.WALKING_HIKE_CATEGORY) && (this.walkaboutAwardModel = D.a.WALKING_HIKE_CATEGORY), this.distanceTravelled = this.logbookRecord.distance_travelled / 1e3, this.distanceWalkabout = this.logbookRecord.distance_walkabout / 1e3, this.initialStartDate = this.logbookRecord.start_date, this.initialEndDate = this.logbookRecord.end_date, this.getStreams())
                    },
                    methods: {
                        async getStreams() {
                            if (this.achievement_meta.stream !== f.o.OTHER) {
                                const t = [];
                                await y.a.get(`${this.$config.api.templates}${w.OAS_PATH}/${this.achievement_meta.stream}/${w.TREE_FILENAME}`).then(e => {
                                    this.getBranchStream(e.data.tree, t), this.streams = t
                                }).catch(t => {
                                    console.error("Failed to retrieve stream tree. Error:", t)
                                })
                            }
                        },
                        logbookDuration() {
                            if (this.logbookRecord.start_date === this.logbookRecord.end_date) return "This is a single-day event.";
                            const t = new Date("" + this.logbookRecord.start_date),
                                e = (new Date("" + this.logbookRecord.end_date).getTime() - t.getTime()) / 864e5;
                            return `This event lasts ${e+1} days, ${e} nights.`
                        },
                        validate() {
                            return this.$refs.form.validate() && this.logbookRecord.start_date && this.logbookRecord.end_date
                        },
                        getBranchStream(t, e) {
                            e.includes(t.title) || e.push({
                                title: t.title,
                                id: t.branch_id
                            });
                            for (const o of t.children) this.getBranchStream(o, e)
                        },
                        startDateChangeLogbook(t) {
                            this.logbookRecord.start_date = t, this.minEndDate = new Date(t).toISOString().substr(0, 10)
                        },
                        endDateChangeLogbook(t) {
                            this.logbookRecord.end_date = t, this.maxStartDate = t ? new Date(t).toISOString().substr(0, 10) : ""
                        },
                        cancel() {
                            this.$router.push({
                                path: A.LOGBOOK
                            })
                        },
                        save() {
                            if (this.validate()) {
                                if (this.logbookRecord.distance_travelled = 1e3 * this.distanceTravelled, this.logbookRecord.distance_walkabout = 1e3 * this.distanceWalkabout, this.campingAwardModel === D.a.CAMPING_CATEGORY) this.logbookRecord.categories.includes(D.a.CAMPING_CATEGORY) || this.logbookRecord.categories.push(D.a.CAMPING_CATEGORY);
                                else {
                                    const t = this.logbookRecord.categories.indexOf(D.a.CAMPING_CATEGORY);
                                    t > -1 && this.logbookRecord.categories.splice(t, 1)
                                }
                                if (this.walkaboutAwardModel === D.a.WALKING_HIKE_CATEGORY) this.logbookRecord.categories.includes(D.a.WALKING_HIKE_CATEGORY) || this.logbookRecord.categories.push(D.a.WALKING_HIKE_CATEGORY);
                                else {
                                    const t = this.logbookRecord.categories.indexOf(D.a.WALKING_HIKE_CATEGORY);
                                    t > -1 && this.logbookRecord.categories.splice(t, 1)
                                }
                                this.logbookRecord.details.activity_grade && 0 === this.logbookRecord.details.activity_grade.length && delete this.logbookRecord.details.activity_grade, this.logbookRecord.details.activity_count && 0 === this.logbookRecord.details.activity_count.length && delete this.logbookRecord.details.activity_count, this.logbookRecord.details.activity_grade || delete this.logbookRecord.details.activity_grade, this.logbookRecord.details.activity_time_length || delete this.logbookRecord.details.activity_time_length, this.logbookRecord.details.who_lead || delete this.logbookRecord.details.who_lead, this.saving = !0, this.logbookRecord.id ? this.updateEntry() : this.saveEntry()
                            }
                        },
                        async saveEntry() {
                            const t = { ...this.model
                            };
                            this.activityAreaIsOas || delete t.achievement_meta, await y.a.post(`${this.$config.api.achievements}${w.MEMBERS_PATH}/${this.$accessor.user.getUserId}${w.LOGBOOK_PATH}`, t).then(t => {
                                this.saving = !1, this.$accessor.snackbar.setSnack({
                                    message: "Record saved to your Logbook.",
                                    icon: "check"
                                }), this.$router.push({
                                    path: A.LOGBOOK
                                })
                            }).catch(t => {
                                this.saving = !1, console.error("Failed to save logbook. Error:", t), this.$accessor.snackbar.setSnack({
                                    message: "Could not save logbook. Please try again",
                                    icon: "nope"
                                })
                            })
                        },
                        async updateEntry() {
                            const t = this.model.id,
                                e = { ...this.model
                                };
                            e.achievement_meta = this.achievement_meta, e.achievement_meta.branch = this.achievement_meta.branch, delete e.id, this.activityAreaIsOas || delete e.achievement_meta, await y.a.put(`${this.$config.api.achievements}${w.MEMBERS_PATH}/${this.$accessor.user.getUserId}${w.LOGBOOK_PATH}/${t}`, e).then(t => {
                                this.saving = !1, this.$accessor.snackbar.setSnack({
                                    message: `'${e.title}' updated.`,
                                    icon: "check"
                                }), this.$router.push({
                                    path: A.LOGBOOK
                                })
                            }).catch(t => {
                                this.saving = !1, console.error("Failed to update logbook record. Error:", t), this.$accessor.snackbar.setSnack({
                                    message: "Could not update logbook record. Please try again",
                                    icon: "nope"
                                })
                            })
                        }
                    }
                },
                S = (o(1398), o(9)),
                component = Object(S.a)(E, (function() {
                    var t = this,
                        e = t._self._c;
                    return e(h.a, [e(r.a, {
                        attrs: {
                            cols: "12",
                            lg: "8"
                        }
                    }, [e(n.a, {
                        ref: "form",
                        staticClass: "LogbookEntry",
                        attrs: {
                            "lazy-validation": !0
                        },
                        model: {
                            value: t.valid,
                            callback: function(e) {
                                t.valid = e
                            },
                            expression: "valid"
                        }
                    }, [e(h.a, [e(r.a, {
                        attrs: {
                            cols: "12",
                            md: "6"
                        }
                    }, [e(v.a, {
                        staticClass: "LogbookEntry__select",
                        attrs: {
                            items: t.activityAreas,
                            label: "Select Activity Area*",
                            rules: [t => !!t || "Activity Area is required"]
                        },
                        on: {
                            change: t.getStreams
                        },
                        model: {
                            value: t.achievement_meta.stream,
                            callback: function(e) {
                                t.$set(t.achievement_meta, "stream", e)
                            },
                            expression: "achievement_meta.stream"
                        }
                    })], 1), t._v(" "), t.activityAreaIsOas ? e(r.a, {
                        attrs: {
                            cols: "12",
                            md: "6"
                        }
                    }, [e(v.a, {
                        staticClass: "LogbookEntry__select",
                        attrs: {
                            disabled: 0 === t.streams.length,
                            items: t.streams,
                            name: "streams",
                            "item-text": "title",
                            "item-value": "id",
                            label: "Select Stream*",
                            rules: [t => !!t || "Activity stream is required"]
                        },
                        model: {
                            value: t.achievement_meta.branch,
                            callback: function(e) {
                                t.$set(t.achievement_meta, "branch", e)
                            },
                            expression: "achievement_meta.branch"
                        }
                    })], 1) : t._e()], 1), t._v(" "), e(h.a, {
                        staticClass: "mt-8 mb-4"
                    }, [e(r.a, {
                        attrs: {
                            cols: "12",
                            sm: "6"
                        }
                    }, [e("DatePicker", {
                        attrs: {
                            disabled: !t.datePickerEnabled,
                            label: "Start date*",
                            "data-cy": "start_date",
                            "initial-date": t.initialStartDate,
                            "date-range": t.maxStartDate,
                            "date-range-max": ""
                        },
                        on: {
                            dateChange: function(e) {
                                return t.startDateChangeLogbook(e)
                            }
                        }
                    })], 1), t._v(" "), e(r.a, {
                        attrs: {
                            cols: "12",
                            sm: "6"
                        }
                    }, [e("DatePicker", {
                        attrs: {
                            disabled: !t.datePickerEnabled,
                            label: "End date*",
                            "data-cy": "end_date",
                            "initial-date": t.initialEndDate,
                            "date-range": t.minEndDate,
                            "date-range-min": ""
                        },
                        on: {
                            dateChange: function(e) {
                                return t.endDateChangeLogbook(e)
                            }
                        }
                    })], 1)], 1), t._v(" "), e(h.a, [t.logbookRecord.start_date && t.logbookRecord.end_date ? e("InfoCard", {
                        staticClass: "mb-12",
                        attrs: {
                            "info-type": "info",
                            title: t.logbookDuration()
                        }
                    }) : t._e()], 1), t._v(" "), e(h.a, {
                        staticClass: "mb-4",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(k.a, {
                        attrs: {
                            label: "Activity name*",
                            "data-cy": "activity_name",
                            "persistent-hint": "",
                            hint: "For example: Climb, Bushwalk, Kayak trail etc",
                            rules: [t => !!t || "Activity name is required"],
                            counter: "",
                            maxlength: "100",
                            "auto-grow": "",
                            "row-height": 6
                        },
                        model: {
                            value: t.logbookRecord.title,
                            callback: function(e) {
                                t.$set(t.logbookRecord, "title", e)
                            },
                            expression: "logbookRecord.title"
                        }
                    })], 1), t._v(" "), e(h.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(r.a, [e("div", {
                        staticClass: "subtitle-1"
                    }, [t._v("Does this activity contribute to the Camper Award?*")])])], 1), t._v(" "), e(h.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(d.a, {
                        attrs: {
                            row: "",
                            rules: [t => !!t || "Selection is required."]
                        },
                        model: {
                            value: t.campingAwardModel,
                            callback: function(e) {
                                t.campingAwardModel = e
                            },
                            expression: "campingAwardModel"
                        }
                    }, [e(c.a, {
                        staticClass: "ActivityReview__radio",
                        attrs: {
                            label: "Yes",
                            value: t.LogbookAward.CAMPING_CATEGORY,
                            "data-cy": "camped_checkbox"
                        }
                    }), t._v(" "), e(c.a, {
                        staticClass: "ActivityReview__radio",
                        attrs: {
                            label: "No",
                            value: "no"
                        }
                    })], 1)], 1), t._v(" "), e(h.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(m.a, {
                        attrs: {
                            label: "Location*",
                            "data-cy": "location",
                            rules: [t => !!t || "Activity location is required"],
                            counter: "",
                            maxlength: "50"
                        },
                        model: {
                            value: t.logbookRecord.details.location,
                            callback: function(e) {
                                t.$set(t.logbookRecord.details, "location", e)
                            },
                            expression: "logbookRecord.details.location"
                        }
                    })], 1), t._v(" "), e(h.a, {
                        staticClass: "mb-4",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(m.a, {
                        attrs: {
                            label: "Grade of activity (if applicable)",
                            "persistent-hint": "",
                            hint: "For example: Climbing - Grade 14, Ski - Black Diamond",
                            counter: "",
                            maxlength: "50"
                        },
                        model: {
                            value: t.logbookRecord.details.activity_grade,
                            callback: function(e) {
                                t.$set(t.logbookRecord.details, "activity_grade", t._n(e))
                            },
                            expression: "logbookRecord.details.activity_grade"
                        }
                    })], 1), t._v(" "), e(h.a, {
                        staticClass: "mb-4",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(m.a, {
                        attrs: {
                            label: "How many of the activity (if applicable)",
                            "persistent-hint": "",
                            hint: "Enter a number here for any smaller activities you did that makes up the main activity. For example: 3 bike trails.",
                            counter: "",
                            maxlength: "50"
                        },
                        model: {
                            value: t.logbookRecord.details.activity_count,
                            callback: function(e) {
                                t.$set(t.logbookRecord.details, "activity_count", t._n(e))
                            },
                            expression: "logbookRecord.details.activity_count"
                        }
                    })], 1), t._v(" "), e(h.a, [e(r.a, [e("div", {
                        staticClass: "body-1-semibold mt-0 mb-6"
                    }, [t._v("\n            Note: Distances will be treated as kilometres, except for Vertical where it will be recorded as metres.\n            The following two fields will be applied pro-rata.\n          ")])])], 1), t._v(" "), e(h.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(r.a, {
                        attrs: {
                            cols: "12"
                        }
                    }, [e(m.a, {
                        attrs: {
                            rules: [t.validateTravelledDistance || "Distance is too high"],
                            label: "Total distance or height travelled",
                            "persistent-hint": "",
                            hint: "Enter numbers only. This is the journey distance for all activities.",
                            counter: "",
                            maxlength: "50",
                            type: "text",
                            oninput: "this.value = this.value.replace(/[^0-9]/g, '').replace(/(\\..*)\\./g, '$1');",
                            "data-cy": "height-distance-traveled"
                        },
                        model: {
                            value: t.distanceTravelled,
                            callback: function(e) {
                                t.distanceTravelled = t._n(e)
                            },
                            expression: "distanceTravelled"
                        }
                    })], 1)], 1), t._v(" "), e(h.a, [e(r.a, [e("div", {
                        staticClass: "subtitle-1"
                    }, [t._v("Does this activity contribute to the Walkabout Award?*")])])], 1), t._v(" "), e(h.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(d.a, {
                        attrs: {
                            row: "",
                            rules: [t => !!t || "Selection is required."]
                        },
                        model: {
                            value: t.walkaboutAwardModel,
                            callback: function(e) {
                                t.walkaboutAwardModel = e
                            },
                            expression: "walkaboutAwardModel"
                        }
                    }, [e(c.a, {
                        staticClass: "ActivityReview__radio",
                        attrs: {
                            label: "Yes",
                            value: t.LogbookAward.WALKING_HIKE_CATEGORY
                        }
                    }), t._v(" "), e(c.a, {
                        staticClass: "ActivityReview__radio",
                        attrs: {
                            label: "No",
                            value: "no"
                        }
                    })], 1)], 1), t._v(" "), e(h.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(r.a, {
                        attrs: {
                            cols: "12"
                        }
                    }, [e(m.a, {
                        staticClass: "mb-0",
                        attrs: {
                            disabled: "no" === t.walkaboutAwardModel,
                            rules: [t.validateWalkaboutDistance || "This must be less than or equal to the distance travelled above."],
                            label: "Distance travelled specific to Walkabout Award?",
                            "persistent-hint": "",
                            counter: "",
                            maxlength: "50",
                            type: "text",
                            oninput: "this.value = this.value.replace(/[^0-9]/g, '').replace(/(\\..*)\\./g, '$1');"
                        },
                        model: {
                            value: t.distanceWalkabout,
                            callback: function(e) {
                                t.distanceWalkabout = t._n(e)
                            },
                            expression: "distanceWalkabout"
                        }
                    }), t._v(" "), e("div", {
                        staticClass: "LogbookEntry__form-hint",
                        on: {
                            click: function(e) {
                                t.showWalkaboutDialog = !0
                            },
                            keydown: function(e) {
                                t.showWalkaboutDialog = !0
                            }
                        }
                    }, [t._v("\n            This must be less than or equal to the distance travelled above.\n            "), e("Icon", {
                        staticClass: "ml-2 my-0 d-inline",
                        attrs: {
                            clickable: "",
                            name: "info"
                        }
                    })], 1)], 1)], 1), t._v(" "), e(h.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(m.a, {
                        attrs: {
                            label: "Who led the activity?*",
                            "data-cy": "who_led",
                            rules: [t.validateLeader || "Activity leader is required"],
                            counter: "",
                            maxlength: "50"
                        },
                        model: {
                            value: t.logbookRecord.details.who_lead,
                            callback: function(e) {
                                t.$set(t.logbookRecord.details, "who_lead", e)
                            },
                            expression: "logbookRecord.details.who_lead"
                        }
                    })], 1), t._v(" "), e(h.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(k.a, {
                        attrs: {
                            label: "Other participants*",
                            "data-cy": "other_participants",
                            rules: [t => !!t || "Activity participants is required"],
                            counter: "",
                            maxlength: "1000",
                            "auto-grow": "",
                            "row-height": 6
                        },
                        model: {
                            value: t.logbookRecord.details.other_participants,
                            callback: function(e) {
                                t.$set(t.logbookRecord.details, "other_participants", e)
                            },
                            expression: "logbookRecord.details.other_participants"
                        }
                    })], 1), t._v(" "), e(h.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(k.a, {
                        attrs: {
                            label: "Your role during activity*",
                            "data-cy": "your_role",
                            rules: [t => !!t || "Activity role is required"],
                            counter: "",
                            maxlength: "100",
                            "auto-grow": "",
                            "row-height": 6
                        },
                        model: {
                            value: t.logbookRecord.details.your_role,
                            callback: function(e) {
                                t.$set(t.logbookRecord.details, "your_role", e)
                            },
                            expression: "logbookRecord.details.your_role"
                        }
                    })], 1), t._v(" "), e(h.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(k.a, {
                        attrs: {
                            label: "Weather during activity*",
                            "data-cy": "weather",
                            rules: [t => !!t || "Activity weather is required"],
                            counter: "",
                            maxlength: "100",
                            "auto-grow": "",
                            "row-height": 6
                        },
                        model: {
                            value: t.logbookRecord.details.weather,
                            callback: function(e) {
                                t.$set(t.logbookRecord.details, "weather", e)
                            },
                            expression: "logbookRecord.details.weather"
                        }
                    })], 1), t._v(" "), e(h.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(k.a, {
                        attrs: {
                            label: "Purpose of activity*",
                            "data-cy": "purpose",
                            "persistent-hint": "",
                            hint: "Additional comments or details about the activity you would like to add",
                            rules: [t => !!t || "Activity purpose is required"],
                            counter: "",
                            maxlength: "1000",
                            "auto-grow": "",
                            "row-height": 6
                        },
                        model: {
                            value: t.logbookRecord.details.purpose,
                            callback: function(e) {
                                t.$set(t.logbookRecord.details, "purpose", e)
                            },
                            expression: "logbookRecord.details.purpose"
                        }
                    })], 1), t._v(" "), e(h.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(m.a, {
                        attrs: {
                            label: "Verifier name*",
                            "data-cy": "verifier_name",
                            "persistent-hint": "",
                            hint: "You can be verified by someone inside the Scouts organisation or someone outside the organisation.",
                            rules: [t => !!t || "Activity verifier name is required"],
                            counter: "",
                            maxlength: "50"
                        },
                        model: {
                            value: t.logbookRecord.details.verifier.name,
                            callback: function(e) {
                                t.$set(t.logbookRecord.details.verifier, "name", e)
                            },
                            expression: "logbookRecord.details.verifier.name"
                        }
                    })], 1), t._v(" "), e(h.a, {
                        staticClass: "mb-8",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(k.a, {
                        attrs: {
                            label: "Verifier contact details*",
                            "data-cy": "verifier_details",
                            "persistent-hint": "",
                            hint: "This can be an email address or a phone number.",
                            rules: [t => !!t || "Activity verifier contact is required"],
                            counter: "",
                            maxlength: "100",
                            "auto-grow": "",
                            "row-height": 6
                        },
                        model: {
                            value: t.logbookRecord.details.verifier.contact,
                            callback: function(e) {
                                t.$set(t.logbookRecord.details.verifier, "contact", e)
                            },
                            expression: "logbookRecord.details.verifier.contact"
                        }
                    })], 1), t._v(" "), e(h.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e("p", {
                        staticClass: "LogbookEntry__required-fields"
                    }, [t._v("*Required fields")])]), t._v(" "), e(h.a, {
                        attrs: {
                            "no-gutters": "",
                            justify: "end"
                        }
                    }, [e(l.a, {
                        staticClass: "mr-4",
                        attrs: {
                            outlined: "",
                            "data-cy": "CANCEL",
                            disabled: t.saving
                        },
                        on: {
                            click: t.cancel
                        }
                    }, [t._v(t._s(t.LABEL.CANCEL))]), t._v(" "), e(l.a, {
                        attrs: {
                            disabled: t.$nuxt.isOffline || !t.valid,
                            "data-cy": "SAVE",
                            loading: t.saving
                        },
                        on: {
                            click: t.save
                        }
                    }, [t._v("\n          " + t._s(t.LABEL.SAVE) + "\n        ")])], 1), t._v(" "), e("ConfirmationDialog", {
                        attrs: {
                            model: t.showWalkaboutDialog,
                            subtitle: "This only applies to activities completed with Scouts. This may be a pro-rata distance if the Scout activity was not bushwalking. This number is separate from and must be less than or equal to the total distance travelled.",
                            "close-button-label": t.LABEL.CLOSE,
                            "close-dialog": () => t.showWalkaboutDialog = !1,
                            "hide-confirm": ""
                        }
                    })], 1)], 1)], 1)
                }), [], !1, null, null, null);
            e.default = component.exports;
            installComponents(component, {
                DatePicker: o(921).default,
                Icon: o(55).default,
                ConfirmationDialog: o(79).default
            })
        },
        1398: function(t, e, o) {
            "use strict";
            o(1297)
        },
        907: function(t, e, o) {
            "use strict";
            o.d(e, "a", (function() {
                return l
            }));
            const l = t => (null == t ? void 0 : t.includes("required")) ? [t => !!t || "This input is required"] : []
        },
        910: function(t, e, o) {
            t.exports = {}
        },
        921: function(t, e, o) {
            "use strict";
            o.r(e);
            var l = o(870),
                r = o(62),
                n = o(948),
                c = o(1432),
                d = o(1197),
                h = o(1036),
                v = o(171),
                m = (o(947), o(87)),
                k = o(907),
                _ = m.a.extend({
                    components: {
                        Vue2DatePicker: n.a
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
                        rulesFromString: k.a,
                        cancel() {
                            this.open = !1
                        },
                        disabledDateRange(t) {
                            let e = 0;
                            return this.dateRangeMin ? e = Object(c.a)(t, Object(d.a)(this.dateRange)) : this.dateRangeMax && (e = Object(h.a)(t, Object(d.a)(this.dateRange))), 1 === e
                        },
                        parseDate: t => t ? Object(v.a)(new Date(t), "yyyy-MM-dd") : null
                    }
                }),
                y = (o(923), o(9)),
                component = Object(y.a)(_, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "DatePicker",
                        class: {
                            disabled: t.disabled
                        }
                    }, [e("Icon", {
                        staticClass: "DatePicker__icon",
                        attrs: {
                            outline: "",
                            name: "calendar"
                        }
                    }), t._v(" "), t.label ? e("div", {
                        staticClass: "DatePicker__label"
                    }, [t._v(t._s(t.label))]) : t._e(), t._v(" "), e("Vue2DatePicker", {
                        staticClass: "DatePicker__date-picker",
                        attrs: {
                            open: t.open,
                            clearable: !1,
                            disabled: t.disabled,
                            placeholder: t.placeholder,
                            format: "DD/MM/YYYY",
                            "disabled-date": t.disabledDateRange
                        },
                        on: {
                            "update:open": function(e) {
                                t.open = e
                            }
                        },
                        scopedSlots: t._u([{
                            key: "footer",
                            fn: function() {
                                return [e(l.a, {
                                    staticClass: "DatePicker__btn-cancel",
                                    attrs: {
                                        small: "",
                                        outlined: "",
                                        type: "button"
                                    },
                                    on: {
                                        keydown: function(e) {
                                            return !e.type.indexOf("key") && t._k(e.keyCode, "enter", 13, e.key, "Enter") ? null : t.cancel.apply(null, arguments)
                                        },
                                        click: t.cancel
                                    }
                                }, [t._v("\n        Cancel\n      ")])]
                            },
                            proxy: !0
                        }]),
                        model: {
                            value: t.date,
                            callback: function(e) {
                                t.date = e
                            },
                            expression: "date"
                        }
                    }), t._v(" "), t.rules ? [e(r.a, {
                        staticClass: "d-none",
                        attrs: {
                            value: t.isDateSelected,
                            rules: t.rulesFromString(t.rules)
                        }
                    })] : t._e()], 2)
                }), [], !1, null, null, null);
            e.default = component.exports;
            installComponents(component, {
                Icon: o(55).default
            })
        },
        923: function(t, e, o) {
            "use strict";
            o(910)
        },
        943: function(t, e, o) {
            "use strict";
            var l = o(60),
                r = o(1);
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
        944: function(t, e, o) {
            t.exports = {}
        },
        945: function(t, e, o) {
            "use strict";
            o.d(e, "b", (function() {
                return d
            }));
            var l = o(68),
                r = o(943),
                n = o(147),
                c = o(7);

            function d(t) {
                t.preventDefault()
            }
            e.a = Object(c.a)(l.a, r.a, n.a).extend({
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
        }
    }
]);