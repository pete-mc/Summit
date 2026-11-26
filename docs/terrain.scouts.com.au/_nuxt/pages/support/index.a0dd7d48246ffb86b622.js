(window.webpackJsonp = window.webpackJsonp || []).push([
    [229], {
        1290: function(t, e, n) {
            t.exports = {}
        },
        1391: function(t, e, n) {
            "use strict";
            n(1290)
        },
        1460: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(870),
                r = n(243),
                _ = n(5),
                l = n(3),
                c = n(27).a.extend({
                    name: "SupportPage",
                    layout: t => t.$config.adminEnabled ? "admin" : "default",
                    data: () => ({
                        NAV_LABEL: _.l,
                        EXTERNAL_LINKS: _.h,
                        videoThumbnail: {
                            webp: "/images/support-youtube-thumbnail/thumbnail.webp",
                            jpg: "/images/support-youtube-thumbnail/thumbnail.jpg"
                        }
                    }),
                    created() {
                        this.$accessor.global.setBreadcrumbs([{
                            text: _.l.SUPPORT,
                            to: l.SUPPORT,
                            exact: !0,
                            disabled: !0
                        }])
                    },
                    methods: {
                        btnScoutsTerrainClick() {
                            this.openLinkNewTab(_.h.TERRAIN_GUIDES)
                        },
                        btnFAQClick() {
                            this.openLinkNewTab(_.h.FREQUENTLY_ASKED_QUESTIONS)
                        },
                        btnFacebookClick() {
                            this.openLinkNewTab(_.h.TERRAIN_FACEBOOK)
                        }
                    }
                }),
                v = (n(1391), n(9)),
                component = Object(v.a)(c, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "SupportPage"
                    }, [t._m(0), t._v(" "), e("div", {
                        staticClass: "SupportPage__section"
                    }, [e("h3", {
                        staticClass: "SupportPage__subtitle"
                    }, [t._v("Get hold of resources to help you use Scouts | Terrain:")]), t._v(" "), e(o.a, {
                        attrs: {
                            disabled: t.$nuxt.isOffline,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.btnScoutsTerrainClick()
                            }
                        }
                    }, [t._v("Scouts | Terrain Guides")])], 1), t._v(" "), e("div", {
                        staticClass: "SupportPage__section"
                    }, [e("h3", {
                        staticClass: "SupportPage__subtitle"
                    }, [t._v("Offline access FAQ")]), t._v(" "), t._m(1), t._v(" "), e("p", [t._v("\n      A. To save an offline copy of any page simply visit the content at least once while you are online. Every time\n      you re-visit the page while online the saved copy will synchronize, ensuring you always have the most up-to-date\n      copy for offline use.\n    ")]), t._v(" "), e("p", [t._v("Note: Please avoid clearing your browser cache in order to retain your saved offline content.")]), t._v(" "), t._m(2), t._v(" "), e("p", [t._v("A. Below are a list of pages Scouts | Terrain supports with limited functionality while offline:")]), t._v(" "), e("ul", [t._m(3), t._v(" "), t._m(4), t._v(" "), t._m(5), t._v(" "), e("li", [t._v("Additional Awards")]), t._v(" "), t.$accessor.user.hasRoleUnitCouncil ? e("li", [t._v("\n        Members\n        "), t._m(6)]) : t._e()]), t._v(" "), t._m(7), t._v(" "), e("p", [t._v("A. No, Scouts | Terrain does not support offline editing at this time.")])]), t._v(" "), t.$nuxt.isOnline ? e(r.a) : t._e(), t._v(" "), t.$nuxt.isOnline ? e("div", {
                        staticClass: "SupportPage__section"
                    }, [e("h3", {
                        staticClass: "SupportPage__subtitle"
                    }, [t._v("\n      Here are some videos that might help you navigate different parts of the system:\n    ")]), t._v(" "), e("LazyYoutubeVideo", {
                        staticClass: "SupportPage__youtube-playlist",
                        attrs: {
                            src: "https://www.youtube-nocookie.com/embed/videoseries?list=PLY7DEjGy2eSiiXXhZM9gOlEsn3nQ_2Ykk",
                            thumbnail: t.videoThumbnail
                        }
                    })], 1) : t._e(), t._v(" "), e(r.a), t._v(" "), e("div", {
                        staticClass: "SupportPage__section"
                    }, [e("h3", {
                        staticClass: "SupportPage__subtitle"
                    }, [t._v("These don't cover what you are looking for?")]), t._v(" "), e("p", {
                        staticClass: "SupportPage__body"
                    }, [t._v("Have a look at our FAQs")]), t._v(" "), e(o.a, {
                        attrs: {
                            disabled: t.$nuxt.isOffline,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.btnFAQClick()
                            }
                        }
                    }, [t._v("Frequently Asked Questions")]), t._v(" "), e("p", {
                        staticClass: "SupportPage__body"
                    }, [t._v("Have you visited the Scouts | Terrain User Community on Facebook")]), t._v(" "), e(o.a, {
                        attrs: {
                            disabled: t.$nuxt.isOffline,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.btnFacebookClick()
                            }
                        }
                    }, [t._v("\n      Visit Facebook User Community\n    ")])], 1), t._v(" "), e(r.a), t._v(" "), t._m(8), t._v(" "), e(r.a), t._v(" "), e("div", {
                        staticClass: "SupportPage__section"
                    }, [e("h3", {
                        staticClass: "SupportPage__subtitle"
                    }, [t._v("Policies")]), t._v(" "), e("a", {
                        attrs: {
                            href: t.EXTERNAL_LINKS.PRIVACY_POLICY,
                            target: "_blank",
                            rel: "noopener noreferrer"
                        }
                    }, [t._v("\n      " + t._s(t.NAV_LABEL.PRIVACY_POLICY) + "\n    ")]), t._v(" "), e("a", {
                        attrs: {
                            href: t.EXTERNAL_LINKS.CHILD_PROTECTION_POLICY,
                            target: "_blank",
                            rel: "noopener noreferrer"
                        }
                    }, [t._v("\n      Child Protection Policy\n    ")])])], 1)
                }), [function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("div", {
                        staticClass: "SupportPage__section"
                    }, [t("h1", {
                        staticClass: "SupportPage__title"
                    }, [this._v("\n      Thank you for reaching out for support.\n      "), t("br"), this._v("\n      How can we help you?\n    ")])])
                }, function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("p", [t("strong", [this._v("Q. How do I access content offline?")])])
                }, function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("p", [t("strong", [this._v("Q. What content is available offline?")])])
                }, function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("li", [this._v("\n        Basecamp\n        "), t("ul", [t("li", [this._v("Basecamp will be limited to your current section and its Achievement Pathways.")])])])
                }, function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("li", [this._v("\n        Programming\n        "), t("ul", [t("li", [this._v("View activities in the current month's calendar")]), this._v(" "), t("li", [this._v("View a planned activity")])])])
                }, function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("li", [this._v("\n        Achievement Pathways\n        "), t("ul", [t("li", [this._v("View any requirements")]), this._v(" "), t("li", [this._v("View any saved submissions (editing and saving disabled)")])])])
                }, function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("ul", [t("li", [this._v("View list of Group member")]), this._v(" "), t("li", [this._v("View list of Units and a specific Unit's members")]), this._v(" "), t("li", [this._v("View list of Patrols")])])
                }, function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("p", [t("strong", [this._v("Q. Can I edit and save my achievements?")])])
                }, function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("div", {
                        staticClass: "SupportPage__section"
                    }, [t("h3", {
                        staticClass: "SupportPage__subtitle"
                    }, [this._v("Have you got a different issue?")]), this._v(" "), t("p", {
                        staticClass: "SupportPage__body"
                    }, [this._v("\n      Please lodge a support request using the Help form by clicking the Help button while online.\n    ")])])
                }], !1, null, "508d766c", null);
            e.default = component.exports
        }
    }
]);