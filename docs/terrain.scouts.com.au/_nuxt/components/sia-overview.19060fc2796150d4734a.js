(window.webpackJsonp = window.webpackJsonp || []).push([
    [28, 54, 55, 56, 82, 85, 88], {
        1001: function(e, t, r) {
            "use strict";
            r(969)
        },
        1183: function(e, t, r) {
            e.exports = {}
        },
        1234: function(e, t, r) {
            "use strict";
            r(1183)
        },
        1289: function(e, t, r) {
            e.exports = {}
        },
        1341: function(e, t, r) {
            "use strict";
            r.r(t);
            var o = r(870),
                n = r(236),
                c = r(886),
                l = r(172),
                v = r(885),
                d = r(1),
                m = r(287),
                _ = d.a.extend({
                    name: "SiaDoCard",
                    props: {
                        project: {
                            type: Object,
                            required: !0
                        },
                        iconFunc: {
                            type: Function,
                            default: () => {}
                        },
                        viewFunc: {
                            type: Function,
                            default: null
                        },
                        reviewFunc: {
                            type: Function,
                            default: null
                        }
                    },
                    computed: {
                        viewIcon: () => `${m.OUTLINE_PATH}/${m.OUTLINE.view}`,
                        reviewIcon: () => `${m.OUTLINE_PATH}/${m.OUTLINE.review}`
                    },
                    methods: {
                        fetchIcon: path => path ? r(987)(`./icons${path}.svg`) : ""
                    }
                }),
                f = (r(1234), r(9)),
                component = Object(f.a)(_, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t(n.a, {
                        staticClass: "SiaDoCard px-6 pt-5 pb-4 mb-4"
                    }, [t(v.a, {
                        staticClass: "flex-nowrap no-gutters",
                        attrs: {
                            align: "start",
                            justify: "space-between"
                        }
                    }, [t(c.a, {
                        staticClass: "d-flex justify-space-between"
                    }, [t("div", {
                        staticClass: "SiaDoCard__title"
                    }, [e._v(e._s(e.project.answers.project_name))]), e._v(" "), t(l.a, {
                        staticClass: "SiaDoCard__icon mt-1 ml-4",
                        attrs: {
                            src: e.fetchIcon(e.iconFunc(e.project)),
                            alt: e.project.answers.project_name,
                            width: "48",
                            height: "48"
                        }
                    })], 1)], 1), e._v(" "), t(v.a, {
                        staticClass: "mt-2 d-flex align-start",
                        staticStyle: {
                            "max-height": "36px"
                        },
                        attrs: {
                            "no-gutters": "",
                            align: "center"
                        }
                    }, [t(c.a, {
                        staticClass: "d-flex"
                    }, [t(o.a, {
                        staticClass: "SiaDoCard__action",
                        attrs: {
                            text: ""
                        },
                        on: {
                            click: function(t) {
                                return e.viewFunc(e.project)
                            }
                        }
                    }, [t(l.a, {
                        attrs: {
                            src: e.fetchIcon(e.viewIcon),
                            alt: "View project",
                            width: "16",
                            height: "16"
                        }
                    }), e._v(" "), t("span", {
                        staticClass: "ml-2"
                    }, [e._v("View")])], 1), e._v(" "), t(o.a, {
                        staticClass: "SiaDoCard__action",
                        attrs: {
                            disabled: e.$nuxt.isOffline,
                            text: ""
                        },
                        on: {
                            click: function(t) {
                                return e.reviewFunc(e.project)
                            }
                        }
                    }, [t("img", {
                        attrs: {
                            src: e.fetchIcon(e.reviewIcon),
                            alt: "Review SIA",
                            width: "16",
                            height: "16"
                        }
                    }), e._v(" "), t("span", {
                        staticClass: "ml-2"
                    }, [e._v("Review")])])], 1)], 1)], 1)
                }), [], !1, null, "282f0b5a", null);
            t.default = component.exports
        },
        1390: function(e, t, r) {
            "use strict";
            r(1289)
        },
        1423: function(e, t, r) {
            "use strict";
            r.r(t);
            var o = r(870),
                n = r(885),
                c = r(40),
                l = r(10),
                v = r(908),
                d = r(287),
                m = r(5),
                _ = r(3),
                f = r(962),
                w = c.C.extend({
                    name: "SiaOverview",
                    components: {
                        InfoDialogCard: f.default
                    },
                    data: () => ({
                        ICONS: d,
                        SIA_IMAGE_NAMES: v.j,
                        LABEL: m.i,
                        deleteModal: !1,
                        projectToDelete: {}
                    }),
                    async created() {
                        await this.loadTemplate(), this.$accessor.global.setBreadcrumbs([{
                            text: m.l.SIA,
                            to: _.SIA,
                            exact: !0,
                            disabled: !0
                        }])
                    },
                    computed: {
                        isReady() {
                            return void 0 !== this.$accessor.sia.getTemplate.document
                        },
                        getOverviewImage: () => v.j.overview + ".svg",
                        deleteConfirmationSubtitle() {
                            return `You will not be able to edit or submit ${this.$data.projectToDelete.answers&&this.$data.projectToDelete.answers.project_name?'the project "'+this.$data.projectToDelete.answers.project_name+'"':"this project"} after it has been deleted.`
                        },
                        inProgressProjects() {
                            return this.$accessor.sia.getSiaList.filter(p => p.status === l.a.IN_PROGRESS)
                        },
                        description() {
                            return this.overviewTemplate.description.label
                        },
                        canCreateOrView() {
                            return this.profileSectionEqualsAppSection
                        }
                    },
                    methods: {
                        confirmDelete(e) {
                            this.deleteModal = !0, this.projectToDelete = e
                        },
                        deleteSiaProject() {
                            this.deleteModal = !1, this.deleteAchievement(this.projectToDelete.id)
                        },
                        getProjectTitle(e) {
                            var t;
                            return null === (t = e.answers) || void 0 === t ? void 0 : t.project_name
                        },
                        getProjectIconName(e) {
                            const input = this.$accessor.sia.getTemplate.document.reduce((e, t) => e.concat(t.input_groups), []).reduce((e, t) => e.concat(t.inputs), []).find(input => "special_interest_area_selection" === input.id);
                            if (!input) return "";
                            const t = input.selections.find(s => {
                                var t;
                                return s.id === (null === (t = e.answers) || void 0 === t ? void 0 : t.special_interest_area_selection)
                            });
                            return t ? `${this.ICONS.TEMPLATE_ASSETS_PATH}/${this.ICONS.TEMPLATE_ASSET_ICON_NAMES[t.asset]}${this.ICONS.DEFAULT_SUFFIX}` : ""
                        },
                        closeDialog() {
                            this.deleteModal = !1
                        }
                    }
                }),
                h = (r(1390), r(9)),
                component = Object(h.a)(w, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return e.isReady ? t("div", {
                        staticClass: "SiaOverview"
                    }, [t("nuxt-link", {
                        attrs: {
                            to: "/sia/requirements"
                        }
                    }), e._v(" "), t("BaseOverview", {
                        attrs: {
                            "has-awarded": e.hasAwardedForSection(),
                            "has-existing-submissions": e.hasExistingSubmissionsForSection(),
                            "image-path": e.getOverviewImage,
                            subtitle: e.overviewSubtitle,
                            title: e.overviewTitle,
                            "data-cy": "CREATE_PROJECT",
                            "create-function": e.newAchievement,
                            "is-sia": ""
                        }
                    }, [t("template", {
                        slot: "sub-description-side"
                    }, [t("BaseOverviewSubDescription", {
                        attrs: {
                            text: e.subDescription,
                            links: e.subDescriptionLinks,
                            "image-src": e.fetchImage(e.SIA_IMAGE_NAMES.side)
                        }
                    })], 1), e._v(" "), t("template", {
                        slot: "sub-description-small"
                    }, [e.$vuetify.breakpoint.mdAndDown && e.subDescriptionLinks.length ? t("InfoDialogCard", {
                        attrs: {
                            title: "About Special Interest Areas",
                            text: e.subDescription,
                            links: e.subDescriptionLinks,
                            "image-src": e.fetchImage(e.SIA_IMAGE_NAMES.side),
                            "image-alt": "Four Milestone challenge areas: Community Challenge, Outdoor Challenge, Creative Challenge, Personal Growth Challenge"
                        }
                    }) : e._e()], 1), e._v(" "), t("template", {
                        slot: "description"
                    }, [t("AchievementOverview", {
                        attrs: {
                            items: e.$accessor.sia.getSiaList,
                            "title-func": e.getProjectTitle,
                            "icon-func": e.getProjectIconName,
                            "edit-func": t => e.editAchievement(t.id),
                            "edit-review-func": t => e.reviewAchievement(t.id),
                            "view-func": t => e.editAchievement(t.id),
                            "view-review-func": t => e.reviewAchievement(t.id),
                            "delete-func": e.confirmDelete,
                            "is-sia": ""
                        }
                    }, [t("template", {
                        slot: "page-end"
                    }, [!e.hasExistingSubmissionsForSection() && e.profileSectionEqualsAppSection && e.$vuetify.breakpoint.smAndUp ? t("div", {
                        staticClass: "mb-4",
                        attrs: {
                            "data-cy": "qa-create-project"
                        }
                    }, [t("div", {
                        staticClass: "SiaOverview__description-title"
                    }, [e._v("Plan")]), e._v(" "), t("VueShowdown", {
                        staticClass: "VueShowdown VueShowdown--base-overview d-flex",
                        attrs: {
                            markdown: e.emptyState
                        }
                    })], 1) : e._e(), e._v(" "), e.canCreateOrView && e.$vuetify.breakpoint.mdAndUp ? t(o.a, {
                        staticClass: "mb-6",
                        attrs: {
                            disabled: e.$nuxt.isOffline,
                            rounded: "",
                            small: "",
                            height: "40px"
                        },
                        on: {
                            click: function(t) {
                                return t.stopPropagation(), e.newAchievement.apply(null, arguments)
                            }
                        }
                    }, [e._v("\n            " + e._s(e.isYouthMember ? "Create project" : "View requirements") + "\n          ")]) : e._e()], 1), e._v(" "), e.inProgressProjects.length && e.profileSectionEqualsAppSection && e.hasExistingSubmissionsForSection() ? t("template", {
                        slot: "in-progress"
                    }, [t(n.a, {
                        staticClass: "px-4",
                        attrs: {
                            justify: "space-between"
                        }
                    }, e._l(e.inProgressProjects, (function(r) {
                        return t("SiaDoCard", {
                            key: r.id,
                            attrs: {
                                project: r,
                                "icon-func": e.getProjectIconName,
                                "view-func": t => e.editAchievement(t.id),
                                "review-func": t => e.reviewAchievement(t.id)
                            }
                        })
                    })), 1)], 1) : e._e()], 2)], 1)], 2), e._v(" "), t("ConfirmationDialog", {
                        attrs: {
                            model: e.deleteModal,
                            title: "Delete Project?",
                            subtitle: e.deleteConfirmationSubtitle,
                            "confirm-button-label": e.LABEL.DELETE,
                            "close-button-label": e.LABEL.CANCEL,
                            "confirm-callback": e.deleteSiaProject,
                            "close-dialog": e.closeDialog
                        }
                    })], 1) : e._e()
                }), [], !1, null, null, null);
            t.default = component.exports;
            installComponents(component, {
                BaseOverviewSubDescription: r(963).default,
                InfoDialogCard: r(962).default,
                SiaDoCard: r(1341).default,
                AchievementOverview: r(974).default,
                BaseOverview: r(988).default,
                ConfirmationDialog: r(79).default
            })
        },
        908: function(e, t, r) {
            "use strict";
            r.d(t, "b", (function() {
                return o
            })), r.d(t, "c", (function() {
                return n
            })), r.d(t, "d", (function() {
                return c
            })), r.d(t, "e", (function() {
                return l
            })), r.d(t, "f", (function() {
                return v
            })), r.d(t, "g", (function() {
                return d
            })), r.d(t, "j", (function() {
                return m
            })), r.d(t, "a", (function() {
                return _
            })), r.d(t, "h", (function() {
                return f
            })), r.d(t, "i", (function() {
                return w
            }));
            const o = {
                    spices: "intro-scouting--spices",
                    plan_do_review: "intro-scouting--plan-do-review"
                },
                n = {
                    overview: "intro-scouting--overview",
                    side: "intro-scouting--side"
                },
                c = {
                    overview_joey: "intro-section/joey--overview",
                    overview_cub: "intro-section/cub--overview",
                    overview_scout: "intro-section/scout--overview",
                    overview_venturer: "intro-section/venturer--overview",
                    overview_rover: "intro-section/rover--overview",
                    side: "intro-section/intro-section--side"
                },
                l = new Map([
                    ["joey", c.overview_joey],
                    ["cub", c.overview_cub],
                    ["scout", c.overview_scout],
                    ["venturer", c.overview_venturer],
                    ["rover", c.overview_rover]
                ]),
                v = {
                    side: "milestones--side"
                },
                d = {
                    welcome: "oas--welcome",
                    side: "oas--side"
                },
                m = {
                    overview: "sia--overview",
                    welcome: "sia--welcome",
                    side: "sia--side"
                },
                _ = {
                    overview: "adventurous-journey--overview",
                    side: "adventurous-journey--side"
                },
                f = {
                    overview: "personal-development--overview",
                    side: "personal-development--side"
                },
                w = {
                    overview: "programming--overview"
                }
        },
        954: function(e, t, r) {
            e.exports = {}
        },
        955: function(e, t, r) {
            e.exports = {}
        },
        956: function(e, t, r) {
            e.exports = {}
        },
        962: function(e, t, r) {
            "use strict";
            r.r(t);
            var o = r(236),
                n = r(35),
                c = r(3),
                l = r(5),
                v = r(27).a.extend({
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
                        LABEL: l.i,
                        PATH: c,
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
                d = (r(985), r(9)),
                component = Object(d.a)(v, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t(o.a, {
                        staticClass: "InfoDialogCard"
                    }, [t(n.c, {
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
                Icon: r(55).default,
                ConfirmationDialog: r(79).default
            })
        },
        963: function(e, t, r) {
            "use strict";
            r.r(t);
            var o = r(236),
                n = r(35),
                c = r(3),
                l = r(27).a.extend({
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
                        PATH: c
                    }),
                    methods: {
                        getHref(e) {
                            return e.url ? e.url : e.path ? this.templateFilepath(e.path) : void 0
                        }
                    }
                }),
                v = (r(984), r(9)),
                component = Object(v.a)(l, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t(o.a, {
                        staticClass: "BaseOverviewSubDescription",
                        attrs: {
                            flat: ""
                        }
                    }, [t(n.c, [t("VueShowdown", {
                        attrs: {
                            markdown: e.text
                        }
                    }), e._v(" "), e.links ? e._l(e.links, (function(r, i) {
                        return t("div", {
                            key: i
                        }, [t("a", {
                            staticClass: "Link-alt",
                            attrs: {
                                href: e.getHref(r),
                                target: "_blank",
                                rel: "noopener noreferrer"
                            }
                        }, [e._v(e._s(r.text))])])
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
        966: function(e, t, r) {
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
                var t = n(e);
                return r(t)
            }

            function n(e) {
                if (!r.o(map, e)) {
                    var t = new Error("Cannot find module '" + e + "'");
                    throw t.code = "MODULE_NOT_FOUND", t
                }
                return map[e]
            }
            o.keys = function() {
                return Object.keys(map)
            }, o.resolve = n, e.exports = o, o.id = 966
        },
        967: function(e, t, r) {
            e.exports = r.p + "img/terrain-anim-sm.--562ebd4.gif"
        },
        968: function(e, t, r) {
            e.exports = r.p + "img/terrain-anim.--b22f1d6.gif"
        },
        969: function(e, t, r) {
            e.exports = {}
        },
        983: function(e, t, r) {
            "use strict";
            r(954)
        },
        984: function(e, t, r) {
            "use strict";
            r(955)
        },
        985: function(e, t, r) {
            "use strict";
            r(956)
        },
        988: function(e, t, r) {
            "use strict";
            r.r(t);
            var o = r(870),
                n = r(886),
                c = r(163),
                l = r(885),
                v = r(40),
                d = r(144),
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
                            return r(966)("./" + this.imagePath)
                        }
                    }
                }),
                _ = (r(1001), r(9)),
                component = Object(_.a)(m, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", {
                        staticClass: "BaseOverview"
                    }, [t(l.a, {
                        staticClass: "mt-0"
                    }, [t(n.a, {
                        staticClass: "pt-0",
                        attrs: {
                            cols: "12",
                            md: "8"
                        }
                    }, [t("section", {
                        staticClass: "BaseOverview__header"
                    }, [t(l.a, {
                        staticClass: "my-0"
                    }, [t(n.a, {
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
                    }, [e._v(e._s(e.subtitle))])]), e._v(" "), e._t("top-description")], 2), e._v(" "), t(n.a, {
                        staticClass: "BaseOverview__sub-description-container py-0",
                        attrs: {
                            cols: "12",
                            sm: "4",
                            md: "12"
                        }
                    }, [t("div", [e.$vuetify.breakpoint.smAndDown ? e._t("sub-description-small") : e._e()], 2)])], 1), e._v(" "), t(l.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(n.a, {
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
                    })], 1)], 1)], 1), e._v(" "), t(l.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(n.a, [e.profileSectionEqualsAppSection ? t("hr", {
                        staticClass: "BaseOverview__divider"
                    }) : e._e()])], 1), e._v(" "), e.isYouthMember && e.showNoAchievementsMessage ? t("BaseNoAchievements") : e._e(), e._v(" "), t("section", {
                        staticClass: "BaseOverview__main"
                    }, [t(l.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(n.a, [t("div", [e._t("before")], 2), e._v(" "), !e.isOas && e.$vuetify.breakpoint.mdAndUp && e.buttonTitle && e.canCreateOrView ? t(o.a, {
                        staticClass: "mb-2",
                        attrs: {
                            small: ""
                        },
                        on: {
                            click: e.createFunction
                        }
                    }, [e._v("\n              " + e._s(e.buttonTitle) + "\n            ")]) : e._e(), e._v(" "), e.$slots.description ? t("div", {
                        staticClass: "BaseOverview__body"
                    }, [e._t("description")], 2) : e._e(), e._v(" "), t("div", [e._t("page-end")], 2)], 1)], 1)], 1), e._v(" "), !e.isOas && e.showEmptyPlaceholderImage ? t(l.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(n.a, {
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
                    })])])], 1) : e._e()], 1), e._v(" "), e.$vuetify.breakpoint.mdAndUp ? t(n.a, {
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
                    }, [t(c.a, {
                        attrs: {
                            dark: ""
                        }
                    }, [e._v(e._s(e.isYouthMember ? "mdi-plus" : "mdi-magnify"))])], 1) : e._e()], 1)
                }), [], !1, null, "f0153bc0", null);
            t.default = component.exports;
            installComponents(component, {
                BaseNoAchievements: r(989).default
            })
        },
        989: function(e, t, r) {
            "use strict";
            r.r(t);
            var o = r(1).a.extend({
                    name: "BaseNoAchievements",
                    functional: !0
                }),
                n = (r(983), r(9)),
                component = Object(n.a)(o, (function(e, t) {
                    return e("div", {
                        staticClass: "BaseNoAchievements"
                    }, [e("div", {
                        staticClass: "BaseNoAchievements__empty"
                    }, [t._v("No achievements recorded.")]), t._v(" "), e("img", {
                        attrs: {
                            src: r(565),
                            alt: "No achievements recorded."
                        }
                    })])
                }), [], !0, null, null, null);
            t.default = component.exports
        }
    }
]);