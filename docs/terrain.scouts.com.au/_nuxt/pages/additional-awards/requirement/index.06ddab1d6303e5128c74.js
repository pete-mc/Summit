(window.webpackJsonp = window.webpackJsonp || []).push([
    [179], {
        1293: function(t, e, r) {
            t.exports = {}
        },
        1394: function(t, e, r) {
            "use strict";
            r(1293)
        },
        1463: function(t, e, r) {
            "use strict";
            r.r(e);
            var d = r(870),
                o = r(886),
                n = r(885),
                A = r(1),
                l = r(5),
                c = r(3),
                _ = A.a.extend({
                    name: "AdditionalAwardsRequirement",
                    data: () => ({
                        LABEL: l.i,
                        PATH: c,
                        award: {}
                    }),
                    created() {
                        this.$accessor.global.setBreadcrumbs([{
                            text: l.l.ADDITIONAL_AWARDS,
                            to: c.ADDITIONAL_AWARDS,
                            exact: !0,
                            disabled: !1
                        }, {
                            text: l.l.VIEW_REQUIREMENT,
                            to: c.ADDITIONAL_AWARDS_REQUIREMENT,
                            exact: !0,
                            disabled: !0
                        }])
                    },
                    mounted() {
                        this.$route.params.award ? this.award = this.$route.params.award : this.$router.push({
                            path: c.ADDITIONAL_AWARDS
                        })
                    }
                }),
                w = (r(1394), r(9)),
                component = Object(w.a)(_, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "AdditionalAwardsRequirement"
                    }, [e(n.a, [e(o.a, {
                        attrs: {
                            cols: "12",
                            sm: "6"
                        }
                    }, [e("h1", {
                        staticClass: "AdditionalAwardsRequirement__title"
                    }, [t._v(t._s(t.award.title))])])], 1), t._v(" "), e(n.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(o.a, [t.award.description ? e("VueShowdown", {
                        attrs: {
                            markdown: t.award.description
                        }
                    }) : t._e()], 1)], 1), t._v(" "), e("hr"), t._v(" "), e("nuxt-link", {
                        staticClass: "mb-4",
                        attrs: {
                            to: t.PATH.ADDITIONAL_AWARDS
                        }
                    }, [e(d.a, {
                        staticClass: "float-right",
                        attrs: {
                            block: t.$vuetify.breakpoint.xs
                        }
                    }, [t._v(t._s(t.LABEL.OKAY))])], 1)], 1)
                }), [], !1, null, "47031332", null);
            e.default = component.exports
        }
    }
]);