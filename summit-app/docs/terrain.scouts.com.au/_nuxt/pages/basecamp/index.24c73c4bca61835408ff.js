(window.webpackJsonp = window.webpackJsonp || []).push([
    [184, 60], {
        1155: function(e, r, t) {
            e.exports = {}
        },
        1208: function(e, r, t) {
            "use strict";
            t(1155)
        },
        1319: function(e, r, t) {
            "use strict";
            t.r(r);
            var o = t(870),
                n = t(3),
                c = t(5),
                l = t(55),
                d = t(40).e.extend({
                    name: "BasecampLeaders",
                    components: {
                        Icon: l.default
                    },
                    data: () => ({
                        LABEL: c.i,
                        applyStyleFix: !1,
                        isReady: !1,
                        imgFallback: {
                            loading: "/images/image-placeholder-large-light.svg",
                            error: "/images/image-placeholder-large-light.svg"
                        }
                    }),
                    computed: {
                        pageItems() {
                            return [{
                                title: c.l.GROUP_LIFE,
                                description: "Everything about your Group’s progress.",
                                image: "leaders-basecamp/leaders-grouplife.svg",
                                route: n.GROUP_LIFE,
                                link: "",
                                roles: [this.$storeUser.hasRoleGroupLeader]
                            }, {
                                title: c.l.BRANCH_LIFE,
                                description: "Everything about your Branch’s progress.",
                                image: "leaders-basecamp/leaders-branchlife.svg",
                                route: n.BRANCH_LIFE,
                                link: "",
                                roles: [this.$storeUser.hasAnySupportLeaderRole]
                            }, {
                                title: c.l.PROGRAMMING,
                                description: "Plan activities or view proposed activities by your members.",
                                image: "leaders-basecamp/leaders-programming.svg",
                                route: n.PROGRAMMING,
                                link: "",
                                roles: [this.$storeUser.hasRoleGroupLeader, this.$storeUser.hasDutyAdultLeader, this.$storeUser.hasRoleSupportLeaderReadOrWrite]
                            }, {
                                title: c.l.MEMBERS,
                                description: "Manage members, roles and duties.",
                                image: "leaders-basecamp/leaders-members.svg",
                                route: n.MEMBERS,
                                link: "",
                                roles: [this.$storeUser.hasRoleGroupLeader, this.$storeUser.hasDutyAdultLeader]
                            }, {
                                title: c.l.YOUTH_BASECAMP,
                                description: "View the Achievement Pathways of the program.",
                                image: "leaders-basecamp/leaders-youthbasecamp.svg",
                                route: n.BASECAMP_YOUTH,
                                link: "",
                                roles: [this.$storeUser.hasRoleGroupLeaderNoUnit, this.$storeUser.hasDutyAdultLeader, this.$storeUser.hasRoleSupportLeaderReadOrWrite]
                            }, {
                                title: c.l.APPROVALS,
                                description: "Manage Achievement Pathway submissions.",
                                image: "leaders-basecamp/leaders-approvals.svg",
                                route: n.APPROVALS,
                                link: "",
                                roles: [this.$storeUser.hasRoleUnitCouncil]
                            }]
                        }
                    },
                    created() {
                        this.$accessor.global.setBreadcrumbs([{
                            text: c.l.BASECAMP,
                            to: n.BASECAMP,
                            exact: !0,
                            disabled: !0
                        }])
                    },
                    mounted() {
                        setTimeout(() => {
                            this.$data.isReady = !0
                        }, 500), setTimeout(() => {
                            this.$data.applyStyleFix = !0
                        }, 1e3)
                    }
                }),
                v = (t(1208), t(9)),
                component = Object(v.a)(d, (function() {
                    var e = this,
                        r = e._self._c;
                    e._self._setupProxy;
                    return r("div", {
                        directives: [{
                            name: "show",
                            rawName: "v-show",
                            value: e.isReady,
                            expression: "isReady"
                        }],
                        staticClass: "BasecampLeaders"
                    }, [e._l(e.pageItems, (function(n, c) {
                        return [e.hasNavPermission(n.roles) && e.offlineToggle(n.route) ? r("div", {
                            key: c,
                            staticClass: "BasecampLeaders__item",
                            class: {
                                "BasecampLeader__item--hover-fix": e.applyStyleFix
                            },
                            style: "--animation-order: " + c,
                            on: {
                                click: function(r) {
                                    return e.$router.push({
                                        path: n.route
                                    })
                                },
                                keydown: function(r) {
                                    return e.$router.push({
                                        path: n.route
                                    })
                                }
                            }
                        }, [r("div", {
                            staticClass: "BasecampLeaders__text-container"
                        }, [r("div", {
                            staticClass: "BasecampLeaders__title"
                        }, [e._v(e._s(n.title))]), e._v(" "), r("div", {
                            staticClass: "BasecampLeaders__description"
                        }, [e._v(e._s(n.description))]), e._v(" "), n.link ? r("nuxt-link", {
                            attrs: {
                                to: n.link
                            }
                        }, [r(o.a, {
                            staticClass: "pl-0",
                            attrs: {
                                small: "",
                                text: ""
                            }
                        }, [r("Icon", {
                            attrs: {
                                name: "resource",
                                label: e.LABEL.GO,
                                "force-show-label": !0,
                                size: "small",
                                outline: ""
                            }
                        })], 1)], 1) : e._e()], 1), e._v(" "), r("img", {
                            directives: [{
                                name: "img-fallback",
                                rawName: "v-img-fallback",
                                value: e.imgFallback,
                                expression: "imgFallback"
                            }],
                            staticClass: "BasecampLeaders__image",
                            attrs: {
                                src: t(966)("./" + n.image),
                                alt: n.description
                            }
                        })]) : e._e()]
                    }))], 2)
                }), [], !1, null, "7b649138", null);
            r.default = component.exports;
            installComponents(component, {
                Icon: t(55).default
            })
        },
        1443: function(e, r, t) {
            "use strict";
            t.r(r);
            var o = t(59).a.extend({
                    name: "BasecampPage",
                    data: () => ({
                        isReady: !1
                    }),
                    created() {
                        this.$accessor.global.isAdultViewingYouthBasecamp ? this.$accessor.global.setBasecampLeaders(!1) : this.$storeUser.hasAnySupportLeaderRole ? this.$accessor.global.setBasecampLeaders(!0) : this.$storeUser.hasUnit ? this.$storeUser.hasDutyAdultLeader ? this.$accessor.global.setBasecampLeaders(!0) : this.$storeUser.hasRoleAchWrite ? this.$accessor.global.setBasecampLeaders(!1) : this.redirectUserNoAchievementWrite() : this.$storeUser.hasRoleGroupLeader ? this.$accessor.global.setBasecampLeaders(!0) : this.redirectUserNoUnit()
                    },
                    mounted() {
                        setTimeout(() => {
                            this.isReady = !0
                        }, 500)
                    }
                }),
                n = t(9),
                component = Object(n.a)(o, (function() {
                    var e = this._self._c;
                    this._self._setupProxy;
                    return this.$accessor.global.isBasecampLeaders ? e("BasecampLeaders") : this.isReady ? e("BasecampYouth") : this._e()
                }), [], !1, null, null, null);
            r.default = component.exports;
            installComponents(component, {
                BasecampLeaders: t(1319).default,
                BasecampYouth: t(1416).default
            })
        },
        966: function(e, r, t) {
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
                var r = n(e);
                return t(r)
            }

            function n(e) {
                if (!t.o(map, e)) {
                    var r = new Error("Cannot find module '" + e + "'");
                    throw r.code = "MODULE_NOT_FOUND", r
                }
                return map[e]
            }
            o.keys = function() {
                return Object.keys(map)
            }, o.resolve = n, e.exports = o, o.id = 966
        },
        967: function(e, r, t) {
            e.exports = t.p + "img/terrain-anim-sm.--562ebd4.gif"
        },
        968: function(e, r, t) {
            e.exports = t.p + "img/terrain-anim.--b22f1d6.gif"
        }
    }
]);