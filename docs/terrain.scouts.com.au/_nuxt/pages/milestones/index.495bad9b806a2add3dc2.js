(window.webpackJsonp = window.webpackJsonp || []).push([
    [208], {
        1453: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(40),
                l = n(5),
                r = n(3),
                c = n(4),
                d = o.p.extend({
                    name: "MilestonesPage",
                    data: () => ({
                        milestonesSectionData: [],
                        requestPending: !1,
                        templateData: {},
                        isReady: !1
                    }),
                    async created() {
                        this.$accessor.global.setBreadcrumbs([{
                            text: l.l.MILESTONES,
                            to: r.MILESTONES,
                            exact: !0,
                            disabled: !0
                        }]), this.$accessor.milestones.resetState();
                        try {
                            this.$data.templateData = await this.getOverviewData(c.MILESTONE_PATH)
                        } catch (t) {
                            if (this.$nuxt.isOffline) return this.$nuxt.error({
                                statusCode: 503,
                                message: ""
                            });
                            throw new Error(t)
                        }
                        await this.loadList(), await this.loadTemplate(), this.$data.milestonesSectionData = this.$accessor.milestones.getList.filter(t => t.section === this.$accessor.global.getAppSection), this.$data.isReady = !0
                    }
                }),
                h = n(9),
                component = Object(h.a)(d, (function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return this.isReady ? t("Milestones", {
                        attrs: {
                            "milestones-data": this.milestonesSectionData,
                            "overview-template": this.templateData
                        }
                    }) : this._e()
                }), [], !1, null, "4f077152", null);
            e.default = component.exports;
            installComponents(component, {
                Milestones: n(1419).default
            })
        }
    }
]);