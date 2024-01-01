(window.webpackJsonp = window.webpackJsonp || []).push([
    [199, 95, 128], {
        1161: function(t, e, o) {
            t.exports = {}
        },
        1214: function(t, e, o) {
            var map = {
                "./icon--logbook-distance-travelled.svg": 300,
                "./icon--logbook-nights-camped.svg": 301
            };

            function l(t) {
                var e = r(t);
                return o(e)
            }

            function r(t) {
                if (!o.o(map, t)) {
                    var e = new Error("Cannot find module '" + t + "'");
                    throw e.code = "MODULE_NOT_FOUND", e
                }
                return map[t]
            }
            l.keys = function() {
                return Object.keys(map)
            }, l.resolve = r, t.exports = l, l.id = 1214
        },
        1215: function(t, e, o) {
            "use strict";
            o(1161)
        },
        1277: function(t, e, o) {
            t.exports = {}
        },
        1326: function(t, e, o) {
            "use strict";
            o.r(e);
            var l = o(236),
                r = o(35),
                n = o(886),
                c = o(885),
                d = {
                    name: "LogbookCard",
                    props: {
                        title: {
                            type: String,
                            default: ""
                        },
                        subtitle: {
                            type: Number,
                            default: 0
                        },
                        path: {
                            type: String,
                            default: "distance-travelled"
                        }
                    },
                    methods: {
                        fetchIcon: path => o(1214)(`./icon--logbook-${path}.svg`)
                    }
                },
                _ = (o(1215), o(9)),
                component = Object(_.a)(d, (function() {
                    var t = this,
                        e = t._self._c;
                    return e(l.a, {
                        staticClass: "LogbookCard"
                    }, [e(c.a, {
                        staticClass: "flex-nowrap",
                        attrs: {
                            "no-gutters": "",
                            align: "center"
                        }
                    }, [e(n.a, [e(r.d, {
                        staticClass: "LogbookCard__title"
                    }, [t._v(t._s(t.title))]), t._v(" "), e("div", {
                        staticClass: "LogbookCard__subtitle"
                    }, [t._v(t._s(t.subtitle))])], 1), t._v(" "), e("img", {
                        staticClass: "LogbookCard__image",
                        attrs: {
                            src: t.fetchIcon(t.path),
                            alt: t.path
                        }
                    })], 1)], 1)
                }), [], !1, null, "67c25f40", null);
            e.default = component.exports
        },
        1376: function(t, e, o) {
            "use strict";
            o(1277)
        },
        1449: function(t, e, o) {
            "use strict";
            o.r(e);
            var l = o(870),
                r = o(886),
                n = o(1439),
                c = o(885),
                d = o(62),
                _ = o(11),
                h = o.n(_),
                m = o(28),
                f = o(40),
                v = o(5),
                k = o(4),
                C = o(3),
                y = f.h.extend({
                    name: "LogbookPage",
                    computed: {
                        headers: () => [{
                            text: "Title of your adventure",
                            sortable: !1,
                            value: "title"
                        }, {
                            text: "Activity Area",
                            sortable: !1,
                            value: "area",
                            width: 150
                        }, {
                            text: "Date",
                            sortable: !1,
                            value: "date",
                            width: 150
                        }, {
                            text: "Actions",
                            sortable: !1,
                            value: "actions",
                            width: 350
                        }]
                    },
                    async created() {
                        this.$accessor.global.setLoading(!0), this.$accessor.global.setBreadcrumbs([{
                            text: v.l.MY_LOGBOOK,
                            to: C.LOGBOOK,
                            exact: !0,
                            disabled: !0
                        }]), await this.fetchItems(), this.$accessor.global.setLoading(!1)
                    },
                    data: () => ({
                        items: [],
                        filter: "",
                        deleteId: "",
                        distanceTravelled: 0,
                        nightsCamped: 0,
                        loadingItems: !0,
                        deleteModal: !1,
                        LABEL: v.i,
                        PATH: C
                    }),
                    methods: {
                        viewRecord(t) {
                            this.$accessor.logbook.setRecord(t), this.$router.push({
                                path: C.VIEW_RECORD
                            })
                        },
                        editRecord(t) {
                            this.$accessor.logbook.setRecord(t), this.$router.push({
                                path: C.EDIT_RECORD
                            })
                        },
                        cancelDelete() {
                            this.deleteModal = !1
                        },
                        openDeleteModal(t) {
                            this.deleteId = t, this.deleteModal = !0
                        },
                        async fetchItems() {
                            h.a.get(`${this.$config.api.achievements}${k.MEMBERS_PATH}/${this.$accessor.user.getUserId}${k.LOGBOOK_METRICS_PATH}`).then(t => {
                                const e = t.data.results,
                                    o = e.find(t => "total_distance_hiked" === t.name);
                                void 0 !== o && (this.distanceTravelled = o.value / 1e3);
                                const l = e.find(t => "total_nights_camped" === t.name);
                                void 0 !== l && (this.nightsCamped = l.value)
                            }).catch(t => {
                                console.error("Failed to get logbook metrics. Error:", t), this.$accessor.snackbar.setSnack({
                                    message: "Could not get logbook metrics. Please try again",
                                    icon: "nope"
                                })
                            }), await h.a.get(`${this.$config.api.achievements}${k.MEMBERS_PATH}/${this.$accessor.user.getUserId}${k.LOGBOOK_PATH}`).then(t => {
                                this.items = t.data.results.map(t => ({
                                    id: t.id,
                                    title: t.title,
                                    area: t.achievement_meta ? Object(m.h)(t.achievement_meta.stream) : "Other",
                                    date: t.start_date
                                })), this.loadingItems = !1
                            }).catch(t => {
                                console.error("Failed to get logbook entries. Error:", t), this.$accessor.snackbar.setSnack({
                                    message: "Could not get logbook entries. Please try again",
                                    icon: "nope"
                                })
                            })
                        },
                        async deleteLogbookEntry() {
                            await h.a.delete(`${this.$config.api.achievements}${k.MEMBERS_PATH}/${this.$accessor.user.getUserId}${k.LOGBOOK_PATH}/${this.deleteId}`).then(async t => {
                                this.loadingItems = !0, await this.fetchItems(), this.$accessor.snackbar.setSnack({
                                    message: "Logbook record deleted.",
                                    icon: "check"
                                })
                            }).catch(t => {
                                console.error("Failed to delete logbook entry. Error:", t), this.$accessor.snackbar.setSnack({
                                    message: "Could not delete logbook entry. Please try again",
                                    icon: "nope"
                                })
                            }), this.deleteModal = !1
                        }
                    }
                }),
                E = (o(1376), o(9)),
                component = Object(E.a)(y, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "Logbook"
                    }, [e("PageHeader", {
                        attrs: {
                            title: "My Logbook",
                            subtitle: "Keeping track of your adventures and opportunities provides a record of what you have done. You can reflect back on the personal development during each expedition and the furthering of skills that has occurred."
                        }
                    }), t._v(" "), e(c.a, [e(r.a, {
                        attrs: {
                            cols: "12",
                            md: "6"
                        }
                    }, [e("LogbookCard", {
                        attrs: {
                            title: "Walkabout Award - total distance traveled (km)",
                            subtitle: t.distanceTravelled,
                            path: "distance-travelled"
                        }
                    })], 1), t._v(" "), e(r.a, {
                        attrs: {
                            cols: "12",
                            md: "6"
                        }
                    }, [e("LogbookCard", {
                        attrs: {
                            title: "Camper Award - total nights camped",
                            subtitle: t.nightsCamped,
                            path: "nights-camped"
                        }
                    })], 1)], 1), t._v(" "), t.loadingItems ? t._e() : [0 === t.items.length ? e("div", [e(c.a, {
                        staticClass: "mt-4",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e("div", {
                        staticClass: "Logbook__title"
                    }, [t._v("No achievements recorded.")])]), t._v(" "), e(c.a, {
                        staticClass: "mt-6",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e("nuxt-link", {
                        attrs: {
                            to: t.PATH.ADD_NEW_RECORD
                        }
                    }, [e(l.a, [t._v(t._s(t.LABEL.ADD_NEW_RECORD))])], 1)], 1), t._v(" "), e("img", {
                        attrs: {
                            src: t.fetchImage("logbook--welcome"),
                            alt: "Open Book"
                        }
                    })], 1) : e("div", {
                        staticClass: "mt-6 Logbook__table"
                    }, [e(n.a, {
                        attrs: {
                            headers: t.headers,
                            items: t.items,
                            search: t.filter,
                            loading: t.loadingItems
                        },
                        scopedSlots: t._u([{
                            key: "top",
                            fn: function() {
                                return [e(c.a, {
                                    staticClass: "mb-6",
                                    attrs: {
                                        "no-gutters": ""
                                    }
                                }, [e(r.a, {
                                    attrs: {
                                        cols: "12",
                                        sm: "6",
                                        md: "4"
                                    }
                                }, [e(d.a, {
                                    attrs: {
                                        label: "Filter",
                                        "append-icon": "mdi-magnify",
                                        "single-line": "",
                                        "hide-details": "",
                                        height: "40"
                                    },
                                    model: {
                                        value: t.filter,
                                        callback: function(e) {
                                            t.filter = e
                                        },
                                        expression: "filter"
                                    }
                                })], 1), t._v(" "), e(r.a, {
                                    staticClass: "align-self-center",
                                    attrs: {
                                        cols: "12",
                                        sm: "6",
                                        md: "8"
                                    }
                                }, [e("nuxt-link", {
                                    attrs: {
                                        to: t.PATH.ADD_NEW_RECORD
                                    }
                                }, [e(l.a, {
                                    staticClass: "float-right",
                                    attrs: {
                                        block: t.$vuetify.breakpoint.xs,
                                        "data-cy": "ADD_NEW_RECORD"
                                    }
                                }, [t._v("\n                  " + t._s(t.LABEL.ADD_NEW_RECORD) + "\n                ")])], 1)], 1)], 1)]
                            },
                            proxy: !0
                        }, {
                            key: "item.actions",
                            fn: function(o) {
                                let {
                                    item: n
                                } = o;
                                return [e(c.a, {
                                    staticClass: "flex-nowrap"
                                }, [e(r.a, {
                                    staticClass: "Logbook__buttons"
                                }, [e(l.a, {
                                    staticClass: "pl-0",
                                    attrs: {
                                        small: "",
                                        text: ""
                                    },
                                    on: {
                                        click: function(e) {
                                            return t.viewRecord(n)
                                        }
                                    }
                                }, [e("Icon", {
                                    attrs: {
                                        name: "view",
                                        "data-cy": "VIEW",
                                        label: t.LABEL.VIEW,
                                        size: "small",
                                        outline: ""
                                    }
                                })], 1), t._v(" "), e(l.a, {
                                    staticClass: "px-xs-2",
                                    attrs: {
                                        small: "",
                                        text: ""
                                    },
                                    on: {
                                        click: function(e) {
                                            return t.editRecord(n)
                                        }
                                    }
                                }, [e("Icon", {
                                    attrs: {
                                        name: "edit",
                                        "data-cy": "EDIT",
                                        label: t.LABEL.EDIT,
                                        size: "small",
                                        outline: ""
                                    }
                                })], 1), t._v(" "), e(l.a, {
                                    staticClass: "px-xs-2",
                                    attrs: {
                                        small: "",
                                        text: ""
                                    },
                                    on: {
                                        click: function(e) {
                                            return t.openDeleteModal(n.id)
                                        }
                                    }
                                }, [e("Icon", {
                                    attrs: {
                                        name: "delete",
                                        "data-cy": "DELETE",
                                        label: t.LABEL.DELETE,
                                        size: "small",
                                        outline: ""
                                    }
                                })], 1)], 1)], 1)]
                            }
                        }], null, !1, 1270988160)
                    })], 1)], t._v(" "), e("ConfirmationDialog", {
                        attrs: {
                            model: t.deleteModal,
                            title: "Delete record?",
                            subtitle: "This record will be deleted from your logbook.",
                            "data-cy": "OKAY",
                            "confirm-button-label": t.LABEL.OKAY,
                            "confirm-callback": t.deleteLogbookEntry,
                            "close-dialog": t.cancelDelete
                        }
                    })], 2)
                }), [], !1, null, "bf1122da", null);
            e.default = component.exports;
            installComponents(component, {
                PageHeader: o(953).default,
                LogbookCard: o(1326).default,
                Icon: o(55).default,
                ConfirmationDialog: o(79).default
            })
        },
        946: function(t, e, o) {
            t.exports = {}
        },
        953: function(t, e, o) {
            "use strict";
            o.r(e);
            var l = o(886),
                r = o(885),
                n = o(1).a.extend({
                    name: "PageHeader",
                    props: {
                        title: {
                            type: String,
                            required: !0
                        },
                        subtitle: {
                            type: String,
                            required: !0
                        },
                        href: {
                            type: String,
                            default: null
                        },
                        imageSrc: {
                            type: String,
                            default: ""
                        },
                        imageAlt: {
                            type: String,
                            default: "Header icon"
                        },
                        linkOpenContext: {
                            type: String,
                            default: "_self"
                        },
                        linkTitle: {
                            type: String,
                            default: ""
                        },
                        isAp: {
                            type: Boolean
                        }
                    }
                }),
                c = (o(959), o(9)),
                component = Object(c.a)(n, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("section", {
                        staticClass: "PageHeader"
                    }, [e(r.a, {
                        staticClass: "pt-0 align-center",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(l.a, {
                        staticClass: "py-0"
                    }, [e("div", {
                        staticClass: "PageHeader__container"
                    }, [e("div", {
                        staticClass: "PageHeader__title-container"
                    }, [t.isAp ? e("h2", {
                        staticClass: "PageHeader__ap"
                    }, [t._v("Achievement Pathway")]) : t._e(), t._v(" "), e("h1", {
                        staticClass: "PageHeader__title"
                    }, [t._v(t._s(t.title))])]), t._v(" "), t._t("buttons"), t._v(" "), t.imageSrc ? e("img", {
                        attrs: {
                            src: t.imageSrc,
                            alt: "Page Header image"
                        }
                    }) : t._e()], 2), t._v(" "), e(r.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(l.a, {
                        attrs: {
                            sm: "12",
                            md: "9",
                            lg: "10"
                        }
                    }, [e("div", {
                        staticClass: "PageHeader__subtitle"
                    }, [t._v("\n            " + t._s(t.subtitle) + "\n            "), t.href ? e("a", {
                        staticClass: "Link-alt",
                        attrs: {
                            href: t.href,
                            target: t.linkOpenContext
                        }
                    }, [t._v(t._s(t.linkTitle))]) : t._e()])])], 1)], 1), t._v(" "), t.$slots.infoBox && t.$vuetify.breakpoint.smOnly ? e("div", {
                        staticClass: "PageHeader__infobox-container--large"
                    }, [t._t("infoBox")], 2) : t._e()], 1), t._v(" "), t.$slots.infoBox && t.$vuetify.breakpoint.xsOnly ? e("div", {
                        staticClass: "PageHeader__infobox-container--small"
                    }, [t._t("infoBox")], 2) : t._e()], 1)
                }), [], !1, null, "5317aa88", null);
            e.default = component.exports
        },
        959: function(t, e, o) {
            "use strict";
            o(946)
        }
    }
]);