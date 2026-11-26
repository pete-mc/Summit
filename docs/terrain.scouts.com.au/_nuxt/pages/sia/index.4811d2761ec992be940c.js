(window.webpackJsonp = window.webpackJsonp || []).push([
    [226], {
        1459: function(t, e, r) {
            "use strict";
            r.r(e);
            var n = r(40),
                l = r(4),
                o = r(5),
                d = r(3),
                c = n.C.extend({
                    name: "SiaPage",
                    data: () => ({
                        templateData: {},
                        isReady: !1
                    }),
                    async created() {
                        this.$accessor.global.setBreadcrumbs([{
                            text: o.l.SIA,
                            to: d.SIA,
                            exact: !0,
                            disabled: !0
                        }]);
                        try {
                            this.$data.templateData = await this.getOverviewData(l.SIA_PATH)
                        } catch (t) {
                            if (this.$nuxt.isOffline) return this.$nuxt.error({
                                statusCode: 503,
                                message: ""
                            });
                            throw new Error(t)
                        }
                        await this.loadList(), this.$data.isReady = !0
                    }
                }),
                h = r(9),
                component = Object(h.a)(c, (function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return this.isReady ? t("SiaOverview", {
                        attrs: {
                            "overview-template": this.templateData
                        }
                    }) : this._e()
                }), [], !1, null, null, null);
            e.default = component.exports;
            installComponents(component, {
                SiaOverview: r(1423).default
            })
        }
    }
]);