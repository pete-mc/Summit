(window.webpackJsonp = window.webpackJsonp || []).push([
    [207], {
        1478: function(t, e, n) {
            "use strict";
            n.r(e);
            var r = n(40),
                c = n(5),
                o = n(3),
                d = n(1425),
                h = r.n.extend({
                    name: "MembersUnitsPage",
                    components: {
                        MembersUnitTable: d.default
                    },
                    data: () => ({
                        unitData: {},
                        isReady: !1
                    }),
                    beforeRouteLeave(t, e, n) {
                        t.params.defaultTab = 1, n()
                    },
                    async created() {
                        await this.initData(), this.$accessor.global.setBreadcrumbs([{
                            text: c.l.MEMBERS,
                            to: o.MEMBERS,
                            exact: !0
                        }, {
                            text: c.l.UNITS,
                            to: o.MEMBERS,
                            exact: !0
                        }, {
                            text: this.unitData.name,
                            to: "",
                            disabled: !0
                        }]), this.isReady = !0
                    },
                    methods: {
                        async initData() {
                            this.unitData = this.$accessor.me.getCurrentUnit;
                            const t = await this.getUnitMembers(this.unitData.id);
                            this.$accessor.me.setUnitMembersData(t)
                        }
                    }
                }),
                l = n(9),
                component = Object(l.a)(h, (function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return this.isReady ? t("MembersUnitTable", {
                        attrs: {
                            "table-data": this.$accessor.me.getUnitMembersData,
                            "unit-data": this.unitData
                        }
                    }) : this._e()
                }), [], !1, null, "73c88bc2", null);
            e.default = component.exports
        }
    }
]);