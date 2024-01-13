(window.webpackJsonp = window.webpackJsonp || []).push([
    [216], {
        1457: function(t, e, r) {
            "use strict";
            r.r(e);
            var n = r(886),
                l = r(885),
                o = r(40),
                c = r(3),
                d = r(4),
                h = r(5),
                w = o.v.extend({
                    name: "PersonalReflectionOverviewPage",
                    data: () => ({
                        templateData: {},
                        isReady: !1
                    }),
                    async created() {
                        this.$accessor.global.setBreadcrumbs([{
                            text: h.l.PERSONAL_REFLECTION,
                            to: c.PERSONAL_REFLECTION,
                            exact: !0,
                            disabled: !0
                        }]), this.$accessor.personalReflection.resetState();
                        try {
                            this.$data.templateData = await this.getOverviewData(d.PERSONAL_REFLECTION_PATH)
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
                v = r(9),
                component = Object(v.a)(w, (function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("div", {
                        class: this.$options.name
                    }, [t(l.a, {
                        staticClass: "mb-6",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(n.a, [this.isReady ? t("PersonalReflectionOverview", {
                        attrs: {
                            "overview-template": this.templateData
                        }
                    }) : this._e()], 1)], 1)], 1)
                }), [], !1, null, null, null);
            e.default = component.exports;
            installComponents(component, {
                PersonalReflectionOverview: r(1422).default
            })
        }
    }
]);