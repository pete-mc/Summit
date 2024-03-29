(window.webpackJsonp = window.webpackJsonp || []).push([
    [214], {
        1456: function(e, t, r) {
            "use strict";
            r.r(t);
            var n = r(40),
                l = r(3),
                o = r(4),
                c = r(5),
                d = n.u.extend({
                    name: "PersonalDevelopmentPage",
                    data: () => ({
                        templateData: {},
                        isReady: !1
                    }),
                    async created() {
                        this.$accessor.global.setBreadcrumbs([{
                            text: c.l.PERSONAL_DEV_UNIT_MANAGEMENT,
                            to: l.PERSONAL_DEVELOPMENT,
                            exact: !0,
                            disabled: !0
                        }]), this.$accessor.personalDevelopment.resetState();
                        try {
                            this.$data.templateData = await this.getOverviewData(o.PERSONAL_DEVELOPMENT_PATH)
                        } catch (e) {
                            if (this.$nuxt.isOffline) return this.$nuxt.error({
                                statusCode: 503,
                                message: ""
                            });
                            throw new Error(e)
                        }
                        await this.loadList(), this.$data.isReady = !0
                    }
                }),
                h = r(9),
                component = Object(h.a)(d, (function() {
                    var e = this._self._c;
                    this._self._setupProxy;
                    return this.isReady ? e("PersonalDevelopmentOverview", {
                        attrs: {
                            "overview-template": this.templateData
                        }
                    }) : this._e()
                }), [], !1, null, null, null);
            t.default = component.exports;
            installComponents(component, {
                PersonalDevelopmentOverview: r(1421).default
            })
        }
    }
]);