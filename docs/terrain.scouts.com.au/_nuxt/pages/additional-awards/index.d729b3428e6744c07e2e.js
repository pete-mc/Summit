(window.webpackJsonp = window.webpackJsonp || []).push([
    [178], {
        1440: function(t, d, e) {
            "use strict";
            e.r(d);
            var l = e(1314),
                n = e(40),
                A = e(5),
                o = e(3),
                r = n.b.extend({
                    name: "AdditionalAwards",
                    components: {
                        AdditionalAwardsList: l.default
                    },
                    created() {
                        this.$accessor.global.setBreadcrumbs([{
                            text: A.l.ADDITIONAL_AWARDS,
                            to: o.ADDITIONAL_AWARDS,
                            exact: !0,
                            disabled: !1
                        }, {
                            text: A.l.OVERVIEW,
                            to: o.ADDITIONAL_AWARDS,
                            exact: !0,
                            disabled: !0
                        }])
                    }
                }),
                c = e(9),
                component = Object(c.a)(r, (function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("div", {
                        staticClass: "AdditionalAwards"
                    }, [t("AdditionalAwardsList", {
                        attrs: {
                            title: "Additional Awards",
                            filename: "specifications"
                        }
                    }), this._v(" "), t("AdditionalAwardsList", {
                        attrs: {
                            title: "Historic Awards",
                            filename: "historic-awards"
                        }
                    })], 1)
                }), [], !1, null, "73c23666", null);
            d.default = component.exports;
            installComponents(component, {
                AdditionalAwardsList: e(1314).default
            })
        }
    }
]);