(window.webpackJsonp = window.webpackJsonp || []).push([
    [230], {
        1291: function(t, e, n) {
            t.exports = {}
        },
        1392: function(t, e, n) {
            "use strict";
            n(1291)
        },
        1461: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(1),
                d = n(5),
                r = n(3),
                c = o.a.extend({
                    name: "TermsAndConditionsPage",
                    created() {
                        this.$accessor.global.setBreadcrumbs([{
                            text: d.l.TERMS_AND_CONDITIONS,
                            to: r.TERMS_AND_CONDITIONS,
                            exact: !0,
                            disabled: !0
                        }])
                    }
                }),
                l = (n(1392), n(9)),
                component = Object(l.a)(c, (function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("div", {
                        staticClass: "TermsAndConditions"
                    }, [t("h1", {
                        staticClass: "PageHeader__title"
                    }, [this._v("Terms & Conditions")]), this._v(" "), t("TermsAndConditionsContent")], 1)
                }), [], !1, null, "4c21e834", null);
            e.default = component.exports;
            installComponents(component, {
                TermsAndConditionsContent: n(233).default
            })
        }
    }
]);