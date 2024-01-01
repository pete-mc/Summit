(window.webpackJsonp = window.webpackJsonp || []).push([
    [27, 54, 55, 58, 59, 85, 88, 146], {
        1001: function(e, t, n) {
            "use strict";
            n(969)
        },
        1032: function(e, t, n) {
            "use strict";
            n(980)
        },
        1175: function(e, t, n) {
            e.exports = {}
        },
        1176: function(e, t, n) {
            e.exports = {}
        },
        1227: function(e, t, n) {
            "use strict";
            n(1175)
        },
        1228: function(e, t, n) {
            "use strict";
            n(1176)
        },
        1258: function(e, t, n) {
            "use strict";
            n.r(t);
            var o = n(236),
                l = n(35),
                r = n(1),
                c = n(3),
                v = r.a.extend({
                    name: "BaseSubDescriptionSmall",
                    props: {
                        description: {
                            type: String,
                            required: !1,
                            default: ""
                        },
                        links: {
                            type: Array,
                            required: !0,
                            default: () => [{
                                text: "",
                                url: ""
                            }]
                        }
                    },
                    data: () => ({
                        PATH: c
                    })
                }),
                d = (n(1227), n(9)),
                component = Object(d.a)(v, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return e.$vuetify.breakpoint.smAndDown ? t(o.a, {
                        staticClass: "BaseSubDescriptionSmall",
                        attrs: {
                            flat: ""
                        }
                    }, [t("img", {
                        attrs: {
                            src: n(302),
                            alt: "hint"
                        }
                    }), e._v(" "), t(l.c, [e.description ? t("p", [e._v(e._s(e.description))]) : e._e(), e._v(" "), e._l(e.links, (function(link, i) {
                        return t("a", {
                            key: i,
                            staticClass: "BaseSubDescriptionSmall__link",
                            attrs: {
                                href: link.url,
                                target: "_blank",
                                rel: "noopener noreferrer"
                            }
                        }, [e._v("\n      " + e._s(link.text) + "\n    ")])
                    }))], 2)], 1) : e._e()
                }), [], !1, null, "ba8d013a", null);
            t.default = component.exports
        },
        1259: function(e, t, n) {
            "use strict";
            n.r(t);
            var o = n(1),
                l = n(991),
                r = n(287),
                c = n(3),
                v = o.a.extend({
                    name: "PersonalReflectionSubDescription",
                    components: {
                        BaseSubDescription: l.default
                    },
                    props: {
                        subDescription: {
                            type: String,
                            default: ""
                        },
                        links: {
                            type: Array,
                            required: !0
                        }
                    },
                    data: () => ({
                        ICON_SPICES_3X2: r.ICON_SPICES_3X2,
                        PATH: c
                    }),
                    methods: {
                        fetchImage: image => n(903)("./" + image)
                    }
                }),
                d = (n(1228), n(9)),
                component = Object(d.a)(v, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("BaseSubDescription", {
                        class: e.$options.name
                    }, [t("VueShowdown", {
                        staticClass: "VueShowdown VueShowdown--base-overview",
                        attrs: {
                            markdown: e.subDescription
                        }
                    }), e._v(" "), t("img", {
                        staticClass: "mt-3 mb-3",
                        attrs: {
                            src: e.fetchImage(e.ICON_SPICES_3X2),
                            alt: "SPICES: Social, Physical, Intellectual, Character, Emotional, Spiritual"
                        }
                    }), e._v(" "), t("p", {
                        staticClass: "PersonalReflectionSubDescription--semibold"
                    }, [e._v("Unit Council Only")]), e._v(" "), t("p", [e._v("Some things to consider before & after you go through Personal Reflection with a Scout Member")]), e._v(" "), e._l(e.links, (function(n, o) {
                        return t("div", {
                            key: o
                        }, [t("nuxt-link", {
                            staticClass: "Nuxt__link mt-6 mb-6",
                            attrs: {
                                to: n.url
                            }
                        }, [e._v("\n      " + e._s(n.text) + "\n    ")])], 1)
                    }))], 2)
                }), [], !1, null, "ab4161ba", null);
            t.default = component.exports;
            installComponents(component, {
                BaseSubDescription: n(991).default
            })
        },
        1285: function(e, t, n) {
            e.exports = {}
        },
        1385: function(e, t, n) {
            "use strict";
            n(1285)
        },
        1422: function(e, t, n) {
            "use strict";
            n.r(t);
            var o = n(870),
                l = n(40),
                r = n(5),
                c = n(287),
                v = n(3),
                d = n(988),
                m = n(1258),
                f = n(79),
                w = n(974),
                _ = n(1259),
                h = l.v.extend({
                    name: "PersonalReflectionOverview",
                    components: {
                        BaseOverview: d.default,
                        BaseSubDescriptionSmall: m.default,
                        PersonalReflectionSubDescription: _.default,
                        AchievementOverview: w.default,
                        ConfirmationDialog: f.default
                    },
                    data: () => ({
                        PATH: v,
                        LABEL: r.i,
                        ICON: c,
                        NAV_LABEL: r.l,
                        deleteModal: !1,
                        reflectionToDelete: {},
                        unitCouncilLinks: [{
                            text: "Plan",
                            url: `${v.PERSONAL_REFLECTION}${v.PLAN}`
                        }, {
                            text: "Review",
                            url: `${v.PERSONAL_REFLECTION}${v.REVIEW}`
                        }]
                    }),
                    async created() {
                        await this.loadTemplate()
                    },
                    computed: {
                        isReady() {
                            return void 0 !== !!this.$accessor.personalReflection.getDoTemplate.document
                        },
                        getHeadline() {
                            return this.hasExistingSubmissionsForSection() ? "" : "Before you start"
                        }
                    },
                    methods: {
                        confirmDelete(e) {
                            this.deleteModal = !0, this.reflectionToDelete = e
                        },
                        deleteReflection() {
                            this.deleteModal = !1, this.deleteAchievement(this.reflectionToDelete.id)
                        },
                        getReflectionTitle() {
                            return `${r.l.PERSONAL_REFLECTION} (${this.$accessor.global.getAppSectionFormatted})`
                        },
                        closeDialog() {
                            this.deleteModal = !1
                        }
                    }
                }),
                y = (n(1385), n(9)),
                component = Object(y.a)(h, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return e.isReady ? t("div", {
                        staticClass: "PersonalReflectionOverview"
                    }, [t("BaseOverview", {
                        attrs: {
                            title: e.overviewTitle,
                            subtitle: e.overviewSubtitle,
                            "has-existing-submissions": e.hasExistingSubmissionsForSection(),
                            "has-awarded": e.hasAwardedForSection(),
                            "create-function": e.newAchievement
                        }
                    }, [t("template", {
                        slot: "description"
                    }, [t("AchievementOverview", {
                        attrs: {
                            items: e.manager.getList(),
                            "title-func": e.getReflectionTitle,
                            "delete-func": e.confirmDelete,
                            "edit-func": t => e.editAchievement(t.id),
                            "view-func": t => e.editAchievement(t.id),
                            "view-review-func": t => e.editAchievement(t.id),
                            "edit-review-func": t => e.editAchievement(t.id)
                        }
                    }, [e.isYouthMember && !e.profileSectionEqualsAppSection && !e.isMemberBelowAppSection || e.hasExistingSubmissionsForSection() ? e._e() : t("div", {
                        attrs: {
                            slot: "page-end",
                            "data-cy": "qa-create-reflection"
                        },
                        slot: "page-end"
                    }, [t("VueShowdown", {
                        staticClass: "VueShowdown VueShowdown--base-overview",
                        attrs: {
                            markdown: e.emptyState
                        }
                    }), e._v(" "), t("hr"), e._v(" "), t("p", {
                        staticClass: "PersonalReflectionOverview__description--subtitle"
                    }, [e._v("\n            You should do this next activity with your group’s Unit Council. Your Unit Council will allocate a time to\n            go through this together with you.\n          ")]), e._v(" "), !e.isYouthMember && e.$vuetify.breakpoint.mdAndUp ? t(o.a, {
                        staticClass: "PersonalReflectionOverview__create-button",
                        attrs: {
                            disabled: e.isYouthMember && !e.profileSectionEqualsAppSection,
                            rounded: "",
                            small: "",
                            height: "40px"
                        },
                        on: {
                            click: function(t) {
                                return t.stopPropagation(), e.newAchievement.apply(null, arguments)
                            }
                        }
                    }, [e._v("\n            View Requirements\n          ")]) : e.isYouthMember && e.profileSectionEqualsAppSection && e.$vuetify.breakpoint.mdAndUp ? t(o.a, {
                        staticClass: "PersonalReflectionOverview__create-button",
                        attrs: {
                            rounded: "",
                            small: "",
                            height: "40px"
                        },
                        on: {
                            click: function(t) {
                                return t.stopPropagation(), e.newAchievement.apply(null, arguments)
                            }
                        }
                    }, [e._v("\n            Start Personal Reflection\n          ")]) : e._e()], 1)])], 1), e._v(" "), t("BaseSubDescriptionSmall", {
                        staticClass: "PersonalReflectionOverview__unit-council-info",
                        attrs: {
                            slot: "page-end",
                            description: "Information for Unit Council Members",
                            links: e.unitCouncilLinks
                        },
                        slot: "page-end"
                    }), e._v(" "), t("template", {
                        slot: "sub-description-side"
                    }, [t("PersonalReflectionSubDescription", {
                        attrs: {
                            links: e.unitCouncilLinks,
                            "sub-description": e.subDescription
                        }
                    })], 1)], 2), e._v(" "), t("ConfirmationDialog", {
                        attrs: {
                            model: e.deleteModal,
                            title: "Delete Reflection?",
                            subtitle: "You will not be able to edit or submit this personal reflection after it has been deleted.",
                            "confirm-button-label": e.LABEL.DELETE,
                            "confirm-callback": e.deleteReflection,
                            "close-dialog": e.closeDialog
                        }
                    })], 1) : e._e()
                }), [], !1, null, "16117a49", null);
            t.default = component.exports;
            installComponents(component, {
                AchievementOverview: n(974).default,
                BaseSubDescriptionSmall: n(1258).default,
                PersonalReflectionSubDescription: n(1259).default,
                BaseOverview: n(988).default,
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

            function o(e) {
                var t = l(e);
                return n(t)
            }

            function l(e) {
                if (!n.o(map, e)) {
                    var t = new Error("Cannot find module '" + e + "'");
                    throw t.code = "MODULE_NOT_FOUND", t
                }
                return map[e]
            }
            o.keys = function() {
                return Object.keys(map)
            }, o.resolve = l, e.exports = o, o.id = 903
        },
        954: function(e, t, n) {
            e.exports = {}
        },
        966: function(e, t, n) {
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
                "./terrain-anim-sm.gif": 967,
                "./terrain-anim.gif": 968,
                "./venturer-basecamp/venturer-basecamp-aj.svg": 699,
                "./venturer-basecamp/venturer-basecamp-oas.svg": 700,
                "./venturer-basecamp/venturer-basecamp-patrol.svg": 701,
                "./venturer-basecamp/venturer-basecamp-pd.svg": 702,
                "./venturer-basecamp/venturer-basecamp-pe.svg": 703,
                "./venturer-basecamp/venturer-basecamp-peak.svg": 704,
                "./venturer-basecamp/venturer-basecamp-pr.svg": 705,
                "./venturer-basecamp/venturer-basecamp-sia.svg": 706
            };

            function o(e) {
                var t = l(e);
                return n(t)
            }

            function l(e) {
                if (!n.o(map, e)) {
                    var t = new Error("Cannot find module '" + e + "'");
                    throw t.code = "MODULE_NOT_FOUND", t
                }
                return map[e]
            }
            o.keys = function() {
                return Object.keys(map)
            }, o.resolve = l, e.exports = o, o.id = 966
        },
        967: function(e, t, n) {
            e.exports = n.p + "img/terrain-anim-sm.--562ebd4.gif"
        },
        968: function(e, t, n) {
            e.exports = n.p + "img/terrain-anim.--b22f1d6.gif"
        },
        969: function(e, t, n) {
            e.exports = {}
        },
        980: function(e, t, n) {
            e.exports = {}
        },
        983: function(e, t, n) {
            "use strict";
            n(954)
        },
        988: function(e, t, n) {
            "use strict";
            n.r(t);
            var o = n(870),
                l = n(886),
                r = n(163),
                c = n(885),
                v = n(40),
                d = n(144),
                m = v.h.extend({
                    name: "BaseOverview",
                    components: {
                        InfoCard: d.default
                    },
                    props: {
                        title: {
                            type: String,
                            required: !0
                        },
                        subtitle: {
                            type: String,
                            required: !0
                        },
                        imagePath: {
                            type: String,
                            default: ""
                        },
                        buttonTitle: {
                            type: String,
                            default: ""
                        },
                        createFunction: {
                            type: Function,
                            default: () => {}
                        },
                        hasExistingSubmissions: {
                            type: Boolean,
                            default: !1
                        },
                        hasAwarded: {
                            type: Boolean,
                            default: !1
                        },
                        segment: {
                            type: String,
                            required: !1,
                            default: "Achievement Pathways"
                        },
                        isOas: {
                            type: Boolean
                        },
                        isAdventurousJourney: {
                            type: Boolean
                        },
                        isSia: {
                            type: Boolean
                        },
                        isPd: {
                            type: Boolean
                        },
                        pdCanReview: {
                            type: Boolean
                        }
                    },
                    computed: {
                        showNoAchievementsMessage() {
                            return !this.isOas && this.isMemberAboveAppSection && !this.hasAwarded
                        },
                        canCreateOrView() {
                            return !this.isYouthMember || this.isPd && this.pdCanReview || this.isSia && this.profileSectionEqualsAppSection || this.isAdventurousJourney && this.profileSectionEqualsAppSection || !this.hasExistingSubmissions && this.profileSectionEqualsAppSection
                        },
                        showEmptyPlaceholderImage() {
                            return !this.isYouthMember && this.imagePath || !this.hasExistingSubmissions && !this.isMemberAboveAppSection && this.imagePath
                        },
                        imageSrc() {
                            return n(966)("./" + this.imagePath)
                        }
                    }
                }),
                f = (n(1001), n(9)),
                component = Object(f.a)(m, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", {
                        staticClass: "BaseOverview"
                    }, [t(c.a, {
                        staticClass: "mt-0"
                    }, [t(l.a, {
                        staticClass: "pt-0",
                        attrs: {
                            cols: "12",
                            md: "8"
                        }
                    }, [t("section", {
                        staticClass: "BaseOverview__header"
                    }, [t(c.a, {
                        staticClass: "my-0"
                    }, [t(l.a, {
                        staticClass: "py-0",
                        attrs: {
                            cols: "12",
                            sm: "8",
                            md: "12"
                        }
                    }, [t("div", {
                        staticClass: "BaseOverview__header-meta"
                    }, [t("div", {
                        staticClass: "BaseOverview__segment"
                    }, [e._v(e._s(e.segment))]), e._v(" "), t("div", {
                        staticClass: "BaseOverview__title"
                    }, [e._v(e._s(e.title))]), e._v(" "), t("div", {
                        staticClass: "BaseOverview__subtitle"
                    }, [e._v(e._s(e.subtitle))])]), e._v(" "), e._t("top-description")], 2), e._v(" "), t(l.a, {
                        staticClass: "BaseOverview__sub-description-container py-0",
                        attrs: {
                            cols: "12",
                            sm: "4",
                            md: "12"
                        }
                    }, [t("div", [e.$vuetify.breakpoint.smAndDown ? e._t("sub-description-small") : e._e()], 2)])], 1), e._v(" "), t(c.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(l.a, {
                        attrs: {
                            cols: "12"
                        }
                    }, [e.profileSectionEqualsAppSection ? e._e() : t("InfoCard", {
                        staticClass: "BaseList__info-card mt-6 mb-12",
                        attrs: {
                            "small-text": "",
                            "info-type": "info",
                            title: e.messageRelativeToMemberCurrentSection
                        }
                    })], 1)], 1)], 1), e._v(" "), t(c.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(l.a, [e.profileSectionEqualsAppSection ? t("hr", {
                        staticClass: "BaseOverview__divider"
                    }) : e._e()])], 1), e._v(" "), e.isYouthMember && e.showNoAchievementsMessage ? t("BaseNoAchievements") : e._e(), e._v(" "), t("section", {
                        staticClass: "BaseOverview__main"
                    }, [t(c.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(l.a, [t("div", [e._t("before")], 2), e._v(" "), !e.isOas && e.$vuetify.breakpoint.mdAndUp && e.buttonTitle && e.canCreateOrView ? t(o.a, {
                        staticClass: "mb-2",
                        attrs: {
                            small: ""
                        },
                        on: {
                            click: e.createFunction
                        }
                    }, [e._v("\n              " + e._s(e.buttonTitle) + "\n            ")]) : e._e(), e._v(" "), e.$slots.description ? t("div", {
                        staticClass: "BaseOverview__body"
                    }, [e._t("description")], 2) : e._e(), e._v(" "), t("div", [e._t("page-end")], 2)], 1)], 1)], 1), e._v(" "), !e.isOas && e.showEmptyPlaceholderImage ? t(c.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(l.a, {
                        attrs: {
                            md: "11"
                        }
                    }, [t("section", {
                        staticClass: "BaseOverview__image"
                    }, [t("img", {
                        staticClass: "BaseOverview__overview-image",
                        attrs: {
                            src: e.imageSrc,
                            alt: "overview-image"
                        }
                    })])])], 1) : e._e()], 1), e._v(" "), e.$vuetify.breakpoint.mdAndUp ? t(l.a, {
                        attrs: {
                            cols: "12",
                            md: "4"
                        }
                    }, [e._t("sub-description-side")], 2) : e._e()], 1), e._v(" "), !e.isOas && e.$vuetify.breakpoint.smAndDown && e.canCreateOrView ? t(o.a, {
                        staticClass: "v-btn--view BtnSpeedial",
                        attrs: {
                            disabled: e.$nuxt.isOffline,
                            "data-cy": "qa-Speedial",
                            fab: "",
                            small: "",
                            fixed: "",
                            right: "",
                            bottom: ""
                        },
                        on: {
                            click: function(t) {
                                return t.stopPropagation(), e.createFunction.apply(null, arguments)
                            }
                        }
                    }, [t(r.a, {
                        attrs: {
                            dark: ""
                        }
                    }, [e._v(e._s(e.isYouthMember ? "mdi-plus" : "mdi-magnify"))])], 1) : e._e()], 1)
                }), [], !1, null, "f0153bc0", null);
            t.default = component.exports;
            installComponents(component, {
                BaseNoAchievements: n(989).default
            })
        },
        989: function(e, t, n) {
            "use strict";
            n.r(t);
            var o = n(1).a.extend({
                    name: "BaseNoAchievements",
                    functional: !0
                }),
                l = (n(983), n(9)),
                component = Object(l.a)(o, (function(e, t) {
                    return e("div", {
                        staticClass: "BaseNoAchievements"
                    }, [e("div", {
                        staticClass: "BaseNoAchievements__empty"
                    }, [t._v("No achievements recorded.")]), t._v(" "), e("img", {
                        attrs: {
                            src: n(565),
                            alt: "No achievements recorded."
                        }
                    })])
                }), [], !0, null, null, null);
            t.default = component.exports
        },
        991: function(e, t, n) {
            "use strict";
            n.r(t);
            var o = n(236),
                l = n(35),
                r = n(1),
                c = n(3),
                v = r.a.extend({
                    name: "BaseSubDescription",
                    data: () => ({
                        PATH: c
                    })
                }),
                d = (n(1032), n(9)),
                component = Object(d.a)(v, (function() {
                    var e = this._self._c;
                    this._self._setupProxy;
                    return e(o.a, {
                        staticClass: "BaseSubDescription",
                        attrs: {
                            flat: ""
                        }
                    }, [e(l.c, [this._t("default")], 2)], 1)
                }), [], !1, null, "ce7aa1e4", null);
            t.default = component.exports
        }
    }
]);