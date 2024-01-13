(window.webpackJsonp = window.webpackJsonp || []).push([
    [180], {
        1441: function(t, e, r) {
            "use strict";
            r.r(e);
            var n = r(40),
                o = r(4),
                l = r(5),
                d = r(3),
                c = n.j.extend({
                    name: "AdventurousJourneyOverviewPage",
                    data: () => ({
                        templateData: {},
                        isReady: !1
                    }),
                    async created() {
                        this.$accessor.global.setBreadcrumbs([{
                            text: l.l.ADVENTUROUS_JOURNEY,
                            to: d.ADVENTUROUS_JOURNEY,
                            exact: !0,
                            disabled: !0
                        }]), this.$accessor.aj.resetState();
                        try {
                            this.$data.templateData = await this.getOverviewData(o.ADVENTUROUS_JOURNEY_PATH)
                        } catch (t) {
                            if (this.$nuxt.isOffline) return this.$nuxt.error({
                                statusCode: 503,
                                message: ""
                            });
                            throw new Error(t)
                        }
                        this.loadList(), this.$data.isReady = !0
                    }
                }),
                h = r(9),
                component = Object(h.a)(c, (function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("div", {
                        class: this.$options.name
                    }, [this.isReady ? t("AdventurousJourneyOverview", {
                        attrs: {
                            "overview-template": this.templateData
                        }
                    }) : this._e()], 1)
                }), [], !1, null, null, null);
            e.default = component.exports;
            installComponents(component, {
                AdventurousJourneyOverview: r(1415).default
            })
        }
    }
]);