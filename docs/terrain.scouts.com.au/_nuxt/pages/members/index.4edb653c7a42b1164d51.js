(window.webpackJsonp = window.webpackJsonp || []).push([
    [204], {
        1452: function(e, t, r) {
            "use strict";
            r.r(t);
            var o = r(40),
                d = r(5),
                n = r(3),
                h = r(1417),
                l = o.n.extend({
                    name: "MembersPage",
                    components: {
                        MembersOverview: h.default
                    },
                    data: () => ({
                        defaultTab: 0,
                        isReady: !1
                    }),
                    computed: {
                        defaultBreadcrumb() {
                            return 1 === this.defaultTab ? "Unit" : "Group"
                        }
                    },
                    asyncData(e) {
                        let {
                            route: t
                        } = e;
                        return {
                            defaultTab: t.params.defaultTab || 0
                        }
                    },
                    async created() {
                        if (this.$accessor.global.setBreadcrumbs([{
                                text: d.l.MEMBERS,
                                to: n.MEMBERS,
                                exact: !1,
                                disabled: !0
                            }, {
                                text: this.defaultBreadcrumb,
                                to: n.MEMBERS,
                                exact: !0,
                                disabled: !0
                            }]), !(this.$storeUser.hasRoleGroupLeader || this.$storeUser.hasRoleUnitLeader || this.$storeUser.hasDutyAdultLeader || this.$storeUser.hasRoleSupportLeaderReadOrWrite)) return this.$nuxt.error({
                            statusCode: 404,
                            message: ""
                        });
                        if (this.$accessor.me.resetData(), this.$storeUser.hasRoleGroupLeader || this.$storeUser.hasRoleSupportLeaderReadOrWrite) try {
                            this.getAndSetGroupMembers(), this.getAndSetGroupUnits(this.$accessor.user.getGroupId), await this.getAndSetGroupPatrols()
                        } catch (e) {
                            if (this.$nuxt.isOffline) return this.$nuxt.error({
                                statusCode: 503,
                                message: ""
                            });
                            throw new Error(e)
                        } else this.$accessor.me.setGroupUnitsData([this.$accessor.user.getUnit]);
                        this.$data.isReady = !0
                    }
                }),
                c = r(9),
                component = Object(c.a)(l, (function() {
                    var e = this._self._c;
                    this._self._setupProxy;
                    return this.isReady ? e("MembersOverview", {
                        attrs: {
                            "default-tab": this.defaultTab
                        }
                    }) : this._e()
                }), [], !1, null, "63f545b4", null);
            t.default = component.exports
        }
    }
]);