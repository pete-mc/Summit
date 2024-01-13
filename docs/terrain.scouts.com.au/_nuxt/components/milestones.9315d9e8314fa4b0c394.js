(window.webpackJsonp = window.webpackJsonp || []).push([
    [24, 56, 63, 64, 82, 113, 115, 117, 118, 119, 128], {
        1011: function(e, t, n) {
            e.exports = {}
        },
        1012: function(e, t, n) {
            e.exports = {}
        },
        1041: function(e, t, n) {
            "use strict";
            n.r(t);
            var l = n(870),
                o = n(236),
                r = n(35),
                c = n(890),
                d = n(892),
                v = n(891),
                _ = n(1),
                m = n(5),
                f = _.a.extend({
                    name: "MilestonesMiniReviewDialog",
                    props: {
                        canEdit: {
                            type: Boolean,
                            required: !0
                        },
                        model: {
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
                        confirmButtonLabel: {
                            type: String,
                            default: m.i.CONFIRM
                        },
                        closeButtonLabel: {
                            type: String,
                            default: m.i.CANCEL
                        },
                        confirmCallback: {
                            type: Function,
                            default: () => {}
                        },
                        closeDialog: {
                            type: Function,
                            required: !0
                        },
                        hideConfirm: {
                            type: Boolean
                        },
                        question: {
                            type: String,
                            default: ""
                        },
                        answer: {
                            type: String,
                            required: !0,
                            default: ""
                        }
                    },
                    data() {
                        return {
                            LABEL: m.i,
                            answerModel: this.answer
                        }
                    },
                    computed: {
                        isValidated() {
                            return !!this.answerModel
                        },
                        showDialog() {
                            return this.model
                        }
                    },
                    watch: {
                        answer(e) {
                            this.answerModel = e
                        }
                    },
                    mounted() {},
                    methods: {
                        confirm() {
                            this.closeDialog(), this.$props.confirmCallback(this.answerModel)
                        }
                    }
                }),
                h = (n(1072), n(9)),
                component = Object(h.a)(f, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t(c.a, {
                        staticClass: "MilestonesMiniReviewDialog",
                        attrs: {
                            "max-width": "600px"
                        },
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
                        staticClass: "MilestonesMiniReviewDialog__card"
                    }, [e.title ? t(r.d, {
                        staticClass: "pb-0 mt-0"
                    }, [t("div", [e._v(e._s(e.title))])]) : e._e(), e._v(" "), e.subtitle ? t(r.b, {
                        staticClass: "pa-0"
                    }, [t("span", [e._v("\n        " + e._s(e.subtitle) + "\n      ")])]) : e._e(), e._v(" "), t(r.c, [t(v.a, {
                        staticClass: "mt-10",
                        attrs: {
                            disabled: !e.canEdit,
                            counter: "",
                            maxlength: "300",
                            "auto-grow": "",
                            "row-height": 6,
                            label: e.question
                        },
                        model: {
                            value: e.answerModel,
                            callback: function(t) {
                                e.answerModel = t
                            },
                            expression: "answerModel"
                        }
                    })], 1), e._v(" "), t(r.a, {
                        staticClass: "pa-0 mt-0"
                    }, [t(d.a), e._v(" "), t(l.a, {
                        attrs: {
                            text: ""
                        },
                        on: {
                            click: e.closeDialog
                        }
                    }, [e._v(e._s(e.closeButtonLabel))]), e._v(" "), e.hideConfirm ? e._e() : t(l.a, {
                        staticClass: "MilestonesMiniReviewDialog__saveBtn mr-4",
                        attrs: {
                            disabled: !e.isValidated,
                            text: ""
                        },
                        on: {
                            click: e.confirm
                        }
                    }, [e._v("\n        " + e._s(e.confirmButtonLabel) + "\n      ")])], 1)], 1)], 1)
                }), [], !1, null, "d39c4e0a", null);
            t.default = component.exports
        },
        1053: function(e, t, n) {
            e.exports = {}
        },
        1059: function(e, t, n) {
            "use strict";
            n.r(t);
            var l = n(870),
                o = n(267),
                r = n(40),
                c = n(5),
                d = n(55),
                v = n(1041),
                _ = r.p.extend({
                    name: "MilestonesMiniReview",
                    components: {
                        Icon: d.default,
                        MilestonesMiniReviewDialog: v.default
                    },
                    props: {
                        type: {
                            type: String,
                            required: !0
                        },
                        title: {
                            type: String,
                            required: !0
                        },
                        challengeArea: {
                            type: String,
                            required: !0
                        },
                        reviewData: {
                            type: Object,
                            default: () => {}
                        },
                        canEdit: {
                            type: Boolean,
                            required: !0
                        },
                        answerKey: {
                            type: String,
                            required: !0
                        },
                        isDisabled: {
                            type: Boolean,
                            required: !0
                        },
                        hasReview: {
                            type: Boolean,
                            required: !0
                        }
                    },
                    data: () => ({
                        LABEL: c.i,
                        CHALLENGE_AREAS_NAME_MAP: c.f,
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
                        }
                    }),
                    computed: {
                        iconData() {
                            return !this.hasReview && this.canEdit ? {
                                iconName: "review",
                                iconLabel: c.i.REVIEW
                            } : this.canEdit ? {
                                iconName: "edit",
                                iconLabel: c.i.EDIT
                            } : {
                                iconName: "view",
                                iconLabel: c.i.VIEW
                            }
                        },
                        iconCheckmark() {
                            return this.hasReview ? "check-green" : "check-grey"
                        },
                        miniReviewAnswer() {
                            return this.$accessor.milestones.getAnswers[this.answerKey]
                        }
                    },
                    methods: {
                        async saveReview(e) {
                            const t = this.$accessor.milestones.getAnswers;
                            this.$accessor.milestones.setAnswers({ ...t,
                                [this.answerKey]: e
                            }), await this.saveMiniReview(this.type)
                        },
                        showDialog() {
                            this.showReviewDialog = !0
                        }
                    }
                }),
                m = (n(1126), n(9)),
                component = Object(m.a)(_, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", {
                        staticClass: "MilestonesMiniReview",
                        class: {
                            "MilestonesMiniReview--disabled": e.isDisabled
                        }
                    }, [t("div", {
                        staticClass: "MilestonesMiniReview__title-container"
                    }, [t("Icon", {
                        staticClass: "MilestonesMiniReview__title-status",
                        attrs: {
                            name: e.iconCheckmark,
                            disabled: e.isDisabled,
                            outline: ""
                        }
                    }), e._v(" "), t("div", {
                        staticClass: "MilestonesMiniReview__title"
                    }, [e._v(e._s(e.title ? e.title : "No activity recorded"))])], 1), e._v(" "), t("div", {
                        staticClass: "MilestonesMiniReview__action-container",
                        class: {
                            "justify-end": !e.hasReview
                        }
                    }, [e.hasReview ? t(o.a, {
                        staticClass: "MilestonesMiniReview__status-chip",
                        attrs: {
                            label: ""
                        }
                    }, [e._v("Draft")]) : e._e(), e._v(" "), t("div", {
                        staticClass: "MilestonesMiniReview__challenge-area"
                    }, [t("img", {
                        staticClass: "MilestonesMiniReview__icon",
                        attrs: {
                            src: e.challengeAreaIcons[e.challengeArea],
                            alt: e.CHALLENGE_AREAS_NAME_MAP.get(e.challengeArea)
                        }
                    }), e._v(" "), t("span", {
                        staticClass: "MilestonesMiniReview__challenge-area-label"
                    }, [e._v("\n        " + e._s(e.CHALLENGE_AREAS_NAME_MAP.get(e.challengeArea)) + " Challenge\n      ")])]), e._v(" "), t(l.a, {
                        staticClass: "MilestonesMiniReview__action-button",
                        attrs: {
                            disabled: e.isDisabled,
                            small: "",
                            text: ""
                        }
                    }, [t("Icon", {
                        staticClass: "mr-0 pr-0",
                        attrs: {
                            name: e.iconData.iconName,
                            label: e.iconData.iconLabel,
                            disabled: e.isDisabled,
                            size: "small",
                            outline: ""
                        },
                        nativeOn: {
                            click: function(t) {
                                e.isDisabled || e.showDialog()
                            },
                            keydown: function(t) {
                                e.isDisabled || e.showDialog()
                            }
                        }
                    })], 1)], 1), e._v(" "), e.showReviewDialog ? t("MilestonesMiniReviewDialog", {
                        attrs: {
                            model: e.showReviewDialog,
                            title: e.reviewType[e.type].title,
                            subtitle: "",
                            question: e.reviewType[e.type].question,
                            answer: e.miniReviewAnswer,
                            "confirm-button-label": e.LABEL.SAVE,
                            "close-button-label": e.canEdit ? e.LABEL.CANCEL : e.LABEL.CLOSE,
                            "hide-confirm": !e.canEdit,
                            "confirm-callback": e.saveReview,
                            "can-edit": e.canEdit,
                            "close-dialog": () => e.showReviewDialog = !1
                        }
                    }) : e._e()], 1)
                }), [], !1, null, "13f5aa37", null);
            t.default = component.exports;
            installComponents(component, {
                Icon: n(55).default,
                MilestonesMiniReviewDialog: n(1041).default
            })
        },
        1071: function(e, t, n) {
            "use strict";
            n(1011)
        },
        1072: function(e, t, n) {
            "use strict";
            n(1012)
        },
        1126: function(e, t, n) {
            "use strict";
            n(1053)
        },
        1169: function(e, t, n) {
            e.exports = {}
        },
        1170: function(e, t, n) {
            e.exports = {}
        },
        1222: function(e, t, n) {
            "use strict";
            n(1169)
        },
        1223: function(e, t, n) {
            "use strict";
            n(1170)
        },
        1254: function(e, t, n) {
            "use strict";
            n.r(t);
            var l = n(237),
                o = n(999),
                r = n(55),
                c = n(1059),
                d = n(5),
                v = n(40).p.extend({
                    name: "MilestonesAssist",
                    components: {
                        Card: o.default,
                        Icon: r.default,
                        MilestonesMiniReview: c.default
                    },
                    props: {
                        assists: {
                            type: Object,
                            required: !0
                        },
                        maxTotal: {
                            type: Number,
                            required: !0
                        },
                        answers: {
                            type: Object,
                            required: !0
                        },
                        canEdit: {
                            type: Boolean,
                            required: !0
                        }
                    },
                    data: () => ({
                        LABEL: d.i
                    }),
                    computed: {
                        eventAssists() {
                            return this.$accessor.milestones.getCurrentMilestoneEvents.filter(e => "assistant" === e.credit_type)
                        },
                        total() {
                            return `${this.aggregate} / ${this.$props.maxTotal}`
                        },
                        totalPercent() {
                            return this.aggregate / this.maxTotal * 100
                        },
                        aggregate() {
                            return this.assists.community + this.assists.creative + this.assists.outdoors + this.assists.personal_growth || 0
                        }
                    },
                    methods: {
                        hasAnswer(e, t) {
                            return !!this.answers[`${t}_review_${e}`]
                        }
                    }
                }),
                _ = n(9),
                component = Object(_.a)(v, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("Card", {
                        class: e.$options.name
                    }, [t("div", {
                        staticClass: "MilestonesCard__container"
                    }, [t("div", {
                        staticClass: "d-flex align-center"
                    }, [t("h2", {
                        staticClass: "MilestonesCard__title"
                    }, [e._v("Assist")]), e._v(" "), t("Icon", {
                        staticClass: "align-left ml-2",
                        attrs: {
                            name: "info",
                            clickable: ""
                        },
                        nativeOn: {
                            click: function(t) {
                                return t.stopPropagation(), e.$accessor.milestones.showInfoDialog(e.LABEL.ASSIST)
                            },
                            keydown: function(t) {
                                return t.stopPropagation(), e.$accessor.milestones.showInfoDialog(e.LABEL.ASSIST)
                            }
                        }
                    })], 1), e._v(" "), e.$vuetify.breakpoint.xs ? t("div", {
                        staticClass: "MilestonesCard__subtitle"
                    }, [e._v("\n      Assist in " + e._s(e.maxTotal) + " activities or more across 2 Challenge Areas.\n    ")]) : e._e(), e._v(" "), t("div", {
                        staticClass: "MilestonesCard__progress-container"
                    }, [t(l.a, {
                        staticClass: "MilestonesCard__progress-meter",
                        attrs: {
                            height: 8,
                            query: !0,
                            rounded: !0,
                            value: e.totalPercent
                        }
                    }), e._v(" "), t("div", {
                        staticClass: "MilestonesCard__total"
                    }, [e._v(e._s(e.total))])], 1)]), e._v(" "), e.$vuetify.breakpoint.smAndUp ? t("div", {
                        staticClass: "MilestonesCard__subtitle MilestonesCard__subtitle--divider"
                    }, [e._v("\n    Assist in " + e._s(e.maxTotal) + " activities or more across 2 Challenge Areas.\n  ")]) : e._e(), e._v(" "), e.eventAssists.length ? t("div", {
                        staticClass: "MilestonesCard__mini-review-container"
                    }, e._l(e.eventAssists, (function(n, l) {
                        return t("MilestonesMiniReview", {
                            key: l,
                            attrs: {
                                title: n.event_name,
                                "challenge-area": n.challenge_area,
                                "is-disabled": !e.miniReviewEnabled,
                                "can-edit": e.canEdit,
                                "has-review": e.hasAnswer(n.event_id, "assist"),
                                type: "assist",
                                "answer-key": "assist_review_" + n.event_id
                            }
                        })
                    })), 1) : e._e()])
                }), [], !1, null, "ec2189cc", null);
            t.default = component.exports;
            installComponents(component, {
                Icon: n(55).default,
                MilestonesMiniReview: n(1059).default,
                Card: n(999).default
            })
        },
        1255: function(e, t, n) {
            "use strict";
            n.r(t);
            var l = n(237),
                o = n(999),
                r = n(55),
                c = n(1059),
                d = n(5),
                v = n(40).p.extend({
                    name: "MilestonesLead",
                    components: {
                        Card: o.default,
                        Icon: r.default,
                        MilestonesMiniReview: c.default
                    },
                    props: {
                        leads: {
                            type: Object,
                            required: !0
                        },
                        maxTotal: {
                            type: Number,
                            required: !0
                        },
                        answers: {
                            type: Object,
                            required: !0
                        },
                        canEdit: {
                            type: Boolean,
                            required: !0
                        }
                    },
                    data: () => ({
                        LABEL: d.i
                    }),
                    computed: {
                        eventLeads() {
                            return this.$accessor.milestones.getCurrentMilestoneEvents.filter(e => "leader" === e.credit_type)
                        },
                        total() {
                            return `${this.aggregate} / ${this.maxTotal}`
                        },
                        totalPercent() {
                            return this.aggregate / this.maxTotal * 100
                        },
                        aggregate() {
                            return this.leads.community + this.leads.creative + this.leads.outdoors + this.leads.personal_growth || 0
                        }
                    },
                    methods: {
                        hasAnswer(e, t) {
                            return !!this.answers[`${t}_review_${e}`]
                        }
                    }
                }),
                _ = n(9),
                component = Object(_.a)(v, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("Card", {
                        class: e.$options.name
                    }, [t("div", {
                        staticClass: "MilestonesCard__container"
                    }, [t("div", {
                        staticClass: "d-flex align-center"
                    }, [t("h2", {
                        staticClass: "MilestonesCard__title"
                    }, [e._v("Lead")]), e._v(" "), t("Icon", {
                        staticClass: "align-left ml-2",
                        attrs: {
                            name: "info",
                            clickable: ""
                        },
                        nativeOn: {
                            click: function(t) {
                                return t.stopPropagation(), e.$accessor.milestones.showInfoDialog(e.LABEL.LEAD)
                            },
                            keydown: function(t) {
                                return t.stopPropagation(), e.$accessor.milestones.showInfoDialog(e.LABEL.LEAD)
                            }
                        }
                    })], 1), e._v(" "), e.$vuetify.breakpoint.xs ? t("div", {
                        staticClass: "MilestonesCard__subtitle MilestonesCard__subtitle--divider"
                    }, [e._v("\n      Lead " + e._s(e.maxTotal) + " " + e._s(e.maxTotal > 1 ? "activities" : "activity") + " from any Challenge Area.\n    ")]) : e._e(), e._v(" "), t("div", {
                        staticClass: "MilestonesCard__progress-container"
                    }, [t(l.a, {
                        staticClass: "MilestonesCard__progress-meter",
                        attrs: {
                            height: 8,
                            query: !0,
                            rounded: !0,
                            value: e.totalPercent
                        }
                    }), e._v(" "), t("div", {
                        staticClass: "MilestonesCard__total"
                    }, [e._v(e._s(e.total))])], 1)]), e._v(" "), e.$vuetify.breakpoint.smAndUp ? t("div", {
                        staticClass: "MilestonesCard__subtitle"
                    }, [e._v("\n    Lead " + e._s(e.maxTotal) + " " + e._s(e.maxTotal > 1 ? "activities" : "activity") + " from any Challenge Area.\n  ")]) : e._e(), e._v(" "), e.eventLeads.length ? t("div", {
                        staticClass: "MilestonesCard__mini-review-container"
                    }, e._l(e.eventLeads, (function(n, l) {
                        return t("MilestonesMiniReview", {
                            key: l,
                            attrs: {
                                title: n.event_name,
                                "challenge-area": n.challenge_area,
                                "is-disabled": !e.miniReviewEnabled,
                                "can-edit": e.canEdit,
                                "has-review": e.hasAnswer(n.event_id, "lead"),
                                type: "lead",
                                "answer-key": "lead_review_" + n.event_id
                            }
                        })
                    })), 1) : e._e()])
                }), [], !1, null, "3eb824f0", null);
            t.default = component.exports;
            installComponents(component, {
                Icon: n(55).default,
                MilestonesMiniReview: n(1059).default,
                Card: n(999).default
            })
        },
        1256: function(e, t, n) {
            "use strict";
            n.r(t);
            var l = n(237),
                o = n(1),
                r = n(999),
                c = n(55),
                d = n(5),
                v = n(4),
                _ = o.a.extend({
                    name: "MilestonesParticipate",
                    components: {
                        Card: r.default,
                        Icon: c.default
                    },
                    props: {
                        participates: {
                            type: Object,
                            required: !0
                        },
                        maxTotal: {
                            type: Number,
                            required: !0
                        }
                    },
                    data: () => ({
                        CHALLENGE_AREAS_TYPES: v.CHALLENGE_AREAS_TYPES,
                        LABEL: d.i,
                        palDialogModel: !1
                    }),
                    computed: {
                        total() {
                            return `${this.aggregate} / ${this.maxTotal}`
                        },
                        aggregate() {
                            return this.participates.community + this.participates.creative + this.participates.outdoors + this.participates.personal_growth || 0
                        }
                    },
                    mounted() {},
                    methods: {
                        totalPercent() {
                            return this.aggregate / this.maxTotal * 100
                        }
                    }
                }),
                m = (n(1223), n(9)),
                component = Object(m.a)(_, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("Card", {
                        staticClass: "MilestonesParticipates"
                    }, [t("div", {
                        staticClass: "MilestonesCard__container"
                    }, [t("div", {
                        staticClass: "d-flex align-center"
                    }, [t("h2", {
                        staticClass: "MilestonesCard__title"
                    }, [e._v("Participate")]), e._v(" "), t("Icon", {
                        staticClass: "align-left ml-2",
                        attrs: {
                            name: "info",
                            clickable: ""
                        },
                        nativeOn: {
                            click: function(t) {
                                return t.stopPropagation(), e.$accessor.milestones.showInfoDialog(e.LABEL.PARTICIPATE)
                            },
                            keydown: function(t) {
                                return t.stopPropagation(), e.$accessor.milestones.showInfoDialog(e.LABEL.PARTICIPATE)
                            }
                        }
                    })], 1), e._v(" "), e.$vuetify.breakpoint.xs ? t("div", {
                        staticClass: "MilestonesCard__subtitle"
                    }, [e._v("\n      Participate in " + e._s(e.maxTotal / Object.keys(e.CHALLENGE_AREAS_TYPES).length) + " activities from each Challenge Area.\n    ")]) : e._e(), e._v(" "), t("div", {
                        staticClass: "MilestonesCard__progress-container"
                    }, [t(l.a, {
                        staticClass: "MilestonesCard__progress-meter",
                        attrs: {
                            height: 8,
                            query: !0,
                            rounded: !0,
                            value: e.totalPercent()
                        }
                    }), e._v(" "), t("div", {
                        staticClass: "MilestonesCard__total"
                    }, [e._v(e._s(e.total))])], 1)]), e._v(" "), e.$vuetify.breakpoint.smAndUp ? t("div", {
                        staticClass: "MilestonesCard__subtitle"
                    }, [e._v("\n    Participate in " + e._s(e.maxTotal / Object.keys(e.CHALLENGE_AREAS_TYPES).length) + " activities from each Challenge Area.\n  ")]) : e._e(), e._v(" "), t("div", {
                        staticClass: "MilestonesParticipates__pal-container"
                    }, [t("div", {
                        staticClass: "d-flex align-center justify-space-between mb-6"
                    }, [t("div", {
                        staticClass: "d-flex align-center"
                    }, [t("img", {
                        staticClass: "MilestonesParticipates__pal-icon align-center",
                        attrs: {
                            src: n(303),
                            alt: "Community Challenge"
                        }
                    }), e._v(" "), t("div", {
                        staticClass: "MilestonesParticipates__challenge-title"
                    }, [e._v("Community Challenge")])]), e._v(" "), t("div", {
                        staticClass: "MilestonesCard__total"
                    }, [e._v(e._s(e.participates.community || 0) + " / " + e._s(e.maxTotal / 4))])]), e._v(" "), t("div", {
                        staticClass: "d-flex align-center justify-space-between mb-6"
                    }, [t("div", {
                        staticClass: "d-flex align-center"
                    }, [t("img", {
                        staticClass: "MilestonesParticipates__pal-icon align-center",
                        attrs: {
                            src: n(305),
                            alt: "Community Challenge"
                        }
                    }), e._v(" "), t("div", {
                        staticClass: "MilestonesParticipates__challenge-title"
                    }, [e._v("Outdoor Challenge")])]), e._v(" "), t("div", {
                        staticClass: "MilestonesCard__total"
                    }, [e._v(e._s(e.participates.outdoors || 0) + " / " + e._s(e.maxTotal / 4))])]), e._v(" "), t("div", {
                        staticClass: "d-flex align-center justify-space-between mb-6"
                    }, [t("div", {
                        staticClass: "d-flex align-center"
                    }, [t("img", {
                        staticClass: "MilestonesParticipates__pal-icon align-center",
                        attrs: {
                            src: n(304),
                            alt: "Community Challenge"
                        }
                    }), e._v(" "), t("div", {
                        staticClass: "MilestonesParticipates__challenge-title"
                    }, [e._v("Creative Challenge")])]), e._v(" "), t("div", {
                        staticClass: "MilestonesCard__total"
                    }, [e._v(e._s(e.participates.creative || 0) + " / " + e._s(e.maxTotal / 4))])]), e._v(" "), t("div", {
                        staticClass: "d-flex align-center justify-space-between"
                    }, [t("div", {
                        staticClass: "d-flex align-center"
                    }, [t("img", {
                        staticClass: "MilestonesParticipates__pal-icon align-center",
                        attrs: {
                            src: n(306),
                            alt: "Community Challenge"
                        }
                    }), e._v(" "), t("div", {
                        staticClass: "MilestonesParticipates__challenge-title"
                    }, [e._v("Personal Growth Challenge")])]), e._v(" "), t("div", {
                        staticClass: "MilestonesCard__total"
                    }, [e._v(e._s(e.participates.personal_growth || 0) + " / " + e._s(e.maxTotal / 4))])])])])
                }), [], !1, null, "3cfe9620", null);
            t.default = component.exports;
            installComponents(component, {
                Icon: n(55).default,
                Card: n(999).default
            })
        },
        1282: function(e, t, n) {
            e.exports = {}
        },
        1333: function(e, t, n) {
            "use strict";
            n.r(t);
            var l = n(870),
                o = n(236),
                r = n(35),
                c = n(886),
                d = n(885),
                v = n(1).a.extend({
                    name: "ActionCard",
                    props: {
                        title: {
                            type: String,
                            required: !0
                        },
                        btnHref: {
                            type: String,
                            default: ""
                        },
                        btnFunc: {
                            type: Function,
                            default: () => {}
                        },
                        btnLabel: {
                            type: String,
                            required: !0
                        },
                        btnEnabled: {
                            type: Boolean,
                            required: !0
                        }
                    },
                    methods: {
                        btnAction() {
                            this.btnFunc ? this.btnFunc() : this.btnHref && this.$router.push({
                                path: this.btnHref
                            })
                        }
                    }
                }),
                _ = (n(1222), n(9)),
                component = Object(_.a)(v, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t(o.a, {
                        staticClass: "ActionCard card mr-auto mb-4 v-card--shaped card"
                    }, [t(d.a, {
                        attrs: {
                            "no-gutters": "",
                            "align-content": "center"
                        }
                    }, [t(c.a, {
                        staticClass: "ActionCard__col",
                        attrs: {
                            cols: "auto"
                        }
                    }, [t(r.c, {
                        staticClass: "ActionCard__title"
                    }, [e._v(e._s(e.title))]), e._v(" "), t(l.a, {
                        attrs: {
                            small: "",
                            disabled: !e.btnEnabled
                        },
                        on: {
                            click: function(t) {
                                return t.stopPropagation(), e.btnAction()
                            }
                        }
                    }, [e._v(e._s(e.btnLabel))])], 1)], 1)], 1)
                }), [], !1, null, null, null);
            t.default = component.exports
        },
        1381: function(e, t, n) {
            var map = {
                "./cub/milestone-1-inactive.svg": 567,
                "./cub/milestone-1.svg": 568,
                "./cub/milestone-2-inactive.svg": 569,
                "./cub/milestone-2.svg": 570,
                "./cub/milestone-3-inactive.svg": 571,
                "./cub/milestone-3.svg": 572,
                "./joey/milestone-1-inactive.svg": 573,
                "./joey/milestone-1.svg": 574,
                "./joey/milestone-2-inactive.svg": 575,
                "./joey/milestone-2.svg": 576,
                "./joey/milestone-3-inactive.svg": 577,
                "./joey/milestone-3.svg": 578,
                "./rover/milestone-1-inactive.svg": 579,
                "./rover/milestone-1.svg": 580,
                "./rover/milestone-2-inactive.svg": 581,
                "./rover/milestone-2.svg": 582,
                "./rover/milestone-3-inactive.svg": 583,
                "./rover/milestone-3.svg": 584,
                "./scout/milestone-1-inactive.svg": 585,
                "./scout/milestone-1.svg": 586,
                "./scout/milestone-2-inactive.svg": 587,
                "./scout/milestone-2.svg": 588,
                "./scout/milestone-3-inactive.svg": 589,
                "./scout/milestone-3.svg": 590,
                "./venturer/milestone-1-inactive.svg": 591,
                "./venturer/milestone-1.svg": 592,
                "./venturer/milestone-2-inactive.svg": 593,
                "./venturer/milestone-2.svg": 594,
                "./venturer/milestone-3-inactive.svg": 595,
                "./venturer/milestone-3.svg": 596
            };

            function l(e) {
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
            l.keys = function() {
                return Object.keys(map)
            }, l.resolve = o, e.exports = l, l.id = 1381
        },
        1382: function(e, t, n) {
            "use strict";
            n(1282)
        },
        1419: function(e, t, n) {
            "use strict";
            n.r(t);
            var l = n(1426),
                o = n(1372),
                r = n(886),
                c = n(885),
                d = n(40),
                v = n(149),
                _ = n(964),
                m = n(974),
                f = n(1333),
                h = n(963),
                C = n(79),
                w = n(144),
                M = n(962),
                A = n(1254),
                y = n(1255),
                E = n(1256),
                x = n(953),
                S = n(5),
                L = n(3),
                D = n(908),
                k = n(89),
                P = d.p.extend({
                    name: "Milestones",
                    components: {
                        AchievementOverview: m.default,
                        Accordion: _.default,
                        ActionCard: f.default,
                        BaseOverviewSubDescription: h.default,
                        ConfirmationDialog: C.default,
                        InfoCard: w.default,
                        InfoDialogCard: M.default,
                        MilestonesAssist: A.default,
                        MilestonesLead: y.default,
                        MilestonesParticipate: E.default,
                        PageHeader: x.default
                    },
                    props: {
                        milestonesData: {
                            type: Array,
                            required: !0
                        },
                        overviewTemplate: {
                            type: Object,
                            required: !0
                        }
                    },
                    data: () => ({
                        ActivityFlow: k.a,
                        LABEL: S.i,
                        PATH: L,
                        milestoneModel: 0,
                        MILESTONES: v.a,
                        MILESTONES_IMAGE_NAMES: D.f,
                        isReady: !1,
                        imgFallback: {
                            loading: "/images/image-placeholder-large-light.svg",
                            error: "/images/image-placeholder-large-light.svg"
                        }
                    }),
                    mounted() {
                        var e;
                        (null === (e = this.currentMilestone) || void 0 === e ? void 0 : e.id) && (this.setCurrentById(this.currentMilestone.id), this.$accessor.milestones.setCurrent(this.currentMilestone)), this.$accessor.milestones.setSelectedMilestone(this.currentMilestoneStage)
                    },
                    computed: {
                        canEditMiniReviews() {
                            return !!(this.$nuxt.isOnline && this.isYouthMember && "pending_review" !== this.$accessor.milestones.getMilestoneStatus && "awarded" !== this.$accessor.milestones.getMilestoneStatus && this.profileSectionEqualsAppSection)
                        },
                        hasSavedAnswers() {
                            return !!Object.keys(this.$accessor.milestones.getAnswers).filter(e => !e.startsWith("assist_review") && !e.startsWith("lead_review")).length
                        },
                        isAvailable() {
                            return !!this.status
                        },
                        isFirstMilestone() {
                            return 1 === this.$accessor.milestones.getSelectedMilestoneStage
                        },
                        milestonesAreEmpty() {
                            return 0 === this.$props.milestonesData.length
                        },
                        aboutContent() {
                            return this.overviewTemplate.about_box.label
                        },
                        currentMilestoneStage() {
                            return this.milestoneModel + 1
                        },
                        sectionMilestoneImage() {
                            const section = this.$accessor.global.getAppSection;
                            let e, t = "-inactive";
                            return e = 0 === this.milestoneModel ? 1 : this.currentMilestoneStage, (this.isAchievementInProgress || this.isAchievementAwarded || this.milestonesAreEmpty && this.isFirstMilestone && !this.isNotRequired && this.profileSectionEqualsAppSection) && (t = ""), n(1381)(`./${section}/milestone-${e}${t}.svg`)
                        },
                        currentMilestone() {
                            return this.$props.milestonesData.find(e => e.achievement_meta.stage === this.currentMilestoneStage)
                        },
                        status() {
                            var e;
                            return (null === (e = this.currentMilestone) || void 0 === e ? void 0 : e.status) || ""
                        },
                        isAchievementAwarded() {
                            return this.status === S.b.AWARDED
                        },
                        isAchievementInProgress() {
                            return [S.b.IN_PROGRESS, S.b.DRAFT_REVIEW, S.b.FEEDBACK_APPROVAL, S.b.FEEDBACK_REVIEW, S.b.PENDING_APPROVAL].includes(this.status)
                        },
                        isNotRequired() {
                            return this.status === S.b.NOT_REQUIRED
                        }
                    },
                    methods: {
                        createProposal() {
                            this.$accessor.programming.setActivityFlow(k.a.CREATE), this.$router.push({
                                path: "" + L.PROPOSE_ACTIVITY
                            })
                        },
                        currentMilestoneTitle() {
                            return "Milestone " + this.$accessor.milestones.getSelectedMilestoneStage
                        },
                        newMilestoneReview() {
                            this.editAchievement(this.$accessor.milestones.getCurrentMilestoneSubmission.id)
                        },
                        setStoreMilestone() {
                            this.$accessor.milestones.setSelectedMilestone(this.currentMilestoneStage), this.$accessor.milestones.setCurrent(this.currentMilestone)
                        },
                        prevMilestone() {
                            this.milestoneModel--, this.setStoreMilestone()
                        },
                        nextMilestone() {
                            this.milestoneModel++, this.setStoreMilestone()
                        },
                        infoDialogText() {
                            const e = `i_${this.$accessor.milestones.getInfoDialogType.toLowerCase()}_dialog`;
                            return this.overviewTemplate[e].label
                        },
                        participates() {
                            var e;
                            return (null === (e = this.currentMilestone) || void 0 === e ? void 0 : e.event_count.participant) || {}
                        },
                        assists() {
                            var e;
                            return (null === (e = this.currentMilestone) || void 0 === e ? void 0 : e.event_count.assistant) || {}
                        },
                        leads() {
                            var e;
                            return (null === (e = this.currentMilestone) || void 0 === e ? void 0 : e.event_count.leader) || {}
                        },
                        nextCarouselItemTitle(e) {
                            return 2 === e && (e = -1), this.MILESTONES[e + 1].title
                        },
                        prevCarouselItemTitle(e) {
                            return 0 === e && (e = 3), this.MILESTONES[e - 1].title
                        }
                    }
                }),
                R = (n(1382), n(9)),
                component = Object(R.a)(P, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", {
                        staticClass: "Milestones"
                    }, [t(c.a, {
                        staticClass: "mt-0"
                    }, [t(r.a, {
                        staticClass: "pt-0",
                        attrs: {
                            md: "8",
                            sm: "12"
                        }
                    }, [t(c.a, {
                        staticClass: "my-0"
                    }, [t(r.a, {
                        staticClass: "py-0"
                    }, [t("div", {
                        staticClass: "Milestones__page-header-container"
                    }, [t("PageHeader", {
                        staticClass: "mb-6",
                        attrs: {
                            "is-ap": "",
                            title: e.overviewTitle,
                            subtitle: e.overviewSubtitle
                        }
                    }, [t("template", {
                        slot: "infoBox"
                    }, [e.$vuetify.breakpoint.mdAndDown && e.subDescriptionLinks.length ? t("InfoDialogCard", {
                        attrs: {
                            title: "About Milestones",
                            text: e.subDescription,
                            links: e.subDescriptionLinks,
                            "image-src": e.fetchTemplateImage(`/resources/milestone/${e.MILESTONES_IMAGE_NAMES.side}.svg`),
                            "image-alt": "Four Milestone challenge areas: Community Challenge, Outdoor Challenge, Creative Challenge, Personal Growth Challenge"
                        }
                    }) : e._e()], 1)], 2), e._v(" "), e.profileSectionEqualsAppSection ? e._e() : t("InfoCard", {
                        staticClass: "BaseList__info-card mt-6 mb-12",
                        attrs: {
                            "small-text": "",
                            "info-type": "info",
                            title: e.messageRelativeToMemberCurrentSection
                        }
                    })], 1)])], 1), e._v(" "), t(l.a, {
                        staticClass: "Milestones__carousel",
                        attrs: {
                            "hide-delimiters": !0,
                            height: "300",
                            continuous: !1
                        },
                        on: {
                            change: e.setStoreMilestone
                        },
                        model: {
                            value: e.milestoneModel,
                            callback: function(t) {
                                e.milestoneModel = t
                            },
                            expression: "milestoneModel"
                        }
                    }, e._l(e.MILESTONES, (function(n, l) {
                        return t(o.a, {
                            key: l,
                            staticClass: "Milestones__carousel-item"
                        }, [0 !== l ? t("div", {
                            staticClass: "Milestones__carousel-item-title Milestones__carousel-item-title--left",
                            on: {
                                click: function(t) {
                                    return e.prevMilestone()
                                },
                                keydown: function(t) {
                                    return e.prevMilestone()
                                }
                            }
                        }, [e._v("\n            " + e._s(e.prevCarouselItemTitle(l)) + "\n          ")]) : e._e(), e._v(" "), 2 !== l ? t("div", {
                            staticClass: "Milestones__carousel-item-title Milestones__carousel-item-title--right",
                            on: {
                                click: function(t) {
                                    return e.nextMilestone()
                                },
                                keydown: function(t) {
                                    return e.nextMilestone()
                                }
                            }
                        }, [e._v("\n            " + e._s(e.nextCarouselItemTitle(l)) + "\n          ")]) : e._e(), e._v(" "), t("div", {
                            attrs: {
                                align: "center",
                                justify: "center"
                            }
                        }, [t("div", {
                            staticClass: "Milestones__carousel-subtitle"
                        }, [e._v("You are in")]), e._v(" "), t("div", {
                            staticClass: "Milestones__carousel-title"
                        }, [e._v(e._s(n.title))]), e._v(" "), t("div", {
                            staticClass: "Milestones__carousel-image-container"
                        }, [t("img", {
                            directives: [{
                                name: "img-fallback",
                                rawName: "v-img-fallback",
                                value: e.imgFallback,
                                expression: "imgFallback"
                            }],
                            staticClass: "Milestones__carousel-image",
                            attrs: {
                                src: e.sectionMilestoneImage,
                                alt: n.title
                            }
                        }), e._v(" "), e.isAchievementAwarded ? t("div", {
                            staticClass: "Milestones__carousel-image--awarded"
                        }) : e._e()])])])
                    })), 1), e._v(" "), e.isNotRequired ? t("InfoCard", {
                        staticClass: "mt-6 mb-6",
                        attrs: {
                            "small-text": "",
                            "info-type": "info",
                            title: "You are not required to complete this Milestone. Please check with your Leader for more info."
                        }
                    }) : e._e(), e._v(" "), t("ActionCard", {
                        attrs: {
                            title: "Have an idea for an activity?",
                            "btn-label": e.LABEL.PROPOSE_IDEA,
                            "btn-func": e.createProposal,
                            "btn-enabled": e.$nuxt.isOnline && e.profileSectionEqualsAppSection && !e.$accessor.user.hasAnySupportLeaderRole
                        }
                    }), e._v(" "), t("Accordion", {
                        staticClass: "mb-4",
                        attrs: {
                            "theme-alt": "",
                            title: "About Participates, Assists & Leads"
                        }
                    }, [t("VueShowdown", {
                        staticClass: "VueShowdown",
                        attrs: {
                            markdown: e.aboutContent
                        }
                    })], 1), e._v(" "), t("MilestonesParticipate", {
                        staticClass: "mb-4",
                        attrs: {
                            participates: e.participates(),
                            "max-total": e.maxParticipates
                        }
                    }), e._v(" "), t("MilestonesAssist", {
                        staticClass: "mb-4",
                        attrs: {
                            assists: e.assists(),
                            "max-total": e.maxAssists,
                            answers: e.$accessor.milestones.getAnswers,
                            "can-edit": e.canEditMiniReviews
                        }
                    }), e._v(" "), t("MilestonesLead", {
                        staticClass: "mb-4",
                        attrs: {
                            leads: e.leads(),
                            "max-total": e.maxLeads,
                            answers: e.$accessor.milestones.getAnswers,
                            "can-edit": e.canEditMiniReviews
                        }
                    }), e._v(" "), e.isYouthMember ? [t("div", {
                        staticClass: "Milestones__review-subtitle"
                    }, [e._v("\n          Complete the above requirements and then submit your Milestone review to the Unit Council.\n        ")]), e._v(" "), e.hasSavedAnswers ? t("AchievementOverview", {
                        staticClass: "mt-0 mb-8",
                        attrs: {
                            "is-milestones": "",
                            "rounded-list": "",
                            "show-planned-headlines": !1,
                            "show-award-headline": !1,
                            items: [e.$accessor.milestones.getCurrentMilestoneSubmission],
                            "title-func": e.currentMilestoneTitle,
                            "edit-func": t => e.editAchievement(t.id),
                            "view-func": t => e.editAchievement(t.id),
                            "view-review-func": t => e.editAchievement(t.id),
                            "edit-review-func": t => e.editAchievement(t.id)
                        }
                    }) : t("ActionCard", {
                        attrs: {
                            title: e.currentMilestoneTitle(),
                            "btn-func": e.newMilestoneReview,
                            "btn-label": e.LABEL.REVIEW_MILESTONE,
                            "btn-enabled": e.$nuxt.isOnline && e.canReviewMilestone
                        }
                    })] : e._e()], 2), e._v(" "), e.$vuetify.breakpoint.mdAndUp ? t(r.a, {
                        staticClass: "pt-0",
                        attrs: {
                            md: "4"
                        }
                    }, [t("BaseOverviewSubDescription", {
                        attrs: {
                            text: e.subDescription,
                            links: e.subDescriptionLinks,
                            "image-src": e.fetchTemplateImage(`/resources/milestone/${e.MILESTONES_IMAGE_NAMES.side}.svg`),
                            "image-alt": "Four Milestone challenge areas: Community Challenge, Outdoor Challenge, Creative Challenge, Personal Growth Challenge"
                        }
                    })], 1) : e._e()], 1), e._v(" "), t("ConfirmationDialog", {
                        attrs: {
                            title: e.$accessor.milestones.getInfoDialogType,
                            model: e.$accessor.milestones.getInfoDialogVisibility,
                            "hide-confirm": "",
                            "close-button-label": e.LABEL.CLOSE,
                            "close-dialog": e.$accessor.milestones.hideInfoDialog
                        }
                    }, [t("template", {
                        slot: "content"
                    }, [t("VueShowdown", {
                        staticClass: "VueShowdown VueShowdown--info-dialog",
                        attrs: {
                            markdown: e.infoDialogText()
                        }
                    })], 1)], 2)], 1)
                }), [], !1, null, null, null);
            t.default = component.exports;
            installComponents(component, {
                InfoDialogCard: n(962).default,
                PageHeader: n(953).default,
                Accordion: n(964).default,
                MilestonesParticipate: n(1256).default,
                MilestonesAssist: n(1254).default,
                MilestonesLead: n(1255).default,
                AchievementOverview: n(974).default,
                BaseOverviewSubDescription: n(963).default,
                ConfirmationDialog: n(79).default
            })
        },
        908: function(e, t, n) {
            "use strict";
            n.d(t, "b", (function() {
                return l
            })), n.d(t, "c", (function() {
                return o
            })), n.d(t, "d", (function() {
                return r
            })), n.d(t, "e", (function() {
                return c
            })), n.d(t, "f", (function() {
                return d
            })), n.d(t, "g", (function() {
                return v
            })), n.d(t, "j", (function() {
                return _
            })), n.d(t, "a", (function() {
                return m
            })), n.d(t, "h", (function() {
                return f
            })), n.d(t, "i", (function() {
                return h
            }));
            const l = {
                    spices: "intro-scouting--spices",
                    plan_do_review: "intro-scouting--plan-do-review"
                },
                o = {
                    overview: "intro-scouting--overview",
                    side: "intro-scouting--side"
                },
                r = {
                    overview_joey: "intro-section/joey--overview",
                    overview_cub: "intro-section/cub--overview",
                    overview_scout: "intro-section/scout--overview",
                    overview_venturer: "intro-section/venturer--overview",
                    overview_rover: "intro-section/rover--overview",
                    side: "intro-section/intro-section--side"
                },
                c = new Map([
                    ["joey", r.overview_joey],
                    ["cub", r.overview_cub],
                    ["scout", r.overview_scout],
                    ["venturer", r.overview_venturer],
                    ["rover", r.overview_rover]
                ]),
                d = {
                    side: "milestones--side"
                },
                v = {
                    welcome: "oas--welcome",
                    side: "oas--side"
                },
                _ = {
                    overview: "sia--overview",
                    welcome: "sia--welcome",
                    side: "sia--side"
                },
                m = {
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
        946: function(e, t, n) {
            e.exports = {}
        },
        953: function(e, t, n) {
            "use strict";
            n.r(t);
            var l = n(886),
                o = n(885),
                r = n(1).a.extend({
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
                c = (n(959), n(9)),
                component = Object(c.a)(r, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("section", {
                        staticClass: "PageHeader"
                    }, [t(o.a, {
                        staticClass: "pt-0 align-center",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(l.a, {
                        staticClass: "py-0"
                    }, [t("div", {
                        staticClass: "PageHeader__container"
                    }, [t("div", {
                        staticClass: "PageHeader__title-container"
                    }, [e.isAp ? t("h2", {
                        staticClass: "PageHeader__ap"
                    }, [e._v("Achievement Pathway")]) : e._e(), e._v(" "), t("h1", {
                        staticClass: "PageHeader__title"
                    }, [e._v(e._s(e.title))])]), e._v(" "), e._t("buttons"), e._v(" "), e.imageSrc ? t("img", {
                        attrs: {
                            src: e.imageSrc,
                            alt: "Page Header image"
                        }
                    }) : e._e()], 2), e._v(" "), t(o.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(l.a, {
                        attrs: {
                            sm: "12",
                            md: "9",
                            lg: "10"
                        }
                    }, [t("div", {
                        staticClass: "PageHeader__subtitle"
                    }, [e._v("\n            " + e._s(e.subtitle) + "\n            "), e.href ? t("a", {
                        staticClass: "Link-alt",
                        attrs: {
                            href: e.href,
                            target: e.linkOpenContext
                        }
                    }, [e._v(e._s(e.linkTitle))]) : e._e()])])], 1)], 1), e._v(" "), e.$slots.infoBox && e.$vuetify.breakpoint.smOnly ? t("div", {
                        staticClass: "PageHeader__infobox-container--large"
                    }, [e._t("infoBox")], 2) : e._e()], 1), e._v(" "), e.$slots.infoBox && e.$vuetify.breakpoint.xsOnly ? t("div", {
                        staticClass: "PageHeader__infobox-container--small"
                    }, [e._t("infoBox")], 2) : e._e()], 1)
                }), [], !1, null, "5317aa88", null);
            t.default = component.exports
        },
        955: function(e, t, n) {
            e.exports = {}
        },
        956: function(e, t, n) {
            e.exports = {}
        },
        959: function(e, t, n) {
            "use strict";
            n(946)
        },
        960: function(e, t, n) {
            e.exports = {}
        },
        962: function(e, t, n) {
            "use strict";
            n.r(t);
            var l = n(236),
                o = n(35),
                r = n(3),
                c = n(5),
                d = n(27).a.extend({
                    name: "InfoDialogCard",
                    props: {
                        title: {
                            type: String,
                            required: !0
                        },
                        text: {
                            type: String,
                            default: ""
                        },
                        links: {
                            type: Array,
                            default: () => []
                        },
                        imageSrc: {
                            type: String,
                            default: ""
                        },
                        imageAlt: {
                            type: String,
                            default: ""
                        }
                    },
                    data: () => ({
                        LABEL: c.i,
                        PATH: r,
                        infoDialogModel: !1,
                        imgFallback: {
                            loading: "/images/image-placeholder-dark.svg",
                            error: "/images/image-placeholder-dark.svg"
                        }
                    }),
                    methods: {
                        getHref(e) {
                            return e.url ? e.url : e.path ? this.templateFilepath(e.path) : void 0
                        }
                    }
                }),
                v = (n(985), n(9)),
                component = Object(v.a)(d, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t(l.a, {
                        staticClass: "InfoDialogCard"
                    }, [t(o.c, {
                        staticClass: "pa-0"
                    }, [e.title ? t("div", {
                        staticClass: "InfoDialogCard__title"
                    }, [e._v(e._s(e.title))]) : e._e()]), e._v(" "), t("Icon", {
                        staticClass: "InfoDialogCard__info-icon align-center ml-2",
                        attrs: {
                            name: "info"
                        },
                        nativeOn: {
                            click: function(t) {
                                t.stopPropagation(), e.infoDialogModel = !0
                            },
                            keydown: function(t) {
                                t.stopPropagation(), e.infoDialogModel = !0
                            }
                        }
                    }), e._v(" "), t("ConfirmationDialog", {
                        attrs: {
                            model: e.infoDialogModel,
                            "hide-confirm": "",
                            "close-button-label": e.LABEL.CLOSE,
                            "close-dialog": () => e.infoDialogModel = !1
                        }
                    }, [t("template", {
                        slot: "content"
                    }, [t("VueShowdown", {
                        staticClass: "VueShowdown VueShowdown--info-dialog",
                        attrs: {
                            markdown: e.text
                        }
                    }), e._v(" "), e.imageSrc ? t("img", {
                        directives: [{
                            name: "img-fallback",
                            rawName: "v-img-fallback",
                            value: e.imgFallback,
                            expression: "imgFallback"
                        }],
                        staticClass: "InfoDialogCard__image",
                        attrs: {
                            src: e.imageSrc,
                            alt: e.imageAlt
                        }
                    }) : e._e(), e._v(" "), e._l(e.links, (function(link, i) {
                        return t("a", {
                            key: i,
                            staticClass: "InfoDialogCard__link",
                            attrs: {
                                href: e.getHref(link),
                                target: "_blank",
                                rel: "noopener noreferrer"
                            }
                        }, [e._v("\n        " + e._s(link.text) + "\n      ")])
                    }))], 2)], 2)], 1)
                }), [], !1, null, null, null);
            t.default = component.exports;
            installComponents(component, {
                Icon: n(55).default,
                ConfirmationDialog: n(79).default
            })
        },
        963: function(e, t, n) {
            "use strict";
            n.r(t);
            var l = n(236),
                o = n(35),
                r = n(3),
                c = n(27).a.extend({
                    name: "BaseOverviewSubDescription",
                    props: {
                        text: {
                            type: String,
                            default: ""
                        },
                        links: {
                            type: Array,
                            default: () => []
                        },
                        imageSrc: {
                            type: String,
                            default: ""
                        },
                        imageAlt: {
                            type: String,
                            default: ""
                        }
                    },
                    data: () => ({
                        PATH: r
                    }),
                    methods: {
                        getHref(e) {
                            return e.url ? e.url : e.path ? this.templateFilepath(e.path) : void 0
                        }
                    }
                }),
                d = (n(984), n(9)),
                component = Object(d.a)(c, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t(l.a, {
                        staticClass: "BaseOverviewSubDescription",
                        attrs: {
                            flat: ""
                        }
                    }, [t(o.c, [t("VueShowdown", {
                        attrs: {
                            markdown: e.text
                        }
                    }), e._v(" "), e.links ? e._l(e.links, (function(n, i) {
                        return t("div", {
                            key: i
                        }, [t("a", {
                            staticClass: "Link-alt",
                            attrs: {
                                href: e.getHref(n),
                                target: "_blank",
                                rel: "noopener noreferrer"
                            }
                        }, [e._v(e._s(n.text))])])
                    })) : e._e()], 2), e._v(" "), e.imageSrc ? t("img", {
                        staticClass: "BaseOverviewSubDescription__image mt-6",
                        attrs: {
                            src: e.imageSrc,
                            alt: e.imageAlt
                        }
                    }) : e._e()], 1)
                }), [], !1, null, null, null);
            t.default = component.exports
        },
        964: function(e, t, n) {
            "use strict";
            n.r(t);
            var l = n(1090),
                o = n(1092),
                r = n(1091),
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
                v = (n(995), n(9)),
                component = Object(v.a)(d, (function() {
                    var e = this._self._c;
                    this._self._setupProxy;
                    return e("div", {
                        staticClass: "Accordion",
                        class: {
                            "Accordion--theme-alt": this.themeAlt
                        }
                    }, [e(c.a, [e(l.a, {
                        staticClass: "Accordion__panel"
                    }, [e(r.a, [this._v(this._s(this.title))]), this._v(" "), e(o.a, [this._t("default")], 2)], 1)], 1)], 1)
                }), [], !1, null, null, null);
            t.default = component.exports
        },
        984: function(e, t, n) {
            "use strict";
            n(955)
        },
        985: function(e, t, n) {
            "use strict";
            n(956)
        },
        995: function(e, t, n) {
            "use strict";
            n(960)
        },
        999: function(e, t, n) {
            "use strict";
            n.r(t);
            var l = n(236),
                o = n(886),
                r = n(885),
                c = n(1).a.extend({
                    name: "Card"
                }),
                d = (n(1071), n(9)),
                component = Object(d.a)(c, (function() {
                    var e = this._self._c;
                    this._self._setupProxy;
                    return e(l.a, {
                        staticClass: "Card card mr-auto v-card--shaped card"
                    }, [e(r.a, {
                        attrs: {
                            no: "",
                            "no-gutters": "",
                            "align-content": "center"
                        }
                    }, [e(o.a, {
                        staticClass: "Card__col",
                        attrs: {
                            cols: "auto"
                        }
                    }, [this._t("default")], 2)], 1)], 1)
                }), [], !1, null, null, null);
            t.default = component.exports
        }
    }
]);