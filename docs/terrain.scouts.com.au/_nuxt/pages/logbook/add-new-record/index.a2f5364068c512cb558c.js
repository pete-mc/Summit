(window.webpackJsonp = window.webpackJsonp || []).push([
    [197, 128], {
        1473: function(t, e, n) {
            "use strict";
            n.r(e);
            var r = n(5),
                l = n(3),
                o = {
                    name: "LogbookAddNewRecord",
                    data: () => ({
                        LABEL: r.i
                    }),
                    created() {
                        this.$accessor.global.setBreadcrumbs([{
                            text: r.l.MY_LOGBOOK,
                            to: l.LOGBOOK,
                            exact: !0,
                            disabled: !1
                        }, {
                            text: r.l.ADD_NEW_RECORD,
                            to: l.ADD_NEW_RECORD,
                            exact: !1,
                            disabled: !0
                        }])
                    }
                },
                _ = n(9),
                component = Object(_.a)(o, (function() {
                    var t = this._self._c;
                    return t("div", {
                        staticClass: "AddNewRecord"
                    }, [t("PageHeader", {
                        attrs: {
                            title: this.LABEL.ADD_NEW_RECORD,
                            subtitle: ""
                        }
                    }), this._v(" "), t("LogbookEntry")], 1)
                }), [], !1, null, null, null);
            e.default = component.exports;
            installComponents(component, {
                PageHeader: n(953).default,
                LogbookEntry: n(1345).default
            })
        },
        946: function(t, e, n) {
            t.exports = {}
        },
        953: function(t, e, n) {
            "use strict";
            n.r(e);
            var r = n(886),
                l = n(885),
                o = n(1).a.extend({
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
                _ = (n(959), n(9)),
                component = Object(_.a)(o, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("section", {
                        staticClass: "PageHeader"
                    }, [e(l.a, {
                        staticClass: "pt-0 align-center",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(r.a, {
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
                    }) : t._e()], 2), t._v(" "), e(l.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(r.a, {
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
        959: function(t, e, n) {
            "use strict";
            n(946)
        }
    }
]);