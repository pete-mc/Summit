(window.webpackJsonp = window.webpackJsonp || []).push([
    [212], {
        1454: function(t, e, r) {
            "use strict";
            r.r(e);
            var n = r(4),
                l = r(40),
                o = r(5),
                d = r(3),
                c = l.s.extend({
                    name: "OasPage",
                    data: () => ({
                        templateData: {},
                        isReady: !1
                    }),
                    async created() {
                        this.$accessor.global.setBreadcrumbs([{
                            text: o.l.OAS,
                            to: d.OAS,
                            exact: !0,
                            disabled: !1
                        }]);
                        try {
                            this.$data.templateData = await this.getOverviewData(n.OAS_PATH)
                        } catch (t) {
                            if (this.$nuxt.isOffline) return this.$nuxt.error({
                                statusCode: 503,
                                message: ""
                            });
                            throw new Error(t)
                        }
                        this.$data.isReady = !0
                    }
                }),
                h = r(9),
                component = Object(h.a)(c, (function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return this.isReady ? t("OasOverview", {
                        attrs: {
                            "overview-template": this.templateData
                        }
                    }) : this._e()
                }), [], !1, null, null, null);
            e.default = component.exports;
            installComponents(component, {
                OasOverview: r(1420).default
            })
        }
    }
]);