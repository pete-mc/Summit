(window.webpackJsonp = window.webpackJsonp || []).push([
    [211, 124], {
        1194: function(t, e, r) {
            t.exports = {}
        },
        1246: function(t, e, r) {
            "use strict";
            r(1194)
        },
        1353: function(t, e, r) {
            "use strict";
            r.r(e);
            var n = r(242),
                c = r(236),
                l = r(35),
                _ = r(886),
                o = r(885),
                m = r(1430),
                d = r(1431),
                h = r(1497),
                S = r(1370),
                v = r(100),
                O = r(1354),
                C = r(287),
                f = r(40),
                I = r(10),
                T = f.s.extend({
                    name: "OasStream",
                    components: {
                        NavLink: v.default,
                        StreamTree: O.default
                    },
                    props: {
                        streamTreeData: {
                            type: Object,
                            required: !0
                        }
                    },
                    data: () => ({
                        ACHIEVEMENT_STATUS: I.a,
                        paths: null,
                        uniqueStages: null,
                        checkedIcon: null,
                        inProgressIcon: null,
                        title: null,
                        streamId: null,
                        streamDescription: null,
                        streamName: null,
                        inProgress: !1,
                        completed: !1,
                        isReady: !1
                    }),
                    async created() {
                        0 === this.$accessor.oas.getOasList.length && await this.refreshOasAchievementsList(), this.isReady = !0, this.setStream(this.streamTreeData), this.paths = this.getAllPaths(this.streamTreeData.tree), this.streamDescription = this.streamTreeData.description, this.streamId = this.streamTreeData.stream_id, this.streamName = this.streamTreeData.title, this.title = this.streamTreeData.title, this.uniqueStages = this.getUniqueStages(this.streamTreeData.tree, {}), this.checkedIcon = this.fetchImage(C.ICON_ALERT_GREEN_CHECK), this.inProgressIcon = this.fetchImage(C.ICON_ALERT_BLUE_IN_PROGRESS)
                    },
                    methods: {
                        getStageStatus(path) {
                            const t = this.progressData().find(t => t.achievement_meta.stage === path.stage && t.achievement_meta.branch === path.branch_id);
                            return !!t && (t.status !== I.a.AWARDED || I.a.AWARDED)
                        },
                        progressData() {
                            return this.$accessor.oas.getOasList.filter(t => t.achievement_meta.stream === this.streamId)
                        },
                        setStream(t) {
                            if (!t.stream_id) return !1;
                            this.$accessor.oas.setCurrentStream(t.stream_id)
                        },
                        getAllPaths(t) {
                            if (0 === t.children.length) return [
                                [t]
                            ];
                            const e = [];
                            for (const r of t.children)
                                for (const path of this.getAllPaths(r)) e.push([t].concat(path));
                            return e
                        },
                        getUniqueStages(t, e) {
                            if (0 === t.children.length) return {};
                            if (1 === t.children.length && t.children[0].title === t.title) return this.getUniqueStages(t.children[0], e); {
                                const r = t.children[0].stage,
                                    n = t.children.map(e => (e.parent = t, e));
                                r in e ? t.title in e[r] ? e[r][t.title] = [...new Set(n.concat(e[r][t.title]))] : e[r][t.title] = n : (e[r] = {}, e[r][t.title] = n);
                                for (const r of t.children) this.getUniqueStages(r, e);
                                return e
                            }
                        },
                        fetchCardImage(image) {
                            const t = `icon--oas-${image}.svg`;
                            return r(903)("./" + t)
                        },
                        fetchImage: t => r(903)("./" + t)
                    }
                }),
                A = (r(1246), r(9)),
                component = Object(A.a)(T, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return t.isReady ? e("div", {
                        staticClass: "OasStream"
                    }, [e(o.a, [e(_.a, {
                        staticClass: "pt-0",
                        attrs: {
                            xl: "12",
                            lg: "10",
                            "offset-lg": "1",
                            md: "12",
                            sm: "12",
                            xs: "12"
                        }
                    }, [t.$vuetify.breakpoint.smAndUp ? e("div", {
                        staticClass: "desktop"
                    }, [e("section", {
                        staticClass: "OasStream__title"
                    }, [e("img", {
                        staticClass: "OasStream__stream-logo",
                        attrs: {
                            src: t.fetchCardImage(t.streamId),
                            alt: t.streamId
                        }
                    }), t._v(" "), e("h1", [t._v(t._s(t.title))])]), t._v(" "), e("section", {
                        staticClass: "OasStream__info"
                    }, [e("div", [e("p", [t._v(t._s(t.streamDescription))]), t._v(" "), e("div", {
                        staticClass: "OasStream__stream-details"
                    }, t._l(t.uniqueStages, (function(r, n) {
                        return e("div", {
                            key: n
                        }, [e("div", {
                            staticClass: "OasStream__stream-details-title"
                        }, [t._v("Stage " + t._s(n) + " Streaming")]), t._v(" "), t._l(r, (function(r, n) {
                            return e("p", {
                                key: n,
                                staticClass: "OasStream__stream-details-subtitle"
                            }, [t._v("\n                  " + t._s(r.map(p => p.title).join(", ")) + "\n                ")])
                        }))], 2)
                    })), 0)]), t._v(" "), e("div", {
                        staticClass: "OasStream__legend"
                    }, [e("div", {
                        staticClass: "OasStream__legend-item"
                    }, [e("img", {
                        staticClass: "OasStream__legend-icon",
                        attrs: {
                            src: t.inProgressIcon,
                            alt: "In Progress"
                        }
                    }), t._v("\n              In progress\n            ")]), t._v(" "), e("div", {
                        staticClass: "OasStream__legend-item"
                    }, [e("img", {
                        staticClass: "OasStream__legend-icon",
                        attrs: {
                            src: t.checkedIcon,
                            alt: "Completed"
                        }
                    }), t._v("\n              Completed\n            ")])])]), t._v(" "), e("section", {
                        staticClass: "OasStream__tree"
                    }, [e("h2", {
                        staticClass: "OasStream__subtitle"
                    }, [t._v("Your progress")]), t._v(" "), e("StreamTree", {
                        attrs: {
                            "stream-tree-data": t.streamTreeData.tree,
                            "progress-data": t.progressData(),
                            "stream-id": t.streamId
                        }
                    })], 1)]) : t._e(), t._v(" "), t.$vuetify.breakpoint.xsOnly ? e("div", {
                        staticClass: "mobile"
                    }, [e("section", {
                        staticClass: "OasStream__title"
                    }, [e("img", {
                        staticClass: "OasStream__stream-logo",
                        attrs: {
                            src: t.fetchCardImage(t.streamId),
                            alt: t.streamId
                        }
                    }), t._v(" "), e("h1", [t._v(t._s(t.streamId))])]), t._v(" "), e("section", {
                        staticClass: "OasStream__info"
                    }, [e("p", [t._v(t._s(t.streamDescription))]), t._v(" "), t._l(t.uniqueStages, (function(r, n) {
                        return e(c.a, {
                            key: n,
                            staticClass: "OasStream__branching-summary",
                            attrs: {
                                flat: "",
                                "max-width": "max-content"
                            }
                        }, [e(l.d, {
                            staticClass: "OasStream__stream-details-title"
                        }, [t._v("Stage " + t._s(n) + " Streaming")]), t._v(" "), t._l(r, (function(r, n) {
                            return e(l.b, {
                                key: n,
                                staticClass: "OasStream__stream-details-subtitle"
                            }, [e("b", [t._v(t._s(n))]), t._v("\n              > " + t._s(r.map(p => p.title).join(", ")) + "\n            ")])
                        }))], 2)
                    })), t._v(" "), e("div", {
                        staticClass: "OasStream__legend"
                    }, [e("div", {
                        staticClass: "OasStream__legend-item"
                    }, [e("img", {
                        staticClass: "OasStream__legend-icon",
                        attrs: {
                            src: t.inProgressIcon,
                            alt: "In Progress"
                        }
                    }), t._v("\n              In progress\n            ")]), t._v(" "), e("div", {
                        staticClass: "OasStream__legend-item"
                    }, [e("img", {
                        staticClass: "OasStream__legend-icon",
                        attrs: {
                            src: t.checkedIcon,
                            alt: "Completed"
                        }
                    }), t._v("\n              Completed\n            ")])])], 2), t._v(" "), e("h2", {
                        staticClass: "OasStream__progress-headline"
                    }, [t._v("Your Progress")]), t._v(" "), e(h.a, {
                        attrs: {
                            "background-color": "transparent",
                            centered: "",
                            grow: ""
                        }
                    }, [e(S.a), t._v(" "), t._l(t.paths, (function(path, i) {
                        return e(m.a, {
                            key: i,
                            attrs: {
                                href: "#tab-" + i
                            }
                        }, [t._v("\n            " + t._s(path[path.length - 1].title) + "\n          ")])
                    })), t._v(" "), t._l(t.paths, (function(path, i) {
                        return e(d.a, {
                            key: i,
                            attrs: {
                                value: "tab-" + i
                            }
                        }, t._l(path, (function(r, l) {
                            return e("div", {
                                key: l,
                                staticClass: "OasStream__stage-container",
                                class: [t.getStageStatus(path[l]) === t.ACHIEVEMENT_STATUS.AWARDED ? "OasStream__stage-container--completed" : "", t.getStageStatus(path[l]) ? "OasStream__stage-container--in-progress" : ""]
                            }, [e(c.a, {
                                staticClass: "OasStream__stage-card",
                                nativeOn: {
                                    click: function(e) {
                                        return t.editOasStage(r)
                                    }
                                }
                            }, [e("div", {
                                staticClass: "OasStream__stage-card__number"
                            }, [t._v(t._s(r.stage))]), t._v(" "), e("div", {
                                staticClass: "OasStream__stage-card__title"
                            }, [t._v(t._s(r.title))]), t._v(" "), t.getStageStatus(path[l]) ? e(n.a, {
                                attrs: {
                                    size: "20"
                                }
                            }, [t.getStageStatus(path[l]) ? e("img", {
                                staticClass: "OasStream__stage-card__completion-icon",
                                attrs: {
                                    src: t.getStageStatus(path[l]) === t.ACHIEVEMENT_STATUS.AWARDED ? t.checkedIcon : t.inProgressIcon,
                                    alt: t.getStageStatus(path[l]) === t.ACHIEVEMENT_STATUS.IN_PROGRESS ? "In Progress" : "Completed"
                                }
                            }) : t._e()]) : t._e()], 1), t._v(" "), l < path.length - 1 ? e("div", {
                                staticClass: "OasStream__stage-spacer"
                            }) : t._e()], 1)
                        })), 0)
                    }))], 2)], 1) : t._e()])], 1)], 1) : t._e()
                }), [], !1, null, null, null);
            e.default = component.exports
        },
        1490: function(t, e, r) {
            "use strict";
            r.r(e);
            var n = r(40),
                c = r(5),
                l = r(3),
                _ = n.s.extend({
                    name: "OasStreamPage",
                    computed: {
                        isReady() {
                            return this.checkDataReady()
                        }
                    },
                    async created() {
                        try {
                            await this.getAndSetStreamTree()
                        } catch (t) {
                            return this.$nuxt.error({
                                statusCode: 503,
                                message: ""
                            })
                        }
                        this.$accessor.global.setBreadcrumbs([{
                            text: c.l.OAS,
                            to: l.OAS,
                            exact: !0,
                            disabled: !1
                        }, {
                            text: this.$accessor.oas.getStreamTitle,
                            to: `${l.OAS}/${this.$accessor.oas.getStream}`,
                            exact: !0,
                            disabled: !0
                        }])
                    },
                    methods: {
                        checkDataReady() {
                            return 0 !== Object.keys(this.$accessor.oas.getStreamTree).length && this.$accessor.oas.getStreamTree.constructor === Object && this.hasRefreshedStreamTree
                        }
                    }
                }),
                o = r(9),
                component = Object(o.a)(_, (function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return this.isReady ? t("OasStream", {
                        attrs: {
                            "stream-tree-data": this.$accessor.oas.getStreamTree.data
                        }
                    }) : this._e()
                }), [], !1, null, null, null);
            e.default = component.exports;
            installComponents(component, {
                OasStream: r(1353).default
            })
        },
        61: function(t, e, r) {
            "use strict";
            var n = r(870);
            e.a = n.a
        }
    }
]);