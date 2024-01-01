(window.webpackJsonp = window.webpackJsonp || []).push([
    [12, 126], {
        1193: function(e, t, n) {
            e.exports = {}
        },
        1245: function(e, t, n) {
            "use strict";
            n(1193)
        },
        1307: function(e, t, n) {
            e.exports = {}
        },
        1354: function(e, t, n) {
            "use strict";
            n.r(t);
            var o = n(1355),
                l = n(40).s.extend({
                    name: "StreamTree",
                    components: {
                        StreamTreeNode: o.default
                    },
                    props: {
                        streamTreeData: {
                            type: Object,
                            required: !0
                        },
                        progressData: {
                            type: Array,
                            required: !0
                        },
                        streamId: {
                            type: String,
                            required: !0
                        },
                        pan: {
                            type: Boolean,
                            required: !1
                        },
                        zoom: {
                            type: Boolean
                        },
                        zoomoutLimit: {
                            type: Number,
                            default: .5
                        },
                        zoominLimit: {
                            type: Number,
                            default: 7
                        }
                    },
                    data: () => ({
                        cursorVal: "default",
                        panning: !1,
                        startX: 0,
                        startY: 0,
                        transformVal: ""
                    }),
                    methods: {
                        panEndHandler() {
                            this.panning = !1, this.cursorVal = "default"
                        },
                        panHandler(e) {
                            let t = 0,
                                n = 0;
                            if (e.targetTouches) {
                                if (1 === e.targetTouches.length) t = e.targetTouches[0].pageX - this.startX, n = e.targetTouches[0].pageY - this.startY;
                                else if (e.targetTouches.length > 1) return
                            } else t = e.pageX - this.startX, n = e.pageY - this.startY;
                            if ("" === this.transformVal) this.transformVal.includes("3d") ? this.transformVal = "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0," + t + ", " + n + ",0,1)" : this.transformVal = "matrix(1,0,0,1," + t + "," + n + ")";
                            else {
                                const e = this.transformVal.split(",");
                                this.transformVal.includes("3d") ? (e[12] = t, e[13] = n) : (e[4] = t, e[5] = n + ")"), this.transformVal = e.join(",")
                            }
                        },
                        panStartHandler(e) {
                            if (e.target.closest(".node").length) return void(this.panning = !1);
                            this.cursorVal = "move", this.panning = !0;
                            let t = 0,
                                n = 0;
                            if ("" !== this.transformVal) {
                                const e = this.transformVal.split(",");
                                this.transformVal.includes("3d") ? (t = parseInt(e[12]), n = parseInt(e[13])) : (t = parseInt(e[4]), n = parseInt(e[5]))
                            }
                            if (e.targetTouches) {
                                if (1 === e.targetTouches.length) this.startX = e.targetTouches[0].pageX - t, this.startY = e.targetTouches[0].pageY - n;
                                else if (e.targetTouches.length > 1) return
                            } else this.startX = e.pageX - t, this.startY = e.pageY - n
                        },
                        setChartScale(e) {
                            let t = "",
                                n = 1;
                            "" === this.transformVal ? this.transformVal = "matrix(" + e + ", 0, 0, " + e + ", 0, 0)" : (t = this.transformVal.split(","), this.transformVal.includes("3d") ? (n = Math.abs(window.parseFloat(t[5]) * e), n > this.zoomoutLimit && n < this.zoominLimit && (t[0] = "matrix3d(" + n, t[5] = n, this.transformVal = t.join(","))) : (n = Math.abs(window.parseFloat(t[3]) * e), n > this.zoomoutLimit && n < this.zoominLimit && (t[0] = "matrix(" + n, t[3] = n, this.transformVal = t.join(","))))
                        },
                        zoomHandler(e) {
                            const t = 1 + (e.deltaY > 0 ? -.2 : .2);
                            this.setChartScale(t)
                        }
                    }
                }),
                r = (n(1408), n(9)),
                component = Object(r.a)(l, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", e._b({
                        staticClass: "StreamTree orgchart-container",
                        on: {
                            wheel: function(t) {
                                e.zoom && e.zoomHandler(t)
                            },
                            mouseup: function(t) {
                                e.pan && e.panning && e.panEndHandler(t)
                            }
                        }
                    }, "div", {
                        scopedSlots: e.$scopedSlots
                    }, !1), [t("div", {
                        staticClass: "orgchart",
                        style: {
                            transform: e.transformVal,
                            cursor: e.cursorVal
                        },
                        on: {
                            mousedown: function(t) {
                                e.pan && e.panStartHandler(t)
                            },
                            mousemove: function(t) {
                                e.pan && e.panning && e.panHandler(t)
                            }
                        }
                    }, [t("StreamTreeNode", {
                        attrs: {
                            "stream-tree-data": e.streamTreeData,
                            "progress-data": e.progressData,
                            "stream-id": e.streamId
                        },
                        scopedSlots: e._u([e._l(Object.keys(e.$scopedSlots), (function(slot) {
                            return {
                                key: slot,
                                fn: function(t) {
                                    return [e._t(slot, null, null, t)]
                                }
                            }
                        }))], null, !0)
                    })], 1)])
                }), [], !1, null, null, null);
            t.default = component.exports
        },
        1355: function(e, t, n) {
            "use strict";
            n.r(t);
            var o = n(287),
                l = n(5),
                r = n(40),
                c = n(10),
                d = r.s.extend({
                    name: "StreamTreeNode",
                    props: {
                        streamTreeData: {
                            type: Object,
                            default: () => ({
                                id: "1",
                                name: "Paddling",
                                stage: "0"
                            })
                        },
                        streamId: {
                            type: String,
                            required: !0
                        },
                        progressData: {
                            type: Array,
                            required: !0
                        }
                    },
                    data: () => ({
                        ICON_ALERT_GREEN_CHECK: o.ICON_ALERT_GREEN_CHECK,
                        ICON_ALERT_BLUE_IN_PROGRESS: o.ICON_ALERT_BLUE_IN_PROGRESS,
                        inProgress: !1,
                        completed: !1
                    }),
                    mounted() {
                        this.setStageStatus()
                    },
                    computed: {
                        colour() {
                            return `var(${l.g}${this.streamTreeData.stage})`
                        },
                        getNodeStreamIconColour() {
                            return this.completed ? "filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(63deg) brightness(104%) contrast(104%);" : "filter: invert(54%) sepia(10%) saturate(615%) hue-rotate(169deg) brightness(92%) contrast(90%);"
                        }
                    },
                    methods: {
                        setStageStatus() {
                            const e = this.streamTreeData,
                                t = this.progressData.find(t => t.achievement_meta.stage === e.stage && t.achievement_meta.branch === e.branch_id);
                            t && (t.status === c.a.AWARDED ? this.completed = !0 : this.inProgress = !0)
                        },
                        fetchCardImage(image) {
                            const e = `icon--oas-${image}.svg`;
                            return n(903)("./" + e)
                        },
                        fetchImage: e => n(903)("./" + e),
                        getNodeBackgroundColour() {
                            return this.completed ? "backgroundColor: " + this.colour : this.inProgress ? "" : "border: 1.2px solid #EBEBEB;"
                        },
                        getNodeInProgressBackgroundColour() {
                            if (this.inProgress) return `backgroundColor: ${this.colour}; opacity: 0.2;`
                        },
                        getNodeStageNumberColour() {
                            return this.completed ? "color: #fff" : "color: " + this.colour
                        },
                        getNodeNameColour() {
                            return this.completed ? "color: #fff" : "color: var(--color-medium-charcoal)"
                        },
                        getNodeActivityIcon() {
                            return this.completed ? this.fetchImage(o.ICON_ALERT_GREEN_CHECK) : this.inProgress ? this.fetchImage(o.ICON_ALERT_BLUE_IN_PROGRESS) : void 0
                        }
                    }
                }),
                m = (n(1245), n(9)),
                component = Object(m.a)(d, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("table", [t("tbody", [t("tr", [t("td", {
                        attrs: {
                            colspan: e.streamTreeData.children && e.streamTreeData.children.length ? 2 * e.streamTreeData.children.length : null
                        }
                    }, [t("div", {
                        staticClass: "node",
                        attrs: {
                            id: e.streamTreeData.branch_id + e.streamTreeData.stage
                        },
                        on: {
                            click: function(t) {
                                return t.stopPropagation(), e.editOasStage(e.streamTreeData)
                            },
                            keydown: function(t) {
                                return e.editOasStage(e.streamTreeData)
                            }
                        }
                    }, [e._t("default", (function() {
                        return [t("div", {
                            staticClass: "Stream__node",
                            style: e.getNodeBackgroundColour(),
                            attrs: {
                                "data-cy": "qa-stage"
                            }
                        }, [e.getNodeInProgressBackgroundColour() ? t("div", {
                            staticClass: "Stream__node-background-in-progress",
                            style: e.getNodeInProgressBackgroundColour()
                        }) : e._e(), e._v(" "), t("div", {
                            staticClass: "Stream__node-progress"
                        }, [e.getNodeActivityIcon() ? t("img", {
                            attrs: {
                                src: e.getNodeActivityIcon(),
                                alt: "progress"
                            }
                        }) : e._e()]), e._v(" "), t("div", {
                            staticClass: "Stream__node-content"
                        }, [t("div", {
                            staticClass: "Stream__node-number-icon"
                        }, [t("p", {
                            style: e.getNodeStageNumberColour()
                        }, [e._v("\n                    " + e._s(e.streamTreeData.stage) + "\n                  ")]), e._v(" "), t("img", {
                            style: e.getNodeStreamIconColour,
                            attrs: {
                                alt: e.streamId,
                                src: e.fetchCardImage(e.streamId)
                            }
                        })]), e._v(" "), t("div", {
                            staticClass: "Stream__node-stage-name"
                        }, [t("p", {
                            style: e.getNodeNameColour()
                        }, [e._v("\n                    " + e._s(e.streamTreeData.title) + "\n                  ")])])])])]
                    }), {
                        nodeData: e.streamTreeData
                    })], 2)])]), e._v(" "), e.streamTreeData.children && e.streamTreeData.children.length ? [t("tr", {
                        staticClass: "lines"
                    }, [t("td", {
                        attrs: {
                            colspan: 2 * e.streamTreeData.children.length
                        }
                    }, [t("div", {
                        staticClass: "downLine"
                    })])]), e._v(" "), t("tr", {
                        staticClass: "lines"
                    }, [t("td", {
                        staticClass: "rightLine"
                    }), e._v(" "), e._l(e.streamTreeData.children.length - 1, (function(n, o) {
                        return [t("td", {
                            key: o + "left",
                            staticClass: "leftLine topLine"
                        }), e._v(" "), t("td", {
                            key: o + "right",
                            staticClass: "rightLine topLine"
                        })]
                    })), e._v(" "), t("td", {
                        staticClass: "leftLine"
                    })], 2), e._v(" "), t("tr", {
                        staticClass: "nodes"
                    }, e._l(e.streamTreeData.children, (function(n) {
                        return t("td", {
                            key: n.id,
                            attrs: {
                                colspan: "2"
                            }
                        }, [t("StreamTreeNode", {
                            attrs: {
                                "stream-tree-data": n,
                                "progress-data": e.progressData,
                                "stream-id": e.streamId,
                                "edit-oas-stage": e.editOasStage
                            },
                            scopedSlots: e._u([e._l(Object.keys(e.$scopedSlots), (function(slot) {
                                return {
                                    key: slot,
                                    fn: function(t) {
                                        return [e._t(slot, null, null, t)]
                                    }
                                }
                            }))], null, !0)
                        })], 1)
                    })), 0)] : e._e()], 2)])
                }), [], !1, null, "1526c15a", null);
            t.default = component.exports
        },
        1408: function(e, t, n) {
            "use strict";
            n(1307)
        },
        903: function(e, t, n) {
            var map = {
                "./icon--caution-inverse.svg": 215,
                "./icon--check-inverse.svg": 216,
                "./icon--hint-inverse.svg": 217,
                "./icon--locked.svg": 308,
                "./icon--logbook-distance-travelled.svg": 300,
                "./icon--logbook-nights-camped.svg": 301,
                "./icon--nope-inverse.svg": 218,
                "./icon--oas-alpine.svg": 309,
                "./icon--oas-aquatics.svg": 310,
                "./icon--oas-boating.svg": 311,
                "./icon--oas-bushcraft.svg": 312,
                "./icon--oas-bushwalking.svg": 313,
                "./icon--oas-camping.svg": 314,
                "./icon--oas-cycling.svg": 315,
                "./icon--oas-paddling.svg": 316,
                "./icon--oas-vertical.svg": 317,
                "./icon--plan.svg": 307,
                "./icon--review.svg": 318,
                "./icon--spices--3x2.svg": 319,
                "./icon--system-admin.svg": 320,
                "./icon--time-inverse.svg": 321,
                "./icon--time.svg": 322,
                "./icon-alert-blue-in-progress.svg": 323,
                "./icon-alert-green-check.svg": 324,
                "./icon-area-community.svg": 176,
                "./icon-area-creativity.svg": 178,
                "./icon-area-outdoors.svg": 177,
                "./icon-area-personal-growth.svg": 179,
                "./icon-attach.svg": 325,
                "./icon-caution.svg": 326,
                "./icon-check-grey.svg": 288,
                "./icon-check.svg": 289,
                "./icon-chevron-right.svg": 327,
                "./icon-danger.svg": 328,
                "./icon-hint-blue.svg": 302,
                "./icon-hint-grey.svg": 329,
                "./icon-in-progress.svg": 330,
                "./icon-info.svg": 331,
                "./icon-nope-grey.svg": 332,
                "./icon-nope.svg": 333,
                "./icon-peak-award-cub-active.svg": 290,
                "./icon-peak-award-cub-disabled.svg": 291,
                "./icon-peak-award-joey-active.svg": 292,
                "./icon-peak-award-joey-disabled.svg": 293,
                "./icon-peak-award-rover-active.svg": 294,
                "./icon-peak-award-rover-disabled.svg": 295,
                "./icon-peak-award-scout-active.svg": 296,
                "./icon-peak-award-scout-disabled.svg": 297,
                "./icon-peak-award-venturer-active.svg": 298,
                "./icon-peak-award-venturer-disabled.svg": 299,
                "./icon-pencil.svg": 334,
                "./icon-success.svg": 335,
                "./icon-view-doc.svg": 336,
                "./outline/icon--add-member.svg": 180,
                "./outline/icon--approve.svg": 181,
                "./outline/icon--archive.svg": 182,
                "./outline/icon--calendar-toggle.svg": 183,
                "./outline/icon--calendar.svg": 184,
                "./outline/icon--check-green.svg": 185,
                "./outline/icon--check-grey.svg": 186,
                "./outline/icon--clipboard-inverse.svg": 187,
                "./outline/icon--clipboard.svg": 188,
                "./outline/icon--close.svg": 189,
                "./outline/icon--comments.svg": 190,
                "./outline/icon--copy.svg": 191,
                "./outline/icon--delete.svg": 192,
                "./outline/icon--download.svg": 193,
                "./outline/icon--edit.svg": 194,
                "./outline/icon--hamburger.svg": 195,
                "./outline/icon--idea.svg": 196,
                "./outline/icon--import-inverse.svg": 197,
                "./outline/icon--import.svg": 198,
                "./outline/icon--improve.svg": 199,
                "./outline/icon--info.svg": 200,
                "./outline/icon--legal.svg": 201,
                "./outline/icon--logout.svg": 202,
                "./outline/icon--notification.svg": 203,
                "./outline/icon--offline.svg": 204,
                "./outline/icon--patrol.svg": 205,
                "./outline/icon--plan.svg": 206,
                "./outline/icon--privacy.svg": 207,
                "./outline/icon--reject.svg": 208,
                "./outline/icon--resource.svg": 209,
                "./outline/icon--review.svg": 210,
                "./outline/icon--support.svg": 211,
                "./outline/icon--time-blue.svg": 212,
                "./outline/icon--time.svg": 213,
                "./outline/icon--view.svg": 214,
                "./template-assets/adventure-sport--default.svg": 337,
                "./template-assets/adventure-sport--selected.svg": 338,
                "./template-assets/adventure-sport--unselected.svg": 339,
                "./template-assets/affordable-and-clean-energy--selected.svg": 340,
                "./template-assets/affordable-and-clean-energy--unselected.svg": 341,
                "./template-assets/art-literature--default.svg": 342,
                "./template-assets/art-literature--selected.svg": 343,
                "./template-assets/art-literature--unselected.svg": 344,
                "./template-assets/character--selected.svg": 345,
                "./template-assets/character--unselected.svg": 346,
                "./template-assets/clean-water-and-sanitation--selected.svg": 347,
                "./template-assets/clean-water-and-sanitation--unselected.svg": 348,
                "./template-assets/climate-action--selected.svg": 349,
                "./template-assets/climate-action--unselected.svg": 350,
                "./template-assets/community--default.svg": 303,
                "./template-assets/community--selected.svg": 351,
                "./template-assets/community--unselected.svg": 352,
                "./template-assets/community-involvement--default.svg": 353,
                "./template-assets/community-involvement--selected.svg": 354,
                "./template-assets/community-involvement--unselected.svg": 355,
                "./template-assets/creating-a-better-world--default.svg": 356,
                "./template-assets/creating-a-better-world--selected.svg": 357,
                "./template-assets/creating-a-better-world--unselected.svg": 358,
                "./template-assets/creative--default.svg": 304,
                "./template-assets/creative--selected.svg": 359,
                "./template-assets/creative--unselected.svg": 360,
                "./template-assets/decent-work-and-economic-growth--selected.svg": 361,
                "./template-assets/decent-work-and-economic-growth--unselected.svg": 362,
                "./template-assets/emotional--selected.svg": 363,
                "./template-assets/emotional--unselected.svg": 364,
                "./template-assets/environment--default.svg": 365,
                "./template-assets/environment--selected.svg": 366,
                "./template-assets/environment--unselected.svg": 367,
                "./template-assets/gender-equality--selected.svg": 368,
                "./template-assets/gender-equality--unselected.svg": 369,
                "./template-assets/good-health-and-wellbeing--selected.svg": 370,
                "./template-assets/good-health-and-wellbeing--unselected.svg": 371,
                "./template-assets/growth-development--default.svg": 372,
                "./template-assets/growth-development--selected.svg": 373,
                "./template-assets/growth-development--unselected.svg": 374,
                "./template-assets/industry-innovation-and-infrastructure--selected.svg": 375,
                "./template-assets/industry-innovation-and-infrastructure--unselected.svg": 376,
                "./template-assets/intellectual--selected.svg": 377,
                "./template-assets/intellectual--unselected.svg": 378,
                "./template-assets/learn-by-doing--default.svg": 379,
                "./template-assets/learn-by-doing--selected.svg": 380,
                "./template-assets/learn-by-doing--unselected.svg": 381,
                "./template-assets/life-below-water--selected.svg": 382,
                "./template-assets/life-below-water--unselected.svg": 383,
                "./template-assets/life-on-land--selected.svg": 384,
                "./template-assets/life-on-land--unselected.svg": 385,
                "./template-assets/nature-and-outdoors--default.svg": 386,
                "./template-assets/nature-and-outdoors--selected.svg": 387,
                "./template-assets/nature-and-outdoors--unselected.svg": 388,
                "./template-assets/no-poverty--selected.svg": 389,
                "./template-assets/no-poverty--unselected.svg": 390,
                "./template-assets/oas-alpine--selected.svg": 391,
                "./template-assets/oas-alpine--unselected.svg": 392,
                "./template-assets/oas-aquatics--selected.svg": 393,
                "./template-assets/oas-aquatics--unselected.svg": 394,
                "./template-assets/oas-boating--selected.svg": 395,
                "./template-assets/oas-boating--unselected.svg": 396,
                "./template-assets/oas-bushcraft--selected.svg": 397,
                "./template-assets/oas-bushcraft--unselected.svg": 398,
                "./template-assets/oas-bushwalking--selected.svg": 399,
                "./template-assets/oas-bushwalking--unselected.svg": 400,
                "./template-assets/oas-camping--selected.svg": 401,
                "./template-assets/oas-camping--unselected.svg": 402,
                "./template-assets/oas-cycling--selected.svg": 403,
                "./template-assets/oas-cycling--unselected.svg": 404,
                "./template-assets/oas-padding--unselected.svg": 405,
                "./template-assets/oas-paddling--selected.svg": 406,
                "./template-assets/oas-vertical--selected.svg": 407,
                "./template-assets/oas-vertical--unselected.svg": 408,
                "./template-assets/outdoors--default.svg": 305,
                "./template-assets/outdoors--selected.svg": 409,
                "./template-assets/outdoors--unselected.svg": 410,
                "./template-assets/partnerships-for-the-goals--selected.svg": 411,
                "./template-assets/partnerships-for-the-goals--unselected.svg": 412,
                "./template-assets/patrol-system--default.svg": 413,
                "./template-assets/patrol-system--selected.svg": 414,
                "./template-assets/patrol-system--unselected.svg": 415,
                "./template-assets/peace-justice-and-strong-institutions--selected.svg": 416,
                "./template-assets/peace-justice-and-strong-institutions--unselected.svg": 417,
                "./template-assets/personal-growth--default.svg": 306,
                "./template-assets/personal-growth--selected.svg": 418,
                "./template-assets/personal-growth--unselected.svg": 419,
                "./template-assets/personal-progression--default.svg": 420,
                "./template-assets/personal-progression--selected.svg": 421,
                "./template-assets/personal-progression--unselected.svg": 422,
                "./template-assets/physical--selected.svg": 423,
                "./template-assets/physical--unselected.svg": 424,
                "./template-assets/promise-and-law--default.svg": 425,
                "./template-assets/promise-and-law--selected.svg": 426,
                "./template-assets/promise-and-law--unselected.svg": 427,
                "./template-assets/quality-education--selected.svg": 428,
                "./template-assets/quality-education--unselected.svg": 429,
                "./template-assets/reduced-inequalities--selected.svg": 430,
                "./template-assets/reduced-inequalities--unselected.svg": 431,
                "./template-assets/responsible-consumption-and-production--selected.svg": 432,
                "./template-assets/responsible-consumption-and-production--unselected.svg": 433,
                "./template-assets/social--selected.svg": 434,
                "./template-assets/social--unselected.svg": 435,
                "./template-assets/spiritual--selected.svg": 436,
                "./template-assets/spiritual--unselected.svg": 437,
                "./template-assets/stem-innovation--default.svg": 438,
                "./template-assets/stem-innovation--selected.svg": 439,
                "./template-assets/stem-innovation--unselected.svg": 440,
                "./template-assets/sustainable-communities--selected.svg": 441,
                "./template-assets/sustainable-communities--unselected.svg": 442,
                "./template-assets/symbolic-framework--default.svg": 443,
                "./template-assets/symbolic-framework--selected.svg": 444,
                "./template-assets/symbolic-framework--unselected.svg": 445,
                "./template-assets/youth-leading-adult-supporting--default.svg": 446,
                "./template-assets/youth-leading-adult-supporting--selected.svg": 447,
                "./template-assets/youth-leading-adult-supporting--unselected.svg": 448,
                "./template-assets/zero-hunger--selected.svg": 449,
                "./template-assets/zero-hunger--unselected.svg": 450
            };

            function o(e) {
                var t = l(e);
                return n(t)
            }

            function l(e) {
                if (!n.o(map, e)) {
                    var t = new Error("Cannot find module '" + e + "'");
                    throw t.code = "MODULE_NOT_FOUND", t
                }
                return map[e]
            }
            o.keys = function() {
                return Object.keys(map)
            }, o.resolve = l, e.exports = o, o.id = 903
        }
    }
]);