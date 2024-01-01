(window.webpackJsonp = window.webpackJsonp || []).push([
    [224, 4, 14, 30, 34, 66, 73, 91, 92, 93, 94, 128, 147, 148, 153, 154, 156, 157, 158, 161, 167, 172, 175, 221], {
        1e3: function(t, e, n) {
            "use strict";
            n(965)
        },
        1004: function(t, e, n) {
            "use strict";
            n(972);
            var o = n(869),
                r = n(62),
                l = n(36),
                c = n(2);
            const d = { ...o.b,
                offsetY: !0,
                offsetOverflow: !0,
                transition: !1
            };
            e.a = o.a.extend({
                name: "v-autocomplete",
                props: {
                    autoSelectFirst: {
                        type: Boolean,
                        default: !1
                    },
                    filter: {
                        type: Function,
                        default: (t, e, n) => n.toLocaleLowerCase().indexOf(e.toLocaleLowerCase()) > -1
                    },
                    hideNoData: Boolean,
                    menuProps: {
                        type: o.a.options.props.menuProps.type,
                        default: () => d
                    },
                    noFilter: Boolean,
                    searchInput: {
                        type: String
                    }
                },
                data() {
                    return {
                        lazySearch: this.searchInput
                    }
                },
                computed: {
                    classes() {
                        return { ...o.a.options.computed.classes.call(this),
                            "v-autocomplete": !0,
                            "v-autocomplete--is-selecting-index": this.selectedIndex > -1
                        }
                    },
                    computedItems() {
                        return this.filteredItems
                    },
                    selectedValues() {
                        return this.selectedItems.map(t => this.getValue(t))
                    },
                    hasDisplayedItems() {
                        return this.hideSelected ? this.filteredItems.some(t => !this.hasItem(t)) : this.filteredItems.length > 0
                    },
                    currentRange() {
                        return null == this.selectedItem ? 0 : String(this.getText(this.selectedItem)).length
                    },
                    filteredItems() {
                        return !this.isSearching || this.noFilter || null == this.internalSearch ? this.allItems : this.allItems.filter(t => {
                            const e = Object(c.q)(t, this.itemText),
                                text = null != e ? String(e) : "";
                            return this.filter(t, String(this.internalSearch), text)
                        })
                    },
                    internalSearch: {
                        get() {
                            return this.lazySearch
                        },
                        set(t) {
                            this.lazySearch !== t && (this.lazySearch = t, this.$emit("update:search-input", t))
                        }
                    },
                    isAnyValueAllowed: () => !1,
                    isDirty() {
                        return this.searchIsDirty || this.selectedItems.length > 0
                    },
                    isSearching() {
                        return this.multiple && this.searchIsDirty || this.searchIsDirty && this.internalSearch !== this.getText(this.selectedItem)
                    },
                    menuCanShow() {
                        return !!this.isFocused && (this.hasDisplayedItems || !this.hideNoData)
                    },
                    $_menuProps() {
                        const t = o.a.options.computed.$_menuProps.call(this);
                        return t.contentClass = ("v-autocomplete__content " + (t.contentClass || "")).trim(), { ...d,
                            ...t
                        }
                    },
                    searchIsDirty() {
                        return null != this.internalSearch && "" !== this.internalSearch
                    },
                    selectedItem() {
                        return this.multiple ? null : this.selectedItems.find(i => this.valueComparator(this.getValue(i), this.getValue(this.internalValue)))
                    },
                    listData() {
                        const data = o.a.options.computed.listData.call(this);
                        return data.props = { ...data.props,
                            items: this.virtualizedItems,
                            noFilter: this.noFilter || !this.isSearching || !this.filteredItems.length,
                            searchInput: this.internalSearch
                        }, data
                    }
                },
                watch: {
                    filteredItems: "onFilteredItemsChanged",
                    internalValue: "setSearch",
                    isFocused(t) {
                        t ? (document.addEventListener("copy", this.onCopy), this.$refs.input && this.$refs.input.select()) : (document.removeEventListener("copy", this.onCopy), this.blur(), this.updateSelf())
                    },
                    isMenuActive(t) {
                        !t && this.hasSlot && (this.lazySearch = null)
                    },
                    items(t, e) {
                        e && e.length || !this.hideNoData || !this.isFocused || this.isMenuActive || !t.length || this.activateMenu()
                    },
                    searchInput(t) {
                        this.lazySearch = t
                    },
                    internalSearch: "onInternalSearchChanged",
                    itemText: "updateSelf"
                },
                created() {
                    this.setSearch()
                },
                destroyed() {
                    document.removeEventListener("copy", this.onCopy)
                },
                methods: {
                    onFilteredItemsChanged(t, e) {
                        if (t !== e) {
                            if (!this.autoSelectFirst) {
                                const n = e[this.$refs.menu.listIndex];
                                n ? this.setMenuIndex(t.findIndex(i => i === n)) : this.setMenuIndex(-1), this.$emit("update:list-index", this.$refs.menu.listIndex)
                            }
                            this.$nextTick(() => {
                                this.internalSearch && (1 === t.length || this.autoSelectFirst) && (this.$refs.menu.getTiles(), this.autoSelectFirst && t.length && (this.setMenuIndex(0), this.$emit("update:list-index", this.$refs.menu.listIndex)))
                            })
                        }
                    },
                    onInternalSearchChanged() {
                        this.updateMenuDimensions()
                    },
                    updateMenuDimensions() {
                        this.isMenuActive && this.$refs.menu && this.$refs.menu.updateDimensions()
                    },
                    changeSelectedIndex(t) {
                        this.searchIsDirty || (this.multiple && t === c.x.left ? -1 === this.selectedIndex ? this.selectedIndex = this.selectedItems.length - 1 : this.selectedIndex-- : this.multiple && t === c.x.right ? this.selectedIndex >= this.selectedItems.length - 1 ? this.selectedIndex = -1 : this.selectedIndex++ : t !== c.x.backspace && t !== c.x.delete || this.deleteCurrentItem())
                    },
                    deleteCurrentItem() {
                        const t = this.selectedIndex,
                            e = this.selectedItems[t];
                        if (!this.isInteractive || this.getDisabled(e)) return;
                        const n = this.selectedItems.length - 1;
                        if (-1 === this.selectedIndex && 0 !== n) return void(this.selectedIndex = n);
                        const o = t !== this.selectedItems.length - 1 ? t : t - 1;
                        this.selectedItems[o] ? this.selectItem(e) : this.setValue(this.multiple ? [] : null), this.selectedIndex = o
                    },
                    clearableCallback() {
                        this.internalSearch = null, o.a.options.methods.clearableCallback.call(this)
                    },
                    genInput() {
                        const input = r.a.options.methods.genInput.call(this);
                        return input.data = Object(l.a)(input.data, {
                            attrs: {
                                "aria-activedescendant": Object(c.o)(this.$refs.menu, "activeTile.id"),
                                autocomplete: Object(c.o)(input.data, "attrs.autocomplete", "off")
                            },
                            domProps: {
                                value: this.internalSearch
                            }
                        }), input
                    },
                    genInputSlot() {
                        const slot = o.a.options.methods.genInputSlot.call(this);
                        return slot.data.attrs.role = "combobox", slot
                    },
                    genSelections() {
                        return this.hasSlot || this.multiple ? o.a.options.methods.genSelections.call(this) : []
                    },
                    onClick(t) {
                        this.isInteractive && (this.selectedIndex > -1 ? this.selectedIndex = -1 : this.onFocus(), this.isAppendInner(t.target) || this.activateMenu())
                    },
                    onInput(t) {
                        if (this.selectedIndex > -1 || !t.target) return;
                        const e = t.target,
                            n = e.value;
                        e.value && this.activateMenu(), this.multiple || "" !== n || this.deleteCurrentItem(), this.internalSearch = n, this.badInput = e.validity && e.validity.badInput
                    },
                    onKeyDown(t) {
                        const e = t.keyCode;
                        !t.ctrlKey && [c.x.home, c.x.end].includes(e) || o.a.options.methods.onKeyDown.call(this, t), this.changeSelectedIndex(e)
                    },
                    onSpaceDown(t) {},
                    onTabDown(t) {
                        o.a.options.methods.onTabDown.call(this, t), this.updateSelf()
                    },
                    onUpDown(t) {
                        t.preventDefault(), this.activateMenu()
                    },
                    selectItem(t) {
                        o.a.options.methods.selectItem.call(this, t), this.setSearch()
                    },
                    setSelectedItems() {
                        o.a.options.methods.setSelectedItems.call(this), this.isFocused || this.setSearch()
                    },
                    setSearch() {
                        this.$nextTick(() => {
                            this.multiple && this.internalSearch && this.isMenuActive || (this.internalSearch = !this.selectedItems.length || this.multiple || this.hasSlot ? null : this.getText(this.selectedItem))
                        })
                    },
                    updateSelf() {
                        (this.searchIsDirty || this.internalValue) && (this.multiple || this.valueComparator(this.internalSearch, this.getValue(this.internalValue)) || this.setSearch())
                    },
                    hasItem(t) {
                        return this.selectedValues.indexOf(this.getValue(t)) > -1
                    },
                    onCopy(t) {
                        var e, n;
                        if (-1 === this.selectedIndex) return;
                        const o = this.selectedItems[this.selectedIndex],
                            r = this.getText(o);
                        null === (e = t.clipboardData) || void 0 === e || e.setData("text/plain", r), null === (n = t.clipboardData) || void 0 === n || n.setData("text/vnd.vuetify.autocomplete.item+plain", r), t.preventDefault()
                    }
                }
            })
        },
        1005: function(t, e, n) {
            "use strict";
            n(973)
        },
        1006: function(t, e, n) {
            "use strict";
            var o;
            n.d(e, "a", (function() {
                    return o
                })),
                function(t) {
                    t.CAMPING_CATEGORY = "camping", t.WALKING_HIKE_CATEGORY = "walking_hike"
                }(o || (o = {}))
        },
        1013: function(t, e, n) {
            t.exports = {}
        },
        1014: function(t, e, n) {
            t.exports = {}
        },
        1015: function(t, e, n) {
            t.exports = {}
        },
        1016: function(t, e, n) {
            t.exports = {}
        },
        1017: function(t, e, n) {
            t.exports = {}
        },
        1018: function(t, e, n) {
            t.exports = {}
        },
        1019: function(t, e, n) {
            t.exports = {}
        },
        1020: function(t, e, n) {
            t.exports = {}
        },
        1023: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(886),
                r = n(894),
                l = n(885),
                c = n(1).a.extend({
                    name: "PopupDrawer",
                    props: {
                        titleText: {
                            type: String,
                            default: ""
                        },
                        width: {
                            type: String,
                            default: "700px"
                        },
                        largePadding: {
                            type: Boolean
                        }
                    },
                    data: () => ({
                        drawer: !1
                    }),
                    methods: {
                        show(t) {
                            this.drawer = t
                        }
                    }
                }),
                d = (n(1005), n(9)),
                component = Object(d.a)(c, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e(r.a, {
                        staticClass: "PopupDrawer",
                        class: {
                            "PopupDrawer--large-padding": t.largePadding
                        },
                        style: "min-width: 300px; max-width: 770px; width: " + t.width,
                        attrs: {
                            app: "",
                            temporary: "",
                            right: ""
                        },
                        model: {
                            value: t.drawer,
                            callback: function(e) {
                                t.drawer = e
                            },
                            expression: "drawer"
                        }
                    }, [e(l.a, {
                        staticClass: "mb-4",
                        attrs: {
                            "no-gutters": "",
                            align: "center",
                            justify: "space-between"
                        }
                    }, [e(o.a, {
                        staticClass: "PopupDrawer__title ma-0"
                    }, [t._v(t._s(t.titleText))]), t._v(" "), e(o.a, {
                        attrs: {
                            align: "right"
                        }
                    }, [e("img", {
                        staticClass: "PopupDrawer__close",
                        attrs: {
                            alt: "Close popup drawer button",
                            src: "/images/icon-x.svg"
                        },
                        on: {
                            click: function(e) {
                                t.drawer = !1
                            },
                            keydown: function(e) {
                                t.drawer = !1
                            }
                        }
                    })])], 1), t._v(" "), t._t("default")], 2)
                }), [], !1, null, "6ff45cbe", null);
            e.default = component.exports
        },
        1025: function(t, e) {
            function n(t) {
                var e = new Error("Cannot find module '" + t + "'");
                throw e.code = "MODULE_NOT_FOUND", e
            }
            n.keys = function() {
                return []
            }, n.resolve = n, t.exports = n, n.id = 1025
        },
        1026: function(t, e, n) {
            "use strict";
            n(977)
        },
        1033: function(t, e, n) {
            "use strict";
            n(981)
        },
        1037: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(870),
                r = n(236),
                l = n(35),
                c = n(172),
                d = n(132),
                h = n(241),
                m = n(33),
                v = n(1),
                _ = n(287),
                y = v.a.extend({
                    name: "InProgressAchievementList",
                    props: {
                        items: {
                            type: Array,
                            required: !0
                        }
                    },
                    methods: {
                        fetchIcon: path => n(1025)(`${_.ICON_PATH}${path}.svg`)
                    }
                }),
                f = (n(1026), n(9)),
                component = Object(f.a)(y, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "InProgressAchievementList"
                    }, t._l(t.items, (function(n, i) {
                        return e(r.a, {
                            key: i,
                            staticClass: "InProgressAchievementList__card"
                        }, [e(d.a, {
                            attrs: {
                                "three-line": ""
                            }
                        }, [e(m.a, [e(m.c, {
                            staticClass: "mt-0"
                        }, [t._v(t._s(n.title))])], 1), t._v(" "), n.iconPath ? e(h.a, {
                            attrs: {
                                size: "48"
                            }
                        }, [e(c.a, {
                            attrs: {
                                src: t.fetchIcon(n.iconPath)
                            }
                        })], 1) : t._e()], 1), t._v(" "), e(l.a, [e(o.a, {
                            attrs: {
                                text: ""
                            },
                            on: {
                                click: function(t) {
                                    return t.stopPropagation(), n.actions[0].callback.apply(null, arguments)
                                }
                            }
                        }, [t._v("VIEW")])], 1)], 1)
                    })), 1)
                }), [], !1, null, "30dc1952", null);
            e.default = component.exports
        },
        1042: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(870),
                r = n(886),
                l = n(885),
                c = n(99),
                d = n(891),
                h = n(1198),
                m = n(1199),
                v = n(11),
                _ = n.n(v),
                y = n(23),
                f = n.n(y),
                w = n(171),
                k = n(1058),
                C = n(40),
                A = n(79),
                T = n(974),
                S = n(5),
                P = n(4),
                $ = n(950),
                x = C.f.extend({
                    name: "Comments",
                    components: {
                        Loading: $.default,
                        AchievementOverview: T.default,
                        ConfirmationDialog: A.default
                    },
                    props: {
                        activity: {
                            type: Object,
                            default: null
                        }
                    },
                    data: () => ({
                        comments: [],
                        deleteModal: !1,
                        events: [],
                        input: null,
                        loading: !1,
                        deleteRequestPending: !1,
                        postRequestPending: !1,
                        commentId: "",
                        exportedComments: [],
                        LABEL: S.i
                    }),
                    created() {
                        this.refreshComments()
                    },
                    computed: {
                        timeline() {
                            return this.events.slice().reverse()
                        },
                        hasComments() {
                            var t;
                            return !!(null === (t = this.comments) || void 0 === t ? void 0 : t.length)
                        },
                        isConcluded() {
                            var t;
                            return (null === (t = this.activity) || void 0 === t ? void 0 : t.status) === P.EVENT_STATUS.CONCLUDED
                        }
                    },
                    methods: {
                        getCommentsPath() {
                            return `${this.getPathPrefix()}${P.COMMENTS_PATH}`
                        },
                        getCommentsPathForComment(t) {
                            return `${this.getCommentsPath()}/${t}`
                        },
                        getExportCommentsPath() {
                            return `${this.getPathPrefix()}${P.EXPORT_COMMENTS_PATH}`
                        },
                        getPathPrefix() {
                            var t;
                            return this.getPathPrefixForActivity(null === (t = this.activity) || void 0 === t ? void 0 : t.id)
                        },
                        getPathPrefixForActivity(t) {
                            return `${this.$config.api.events}${P.EVENTS_PATH}/${t}`
                        },
                        getIconColourForCurrentMember() {
                            const t = this.$accessor.user.getCurrentMemberSection;
                            return Object(S.E)(t)
                        },
                        getIconColourForMember(t) {
                            var e;
                            const n = null !== (e = null == t ? void 0 : t.section) && void 0 !== e ? e : "";
                            return Object(S.E)(n)
                        },
                        async refreshComments() {
                            this.comments = await this.getComments(), this.loading = !1
                        },
                        confirmDelete(t) {
                            this.commentId = t, this.deleteModal = !0
                        },
                        async exportComments() {
                            const t = await this.fetchExportedComments();
                            this.downloadExportedComments(t)
                        },
                        fetchExportedComments() {
                            return _.a.get(this.getExportCommentsPath()).then(t => t.data).catch(t => console.error("Failed to get the exported comments. Error:", t))
                        },
                        downloadExportedComments(t) {
                            const e = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(t)),
                                n = this.initialDate(this.activity.start_datetime),
                                o = document.getElementsByClassName("Comments__export-link")[0],
                                r = `ScoutsTerrain-activity-comments-${n}.json`;
                            o.setAttribute("href", e), o.setAttribute("download", r), o.click()
                        },
                        commentDate(t) {
                            const e = Object(k.a)(new Date(t), "Australia/Melbourne");
                            return Object(w.a)(e, "yyyy-MM-dd HH:mm") + " AEST"
                        },
                        getComments() {
                            return _.a.get(this.getCommentsPath()).then(t => t.data.results).catch(t => console.error("Failed to get the Activity comments. Error:", t))
                        },
                        postComment() {
                            this.$data.postRequestPending = !0, this.httpRequest({
                                axiosRequest: _.a.post,
                                url: this.getCommentsPath(),
                                body: {
                                    member_id: this.$accessor.user.getUserId,
                                    text: this.input
                                },
                                successResponseCode: f.a.CREATED,
                                successMessage: "Comment posted",
                                errorMessage: "Error posting comment",
                                showSnackbar: !0,
                                responseHandler: () => {
                                    this.refreshComments(), this.$data.input = "", this.$data.postRequestPending = !1
                                },
                                errorHandler: () => {
                                    this.$data.postRequestPending = !1
                                }
                            })
                        },
                        deleteComment() {
                            this.$data.deleteRequestPending = !0, this.httpRequest({
                                axiosRequest: _.a.delete,
                                url: this.getCommentsPathForComment(this.commentId),
                                body: {
                                    member_id: this.$accessor.user.getUserId,
                                    text: this.input
                                },
                                successResponseCode: f.a.NO_CONTENT,
                                successMessage: "Comment deleted",
                                errorMessage: "Error deleting comment",
                                showSnackbar: !0,
                                responseHandler: () => {
                                    this.refreshComments(), this.$data.deleteRequestPending = !1
                                },
                                errorHandler: () => {
                                    this.$data.deleteRequestPending = !1
                                }
                            })
                        }
                    }
                }),
                I = (n(1033), n(9)),
                component = Object(I.a)(x, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "Comments"
                    }, [e("Loading", {
                        attrs: {
                            loading: t.loading,
                            overlay: ""
                        }
                    }), t._v(" "), t.loading ? t._e() : e("div", [e(l.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(r.a, [e(h.a, {
                        class: {
                            "Comments--hide-timeline": !t.loading || !t.hasComments
                        },
                        attrs: {
                            dense: "",
                            clipped: ""
                        }
                    }, [t.isConcluded ? t._e() : e(m.a, {
                        staticClass: "white--text mb-0",
                        attrs: {
                            "fill-dot": "",
                            "icon-color": t.getIconColourForCurrentMember()
                        },
                        scopedSlots: t._u([{
                            key: "icon",
                            fn: function() {
                                return [e("span", {
                                    staticClass: "Comments__initials"
                                }, [t._v(t._s(t.memberInitials))])]
                            },
                            proxy: !0
                        }], null, !1, 1064201718)
                    }, [t._v(" "), e("div", {
                        staticClass: "Comments__comment-box"
                    }, [e("div", {
                        staticClass: "pa-6"
                    }, [e("div", {
                        staticClass: "Comments__comment-box-triangle"
                    }), t._v(" "), e("div", {
                        staticClass: "Comments__meta-container"
                    }, [e("div", {
                        staticClass: "Comments__comment-name"
                    }, [t._v("You (" + t._s(t.$accessor.user.getMemberFullName) + ")")])]), t._v(" "), e("div", {
                        staticClass: "flex flex-column"
                    }, [e(d.a, {
                        staticClass: "Comments__comment-text",
                        attrs: {
                            disabled: t.$nuxt.isOffline,
                            label: "Leave a comment...",
                            solo: "",
                            maxlength: "200",
                            "auto-grow": "",
                            "row-height": 6
                        },
                        scopedSlots: t._u([{
                            key: "append",
                            fn: function() {
                                return [e(o.a, {
                                    staticClass: "mx-0",
                                    attrs: {
                                        primary: "",
                                        disabled: t.$nuxt.isOffline || t.deleteRequestPending || !t.input,
                                        loading: t.postRequestPending
                                    },
                                    on: {
                                        click: t.postComment
                                    }
                                }, [t._v("\n                        Post\n                      ")])]
                            },
                            proxy: !0
                        }], null, !1, 2872980671),
                        model: {
                            value: t.input,
                            callback: function(e) {
                                t.input = e
                            },
                            expression: "input"
                        }
                    })], 1)])])]), t._v(" "), t.loading ? t._e() : [e(c.d, {
                        attrs: {
                            group: ""
                        }
                    }, t._l(t.comments, (function(n, o) {
                        return e(m.a, {
                            key: o,
                            attrs: {
                                "icon-color": t.getIconColourForMember(n.member)
                            },
                            scopedSlots: t._u([{
                                key: "icon",
                                fn: function() {
                                    return [e("span", {
                                        staticClass: "Comments__initials"
                                    }, [t._v(t._s(n.member.initials))])]
                                },
                                proxy: !0
                            }], null, !0)
                        }, [t._v(" "), e(l.a, {
                            attrs: {
                                justify: "space-between",
                                "no-gutters": ""
                            }
                        }, [e("div", {
                            staticClass: "Comments__comment-box"
                        }, [e("div", {
                            staticClass: "pa-6"
                        }, [e("div", {
                            staticClass: "Comments__comment-box-triangle"
                        }), t._v(" "), e(l.a, {
                            attrs: {
                                "no-gutters": ""
                            }
                        }, [e("div", {
                            staticClass: "Comments__meta-container"
                        }, [e("div", {
                            staticClass: "Comments__comment-name"
                        }, [t._v("\n                            " + t._s(n.member.name) + "\n                          ")]), t._v(" "), e("div", {
                            staticClass: "Comments__comment-date"
                        }, [t._v("\n                            " + t._s(t.commentDate(n.created_datetime)) + "\n                          ")])])]), t._v(" "), e(l.a, {
                            staticClass: "mt-4",
                            attrs: {
                                "no-gutters": ""
                            }
                        }, [e(r.a, {
                            attrs: {
                                cols: "12"
                            }
                        }, [e("div", {
                            staticClass: "Comments__comment-box-comment"
                        }, [t._v(t._s(n.text))])])], 1)], 1), t._v(" "), !t.isUserOrganiser(t.getOrganisers) && !t.isUserEventOwner() || t.isConcluded ? t._e() : [e("div", {
                            staticClass: "Comments__divider"
                        }), t._v(" "), e(l.a, {
                            attrs: {
                                "no-gutters": ""
                            }
                        }, [e(r.a, {
                            staticClass: "Comments__comment-actions-row",
                            attrs: {
                                cols: "12"
                            }
                        }, [t.$nuxt.isOnline ? e("div", {
                            staticClass: "Comments__comment-box-link",
                            attrs: {
                                disabled: t.deleteRequestPending
                            },
                            on: {
                                click: function(e) {
                                    return t.confirmDelete(n.id)
                                },
                                keydown: function(e) {
                                    return t.confirmDelete(n.id)
                                }
                            }
                        }, [t._v("\n                            Delete comment\n                          ")]) : t._e()])], 1)]], 2)])], 1)
                    })), 1)], t._v(" "), t.isConcluded && !t.hasComments ? e(l.a, [e(r.a, [t._v("No comments for this activity.")])], 1) : t._e()], 2)], 1)], 1), t._v(" "), t.hasComments && (t.isUserOrganiser(t.getOrganisers) || t.isUserEventOwner()) ? e(l.a, [e(r.a, {
                        class: {
                            "Comments__bottom-container": !t.isConcluded || t.hasComments
                        }
                    }, [e(o.a, {
                        attrs: {
                            disabled: t.$nuxt.isOffline,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return e.stopPropagation(), t.exportComments()
                            },
                            keydown: function(e) {
                                return e.stopPropagation(), t.exportComments()
                            }
                        }
                    }, [t._v("\n          " + t._s(t.LABEL.EXPORT_COMMENTS) + "\n        ")])], 1)], 1) : t._e()], 1), t._v(" "), e("ConfirmationDialog", {
                        attrs: {
                            model: t.deleteModal,
                            title: "Delete comment?",
                            subtitle: "This comment will be deleted from the Comments section. All comments are retained in the database log.",
                            "confirm-button-label": t.LABEL.DELETE,
                            "close-button-label": t.LABEL.CANCEL,
                            "confirm-callback": t.deleteComment,
                            "close-dialog": () => t.deleteModal = !1
                        }
                    }), t._v(" "), e("a", {
                        staticClass: "Comments__export-link mr-4"
                    }, [t._v(" ")])], 1)
                }), [], !1, null, "4631c48a", null);
            e.default = component.exports;
            installComponents(component, {
                Loading: n(950).default,
                ConfirmationDialog: n(79).default
            })
        },
        1043: function(t, e, n) {
            "use strict";
            n(992)
        },
        1056: function(t, e, n) {
            "use strict";
            n(997)
        },
        1057: function(t, e, n) {
            t.exports = {}
        },
        1058: function(t, e, n) {
            "use strict";

            function o(t, e) {
                var n = function(t) {
                    if (!l[t]) {
                        var e = new Intl.DateTimeFormat("en-US", {
                                hour12: !1,
                                timeZone: "America/New_York",
                                year: "numeric",
                                month: "numeric",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit"
                            }).format(new Date("2014-06-25T04:00:00.123Z")),
                            n = "06/25/2014, 00:00:00" === e || "‎06‎/‎25‎/‎2014‎ ‎00‎:‎00‎:‎00" === e;
                        l[t] = n ? new Intl.DateTimeFormat("en-US", {
                            hour12: !1,
                            timeZone: t,
                            year: "numeric",
                            month: "numeric",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                        }) : new Intl.DateTimeFormat("en-US", {
                            hourCycle: "h23",
                            timeZone: t,
                            year: "numeric",
                            month: "numeric",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                        })
                    }
                    return l[t]
                }(e);
                return n.formatToParts ? function(t, e) {
                    try {
                        for (var n = t.formatToParts(e), o = [], i = 0; i < n.length; i++) {
                            var l = r[n[i].type];
                            l >= 0 && (o[l] = parseInt(n[i].value, 10))
                        }
                        return o
                    } catch (t) {
                        if (t instanceof RangeError) return [NaN];
                        throw t
                    }
                }(n, t) : function(t, e) {
                    var n = t.format(e).replace(/\u200E/g, ""),
                        o = /(\d+)\/(\d+)\/(\d+),? (\d+):(\d+):(\d+)/.exec(n);
                    return [o[3], o[1], o[2], o[4], o[5], o[6]]
                }(n, t)
            }
            n.d(e, "a", (function() {
                return M
            }));
            var r = {
                year: 0,
                month: 1,
                day: 2,
                hour: 3,
                minute: 4,
                second: 5
            };
            var l = {};

            function c(t, e, n, o, r, l, c) {
                var d = new Date(0);
                return d.setUTCFullYear(t, e, n), d.setUTCHours(o, r, l, c), d
            }
            var d = {
                timezone: /([Z+-].*)$/,
                timezoneZ: /^(Z)$/,
                timezoneHH: /^([+-]\d{2})$/,
                timezoneHHMM: /^([+-]\d{2}):?(\d{2})$/
            };

            function h(t, e, n) {
                var o, r, l;
                if (!t) return 0;
                if (o = d.timezoneZ.exec(t)) return 0;
                if (o = d.timezoneHH.exec(t)) return v(l = parseInt(o[1], 10)) ? -36e5 * l : NaN;
                if (o = d.timezoneHHMM.exec(t)) {
                    l = parseInt(o[1], 10);
                    var h = parseInt(o[2], 10);
                    return v(l, h) ? (r = 36e5 * Math.abs(l) + 6e4 * h, l > 0 ? -r : r) : NaN
                }
                if (function(t) {
                        if (_[t]) return !0;
                        try {
                            return new Intl.DateTimeFormat(void 0, {
                                timeZone: t
                            }), _[t] = !0, !0
                        } catch (t) {
                            return !1
                        }
                    }(t)) {
                    e = new Date(e || Date.now());
                    var y = m(n ? e : function(t) {
                        return c(t.getFullYear(), t.getMonth(), t.getDate(), t.getHours(), t.getMinutes(), t.getSeconds(), t.getMilliseconds())
                    }(e), t);
                    return -(n ? y : function(t, e, n) {
                        var o = t.getTime() - e,
                            r = m(new Date(o), n);
                        if (e === r) return e;
                        o -= r - e;
                        var l = m(new Date(o), n);
                        if (r === l) return r;
                        return Math.max(r, l)
                    }(e, y, t))
                }
                return NaN
            }

            function m(t, e) {
                var n = o(t, e),
                    r = c(n[0], n[1] - 1, n[2], n[3] % 24, n[4], n[5], 0).getTime(),
                    l = t.getTime(),
                    d = l % 1e3;
                return r - (l -= d >= 0 ? d : 1e3 + d)
            }

            function v(t, e) {
                return -23 <= t && t <= 23 && (null == e || 0 <= e && e <= 59)
            }
            var _ = {};
            var y = n(1080),
                f = n.n(y),
                w = n(1081),
                k = n.n(w),
                C = {
                    dateTimePattern: /^([0-9W+-]+)(T| )(.*)/,
                    datePattern: /^([0-9W+-]+)(.*)/,
                    plainTime: /:/,
                    YY: /^(\d{2})$/,
                    YYY: [/^([+-]\d{2})$/, /^([+-]\d{3})$/, /^([+-]\d{4})$/],
                    YYYY: /^(\d{4})/,
                    YYYYY: [/^([+-]\d{4})/, /^([+-]\d{5})/, /^([+-]\d{6})/],
                    MM: /^-(\d{2})$/,
                    DDD: /^-?(\d{3})$/,
                    MMDD: /^-?(\d{2})-?(\d{2})$/,
                    Www: /^-?W(\d{2})$/,
                    WwwD: /^-?W(\d{2})-?(\d{1})$/,
                    HH: /^(\d{2}([.,]\d*)?)$/,
                    HHMM: /^(\d{2}):?(\d{2}([.,]\d*)?)$/,
                    HHMMSS: /^(\d{2}):?(\d{2}):?(\d{2}([.,]\d*)?)$/,
                    timeZone: /(Z|[+-]\d{2}(?::?\d{2})?| UTC| [a-zA-Z]+\/[a-zA-Z_]+(?:\/[a-zA-Z_]+)?)$/
                };

            function A(t) {
                var e, n = {},
                    o = C.dateTimePattern.exec(t);
                if (o ? (n.date = o[1], e = o[3]) : (o = C.datePattern.exec(t)) ? (n.date = o[1], e = o[2]) : (n.date = null, e = t), e) {
                    var r = C.timeZone.exec(e);
                    r ? (n.time = e.replace(r[1], ""), n.timeZone = r[1].trim()) : n.time = e
                }
                return n
            }

            function T(t, e) {
                var n, o = C.YYY[e],
                    r = C.YYYYY[e];
                if (n = C.YYYY.exec(t) || r.exec(t)) {
                    var l = n[1];
                    return {
                        year: parseInt(l, 10),
                        restDateString: t.slice(l.length)
                    }
                }
                if (n = C.YY.exec(t) || o.exec(t)) {
                    var c = n[1];
                    return {
                        year: 100 * parseInt(c, 10),
                        restDateString: t.slice(c.length)
                    }
                }
                return {
                    year: null
                }
            }

            function S(t, e) {
                if (null === e) return null;
                var n, o, r, l;
                if (0 === t.length) return (o = new Date(0)).setUTCFullYear(e), o;
                if (n = C.MM.exec(t)) return o = new Date(0), E(e, r = parseInt(n[1], 10) - 1) ? (o.setUTCFullYear(e, r), o) : new Date(NaN);
                if (n = C.DDD.exec(t)) {
                    o = new Date(0);
                    var c = parseInt(n[1], 10);
                    return function(t, e) {
                        if (e < 1) return !1;
                        var n = D(t);
                        if (n && e > 366) return !1;
                        if (!n && e > 365) return !1;
                        return !0
                    }(e, c) ? (o.setUTCFullYear(e, 0, c), o) : new Date(NaN)
                }
                if (n = C.MMDD.exec(t)) {
                    o = new Date(0), r = parseInt(n[1], 10) - 1;
                    var d = parseInt(n[2], 10);
                    return E(e, r, d) ? (o.setUTCFullYear(e, r, d), o) : new Date(NaN)
                }
                if (n = C.Www.exec(t)) return O(e, l = parseInt(n[1], 10) - 1) ? $(e, l) : new Date(NaN);
                if (n = C.WwwD.exec(t)) {
                    l = parseInt(n[1], 10) - 1;
                    var h = parseInt(n[2], 10) - 1;
                    return O(e, l, h) ? $(e, l, h) : new Date(NaN)
                }
                return null
            }

            function P(t) {
                var e, n, o;
                if (e = C.HH.exec(t)) return L(n = parseFloat(e[1].replace(",", "."))) ? n % 24 * 36e5 : NaN;
                if (e = C.HHMM.exec(t)) return L(n = parseInt(e[1], 10), o = parseFloat(e[2].replace(",", "."))) ? n % 24 * 36e5 + 6e4 * o : NaN;
                if (e = C.HHMMSS.exec(t)) {
                    n = parseInt(e[1], 10), o = parseInt(e[2], 10);
                    var r = parseFloat(e[3].replace(",", "."));
                    return L(n, o, r) ? n % 24 * 36e5 + 6e4 * o + 1e3 * r : NaN
                }
                return null
            }

            function $(t, e, n) {
                e = e || 0, n = n || 0;
                var o = new Date(0);
                o.setUTCFullYear(t, 0, 4);
                var r = 7 * e + n + 1 - (o.getUTCDay() || 7);
                return o.setUTCDate(o.getUTCDate() + r), o
            }
            var x = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
                I = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

            function D(t) {
                return t % 400 == 0 || t % 4 == 0 && t % 100 != 0
            }

            function E(t, e, n) {
                if (e < 0 || e > 11) return !1;
                if (null != n) {
                    if (n < 1) return !1;
                    var o = D(t);
                    if (o && n > I[e]) return !1;
                    if (!o && n > x[e]) return !1
                }
                return !0
            }

            function O(t, e, n) {
                return !(e < 0 || e > 52) && (null == n || !(n < 0 || n > 6))
            }

            function L(t, e, n) {
                return (null == t || !(t < 0 || t >= 25)) && ((null == e || !(e < 0 || e >= 60)) && (null == n || !(n < 0 || n >= 60)))
            }

            function M(t, e, n) {
                var o = function(t, e) {
                        if (arguments.length < 1) throw new TypeError("1 argument required, but only " + arguments.length + " present");
                        if (null === t) return new Date(NaN);
                        var n = e || {},
                            o = null == n.additionalDigits ? 2 : f()(n.additionalDigits);
                        if (2 !== o && 1 !== o && 0 !== o) throw new RangeError("additionalDigits must be 0, 1 or 2");
                        if (t instanceof Date || "object" == typeof t && "[object Date]" === Object.prototype.toString.call(t)) return new Date(t.getTime());
                        if ("number" == typeof t || "[object Number]" === Object.prototype.toString.call(t)) return new Date(t);
                        if ("string" != typeof t && "[object String]" !== Object.prototype.toString.call(t)) return new Date(NaN);
                        var r = A(t),
                            l = T(r.date, o),
                            c = l.year,
                            d = l.restDateString,
                            m = S(d, c);
                        if (isNaN(m)) return new Date(NaN);
                        if (m) {
                            var v, _ = m.getTime(),
                                time = 0;
                            if (r.time && (time = P(r.time), isNaN(time))) return new Date(NaN);
                            if (r.timeZone || n.timeZone) {
                                if (v = h(r.timeZone || n.timeZone, new Date(_ + time)), isNaN(v)) return new Date(NaN)
                            } else v = k()(new Date(_ + time)), v = k()(new Date(_ + time + v));
                            return new Date(_ + time + v)
                        }
                        return new Date(NaN)
                    }(t, n),
                    r = h(e, o, !0),
                    l = new Date(o.getTime() - r),
                    c = new Date(0);
                return c.setFullYear(l.getUTCFullYear(), l.getUTCMonth(), l.getUTCDate()), c.setHours(l.getUTCHours(), l.getUTCMinutes(), l.getUTCSeconds(), l.getUTCMilliseconds()), c
            }
        },
        1061: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(870),
                r = n(1),
                l = n(5),
                c = r.a.extend({
                    name: "CommentsPopupButton",
                    props: {
                        visible: {
                            type: Boolean,
                            default: !0
                        },
                        disabled: {
                            type: Boolean,
                            default: !0
                        },
                        activity: {
                            type: Object,
                            default: null
                        }
                    },
                    data: () => ({
                        LABEL: l.i,
                        enableComments: !1
                    }),
                    computed: {
                        drawerWidth() {
                            return this.$vuetify.breakpoint.smAndDown ? "100%" : "75%"
                        }
                    },
                    methods: {
                        openComments() {
                            this.$data.enableComments = !0, this.$refs.commentsDrawer.show(!0)
                        }
                    }
                }),
                d = n(9),
                component = Object(d.a)(c, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("section", [t.visible ? e(o.a, {
                        staticClass: "pr-0",
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.disabled,
                            small: "",
                            text: ""
                        },
                        on: {
                            click: function(e) {
                                return e.stopPropagation(), t.openComments()
                            }
                        }
                    }, [e("Icon", {
                        staticClass: "Layout__icon",
                        attrs: {
                            name: "comments",
                            label: t.LABEL.COMMENTS,
                            outline: "",
                            "right-icon": !0
                        }
                    })], 1) : t._e(), t._v(" "), e("PopupDrawer", {
                        ref: "commentsDrawer",
                        attrs: {
                            "title-text": t.LABEL.COMMENTS,
                            width: t.drawerWidth,
                            "large-padding": ""
                        }
                    }, [t.enableComments ? e("Comments", {
                        attrs: {
                            activity: t.activity
                        }
                    }) : t._e()], 1)], 1)
                }), [], !1, null, "c12ecb7e", null);
            e.default = component.exports;
            installComponents(component, {
                Icon: n(55).default,
                Comments: n(1042).default,
                PopupDrawer: n(1023).default
            })
        },
        1062: function(t, e, n) {
            "use strict";
            const o = {
                    HOUR_TOKENS: ["HH", "H", "hh", "h", "kk", "k"],
                    MINUTE_TOKENS: ["mm", "m"],
                    SECOND_TOKENS: ["ss", "s"],
                    APM_TOKENS: ["A", "a"],
                    BASIC_TYPES: ["hour", "minute", "second", "apm"]
                },
                r = {
                    format: "HH:mm",
                    minuteInterval: 1,
                    secondInterval: 1,
                    hourRange: null,
                    minuteRange: null,
                    secondRange: null,
                    hideDisabledHours: !1,
                    hideDisabledMinutes: !1,
                    hideDisabledSeconds: !1,
                    hideDisabledItems: !1,
                    hideDropdown: !1,
                    blurDelay: 300,
                    manualInputTimeout: 1e3,
                    dropOffsetHeight: 160
                };
            var l = {
                    name: "VueTimepicker",
                    props: {
                        value: {
                            type: [Object, String]
                        },
                        format: {
                            type: String
                        },
                        minuteInterval: {
                            type: [Number, String]
                        },
                        secondInterval: {
                            type: [Number, String]
                        },
                        hourRange: {
                            type: Array
                        },
                        minuteRange: {
                            type: Array
                        },
                        secondRange: {
                            type: Array
                        },
                        hideDisabledHours: {
                            type: Boolean,
                            default: !1
                        },
                        hideDisabledMinutes: {
                            type: Boolean,
                            default: !1
                        },
                        hideDisabledSeconds: {
                            type: Boolean,
                            default: !1
                        },
                        hideDisabledItems: {
                            type: Boolean,
                            default: !1
                        },
                        hideClearButton: {
                            type: Boolean,
                            default: !1
                        },
                        disabled: {
                            type: Boolean,
                            default: !1
                        },
                        closeOnComplete: {
                            type: Boolean,
                            default: !1
                        },
                        id: {
                            type: String
                        },
                        name: {
                            type: String
                        },
                        inputClass: {
                            type: [String, Object, Array]
                        },
                        placeholder: {
                            type: String
                        },
                        tabindex: {
                            type: [Number, String],
                            default: 0
                        },
                        inputWidth: {
                            type: String
                        },
                        autocomplete: {
                            type: String,
                            default: "off"
                        },
                        hourLabel: {
                            type: String
                        },
                        minuteLabel: {
                            type: String
                        },
                        secondLabel: {
                            type: String
                        },
                        apmLabel: {
                            type: String
                        },
                        amText: {
                            type: String
                        },
                        pmText: {
                            type: String
                        },
                        blurDelay: {
                            type: [Number, String]
                        },
                        advancedKeyboard: {
                            type: Boolean,
                            default: !1
                        },
                        lazy: {
                            type: Boolean,
                            default: !1
                        },
                        autoScroll: {
                            type: Boolean,
                            default: !1
                        },
                        dropDirection: {
                            type: String,
                            default: "down"
                        },
                        dropOffsetHeight: {
                            type: [Number, String]
                        },
                        containerId: {
                            type: String
                        },
                        appendToBody: {
                            type: Boolean,
                            default: !1
                        },
                        manualInput: {
                            type: Boolean,
                            default: !1
                        },
                        manualInputTimeout: {
                            type: [Number, String]
                        },
                        hideDropdown: {
                            type: Boolean,
                            default: !1
                        },
                        fixedDropdownButton: {
                            type: Boolean,
                            default: !1
                        },
                        debugMode: {
                            type: Boolean,
                            default: !1
                        }
                    },
                    data: () => ({
                        timeValue: {},
                        hours: [],
                        minutes: [],
                        seconds: [],
                        apms: [],
                        isActive: !1,
                        showDropdown: !1,
                        isFocusing: !1,
                        debounceTimer: void 0,
                        hourType: "HH",
                        minuteType: "mm",
                        secondType: "",
                        apmType: "",
                        hour: "",
                        minute: "",
                        second: "",
                        apm: "",
                        fullValues: void 0,
                        bakDisplayTime: void 0,
                        doClearApmChecking: !1,
                        selectionTimer: void 0,
                        kbInputTimer: void 0,
                        kbInputLog: "",
                        bakCurrentPos: void 0,
                        forceDropOnTop: !1
                    }),
                    computed: {
                        opts() {
                            const t = Object.assign({}, r);
                            return this.format && this.format.length && (t.format = String(this.format)), this.isNumber(this.minuteInterval) && (t.minuteInterval = +this.minuteInterval), (!t.minuteInterval || t.minuteInterval < 1 || t.minuteInterval > 60) && (this.debugMode && (t.minuteInterval > 60 ? this.debugLog('"minute-interval" should be less than 60. Current value is ' + this.minuteInterval) : (0 === t.minuteInterval || t.minuteInterval < 1) && this.debugLog('"minute-interval" should be NO less than 1. Current value is ' + this.minuteInterval)), 0 === t.minuteInterval ? t.minuteInterval = 60 : t.minuteInterval = 1), this.isNumber(this.secondInterval) && (t.secondInterval = +this.secondInterval), (!t.secondInterval || t.secondInterval < 1 || t.secondInterval > 60) && (this.debugMode && (t.secondInterval > 60 ? this.debugLog('"second-interval" should be less than 60. Current value is ' + this.secondInterval) : (0 === t.secondInterval || t.secondInterval < 1) && this.debugLog('"second-interval" should be NO less than 1. Current value is ' + this.secondInterval)), 0 === t.secondInterval ? t.secondInterval = 60 : t.secondInterval = 1), this.hourRange && Array.isArray(this.hourRange) && (t.hourRange = JSON.parse(JSON.stringify(this.hourRange)), !this.hourRange.length && this.debugMode && this.debugLog('The "hour-range" array is empty (length === 0)')), this.minuteRange && Array.isArray(this.minuteRange) && (t.minuteRange = JSON.parse(JSON.stringify(this.minuteRange)), !this.minuteRange.length && this.debugMode && this.debugLog('The "minute-range" array is empty (length === 0)')), this.secondRange && Array.isArray(this.secondRange) && (t.secondRange = JSON.parse(JSON.stringify(this.secondRange)), !this.secondRange.length && this.debugMode && this.debugLog('The "second-range" array is empty (length === 0)')), this.hideDisabledItems && (t.hideDisabledItems = !0), (this.hideDisabledHours || this.hideDisabledItems) && (t.hideDisabledHours = !0), (this.hideDisabledMinutes || this.hideDisabledItems) && (t.hideDisabledMinutes = !0), (this.hideDisabledSeconds || this.hideDisabledItems) && (t.hideDisabledSeconds = !0), this.hideDropdown && (this.manualInput ? t.hideDropdown = !0 : this.debugMode && this.debugLog('"hide-dropdown" only works with "manual-input" mode')), this.blurDelay && +this.blurDelay > 0 && (t.blurDelay = +this.blurDelay), this.manualInputTimeout && +this.manualInputTimeout > 0 && (t.manualInputTimeout = +this.manualInputTimeout), this.dropOffsetHeight && +this.dropOffsetHeight > 0 && (t.dropOffsetHeight = +this.dropOffsetHeight), t
                        },
                        useStringValue() {
                            return "string" == typeof this.value
                        },
                        formatString() {
                            return this.opts.format || r.format
                        },
                        inUse() {
                            const t = o.BASIC_TYPES.filter(t => this.getTokenByType(t));
                            t.sort((t, e) => this.formatString.indexOf(this.getTokenByType(t) || null) - this.formatString.indexOf(this.getTokenByType(e) || null));
                            const e = t.map(t => this.getTokenByType(t));
                            return {
                                hour: !!this.hourType,
                                minute: !!this.minuteType,
                                second: !!this.secondType,
                                apm: !!this.apmType,
                                types: t || [],
                                tokens: e || []
                            }
                        },
                        displayTime() {
                            let t = String(this.formatString);
                            return this.hour && (t = t.replace(new RegExp(this.hourType, "g"), this.hour)), this.minute && (t = t.replace(new RegExp(this.minuteType, "g"), this.minute)), this.second && this.secondType && (t = t.replace(new RegExp(this.secondType, "g"), this.second)), this.apm && this.apmType && (t = t.replace(new RegExp(this.apmType, "g"), this.apm)), t
                        },
                        customDisplayTime() {
                            return this.amText || this.pmText ? this.displayTime.replace(new RegExp(this.apm, "g"), this.apmDisplayText(this.apm)) : this.displayTime
                        },
                        inputIsEmpty() {
                            return this.formatString === this.displayTime
                        },
                        allValueSelected() {
                            return !(this.inUse.hour && !this.hour || this.inUse.minute && !this.minute || this.inUse.second && !this.second || this.inUse.apm && !this.apm)
                        },
                        columnsSequence() {
                            return this.inUse.types.map(t => t) || []
                        },
                        showClearBtn() {
                            return !this.hideClearButton && !this.disabled && !this.inputIsEmpty
                        },
                        showDropdownBtn() {
                            return !!this.fixedDropdownButton || !(!this.opts.hideDropdown || !this.isActive || this.showDropdown)
                        },
                        baseOn12Hours() {
                            return "h" === this.hourType || "hh" === this.hourType
                        },
                        hourRangeIn24HrFormat() {
                            if (!this.hourType || !this.opts.hourRange) return !1;
                            if (!this.opts.hourRange.length) return [];
                            const t = [];
                            return this.opts.hourRange.forEach(e => {
                                if (e instanceof Array) {
                                    e.length > 2 && this.debugMode && this.debugLog(`Nested array within "hour-range" must contain no more than two items. Only the first two items of ${JSON.stringify(e)} will be taken into account.`);
                                    let n = e[0],
                                        o = e[1] || e[0];
                                    this.is12hRange(n) && (n = this.translate12hRange(n)), this.is12hRange(o) && (o = this.translate12hRange(o));
                                    for (let i = +n; i <= +o; i++) i < 0 || i > 24 || t.includes(i) || t.push(i)
                                } else {
                                    if ((e = this.is12hRange(e) ? this.translate12hRange(e) : +e) < 0 || e > 24) return;
                                    t.includes(e) || t.push(e)
                                }
                            }), t.sort((t, e) => t - e), t
                        },
                        restrictedHourRange() {
                            if (!this.hourRangeIn24HrFormat) return !1;
                            if (this.baseOn12Hours) {
                                return this.hourRangeIn24HrFormat.map(t => 12 === t ? "12p" : 24 === t || 0 === t ? "12a" : t > 12 ? t % 12 + "p" : t + "a")
                            }
                            return this.hourRangeIn24HrFormat
                        },
                        validHoursList() {
                            if (!this.manualInput) return !1;
                            if (this.restrictedHourRange) {
                                let t = [];
                                if (this.baseOn12Hours) {
                                    t = this.restrictedHourRange.map(hr => {
                                        const t = hr.substr(0, hr.length - 1),
                                            e = hr.substr(-1);
                                        return `${this.formatValue(this.hourType,t)}${e}`
                                    });
                                    const e = t.indexOf("12a");
                                    return e > 0 && t.unshift(t.splice(e, 1)[0]), t
                                }
                                return t = this.restrictedHourRange.map(hr => this.formatValue(this.hourType, hr)), t.length > 1 && t[0] && "24" === t[0] && t.push(t.shift()), t
                            }
                            return this.baseOn12Hours ? [].concat([], this.hours.map(hr => hr + "a"), this.hours.map(hr => hr + "p")) : this.hours
                        },
                        has() {
                            const t = {
                                    customApmText: !1
                                },
                                e = !!this.apmType;
                            if (e && this.hourRangeIn24HrFormat && this.hourRangeIn24HrFormat.length) {
                                const e = [].concat([], this.hourRangeIn24HrFormat);
                                t.am = e.some(t => t < 12 || 24 === t), t.pm = e.some(t => t >= 12 && t < 24)
                            } else t.am = e, t.pm = e;
                            return (this.amText && this.amText.length || this.pmText && this.pmText.length) && (t.customApmText = !0), t
                        },
                        minuteRangeList() {
                            return !(!this.minuteType || !this.opts.minuteRange) && (this.opts.minuteRange.length ? this.renderRangeList(this.opts.minuteRange, "minute") : [])
                        },
                        secondRangeList() {
                            return !(!this.secondType || !this.opts.secondRange) && (this.opts.secondRange.length ? this.renderRangeList(this.opts.secondRange, "second") : [])
                        },
                        hourLabelText() {
                            return this.hourLabel || this.hourType
                        },
                        minuteLabelText() {
                            return this.minuteLabel || this.minuteType
                        },
                        secondLabelText() {
                            return this.secondLabel || this.secondType
                        },
                        apmLabelText() {
                            return this.apmLabel || this.apmType
                        },
                        inputWidthStyle() {
                            if (this.inputWidth && this.inputWidth.length) return {
                                width: this.inputWidth
                            }
                        },
                        tokenRegexBase() {
                            return this.inUse.tokens.join("|")
                        },
                        tokenChunks() {
                            if (!this.manualInput && !this.useStringValue) return !1;
                            const t = String(this.formatString),
                                e = `(${this.tokenRegexBase})+?`,
                                n = this.getMatchAllByRegex(t, e),
                                o = [];
                            for (let t of n) {
                                const e = t[0],
                                    n = {
                                        index: t.index,
                                        token: e,
                                        type: this.getTokenType(e),
                                        needsCalibrate: e.length < 2,
                                        len: (e || "").length
                                    };
                                o.push(n)
                            }
                            return o
                        },
                        needsPosCalibrate() {
                            return !!this.manualInput && this.tokenChunks.some(t => t.needsCalibrate)
                        },
                        tokenChunksPos() {
                            if (!this.manualInput) return !1;
                            if (!this.needsPosCalibrate) return this.tokenChunks.map(t => ({
                                token: t.token,
                                type: t.type,
                                start: t.index,
                                end: t.index + t.len
                            }));
                            const t = [];
                            let e = 0;
                            return this.tokenChunks.forEach(n => {
                                let o;
                                if ("apm" === n.type && this.has.customApmText)
                                    if (this.apm && this.apm.length) {
                                        const t = "am" === this.apm.toLowerCase() ? this.amText : this.pmText;
                                        o = t && t.length ? t.length : n.len
                                    } else o = n.len;
                                else o = this[n.type] && this[n.type].length ? this[n.type].length : n.len;
                                t.push({
                                    token: n.token,
                                    type: n.type,
                                    start: n.index + e,
                                    end: n.index + e + o
                                }), n.needsCalibrate && o > n.len && (e += o - n.len)
                            }), t
                        },
                        invalidValues() {
                            if (this.inputIsEmpty) return [];
                            if (!this.restrictedHourRange && !this.minuteRangeList && !this.secondRangeList && 1 === this.opts.minuteInterval && 1 === this.opts.secondInterval) return [];
                            const t = [];
                            return !this.inUse.hour || this.isEmptyValue(this.hourType, this.hour) || this.isValidValue(this.hourType, this.hour) && !this.isDisabled("hour", this.hour) || t.push("hour"), !this.inUse.minute || this.isEmptyValue(this.minuteType, this.minute) || this.isValidValue(this.minuteType, this.minute) && !this.isDisabled("minute", this.minute) && !this.notInInterval("minute", this.minute) || t.push("minute"), !this.inUse.second || this.isEmptyValue(this.secondType, this.second) || this.isValidValue(this.secondType, this.second) && !this.isDisabled("second", this.second) && !this.notInInterval("second", this.second) || t.push("second"), !this.inUse.apm || this.isEmptyValue(this.apmType, this.apm) || this.isValidValue(this.apmType, this.apm) && !this.isDisabled("apm", this.apm) || t.push("apm"), t.length ? t : []
                        },
                        hasInvalidInput() {
                            return Boolean(this.invalidValues && this.invalidValues.length)
                        },
                        autoDirectionEnabled() {
                            return "auto" === this.dropDirection
                        },
                        dropdownDirClass() {
                            return this.autoDirectionEnabled ? this.forceDropOnTop ? "drop-up" : "drop-down" : "up" === this.dropDirection ? "drop-up" : "drop-down"
                        }
                    },
                    watch: {
                        "opts.format" (t) {
                            this.renderFormat(t)
                        },
                        "opts.minuteInterval" (t) {
                            this.renderList("minute", t)
                        },
                        "opts.secondInterval" (t) {
                            this.renderList("second", t)
                        },
                        value: {
                            deep: !0,
                            handler() {
                                this.readValues()
                            }
                        },
                        displayTime() {
                            this.fillValues()
                        },
                        disabled(t) {
                            t && (this.isActive && (this.isActive = !1), this.showDropdown && (this.showDropdown = !1))
                        },
                        "invalidValues.length" (t, e) {
                            t && t >= 1 ? this.$emit("error", this.invalidValues) : e && e >= 1 && this.$emit("error", [])
                        }
                    },
                    methods: {
                        formatValue(t, i) {
                            if (!this.isNumber(i)) return "";
                            switch (i = +i, t) {
                                case "H":
                                case "h":
                                case "k":
                                case "m":
                                case "s":
                                    return ["h", "k"].includes(t) && 0 === i ? "k" === t ? "24" : "12" : String(i);
                                case "HH":
                                case "mm":
                                case "ss":
                                case "hh":
                                case "kk":
                                    return ["hh", "kk"].includes(t) && 0 === i ? "kk" === t ? "24" : "12" : i < 10 ? "0" + i : String(i);
                                default:
                                    return ""
                            }
                        },
                        checkAcceptingType(t, e) {
                            if (!t || !e || !e.length) return "";
                            for (let i = 0; i < t.length; i++)
                                if (e.indexOf(t[i]) > -1) return t[i];
                            return ""
                        },
                        renderFormat(t) {
                            t = t || this.opts.format || r.format;
                            let e = this.checkAcceptingType(o.HOUR_TOKENS, t),
                                n = this.checkAcceptingType(o.MINUTE_TOKENS, t);
                            this.secondType = this.checkAcceptingType(o.SECOND_TOKENS, t), this.apmType = this.checkAcceptingType(o.APM_TOKENS, t), e || n || this.secondType || this.apmType || (this.debugMode && this.format && this.debugLog(`No valid tokens found in your defined "format" string "${this.format}". Fallback to the default "HH:mm" format.`), e = "HH", n = "mm"), this.hourType = e, this.minuteType = n, this.hourType ? this.renderHoursList() : this.hours = [], this.minuteType ? this.renderList("minute") : this.minutes = [], this.secondType ? this.renderList("second") : this.seconds = [], this.apmType ? this.renderApmList() : this.apms = [], this.$nextTick(() => {
                                this.readValues()
                            })
                        },
                        renderHoursList() {
                            const t = this.baseOn12Hours ? 12 : 24,
                                e = [];
                            for (let i = 0; i < t; i++) "k" === this.hourType || "kk" === this.hourType ? e.push(this.formatValue(this.hourType, i + 1)) : e.push(this.formatValue(this.hourType, i));
                            this.hours = e
                        },
                        renderList(t, e) {
                            if (!this.isMinuteOrSecond(t)) return;
                            const n = "minute" === t;
                            e = e || (n ? this.opts.minuteInterval || r.minuteInterval : this.opts.secondInterval || r.secondInterval);
                            const o = [];
                            for (let i = 0; i < 60; i += e) o.push(this.formatValue(n ? this.minuteType : this.secondType, i));
                            n ? this.minutes = o : this.seconds = o
                        },
                        renderApmList() {
                            this.apms = "A" === this.apmType ? ["AM", "PM"] : ["am", "pm"]
                        },
                        readValues() {
                            this.useStringValue ? (this.debugMode && this.debugLog(`Received a string value: "${this.value}"`), this.readStringValues(this.value)) : (this.debugMode && this.debugLog(`Received an object value: "${JSON.stringify(this.value||{})}"`), this.readObjectValues(this.value))
                        },
                        readObjectValues(t) {
                            const e = JSON.parse(JSON.stringify(t || {})),
                                n = Object.keys(e);
                            0 !== n.length ? (o.BASIC_TYPES.forEach(t => {
                                const o = this.getTokenByType(t);
                                if (n.indexOf(o) > -1) {
                                    const n = this.sanitizedValue(o, e[o]);
                                    this[t] = n, e[o] = n
                                } else this[t] = ""
                            }), this.timeValue = e) : this.addFallbackValues()
                        },
                        getMatchAllByRegex(t, e) {
                            const n = "polyfillTest";
                            return Boolean(!n.matchAll || "function" != typeof n.matchAll) ? this.polyfillMatchAll(t, e) : t.matchAll(new RegExp(e, "g"))
                        },
                        readStringValues(t) {
                            if (!t || !t.length) return void this.addFallbackValues();
                            const e = String(this.formatString),
                                n = `(${this.tokenRegexBase})+?`,
                                o = `[^(${this.tokenRegexBase})]+`,
                                r = this.getMatchAllByRegex(e, n),
                                l = this.getMatchAllByRegex(e, o),
                                c = [],
                                d = [];
                            for (let t of r) {
                                const e = {
                                    index: t.index,
                                    token: t[0],
                                    isValueToken: !0
                                };
                                c.push(e), d.push(e)
                            }
                            for (let t of l) c.push({
                                index: t.index,
                                token: t[0]
                            });
                            c.sort((t, e) => t.index < e.index ? -1 : 1);
                            let h = "";
                            c.forEach(t => {
                                if (t.isValueToken) {
                                    const e = this.getTokenRegex(t.token) || "";
                                    h += e
                                } else {
                                    const e = t.token.replace(/\\{0}(\*|\?|\.|\+)/g, "\\$1");
                                    h += `(?:${e})`
                                }
                            });
                            if (new RegExp(h).test(t)) {
                                const e = t.match(new RegExp(h)).slice(1, d.length + 1),
                                    n = {};
                                if (e.forEach((t, e) => {
                                        if (d[e]) {
                                            const o = d[e].token;
                                            n[o] = this.setValueFromString(t, o)
                                        }
                                    }), this.timeValue = n, this.debugMode) {
                                    const t = d.map(t => t && t.token);
                                    this.debugLog(`Successfully parsed values ${JSON.stringify(e)}\nfor ${JSON.stringify(t)}\nin format pattern '${this.formatString}'`)
                                }
                            } else this.debugMode && this.debugLog(`The input string in "v-model" does NOT match the "format" pattern\nformat: ${this.formatString}\nv-model: ${t}`)
                        },
                        polyfillMatchAll(t, e) {
                            const n = t.match(new RegExp(e, "g")),
                                o = [],
                                r = [];
                            return n && n.length && n.forEach(e => {
                                const n = r.findIndex(t => t.str === e);
                                let l;
                                if (n >= 0) r[n] && r[n].regex && (l = r[n].regex.exec(t).index);
                                else {
                                    const n = new RegExp(e, "g");
                                    l = n.exec(t).index, r.push({
                                        str: String(e),
                                        regex: n
                                    })
                                }
                                o.push({
                                    0: String(e),
                                    index: l
                                })
                            }), o
                        },
                        addFallbackValues() {
                            const t = {};
                            this.inUse.types.forEach(e => {
                                t[this.getTokenByType(e)] = ""
                            }), this.timeValue = t
                        },
                        setValueFromString(t, e) {
                            if (!e || !t) return "";
                            const n = this.getTokenType(e);
                            if (!n || !n.length) return "";
                            const o = t !== this.getTokenByType(n) ? t : "";
                            return this[n] = o, o
                        },
                        fillValues(t) {
                            const e = {},
                                n = this.hour,
                                r = this.hourType;
                            let l;
                            if (r && this.isNumber(n)) {
                                const t = +n,
                                    l = !(!this.baseOn12Hours || !this.apm) && this.lowerCasedApm(this.apm);
                                o.HOUR_TOKENS.forEach(o => {
                                    if (o === r) return void(e[o] = n);
                                    let c, d;
                                    switch (o) {
                                        case "H":
                                        case "HH":
                                        case "k":
                                        case "kk":
                                            c = this.baseOn12Hours ? "pm" === l ? t < 12 ? t + 12 : t : ["k", "kk"].includes(o) ? 12 === t ? 24 : t : t % 12 : ["k", "kk"].includes(o) ? 0 === t ? 24 : t : t % 24, e[o] = this.formatValue(o, c);
                                            break;
                                        case "h":
                                        case "hh":
                                            this.baseOn12Hours ? (c = t, d = l || "") : t > 11 && t < 24 ? (d = "pm", c = 12 === t ? 12 : t % 12) : (d = "am", c = t % 12 == 0 ? 12 : t), e[o] = this.formatValue(o, c), e.a = d, e.A = d.toUpperCase()
                                    }
                                })
                            } else o.HOUR_TOKENS.forEach(t => e[t] = ""), l = this.lowerCasedApm(this.apm || ""), e.a = l, e.A = l.toUpperCase();
                            e.m = this.formatValue("m", this.minute), e.mm = this.formatValue("mm", this.minute), e.s = this.formatValue("s", this.second), e.ss = this.formatValue("ss", this.second), this.fullValues = e, this.lazy && !t || this.emitTimeValue(), this.closeOnComplete && this.allValueSelected && this.showDropdown && this.toggleActive()
                        },
                        getFullData() {
                            return this.fullValues || this.fillValues(), {
                                data: JSON.parse(JSON.stringify(this.fullValues)),
                                displayTime: this.inputIsEmpty ? "" : String(this.displayTime)
                            }
                        },
                        emitTimeValue() {
                            if (this.lazy && this.bakDisplayTime === this.displayTime) return void(this.debugMode && this.debugLog("The value does not change on `lazy` mode. Skip the emitting `input` and `change` event."));
                            const t = this.getFullData();
                            if (this.useStringValue) this.$emit("input", t.displayTime);
                            else {
                                const e = t.data,
                                    n = this.inUse.tokens || [],
                                    o = {};
                                n.forEach(t => {
                                    o[t] = e[t] || ""
                                }), this.$emit("input", JSON.parse(JSON.stringify(o)))
                            }
                            this.$emit("change", t)
                        },
                        translate12hRange(t) {
                            const e = this.match12hRange(t);
                            return 12 == +e[1] ? +e[1] + ("p" === e[2].toLowerCase() ? 0 : 12) : +e[1] + ("p" === e[2].toLowerCase() ? 12 : 0)
                        },
                        isDisabled(t, e) {
                            if (!this.isBasicType(t) || !this.inUse[t]) return !0;
                            switch (t) {
                                case "hour":
                                    return this.isDisabledHour(e);
                                case "minute":
                                case "second":
                                    return !!this[t + "RangeList"] && !this[t + "RangeList"].includes(e);
                                case "apm":
                                    return !!this.restrictedHourRange && !this.has[this.lowerCasedApm(e)];
                                default:
                                    return !0
                            }
                        },
                        isDisabledHour(t) {
                            if (!this.restrictedHourRange) return !1;
                            if (this.baseOn12Hours) {
                                if (this.apm && this.apm.length) {
                                    const e = "am" === this.apm.toLowerCase() ? "a" : "p";
                                    return !this.restrictedHourRange.includes(`${+t}${e}`)
                                }
                                return !1
                            }
                            return ("HH" !== this.hourType && "H" !== this.hourType || 0 != +t || !this.restrictedHourRange.includes(24)) && !this.restrictedHourRange.includes(+t)
                        },
                        notInInterval(section, t) {
                            if (section && this.isMinuteOrSecond(section)) return 1 !== this.opts[section + "Interval"] && +t % this.opts[section + "Interval"] != 0
                        },
                        renderRangeList(t, section) {
                            if (!t || !section || !this.isMinuteOrSecond(section)) return [];
                            const e = [];
                            let n;
                            if (t.forEach(t => {
                                    if (t instanceof Array) {
                                        t.length > 2 && this.debugMode && this.debugLog(`Nested array within "${section}-range" must contain no more than two items. Only the first two items of ${JSON.stringify(t)} will be taken into account.`);
                                        const o = t[0],
                                            r = t[1] || t[0];
                                        for (let i = +o; i <= +r; i++) i < 0 || i > 59 || (n = this.formatValue(this.getTokenByType(section), i), e.includes(n) || e.push(n))
                                    } else {
                                        if (+t < 0 || +t > 59) return;
                                        n = this.formatValue(this.getTokenByType(section), t), e.includes(n) || e.push(n)
                                    }
                                }), e.sort((t, e) => t - e), this.debugMode) {
                                const t = (("minute" === section ? this.minutes : this.seconds) || []).filter(t => e.includes(t));
                                t && t.length || ("minute" === section ? this.debugLog(`The minute list is empty due to the "minute-range" config\nminute-range: ${JSON.stringify(this.minuteRange)}\nminute-interval: ${this.opts.minuteInterval}`) : this.debugLog(`The second list is empty due to the "second-range" config\nsecond-range: ${JSON.stringify(this.secondRange)}\nsecond-interval: ${this.opts.secondInterval}`))
                            }
                            return e
                        },
                        forceApmSelection() {
                            if (!this.manualInput && this.apmType && !this.apm && (this.has.am || this.has.pm)) {
                                this.doClearApmChecking = !0;
                                const t = this.has.am ? "am" : "pm";
                                this.apm = "A" === this.apmType ? t.toUpperCase() : t
                            }
                        },
                        emptyApmSelection() {
                            this.doClearApmChecking && "" === this.hour && "" === this.minute && "" === this.second && (this.apm = ""), this.doClearApmChecking = !1
                        },
                        apmDisplayText(t) {
                            return this.amText && "am" === this.lowerCasedApm(t) ? this.amText : this.pmText && "pm" === this.lowerCasedApm(t) ? this.pmText : t
                        },
                        toggleActive() {
                            this.disabled || (this.isActive = !this.isActive, this.isActive ? (this.isFocusing = !0, this.manualInput && this.$emit("focus"), this.opts.hideDropdown || this.setDropdownState(!0), this.lazy && (this.bakDisplayTime = String(this.displayTime || "")), this.manualInput && !this.inputIsEmpty && this.$nextTick(() => {
                                this.$refs.input && 0 === this.$refs.input.selectionStart && this.$refs.input.selectionEnd === this.displayTime.length && this.selectFirstSlot()
                            })) : (this.showDropdown ? this.setDropdownState(!1) : this.manualInput && this.$emit("blur", this.getFullData()), this.isFocusing = !1, this.lazy && (this.fillValues(!0), this.bakDisplayTime = void 0)), this.restrictedHourRange && this.baseOn12Hours && (this.showDropdown ? this.forceApmSelection() : this.emptyApmSelection()), this.showDropdown && this.checkForAutoScroll())
                        },
                        setDropdownState(t) {
                            let e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
                            t ? (this.appendToBody && this.appendDropdownToBody(), this.keepFocusing(), this.autoDirectionEnabled && this.checkDropDirection(), this.showDropdown = !0, this.$emit("open"), e && (this.fixedDropdownButton && (this.isActive = !0), this.$emit("blur", this.getFullData()), this.checkForAutoScroll())) : (this.showDropdown = !1, this.$emit("close", this.getFullData()), this.appendToBody && this.removeDropdownFromBody())
                        },
                        appendDropdownToBody() {
                            const t = this.$refs && this.$refs.dropdown,
                                body = document.getElementsByTagName("body")[0];
                            body && t && (window.addEventListener("scroll", this.updateDropdownPos), t.classList.add("vue__time-picker-dropdown"), this.updateDropdownPos(), body.appendChild(t))
                        },
                        updateDropdownPos() {
                            if (!this.appendToBody) return;
                            const t = this.$refs && this.$refs.dropdown;
                            if (document.getElementsByTagName("body")[0] && t) {
                                const e = this.$el.getBoundingClientRect();
                                "drop-up" === this.dropdownDirClass ? (t.style.bottom = window.innerHeight - e.y + "px", t.style.top = "auto") : (t.style.top = e.y + e.height + "px", t.style.bottom = "auto"), t.style.left = e.x + "px"
                            }
                        },
                        removeDropdownFromBody() {
                            const t = this.$refs && this.$refs.dropdown,
                                body = document.getElementsByTagName("body")[0];
                            body && t && body.contains(t) && body.removeChild(t), t && (t.classList.remove("vue__time-picker-dropdown"), t.style.top = "", t.style.bottom = "", t.style.left = "", this.$el.appendChild(t)), window.removeEventListener("scroll", this.updateDropdownPos)
                        },
                        blurEvent() {
                            this.manualInput && !this.opts.hideDropdown && this.$emit("blur", this.getFullData())
                        },
                        select(t, e) {
                            this.isBasicType(t) && !this.isDisabled(t, e) && (this[t] = e, this.doClearApmChecking && (this.doClearApmChecking = !1))
                        },
                        clearTime() {
                            this.disabled || (this.hour = "", this.minute = "", this.second = "", this.apm = "", this.manualInput && this.$refs && this.$refs.input && this.$refs.input.value.length && (this.$refs.input.value = ""), this.lazy && this.fillValues(!0))
                        },
                        checkForAutoScroll() {
                            this.inputIsEmpty || (this.autoScroll ? this.$nextTick(() => {
                                this.scrollToSelectedValues()
                            }) : this.advancedKeyboard && this.$nextTick(() => {
                                const t = this.inUse.types[0];
                                this.scrollToSelected(t, !0)
                            }))
                        },
                        scrollToSelected(t) {
                            let e, n = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
                            if (!this.timeValue || this.inputIsEmpty) return;
                            e = this.appendToBody && this.$refs && this.$refs.dropdown ? this.$refs.dropdown.querySelectorAll(`ul.${t}s`)[0] : this.$el.querySelectorAll(`ul.${t}s`)[0];
                            let o = this.activeItemInCol(t)[0];
                            !o && n && (o = this.validItemsInCol(t)[0]), e && o && (e.scrollTop = o.offsetTop || 0, this.advancedKeyboard && o.focus())
                        },
                        scrollToSelectedValues() {
                            this.timeValue && !this.inputIsEmpty && this.inUse.types.forEach(section => {
                                this.scrollToSelected(section)
                            })
                        },
                        onFocus() {
                            this.disabled || (this.isFocusing || (this.isFocusing = !0), this.isActive || this.toggleActive())
                        },
                        escBlur() {
                            if (this.disabled) return;
                            window.clearTimeout(this.debounceTimer), this.isFocusing = !1;
                            const t = this.$el.querySelectorAll("input.display-time")[0];
                            t && t.blur()
                        },
                        debounceBlur() {
                            this.disabled || (this.isFocusing = !1, window.clearTimeout(this.debounceTimer), this.debounceTimer = window.setTimeout(() => {
                                window.clearTimeout(this.debounceTimer), this.onBlur()
                            }, this.opts.blurDelay))
                        },
                        onBlur() {
                            this.disabled || this.isFocusing || !this.isActive || this.toggleActive()
                        },
                        keepFocusing() {
                            this.disabled || (window.clearTimeout(this.debounceTimer), this.isFocusing || (this.isFocusing = !0))
                        },
                        onTab(t, e, n) {
                            if (this.appendToBody && n.shiftKey) {
                                const o = this.inUse.types[0];
                                if (t !== o) return;
                                const r = this.validItemsInCol(o)[0];
                                r && r.getAttribute("data-key") === String(e) && (n.preventDefault(), this.$refs && this.$refs.input && this.$refs.input.focus())
                            }
                        },
                        validItemsInCol(t) {
                            const e = t + "s";
                            return this.appendToBody && this.$refs && this.$refs.dropdown ? this.$refs.dropdown.querySelectorAll(`ul.${e} > li:not(.hint):not([disabled])`) : this.$el.querySelectorAll(`ul.${e} > li:not(.hint):not([disabled])`)
                        },
                        activeItemInCol(t) {
                            const e = t + "s";
                            return this.appendToBody && this.$refs && this.$refs.dropdown ? this.$refs.dropdown.querySelectorAll(`ul.${e} > li.active:not(.hint)`) : this.$el.querySelectorAll(`ul.${e} > li.active:not(.hint)`)
                        },
                        getClosestSibling(t, e) {
                            let n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
                            const o = this.validItemsInCol(t),
                                r = Array.prototype.findIndex.call(o, t => t.getAttribute("data-key") === e);
                            return n && 0 === r ? o[o.length - 1] : n || r !== o.length - 1 ? r < 0 ? o[0] : n ? o[r - 1] : o[r + 1] : o[0]
                        },
                        prevItem(t, e) {
                            let n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
                            const o = this.getClosestSibling(t, e, !0);
                            if (o) return n ? o : o.focus()
                        },
                        nextItem(t, e) {
                            let n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
                            const o = this.getClosestSibling(t, e, !1);
                            if (o) return n ? o : o.focus()
                        },
                        getSideColumnName(t) {
                            let e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
                            const n = this.inUse.types.indexOf(t);
                            if (e && n <= 0) this.debugMode && this.debugLog("You're in the leftmost list already");
                            else {
                                if (e || n !== this.inUse.types.length - 1) return this.inUse.types[e ? n - 1 : n + 1];
                                this.debugMode && this.debugLog("You're in the rightmost list already")
                            }
                        },
                        getFirstItemInSideColumn(t) {
                            let e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
                            const n = this.getSideColumnName(t, e);
                            if (!n) return;
                            const o = this.validItemsInCol(n);
                            return o && o[0] ? o[0] : void 0
                        },
                        getActiveItemInSideColumn(t) {
                            let e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
                            const n = this.getSideColumnName(t, e);
                            if (!n) return;
                            const o = this.activeItemInCol(n);
                            return o && o[0] ? o[0] : void 0
                        },
                        toLeftColumn(t) {
                            const e = this.getActiveItemInSideColumn(t, !0) || this.getFirstItemInSideColumn(t, !0);
                            e && e.focus()
                        },
                        toRightColumn(t) {
                            const e = this.getActiveItemInSideColumn(t, !1) || this.getFirstItemInSideColumn(t, !1);
                            e && e.focus()
                        },
                        onMouseDown() {
                            this.manualInput && (window.clearTimeout(this.selectionTimer), this.selectionTimer = window.setTimeout(() => {
                                if (window.clearTimeout(this.selectionTimer), this.$refs && this.$refs.input) {
                                    const t = this.getNearestChunkByPos(this.$refs.input.selectionStart || 0);
                                    this.debounceSetInputSelection(t)
                                }
                            }, 50))
                        },
                        keyDownHandler(t) {
                            if (t.isComposing || 229 === t.keyCode) return t.preventDefault(), t.stopPropagation(), !1;
                            t.keyCode >= 48 && t.keyCode <= 57 || t.keyCode >= 96 && t.keyCode <= 105 ? (t.preventDefault(), this.keyboardInput(t.key)) : [65, 80, 77].includes(t.keyCode) ? (t.preventDefault(), this.keyboardInput(t.key, !0)) : t.keyCode >= 37 && t.keyCode <= 40 ? (t.preventDefault(), this.clearKbInputLog(), this.arrowHandler(t)) : 8 === t.keyCode || 46 === t.keyCode ? (t.preventDefault(), this.clearKbInputLog(), this.clearTime()) : 9 === t.keyCode ? (this.clearKbInputLog(), this.tabHandler(t)) : 186 === t.keyCode || 32 === t.keyCode ? (t.preventDefault(), this.clearKbInputLog(), this.toNextSlot()) : 27 === t.keyCode || t.metaKey || t.ctrlKey || t.preventDefault()
                        },
                        onCompostionStart(t) {
                            return t.preventDefault(), t.stopPropagation(), this.bakCurrentPos = this.getCurrentTokenChunk(), !1
                        },
                        onCompostionEnd(t) {
                            t.preventDefault(), t.stopPropagation();
                            const e = t.data;
                            let n = !1;
                            return this.has.customApmText && (n = this.isCustomApmText(e)), n && this.setSanitizedValueToSection("apm", n), this.$refs.input.value = this.has.customApmText ? this.customDisplayTime : this.displayTime, this.$nextTick(() => {
                                if (this.bakCurrentPos) {
                                    const t = JSON.parse(JSON.stringify(this.bakCurrentPos));
                                    n && (t.end = t.start + e.length), this.debounceSetInputSelection(t), this.bakCurrentPos = null
                                }
                            }), !1
                        },
                        pasteHandler(t) {
                            t.preventDefault();
                            let e = (t.clipboardData || window.clipboardData).getData("text");
                            this.debugMode && this.debugLog(`Pasting value "${e}" from clipboard`), e && e.length && (this.has.customApmText && (e = this.replaceCustomApmText(e)), this.inputIsEmpty ? this.readStringValues(e) : (this.kbInputLog = e.substr(-2, 2), this.setKbInput(), this.debounceClearKbLog()))
                        },
                        arrowHandler(t) {
                            const e = {
                                37: "L",
                                38: "U",
                                39: "R",
                                40: "D"
                            }[t.keyCode];
                            if ("U" === e || "D" === e)
                                if (this.inputIsEmpty) this.selectFirstValidValue();
                                else {
                                    const t = this.getCurrentTokenChunk();
                                    if (!t) return void this.selectFirstValidValue();
                                    const n = t.type;
                                    this.getClosestValidItemInCol(n, this[n], e);
                                    const o = this.getCurrentTokenChunk();
                                    this.debounceSetInputSelection(o)
                                }
                            else "R" === e ? this.toLateralToken(!1) : "L" === e && this.toLateralToken(!0)
                        },
                        tabHandler(t) {
                            if (!this.inputIsEmpty && this.tokenChunksPos && this.tokenChunksPos.length) {
                                const e = this.getCurrentTokenChunk();
                                if (!e) return;
                                const n = this.tokenChunksPos[0],
                                    o = this.tokenChunksPos[this.tokenChunksPos.length - 1];
                                (t.shiftKey && e.token !== n.token || !t.shiftKey && e.token !== o.token) && (t.preventDefault(), this.toLateralToken(t.shiftKey))
                            } else if (this.appendToBody && this.advancedKeyboard) {
                                if (t.shiftKey) return;
                                if (t.preventDefault(), this.inputIsEmpty) {
                                    const t = this.inUse.types[0],
                                        e = this.validItemsInCol(t)[0];
                                    e && e.focus()
                                }
                            }
                        },
                        keyboardInput(t) {
                            let e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
                            const n = this.getCurrentTokenChunk();
                            !n || "apm" !== n.type && e || "apm" === n.type && !e || (this.kbInputLog = `${this.kbInputLog.substr(-1)}${t}`, this.setKbInput(), this.debounceClearKbLog())
                        },
                        clearKbInputLog() {
                            window.clearTimeout(this.kbInputTimer), this.kbInputLog = ""
                        },
                        debounceClearKbLog() {
                            window.clearTimeout(this.kbInputTimer), this.kbInputTimer = window.setTimeout(() => {
                                this.clearKbInputLog()
                            }, this.opts.manualInputTimeout)
                        },
                        setKbInput(t) {
                            t = t || this.kbInputLog;
                            const e = this.getCurrentTokenChunk();
                            if (!e || !t || !t.length) return;
                            const n = e.type,
                                o = e.token;
                            let r;
                            if ("apm" === n) this.lowerCasedApm(t).includes("a") ? r = "am" : this.lowerCasedApm(t).includes("p") && (r = "pm"), r && (r = "A" === o ? r.toUpperCase() : r);
                            else if (this.isValidValue(o, t)) r = t;
                            else {
                                const e = this.formatValue(o, t.substr(-1));
                                this.isValidValue(o, e) && (r = e)
                            }
                            if (r) {
                                this.setSanitizedValueToSection(n, r);
                                const t = this.getCurrentTokenChunk();
                                this.debounceSetInputSelection(t)
                            }
                            this.debugMode && (r ? this.debugLog(`Successfully set value "${r}" from latest input "${t}" for the "${n}" slot`) : this.debugLog(`Value "${t}" is invalid in the "${n}" slot`))
                        },
                        onChange() {
                            if (!this.manualInput || !this.$refs || !this.$refs.input) return;
                            const t = this.$refs.input.value || "";
                            t && t.length && this.readStringValues(t)
                        },
                        getNearestChunkByPos(t) {
                            if (!this.tokenChunksPos || !this.tokenChunksPos.length) return;
                            let e, n = -1;
                            for (let i = 0; i < this.tokenChunksPos.length; i++) {
                                const o = JSON.parse(JSON.stringify(this.tokenChunksPos[i]));
                                if (o.start === t) return o;
                                const r = Math.abs(o.start - t);
                                if (n < 0) e = o, n = r;
                                else {
                                    if (n <= r) return e;
                                    n = r, e = o
                                }
                            }
                            return e
                        },
                        selectFirstValidValue() {
                            if (!this.tokenChunksPos || !this.tokenChunksPos.length) return;
                            const t = this.tokenChunksPos[0].type;
                            "hour" === t ? this.getClosestHourItem() : this.getClosestValidItemInCol(t, this[t]), this.selectFirstSlot()
                        },
                        getClosestHourItem(t) {
                            let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "U";
                            if (!this.validHoursList || !this.validHoursList.length) return void(this.debugMode && this.debugLog('No valid hour values found, please check your "hour-range" config\nhour-range: ' + JSON.stringify(this.hourRange)));
                            if (!t) return void this.setManualHour(this.validHoursList[0]);
                            const n = this.validHoursList.findIndex(e => {
                                if (this.baseOn12Hours) {
                                    return e === `${t}${"pm"===this.lowerCasedApm(this.apm)?"p":"a"}`
                                }
                                return e === t
                            });
                            let o;
                            o = -1 === n ? 0 : "D" === e ? 0 === n ? this.validHoursList.length - 1 : n - 1 : (n + 1) % this.validHoursList.length;
                            const r = this.validHoursList[o];
                            this.setManualHour(r)
                        },
                        getClosestValidItemInCol(t, e) {
                            let n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "U";
                            if ("hour" === t) this.getClosestHourItem(e, n);
                            else {
                                const e = "D" === n ? this.prevItem(t, this[t], !0) : this.nextItem(t, this[t], !0);
                                e && this.select(t, e.getAttribute("data-key"))
                            }
                        },
                        setSanitizedValueToSection(section, t) {
                            if (!section || !this.getTokenByType(section)) return;
                            const e = this.sanitizedValue(this.getTokenByType(section), t);
                            this[section] = e
                        },
                        setManualHour(t) {
                            if (this.is12hRange(t)) {
                                const e = this.match12hRange(t),
                                    n = "a" === e[2] ? "AM" : "PM";
                                this.setSanitizedValueToSection("apm", "a" === this.apmType ? n.toLowerCase() : n), this.setSanitizedValueToSection("hour", e[1])
                            } else this.setSanitizedValueToSection("hour", t)
                        },
                        debounceSetInputSelection(t) {
                            let {
                                start: e = 0,
                                end: n = 0
                            } = t;
                            this.$nextTick(() => {
                                this.setInputSelectionRange(e, n)
                            }), window.clearTimeout(this.selectionTimer), this.selectionTimer = window.setTimeout(() => {
                                window.clearTimeout(this.selectionTimer), !this.$refs.input || this.$refs.input.selectionStart === e && this.$refs.input.selectionEnd === n || this.setInputSelectionRange(e, n)
                            }, 30)
                        },
                        setInputSelectionRange(t, e) {
                            this.$refs && this.$refs.input && this.$refs.input.setSelectionRange(t, e)
                        },
                        getCurrentTokenChunk() {
                            return this.getNearestChunkByPos(this.$refs.input && this.$refs.input.selectionStart || 0)
                        },
                        selectFirstSlot() {
                            const t = this.getNearestChunkByPos(0);
                            this.debounceSetInputSelection(t)
                        },
                        toNextSlot() {
                            if (!this.inputIsEmpty && this.tokenChunksPos && this.tokenChunksPos.length) {
                                const t = this.getCurrentTokenChunk();
                                if (!t) return;
                                const e = this.tokenChunksPos[this.tokenChunksPos.length - 1];
                                t.token !== e.token && this.toLateralToken(!1)
                            }
                        },
                        toLateralToken(t) {
                            const e = this.getCurrentTokenChunk();
                            if (!e) return void this.selectFirstValidValue();
                            const n = this.tokenChunksPos.findIndex(t => t.token === e.token);
                            if (!t && n >= this.tokenChunksPos.length - 1 || t && 0 === n) return void(this.debugMode && (t ? this.debugLog("You're in the leftmost slot already") : this.debugLog("You're in the rightmost slot already")));
                            const o = t ? this.tokenChunksPos[n - 1] : this.tokenChunksPos[n + 1];
                            this.debounceSetInputSelection(o)
                        },
                        isCustomApmText(t) {
                            return !(!t || !t.length) && (this.amText && this.amText === t ? "A" === this.apmType ? "AM" : "am" : !(!this.pmText || this.pmText !== t) && ("A" === this.apmType ? "PM" : "pm"))
                        },
                        replaceCustomApmText(t) {
                            return this.amText && this.amText.length && t.includes(this.amText) ? t.replace(new RegExp(this.amText, "g"), "A" === this.apmType ? "AM" : "am") : this.pmText && this.pmText.length && t.includes(this.pmText) ? t.replace(new RegExp(this.pmText, "g"), "A" === this.apmType ? "PM" : "pm") : t
                        },
                        checkDropDirection() {
                            if (!this.$el) return;
                            let t;
                            this.containerId && this.containerId.length && (t = document.getElementById(this.containerId), !t && this.debugMode && this.debugLog(`Container with id "${this.containerId}" not found. Fallback to document body.`));
                            const e = this.$el;
                            let n;
                            if (t && t.offsetHeight) n = t.offsetTop + t.offsetHeight - (e.offsetTop + e.offsetHeight);
                            else {
                                n = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.body.clientHeight, document.documentElement.clientHeight) - (e.offsetTop + e.offsetHeight)
                            }
                            this.forceDropOnTop = this.opts.dropOffsetHeight > n
                        },
                        is12hRange: t => /^\d{1,2}(a|p|A|P)$/.test(t),
                        match12hRange: t => t.match(/^(\d{1,2})(a|p|A|P)$/),
                        isNumber: t => !isNaN(parseFloat(t)) && isFinite(t),
                        isBasicType: t => o.BASIC_TYPES.includes(t),
                        lowerCasedApm: t => (t || "").toLowerCase(),
                        getTokenRegex(t) {
                            switch (t) {
                                case "HH":
                                    return "([01][0-9]|2[0-3]|H{2})";
                                case "H":
                                    return "([0-9]{1}|1[0-9]|2[0-3]|H{1})";
                                case "hh":
                                    return "(0[1-9]|1[0-2]|h{2})";
                                case "h":
                                    return "([1-9]{1}|1[0-2]|h{1})";
                                case "kk":
                                    return "(0[1-9]|1[0-9]|2[0-4]|k{2})";
                                case "k":
                                    return "([1-9]{1}|1[0-9]|2[0-4]|k{1})";
                                case "mm":
                                    return "([0-5][0-9]|m{2})";
                                case "ss":
                                    return "([0-5][0-9]|s{2})";
                                case "m":
                                    return "([0-9]{1}|[1-5][0-9]|m{1})";
                                case "s":
                                    return "([0-9]{1}|[1-5][0-9]|s{1})";
                                case "A":
                                    return "(AM|PM|A{1})";
                                case "a":
                                    return "(am|pm|a{1})";
                                default:
                                    return ""
                            }
                        },
                        isEmptyValue: (t, e) => !e || !e.length || e && e === t,
                        isValidValue(t, e) {
                            if (!t || this.isEmptyValue(t, e)) return !1;
                            const n = this.getTokenRegex(t);
                            return !(!n || !n.length) && new RegExp(`^${n}$`).test(e)
                        },
                        sanitizedValue(t, e) {
                            return this.isValidValue(t, e) ? e : ""
                        },
                        getTokenType(t) {
                            return this.inUse.types[this.inUse.tokens.indexOf(t)] || ""
                        },
                        getTokenByType(t) {
                            return this[t + "Type"] || ""
                        },
                        isMinuteOrSecond: t => ["minute", "second"].includes(t),
                        debugLog(t) {
                            if (!t || !t.length) return;
                            let e = "";
                            if (this.id && (e += "#" + this.id), this.name && (e += `[name=${this.name}]`), this.inputClass) {
                                let t = [];
                                "string" == typeof this.inputClass ? t = this.inputClass.split(/\s/g) : Array.isArray(this.inputClass) ? t = [].concat([], this.inputClass) : "object" == typeof this.inputClass && Object.keys(this.inputClass).forEach(e => {
                                    this.inputClass[e] && t.push(e)
                                });
                                for (let n of t) n && n.trim().length && (e += "." + n.trim())
                            }
                            const n = `DEBUG: ${t}${e?`\n\t(${e})`:""}`;
                            window.console.debug && "function" == typeof window.console.debug ? window.console.debug(n) : window.console.log(n)
                        }
                    },
                    mounted() {
                        window.clearTimeout(this.debounceTimer), window.clearTimeout(this.selectionTimer), window.clearTimeout(this.kbInputTimer), this.renderFormat()
                    },
                    beforeDestroy() {
                        window.clearTimeout(this.debounceTimer), window.clearTimeout(this.selectionTimer), window.clearTimeout(this.kbInputTimer)
                    }
                },
                c = (n(1074), n(9)),
                component = Object(c.a)(l, (function() {
                    var t = this,
                        e = t._self._c;
                    return e("span", {
                        staticClass: "vue__time-picker time-picker",
                        style: t.inputWidthStyle
                    }, [e("input", {
                        ref: "input",
                        staticClass: "display-time",
                        class: [t.inputClass, {
                            "is-empty": t.inputIsEmpty,
                            invalid: t.hasInvalidInput,
                            "all-selected": t.allValueSelected,
                            disabled: t.disabled,
                            "has-custom-icon": t.$slots && t.$slots.icon
                        }],
                        style: t.inputWidthStyle,
                        attrs: {
                            type: "text",
                            id: t.id,
                            name: t.name,
                            placeholder: t.placeholder ? t.placeholder : t.formatString,
                            tabindex: t.disabled ? -1 : t.tabindex,
                            disabled: t.disabled,
                            readonly: !t.manualInput,
                            autocomplete: t.autocomplete
                        },
                        domProps: {
                            value: t.inputIsEmpty ? null : t.customDisplayTime
                        },
                        on: {
                            focus: t.onFocus,
                            change: t.onChange,
                            blur: function(e) {
                                t.debounceBlur(), t.blurEvent()
                            },
                            mousedown: t.onMouseDown,
                            keydown: [t.keyDownHandler, function(e) {
                                return !e.type.indexOf("key") && t._k(e.keyCode, "esc", 27, e.key, ["Esc", "Escape"]) || e.ctrlKey || e.shiftKey || e.altKey || e.metaKey ? null : t.escBlur.apply(null, arguments)
                            }],
                            compositionstart: t.onCompostionStart,
                            compositionend: t.onCompostionEnd,
                            paste: t.pasteHandler
                        }
                    }), t._v(" "), t.showClearBtn || t.showDropdownBtn ? e("div", {
                        staticClass: "controls",
                        attrs: {
                            tabindex: "-1"
                        }
                    }, [!t.isActive && t.showClearBtn ? e("span", {
                        staticClass: "clear-btn",
                        class: {
                            "has-custom-btn": t.$slots && t.$slots.clearButton
                        },
                        attrs: {
                            tabindex: "-1"
                        },
                        on: {
                            click: t.clearTime
                        }
                    }, [t._t("clearButton", (function() {
                        return [e("span", {
                            staticClass: "char"
                        }, [t._v("×")])]
                    }))], 2) : t._e(), t._v(" "), t.showDropdownBtn ? e("span", {
                        staticClass: "dropdown-btn",
                        class: {
                            "has-custom-btn": t.$slots && t.$slots.dropdownButton
                        },
                        attrs: {
                            tabindex: "-1"
                        },
                        on: {
                            click: function(e) {
                                return t.setDropdownState(!t.fixedDropdownButton || !t.showDropdown, !0)
                            },
                            mousedown: t.keepFocusing
                        }
                    }, [t._t("dropdownButton", (function() {
                        return [e("span", {
                            staticClass: "char"
                        }, [t._v("▾")])]
                    }))], 2) : t._e()]) : t._e(), t._v(" "), t.$slots && t.$slots.icon ? e("div", {
                        staticClass: "custom-icon"
                    }, [t._t("icon")], 2) : t._e(), t._v(" "), t.showDropdown ? e("div", {
                        staticClass: "time-picker-overlay",
                        attrs: {
                            tabindex: "-1"
                        },
                        on: {
                            click: t.toggleActive
                        }
                    }) : t._e(), t._v(" "), e("div", {
                        directives: [{
                            name: "show",
                            rawName: "v-show",
                            value: t.showDropdown,
                            expression: "showDropdown"
                        }],
                        ref: "dropdown",
                        staticClass: "dropdown",
                        class: [t.dropdownDirClass],
                        style: t.inputWidthStyle,
                        attrs: {
                            tabindex: "-1"
                        },
                        on: {
                            mouseup: t.keepFocusing,
                            click: function(t) {
                                t.stopPropagation()
                            }
                        }
                    }, [e("div", {
                        staticClass: "select-list",
                        style: t.inputWidthStyle,
                        attrs: {
                            tabindex: "-1"
                        }
                    }, [t.advancedKeyboard ? t._e() : [t._l(t.columnsSequence, (function(n) {
                        return ["hour" === n ? e("ul", {
                            key: n,
                            staticClass: "hours",
                            on: {
                                scroll: t.keepFocusing
                            }
                        }, [e("li", {
                            staticClass: "hint",
                            domProps: {
                                textContent: t._s(t.hourLabelText)
                            }
                        }), t._v(" "), t._l(t.hours, (function(hr, n) {
                            return [!t.opts.hideDisabledHours || t.opts.hideDisabledHours && !t.isDisabled("hour", hr) ? e("li", {
                                key: n,
                                class: {
                                    active: t.hour === hr
                                },
                                attrs: {
                                    disabled: t.isDisabled("hour", hr),
                                    "data-key": hr
                                },
                                domProps: {
                                    textContent: t._s(hr)
                                },
                                on: {
                                    click: function(e) {
                                        return t.select("hour", hr)
                                    }
                                }
                            }) : t._e()]
                        }))], 2) : t._e(), t._v(" "), "minute" === n ? e("ul", {
                            key: n,
                            staticClass: "minutes",
                            on: {
                                scroll: t.keepFocusing
                            }
                        }, [e("li", {
                            staticClass: "hint",
                            domProps: {
                                textContent: t._s(t.minuteLabelText)
                            }
                        }), t._v(" "), t._l(t.minutes, (function(n, o) {
                            return [!t.opts.hideDisabledMinutes || t.opts.hideDisabledMinutes && !t.isDisabled("minute", n) ? e("li", {
                                key: o,
                                class: {
                                    active: t.minute === n
                                },
                                attrs: {
                                    disabled: t.isDisabled("minute", n),
                                    "data-key": n
                                },
                                domProps: {
                                    textContent: t._s(n)
                                },
                                on: {
                                    click: function(e) {
                                        return t.select("minute", n)
                                    }
                                }
                            }) : t._e()]
                        }))], 2) : t._e(), t._v(" "), "second" === n ? e("ul", {
                            key: n,
                            staticClass: "seconds",
                            on: {
                                scroll: t.keepFocusing
                            }
                        }, [e("li", {
                            staticClass: "hint",
                            domProps: {
                                textContent: t._s(t.secondLabelText)
                            }
                        }), t._v(" "), t._l(t.seconds, (function(s, n) {
                            return [!t.opts.hideDisabledSeconds || t.opts.hideDisabledSeconds && !t.isDisabled("second", s) ? e("li", {
                                key: n,
                                class: {
                                    active: t.second === s
                                },
                                attrs: {
                                    disabled: t.isDisabled("second", s),
                                    "data-key": s
                                },
                                domProps: {
                                    textContent: t._s(s)
                                },
                                on: {
                                    click: function(e) {
                                        return t.select("second", s)
                                    }
                                }
                            }) : t._e()]
                        }))], 2) : t._e(), t._v(" "), "apm" === n ? e("ul", {
                            key: n,
                            staticClass: "apms",
                            on: {
                                scroll: t.keepFocusing
                            }
                        }, [e("li", {
                            staticClass: "hint",
                            domProps: {
                                textContent: t._s(t.apmLabelText)
                            }
                        }), t._v(" "), t._l(t.apms, (function(a, n) {
                            return [!t.opts.hideDisabledHours || t.opts.hideDisabledHours && !t.isDisabled("apm", a) ? e("li", {
                                key: n,
                                class: {
                                    active: t.apm === a
                                },
                                attrs: {
                                    disabled: t.isDisabled("apm", a),
                                    "data-key": a
                                },
                                domProps: {
                                    textContent: t._s(t.apmDisplayText(a))
                                },
                                on: {
                                    click: function(e) {
                                        return t.select("apm", a)
                                    }
                                }
                            }) : t._e()]
                        }))], 2) : t._e()]
                    }))], t._v(" "), t.advancedKeyboard ? [t._l(t.columnsSequence, (function(n) {
                        return ["hour" === n ? e("ul", {
                            key: n,
                            staticClass: "hours",
                            attrs: {
                                tabindex: "-1"
                            },
                            on: {
                                scroll: t.keepFocusing
                            }
                        }, [e("li", {
                            staticClass: "hint",
                            attrs: {
                                tabindex: "-1"
                            },
                            domProps: {
                                textContent: t._s(t.hourLabelText)
                            }
                        }), t._v(" "), t._l(t.hours, (function(hr, n) {
                            return [!t.opts.hideDisabledHours || t.opts.hideDisabledHours && !t.isDisabled("hour", hr) ? e("li", {
                                key: n,
                                class: {
                                    active: t.hour === hr
                                },
                                attrs: {
                                    tabindex: t.isDisabled("hour", hr) ? -1 : t.tabindex,
                                    "data-key": hr,
                                    disabled: t.isDisabled("hour", hr)
                                },
                                domProps: {
                                    textContent: t._s(hr)
                                },
                                on: {
                                    click: function(e) {
                                        return t.select("hour", hr)
                                    },
                                    keydown: [function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "tab", 9, e.key, "Tab") ? null : t.onTab("hour", hr, e)
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "space", 32, e.key, [" ", "Spacebar"]) ? null : (e.preventDefault(), t.select("hour", hr))
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "enter", 13, e.key, "Enter") ? null : (e.preventDefault(), t.select("hour", hr))
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "up", 38, e.key, ["Up", "ArrowUp"]) ? null : (e.preventDefault(), t.prevItem("hour", hr))
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "down", 40, e.key, ["Down", "ArrowDown"]) ? null : (e.preventDefault(), t.nextItem("hour", hr))
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "left", 37, e.key, ["Left", "ArrowLeft"]) || "button" in e && 0 !== e.button ? null : (e.preventDefault(), t.toLeftColumn("hour"))
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "right", 39, e.key, ["Right", "ArrowRight"]) || "button" in e && 2 !== e.button ? null : (e.preventDefault(), t.toRightColumn("hour"))
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "esc", 27, e.key, ["Esc", "Escape"]) || e.ctrlKey || e.shiftKey || e.altKey || e.metaKey ? null : t.debounceBlur.apply(null, arguments)
                                    }],
                                    blur: t.debounceBlur,
                                    focus: t.keepFocusing
                                }
                            }) : t._e()]
                        }))], 2) : t._e(), t._v(" "), "minute" === n ? e("ul", {
                            key: n,
                            staticClass: "minutes",
                            attrs: {
                                tabindex: "-1"
                            },
                            on: {
                                scroll: t.keepFocusing
                            }
                        }, [e("li", {
                            staticClass: "hint",
                            attrs: {
                                tabindex: "-1"
                            },
                            domProps: {
                                textContent: t._s(t.minuteLabelText)
                            }
                        }), t._v(" "), t._l(t.minutes, (function(n, o) {
                            return [!t.opts.hideDisabledMinutes || t.opts.hideDisabledMinutes && !t.isDisabled("minute", n) ? e("li", {
                                key: o,
                                class: {
                                    active: t.minute === n
                                },
                                attrs: {
                                    tabindex: t.isDisabled("minute", n) ? -1 : t.tabindex,
                                    "data-key": n,
                                    disabled: t.isDisabled("minute", n)
                                },
                                domProps: {
                                    textContent: t._s(n)
                                },
                                on: {
                                    click: function(e) {
                                        return t.select("minute", n)
                                    },
                                    keydown: [function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "tab", 9, e.key, "Tab") ? null : t.onTab("minute", n, e)
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "space", 32, e.key, [" ", "Spacebar"]) ? null : (e.preventDefault(), t.select("minute", n))
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "enter", 13, e.key, "Enter") ? null : (e.preventDefault(), t.select("minute", n))
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "up", 38, e.key, ["Up", "ArrowUp"]) ? null : (e.preventDefault(), t.prevItem("minute", n))
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "down", 40, e.key, ["Down", "ArrowDown"]) ? null : (e.preventDefault(), t.nextItem("minute", n))
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "left", 37, e.key, ["Left", "ArrowLeft"]) || "button" in e && 0 !== e.button ? null : (e.preventDefault(), t.toLeftColumn("minute"))
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "right", 39, e.key, ["Right", "ArrowRight"]) || "button" in e && 2 !== e.button ? null : (e.preventDefault(), t.toRightColumn("minute"))
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "esc", 27, e.key, ["Esc", "Escape"]) || e.ctrlKey || e.shiftKey || e.altKey || e.metaKey ? null : t.debounceBlur.apply(null, arguments)
                                    }],
                                    blur: t.debounceBlur,
                                    focus: t.keepFocusing
                                }
                            }) : t._e()]
                        }))], 2) : t._e(), t._v(" "), "second" === n ? e("ul", {
                            key: n,
                            staticClass: "seconds",
                            attrs: {
                                tabindex: "-1"
                            },
                            on: {
                                scroll: t.keepFocusing
                            }
                        }, [e("li", {
                            staticClass: "hint",
                            attrs: {
                                tabindex: "-1"
                            },
                            domProps: {
                                textContent: t._s(t.secondLabelText)
                            }
                        }), t._v(" "), t._l(t.seconds, (function(s, n) {
                            return [!t.opts.hideDisabledSeconds || t.opts.hideDisabledSeconds && !t.isDisabled("second", s) ? e("li", {
                                key: n,
                                class: {
                                    active: t.second === s
                                },
                                attrs: {
                                    tabindex: t.isDisabled("second", s) ? -1 : t.tabindex,
                                    "data-key": s,
                                    disabled: t.isDisabled("second", s)
                                },
                                domProps: {
                                    textContent: t._s(s)
                                },
                                on: {
                                    click: function(e) {
                                        return t.select("second", s)
                                    },
                                    keydown: [function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "tab", 9, e.key, "Tab") ? null : t.onTab("second", s, e)
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "space", 32, e.key, [" ", "Spacebar"]) ? null : (e.preventDefault(), t.select("second", s))
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "enter", 13, e.key, "Enter") ? null : (e.preventDefault(), t.select("second", s))
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "up", 38, e.key, ["Up", "ArrowUp"]) ? null : (e.preventDefault(), t.prevItem("second", s))
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "down", 40, e.key, ["Down", "ArrowDown"]) ? null : (e.preventDefault(), t.nextItem("second", s))
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "left", 37, e.key, ["Left", "ArrowLeft"]) || "button" in e && 0 !== e.button ? null : (e.preventDefault(), t.toLeftColumn("second"))
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "right", 39, e.key, ["Right", "ArrowRight"]) || "button" in e && 2 !== e.button ? null : (e.preventDefault(), t.toRightColumn("second"))
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "esc", 27, e.key, ["Esc", "Escape"]) || e.ctrlKey || e.shiftKey || e.altKey || e.metaKey ? null : t.debounceBlur.apply(null, arguments)
                                    }],
                                    blur: t.debounceBlur,
                                    focus: t.keepFocusing
                                }
                            }) : t._e()]
                        }))], 2) : t._e(), t._v(" "), "apm" === n ? e("ul", {
                            key: n,
                            staticClass: "apms",
                            attrs: {
                                tabindex: "-1"
                            },
                            on: {
                                scroll: t.keepFocusing
                            }
                        }, [e("li", {
                            staticClass: "hint",
                            attrs: {
                                tabindex: "-1"
                            },
                            domProps: {
                                textContent: t._s(t.apmLabelText)
                            }
                        }), t._v(" "), t._l(t.apms, (function(a, n) {
                            return [!t.opts.hideDisabledHours || t.opts.hideDisabledHours && !t.isDisabled("apm", a) ? e("li", {
                                key: n,
                                class: {
                                    active: t.apm === a
                                },
                                attrs: {
                                    tabindex: t.isDisabled("apm", a) ? -1 : t.tabindex,
                                    "data-key": a,
                                    disabled: t.isDisabled("apm", a)
                                },
                                domProps: {
                                    textContent: t._s(t.apmDisplayText(a))
                                },
                                on: {
                                    click: function(e) {
                                        return t.select("apm", a)
                                    },
                                    keydown: [function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "tab", 9, e.key, "Tab") ? null : t.onTab("apm", a, e)
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "space", 32, e.key, [" ", "Spacebar"]) ? null : (e.preventDefault(), t.select("apm", a))
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "enter", 13, e.key, "Enter") ? null : (e.preventDefault(), t.select("apm", a))
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "up", 38, e.key, ["Up", "ArrowUp"]) ? null : (e.preventDefault(), t.prevItem("apm", a))
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "down", 40, e.key, ["Down", "ArrowDown"]) ? null : (e.preventDefault(), t.nextItem("apm", a))
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "left", 37, e.key, ["Left", "ArrowLeft"]) || "button" in e && 0 !== e.button ? null : (e.preventDefault(), t.toLeftColumn("apm"))
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "right", 39, e.key, ["Right", "ArrowRight"]) || "button" in e && 2 !== e.button ? null : (e.preventDefault(), t.toRightColumn("apm"))
                                    }, function(e) {
                                        return !e.type.indexOf("key") && t._k(e.keyCode, "esc", 27, e.key, ["Esc", "Escape"]) || e.ctrlKey || e.shiftKey || e.altKey || e.metaKey ? null : t.debounceBlur.apply(null, arguments)
                                    }],
                                    blur: t.debounceBlur,
                                    focus: t.keepFocusing
                                }
                            }) : t._e()]
                        }))], 2) : t._e()]
                    }))] : t._e()], 2)])])
                }), [], !1, null, null, null);
            e.a = component.exports
        },
        1073: function(t, e, n) {
            "use strict";
            n.d(e, "a", (function() {
                return c
            }));
            var o = n(38),
                r = n(31),
                l = n(14);

            function c(t, e) {
                Object(l.a)(2, arguments);
                var n = Object(r.a)(t),
                    c = Object(o.a)(e);
                if (isNaN(c)) return new Date(NaN);
                if (!c) return n;
                var d = n.getDate(),
                    h = new Date(n.getTime());
                h.setMonth(n.getMonth() + c + 1, 0);
                var m = h.getDate();
                return d >= m ? h : (n.setFullYear(h.getFullYear(), h.getMonth(), d), n)
            }
        },
        1074: function(t, e, n) {
            "use strict";
            n(1013)
        },
        1075: function(t, e, n) {
            "use strict";
            n(1014)
        },
        1076: function(t, e, n) {
            "use strict";
            n(1015)
        },
        1077: function(t, e, n) {
            "use strict";
            n(1016)
        },
        1078: function(t, e, n) {
            "use strict";
            n(1017)
        },
        1079: function(t, e, n) {
            t.exports = {}
        },
        1080: function(t, e, n) {
            "use strict";
            Object.defineProperty(e, "__esModule", {
                value: !0
            }), e.default = function(t) {
                if (null === t || !0 === t || !1 === t) return NaN;
                var e = Number(t);
                if (isNaN(e)) return e;
                return e < 0 ? Math.ceil(e) : Math.floor(e)
            }, t.exports = e.default
        },
        1081: function(t, e, n) {
            "use strict";
            Object.defineProperty(e, "__esModule", {
                value: !0
            }), e.default = function(t) {
                var e = new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate(), t.getHours(), t.getMinutes(), t.getSeconds(), t.getMilliseconds()));
                return e.setUTCFullYear(t.getFullYear()), t.getTime() - e.getTime()
            }, t.exports = e.default
        },
        1082: function(t, e, n) {
            "use strict";
            n(1018)
        },
        1083: function(t, e, n) {
            "use strict";
            n(1019)
        },
        1084: function(t, e, n) {
            "use strict";
            n(1020)
        },
        1109: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(886),
                r = n(885),
                l = n(891),
                c = n(975),
                d = n(40).z.extend({
                    name: "ActivitySchedule",
                    components: {
                        TimePicker: c.default
                    },
                    props: {
                        schedule: {
                            type: Object,
                            required: !0
                        },
                        minDate: {
                            type: String,
                            default: ""
                        }
                    },
                    data() {
                        return {
                            inputs: this.schedule,
                            date: "",
                            startTime: "",
                            endTime: ""
                        }
                    },
                    methods: {
                        updateStartDateTime() {
                            this.$data.inputs.start_datetime = this.isoDateTime(this.$data.date, this.$data.startTime)
                        },
                        updateEndDateTime() {
                            this.$data.inputs.end_datetime = this.isoDateTime(this.$data.date, this.$data.endTime)
                        }
                    },
                    watch: {
                        date() {
                            this.$data.startTime && this.updateStartDateTime(), this.$data.endTime && this.updateEndDateTime()
                        },
                        startTime() {
                            this.date && this.updateStartDateTime()
                        },
                        endTime() {
                            this.date && this.updateEndDateTime()
                        },
                        inputs: {
                            deep: !0,
                            handler() {
                                this.$emit("scheduleChange", this.inputs)
                            }
                        }
                    }
                }),
                h = (n(1075), n(9)),
                component = Object(h.a)(d, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "ActivitySchedule"
                    }, [e(r.a, [e(o.a, {
                        staticClass: "mx-auto mb-6 pt-0 pb-0",
                        attrs: {
                            cols: "12",
                            lg: "4",
                            md: "4",
                            sm: "12"
                        }
                    }, [e("DatePicker", {
                        attrs: {
                            label: "Start date",
                            "initial-date": t.initialDate(t.inputs.start_datetime),
                            "date-range": t.minDate,
                            "date-range-min": ""
                        },
                        on: {
                            dateChange: function(e) {
                                t.date = e
                            }
                        }
                    })], 1), t._v(" "), e(o.a, {
                        staticClass: "mx-auto mb-12 pt-0 pb-0",
                        attrs: {
                            cols: "12",
                            lg: "4",
                            md: "4",
                            sm: "6"
                        }
                    }, [e("TimePicker", {
                        staticClass: "ActivityPlan__date-time mb-6",
                        attrs: {
                            "initial-time": t.initialTime(t.inputs.start_datetime),
                            label: "Start time"
                        },
                        on: {
                            timeChange: function(e) {
                                t.startTime = e
                            }
                        }
                    })], 1), t._v(" "), e(o.a, {
                        staticClass: "mx-auto mb-6 pt-0 pb-0",
                        attrs: {
                            cols: "12",
                            lg: "4",
                            md: "4",
                            sm: "6"
                        }
                    }, [e("TimePicker", {
                        staticClass: "ActivityPlan__date-time mb-6",
                        attrs: {
                            "initial-time": t.initialTime(t.inputs.end_datetime),
                            label: "End time"
                        },
                        on: {
                            timeChange: function(e) {
                                t.endTime = e
                            }
                        }
                    })], 1), t._v(" "), e(o.a, {
                        staticClass: "pt-0 pb-0",
                        attrs: {
                            cols: "12",
                            lg: "12",
                            md: "12",
                            sm: "12"
                        }
                    }, [e(l.a, {
                        attrs: {
                            maxlength: "1000",
                            "auto-grow": "",
                            "row-height": 6,
                            counter: "",
                            label: "Enter activity plan"
                        },
                        model: {
                            value: t.inputs.description,
                            callback: function(e) {
                                t.$set(t.inputs, "description", e)
                            },
                            expression: "inputs.description"
                        }
                    })], 1), t._v(" "), e(o.a, {
                        staticClass: "pt-0 pb-0",
                        attrs: {
                            cols: "12",
                            lg: "6",
                            md: "6",
                            sm: "6"
                        }
                    }, [e(l.a, {
                        attrs: {
                            maxlength: "500",
                            "auto-grow": "",
                            "row-height": 6,
                            counter: "",
                            label: "Who is leading?"
                        },
                        model: {
                            value: t.inputs.leader_notes,
                            callback: function(e) {
                                t.$set(t.inputs, "leader_notes", e)
                            },
                            expression: "inputs.leader_notes"
                        }
                    })], 1), t._v(" "), e(o.a, {
                        staticClass: "pt-0 pb-0",
                        attrs: {
                            cols: "12",
                            lg: "6",
                            md: "6",
                            sm: "6"
                        }
                    }, [e(l.a, {
                        attrs: {
                            maxlength: "500",
                            "auto-grow": "",
                            "row-height": 6,
                            counter: "",
                            label: "Who is assisting?"
                        },
                        model: {
                            value: t.inputs.assistant_notes,
                            callback: function(e) {
                                t.$set(t.inputs, "assistant_notes", e)
                            },
                            expression: "inputs.assistant_notes"
                        }
                    })], 1)], 1)], 1)
                }), [], !1, null, "7948b73c", null);
            e.default = component.exports;
            installComponents(component, {
                DatePicker: n(921).default,
                TimePicker: n(975).default
            })
        },
        1110: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(1004),
                r = n(870),
                l = n(62),
                c = n(11),
                d = n.n(c),
                h = n(23),
                m = n.n(h),
                v = n(40),
                _ = n(4),
                y = n(5),
                f = v.z.extend({
                    name: "ProjectPatrol",
                    props: {},
                    data: () => ({
                        requestPending: !1,
                        membershipNumber: "",
                        member: {},
                        branch: null,
                        branches: [{
                            id: 1,
                            name: "ACT",
                            value: "act"
                        }, {
                            id: 2,
                            name: "NSW",
                            value: "nsw"
                        }, {
                            id: 3,
                            name: "NT",
                            value: "nt"
                        }, {
                            id: 4,
                            name: "QLD",
                            value: "qld"
                        }, {
                            id: 5,
                            name: "SA",
                            value: "sa"
                        }, {
                            id: 6,
                            name: "TAS",
                            value: "tas"
                        }, {
                            id: 7,
                            name: "VIC",
                            value: "vic"
                        }, {
                            id: 8,
                            name: "WA",
                            value: "wa"
                        }]
                    }),
                    computed: {
                        isValid() {
                            return this.$data.membershipNumber && this.$data.branch
                        },
                        memberConfirmed() {
                            return !!this.$data.member.id
                        }
                    },
                    methods: {
                        reset() {
                            this.branch = null, this.membershipNumber = ""
                        },
                        async lookupMember(t, e) {
                            this.$data.requestPending || (this.$data.requestPending = !0, await this.httpRequest({
                                axiosRequest: d.a.get,
                                url: `${this.$config.api.members}${_.MEMBERS_PATH}/?branch=${t}&member_number=${e}`,
                                successResponseCode: m.a.OK,
                                errorMessage: y.j.MEMBER_NOT_FOUND,
                                successMessage: y.j.MEMBER_FOUND_ADDED,
                                showSnackbar: !0,
                                responseHandler: t => {
                                    if (t.status === m.a.BAD_REQUEST) return !1;
                                    this.$data.member = t.data, this.reset(), this.$emit("membershipNumberUpdate", this.$data.member), this.$data.requestPending = !1
                                },
                                errorHandler: () => {
                                    this.$data.requestPending = !1
                                }
                            }))
                        }
                    }
                }),
                w = n(9),
                component = Object(w.a)(f, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "ProjectPatrol"
                    }, [e(o.a, {
                        staticClass: "mt-8",
                        attrs: {
                            items: t.branches,
                            "item-text": "name",
                            label: "Select branch"
                        },
                        model: {
                            value: t.branch,
                            callback: function(e) {
                                t.branch = e
                            },
                            expression: "branch"
                        }
                    }), t._v(" "), e(l.a, {
                        attrs: {
                            counter: "",
                            maxlength: "10",
                            label: "Enter membership number"
                        },
                        model: {
                            value: t.membershipNumber,
                            callback: function(e) {
                                t.membershipNumber = e
                            },
                            expression: "membershipNumber"
                        }
                    }), t._v(" "), e(r.a, {
                        attrs: {
                            outlined: "",
                            small: "",
                            disabled: !t.isValid,
                            loading: t.requestPending
                        },
                        on: {
                            keydown: function(e) {
                                return t.lookupMember(t.branch, t.membershipNumber)
                            },
                            click: function(e) {
                                return t.lookupMember(t.branch, t.membershipNumber)
                            }
                        }
                    }, [t._v("\n    Add participant\n  ")])], 1)
                }), [], !1, null, "28f517af", null);
            e.default = component.exports
        },
        1111: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(1004),
                r = n(998),
                l = n(886),
                c = n(1133),
                d = n(1132),
                h = n(885),
                m = n(891),
                v = n(40),
                _ = n(55),
                y = n(144),
                f = n(953),
                w = n(924),
                k = n(5),
                C = v.z.extend({
                    name: "ActivityReview",
                    components: {
                        PageHeader: f.default,
                        Icon: _.default,
                        InfoCard: y.default,
                        TwoColumnSelectableList: w.default
                    },
                    props: {
                        activityData: {
                            type: Object,
                            required: !0
                        },
                        entityMembers: {
                            type: Array,
                            required: !0
                        },
                        inviteeType: {
                            type: String,
                            required: !0
                        },
                        entityMemberNames: {
                            type: String,
                            required: !0
                        },
                        activityEnded: {
                            type: Boolean,
                            required: !0
                        }
                    },
                    data: () => ({
                        LABEL: k.i,
                        SCOUT_METHOD_LIST: k.t,
                        SPICES_LIST: k.B,
                        scoutMethodList: [],
                        spicesList: [],
                        reviewModel: {}
                    }),
                    created() {
                        this.scoutMethodList = this.freeze(this.SCOUT_METHOD_LIST), this.spicesList = this.freeze(this.SPICES_LIST), this.reviewModel = this.activityData.review
                    },
                    computed: {
                        spicesElements() {
                            return this.activityData.review.scout_spices_elements || []
                        },
                        organisersFormatted() {
                            return this.activityData.organisers.map(t => `${t.first_name} ${t.last_name}`).join(", ")
                        }
                    },
                    methods: {
                        selectedScoutMethod(t) {
                            this.$root.$emit("activity-review-scout-method", t)
                        },
                        selectedSpices(t) {
                            const e = this.$data.reviewModel.scout_spices_elements;
                            if (t) {
                                e.find(e => e === t.id) ? e.splice(e.findIndex((function(e) {
                                    return e === t.id
                                })), 1) : e.push(t.id)
                            }
                        }
                    }
                }),
                A = (n(1076), n(9)),
                component = Object(A.a)(C, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "ActivityReview"
                    }, [e(h.a, [e(l.a, [t.isActivityConcluded ? t._e() : e("InfoCard", {
                        staticClass: "mb-12",
                        attrs: {
                            "info-type": "info",
                            subtitle: "Don’t forget to Review this activity after it has finished. Participates, Assists and Leads will only be assigned once the Review is completed and the activity has been concluded."
                        }
                    }), t._v(" "), e("section", [e("div", {
                        staticClass: "ActivityReview__subtitle"
                    }, [t._v("Who organised this activity?")]), t._v(" "), e("div", {
                        staticClass: "ActivityReview__body"
                    }, [t._v(t._s(t.organisersFormatted))]), t._v(" "), e("div", {
                        staticClass: "ActivityReview__subtitle mt-8"
                    }, [t._v("Who was this activity for?")]), t._v(" "), e("div", {
                        staticClass: "ActivityReview__body"
                    }, [t._v(t._s(t.entityMemberNames))]), t._v(" "), e("div", {
                        staticClass: "mt-12"
                    }, [t._v(t._s(t.activityData.invitee))]), t._v(" "), e(o.a, {
                        staticClass: "ActivityReview__select mt-0 mb-10",
                        attrs: {
                            "data-cy": "led_activity",
                            items: t.entityMembers.filter(e => !t.activityData.attendance.assistant_members.includes(e)),
                            disabled: !t.activityEnded,
                            "return-object": "",
                            "item-text": "full_name",
                            "item-value": "id",
                            label: "Who led this activity?",
                            "deletable-chips": "",
                            multiple: "",
                            chips: "",
                            hint: "Selected members will be awarded a Lead in their current Milestone.",
                            "persistent-hint": ""
                        },
                        model: {
                            value: t.activityData.attendance.leader_members,
                            callback: function(e) {
                                t.$set(t.activityData.attendance, "leader_members", e)
                            },
                            expression: "activityData.attendance.leader_members"
                        }
                    }), t._v(" "), e(o.a, {
                        staticClass: "ActivityReview__select mt-0 mb-12",
                        attrs: {
                            "data-cy": "assisted_activity",
                            items: t.entityMembers.filter(e => !t.activityData.attendance.leader_members.includes(e)),
                            disabled: !t.activityEnded,
                            "return-object": "",
                            "item-text": "full_name",
                            "item-value": "id",
                            label: "Who assisted this activity?",
                            "deletable-chips": "",
                            multiple: "",
                            chips: "",
                            hint: "Selected members will be awarded an Assist in their current Milestone.",
                            "persistent-hint": ""
                        },
                        model: {
                            value: t.activityData.attendance.assistant_members,
                            callback: function(e) {
                                t.$set(t.activityData.attendance, "assistant_members", e)
                            },
                            expression: "activityData.attendance.assistant_members"
                        }
                    }), t._v(" "), e("div", {
                        staticClass: "ActivityReview__subtitle mt-3 mb-3"
                    }, [t._v("How was the activity?*")]), t._v(" "), e(d.a, {
                        staticClass: "ActivityReview__radio-group",
                        attrs: {
                            disabled: !t.activityEnded,
                            row: ""
                        },
                        model: {
                            value: t.reviewModel.general_rating,
                            callback: function(e) {
                                t.$set(t.reviewModel, "general_rating", e)
                            },
                            expression: "reviewModel.general_rating"
                        }
                    }, [e(c.a, {
                        staticClass: "ActivityReview__radio",
                        attrs: {
                            label: "Great",
                            value: "great",
                            name: "great",
                            "data-cy": "great-checkbox"
                        }
                    }), t._v(" "), e(c.a, {
                        staticClass: "ActivityReview__radio",
                        attrs: {
                            label: "Okay",
                            value: "okay",
                            name: "okay",
                            "data-cy": "okay-checkbox"
                        }
                    }), t._v(" "), e(c.a, {
                        staticClass: "ActivityReview__radio",
                        attrs: {
                            label: "Boring",
                            value: "boring",
                            name: "boring",
                            "data-cy": "boring-checkbox"
                        }
                    })], 1), t._v(" "), e("div", {
                        staticClass: "ActivityReview__subtitle mt-4"
                    }, [t._v("This activity was*")]), t._v(" "), e("div", {
                        staticClass: "ActivityReview__checkbox-container mb-12"
                    }, [e(r.a, {
                        staticClass: "ActivityReview__checkbox",
                        attrs: {
                            "data-cy": "adventurous-checkbox",
                            disabled: !t.activityEnded,
                            "on-icon": "mdi-checkbox-marked-circle",
                            "off-icon": "mdi-checkbox-blank-circle-outline",
                            label: "Adventurous",
                            value: "adventurous"
                        },
                        model: {
                            value: t.reviewModel.general_tags,
                            callback: function(e) {
                                t.$set(t.reviewModel, "general_tags", e)
                            },
                            expression: "reviewModel.general_tags"
                        }
                    }), t._v(" "), e(r.a, {
                        staticClass: "ActivityReview__checkbox",
                        attrs: {
                            "data-cy": "fun-checkbox",
                            disabled: !t.activityEnded,
                            "on-icon": "mdi-checkbox-marked-circle",
                            "off-icon": "mdi-checkbox-blank-circle-outline",
                            label: "Fun",
                            value: "fun"
                        },
                        model: {
                            value: t.reviewModel.general_tags,
                            callback: function(e) {
                                t.$set(t.reviewModel, "general_tags", e)
                            },
                            expression: "reviewModel.general_tags"
                        }
                    }), t._v(" "), e(r.a, {
                        staticClass: "ActivityReview__checkbox",
                        attrs: {
                            "data-cy": "challenging-checkbox",
                            disabled: !t.activityEnded,
                            "on-icon": "mdi-checkbox-marked-circle",
                            "off-icon": "mdi-checkbox-blank-circle-outline",
                            label: "Challenging",
                            value: "challenging"
                        },
                        model: {
                            value: t.reviewModel.general_tags,
                            callback: function(e) {
                                t.$set(t.reviewModel, "general_tags", e)
                            },
                            expression: "reviewModel.general_tags"
                        }
                    }), t._v(" "), e(r.a, {
                        staticClass: "ActivityReview__checkbox",
                        attrs: {
                            "data-cy": "inclusive-checkbox",
                            disabled: !t.activityEnded,
                            "on-icon": "mdi-checkbox-marked-circle",
                            "off-icon": "mdi-checkbox-blank-circle-outline",
                            label: "Inclusive",
                            value: "inclusive"
                        },
                        model: {
                            value: t.reviewModel.general_tags,
                            callback: function(e) {
                                t.$set(t.reviewModel, "general_tags", e)
                            },
                            expression: "reviewModel.general_tags"
                        }
                    })], 1), t._v(" "), e("div", {
                        staticClass: "ActivityReview__subtitle d-flex mt-4 mb-4"
                    }, [t._v("\n          What elements of the Scout Method were covered in this activity?*\n        ")]), t._v(" "), e("TwoColumnSelectableList", {
                        staticClass: "mt-4 mb-8",
                        attrs: {
                            disabled: !t.activityEnded,
                            items: t.listSelections(t.scoutMethodList, t.reviewModel.scout_method_elements),
                            "selected-callback": t.selectedScoutMethod
                        }
                    }), t._v(" "), e(m.a, {
                        staticClass: "mb-12",
                        attrs: {
                            disabled: !t.activityEnded,
                            "auto-grow": "",
                            "row-height": 6,
                            counter: "",
                            maxlength: "1000",
                            label: "How was the Scout Method covered?"
                        },
                        model: {
                            value: t.reviewModel.scout_method_description,
                            callback: function(e) {
                                t.$set(t.reviewModel, "scout_method_description", e)
                            },
                            expression: "reviewModel.scout_method_description"
                        }
                    }), t._v(" "), e("div", {
                        staticClass: "ActivityReview__subtitle d-flex mb-6"
                    }, [t._v("\n          What SPICES areas did the members of the Unit engage with during this activity / event?*\n        ")]), t._v(" "), e("TwoColumnSelectableList", {
                        staticClass: "mt-4 mb-12",
                        attrs: {
                            disabled: !t.activityEnded,
                            items: t.listSelections(t.spicesList, t.spicesElements),
                            "selected-callback": t.selectedSpices
                        }
                    }), t._v(" "), e(m.a, {
                        attrs: {
                            disabled: !t.activityEnded,
                            "auto-grow": "",
                            "row-height": 6,
                            counter: "",
                            maxlength: "1000",
                            label: t.growthLabel(t.inviteeType)
                        },
                        model: {
                            value: t.reviewModel.growth_description,
                            callback: function(e) {
                                t.$set(t.reviewModel, "growth_description", e)
                            },
                            expression: "reviewModel.growth_description"
                        }
                    })], 1)], 1)], 1)], 1)
                }), [], !1, null, null, null);
            e.default = component.exports
        },
        1112: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(236),
                r = n(886),
                l = n(885),
                c = n(28),
                d = n(40),
                h = n(55),
                m = n(144),
                v = n(953),
                _ = n(924),
                y = n(17),
                f = n(5),
                w = d.z.extend({
                    name: "ActivityReviewSummary",
                    components: {
                        PageHeader: v.default,
                        Icon: h.default,
                        InfoCard: m.default,
                        TwoColumnSelectableList: _.default
                    },
                    props: {
                        activityData: {
                            type: Object,
                            required: !0
                        },
                        entityMembers: {
                            type: Array,
                            required: !0
                        },
                        entityMemberNames: {
                            type: String,
                            required: !0
                        },
                        inviteeType: {
                            type: String,
                            required: !0
                        },
                        disabled: {
                            type: Boolean,
                            required: !0
                        }
                    },
                    data: () => ({
                        titleCase: c.h,
                        LABEL: f.i,
                        ROLES: y,
                        SCOUT_METHOD_LIST: f.t,
                        SPICES_LIST: f.B
                    }),
                    computed: {
                        generalRating() {
                            return this.activityData.review.general_rating ? Object(c.h)(this.activityData.review.general_rating) : "-"
                        },
                        generalTags() {
                            var t;
                            return (null === (t = this.activityData.review.general_tags) || void 0 === t ? void 0 : t.length) ? this.activityData.review.general_tags.map(t => t).join(", ") : "-"
                        },
                        scoutMethodCovered() {
                            return this.activityData.review.scout_method_description ? Object(c.h)(this.activityData.review.scout_method_description) : "-"
                        },
                        organisersFormatted() {
                            return this.activityData.organisers.map(t => `${t.first_name} ${t.last_name}`).join(", ")
                        }
                    },
                    methods: {
                        selectedScoutMethod(t) {
                            const e = this.activityData.review.scout_method_elements;
                            if (t) {
                                e.find(e => e === t.id) ? e.splice(e.findIndex((function(e) {
                                    return e === t.id
                                })), 1) : e.push(t.id)
                            }
                        }
                    }
                }),
                k = (n(1077), n(9)),
                component = Object(k.a)(w, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "ActivityReviewSummary"
                    }, [e(l.a, [e(r.a, [e("section", [e("div", {
                        staticClass: "ActivityReviewSummary__review-title mt-0"
                    }, [t._v("Who organised this activity?")]), t._v(" "), e("div", {
                        staticClass: "ActivityReviewSummary__review-answer"
                    }, [t._v("\n          " + t._s(t.organisersFormatted) + "\n        ")]), t._v(" "), e("div", {
                        staticClass: "ActivityReviewSummary__review-title"
                    }, [t._v("Who was this activity for?")]), t._v(" "), e("div", {
                        staticClass: "ActivityReviewSummary__review-answer"
                    }, [t._v("\n          " + t._s(t.entityMemberNames) + "\n        ")]), t._v(" "), e("div", {
                        staticClass: "ActivityReviewSummary__review-title"
                    }, [t._v("Who led the activity?")]), t._v(" "), e("div", {
                        staticClass: "ActivityReviewSummary__review-answer"
                    }, [t._v("\n          " + t._s(t.leaderNames(t.activityData)) + "\n        ")]), t._v(" "), e("div", {
                        staticClass: "ActivityReviewSummary__review-title"
                    }, [t._v("Who assisted the activity?")]), t._v(" "), e("div", {
                        staticClass: "ActivityReviewSummary__review-answer"
                    }, [t._v("\n          " + t._s(t.assistantNames(t.activityData)) + "\n        ")]), t._v(" "), e("div", {
                        staticClass: "ActivityReviewSummary__review-title"
                    }, [t._v("How was the activity?")]), t._v(" "), e("div", {
                        staticClass: "ActivityReviewSummary__review-answer"
                    }, [t._v("\n          " + t._s(t.generalRating) + "\n        ")]), t._v(" "), e("div", {
                        staticClass: "ActivityReviewSummary__review-title"
                    }, [t._v("This activity was")]), t._v(" "), e("div", {
                        staticClass: "ActivityReviewSummary__review-answer",
                        staticStyle: {
                            "text-transform": "capitalize"
                        }
                    }, [t._v("\n          " + t._s(t.generalTags) + "\n        ")]), t._v(" "), e("div", {
                        staticClass: "ActivityReviewSummary__review-title d-flex mb-2"
                    }, [t._v("\n          What elements of the Scout Method were covered in this activity?\n        ")]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__card-container"
                    }, t._l(t.activityData.review.scout_method_elements, (function(n, r) {
                        return e(o.a, {
                            key: r,
                            staticClass: "ActivityPlan__list-card"
                        }, [e(l.a, {
                            staticStyle: {
                                height: "100%"
                            },
                            attrs: {
                                "no-gutters": "",
                                align: "center"
                            }
                        }, [e("img", {
                            attrs: {
                                width: "48",
                                height: "48",
                                alt: n,
                                src: t.fetchIcon(n)
                            }
                        }), t._v(" "), e("div", {
                            staticClass: "ml-4"
                        }, [t._v("\n                " + t._s(t.getSelectedListTitle(t.SCOUT_METHOD_LIST, n)) + "\n              ")])])], 1)
                    })), 1), t._v(" "), e("div", {
                        staticClass: "ActivityReviewSummary__review-title d-flex mb-2"
                    }, [t._v("\n          What SPICES areas did the members of the Unit engage with during this activity / event?\n        ")]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__card-container"
                    }, t._l(t.activityData.review.scout_spices_elements, (function(n, r) {
                        return e(o.a, {
                            key: r,
                            staticClass: "ActivityPlan__list-card"
                        }, [e(l.a, {
                            staticStyle: {
                                height: "100%"
                            },
                            attrs: {
                                "no-gutters": "",
                                align: "center"
                            }
                        }, [e("img", {
                            attrs: {
                                width: "48",
                                height: "48",
                                alt: n,
                                src: t.fetchIcon(n)
                            }
                        }), t._v(" "), e("div", {
                            staticClass: "ml-4"
                        }, [t._v("\n                " + t._s(t.getSelectedListTitle(t.SPICES_LIST, n)) + "\n              ")])])], 1)
                    })), 1), t._v(" "), e("div", {
                        staticClass: "ActivityReviewSummary__review-title d-flex"
                    }, [t._v("\n          " + t._s(t.growthLabel(t.inviteeType)) + "\n        ")]), t._v(" "), e("div", {
                        staticClass: "ActivityReviewSummary__review-answer"
                    }, [t._v("\n          " + t._s(t.activityData.review.growth_description || "-") + "\n        ")]), t._v(" "), e("div", {
                        staticClass: "ActivityReviewSummary__review-title d-flex"
                    }, [t._v("How was the Scout Method covered?")]), t._v(" "), e("div", {
                        staticClass: "ActivityReviewSummary__review-answer"
                    }, [t._v("\n          " + t._s(t.scoutMethodCovered) + "\n        ")])])])], 1)], 1)
                }), [], !1, null, null, null);
            e.default = component.exports
        },
        1113: function(t, e, n) {
            "use strict";
            n.r(e);
            var o, r = n(870),
                l = n(998),
                c = n(886),
                d = n(1439),
                h = n(1090),
                m = n(1092),
                v = n(1091),
                _ = n(1089),
                y = n(1133),
                f = n(1132),
                w = n(885),
                k = n(869),
                C = n(11),
                A = n.n(C),
                T = n(5),
                S = n(4),
                P = n(40),
                $ = n(10),
                x = n(144);
            ! function(t) {
                t[t.bulk = 0] = "bulk", t[t.individual = 1] = "individual"
            }(o || (o = {}));
            const I = {
                items: [],
                oasStream: {},
                headers: {},
                diffTable: {},
                diffTableBulk: {},
                itemsPreviouslySaved: [],
                previousAchievements: [],
                panelOpen: 0,
                isReady: !1,
                templateVersion: 1
            };
            var D = P.z.extend({
                    name: "ActivityApOas",
                    components: {
                        InfoCard: x.default
                    },
                    props: {
                        activity: {
                            type: Object,
                            default: {},
                            required: !0
                        },
                        inviteeType: {
                            type: String,
                            required: !0
                        },
                        inviteeId: {
                            type: String,
                            required: !0
                        },
                        members: {
                            type: Array,
                            required: !0
                        },
                        disabled: {
                            type: Boolean
                        },
                        reviewing: {
                            type: Boolean
                        }
                    },
                    data: () => ({
                        collections: [JSON.parse(JSON.stringify(I))],
                        oasStreams: [],
                        LABEL: T.i
                    }),
                    async mounted() {
                        this.setOasStreamsStages(await this.initStreamTrees()), this.initData()
                    },
                    computed: {
                        isAwarderIndividual() {
                            return "individual" === this.activity.achievement_pathway_oas_data.award_rule
                        }
                    },
                    methods: {
                        initData() {
                            this.activity.achievement_pathway_oas_data.groups.length ? (this.collections = [], this.activity.achievement_pathway_oas_data.groups.forEach(t => {
                                const e = { ...JSON.parse(JSON.stringify(I)),
                                    group: t
                                };
                                this.collections.push(e)
                            }), this.collections.forEach(t => {
                                this.setStreamSelection(t)
                            })) : (this.setDefaultStreamSelection(), this.collections[0].isReady = !0)
                        },
                        isTableReady: t => t.isReady,
                        toggleIStatementAwarder(t) {
                            this.activity.achievement_pathway_oas_data.award_rule = t, this.updateGroups()
                        },
                        streamStageName(t) {
                            var e;
                            return null === (e = t.oasStream) || void 0 === e ? void 0 : e.fullName
                        },
                        addCollection() {
                            const t = { ...JSON.parse(JSON.stringify(I))
                            };
                            this.collections.push(t)
                        },
                        setDefaultStreamSelection() {
                            let t, e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0;
                            try {
                                t = this.oasStreams.find(t => t.stream === T.o.BUSHCRAFT && 1 === t.stages[0].value)
                            } catch (t) {
                                console.error("Stream not found.")
                            }
                            this.collections[e].oasStream = t, this.updateTable(this.collections[e])
                        },
                        setStreamSelection(t) {
                            t.oasStream = this.oasStreams.find(e => e.branchId === t.group.branch && e.stages[0].value === t.group.stage), this.updateTable(t)
                        },
                        headerDisabled: (t, e) => e.itemsPreviouslySaved.every(e => !0 === e[t]),
                        getDisabledStatement(t, e, n) {
                            const o = t.question.id;
                            for (const [t] of Object.entries(n.diffTable))
                                if (t === e.id) {
                                    if (n.diffTable[t].find(t => t === o)) return !1
                                }
                            return t[e.id]
                        },
                        changeSkillStage(t) {
                            t.isReady || this.$accessor.snackbar.setSnack({
                                message: this.streamStageName(t) + " i-statements added below.",
                                icon: "check"
                            }), this.updateTable(t)
                        },
                        updateTable(t) {
                            t.diffTable = {}, this.buildOasTable(t)
                        },
                        buildHeaders(t) {
                            const e = this.members.map(t => ({
                                    text: `${t.first_name} ${t.last_name}`,
                                    value: t.id,
                                    sortable: !1,
                                    selectable: !0,
                                    selected: !1
                                })),
                                n = t.items.map(t => ({
                                    text: "" + t.question.id,
                                    value: "" + t.bulk,
                                    sortable: !1,
                                    selectable: !0,
                                    selected: !1
                                })),
                                o = [{
                                    text: "i-statements",
                                    value: "question.label",
                                    sortable: !1,
                                    selectable: !1,
                                    width: 350
                                }];
                            t.bulkStatements = n, t.headers.indvidual = o.concat(e), t.headers.bulk = o.concat([{
                                text: "All attendees",
                                value: !1,
                                sortable: !1,
                                selectable: !0,
                                selected: !1
                            }])
                        },
                        buildOasTable(t) {
                            return A.a.get(`${this.$config.api.templates}/${t.oasStream.template}${t.oasStream.stages[0].value}/${S.LATEST_FILENAME}`).then(e => {
                                const template = e.data;
                                t.templateVersion = template.version, t.items = template.document.flatMap(t => t.input_groups).filter(t => "Verify" !== t.title).flatMap(t => t.inputs).map(input => {
                                    const t = {
                                        question: {
                                            id: input.id,
                                            label: input.label
                                        }
                                    };
                                    return this.members.forEach(e => t[e.id] = !1), t
                                }).map(t => Object.assign({}, t, {
                                    bulk: !1
                                })), this.buildHeaders(t), this.getExistingOasAchievements(t)
                            }).catch(t => {
                                this.$accessor.snackbar.setSnack({
                                    message: "Could not load template. Please try again",
                                    icon: "nope"
                                }), console.error("Failed to retrieve template. Error:", t)
                            })
                        },
                        headerClicked(t, e, n) {
                            n.items.forEach((o, r) => {
                                n.itemsPreviouslySaved[r][t] || (o[t] !== e && this.statementSelected(t, o, n), o[t] = e)
                            }), this.updateGroups()
                        },
                        headerClickedBulk(t, e, n) {
                            n.items.forEach((o, r) => {
                                n.itemsPreviouslySaved[r].bulk || (o.bulk !== e && this.statementSelectedBulk(t, n), o.bulk = e)
                            }), this.updateGroups()
                        },
                        updateGroups() {
                            const t = this.collections.map(t => ({
                                title: t.oasStream.fullName,
                                template: `${t.oasStream.template}${t.oasStream.stages[0].value}`,
                                version: t.templateVersion,
                                stage: t.oasStream.stages[0].value,
                                stream: t.oasStream.stream,
                                branch: t.oasStream.branchId,
                                statements: this.isAwarderIndividual ? this.getIndividualStatements(t.items) : this.getBulkStatements(t.items)
                            }));
                            this.activity.achievement_pathway_oas_data.groups = t
                        },
                        getIndividualStatements(t) {
                            const e = [];
                            return t.forEach(t => {
                                const n = Object.keys(t).filter(e => !["bulk", "selected"].includes(e) && !0 === t[e] && t[e]);
                                n.length && e.push({
                                    id: t.question.id,
                                    selected: !0,
                                    member_ids: n
                                })
                            }), e
                        },
                        getBulkStatements(t) {
                            const e = [];
                            return t.forEach(t => {
                                t.bulk && e.push({
                                    id: t.question.id,
                                    selected: !0,
                                    member_ids: []
                                })
                            }), e
                        },
                        async initStreamTrees() {
                            const t = Object.values(T.o),
                                e = [];
                            for (const n of t) n !== T.o.OTHER && await A.a.get(`${this.$config.api.templates}${S.OAS_PATH}/${n}/${S.TREE_FILENAME}`).then(t => {
                                e.push(t.data.tree)
                            }).catch(t => {
                                console.error("Failed to retrieve stream tree. Error:", t)
                            });
                            return e
                        },
                        setOasStreamsStages(t) {
                            let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "";
                            t.forEach(t => {
                                var n;
                                1 === t.stage && (e = t.branch_id), this.oasStreams.push({
                                    name: t.title,
                                    fullName: `${t.title} - Stage ${t.stage}`,
                                    value: t.branch_id,
                                    stages: [{
                                        name: "Stage " + t.stage,
                                        value: t.stage
                                    }],
                                    template: t.template_link.split(t.stage.toString())[0],
                                    stream: e,
                                    branchId: t.branch_id
                                }), (null === (n = t.children) || void 0 === n ? void 0 : n.length) && this.setOasStreamsStages(t.children, e)
                            })
                        },
                        projectPatrolMemberIds() {
                            return this.members.map(t => t.id).join(",")
                        },
                        achievementsEndpoint(t) {
                            const e = this.$config.api.achievements + "/v2",
                                n = `${S.ACHIEVEMENTS_PATH}?type=${$.b.OAS}&stream=${t.stream}&branch=${t.branchId}&stage=${t.stages[0].value}`;
                            return this.inviteeType === S.ACTIVITY_ENTITY.GROUP ? `${e}${S.GROUPS_PATH}/${this.inviteeId}${n}` : this.inviteeType === S.ACTIVITY_ENTITY.UNIT ? `${e}${S.UNITS_PATH}/${this.inviteeId}${n}` : this.inviteeType === S.ACTIVITY_ENTITY.PATROL ? `${e}${S.PATROLS_PATH}/${this.inviteeId}${n}` : this.inviteeType === S.ACTIVITY_ENTITY.MEMBER ? `${e}${n}&members=${this.projectPatrolMemberIds()}` : void console.error("Entity not recognized.")
                        },
                        async getExistingOasAchievements(t) {
                            t.isReady = !1, await A.a.get(this.achievementsEndpoint(t.oasStream)).then(e => {
                                t.previousAchievements = e.data.results
                            }).catch(t => {
                                this.$accessor.snackbar.setSnack({
                                    message: "Could not load achievements. Please try again",
                                    icon: "nope"
                                }), console.error("Failed to fetch achievements. Error:", t)
                            });
                            const e = t.previousAchievements.filter(t => t.imported);
                            t.previousAchievements.filter(t => !t.imported).forEach(e => {
                                const n = e.member_id;
                                e.answers && t.items.forEach(t => {
                                    const o = t.question.id;
                                    t[n] = e.answers[o] || !1
                                }), this.checkIfColumnSelected(n, t)
                            }), e.forEach(e => {
                                const n = e.member_id;
                                t.items.forEach(t => {
                                    t[n] = !0
                                }), this.checkIfColumnSelected(n, t)
                            }), t.itemsPreviouslySaved = this.freeze(t.items), this.isAwarderIndividual ? t.items.forEach((e, n) => {
                                t.group && t.group.statements.forEach(o => {
                                    o.id === e.question.id && o.member_ids.forEach(o => {
                                        if (!t.itemsPreviouslySaved[n][o]) {
                                            e[o] = !0;
                                            let n = [];
                                            t.diffTable[o] && (n = t.diffTable[o]), n.includes(e.question.id) || n.push(e.question.id), t.diffTable[o] = n
                                        }
                                        this.checkIfColumnSelected(o, t)
                                    })
                                })
                            }) : t.items.forEach(e => {
                                t.group && t.group.statements.forEach(n => {
                                    n.id === e.question.id && (e.bulk = !0, this.checkIfBulkColumnSelected(e, t))
                                })
                            }), t.isReady = !0
                        },
                        checkIfColumnSelected(t, e) {
                            let n = !0;
                            e.items.forEach(e => {
                                e[t] || (n = !1)
                            });
                            const o = e.headers.indvidual.find(header => header.value === t);
                            void 0 !== o && (o.selected = n)
                        },
                        checkIfBulkColumnSelected(t, e) {
                            let n = !0;
                            e.items.forEach(e => {
                                !e.bulk === t.bulk && (n = !1)
                            }), t.selected = n
                        },
                        updateStatements(t, e, n) {
                            this.statementSelected(t, e, n), this.updateGroups()
                        },
                        updateStatementsBulk(t, e) {
                            this.statementSelectedBulk(t, e), this.updateGroups()
                        },
                        statementSelectedBulk(t, e) {
                            this.checkIfBulkColumnSelected(t, e)
                        },
                        statementSelected(t, e, n) {
                            let o = [];
                            n.diffTable[t] && (o = n.diffTable[t]), o.includes(e.question.id) || o.push(e.question.id), n.diffTable[t] = o, this.checkIfColumnSelected(t, n)
                        }
                    }
                }),
                E = (n(1078), n(9)),
                component = Object(E.a)(D, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "ActivityApOas"
                    }, [t.reviewing ? t._e() : e(w.a, [e(c.a, {
                        attrs: {
                            cols: "12"
                        }
                    }, [e("InfoCard", {
                        staticClass: "mb-12",
                        attrs: {
                            "info-type": "info",
                            title: "You will award the i-statements for the selected Skills and Stages and, unless specified otherwise, act as a verifier for the attendees.",
                            "title-strong": "These will only be credited once the activity is concluded and participation is confirmed."
                        }
                    }), t._v(" "), e("div", {
                        staticClass: "subtitle-1"
                    }, [e("strong", [t._v("Select Skills and Stages")])]), t._v(" "), t._l(t.collections, (function(n, i) {
                        return e(k.a, {
                            key: i,
                            staticClass: "ManualAward__select",
                            attrs: {
                                placeholder: "Select a stage",
                                items: t.oasStreams,
                                "item-text": "fullName",
                                "item-value": "fullName",
                                "return-object": "",
                                "single-line": "",
                                dense: ""
                            },
                            on: {
                                change: function(e) {
                                    return t.changeSkillStage(n)
                                }
                            },
                            model: {
                                value: n.oasStream,
                                callback: function(e) {
                                    t.$set(n, "oasStream", e)
                                },
                                expression: "collection.oasStream"
                            }
                        })
                    }))], 2)], 1), t._v(" "), t.reviewing ? t._e() : e(w.a, [e(c.a, {
                        attrs: {
                            cols: "12"
                        }
                    }, [e(r.a, {
                        on: {
                            click: function(e) {
                                return t.addCollection(t.collections.length)
                            },
                            keydown: function(e) {
                                return t.addCollection(t.collections.length)
                            }
                        }
                    }, [t._v("\n        " + t._s(t.LABEL.ADD_ANOTHER) + "\n      ")])], 1)], 1), t._v(" "), t.reviewing ? t._e() : e(w.a, [e(c.a, {
                        staticClass: "pb-0 mb-n2"
                    }, [e("div", {
                        staticClass: "subtitle-1 mt-8"
                    }, [e("strong", [t._v("Select i-statements")])]), t._v(" "), e(f.a, {
                        staticClass: "ActivityPlan__radio-group",
                        attrs: {
                            row: ""
                        },
                        model: {
                            value: t.activity.achievement_pathway_oas_data.award_rule,
                            callback: function(e) {
                                t.$set(t.activity.achievement_pathway_oas_data, "award_rule", e)
                            },
                            expression: "activity.achievement_pathway_oas_data.award_rule"
                        }
                    }, [e(y.a, {
                        attrs: {
                            label: "Bulk award i-statements",
                            value: "bulk"
                        },
                        on: {
                            change: function(e) {
                                return t.toggleIStatementAwarder("bulk")
                            }
                        }
                    }), t._v(" "), e(y.a, {
                        attrs: {
                            label: "Award individual i-statements",
                            value: "individual"
                        },
                        on: {
                            change: function(e) {
                                return t.toggleIStatementAwarder("individual")
                            }
                        }
                    })], 1)], 1)], 1), t._v(" "), e(w.a, [e(c.a, {
                        staticClass: "pt-0"
                    }, t._l(t.collections, (function(n, i) {
                        return e(w.a, {
                            key: i
                        }, [e(c.a, [t.reviewing ? t._e() : e("hr", {
                            staticClass: "my-0 mb-2"
                        }), t._v(" "), e(_.a, {
                            staticClass: "ActivityApOas__expansion-panel",
                            model: {
                                value: t.collections[i].panelOpen,
                                callback: function(e) {
                                    t.$set(t.collections[i], "panelOpen", e)
                                },
                                expression: "collections[i].panelOpen"
                            }
                        }, [e(h.a, {
                            model: {
                                value: n.panelOpen,
                                callback: function(e) {
                                    t.$set(n, "panelOpen", e)
                                },
                                expression: "collection.panelOpen"
                            }
                        }, [e(v.a, [e("div", {
                            staticClass: "subtitle-1 mt-0"
                        }, [t._v(t._s(t.streamStageName(n)))])]), t._v(" "), e(m.a, [t.isAwarderIndividual ? e(d.a, {
                            staticClass: "ManualAward__table",
                            attrs: {
                                loading: !t.isTableReady(n),
                                headers: n.headers.indvidual,
                                items: n.items,
                                "hide-default-footer": !0,
                                "disable-pagination": !0,
                                "mobile-breakpoint": 0
                            },
                            scopedSlots: t._u([t._l(n.headers.indvidual, (function(o) {
                                return {
                                    key: "header." + o.value,
                                    fn: function(r) {
                                        let {
                                            header: header
                                        } = r;
                                        return [e(w.a, {
                                            key: "header." + o.value,
                                            staticClass: "flex-nowrap",
                                            attrs: {
                                                align: "center",
                                                justify: "start"
                                            }
                                        }, [o.selectable ? e(l.a, {
                                            staticClass: "mr-6 mb-1",
                                            attrs: {
                                                disabled: t.reviewing || t.headerDisabled(header.value, n)
                                            },
                                            on: {
                                                change: function(e) {
                                                    return t.headerClicked(header.value, o.selected, n)
                                                }
                                            },
                                            scopedSlots: t._u([{
                                                key: "label",
                                                fn: function() {
                                                    return [e("div", {
                                                        staticClass: "ManualAward__table-header checkbox-label"
                                                    }, [t._v(t._s(header.text))])]
                                                },
                                                proxy: !0
                                            }], null, !0),
                                            model: {
                                                value: o.selected,
                                                callback: function(e) {
                                                    t.$set(o, "selected", e)
                                                },
                                                expression: "h.selected"
                                            }
                                        }) : e("div", {
                                            staticClass: "mt-1 mb-0 ml-3 mx-6 ManualAward__table-header"
                                        }, [t._v(t._s(header.text))])], 1)]
                                    }
                                }
                            })), {
                                key: "item.question",
                                fn: function(n) {
                                    let {
                                        item: o
                                    } = n;
                                    return [e("p", {
                                        staticClass: "my-2 pr-8"
                                    }, [t._v("CC " + t._s(o.question.label))])]
                                }
                            }, t._l(t.members, (function(o) {
                                return {
                                    key: "item." + o.id,
                                    fn: function(r) {
                                        let {
                                            item: c
                                        } = r;
                                        return [e(w.a, {
                                            key: o.id,
                                            staticClass: "flex-nowrap",
                                            attrs: {
                                                align: "center",
                                                justify: "center"
                                            }
                                        }, [e(l.a, {
                                            staticClass: "mb-1",
                                            attrs: {
                                                disabled: t.reviewing || t.getDisabledStatement(c, o, n)
                                            },
                                            on: {
                                                change: function(e) {
                                                    return t.updateStatements(o.id, c, n)
                                                }
                                            },
                                            model: {
                                                value: c[o.id],
                                                callback: function(e) {
                                                    t.$set(c, o.id, e)
                                                },
                                                expression: "item[member.id]"
                                            }
                                        })], 1)]
                                    }
                                }
                            }))], null, !0)
                        }) : e(d.a, {
                            staticClass: "ManualAward__table",
                            attrs: {
                                loading: !t.isTableReady(n),
                                headers: n.headers.bulk,
                                items: n.items,
                                "hide-default-footer": !0,
                                "disable-pagination": !0,
                                "mobile-breakpoint": 0
                            },
                            scopedSlots: t._u([t._l(n.headers.bulk, (function(o) {
                                return {
                                    key: "header." + o.value,
                                    fn: function(r) {
                                        let {
                                            header: header
                                        } = r;
                                        return [e(w.a, {
                                            key: "header." + o.value,
                                            staticClass: "flex-nowrap",
                                            attrs: {
                                                align: "center",
                                                justify: "center"
                                            }
                                        }, [o.selectable ? e(l.a, {
                                            staticClass: "mr-0 ManualAward__all-attendee-checkbox",
                                            attrs: {
                                                disabled: t.reviewing
                                            },
                                            on: {
                                                change: function(e) {
                                                    return t.headerClickedBulk(o, o.selected, n)
                                                }
                                            },
                                            model: {
                                                value: o.selected,
                                                callback: function(e) {
                                                    t.$set(o, "selected", e)
                                                },
                                                expression: "h.selected"
                                            }
                                        }) : t._e(), t._v(" "), e("div", {
                                            staticClass: "ManualAward__table-header"
                                        }, [t._v("\n                        " + t._s(header.text) + "\n                      ")])], 1)]
                                    }
                                }
                            })), t._l(n.bulkStatements, (function(o) {
                                return {
                                    key: "item." + o.value,
                                    fn: function(r) {
                                        let {
                                            item: c
                                        } = r;
                                        return [e(w.a, {
                                            key: "item." + o.value,
                                            staticClass: "flex-nowrap",
                                            attrs: {
                                                align: "center",
                                                justify: "center"
                                            }
                                        }, [e(l.a, {
                                            staticClass: "mb-1",
                                            attrs: {
                                                disabled: t.reviewing
                                            },
                                            on: {
                                                change: function(e) {
                                                    return t.updateStatementsBulk(c, n)
                                                }
                                            },
                                            model: {
                                                value: c.bulk,
                                                callback: function(e) {
                                                    t.$set(c, "bulk", e)
                                                },
                                                expression: "item['bulk']"
                                            }
                                        })], 1)]
                                    }
                                }
                            }))], null, !0)
                        })], 1)], 1)], 1)], 1)], 1)
                    })), 1)], 1), t._v(" "), t.reviewing ? t._e() : e(w.a, [e(c.a, [e("InfoCard", {
                        staticClass: "mt-6 mb-6",
                        attrs: {
                            "info-type": "info",
                            title: "The nominated Organiser will be the Verifier for these i-statements."
                        }
                    })], 1)], 1)], 1)
                }), [], !1, null, "5984e129", null);
            e.default = component.exports
        },
        1114: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(1),
                r = n(1061),
                l = o.a.extend({
                    name: "ActivityPlanHeader",
                    components: {
                        CommentsPopupButton: r.default
                    },
                    props: {
                        titleText: {
                            type: String,
                            default: ""
                        },
                        showButton: {
                            type: Boolean,
                            default: !0
                        },
                        disableButton: {
                            type: Boolean,
                            default: !1
                        },
                        activity: {
                            type: Object,
                            default: null
                        }
                    }
                }),
                c = (n(1082), n(9)),
                component = Object(c.a)(l, (function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("div", {
                        staticClass: "ActivityPlanHeader"
                    }, [t("div", {
                        staticClass: "ActivityPlanHeader__title-container"
                    }, [t("h1", {
                        staticClass: "ActivityPlanHeader__title"
                    }, [this._v(this._s(this.titleText))])]), this._v(" "), t("CommentsPopupButton", {
                        attrs: {
                            visible: this.showButton,
                            disabled: this.disableButton,
                            activity: this.activity
                        }
                    })], 1)
                }), [], !1, null, "275e579c", null);
            e.default = component.exports
        },
        1115: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(886),
                r = n(897),
                l = n(1133),
                c = n(1132),
                d = n(885),
                h = n(869),
                m = n(62),
                v = n(11),
                _ = n.n(v),
                y = n(5),
                f = n(4),
                w = n(40),
                k = n(144),
                C = n(28),
                A = n(1006),
                T = w.z.extend({
                    name: "ActivityApLogbook",
                    components: {
                        InfoCard: k.default
                    },
                    props: {
                        activity: {
                            type: Object,
                            default: {},
                            required: !0
                        }
                    },
                    data: () => ({
                        showHintModal: !1,
                        activityAreaIsOas: !1,
                        LogbookAward: A.a,
                        LABEL: y.i,
                        streams: [],
                        walkaboutAwardModel: 1,
                        campingAwardModel: 1
                    }),
                    created() {
                        this.setAwardsUI(), this.logbookData.achievement_meta.stream && this.getStreams()
                    },
                    computed: {
                        logbookData() {
                            return this.activity.achievement_pathway_logbook_data
                        },
                        validateTravelledDistance() {
                            return this.logbookData.distance_travelled < 999999999
                        },
                        validateWalkaboutDistance() {
                            return this.logbookData.distance_walkabout <= this.logbookData.distance_travelled || 0 === this.logbookData.distance_walkabout
                        },
                        stream() {
                            return this.logbookData.achievement_meta.stream
                        },
                        activityAreas: () => Object.values(y.o).map(t => ({
                            text: Object(C.h)(t),
                            value: t
                        }))
                    },
                    methods: {
                        setAwardsUI() {
                            this.logbookData.categories.find(t => t === A.a.CAMPING_CATEGORY) && (this.$data.walkaboutAwardModel = A.a.WALKING_HIKE_CATEGORY), this.logbookData.categories.find(t => t === A.a.WALKING_HIKE_CATEGORY) && (this.$data.campingAwardModel = A.a.CAMPING_CATEGORY)
                        },
                        addCategory(t) {
                            const e = this.logbookData.categories;
                            e.find(e => e === t) || e.push(t)
                        },
                        removeCategory(t) {
                            const e = this.logbookData.categories,
                                n = e.indexOf(t); - 1 !== n && e.splice(n, 1)
                        },
                        onActivityAreaChange() {
                            const t = this.stream;
                            t && t !== y.o.OTHER ? (this.activityAreaIsOas = !0, this.getStreams(t)) : (this.activityAreaIsOas = !1, this.logbookData.achievement_meta.branch = null, this.streams = [])
                        },
                        async getStreams(t) {
                            const e = [];
                            await _.a.get(`${this.$config.api.templates}${f.OAS_PATH}/${t}/${f.TREE_FILENAME}`).then(t => {
                                this.getBranchStream(t.data.tree, e), this.streams = e
                            }).catch(t => {
                                console.error("Failed to retrieve stream tree. Error:", t)
                            })
                        },
                        getBranchStream(t, e) {
                            e.includes(t.title) || e.push({
                                text: t.title,
                                value: t.branch_id
                            });
                            for (const n of t.children) this.getBranchStream(n, e)
                        }
                    },
                    watch: {
                        walkaboutAwardModel(t) {
                            1 === t && (this.logbookData.distance_walkabout = 0)
                        }
                    }
                }),
                S = (n(1083), n(9)),
                component = Object(S.a)(T, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "ActivityApLogbook"
                    }, [e(d.a, [e(o.a, {
                        attrs: {
                            cols: "12"
                        }
                    }, [e("InfoCard", {
                        staticClass: "mb-12",
                        attrs: {
                            "info-type": "info",
                            title: "Only fill this section if there are activities that can be recorded in the LogbookAward.",
                            "title-strong": "You will be creating and verifying a new record in each attendee's Logbook once activities are concluded and participation confirmed. The nominated Organiser will be the Verifier for this activity."
                        }
                    }), t._v(" "), e(r.a, {
                        ref: "form"
                    }, [e(d.a, [e(o.a, {
                        attrs: {
                            cols: "12",
                            sm: "6"
                        }
                    }, [e(h.a, {
                        staticClass: "mb-0",
                        attrs: {
                            items: t.activityAreas,
                            label: "Select Activity Area*",
                            clearable: !0
                        },
                        on: {
                            change: t.onActivityAreaChange
                        },
                        model: {
                            value: t.logbookData.achievement_meta.stream,
                            callback: function(e) {
                                t.$set(t.logbookData.achievement_meta, "stream", e)
                            },
                            expression: "logbookData.achievement_meta.stream"
                        }
                    })], 1), t._v(" "), t.activityAreaIsOas ? e(o.a, {
                        attrs: {
                            cols: "12",
                            sm: "6"
                        }
                    }, [e(h.a, {
                        staticClass: "mb-6",
                        attrs: {
                            disabled: 0 === t.streams.length,
                            items: t.streams,
                            label: "Select stream*",
                            clearable: !0
                        },
                        model: {
                            value: t.logbookData.achievement_meta.branch,
                            callback: function(e) {
                                t.$set(t.logbookData.achievement_meta, "branch", e)
                            },
                            expression: "logbookData.achievement_meta.branch"
                        }
                    })], 1) : t._e()], 1), t._v(" "), e("div", [t._v("Does this activity contribute to the Camper Award?*")]), t._v(" "), e(d.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(c.a, {
                        attrs: {
                            row: ""
                        },
                        model: {
                            value: t.campingAwardModel,
                            callback: function(e) {
                                t.campingAwardModel = e
                            },
                            expression: "campingAwardModel"
                        }
                    }, [e(l.a, {
                        staticClass: "ActivityApLogbook__radio",
                        attrs: {
                            label: "Yes",
                            value: t.LogbookAward.CAMPING_CATEGORY
                        },
                        on: {
                            change: function(e) {
                                return t.addCategory(t.LogbookAward.CAMPING_CATEGORY)
                            }
                        }
                    }), t._v(" "), e(l.a, {
                        staticClass: "ActivityApLogbook__radio",
                        attrs: {
                            label: "No"
                        },
                        on: {
                            change: function(e) {
                                return t.removeCategory(t.LogbookAward.CAMPING_CATEGORY)
                            }
                        }
                    })], 1)], 1), t._v(" "), e("div", [t._v("Does this activity contribute to the Walkabout Award?*")]), t._v(" "), e(d.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(c.a, {
                        attrs: {
                            row: ""
                        },
                        model: {
                            value: t.walkaboutAwardModel,
                            callback: function(e) {
                                t.walkaboutAwardModel = e
                            },
                            expression: "walkaboutAwardModel"
                        }
                    }, [e(l.a, {
                        staticClass: "ActivityApLogbook__radio",
                        attrs: {
                            label: "Yes",
                            value: t.LogbookAward.WALKING_HIKE_CATEGORY
                        },
                        on: {
                            change: function(e) {
                                return t.addCategory(t.LogbookAward.WALKING_HIKE_CATEGORY)
                            }
                        }
                    }), t._v(" "), e(l.a, {
                        staticClass: "ActivityApLogbook__radio",
                        attrs: {
                            label: "No"
                        },
                        on: {
                            change: function(e) {
                                return t.removeCategory(t.LogbookAward.WALKING_HIKE_CATEGORY)
                            }
                        }
                    })], 1)], 1), t._v(" "), e(d.a, [e(o.a, [e("div", {
                        staticClass: "body-1-semibold mt-0 mb-6"
                    }, [t._v("\n              Note: Distances will be treated as kilometres, except for Vertical where it will be recorded as metres.\n              The following two fields will be applied pro-rata.\n            ")])])], 1), t._v(" "), e(d.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(m.a, {
                        attrs: {
                            counter: "",
                            label: "Total distance or height travelled" + (1 === t.walkaboutAwardModel ? "" : "*"),
                            hint: "Enter numbers only. This is the journey distance for all activities.",
                            maxlength: "50",
                            oninput: "this.value = this.value.replace(/[^0-9]/g, '').replace(/(\\..*)\\./g, '$1');",
                            "persistent-hint": "",
                            rules: [t.validateTravelledDistance || "Distance is too high"],
                            type: "text"
                        },
                        model: {
                            value: t.logbookData.distance_travelled,
                            callback: function(e) {
                                t.$set(t.logbookData, "distance_travelled", t._n(e))
                            },
                            expression: "logbookData.distance_travelled"
                        }
                    })], 1), t._v(" "), e(d.a, {
                        staticClass: "d-flex flex-column",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(m.a, {
                        attrs: {
                            disabled: 1 === t.walkaboutAwardModel,
                            "row-height": 6,
                            "auto-grow": "",
                            counter: "",
                            label: "Distance travelled specific to Walkabout Award" + (1 === t.walkaboutAwardModel ? "" : "*"),
                            maxlength: "50",
                            oninput: "this.value = this.value.replace(/[^0-9]/g, '').replace(/(\\..*)\\./g, '$1');",
                            "persistent-hint": "",
                            type: "text",
                            rules: [t.validateWalkaboutDistance || "Distance must be less than the total distance travelled."]
                        },
                        model: {
                            value: t.logbookData.distance_walkabout,
                            callback: function(e) {
                                t.$set(t.logbookData, "distance_walkabout", t._n(e))
                            },
                            expression: "logbookData.distance_walkabout"
                        }
                    }), t._v(" "), e("div", {
                        staticClass: "ActivityApLogbook__form-hint",
                        on: {
                            click: function(e) {
                                t.showHintModal = !0
                            },
                            keydown: function(e) {
                                t.showHintModal = !0
                            }
                        }
                    }, [t._v("\n            This must be less than or equal to the distance travelled above.\n            "), e("Icon", {
                        staticClass: "ml-2",
                        attrs: {
                            clickable: !0,
                            name: "info"
                        }
                    })], 1)], 1), t._v(" "), e(d.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(m.a, {
                        attrs: {
                            label: "Grade of activity (if applicable)",
                            "persistent-hint": "",
                            counter: "",
                            maxlength: "50",
                            "auto-grow": "",
                            "row-height": 6
                        },
                        model: {
                            value: t.logbookData.details.activity_grade,
                            callback: function(e) {
                                t.$set(t.logbookData.details, "activity_grade", e)
                            },
                            expression: "logbookData.details.activity_grade"
                        }
                    })], 1)], 1)], 1)], 1), t._v(" "), e("ConfirmationDialog", {
                        attrs: {
                            model: t.showHintModal,
                            subtitle: "This only applies to activities completed with Scouts. This may be a pro-rata distance if the Scout activity was not bushwalking. This number is separate from and must be less than or equal to the total distance travelled.",
                            "close-button-label": t.LABEL.CLOSE,
                            "close-dialog": () => t.showHintModal = !1,
                            "hide-confirm": ""
                        }
                    })], 1)
                }), [], !1, null, "1e400164", null);
            e.default = component.exports;
            installComponents(component, {
                Icon: n(55).default,
                ConfirmationDialog: n(79).default
            })
        },
        1116: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = {
                    name: "ActivityReviewSummaryBlock",
                    props: {
                        title: {
                            type: String,
                            required: !0
                        },
                        answer: {
                            type: [String, Number],
                            required: !0
                        }
                    }
                },
                r = (n(1084), n(9)),
                component = Object(r.a)(o, (function() {
                    var t = this._self._c;
                    return t("div", [t("div", {
                        staticClass: "ActivityPlan__review-title"
                    }, [this._v(this._s(this.title))]), this._v(" "), t("div", {
                        staticClass: "ActivityPlan__review-answer"
                    }, [this._v("\n    " + this._s(this.answer) + "\n  ")])])
                }), [], !1, null, "04bf8499", null);
            e.default = component.exports
        },
        1117: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(870),
                r = n(236),
                l = n(35),
                c = n(998),
                d = n(1439),
                h = n(890),
                m = n(892),
                v = n(5),
                _ = n(40),
                y = n(28),
                f = _.z.extend({
                    name: "Attendance",
                    props: {
                        isConcluded: {
                            type: Boolean
                        },
                        disabled: {
                            type: Boolean
                        },
                        attendanceData: {
                            type: Object,
                            default: {},
                            required: !0
                        },
                        inviteeType: {
                            type: String,
                            required: !0
                        },
                        entityMembers: {
                            type: Array,
                            default: [],
                            required: !0
                        }
                    },
                    data: () => ({
                        LABEL: v.i,
                        attendees: [],
                        attendance: [],
                        participation: [],
                        participationModal: !1
                    }),
                    computed: {
                        headers: () => [{
                            text: "Name",
                            value: "full_name",
                            width: 160
                        }, {
                            text: "Attendance",
                            value: "attendance",
                            width: 145,
                            sortable: !1
                        }, {
                            text: "Participation",
                            value: "participation",
                            tooltip: "participation",
                            width: 145,
                            sortable: !1
                        }]
                    },
                    methods: {
                        getAttendanceList() {
                            var t, e, n, o, r, l;
                            const c = null !== (e = null === (t = this.attendanceData) || void 0 === t ? void 0 : t.attendee_members.map(t => t.id)) && void 0 !== e ? e : [],
                                d = null !== (o = null === (n = this.attendanceData) || void 0 === n ? void 0 : n.participant_members.map(t => t.id)) && void 0 !== o ? o : [],
                                h = [...this.entityMembers];
                            h.forEach(t => {
                                t.attended = c.includes(t.id), t.participated = d.includes(t.id)
                            });
                            const m = new Set(h.map(t => t.id)),
                                v = t => {
                                    m.has(t.id) || (t.attended = c.includes(t.id), t.participated = d.includes(t.id), h.push(t), m.add(t.id))
                                };
                            return null === (r = this.attendanceData) || void 0 === r || r.attendee_members.forEach(v), null === (l = this.attendanceData) || void 0 === l || l.participant_members.forEach(v), h.sort(Object(y.g)("first_name")), h
                        },
                        selectAttendee(t) {
                            t.attended = !t.attended
                        },
                        selectParticipant(t) {
                            t.participated = !t.participated, t.participated && !t.attended && (t.attended = !0, this.$data.attendance = [...this.$data.attendance, t])
                        },
                        changeAllAttendance(t) {
                            this.attendees.forEach(e => e.attended = t), this.$data.attendance = t ? this.attendees.map(t => t) : []
                        },
                        changeAllParticipants(t) {
                            this.attendees.forEach(e => e.participated = t), this.$data.participation = t ? this.attendees.map(t => t) : [], t && this.changeAllAttendance(t)
                        },
                        updateAttendees() {
                            const t = this.getAttendanceList();
                            this.attendees = t, this.$data.attendance = t.filter(t => t.attended), this.$data.participation = t.filter(t => t.participated)
                        }
                    },
                    created() {
                        this.updateAttendees()
                    },
                    watch: {
                        entityMembers() {
                            this.updateAttendees()
                        },
                        attendance() {
                            this.$root.$emit("attendance", this.attendance)
                        },
                        participation() {
                            this.$root.$emit("participation", this.participation)
                        }
                    }
                }),
                w = n(9),
                component = Object(w.a)(f, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "ViewActivity__attendee-list"
                    }, [e(d.a, {
                        attrs: {
                            headers: t.headers,
                            items: t.attendees,
                            "item-key": "id",
                            loading: !1
                        },
                        scopedSlots: t._u([{
                            key: "item.full_name",
                            fn: function(e) {
                                let {
                                    item: n
                                } = e;
                                return [t._v(t._s(n.first_name) + " " + t._s(n.last_name))]
                            }
                        }, {
                            key: "header.name",
                            fn: function(n) {
                                let {} = n;
                                return [e("span", [t._v("Name")])]
                            }
                        }, {
                            key: "header.attendance",
                            fn: function(n) {
                                let {} = n;
                                return [e("div", {
                                    staticClass: "d-flex align-center"
                                }, [e(c.a, {
                                    staticClass: "ma-0 pa-0",
                                    attrs: {
                                        disabled: t.disabled
                                    },
                                    on: {
                                        change: t.changeAllAttendance
                                    }
                                }), t._v(" "), e("div", [t._v("Attendance")])], 1)]
                            }
                        }, {
                            key: "header.participation",
                            fn: function(n) {
                                let {} = n;
                                return [e("div", {
                                    staticClass: "d-flex align-center"
                                }, [e(c.a, {
                                    staticClass: "ma-0 pa-0",
                                    attrs: {
                                        disabled: t.disabled
                                    },
                                    on: {
                                        change: t.changeAllParticipants
                                    }
                                }), t._v(" "), e("div", [t._v("Participation")]), t._v(" "), e("Icon", {
                                    staticClass: "ml-2",
                                    attrs: {
                                        clickable: "",
                                        name: "info"
                                    },
                                    on: {
                                        keydown: function(e) {
                                            t.participationModal = !0
                                        }
                                    },
                                    nativeOn: {
                                        click: function(e) {
                                            e.stopPropagation(), t.participationModal = !0
                                        }
                                    }
                                })], 1)]
                            }
                        }, {
                            key: "item.attendance",
                            fn: function(n) {
                                let {
                                    item: o
                                } = n;
                                return [e(c.a, {
                                    staticClass: "AttendanceCheckbox",
                                    attrs: {
                                        value: o,
                                        disabled: t.disabled
                                    },
                                    on: {
                                        click: function(e) {
                                            return e.preventDefault(), t.selectAttendee(o)
                                        }
                                    },
                                    model: {
                                        value: t.attendance,
                                        callback: function(e) {
                                            t.attendance = e
                                        },
                                        expression: "attendance"
                                    }
                                })]
                            }
                        }, {
                            key: "item.participation",
                            fn: function(n) {
                                let {
                                    item: o
                                } = n;
                                return [e(c.a, {
                                    staticClass: "AttendanceCheckbox",
                                    attrs: {
                                        value: o,
                                        disabled: t.disabled
                                    },
                                    on: {
                                        click: function(e) {
                                            return e.preventDefault(), t.selectParticipant(o)
                                        }
                                    },
                                    model: {
                                        value: t.participation,
                                        callback: function(e) {
                                            t.participation = e
                                        },
                                        expression: "participation"
                                    }
                                })]
                            }
                        }])
                    }), t._v(" "), e(h.a, {
                        model: {
                            value: t.participationModal,
                            callback: function(e) {
                                t.participationModal = e
                            },
                            expression: "participationModal"
                        }
                    }, [e(r.a, [e(l.d, {
                        staticClass: "pb-0 mt-0 mb-4"
                    }, [t._v("Participation")]), t._v(" "), e(l.c, [e("p", [t._v("\n          By checking this, attendees will be awarded the Milestone credits and any Achievement Pathway associated to\n          this event.\n        ")])]), t._v(" "), e(l.a, [e(m.a), t._v(" "), e(o.a, {
                        attrs: {
                            small: "",
                            text: ""
                        },
                        on: {
                            click: function(e) {
                                t.participationModal = !1
                            }
                        }
                    }, [t._v("Close")])], 1)], 1)], 1)], 1)
                }), [], !1, null, "a6f9506a", null);
            e.default = component.exports;
            installComponents(component, {
                Icon: n(55).default
            })
        },
        1130: function(t, e, n) {
            "use strict";
            n(1057)
        },
        1134: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(1004),
                r = n(870),
                l = n(236),
                c = n(35),
                d = n(886),
                h = n(890),
                m = n(243),
                v = n(1133),
                _ = n(1132),
                y = n(885),
                f = n(892),
                w = n(1271),
                k = n(1272),
                C = n(906),
                A = n(1273),
                T = n(1430),
                S = n(1431),
                P = n(1497),
                $ = n(1369),
                x = n(891),
                I = n(11),
                D = n.n(I),
                E = n(1197),
                O = n(23),
                L = n.n(O),
                M = n(1036),
                R = n(151),
                N = n(459),
                B = n(1073),
                U = n(31),
                j = n(14),
                H = n(38);

            function F(t, e) {
                if (Object(j.a)(2, arguments), !e || "object" !== Object(R.a)(e)) return new Date(NaN);
                var n = e.years ? Object(H.a)(e.years) : 0,
                    o = e.months ? Object(H.a)(e.months) : 0,
                    r = e.weeks ? Object(H.a)(e.weeks) : 0,
                    l = e.days ? Object(H.a)(e.days) : 0,
                    c = e.hours ? Object(H.a)(e.hours) : 0,
                    d = e.minutes ? Object(H.a)(e.minutes) : 0,
                    h = e.seconds ? Object(H.a)(e.seconds) : 0,
                    m = Object(U.a)(t),
                    v = o || n ? Object(B.a)(m, o + 12 * n) : m,
                    _ = l || r ? Object(N.a)(v, l + 7 * r) : v,
                    y = d + 60 * c,
                    f = h + 60 * y,
                    w = 1e3 * f,
                    k = new Date(_.getTime() + w);
                return k
            }
            var V = n(460);

            function G(t) {
                Object(j.a)(1, arguments);
                var e = Object(U.a)(t);
                return e.setHours(0, 0, 0, 0), e
            }

            function Y(t, e) {
                Object(j.a)(2, arguments);
                var n = G(t),
                    o = G(e),
                    r = n.getTime() - Object(V.a)(n),
                    l = o.getTime() - Object(V.a)(o);
                return Math.round((r - l) / 864e5)
            }

            function W(t, e) {
                var n = t.getFullYear() - e.getFullYear() || t.getMonth() - e.getMonth() || t.getDate() - e.getDate() || t.getHours() - e.getHours() || t.getMinutes() - e.getMinutes() || t.getSeconds() - e.getSeconds() || t.getMilliseconds() - e.getMilliseconds();
                return n < 0 ? -1 : n > 0 ? 1 : n
            }

            function K(t, e) {
                Object(j.a)(2, arguments);
                var n = Object(U.a)(t),
                    o = Object(U.a)(e),
                    r = W(n, o),
                    l = Math.abs(Y(n, o));
                n.setDate(n.getDate() - r * l);
                var c = Number(W(n, o) === -r),
                    d = r * (l - c);
                return 0 === d ? 0 : d
            }
            var z = n(1067);

            function J(t, e) {
                return Object(j.a)(2, arguments), Object(U.a)(t).getTime() - Object(U.a)(e).getTime()
            }
            var Z = {
                ceil: Math.ceil,
                round: Math.round,
                floor: Math.floor,
                trunc: function(t) {
                    return t < 0 ? Math.ceil(t) : Math.floor(t)
                }
            };

            function X(t) {
                return t ? Z[t] : Z.trunc
            }

            function Q(t, e, n) {
                Object(j.a)(2, arguments);
                var o = J(t, e) / z.a;
                return X(null == n ? void 0 : n.roundingMethod)(o)
            }

            function tt(t, e, n) {
                Object(j.a)(2, arguments);
                var o = J(t, e) / z.b;
                return X(null == n ? void 0 : n.roundingMethod)(o)
            }

            function et(t, e) {
                Object(j.a)(2, arguments);
                var n = Object(U.a)(t),
                    o = Object(U.a)(e),
                    r = n.getFullYear() - o.getFullYear(),
                    l = n.getMonth() - o.getMonth();
                return 12 * r + l
            }

            function it(t) {
                Object(j.a)(1, arguments);
                var e = Object(U.a)(t);
                return e.setHours(23, 59, 59, 999), e
            }

            function st(t) {
                Object(j.a)(1, arguments);
                var e = Object(U.a)(t),
                    n = e.getMonth();
                return e.setFullYear(e.getFullYear(), n + 1, 0), e.setHours(23, 59, 59, 999), e
            }

            function at(t) {
                Object(j.a)(1, arguments);
                var e = Object(U.a)(t);
                return it(e).getTime() === st(e).getTime()
            }

            function nt(t, e) {
                Object(j.a)(2, arguments);
                var n, o = Object(U.a)(t),
                    r = Object(U.a)(e),
                    l = Object(M.a)(o, r),
                    c = Math.abs(et(o, r));
                if (c < 1) n = 0;
                else {
                    1 === o.getMonth() && o.getDate() > 27 && o.setDate(30), o.setMonth(o.getMonth() - l * c);
                    var d = Object(M.a)(o, r) === -l;
                    at(Object(U.a)(t)) && 1 === c && 1 === Object(M.a)(t, r) && (d = !1), n = l * (c - Number(d))
                }
                return 0 === n ? 0 : n
            }

            function ot(t, e, n) {
                Object(j.a)(2, arguments);
                var o = J(t, e) / 1e3;
                return X(null == n ? void 0 : n.roundingMethod)(o)
            }

            function lt(t, e) {
                Object(j.a)(2, arguments);
                var n = Object(U.a)(t),
                    o = Object(U.a)(e);
                return n.getFullYear() - o.getFullYear()
            }

            function ct(t, e) {
                Object(j.a)(2, arguments);
                var n = Object(U.a)(t),
                    o = Object(U.a)(e),
                    r = Object(M.a)(n, o),
                    l = Math.abs(lt(n, o));
                n.setFullYear(1584), o.setFullYear(1584);
                var c = Object(M.a)(n, o) === -r,
                    d = r * (l - Number(c));
                return 0 === d ? 0 : d
            }
            var ut = n(90),
                ht = n(462),
                mt = ["years", "months", "weeks", "days", "hours", "minutes", "seconds"];
            var pt = n(171),
                vt = n(40),
                _t = n(1109),
                gt = n(927),
                yt = n(55),
                ft = n(144),
                bt = n(1110),
                wt = n(975),
                kt = n(924),
                Ct = n(1111),
                At = n(1112),
                Tt = n(1113),
                St = n(1114),
                Pt = n(1115),
                $t = n(1116),
                xt = n(3),
                It = n(17),
                Dt = n(4),
                Et = n(5),
                Ot = n(28),
                Lt = n(89),
                Mt = n(928),
                Rt = n(1006);
            const Nt = Dt.ACTIVITY_ENTITY.GROUP,
                Bt = Dt.ACTIVITY_ENTITY.MEMBER,
                Ut = Dt.ACTIVITY_ENTITY.PATROL,
                jt = Dt.ACTIVITY_ENTITY.UNIT,
                Ht = {
                    start_datetime: "",
                    end_datetime: "",
                    description: "",
                    leader_notes: "",
                    assistant_notes: ""
                };
            var Ft = vt.z.extend({
                    name: "ActivityPlan",
                    components: {
                        ActivityApLogbook: Pt.default,
                        ActivityApOas: Tt.default,
                        ActivityPlanHeader: St.default,
                        ActivityReview: Ct.default,
                        ActivityReviewSummary: At.default,
                        ActivityReviewSummaryBlock: $t.default,
                        ActivitySchedule: _t.default,
                        FileUploader: gt.default,
                        Icon: yt.default,
                        InfoCard: ft.default,
                        ProjectPatrol: bt.default,
                        RiskAssessment: Mt.default,
                        TimePicker: wt.default,
                        TwoColumnSelectableList: kt.default
                    },
                    props: {
                        planData: {
                            type: Object,
                            default: null
                        },
                        isProposal: {
                            type: Boolean
                        },
                        flowStep: {
                            type: Number,
                            required: !0
                        }
                    },
                    data: () => ({
                        shouldLeavePage: !1,
                        replaceHyphensWithSpaces: Ot.f,
                        titleCase: Ot.h,
                        dateRemountKey: 0,
                        tabs: 0,
                        steps: 1,
                        goBack: !1,
                        LABEL: Et.i,
                        GROUP: Nt,
                        MEMBER: Bt,
                        PATROL: Ut,
                        UNIT: jt,
                        ROLES: It,
                        CHALLENGE_AREAS_LIST: Et.e,
                        OAS_STREAMS_LIST: Et.p,
                        SCOUT_METHOD_LIST: Et.t,
                        tabsList: [Et.l.OAS, Et.l.LOGBOOK],
                        cancelActivityModal: !1,
                        discardPlanModal: !1,
                        exportActivityModal: !1,
                        leavePageConfirmationModal: !1,
                        requestMembersPending: !1,
                        requestPatrolsPending: !1,
                        requestPending: !1,
                        showHintModal: !1,
                        showActivityTipsModal: !1,
                        showSchedulesModal: !1,
                        showStepper: !0,
                        scoutMethodList: [],
                        entityModel: {},
                        scheduleModel: {
                            start_datetime: "",
                            end_datetime: "",
                            description: "",
                            leader_notes: "",
                            assistant_notes: ""
                        },
                        activity: {
                            title: "",
                            description: "",
                            justification: "",
                            leader: "",
                            location: "",
                            challenge_area: "",
                            startDate: "",
                            endDate: "",
                            startTime: "",
                            endTime: "",
                            start_datetime: "",
                            end_datetime: "",
                            review: {
                                general_rating: "",
                                general_tags: [],
                                scout_method_elements: [],
                                scout_spices_elements: [],
                                scout_method_description: "",
                                growth_description: ""
                            },
                            organisers: [],
                            uploads: [],
                            schedule_items: [],
                            invitees: [],
                            invited_member_ids: [],
                            attendance: {
                                leader_members: [],
                                attendee_members: [],
                                assistant_members: [],
                                participant_members: []
                            },
                            equipment_notes: "",
                            additional_notes: "",
                            achievement_pathway_oas_data: {
                                award_rule: "individual",
                                verifier: {
                                    name: "",
                                    contact: "",
                                    type: ""
                                },
                                groups: []
                            },
                            achievement_pathway_logbook_data: {
                                distance_travelled: null,
                                distance_walkabout: null,
                                achievement_meta: {
                                    stream: "",
                                    branch: ""
                                },
                                categories: [],
                                details: {
                                    activity_time_length: "",
                                    activity_grade: ""
                                }
                            }
                        },
                        inviteeId: "",
                        inviteeType: "",
                        projectPatrolGroupInsideMembers: [],
                        projectPatrolGroupOutsideMembers: [],
                        activityTitles: {
                            step_1_title: "Activity details",
                            step_2_title: "Participants & Schedules",
                            step_3_title: "Achievement Pathways",
                            step_4_title: "Attendance",
                            step_5_title: "Review",
                            step_6_title: "Activity plan summary",
                            details: "Details",
                            challengeAreas: "Which Challenge Areas does this activity belong to?",
                            description: "Give a short description of what this activity is",
                            whoFor: "Who is this activity for?",
                            justification: "Why this activity?",
                            timeAndPlace: "Time and Place",
                            organiser: "Who will organise this activity?",
                            submittedBy: "Submitted by",
                            supportingFiles: "Upload supporting files (optional)",
                            title: "What is this activity called?",
                            lead: "Who is going to lead this activity?",
                            assist: "Who is going to assist this activity?",
                            methods: "What elements of the Scout Method will be covered in this activity?",
                            equipment: "General equipment list (optional)",
                            additional: "Additional notes (optional)",
                            additionalFiles: "Additional files (optional)",
                            supportingMaterials: "Supporting materials"
                        },
                        supportingFiles: {
                            label: "Upload supporting files (optional)",
                            alt: "e.g photos of brainstormed ideas, flyer to an event or invitation",
                            answer: []
                        },
                        organisingFiles: {
                            label: "Upload files (optional)",
                            alt: "e.g runsheets, map, activity plan or any other supporting documents",
                            answer: []
                        },
                        groupMembers: [],
                        units: [],
                        patrols: [],
                        projectPatrols: [],
                        members: [],
                        initialUploads: [],
                        uploads: [{}]
                    }),
                    computed: {
                        activityDuration() {
                            if (!(this.$data.activity.startDate && this.$data.activity.endDate && this.$data.activity.startTime && this.$data.activity.endTime)) return {
                                result: "",
                                message: ""
                            };
                            const t = new Date(`${this.$data.activity.startDate}T${this.$data.activity.startTime}:00+00:00`),
                                e = new Date(`${this.$data.activity.endDate}T${this.$data.activity.endTime}:00+00:00`);
                            if (t > e) return {
                                result: "error",
                                message: "This event is currently scheduled to start after it finishes."
                            };
                            const n = function(t, e) {
                                var n, o, r, l, c;
                                if (arguments.length < 1) throw new TypeError("1 argument required, but only ".concat(arguments.length, " present"));
                                var d = Object(ut.a)(),
                                    h = null !== (n = null !== (o = null == e ? void 0 : e.locale) && void 0 !== o ? o : d.locale) && void 0 !== n ? n : ht.a,
                                    m = null !== (r = null == e ? void 0 : e.format) && void 0 !== r ? r : mt,
                                    v = null !== (l = null == e ? void 0 : e.zero) && void 0 !== l && l,
                                    _ = null !== (c = null == e ? void 0 : e.delimiter) && void 0 !== c ? c : " ";
                                if (!h.formatDistance) return "";
                                var y = m.reduce((function(e, n) {
                                    var o = "x".concat(n.replace(/(^.)/, (function(t) {
                                            return t.toUpperCase()
                                        }))),
                                        r = t[n];
                                    return "number" == typeof r && (v || t[n]) ? e.concat(h.formatDistance(o, r)) : e
                                }), []).join(_);
                                return y
                            }(function(t) {
                                Object(j.a)(1, arguments);
                                var e = Object(U.a)(t.start),
                                    n = Object(U.a)(t.end);
                                if (isNaN(e.getTime())) throw new RangeError("Start Date is invalid");
                                if (isNaN(n.getTime())) throw new RangeError("End Date is invalid");
                                var o = {};
                                o.years = Math.abs(ct(n, e));
                                var r = Object(M.a)(n, e),
                                    l = F(e, {
                                        years: r * o.years
                                    });
                                o.months = Math.abs(nt(n, l));
                                var c = F(l, {
                                    months: r * o.months
                                });
                                o.days = Math.abs(K(n, c));
                                var d = F(c, {
                                    days: r * o.days
                                });
                                o.hours = Math.abs(Q(n, d));
                                var h = F(d, {
                                    hours: r * o.hours
                                });
                                o.minutes = Math.abs(tt(n, h));
                                var m = F(h, {
                                    minutes: r * o.minutes
                                });
                                return o.seconds = Math.abs(ot(n, m)), o
                            }({
                                start: t,
                                end: e
                            }), {
                                delimiter: ", "
                            });
                            return n ? {
                                result: "info",
                                message: `This event runs for ${n}.`
                            } : {
                                result: "error",
                                message: "This event is currently scheduled to start and end at the same date and time."
                            }
                        },
                        isLoading() {
                            return this.$accessor.global.isAppLoading
                        },
                        logbookData() {
                            return this.$data.activity.achievement_pathway_logbook_data
                        },
                        startTimestamp() {
                            return this.isoDateTime(this.$data.activity.startDate, this.$data.activity.startTime)
                        },
                        endTimestamp() {
                            return this.isoDateTime(this.$data.activity.endDate, this.$data.activity.endTime)
                        },
                        canSave() {
                            return this.isEditing && this.canEdit && !this.isActivityConcluded
                        },
                        isCreating() {
                            return this.flow === Lt.a.CREATE
                        },
                        isEditing() {
                            return this.flow === Lt.a.EDIT
                        },
                        isViewing() {
                            return this.flow === Lt.a.VIEW
                        },
                        initialScheduleItems() {
                            let t = this.$data.activity.schedule_items;
                            return this.flow === Lt.a.CREATE && (t = t.length ? t : [this.$data.scheduleModel]), t
                        },
                        isValidInvitee() {
                            return !!this.$data.inviteeType
                        },
                        isPastEventCreated() {
                            return this.$data.activity.id && this.hasActivityPastEndDate
                        },
                        showStepperHeader() {
                            return !this.isProposal && 6 !== this.$data.steps
                        },
                        canShowCommentsButton() {
                            return this.isEditing || this.isViewing
                        },
                        entityMembers() {
                            return this.$data.inviteeType === Bt ? this.getAllProjectPatrolMembers : this.$data.members
                        },
                        canEdit() {
                            return !(this.isActivityConcluded || this.$accessor.user.hasRoleSupportLeaderReadOnly && !this.isCreating && !this.isUserEventOwner() && !this.isUserOrganiser(this.$data.activity.organisers))
                        },
                        canConcludeEndedActivity() {
                            return !(!this.isThisActivityConcludable || !this.isUserEventOwner() && !this.isUserOrganiser(this.$data.activity.organisers))
                        },
                        showConcludableSteps() {
                            return (this.isCreating || this.isEditing) && this.hasActivityPastEndDate || this.isViewing && this.isActivityConcluded
                        },
                        challengeAreas() {
                            return this.$data.CHALLENGE_AREAS_LIST.forEach(t => {
                                var e;
                                t.selected = t.id === (null === (e = this.planData) || void 0 === e ? void 0 : e.challenge_area)
                            }), this.$data.CHALLENGE_AREAS_LIST
                        },
                        hasActivityPastEndDate() {
                            return this.hasActivityEnded(this.endTimestamp)
                        },
                        isThisActivityConcludable() {
                            return this.hasActivityPastEndDate && !this.isActivityConcluded
                        },
                        organisersFormatted() {
                            return this.$data.activity.organisers.map(t => `${t.first_name} ${t.last_name}`).join(", ") || "-"
                        },
                        organiserIds() {
                            return this.$data.activity.organisers.map(t => t.id)
                        },
                        userHasGroupAccess() {
                            return this.$storeUser.hasRoleGroupRead || this.$storeUser.hasRoleGroupLeader
                        },
                        inviteeTypeTitle() {
                            let title = this.$data.inviteeType.replace("_", " ");
                            return this.$data.inviteeType === Bt && (title = "participants"), Object(Ot.h)(title)
                        },
                        getAllProjectPatrolMembers() {
                            let t, e;
                            return this.$data.projectPatrolGroupInsideMembers && (t = this.freeze(this.$data.projectPatrolGroupInsideMembers), t.forEach(t => {
                                t.invitee_name || (t.full_name = `[${t.member_number}] ${t.first_name} ${t.last_name}`)
                            })), this.$data.projectPatrolGroupOutsideMembers && (e = this.freeze(this.$data.projectPatrolGroupOutsideMembers), e.forEach(t => {
                                t.full_name = `${t.first_name} ${t.last_name}`
                            })), [...t, ...e]
                        },
                        projectPatrolGroupInsideFullNames() {
                            if (this.$data.groupMembers) {
                                const t = this.$data.groupMembers;
                                return t.forEach(t => {
                                    t.first_name && (t.full_name = `[${t.member_number}] ${t.first_name} ${t.last_name}`)
                                }), t
                            }
                        },
                        showProjectPatrolCaution() {
                            const t = this.$storeUser.getUserId;
                            return !this.isProposal && !this.$data.projectPatrolGroupInsideMembers.map(t => t.id).includes(t)
                        },
                        challengeAreaTitle() {
                            return Et.e.find(area => area.asset === this.activity.challenge_area).title
                        },
                        validatorLogbook() {
                            var t;
                            const e = this.$data.activity.achievement_pathway_logbook_data,
                                n = null === (t = e.categories) || void 0 === t ? void 0 : t.includes(Rt.a.WALKING_HIKE_CATEGORY);
                            let o = !0;
                            e.distanceTravelled && (o = e.distanceTravelled < 999999999);
                            let r = !0;
                            return n && (r = e.distance_walkabout && e.distance_walkabout <= e.distance_travelled), !(!e.achievement_meta.stream || e.achievement_meta.stream !== Et.o.OTHER && !e.achievement_meta.branch || !o || !r)
                        },
                        hasLogbook() {
                            var t;
                            const e = this.$data.activity.achievement_pathway_logbook_data;
                            return !!(e.achievement_meta.stream || e.achievement_meta.branch || (null === (t = e.categories) || void 0 === t ? void 0 : t.length) || e.distance_travelled || e.details.activity_time_length || e.details.activity_grade || e.distance_walkabout)
                        },
                        hasOas() {
                            var t, e;
                            return !!(null === (e = null === (t = this.$data.activity.achievement_pathway_oas_data) || void 0 === t ? void 0 : t.groups) || void 0 === e ? void 0 : e.length)
                        },
                        logbookRequiresAction() {
                            return this.hasLogbook && !this.validatorLogbook
                        },
                        validatorStep1() {
                            const t = this.$data.activity.startDate,
                                e = this.$data.activity.startTime,
                                n = this.$data.activity.endDate,
                                o = this.$data.activity.endTime;
                            return !!(this.$data.activity.title && this.$data.activity.challenge_area && this.$data.activity.location && t && e && n && o && this.validateTime(t, e, n, o) && this.$data.activity.review.scout_method_elements.length)
                        },
                        validatorStep2() {
                            return this.$data.activity.organisers = this.$data.activity.organisers.filter(t => "string" != typeof t), this.$data.inviteeType === Bt ? !(!this.$data.projectPatrolGroupInsideMembers.length && !this.$data.projectPatrolGroupOutsideMembers.length || !this.$data.activity.organisers.length || !this.validatorStep1) : !!(this.$data.inviteeType && this.$data.activity.organisers.length && this.validatorStep1)
                        },
                        validatorStep5() {
                            var t, e;
                            return !!(this.$data.activity.review.general_rating && (null === (t = this.$data.activity.review.general_tags) || void 0 === t ? void 0 : t.length) && this.$data.activity.review.scout_spices_elements.length && (null === (e = this.$data.activity.review.scout_method_elements) || void 0 === e ? void 0 : e.length))
                        },
                        getEntityItems() {
                            return this.$data.inviteeType === Nt ? this.$data.groupMembers : this.$data.inviteeType === jt ? this.$data.units : this.$data.inviteeType === Ut ? this.$data.patrols : this.$data.inviteeType === Bt ? this.$data.projectPatrols : void 0
                        },
                        membersList() {
                            return !!this.$data.members && this.$data.members.length
                        },
                        patrolName() {
                            const t = this.planData.proposing_member;
                            if (void 0 !== t && void 0 !== t.patrol_name) return t.patrol_name
                        },
                        submitterName() {
                            const t = this.planData.proposing_member;
                            if (void 0 !== t && void 0 !== t) return `${t.first_name} ${t.last_name} `
                        },
                        uploadUrl() {
                            return !this.isProposal && this.$storeUser.hasRoleGroupLeader ? `${this.$config.api.events}${Dt.GROUPS_PATH}/${this.currentUserGroupId()}${Dt.UPLOADS_PATH}` : `${this.$config.api.events}${Dt.UNITS_PATH}/${this.$storeUser.getUnitId}${Dt.UPLOADS_PATH}`
                        }
                    },
                    beforeDestroy() {
                        window.removeEventListener("popstate", () => {})
                    },
                    methods: {
                        leavePage() {
                            this.$data.shouldLeavePage = !0, this.$router.push({
                                path: xt.PROGRAMMING
                            })
                        },
                        initLeavePageListener() {
                            const t = this;
                            history.pushState(null, document.title, location.href), window.addEventListener("popstate", () => {
                                t.$data.shouldLeavePage || (history.pushState(null, document.title, location.href), t.$data.leavePageConfirmationModal = !0)
                            })
                        },
                        initUI() {
                            this.$data.steps = this.flowStep, this.$data.showStepper = !1, setTimeout(() => this.$data.showStepper = !0, 300), this.$accessor.global.setLoading(!1)
                        },
                        initEventListeners() {
                            this.$root.$on("attendance", t => {
                                this.updateAttendance(t)
                            }), this.$root.$on("participation", t => {
                                this.updateParticipation(t)
                            }), this.$root.$on("updateLeads", t => {
                                this.updateLeads(t)
                            }), this.$root.$on("updateAssists", t => {
                                this.updateAssists(t)
                            }), this.$root.$on("activity-review-scout-method", t => {
                                this.selectedScoutMethod(t)
                            })
                        },
                        exportedActivityFilename: () => `ScoutsTerrain-activity-${Object(pt.a)(new Date,"dd-MM-yyyy")}.json`,
                        editStep(t) {
                            this.isCreating || this.$accessor.programming.setActivityFlow(Lt.a.EDIT), this.$nextTick(() => {
                                this.gotoStep(t)
                            })
                        },
                        formatActivityStream: t => t ? Object(Ot.h)(Object(Ot.f)(t)) : "",
                        closeDiscardPlanModal() {
                            this.$data.discardPlanModal = !1
                        },
                        closeCancelActivityModal() {
                            this.$data.cancelActivityModal = !1
                        },
                        oasTitle: t => Et.p.find(area => area.asset === "oas_" + t).title,
                        concludeEvent() {
                            if (this.$data.requestPending) return;
                            this.$data.requestPending = !0;
                            const t = `${this.$config.api.events}${Dt.EVENTS_PATH}/${this.activity.id}`,
                                e = this.constructEventRequestBody(Dt.EVENT_STATUS.CONCLUDED);
                            this.httpRequest({
                                axiosRequest: D.a.patch,
                                url: t,
                                body: e,
                                successResponseCode: L.a.NO_CONTENT,
                                successMessage: `'${this.activity.title}' is now concluded`,
                                showSnackbar: !0,
                                responseHandler: () => {
                                    this.$data.requestPending = !1, this.$router.push({
                                        path: xt.PROGRAMMING
                                    })
                                },
                                errorHandler: () => {
                                    this.$data.requestPending = !1
                                }
                            })
                        },
                        updateAttendance(t) {
                            var e;
                            this.$data.activity.attendance.attendee_members = null !== (e = null == t ? void 0 : t.map(t => t)) && void 0 !== e ? e : []
                        },
                        updateParticipation(t) {
                            var e;
                            this.$data.activity.attendance.participant_members = null !== (e = null == t ? void 0 : t.map(t => t)) && void 0 !== e ? e : []
                        },
                        updateLeads(t) {
                            this.$data.activity.attendance.leader_members = t.map(t => t)
                        },
                        updateAssists(t) {
                            this.$data.activity.attendance.assistant_members = t.map(t => t)
                        },
                        updateStartDate(t) {
                            this.$data.activity.startDate = t, this.startDateChange(t)
                        },
                        updateEndDate(t) {
                            this.$data.activity.endDate = t, this.endDateChange(t)
                        },
                        validateTime(t, e, n, o) {
                            const r = `${t}T${e}:00`,
                                l = Object(E.a)(r),
                                c = `${n}T${o}:00`;
                            return Object(E.a)(c).getTime() > l.getTime()
                        },
                        gotoStep(t) {
                            this.$accessor.programming.setStep(t), this.scrollTop();
                            const e = this.getBreadcrumbsForCurrentStep();
                            this.$accessor.global.setBreadcrumbs(e)
                        },
                        getBreadcrumbsForCurrentStep() {
                            const t = this.getBreadcrumbTextForCurrentStep();
                            return [{
                                text: Et.l.PROGRAMMING,
                                to: xt.PROGRAMMING,
                                exact: !0,
                                disabled: !1
                            }, {
                                text: t,
                                to: xt.PROGRAMMING,
                                exact: !0,
                                disabled: !0
                            }]
                        },
                        getBreadcrumbTextForCurrentStep() {
                            let t = "";
                            return this.isCreating && (t = Et.l.PLAN_ACTIVITY), this.isEditing && (t = Et.l.EDIT_ACTIVITY), this.isViewing && (t = Et.l.VIEW_ACTIVITY), t
                        },
                        exportCallback() {
                            this.exportActivityModal = !1, this.$store.dispatch("snackbar/setSnack", {
                                message: "Activity export downloaded",
                                icon: "check"
                            })
                        },
                        getEncodedJSON() {
                            const t = this.constructExportableActivity();
                            return "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(t))
                        },
                        whoActivityFor() {
                            var t, e;
                            if (this.$data.inviteeType === Bt) {
                                if (this.$data.activity.invitees.length) {
                                    return this.$data.activity.invitees.map(t => t.invitee_name).join(", ")
                                }
                                return [...this.$data.projectPatrolGroupInsideMembers.map(t => t.full_name), ...this.$data.projectPatrolGroupOutsideMembers.map(t => t.full_name)].map(t => t).join(", ")
                            }
                            return (null === (t = this.$data.entityModel) || void 0 === t ? void 0 : t.name) || (null === (e = this.$data.activity.invitees[0]) || void 0 === e ? void 0 : e.invitee_name)
                        },
                        getProjectPatrolParticipants() {
                            const t = [...this.$data.projectPatrolGroupInsideMembers.map(t => t.id), ...this.$data.projectPatrolGroupOutsideMembers.map(t => t.id)];
                            return [...new Set(t)]
                        },
                        async initPlannedActivity() {
                            let t;
                            if (this.$data.inviteeType = this.$data.activity.invitees[0].invitee_type, this.$data.inviteeId = this.$data.activity.invitees[0].invitee_id, this.$data.inviteeType === Bt) try {
                                t = await this.initProjectPatrols(!1), this.setProjectPatrolMembersFromPlannedActivity()
                            } catch (t) {
                                console.error(t)
                            } else try {
                                this.$data.inviteeType === Ut && (this.$data.patrols = await this.getUnitPatrols(this.$storeUser.getUnitId), this.$data.entityModel = this.$data.patrols.find(t => t.id === this.$data.inviteeId)), t = await this.requestEntityMembers(this.$data.inviteeType, this.$data.inviteeId)
                            } catch (t) {
                                console.error(t)
                            }
                            return this.$data.activity.attendance.attendee_members = this.freeze(this.planData.attendance.attendee_members), this.$data.activity.attendance.participant_members = this.freeze(this.planData.attendance.participant_members), this.$data.initialUploads = this.$data.activity.uploads.slice(0), this.$data.organisingFiles.answer = this.initialUploads.map(t => t.id), this.$data.uploads = this.cleanUploads(), this.$data.activity.achievement_pathway_logbook_data.distance_travelled /= 1e3, this.$data.activity.achievement_pathway_logbook_data.distance_walkabout /= 1e3, t
                        },
                        setProjectPatrolMembersFromPlannedActivity() {
                            this.freeze(this.$data.activity.invitees).forEach(t => {
                                t.group_ids.find(t => t === this.$accessor.user.getGroupId) ? (t.full_name = `[${t.member_number}] ${t.invitee_name}`, this.$data.projectPatrolGroupInsideMembers.push(t)) : this.$data.projectPatrolGroupOutsideMembers.push(t)
                            })
                        },
                        updateProjectPatrolGroupOutsideMembers(t) {
                            this.$data.projectPatrolGroupOutsideMembers.push(t)
                        },
                        updateScheduleItem(t, e) {
                            this.$data.activity.schedule_items[t] = e
                        },
                        addScheduleItem() {
                            const t = JSON.parse(JSON.stringify(Ht));
                            this.$data.activity.schedule_items.push(t)
                        },
                        removeScheduleItem(t) {
                            this.$data.activity.schedule_items.splice(t, 1)
                        },
                        getLeaderIds() {
                            return this.$data.activity.attendance.leader_members.map(t => t.id)
                        },
                        getAssistantIds() {
                            return this.$data.activity.attendance.assistant_members.map(t => t.id)
                        },
                        getAttendeeIds() {
                            return this.$data.activity.attendance.attendee_members.map(t => t.id)
                        },
                        getParticipantIds() {
                            return this.$data.activity.attendance.participant_members.map(t => t.id)
                        },
                        resetEndDate(t) {
                            this.activity.startDate = t, this.activity.endDate = "", this.dateRemountKey++
                        },
                        clearEntityMemberData(t) {
                            this.$data.groupMembers = [], this.$data.units = [], t && (this.$data.patrols = []), this.$data.members = [], this.$data.entityModel = {}, this.clearOrganisersAssistantsLeaders(), this.$data.canAddProjecPatrolMember = !1, this.$data.projectPatrolGroupInsideMembers = [], this.$data.projectPatrolGroupOutsideMembers = []
                        },
                        clearOrganisersAssistantsLeaders() {
                            this.$data.activity.organisers = [], this.$data.activity.attendance.leader_members = [], this.$data.activity.attendance.assistant_members = []
                        },
                        setGroupEntity() {
                            this.$data.entityModel = this.$storeUser.getGroup, this.$data.inviteeType = Nt, this.$data.inviteeId = this.$data.entityModel.id
                        },
                        async setUnitEntity() {
                            this.$data.entityModel = await this.getUnit(this.$storeUser.getUnitId), this.$data.inviteeType = jt, this.$data.inviteeId = this.$data.entityModel.id
                        },
                        async requestPatrols() {
                            this.clearEntityMemberData(), this.$refs.planFileUploader.clearFiles(), this.$data.inviteeType = Ut, this.$data.requestPatrolsPending = !0, this.$data.patrols = await this.getUnitPatrols(this.$storeUser.getUnitId), this.$data.requestPatrolsPending = !1
                        },
                        async initProjectPatrols() {
                            return (!(arguments.length > 0 && void 0 !== arguments[0]) || arguments[0]) && (this.clearEntityMemberData(), this.$refs.planFileUploader.clearFiles()), this.$data.inviteeType = Bt, this.$data.inviteeId = this.$storeUser.getUnitId, this.userHasGroupAccess && (this.$data.groupMembers = await this.getGroupMembers(), this.$data.members = await this.getGroupMembers()), !0
                        },
                        async requestGroupMembers() {
                            this.$refs.planFileUploader.clearFiles(), this.clearEntityMemberData(!0), await this.setGroupEntity(this.$storeUser.getUserId), this.$data.requestMembersPending = !0, this.$data.members = await this.getGroupMembers(), this.$data.requestMembersPending = !1
                        },
                        async requestUnitMembers() {
                            const t = this.$storeUser.getUnitId;
                            this.$refs.planFileUploader.clearFiles(), this.clearEntityMemberData(!0), await this.setUnitEntity(), this.$data.requestMembersPending = !0, this.$data.members = await this.getUnitMembers(t), this.$data.requestMembersPending = !1
                        },
                        async requestPatrolMembers(t) {
                            this.clearOrganisersAssistantsLeaders(), this.$data.inviteeType = Ut, this.$data.inviteeId = t.id, this.$data.requestMembersPending = !0, this.$data.members = await this.getPatrolMembers(t.id), this.$data.requestMembersPending = !1
                        },
                        createPastEvent(t, e) {
                            if (this.$data.requestPending) return;
                            this.$data.requestPending = !0;
                            const n = this.constructCreateEventRequestUrl(t, e),
                                o = this.constructEventRequestBody(Dt.EVENT_STATUS.CONCLUDED);
                            return this.httpRequest({
                                axiosRequest: D.a.post,
                                url: n,
                                body: o,
                                successResponseCode: L.a.NO_CONTENT,
                                successMessage: "Event created and concluded.",
                                showSnackbar: !0,
                                responseHandler: () => {
                                    this.$router.push({
                                        path: xt.PROGRAMMING
                                    }), this.$data.requestPending = !1
                                },
                                errorHandler: () => {
                                    this.$data.requestPending = !1
                                }
                            })
                        },
                        createEvent(t, e) {
                            if (this.$data.requestPending) return;
                            this.$data.requestPending = !0;
                            const n = this.constructCreateEventRequestUrl(t, e),
                                o = this.constructEventRequestBody(Dt.EVENT_STATUS.PLANNED);
                            return this.httpRequest({
                                axiosRequest: D.a.post,
                                url: n,
                                body: o,
                                successResponseCode: L.a.NO_CONTENT,
                                successMessage: "Plan added to calendar",
                                showSnackbar: !0,
                                responseHandler: () => {
                                    this.$router.push({
                                        path: xt.PROGRAMMING
                                    }), this.$data.requestPending = !1
                                },
                                errorHandler: () => {
                                    this.$data.requestPending = !1
                                }
                            })
                        },
                        updateActivity() {
                            let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "Plan updated.",
                                e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
                            if (this.$data.requestPending) return;
                            this.$data.requestPending = !0;
                            const n = this.$accessor.programming.getActivity.id,
                                o = `${this.$config.api.events}${Dt.EVENTS_PATH}/${n}`,
                                r = this.constructEventRequestBody(Dt.EVENT_STATUS.PLANNED);
                            this.httpRequest({
                                axiosRequest: D.a.patch,
                                url: o,
                                body: r,
                                successResponseCode: L.a.NO_CONTENT,
                                successMessage: t,
                                errorMessage: "An error occurred so your changes were not saved. Please try again.",
                                showSnackbar: !0,
                                responseHandler: () => {
                                    this.$data.requestPending = !1, e && this.$router.push(xt.PROGRAMMING)
                                },
                                errorHandler: () => {
                                    this.$data.requestPending = !1
                                }
                            })
                        },
                        constructCreateEventRequestUrl(t, e) {
                            try {
                                if (t === Nt) return `${this.$config.api.events}${Dt.GROUPS_PATH}/${e}${Dt.EVENTS_PATH}`;
                                if (t === jt) return `${this.$config.api.events}${Dt.UNITS_PATH}/${e}${Dt.EVENTS_PATH}`;
                                if (t === Ut) return `${this.$config.api.events}${Dt.PATROLS_PATH}/${e}${Dt.EVENTS_PATH}`;
                                if (t === Bt) return `${this.$config.api.events}${Dt.EVENTS_PATH}`
                            } catch (t) {
                                console.error(t)
                            }
                        },
                        getOasData() {
                            const data = this.$data.activity.achievement_pathway_oas_data;
                            return data.verifier = {
                                name: this.organisersFormatted,
                                contact: "",
                                type: "member"
                            }, data
                        },
                        getLogbookData() {
                            const data = this.freeze(this.$data.activity.achievement_pathway_logbook_data);
                            return data.verifier = {
                                name: this.organisersFormatted,
                                contact: "",
                                type: "member"
                            }, data.distance_travelled *= 1e3, data.distance_walkabout *= 1e3, data
                        },
                        constructEventRequestBody(t) {
                            const e = this.$data.activity,
                                body = {
                                    title: e.title,
                                    description: e.description,
                                    justification: e.justification,
                                    organisers: this.organiserIds,
                                    challenge_area: e.challenge_area,
                                    start_datetime: this.startTimestamp,
                                    end_datetime: this.endTimestamp,
                                    event_type: {
                                        type: this.$data.inviteeType,
                                        id: this.isProjectPatrolEventType ? this.$storeUser.getUnitId : this.$data.inviteeId
                                    },
                                    attendance: {
                                        leader_member_ids: this.getLeaderIds(),
                                        assistant_member_ids: this.getAssistantIds(),
                                        attendee_member_ids: this.getAttendeeIds(),
                                        participant_member_ids: this.getParticipantIds()
                                    },
                                    schedule_items: e.schedule_items,
                                    achievement_pathway_oas_data: this.getOasData(),
                                    achievement_pathway_logbook_data: this.getLogbookData(),
                                    review: {
                                        general_tags: e.review.general_tags,
                                        scout_method_elements: e.review.scout_method_elements,
                                        scout_spices_elements: e.review.scout_spices_elements
                                    },
                                    uploads: this.planFiles(),
                                    equipment_notes: e.equipment_notes || "",
                                    additional_notes: e.additional_notes || "",
                                    location: e.location,
                                    iana_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                                    status: t
                                };
                            return e.review.general_rating && (body.review.general_rating = e.review.general_rating), e.review.growth_description && (body.review.growth_description = e.review.growth_description), e.review.scout_method_description && (body.review.scout_method_description = e.review.scout_method_description), this.isProjectPatrolEventType && (body.invited_member_ids = this.getProjectPatrolParticipants(), body.unit_id = this.$storeUser.getUnitId), body
                        },
                        constructExportableActivity() {
                            var t, e, n, o, r;
                            const l = this.freeze(this.$data.activity);
                            return l.id = "", l.status = "", null === (t = l.review) || void 0 === t || delete t.general_rating, null === (e = l.review) || void 0 === e || delete e.general_tags, null === (n = l.review) || void 0 === n || delete n.scout_spices_elements, null === (o = l.review) || void 0 === o || delete o.scout_method_description, null === (r = l.review) || void 0 === r || delete r.growth_description, l
                        },
                        selectedChallengeArea(t) {
                            this.$data.activity.challenge_area === t.id ? this.$data.activity.challenge_area = "" : this.$data.activity.challenge_area = t.id
                        },
                        selectedScoutMethod(t) {
                            const e = this.$data.activity.review.scout_method_elements;
                            if (t) {
                                e.find(e => e === t.id) ? e.splice(e.findIndex((function(e) {
                                    return e === t.id
                                })), 1) : this.$data.activity.review.scout_method_elements.push(t.id)
                            }
                        },
                        cancel() {
                            this.$router.push(xt.PROGRAMMING)
                        },
                        gotoPlanSummary() {
                            this.gotoStep(this.$accessor.programming.getSummaryStep)
                        },
                        addUpload(t) {
                            this.uploads.push(t), this.$data.activity.uploads.push(t)
                        },
                        removeUpload(t) {
                            this.uploads = this.uploads.filter(e => e.key !== t), this.$data.activity.uploads = this.$data.activity.uploads.filter(e => e.key !== t)
                        },
                        cleanUploads() {
                            const t = this.initialUploads.slice(0);
                            return this.prepareUploadsForRequest(t)
                        },
                        planFiles() {
                            return this.planData.uploads ? this.uploads.filter(t => void 0 === t.id || !this.planData.uploads.some(e => e.id === t.id)) : this.uploads
                        },
                        viewFiles() {
                            const t = this.planFiles();
                            return this.planData.uploads ? (t.forEach(t => {
                                const e = this.planData.uploads.find(e => e.key === t.key);
                                e && (t.url = e.url)
                            }), t) : t
                        }
                    },
                    created() {
                        var t;
                        this.$accessor.global.setLoading(!0);
                        let e = this.$data.activity;
                        this.initEventListeners(), this.$data.scoutMethodList = this.freeze(this.$data.SCOUT_METHOD_LIST), this.$accessor.programming.setPlanProposalValid(!1);
                        const n = this.freeze(this.planData);
                        n && (this.isProposal || this.canEdit) && n.uploads && (this.initialUploads = n.uploads.slice(0)), this.supportingFiles.answer = this.initialUploads.map(t => t.id), this.uploads = this.cleanUploads(), n && !Object(Ot.d)(n) && (e = Object.assign(e, n)), e.review.scout_spices_elements || this.$set(e.review, "scout_spices_elements", []), e.review.general_tags || this.$set(e.review, "general_tags", []), e.achievement_pathway_logbook_data.achievement_meta || (this.$set(e.achievement_pathway_logbook_data, "achievement_meta", {}), e.achievement_pathway_logbook_data.achievement_meta.stream = "", e.achievement_pathway_logbook_data.achievement_meta.branch = ""), (null === (t = e.achievement_pathway_logbook_data) || void 0 === t ? void 0 : t.categories) || (e.achievement_pathway_logbook_data.categories = [])
                    },
                    async mounted() {
                        if (this.$data.showStepper = !!this.flow, this.$data.activity.schedule_items = this.initialScheduleItems, [Lt.a.EDIT, Lt.a.VIEW].includes(this.flow) && await this.initPlannedActivity(), [Lt.a.CREATE, Lt.a.EDIT].includes(this.flow)) this.initLeavePageListener();
                        else if (!this.flow) throw new Error("Activity flow not recognized.");
                        this.initUI()
                    },
                    watch: {
                        flowStep(t) {
                            this.$data.steps = t
                        },
                        activity: {
                            deep: !0,
                            handler() {
                                if (this.isProposal) {
                                    let t = !1;
                                    if (t = !!this.$storeUser.hasNoGroupOrUnit || this.$data.activity.leader, this.$data.activity.title && this.$data.activity.description && this.$data.activity.justification && this.$data.activity.challenge_area && t) {
                                        if (this.$accessor.programming.setPlanProposalValid(!0), this.isProposal) {
                                            const t = {};
                                            t.title = this.$data.activity.title, t.description = this.$data.activity.description, t.justification = this.$data.activity.justification, t.challenge_area = this.$data.activity.challenge_area, t.leader = this.$data.activity.leader, t.uploads = this.uploads;
                                            const e = JSON.parse(JSON.stringify(t));
                                            this.$accessor.programming.setProposal(e)
                                        }
                                    } else this.$accessor.programming.setPlanProposalValid(!1)
                                }
                            }
                        }
                    }
                }),
                qt = (n(1130), n(9)),
                component = Object(qt.a)(Ft, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        directives: [{
                            name: "show",
                            rawName: "v-show",
                            value: !t.isLoading,
                            expression: "!isLoading"
                        }],
                        staticClass: "ActivityPlan"
                    }, [e(w.a, {
                        directives: [{
                            name: "show",
                            rawName: "v-show",
                            value: t.showStepper,
                            expression: "showStepper"
                        }],
                        staticClass: "elevation-0 no-transition",
                        model: {
                            value: t.steps,
                            callback: function(e) {
                                t.steps = e
                            },
                            expression: "steps"
                        }
                    }, [e(y.a, {
                        staticClass: "mb-6",
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(d.a, {
                        attrs: {
                            lg: "9"
                        }
                    }, [e(C.a, {
                        directives: [{
                            name: "show",
                            rawName: "v-show",
                            value: t.showStepperHeader,
                            expression: "showStepperHeader"
                        }]
                    }, [e(A.a, {
                        attrs: {
                            editable: !t.isActivityConcluded,
                            complete: t.steps > 1,
                            step: "1"
                        },
                        on: {
                            click: function(e) {
                                return t.$accessor.programming.setStep(1)
                            }
                        }
                    }, [t._v("\n            " + t._s(t.activityTitles.step_1_title) + "\n          ")]), t._v(" "), e(m.a), t._v(" "), e(A.a, {
                        attrs: {
                            editable: t.validatorStep1 && !t.isActivityConcluded,
                            disabled: !t.isActivityConcluded,
                            complete: t.steps > 2,
                            step: "2"
                        },
                        on: {
                            click: function(e) {
                                t.validatorStep1 && !t.isActivityConcluded && t.$accessor.programming.setStep(2)
                            }
                        }
                    }, [t._v("\n            " + t._s(t.activityTitles.step_2_title) + "\n          ")]), t._v(" "), e(m.a), t._v(" "), e(A.a, {
                        attrs: {
                            editable: t.validatorStep2,
                            complete: t.steps > 3,
                            step: "3"
                        },
                        on: {
                            click: function(e) {
                                t.validatorStep2 && !t.hasActivityPastEndDate && t.$accessor.programming.setStep(3)
                            }
                        }
                    }, [t._v("\n            " + t._s(t.activityTitles.step_3_title) + "\n          ")]), t._v(" "), e(m.a), t._v(" "), e(A.a, {
                        attrs: {
                            editable: t.validatorStep2 && t.hasActivityPastEndDate,
                            complete: t.steps > 4 && t.hasActivityPastEndDate,
                            step: "4"
                        },
                        on: {
                            click: function(e) {
                                t.validatorStep2 && t.hasActivityPastEndDate && t.$accessor.programming.setStep(4)
                            }
                        }
                    }, [t._v("\n            " + t._s(t.activityTitles.step_4_title) + "\n          ")]), t._v(" "), e(m.a), t._v(" "), e(A.a, {
                        attrs: {
                            editable: t.validatorStep2 && t.hasActivityPastEndDate,
                            complete: t.steps > 5 && t.hasActivityPastEndDate,
                            step: "5"
                        },
                        on: {
                            click: function(e) {
                                t.validatorStep2 && t.hasActivityPastEndDate && t.$accessor.programming.setStep(5)
                            }
                        }
                    }, [t._v("\n            " + t._s(t.activityTitles.step_5_title) + "\n          ")])], 1)], 1)], 1), t._v(" "), e(C.b, [e(k.a, {
                        attrs: {
                            step: "1"
                        }
                    }, [t.isProposal ? t._e() : e("section", {
                        staticClass: "ActivityPlan__header"
                    }, [e("ActivityPlanHeader", {
                        attrs: {
                            "title-text": "1. " + t.activityTitles.step_1_title,
                            "show-button": t.canShowCommentsButton,
                            disabled: t.requestPending,
                            activity: t.activity
                        }
                    })], 1), t._v(" "), t.isProposal ? t._e() : e("InfoCard", {
                        staticClass: "mb-12",
                        attrs: {
                            "info-type": "info",
                            title: "Step 5 (Review) is only editable once the activity is completed, or you are entering a Programming activity that has already occurred. You will review the activity in Step 5."
                        }
                    }), t._v(" "), t.isProposal ? t._e() : e("div", {
                        staticClass: "ActivityPlan__subsection-title"
                    }, [e("strong", [t._v(t._s(t.activityTitles.details))])]), t._v(" "), e(x.a, {
                        attrs: {
                            "data-cy": "title",
                            counter: "",
                            "auto-grow": "",
                            "row-height": 6,
                            maxlength: "50",
                            label: t.activityTitles.title + "*"
                        },
                        model: {
                            value: t.activity.title,
                            callback: function(e) {
                                t.$set(t.activity, "title", e)
                            },
                            expression: "activity.title"
                        }
                    }), t._v(" "), e(x.a, {
                        attrs: {
                            "data-cy": "description",
                            "auto-grow": "",
                            "row-height": 6,
                            counter: "",
                            maxlength: "500",
                            label: t.isProposal ? t.activityTitles.description + "*" : t.activityTitles.description + " (optional)"
                        },
                        model: {
                            value: t.activity.description,
                            callback: function(e) {
                                t.$set(t.activity, "description", e)
                            },
                            expression: "activity.description"
                        }
                    }), t._v(" "), e(x.a, {
                        staticClass: "mb-0",
                        attrs: {
                            "data-cy": "justification",
                            "auto-grow": "",
                            "row-height": 6,
                            "persistent-hint": "",
                            counter: "",
                            maxlength: "500",
                            label: t.isProposal ? t.activityTitles.justification + "*" : t.activityTitles.justification + "  (optional)"
                        },
                        model: {
                            value: t.activity.justification,
                            callback: function(e) {
                                t.$set(t.activity, "justification", e)
                            },
                            expression: "activity.justification"
                        }
                    }), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__form-hint",
                        on: {
                            click: () => t.showActivityTipsModal = !0,
                            keydown: () => t.showActivityTipsModal = !0
                        }
                    }, [t._v("\n          Some tips on what to write\n          "), e("Icon", {
                        staticClass: "ml-2",
                        attrs: {
                            clickable: "",
                            name: "info"
                        }
                    })], 1), t._v(" "), t.isProposal ? e(x.a, {
                        attrs: {
                            "data-cy": "leader",
                            counter: "",
                            "auto-grow": "",
                            "row-height": 6,
                            maxlength: "50",
                            label: "Who should organise this activity?*"
                        },
                        model: {
                            value: t.activity.leader,
                            callback: function(e) {
                                t.$set(t.activity, "leader", e)
                            },
                            expression: "activity.leader"
                        }
                    }) : t._e(), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__challenge-areas"
                    }, [e("div", {
                        staticClass: "ActivityPlan__subsection-title"
                    }, [t._v(t._s(t.activityTitles.challengeAreas) + "*")]), t._v(" "), e("TwoColumnSelectableList", {
                        staticClass: "mb-8",
                        attrs: {
                            items: t.challengeAreas,
                            single: !0,
                            "selected-callback": t.selectedChallengeArea
                        }
                    })], 1), t._v(" "), t.isProposal ? t._e() : [e("div", {
                        staticClass: "ActivityPlan__subsection-title"
                    }, [t._v("\n            " + t._s(t.activityTitles.timeAndPlace) + "\n          ")]), t._v(" "), e(x.a, {
                        staticClass: "mt-2 mb-8",
                        attrs: {
                            "data-cy": "location",
                            label: "Location*",
                            "auto-grow": "",
                            "row-height": 6,
                            maxlength: "50",
                            counter: ""
                        },
                        model: {
                            value: t.activity.location,
                            callback: function(e) {
                                t.$set(t.activity, "location", e)
                            },
                            expression: "activity.location"
                        }
                    }), t._v(" "), e("section", {
                        staticClass: "ActivityPlan__date-selections"
                    }, [e("div", {
                        staticClass: "ActivityPlan__start-datetime"
                    }, [e("DatePicker", {
                        staticClass: "ActivityPlan__date-time mb-12",
                        attrs: {
                            label: "Start date*",
                            cypress: "start_date",
                            "initial-date": t.initialDate(t.activity.start_datetime),
                            "date-range": t.$accessor.programming.isPlanningProposedActivity ? t.currentDate() : t.maxStartDate,
                            "date-range-min": t.$accessor.programming.isPlanningProposedActivity,
                            "date-range-max": !t.$accessor.programming.isPlanningProposedActivity
                        },
                        on: {
                            dateChange: function(e) {
                                return t.updateStartDate(e)
                            }
                        }
                    }), t._v(" "), e("TimePicker", {
                        staticClass: "ActivityPlan__date-time ActivityPlan__time mb-12",
                        attrs: {
                            cypress: "start_time",
                            label: "Start time*",
                            "initial-time": t.initialTime(t.activity.start_datetime)
                        },
                        on: {
                            timeChange: function(e) {
                                t.activity.startTime = e
                            }
                        }
                    })], 1), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__end-datetime"
                    }, [e("DatePicker", {
                        key: t.dateRemountKey,
                        staticClass: "ActivityPlan__date-time mb-12",
                        attrs: {
                            label: "End date*",
                            cypress: "end_date",
                            "initial-date": t.initialDate(t.activity.end_datetime),
                            "date-range": t.minEndDate,
                            "date-range-min": ""
                        },
                        on: {
                            dateChange: function(e) {
                                return t.updateEndDate(e)
                            }
                        }
                    }), t._v(" "), e("TimePicker", {
                        staticClass: "ActivityPlan__date-time",
                        attrs: {
                            cypress: "end_time",
                            label: "End time*",
                            "initial-time": t.initialTime(t.activity.end_datetime)
                        },
                        on: {
                            timeChange: function(e) {
                                t.activity.endTime = e
                            }
                        }
                    })], 1), t._v(" "), t.activity.startDate && t.activity.startTime && t.activity.endDate && t.activity.endTime ? e("InfoCard", {
                        staticClass: "mb-12",
                        attrs: {
                            "info-type": t.activityDuration.result,
                            title: t.activityDuration.message
                        }
                    }) : t._e()], 1)], t._v(" "), t.isProposal ? t._e() : [e("div", {
                        staticClass: "ActivityPlan__subtitle mt-8 mb-6"
                    }, [e("strong", [t._v("What elements of the Scout Method will be covered in this activity?*")])]), t._v(" "), e("TwoColumnSelectableList", {
                        staticClass: "mb-6",
                        attrs: {
                            items: t.listSelections(t.scoutMethodList, t.activity.review.scout_method_elements),
                            "selected-callback": t.selectedScoutMethod
                        }
                    })], t._v(" "), e("RiskAssessment"), t._v(" "), t.isProposal ? e("FileUploader", {
                        staticClass: "mt-4 mb-8",
                        attrs: {
                            input: t.supportingFiles,
                            "initial-uploads": t.initialUploads,
                            "upload-url": t.uploadUrl,
                            "add-upload-func": t.addUpload,
                            "remove-upload-func": t.removeUpload
                        }
                    }) : t._e(), t._v(" "), e("div", {
                        staticClass: "text--caption mt-6"
                    }, [t._v("*Mandatory fields")]), t._v(" "), t.isProposal ? t._e() : e("section", {
                        staticClass: "ActivityPlan__buttons mt-10"
                    }, [e("hr"), t._v(" "), t.isCreating ? e(r.a, {
                        staticClass: "mr-4",
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.requestPending,
                            block: t.$vuetify.breakpoint.xs,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                t.discardPlanModal = !0
                            },
                            keydown: function(e) {
                                t.discardPlanModal = !0
                            }
                        }
                    }, [t._v("\n            " + t._s(t.LABEL.DISCARD_PLAN) + "\n          ")]) : e(r.a, {
                        staticClass: "mr-4",
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.requestPending,
                            block: t.$vuetify.breakpoint.xs,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                t.cancelActivityModal = !0
                            }
                        }
                    }, [t._v("\n            " + t._s(t.LABEL.DELETE_PLAN) + "\n          ")]), t._v(" "), t.isEditing ? e(r.a, {
                        staticClass: "mr-4",
                        attrs: {
                            disabled: t.requestPending,
                            block: t.$vuetify.breakpoint.xs,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.cancel()
                            },
                            keydown: function(e) {
                                return t.cancel()
                            }
                        }
                    }, [t._v("\n            " + t._s(t.LABEL.CANCEL) + "\n          ")]) : t._e(), t._v(" "), t.canSave ? e(r.a, {
                        staticClass: "mt-3 mt-sm-0",
                        attrs: {
                            block: t.$vuetify.breakpoint.xs,
                            disabled: t.$nuxt.isOffline || !t.validatorStep1,
                            loading: t.requestPending,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.updateActivity()
                            }
                        }
                    }, [t._v("\n            " + t._s(t.LABEL.SAVE) + "\n          ")]) : t._e(), t._v(" "), e(r.a, {
                        staticClass: "float-right",
                        attrs: {
                            "data-cy": "step1.NEXT",
                            disabled: !t.validatorStep1 || t.requestPending,
                            block: t.$vuetify.breakpoint.xs,
                            small: ""
                        },
                        on: {
                            keydown: function(e) {
                                return t.gotoStep(2)
                            },
                            click: function(e) {
                                return t.gotoStep(2)
                            }
                        }
                    }, [t._v("\n            " + t._s(t.LABEL.NEXT_STEP) + "\n          ")])], 1)], 2), t._v(" "), t.isProposal ? t._e() : e(k.a, {
                        attrs: {
                            step: "2"
                        }
                    }, [e("section", {
                        staticClass: "ActivityPlan__header"
                    }, [e("ActivityPlanHeader", {
                        attrs: {
                            "title-text": "2. " + t.activityTitles.step_2_title,
                            "show-button": t.canShowCommentsButton,
                            disabled: t.requestPending,
                            activity: t.activity
                        }
                    })], 1), t._v(" "), t.isEditing && !t.hasActivityPastEndDate ? e("InfoCard", {
                        staticClass: "mb-12",
                        attrs: {
                            "info-type": "caution",
                            title: "If changing participants you will need to re-enter the organiser, leader and assistant details. If your activity has a linked Achievement Pathway the participant list will also be replaced."
                        }
                    }) : t._e(), t._v(" "), t.$storeUser.hasNoGroupOrUnit ? t._e() : [e("div", {
                        staticClass: "ActivityPlan__question-title--small"
                    }, [t._v(t._s(t.activityTitles.whoFor) + "*")]), t._v(" "), e(_.a, {
                        staticClass: "ActivityPlan__radio-group",
                        attrs: {
                            row: ""
                        },
                        model: {
                            value: t.inviteeType,
                            callback: function(e) {
                                t.inviteeType = e
                            },
                            expression: "inviteeType"
                        }
                    }, [t.$storeUser.hasRoleGroupLeader || t.$storeUser.hasRoleSupportLeaderReadWrite ? e(v.a, {
                        staticClass: "ActivityPlan__radio",
                        attrs: {
                            "data-cy": "group",
                            label: "Group",
                            value: "group",
                            name: "group"
                        },
                        on: {
                            change: function(e) {
                                return t.requestGroupMembers()
                            }
                        }
                    }) : t._e(), t._v(" "), t.$storeUser.hasUnit && t.$storeUser.hasRoleUnitCouncil ? e(v.a, {
                        staticClass: "ActivityPlan__radio",
                        attrs: {
                            "data-cy": "unit",
                            label: "Unit",
                            value: "unit",
                            name: "unit"
                        },
                        on: {
                            change: function(e) {
                                return t.requestUnitMembers(t.$storeUser.getUnitId)
                            }
                        }
                    }) : t._e(), t._v(" "), t.$storeUser.hasUnit && t.$storeUser.hasRoleUnitCouncil ? e(v.a, {
                        staticClass: "ActivityPlan__radio",
                        attrs: {
                            "data-cy": "patrol",
                            label: "Patrol",
                            value: "patrol",
                            name: "patrol"
                        },
                        on: {
                            change: function(e) {
                                return t.requestPatrols()
                            }
                        }
                    }) : t._e(), t._v(" "), t.$storeUser.hasRoleUnitCouncil ? e(v.a, {
                        staticClass: "ActivityPlan__radio",
                        attrs: {
                            "data-cy": "project_patrol",
                            label: "Project Patrol",
                            value: "member",
                            name: "member"
                        },
                        on: {
                            change: function(e) {
                                return t.initProjectPatrols()
                            }
                        }
                    }) : t._e()], 1), t._v(" "), t.inviteeType === t.PATROL ? e(o.a, {
                        staticClass: "mt-0 mb-12",
                        attrs: {
                            "data-cy": "participants",
                            items: t.getEntityItems,
                            disabled: t.requestPatrolsPending,
                            loading: t.requestPatrolsPending,
                            "return-object": "",
                            "item-text": "name",
                            label: "Select " + t.inviteeTypeTitle,
                            "persistent-hint": "",
                            hint: "All members will be added as Participants. You can mark attendance during or after the activity."
                        },
                        on: {
                            change: t.requestPatrolMembers
                        },
                        model: {
                            value: t.entityModel,
                            callback: function(e) {
                                t.entityModel = e
                            },
                            expression: "entityModel"
                        }
                    }) : t._e(), t._v(" "), t.inviteeType === t.MEMBER ? e("div", {
                        staticClass: "ActivityPlan__project-patrol"
                    }, [t.userHasGroupAccess ? e("div", [e("div", {
                        staticClass: "ActivityPlan__question-title"
                    }, [t._v("For participants inside your Group")]), t._v(" "), e(o.a, {
                        staticClass: "mt-8",
                        attrs: {
                            "data-cy": "group_member",
                            items: t.projectPatrolGroupInsideFullNames,
                            disabled: !t.projectPatrolGroupInsideFullNames,
                            loading: !t.projectPatrolGroupInsideFullNames,
                            "item-text": "full_name",
                            label: "Select participants",
                            "deletable-chips": "",
                            "return-object": "",
                            multiple: "",
                            chips: "",
                            "persistent-hint": ""
                        },
                        model: {
                            value: t.projectPatrolGroupInsideMembers,
                            callback: function(e) {
                                t.projectPatrolGroupInsideMembers = e
                            },
                            expression: "projectPatrolGroupInsideMembers"
                        }
                    })], 1) : t._e(), t._v(" "), t.showProjectPatrolCaution ? e("InfoCard", {
                        staticClass: "mb-12",
                        attrs: {
                            "info-type": "caution",
                            title: "This event will not appear in your calendar unless you are listed as a participant.  The event organiser will be able to edit the event from their assigned activities list after it has been created."
                        }
                    }) : t._e(), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__question-title mt-6"
                    }, [t._v("For participants outside your Group")]), t._v(" "), t._l(t.projectPatrolGroupOutsideMembers, (function(n, o) {
                        return e("div", {
                            key: o,
                            staticClass: "mt-3 mb-3"
                        }, [t._v("\n              " + t._s(n.first_name) + " " + t._s(n.last_name) + "\n            ")])
                    })), t._v(" "), e("ProjectPatrol", {
                        staticClass: "mt-12",
                        on: {
                            membershipNumberUpdate: function(e) {
                                return t.updateProjectPatrolGroupOutsideMembers(e)
                            }
                        }
                    })], 2) : t._e(), t._v(" "), t.inviteeType === t.MEMBER ? e(o.a, {
                        staticClass: "mt-0 mb-12",
                        attrs: {
                            "data-cy": "who_organise",
                            items: t.getAllProjectPatrolMembers,
                            "item-text": "full_name",
                            "item-value": "id",
                            "deletable-chips": "",
                            "return-object": "",
                            multiple: "",
                            chips: "",
                            label: "Who will organise this activity?*",
                            "persistent-hint": "",
                            hint: "The organiser can also be the person who leads the activity."
                        },
                        model: {
                            value: t.activity.organisers,
                            callback: function(e) {
                                t.$set(t.activity, "organisers", e)
                            },
                            expression: "activity.organisers"
                        }
                    }) : t._e(), t._v(" "), t.inviteeType !== t.MEMBER ? e(o.a, {
                        staticClass: "mt-0 mb-12",
                        attrs: {
                            "data-cy": "organiser",
                            disabled: !t.membersList,
                            loading: t.requestMembersPending,
                            items: t.membersFullNames,
                            "item-text": "full_name",
                            "item-value": "id",
                            "deletable-chips": "",
                            "return-object": "",
                            multiple: "",
                            chips: "",
                            label: "Who will organise this activity?*",
                            "persistent-hint": "",
                            hint: "The organiser can also be the person who leads the activity."
                        },
                        model: {
                            value: t.activity.organisers,
                            callback: function(e) {
                                t.$set(t.activity, "organisers", e)
                            },
                            expression: "activity.organisers"
                        }
                    }) : t._e()], t._v(" "), e(o.a, {
                        staticClass: "mb-0",
                        attrs: {
                            "data-cy": "step3.leader",
                            disabled: !t.membersList,
                            items: t.isProjectPatrolEventType ? t.getAllProjectPatrolMembers.filter(e => !t.activity.attendance.assistant_members.find(t => {
                                let {
                                    id: n
                                } = t;
                                return e.id === n
                            })) : t.membersFullNames.filter(e => !t.activity.attendance.assistant_members.includes(e)),
                            "item-text": "full_name",
                            "item-value": "id",
                            label: t.activityTitles.lead,
                            "deletable-chips": "",
                            "return-object": "",
                            multiple: "",
                            chips: "",
                            "persistent-hint": ""
                        },
                        model: {
                            value: t.activity.attendance.leader_members,
                            callback: function(e) {
                                t.$set(t.activity.attendance, "leader_members", e)
                            },
                            expression: "activity.attendance.leader_members"
                        }
                    }), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__form-hint",
                        attrs: {
                            "data-cy": "hint-modal-lead"
                        },
                        on: {
                            click: function(e) {
                                t.showHintModal = !0
                            },
                            keydown: function(e) {
                                t.showHintModal = !0
                            }
                        }
                    }, [t._v("\n          You can select more than one Youth Member\n          "), e("Icon", {
                        staticClass: "ml-2",
                        attrs: {
                            clickable: !0,
                            name: "info"
                        }
                    })], 1), t._v(" "), e(o.a, {
                        staticClass: "mb-0 mt-12",
                        attrs: {
                            "data-cy": "assists",
                            disabled: !t.membersList,
                            items: t.isProjectPatrolEventType ? t.getAllProjectPatrolMembers.filter(e => !t.activity.attendance.leader_members.find(t => {
                                let {
                                    id: n
                                } = t;
                                return e.id === n
                            })) : t.membersFullNames.filter(e => !t.activity.attendance.leader_members.includes(e)),
                            "item-text": "full_name",
                            "item-value": "id",
                            label: t.activityTitles.assist,
                            "deletable-chips": "",
                            "return-object": "",
                            multiple: "",
                            chips: "",
                            "persistent-hint": ""
                        },
                        model: {
                            value: t.activity.attendance.assistant_members,
                            callback: function(e) {
                                t.$set(t.activity.attendance, "assistant_members", e)
                            },
                            expression: "activity.attendance.assistant_members"
                        }
                    }), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__form-hint",
                        attrs: {
                            "data-cy": "hint-modal-assist"
                        },
                        on: {
                            click: function(e) {
                                t.showHintModal = !0
                            },
                            keydown: function(e) {
                                t.showHintModal = !0
                            }
                        }
                    }, [t._v("\n          You can select more than one Youth Member\n          "), e("Icon", {
                        staticClass: "ml-2 my-0",
                        attrs: {
                            name: "info"
                        }
                    })], 1), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__question-title mt-12 mb-8"
                    }, [t._v("\n          Add schedules in this activity (optional)\n          "), e("div", {
                        staticClass: "ActivityPlan__form-hint ma-0",
                        on: {
                            click: function(e) {
                                t.showSchedulesModal = !0
                            },
                            keydown: function(e) {
                                t.showSchedulesModal = !0
                            }
                        }
                    }, [e("Icon", {
                        staticClass: "ml-2",
                        attrs: {
                            name: "info"
                        }
                    })], 1)]), t._v(" "), t._l(t.activity.schedule_items, (function(n, o) {
                        return [e("ActivitySchedule", {
                            key: "schedule-" + o,
                            attrs: {
                                schedule: n,
                                "min-date": t.activity.startDate
                            },
                            on: {
                                scheduleChange: function(e) {
                                    return t.updateScheduleItem(o, e)
                                }
                            }
                        }), t._v(" "), t.activity.schedule_items.length > 1 ? e(r.a, {
                            key: "btn-" + o,
                            staticClass: "mb-4 mr-4 mt-n1",
                            attrs: {
                                disabled: t.$nuxt.isOffline,
                                block: t.$vuetify.breakpoint.xs,
                                outlined: "",
                                small: ""
                            },
                            on: {
                                click: function(e) {
                                    return t.removeScheduleItem(o)
                                },
                                keydown: function(e) {
                                    return t.removeScheduleItem(o)
                                }
                            }
                        }, [t._v("\n            " + t._s(t.LABEL.REMOVE) + "\n          ")]) : t._e()]
                    })), t._v(" "), e(r.a, {
                        staticClass: "mb-4 mt-n1",
                        attrs: {
                            outlined: "",
                            small: "",
                            block: t.$vuetify.breakpoint.xs
                        },
                        on: {
                            click: t.addScheduleItem,
                            keydown: t.addScheduleItem
                        }
                    }, [t._v("\n          " + t._s(t.LABEL.ADD_ANOTHER) + "\n        ")]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__subsection-title mt-12"
                    }, [e("strong", [t._v(t._s(t.activityTitles.supportingMaterials))])]), t._v(" "), e(x.a, {
                        attrs: {
                            "data-cy": "equipment",
                            counter: "",
                            "auto-grow": "",
                            "row-height": 6,
                            maxlength: "500",
                            label: t.activityTitles.equipment
                        },
                        model: {
                            value: t.activity.equipment_notes,
                            callback: function(e) {
                                t.$set(t.activity, "equipment_notes", e)
                            },
                            expression: "activity.equipment_notes"
                        }
                    }), t._v(" "), e(x.a, {
                        attrs: {
                            "data-cy": "notes",
                            counter: "",
                            maxlength: "500",
                            "auto-grow": "",
                            "row-height": 6,
                            label: t.activityTitles.additional,
                            "persistent-hint": "",
                            hint: "eg. notes, requirements, equipment list or URLs. Only the Unit Council and the Organiser will be able to see this"
                        },
                        model: {
                            value: t.activity.additional_notes,
                            callback: function(e) {
                                t.$set(t.activity, "additional_notes", e)
                            },
                            expression: "activity.additional_notes"
                        }
                    }), t._v(" "), e("RiskAssessment"), t._v(" "), e("FileUploader", {
                        directives: [{
                            name: "show",
                            rawName: "v-show",
                            value: !t.$storeUser.hasNoGroupOrUnit && !t.$storeUser.hasRoleSupportLeaderReadOrWrite,
                            expression: "!$storeUser.hasNoGroupOrUnit && !$storeUser.hasRoleSupportLeaderReadOrWrite"
                        }],
                        ref: "planFileUploader",
                        staticClass: "mt-12 mb-12",
                        attrs: {
                            "reduce-gutter": !0,
                            disabled: "" === t.inviteeType,
                            input: t.supportingFiles,
                            "initial-uploads": [],
                            "upload-url": t.uploadUrl,
                            "add-upload-func": t.addUpload,
                            "remove-upload-func": t.removeUpload
                        }
                    }), t._v(" "), t.isProposal ? t._e() : e("section", {
                        staticClass: "ActivityPlan__buttons mt-11"
                    }, [e("hr"), t._v(" "), t.isActivityConcluded ? t._e() : e(r.a, {
                        staticClass: "mr-4",
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.requestPending,
                            block: t.$vuetify.breakpoint.xs,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.gotoStep(1)
                            },
                            keydown: function(e) {
                                return t.gotoStep(1)
                            }
                        }
                    }, [t._v("\n            " + t._s(t.LABEL.PREVIOUS) + "\n          ")]), t._v(" "), t.isCreating ? e(r.a, {
                        staticClass: "mr-4",
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.requestPending,
                            block: t.$vuetify.breakpoint.xs,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                t.discardPlanModal = !0
                            },
                            keydown: function(e) {
                                t.discardPlanModal = !0
                            }
                        }
                    }, [t._v("\n            " + t._s(t.LABEL.DISCARD_PLAN) + "\n          ")]) : e(r.a, {
                        staticClass: "mr-4",
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.requestPending,
                            block: t.$vuetify.breakpoint.xs,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                t.cancelActivityModal = !0
                            }
                        }
                    }, [t._v("\n            " + t._s(t.LABEL.DELETE_PLAN) + "\n          ")]), t._v(" "), t.isEditing ? e(r.a, {
                        staticClass: "mr-4",
                        attrs: {
                            disabled: t.requestPending,
                            block: t.$vuetify.breakpoint.xs,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.cancel()
                            },
                            keydown: function(e) {
                                return t.cancel()
                            }
                        }
                    }, [t._v("\n            " + t._s(t.LABEL.CANCEL) + "\n          ")]) : t._e(), t._v(" "), t.canSave ? e(r.a, {
                        attrs: {
                            disabled: t.$nuxt.isOffline || !t.validatorStep2,
                            loading: t.requestPending,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.updateActivity()
                            }
                        }
                    }, [t._v("\n            " + t._s(t.LABEL.SAVE) + "\n          ")]) : t._e(), t._v(" "), e(r.a, {
                        staticClass: "float-right",
                        attrs: {
                            "data-cy": "step2.NEXT",
                            small: "",
                            disabled: !t.validatorStep2 || t.requestPending,
                            block: t.$vuetify.breakpoint.xs
                        },
                        on: {
                            click: function(e) {
                                return t.gotoStep(3)
                            },
                            keydown: function(e) {
                                return t.gotoStep(3)
                            }
                        }
                    }, [t._v("\n            " + t._s(t.LABEL.NEXT_STEP) + "\n          ")]), t._v(" "), t.$storeUser.hasNoGroupOrUnit ? e("InfoCard", {
                        staticClass: "mt-12 mb-4",
                        attrs: {
                            "small-text": "",
                            "info-type": "info",
                            title: "Please save the generated file. To add the activity into the Programming calendar, Leaders will need to upload the file into the Import Activity feature and complete the rest of the activity details."
                        }
                    }) : t._e()], 1)], 2), t._v(" "), !t.isProposal && t.isValidInvitee ? e(k.a, {
                        attrs: {
                            step: "3"
                        }
                    }, [e("section", {
                        staticClass: "ActivityPlan__header"
                    }, [e("ActivityPlanHeader", {
                        attrs: {
                            "title-text": `3. ${t.activityTitles.step_3_title} (optional)`,
                            "show-button": t.canShowCommentsButton,
                            disabled: t.requestPending,
                            activity: t.activity
                        }
                    }), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__header-subtitle mb-6"
                    }, [t._v("\n            If your activity is not part of any Achievement Pathways below, please leave this section empty and\n            proceed to next step.\n          ")]), t._v(" "), e(P.a, {
                        key: t.steps,
                        staticClass: "mb-12",
                        attrs: {
                            "background-color": "grey lighten-5",
                            grow: "",
                            height: "40"
                        },
                        model: {
                            value: t.tabs,
                            callback: function(e) {
                                t.tabs = e
                            },
                            expression: "tabs"
                        }
                    }, t._l(t.tabsList, (function(n) {
                        return e(T.a, {
                            key: n
                        }, [t._v("\n              " + t._s(n) + "\n            ")])
                    })), 1), t._v(" "), e($.a, {
                        model: {
                            value: t.tabs,
                            callback: function(e) {
                                t.tabs = e
                            },
                            expression: "tabs"
                        }
                    }, [e(S.a, [!t.isLoading && t.steps > 2 ? e("ActivityApOas", {
                        key: t.steps,
                        attrs: {
                            activity: t.activity,
                            members: t.entityMembers,
                            entity: t.entityModel,
                            "invitee-type": t.inviteeType,
                            "invitee-id": t.inviteeId
                        }
                    }) : t._e()], 1), t._v(" "), e(S.a, [e("ActivityApLogbook", {
                        attrs: {
                            activity: t.activity
                        }
                    })], 1)], 1)], 1), t._v(" "), e("section", {
                        staticClass: "ActivityPlan__buttons mt-5"
                    }, [e("hr"), t._v(" "), t.isActivityConcluded ? t._e() : e(r.a, {
                        staticClass: "mr-4",
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.requestPending,
                            block: t.$vuetify.breakpoint.xs,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.gotoStep(2)
                            },
                            keydown: function(e) {
                                return t.gotoStep(2)
                            }
                        }
                    }, [t._v("\n            " + t._s(t.LABEL.PREVIOUS) + "\n          ")]), t._v(" "), t.isCreating ? e(r.a, {
                        staticClass: "mr-4",
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.requestPending,
                            block: t.$vuetify.breakpoint.xs,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                t.discardPlanModal = !0
                            },
                            keydown: function(e) {
                                t.discardPlanModal = !0
                            }
                        }
                    }, [t._v("\n            " + t._s(t.LABEL.DISCARD_PLAN) + "\n          ")]) : e(r.a, {
                        staticClass: "mr-4",
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.requestPending,
                            block: t.$vuetify.breakpoint.xs,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                t.cancelActivityModal = !0
                            }
                        }
                    }, [t._v("\n            " + t._s(t.LABEL.DELETE_PLAN) + "\n          ")]), t._v(" "), t.isEditing ? e(r.a, {
                        staticClass: "mr-4",
                        attrs: {
                            disabled: t.requestPending,
                            block: t.$vuetify.breakpoint.xs,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.cancel()
                            },
                            keydown: function(e) {
                                return t.cancel()
                            }
                        }
                    }, [t._v("\n            " + t._s(t.LABEL.CANCEL) + "\n          ")]) : t._e(), t._v(" "), t.canSave ? e(r.a, {
                        attrs: {
                            disabled: t.$nuxt.isOffline,
                            loading: t.requestPending,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.updateActivity()
                            }
                        }
                    }, [t._v("\n            " + t._s(t.LABEL.SAVE) + "\n          ")]) : t._e(), t._v(" "), e(r.a, {
                        staticClass: "float-right",
                        attrs: {
                            disabled: t.requestPending,
                            "data-cy": "step3.Next",
                            block: t.$vuetify.breakpoint.xs,
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.gotoStep(4)
                            },
                            keydown: function(e) {
                                return t.gotoStep(4)
                            }
                        }
                    }, [t._v("\n            " + t._s(t.LABEL.NEXT_STEP) + "\n          ")])], 1)]) : t._e(), t._v(" "), t.isProposal || !t.isCreating && !t.isEditing ? t._e() : e(k.a, {
                        attrs: {
                            step: "4"
                        }
                    }, [e("section", {
                        staticClass: "ActivityPlan__header"
                    }, [e("ActivityPlanHeader", {
                        attrs: {
                            "title-text": "4. " + t.activityTitles.step_4_title,
                            "show-button": t.canShowCommentsButton,
                            disabled: t.requestPending,
                            activity: t.activity
                        }
                    }), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__header-subtitle mb-6"
                    }, [t._v("\n            Please confirm the attendance & participation of the participants. If the event has not yet taken\n            place, you can skip this section and come back to it when you are ready to conclude the event.\n          ")]), t._v(" "), e("Attendance", {
                        key: t.steps,
                        attrs: {
                            disabled: t.$nuxt.isOffline,
                            "attendance-data": t.activity.attendance,
                            "entity-members": t.entityMembers,
                            "invitee-type": t.inviteeType
                        }
                    })], 1), t._v(" "), e("section", {
                        staticClass: "ActivityPlan__buttons mt-5"
                    }, [e("hr"), t._v(" "), e(r.a, {
                        staticClass: "mr-4",
                        attrs: {
                            disabled: t.requestPending,
                            block: t.$vuetify.breakpoint.xs,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.gotoStep(3)
                            },
                            keydown: function(e) {
                                return t.gotoStep(3)
                            }
                        }
                    }, [t._v("\n            " + t._s(t.LABEL.PREVIOUS) + "\n          ")]), t._v(" "), t.isCreating ? e(r.a, {
                        staticClass: "mr-4",
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.requestPending,
                            block: t.$vuetify.breakpoint.xs,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                t.discardPlanModal = !0
                            },
                            keydown: function(e) {
                                t.discardPlanModal = !0
                            }
                        }
                    }, [t._v("\n            " + t._s(t.LABEL.DISCARD_PLAN) + "\n          ")]) : e(r.a, {
                        staticClass: "mr-4",
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.requestPending,
                            block: t.$vuetify.breakpoint.xs,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                t.cancelActivityModal = !0
                            }
                        }
                    }, [t._v("\n            " + t._s(t.LABEL.DELETE_PLAN) + "\n          ")]), t._v(" "), t.isEditing ? e(r.a, {
                        staticClass: "mr-4",
                        attrs: {
                            disabled: t.requestPending,
                            block: t.$vuetify.breakpoint.xs,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.cancel()
                            },
                            keydown: function(e) {
                                return t.cancel()
                            }
                        }
                    }, [t._v("\n            " + t._s(t.LABEL.CANCEL) + "\n          ")]) : t._e(), t._v(" "), t.canSave && !t.isActivityConcluded ? e(r.a, {
                        attrs: {
                            disabled: t.$nuxt.isOffline,
                            loading: t.requestPending,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.updateActivity()
                            }
                        }
                    }, [t._v("\n            " + t._s(t.LABEL.SAVE) + "\n          ")]) : t._e(), t._v(" "), e(r.a, {
                        staticClass: "float-right",
                        attrs: {
                            disabled: t.requestPending,
                            "data-cy": "step4.Next",
                            block: t.$vuetify.breakpoint.xs,
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                t.showConcludableSteps ? t.gotoStep(5) : t.gotoPlanSummary()
                            },
                            keydown: function(e) {
                                t.showConcludableSteps ? t.gotoStep(5) : t.gotoPlanSummary()
                            }
                        }
                    }, [t._v("\n            " + t._s(t.showConcludableSteps ? t.LABEL.NEXT_STEP : t.LABEL.VIEW_SUMMARY) + "\n          ")])], 1)]), t._v(" "), !t.isProposal && t.validatorStep1 && t.validatorStep2 && t.showConcludableSteps && t.isValidInvitee ? e(k.a, {
                        attrs: {
                            step: "5"
                        }
                    }, [e("section", {
                        staticClass: "ActivityPlan__header"
                    }, [e("ActivityPlanHeader", {
                        attrs: {
                            "title-text": "5. " + t.activityTitles.step_5_title,
                            "show-button": t.canShowCommentsButton,
                            disabled: t.requestPending,
                            activity: t.activity
                        }
                    }), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__subtitle mb-6"
                    }, [t._v("\n            Talk to the participants after the activity. What was achieved, what was enjoyed and how have they grown?\n          ")]), t._v(" "), e("ActivityReview", {
                        attrs: {
                            "activity-data": t.activity,
                            "entity-members": t.entityMembers,
                            "entity-member-names": t.whoActivityFor(),
                            "invitee-type": t.inviteeType,
                            "activity-ended": t.hasActivityPastEndDate
                        }
                    })], 1), t._v(" "), e(r.a, {
                        staticClass: "mr-4",
                        attrs: {
                            disabled: t.requestPending,
                            block: t.$vuetify.breakpoint.xs,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.gotoStep(4)
                            },
                            keydown: function(e) {
                                return t.gotoStep(4)
                            }
                        }
                    }, [t._v("\n          " + t._s(t.LABEL.PREVIOUS) + "\n        ")]), t._v(" "), t.isCreating ? e(r.a, {
                        staticClass: "mr-4",
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.requestPending,
                            block: t.$vuetify.breakpoint.xs,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                t.discardPlanModal = !0
                            },
                            keydown: function(e) {
                                t.discardPlanModal = !0
                            }
                        }
                    }, [t._v("\n          " + t._s(t.LABEL.DISCARD_PLAN) + "\n        ")]) : e(r.a, {
                        staticClass: "mr-4",
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.requestPending,
                            block: t.$vuetify.breakpoint.xs,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                t.cancelActivityModal = !0
                            }
                        }
                    }, [t._v("\n          " + t._s(t.LABEL.DELETE_PLAN) + "\n        ")]), t._v(" "), t.isEditing ? e(r.a, {
                        staticClass: "mr-4",
                        attrs: {
                            disabled: t.requestPending,
                            block: t.$vuetify.breakpoint.xs,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.cancel()
                            },
                            keydown: function(e) {
                                return t.cancel()
                            }
                        }
                    }, [t._v("\n          " + t._s(t.LABEL.CANCEL) + "\n        ")]) : t._e(), t._v(" "), e(r.a, {
                        staticClass: "float-right",
                        attrs: {
                            disabled: !t.validatorStep5 || t.requestPending,
                            "data-cy": "step5.Next",
                            block: t.$vuetify.breakpoint.xs,
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.gotoPlanSummary()
                            },
                            keydown: function(e) {
                                return t.gotoPlanSummary()
                            }
                        }
                    }, [t._v("\n          " + t._s(t.LABEL.NEXT_STEP) + "\n        ")])], 1) : t._e(), t._v(" "), t.isProposal ? t._e() : e(k.a, {
                        attrs: {
                            step: "6"
                        }
                    }, [e("section", {
                        staticClass: "ActivityPlan__header"
                    }, [e("ActivityPlanHeader", {
                        attrs: {
                            "title-text": "" + (t.isViewing ? t.activity.title : t.activityTitles.step_6_title),
                            "show-button": t.canShowCommentsButton,
                            disabled: t.requestPending,
                            activity: t.activity
                        }
                    }), t._v(" "), t.isViewing ? t._e() : e("div", {
                        staticClass: "ActivityPlan__header-subtitle mb-4"
                    }, [t._v("\n            Please review the details below before submitting the activity plan.\n          ")])], 1), t._v(" "), e("section", {
                        staticClass: "ActivityPlan__review"
                    }, [e("div", {
                        staticClass: "ActivityPlan__review-header"
                    }, [e("span", [t._v("1. " + t._s(t.activityTitles.step_1_title))]), t._v(" "), !t.isCreating && !t.canEdit || t.isActivityConcluded ? t._e() : e(r.a, {
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.requestPending,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.editStep(1)
                            }
                        }
                    }, [t._v("\n              " + t._s(t.LABEL.EDIT) + "\n            ")])], 1), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__subsection-title"
                    }, [e("strong", [t._v(t._s(t.activityTitles.details))])]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-title"
                    }, [t._v("What is this activity called?")]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-answer",
                        attrs: {
                            "data-cy": "activity_title"
                        }
                    }, [t._v(t._s(t.activity.title))]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-title"
                    }, [t._v("Give a short description of what this activity is (optional)")]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-answer",
                        attrs: {
                            "data-cy": "activity_description"
                        }
                    }, [t._v("\n            " + t._s(t.activity.description || "-") + "\n          ")]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-title"
                    }, [t._v(t._s(t.activityTitles.justification) + " (optional)")]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-answer",
                        attrs: {
                            "data-cy": "activity_justification"
                        }
                    }, [t._v("\n            " + t._s(t.activity.justification || "-") + "\n          ")]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-title mb-2"
                    }, [t._v("\n            " + t._s(t.activityTitles.challengeAreas) + "\n          ")]), t._v(" "), t.activity.challenge_area ? e("div", {
                        staticClass: "ActivityPlan__review-answer"
                    }, [e(l.a, {
                        staticClass: "ActivityPlan__list-card"
                    }, [e(y.a, {
                        staticClass: "px-5 pl-0",
                        staticStyle: {
                            height: "100%"
                        },
                        attrs: {
                            "no-gutters": "",
                            align: "center"
                        }
                    }, [e("img", {
                        attrs: {
                            width: "48",
                            height: "48",
                            alt: t.activity.challenge_area,
                            src: t.fetchIcon(t.activity.challenge_area)
                        }
                    }), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__list-desc ml-4"
                    }, [t._v("\n                  " + t._s(t.challengeAreaTitle) + "\n                ")])])], 1)], 1) : t._e(), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__subsection-title mt-12"
                    }, [t._v("\n            " + t._s(t.activityTitles.timeAndPlace) + "\n          ")]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-title"
                    }, [t._v("Location")]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-answer",
                        attrs: {
                            "data-cy": "activity_location"
                        }
                    }, [t._v(t._s(t.activity.location))]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-title"
                    }, [t._v("Date")]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-answer"
                    }, [t._v("\n            " + t._s(t.formatDate(t.activity.startDate)) + " to " + t._s(t.formatDate(t.activity.endDate)) + "\n          ")]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-title"
                    }, [t._v("Time")]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-answer"
                    }, [t._v("\n            " + t._s(t.convert24hrTo12hr(t.activity.startTime)) + " to " + t._s(t.convert24hrTo12hr(t.activity.endTime)) + "\n          ")]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__subtitle mt-8 mb-6"
                    }, [e("strong", [t._v("What elements of the Scout Method will be covered in this activity?*")])]), t._v(" "), t._l(t.activity.review.scout_method_elements, (function(n, o) {
                        return e(l.a, {
                            key: o,
                            staticClass: "ActivityPlan__list-card"
                        }, [e(y.a, {
                            staticStyle: {
                                height: "100%"
                            },
                            attrs: {
                                "no-gutters": "",
                                align: "center"
                            }
                        }, [e("img", {
                            attrs: {
                                width: "48",
                                height: "48",
                                alt: n,
                                src: t.fetchIcon(n)
                            }
                        }), t._v(" "), e("div", {
                            staticClass: "ml-4"
                        }, [t._v("\n                " + t._s(t.getSelectedListTitle(t.SCOUT_METHOD_LIST, n)) + "\n              ")])])], 1)
                    })), t._v(" "), t.isProposal ? [e("div", {
                        staticClass: "ActivityPlan__review-title"
                    }, [t._v(t._s(t.activityTitles.submittedBy))]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-answer"
                    }, [t._v("\n              " + t._s(t.patrolName) + "\n            ")]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-answer"
                    }, [t._v("\n              " + t._s(t.submitterName) + "\n            ")])] : t._e(), t._v(" "), e("hr", {
                        staticClass: "mt-10 mb-10"
                    }), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-header"
                    }, [e("span", [t._v("2. " + t._s(t.activityTitles.step_2_title))]), t._v(" "), !t.isCreating && !t.canEdit || t.isActivityConcluded ? t._e() : e(r.a, {
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.requestPending,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.editStep(2)
                            }
                        }
                    }, [t._v("\n              " + t._s(t.LABEL.EDIT) + "\n            ")])], 1), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-title"
                    }, [t._v(t._s(t.activityTitles.whoFor))]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-answer",
                        attrs: {
                            "data-cy": "activity_for"
                        }
                    }, [t._v(t._s(t.whoActivityFor()))]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-title"
                    }, [t._v(t._s(t.activityTitles.organiser))]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-answer",
                        attrs: {
                            "data-cy": "activity_organiser_name"
                        }
                    }, [t._v("\n            " + t._s(t.organisersFormatted) + "\n          ")]), t._v(" "), t.hasActivityPastEndDate || t.isEditing ? t._e() : [e("div", {
                        staticClass: "ActivityPlan__review-title"
                    }, [t._v("Who will lead the activity?")]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-answer"
                    }, [t._v("\n              " + t._s(t.leaderNames(t.activity)) + "\n            ")]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-title"
                    }, [t._v("Who will assist with the activity?")]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-answer"
                    }, [t._v("\n              " + t._s(t.assistantNames(t.activity)) + "\n            ")])], t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-title"
                    }, [t._v("Add schedules (optional)")]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-answer"
                    }, [t.activity.schedule_items ? e("div", t._l(t.activity.schedule_items, (function(n, o) {
                        return e("div", {
                            key: o,
                            staticClass: "ActivityPlan__review-schedule"
                        }, [n.start_datetime && n.end_datetime ? [e("div", {
                            staticClass: "ActivityPlan__review-schedule-date"
                        }, [t._v("\n                    " + t._s(t.formatDate(t.initialDate(n.start_datetime))) + "\n                  ")]), t._v(" "), e("div", {
                            staticClass: "ActivityPlan__review-schedule-time"
                        }, [t._v("\n                    " + t._s(n.start_datetime ? t.initialTime(n.start_datetime) : "No start time") + " -\n                    " + t._s(n.end_datetime ? t.initialTime(n.end_datetime) : "No end time") + "\n                  ")]), t._v(" "), e("div", {
                            staticClass: "ActivityPlan__review-schedule-details"
                        }, [e("div", {
                            staticClass: "ActivityPlan__review-schedule-description"
                        }, [t._v(t._s(n.description))]), t._v(" "), !n.leader_notes && n.assistant_notes ? e("div", {
                            staticClass: "ActivityPlan__review-schedule-members"
                        }, [t._v("\n                      -\n                    ")]) : e("div", {
                            staticClass: "ActivityPlan__review-schedule-members"
                        }, [t._v("\n                      " + t._s(n.leader_notes) + "\n                      "), n.assistant_notes ? e("span", [t._v(",")]) : t._e(), t._v("\n                      " + t._s(n.assistant_notes) + "\n                    ")])])] : e("div", [t._v("Schedule item unavailable or incomplete.")])], 2)
                    })), 0) : e("div", [t._v("-")])]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__subsection-title mt-12"
                    }, [t._v("\n            " + t._s(t.activityTitles.supportingMaterials) + "\n          ")]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-title"
                    }, [t._v(t._s(t.activityTitles.equipment))]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-answer",
                        attrs: {
                            "data-cy": "activity_equipment"
                        }
                    }, [t._v("\n            " + t._s(t.activity.equipment_notes ? t.activity.equipment_notes : "-") + "\n          ")]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-title"
                    }, [t._v(t._s(t.activityTitles.additional))]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-answer",
                        attrs: {
                            "data-cy": "activity_notes"
                        }
                    }, [t._v("\n            " + t._s(t.activity.additional_notes ? t.activity.additional_notes : "-") + "\n          ")]), t._v(" "), t.viewFiles().length > 0 ? e("div", {
                        staticClass: "ActivityPlan__review-title"
                    }, [t._v("\n            " + t._s(t.activityTitles.additionalFiles) + "\n          ")]) : t._e(), t._v(" "), t._l(t.viewFiles(), (function(n) {
                        return e("div", {
                            key: n.key,
                            staticClass: "ActivityPlan__review-answer"
                        }, [e("a", {
                            staticClass: "ActivityPlan__file",
                            class: {
                                "no-link": !n.url
                            },
                            attrs: {
                                href: n.url,
                                target: "_blank",
                                download: ""
                            }
                        }, [t._v("\n              " + t._s(n.filename) + "\n            ")])])
                    })), t._v(" "), e("hr", {
                        staticClass: "mt-10 mb-10"
                    }), t._v(" "), e("div", {
                        staticClass: "d-flex flex-column"
                    }, [e("div", {
                        staticClass: "ActivityPlan__review-header"
                    }, [e("div", [t._v("3. " + t._s(t.activityTitles.step_3_title))]), t._v(" "), t.isCreating || t.canEdit ? e(r.a, {
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.requestPending,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.editStep(3)
                            }
                        }
                    }, [t._v("\n                " + t._s(t.LABEL.EDIT) + "\n              ")]) : t._e()], 1), t._v(" "), t.hasOas || t.hasLogbook ? [e(P.a, {
                        key: t.steps,
                        staticClass: "mt-6 mb-12",
                        attrs: {
                            "background-color": "grey lighten-5",
                            grow: "",
                            height: "40"
                        },
                        model: {
                            value: t.tabs,
                            callback: function(e) {
                                t.tabs = e
                            },
                            expression: "tabs"
                        }
                    }, t._l(t.tabsList, (function(n) {
                        return e(T.a, {
                            key: n
                        }, [t._v("\n                  " + t._s(n) + "\n                ")])
                    })), 1), t._v(" "), e($.a, {
                        model: {
                            value: t.tabs,
                            callback: function(e) {
                                t.tabs = e
                            },
                            expression: "tabs"
                        }
                    }, [e(S.a, [e("div", {
                        staticClass: "ActivityPlan__review-title mt-0 mb-6"
                    }, [t._v("Outdoor Adventure Skills")]), t._v(" "), t.activity.achievement_pathway_oas_data.groups.length ? [e("div", {
                        staticClass: "ActivityPlan__review-answer d-flex flex-wrap",
                        staticStyle: {
                            "max-width": "900px"
                        }
                    }, t._l(t.activity.achievement_pathway_oas_data.groups, (function(n, i) {
                        return e(l.a, {
                            key: i,
                            staticClass: "ActivityPlan__list-card"
                        }, [e(y.a, {
                            staticClass: "px-5 pl-0",
                            staticStyle: {
                                height: "100%"
                            },
                            attrs: {
                                "no-gutters": "",
                                align: "center"
                            }
                        }, [e("img", {
                            attrs: {
                                width: "48",
                                height: "48",
                                alt: n.stream,
                                src: t.fetchIcon(n.stream, "oas_")
                            }
                        }), t._v(" "), e("div", {
                            staticClass: "ActivityPlan__list-desc ml-4 text-capitalize"
                        }, [t._v("\n                            " + t._s(t.oasTitle(n.stream)) + "\n                          ")])])], 1)
                    })), 1), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-title mb-6"
                    }, [t._v("Stages")]), t._v(" "), t._l(t.activity.achievement_pathway_oas_data.groups, (function(n, i) {
                        return e("div", {
                            key: i,
                            staticClass: "ActivityPlan__review-answer"
                        }, [t._v("\n                      " + t._s(n.title) + "\n                    ")])
                    }))] : e("div", [t._v("-")]), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__subsection-title mt-12"
                    }, [t._v("i-statements")]), t._v(" "), e("hr"), t._v(" "), 6 !== t.steps || t.isLoading ? t._e() : e("ActivityApOas", {
                        attrs: {
                            reviewing: !0,
                            activity: t.activity,
                            members: t.entityMembers,
                            entity: t.entityModel,
                            "invitee-type": t.inviteeType,
                            "invitee-id": t.inviteeId
                        }
                    })], 2), t._v(" "), e(S.a, [6 !== t.steps || t.isLoading ? t._e() : [t.isViewing || t.validatorLogbook ? t._e() : e("InfoCard", {
                        staticClass: "mb-7",
                        attrs: {
                            "info-type": "caution",
                            title: "There is incomplete or invalid information for this Achievement Pathway. Please make sure to enter all mandatory fields."
                        }
                    }), t._v(" "), e("ActivityReviewSummaryBlock", {
                        attrs: {
                            title: "Activity Area",
                            answer: t.titleCase(t.logbookData.achievement_meta.stream)
                        }
                    }), t._v(" "), e("ActivityReviewSummaryBlock", {
                        attrs: {
                            title: "Activity Stream",
                            answer: t.formatActivityStream(t.logbookData.achievement_meta.branch)
                        }
                    }), t._v(" "), e("ActivityReviewSummaryBlock", {
                        attrs: {
                            title: "Does this activity contribute to the Camper Award?",
                            answer: t.logbookData.categories.find(t => "camping" === t) ? "Yes" : "No"
                        }
                    }), t._v(" "), e("ActivityReviewSummaryBlock", {
                        attrs: {
                            title: "Does this activity contribute to the Walkabout Award?",
                            answer: t.logbookData.categories.find(t => "walking_hike" === t) ? "Yes" : "No"
                        }
                    }), t._v(" "), e("ActivityReviewSummaryBlock", {
                        attrs: {
                            title: "Total distance or height travelled",
                            answer: t.logbookData.distance_travelled ? t.logbookData.distance_travelled : "-"
                        }
                    }), t._v(" "), e("ActivityReviewSummaryBlock", {
                        attrs: {
                            title: "Distance travelled specific to Walkabout Award?",
                            answer: t.logbookData.distance_walkabout ? t.logbookData.distance_walkabout : "-"
                        }
                    }), t._v(" "), e("ActivityReviewSummaryBlock", {
                        attrs: {
                            title: "Grade of activity (if applicable)",
                            answer: t.logbookData.details.activity_grade ? t.logbookData.details.activity_grade : "-"
                        }
                    })]], 2)], 1)] : [t._v("No data entered")]], 2), t._v(" "), e("hr", {
                        staticClass: "mt-10 mb-10"
                    }), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-header"
                    }, [e("div", [t._v("4. " + t._s(t.activityTitles.step_4_title))]), t._v(" "), t.isCreating || t.canEdit ? e(r.a, {
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.requestPending,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.editStep(4)
                            }
                        }
                    }, [t._v("\n              " + t._s(t.LABEL.EDIT) + "\n            ")]) : t._e()], 1), t._v(" "), e("Attendance", {
                        key: t.steps,
                        attrs: {
                            disabled: !0,
                            "attendance-data": t.activity.attendance,
                            "entity-members": t.entityMembers,
                            "invitee-type": t.inviteeType
                        }
                    }), t._v(" "), t.showConcludableSteps ? e("div", [e("hr", {
                        staticClass: "mt-10 mb-10"
                    }), t._v(" "), e("div", {
                        staticClass: "ActivityPlan__review-header"
                    }, [e("div", [t._v("5. " + t._s(t.activityTitles.step_5_title))]), t._v(" "), t.isCreating || t.canEdit ? e(r.a, {
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.requestPending,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.editStep(5)
                            }
                        }
                    }, [t._v("\n                " + t._s(t.LABEL.EDIT) + "\n              ")]) : t._e()], 1), t._v(" "), t.steps > 5 ? e("ActivityReviewSummary", {
                        attrs: {
                            "activity-data": t.activity,
                            "entity-members": t.entityMembers,
                            "entity-member-names": t.whoActivityFor(),
                            "invitee-type": t.inviteeType,
                            disabled: !0
                        }
                    }) : t._e()], 1) : t._e()], 2), t._v(" "), (t.isCreating || t.isEditing) && t.isThisActivityConcludable && t.logbookRequiresAction ? e("InfoCard", {
                        staticClass: "mb-12",
                        attrs: {
                            "info-type": "error",
                            title: "Please complete or clear the Logbook Achievement Pathways section to continue."
                        }
                    }) : t._e(), t._v(" "), e("section", {
                        staticClass: "ActivityPlan__buttons mt-5"
                    }, [t.isCreating || t.isEditing ? [t.isThisActivityConcludable && t.isPastEventCreated ? e(r.a, {
                        staticClass: "float-right ml-4",
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.requestPending || t.logbookRequiresAction,
                            block: t.$vuetify.breakpoint.xs,
                            small: "",
                            loading: t.requestPending
                        },
                        on: {
                            click: function(e) {
                                return t.concludeEvent()
                            },
                            keydown: function(e) {
                                return t.concludeEvent()
                            }
                        }
                    }, [t._v("\n              " + t._s(t.LABEL.CONCLUDE_PLAN) + "\n            ")]) : t._e(), t._v(" "), t.isThisActivityConcludable && !t.isPastEventCreated ? e(r.a, {
                        staticClass: "float-right",
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.requestPending || t.logbookRequiresAction,
                            block: t.$vuetify.breakpoint.xs,
                            small: "",
                            loading: t.requestPending,
                            "data-cy": "CONFIRM_CONCLUDE_PLAN"
                        },
                        on: {
                            click: function(e) {
                                return t.createPastEvent(t.inviteeType, t.inviteeId)
                            },
                            keydown: function(e) {
                                return t.createPastEvent(t.inviteeType, t.inviteeId)
                            }
                        }
                    }, [t._v("\n              " + t._s(t.LABEL.CONFIRM_CONCLUDE_PLAN) + "\n            ")]) : t._e()] : t._e(), t._v(" "), t.isCreating ? [e(r.a, {
                        staticClass: "mr-4",
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.requestPending,
                            block: t.$vuetify.breakpoint.xs,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                t.discardPlanModal = !0
                            },
                            keydown: function(e) {
                                t.discardPlanModal = !0
                            }
                        }
                    }, [t._v("\n              " + t._s(t.LABEL.DISCARD_PLAN) + "\n            ")]), t._v(" "), t.hasActivityPastEndDate ? t._e() : e(r.a, {
                        staticClass: "float-right",
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.requestPending,
                            "who-activity-for": "",
                            "data-cy": "ADD_CALENDAR",
                            small: "",
                            loading: t.requestPending,
                            block: t.$vuetify.breakpoint.xs
                        },
                        on: {
                            click: function(e) {
                                return t.createEvent(t.inviteeType, t.inviteeId)
                            },
                            keydown: function(e) {
                                return t.createEvent(t.inviteeType, t.inviteeId)
                            }
                        }
                    }, [t._v("\n              " + t._s(t.LABEL.CONFIRM_PLAN) + "\n            ")])] : t._e(), t._v(" "), t.isEditing ? [e(r.a, {
                        staticClass: "mr-4",
                        attrs: {
                            disabled: t.requestPending,
                            block: t.$vuetify.breakpoint.xs,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.cancel()
                            },
                            keydown: function(e) {
                                return t.cancel()
                            }
                        }
                    }, [t._v("\n              " + t._s(t.LABEL.CANCEL) + "\n            ")]), t._v(" "), t.canSave ? e(r.a, {
                        staticClass: "float-right",
                        attrs: {
                            disabled: t.$nuxt.isOffline || !t.validatorStep1,
                            loading: t.requestPending,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.updateActivity("Activity Plan edited successfully", !0)
                            }
                        }
                    }, [t._v("\n              " + t._s(t.LABEL.SAVE) + "\n            ")]) : t._e()] : t.isViewing ? [!t.isActivityConcluded && t.canEdit ? e(r.a, {
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.requestPending,
                            block: t.$vuetify.breakpoint.xs,
                            text: ""
                        },
                        on: {
                            click: function(e) {
                                t.cancelActivityModal = !0
                            }
                        }
                    }, [t._v("\n              " + t._s(t.LABEL.DELETE_PLAN) + "\n            ")]) : t._e(), t._v(" "), t.canConcludeEndedActivity ? e(r.a, {
                        staticClass: "float-right ml-sm-4",
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.requestPending,
                            small: "",
                            block: t.$vuetify.breakpoint.xs
                        },
                        on: {
                            click: function(e) {
                                return t.editStep(4)
                            }
                        }
                    }, [t._v("\n              " + t._s(t.LABEL.CONCLUDE_PLAN) + "\n            ")]) : t._e(), t._v(" "), t.canEdit ? e(r.a, {
                        staticClass: "float-right ml-sm-4",
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.requestPending,
                            small: "",
                            block: t.$vuetify.breakpoint.xs
                        },
                        on: {
                            click: function(e) {
                                t.hasActivityPastEndDate ? t.editStep(3) : t.editStep(1)
                            }
                        }
                    }, [t._v("\n              " + t._s(t.LABEL.EDIT_PLAN) + "\n            ")]) : t._e(), t._v(" "), e(r.a, {
                        staticClass: "float-right ml-sm-4",
                        attrs: {
                            "data-cy": "PRINT",
                            outlined: "",
                            block: t.$vuetify.breakpoint.xs
                        },
                        on: {
                            click: function(e) {
                                return t.scoutsPrint()
                            }
                        }
                    }, [t._v("\n              " + t._s(t.LABEL.PRINT) + "\n            ")]), t._v(" "), t.isUserEventOwner() || t.$accessor.user.hasRoleSupportLeaderReadOnly ? e(r.a, {
                        staticClass: "float-right",
                        attrs: {
                            disabled: t.$nuxt.isOffline || t.requestPending,
                            outlined: "",
                            block: t.$vuetify.breakpoint.xs
                        },
                        on: {
                            click: function(e) {
                                t.exportActivityModal = !0
                            },
                            keydown: function(e) {
                                t.exportActivityModal = !0
                            }
                        }
                    }, [t._v("\n              " + t._s(t.LABEL.EXPORT) + "\n            ")]) : t._e()] : t._e()], 2)], 1)], 1)], 1), t._v(" "), e(h.a, {
                        model: {
                            value: t.showHintModal,
                            callback: function(e) {
                                t.showHintModal = e
                            },
                            expression: "showHintModal"
                        }
                    }, [e(l.a, [e(c.d, {
                        staticClass: "pb-0 mt-0 mb-4"
                    }, [t._v("Milestone Assists and Leads")]), t._v(" "), e(c.c, [e("p", [t._v("\n          The members assigned as Leads or Assists in this activity will be assigned their Milestone Assists and Leads\n          when the activity is concluded and attendance confirmed.\n        ")])]), t._v(" "), e(c.a, [e(f.a), t._v(" "), e(r.a, {
                        attrs: {
                            small: "",
                            text: ""
                        },
                        on: {
                            click: function(e) {
                                t.showHintModal = !1
                            }
                        }
                    }, [t._v("Close")])], 1)], 1)], 1), t._v(" "), e(h.a, {
                        model: {
                            value: t.showSchedulesModal,
                            callback: function(e) {
                                t.showSchedulesModal = e
                            },
                            expression: "showSchedulesModal"
                        }
                    }, [e(l.a, [e(c.d, {
                        staticClass: "pb-0 mt-0 mb-4"
                    }, [e("div", [t._v("Schedules")])]), t._v(" "), e(c.c, [e("p", [t._v("You can add multiple mini activities within an Activity.")]), t._v(" "), e("p", [t._v("\n          Unless specified, the members who lead or assist in each scheduled activities will not be awarded Milestone\n          Leads or Assists.\n        ")])]), t._v(" "), e(c.a, [e(f.a), t._v(" "), e(r.a, {
                        attrs: {
                            small: "",
                            text: ""
                        },
                        on: {
                            click: function(e) {
                                t.showSchedulesModal = !1
                            }
                        }
                    }, [t._v("Close")])], 1)], 1)], 1), t._v(" "), t.exportActivityModal ? e(h.a, {
                        model: {
                            value: t.exportActivityModal,
                            callback: function(e) {
                                t.exportActivityModal = e
                            },
                            expression: "exportActivityModal"
                        }
                    }, [e(l.a, [e(c.d, {
                        staticClass: "mb-3"
                    }, [t._v("Export Activity")]), t._v(" "), e(c.b, {
                        staticClass: "pa-0 mt-0"
                    }, [t._v("\n        A file will be downloaded after you click Okay. Upload this file when you import an activity in Programming\n        and complete the remaining steps of the activity plan.\n      ")]), t._v(" "), e(c.a, {
                        staticClass: "pa-0 mt-0"
                    }, [e(f.a), t._v(" "), e(r.a, {
                        attrs: {
                            text: ""
                        },
                        on: {
                            click: function(e) {
                                t.exportActivityModal = !1
                            }
                        }
                    }, [t._v(t._s(t.LABEL.CANCEL))]), t._v(" "), e("a", {
                        staticStyle: {
                            "text-decoration": "none"
                        },
                        attrs: {
                            href: t.getEncodedJSON(),
                            download: t.exportedActivityFilename()
                        }
                    }, [e(r.a, {
                        staticClass: "mr-4",
                        attrs: {
                            disabled: t.$nuxt.isOffline,
                            text: ""
                        },
                        on: {
                            click: function(e) {
                                return t.exportCallback()
                            }
                        }
                    }, [t._v(t._s(t.LABEL.OKAY))])], 1)], 1)], 1)], 1) : t._e(), t._v(" "), e(h.a, {
                        model: {
                            value: t.showActivityTipsModal,
                            callback: function(e) {
                                t.showActivityTipsModal = e
                            },
                            expression: "showActivityTipsModal"
                        }
                    }, [e(l.a, [e(c.c, [e("p", [t._v("You can write about the following:")]), t._v(" "), e("ul", [e("li", [t._v("what do you want to achieve?")]), t._v(" "), e("li", [t._v("why are you sharing this idea with the Unit Council?")]), t._v(" "), e("li", [t._v("when do you want this to happen?")])])]), t._v(" "), e(c.a, [e(f.a), t._v(" "), e(r.a, {
                        attrs: {
                            small: "",
                            text: ""
                        },
                        on: {
                            click: function(e) {
                                t.showActivityTipsModal = !1
                            }
                        }
                    }, [t._v("Close")])], 1)], 1)], 1), t._v(" "), e("ConfirmationDialog", {
                        attrs: {
                            model: t.discardPlanModal,
                            title: "Discard plan?",
                            subtitle: "This plan will be discarded and the information you entered will be lost.",
                            "confirm-button-label": t.LABEL.DISCARD,
                            "close-button-label": t.LABEL.CANCEL,
                            "confirm-callback": t.cancel,
                            "close-dialog": t.closeDiscardPlanModal
                        }
                    }), t._v(" "), e("ConfirmationDialog", {
                        attrs: {
                            model: t.cancelActivityModal,
                            title: "Cancel activity?",
                            subtitle: "This activity will be cancelled and removed from the calendar.",
                            "confirm-button-label": "Yes, Cancel Activity",
                            "close-button-label": "No, Keep Activity",
                            "confirm-callback": t.cancelActivity,
                            "close-dialog": t.closeCancelActivityModal
                        }
                    }), t._v(" "), e("ConfirmationDialog", {
                        attrs: {
                            model: t.leavePageConfirmationModal,
                            title: "Leave",
                            subtitle: "You're about to leave and lose any unsaved changes.",
                            "confirm-button-label": t.LABEL.OKAY,
                            "close-button-label": t.LABEL.CANCEL,
                            "confirm-callback": t.leavePage,
                            "close-dialog": () => t.leavePageConfirmationModal = !1
                        }
                    }), t._v(" "), t.activity.id ? e("p", {
                        staticClass: "ActivityPlan__activity-id"
                    }, [t._v("Activity ID: " + t._s(t.activity.id))]) : t._e()], 1)
                }), [], !1, null, "718788cc", null);
            e.default = component.exports;
            installComponents(component, {
                Icon: n(55).default,
                DatePicker: n(921).default,
                TimePicker: n(975).default,
                RiskAssessment: n(928).default,
                FileUploader: n(927).default,
                Attendance: n(1117).default,
                ConfirmationDialog: n(79).default
            })
        },
        1190: function(t, e, n) {
            t.exports = {}
        },
        1198: function(t, e, n) {
            "use strict";
            n(1079);
            var o = n(7),
                r = n(13);
            e.a = Object(o.a)(r.a).extend({
                name: "v-timeline",
                provide() {
                    return {
                        timeline: this
                    }
                },
                props: {
                    alignTop: Boolean,
                    dense: Boolean,
                    reverse: Boolean
                },
                computed: {
                    classes() {
                        return {
                            "v-timeline--align-top": this.alignTop,
                            "v-timeline--dense": this.dense,
                            "v-timeline--reverse": this.reverse,
                            ...this.themeClasses
                        }
                    }
                },
                render(t) {
                    return t("div", {
                        staticClass: "v-timeline",
                        class: this.classes
                    }, this.$slots.default)
                }
            })
        },
        1199: function(t, e, n) {
            "use strict";
            var o = n(7),
                r = n(67),
                l = n(13),
                c = n(18);
            const d = Object(o.a)(c.a, l.a);
            e.a = d.extend().extend({
                name: "v-timeline-item",
                inject: ["timeline"],
                props: {
                    color: {
                        type: String,
                        default: "primary"
                    },
                    fillDot: Boolean,
                    hideDot: Boolean,
                    icon: String,
                    iconColor: String,
                    large: Boolean,
                    left: Boolean,
                    right: Boolean,
                    small: Boolean
                },
                computed: {
                    hasIcon() {
                        return !!this.icon || !!this.$slots.icon
                    }
                },
                methods: {
                    genBody() {
                        return this.$createElement("div", {
                            staticClass: "v-timeline-item__body"
                        }, this.$slots.default)
                    },
                    genIcon() {
                        return this.$slots.icon ? this.$slots.icon : this.$createElement(r.a, {
                            props: {
                                color: this.iconColor,
                                dark: !this.theme.isDark,
                                small: this.small
                            }
                        }, this.icon)
                    },
                    genInnerDot() {
                        const data = this.setBackgroundColor(this.color);
                        return this.$createElement("div", {
                            staticClass: "v-timeline-item__inner-dot",
                            ...data
                        }, [this.hasIcon && this.genIcon()])
                    },
                    genDot() {
                        return this.$createElement("div", {
                            staticClass: "v-timeline-item__dot",
                            class: {
                                "v-timeline-item__dot--small": this.small, "v-timeline-item__dot--large": this.large
                            }
                        }, [this.genInnerDot()])
                    },
                    genDivider() {
                        const t = [];
                        return this.hideDot || t.push(this.genDot()), this.$createElement("div", {
                            staticClass: "v-timeline-item__divider"
                        }, t)
                    },
                    genOpposite() {
                        return this.$createElement("div", {
                            staticClass: "v-timeline-item__opposite"
                        }, this.$slots.opposite)
                    }
                },
                render(t) {
                    const e = [this.genBody(), this.genDivider()];
                    return this.$slots.opposite && e.push(this.genOpposite()), t("div", {
                        staticClass: "v-timeline-item",
                        class: {
                            "v-timeline-item--fill-dot": this.fillDot, "v-timeline-item--before": this.timeline.reverse ? this.right : this.left, "v-timeline-item--after": this.timeline.reverse ? this.left : this.right, ...this.themeClasses
                        }
                    }, e)
                }
            })
        },
        1242: function(t, e, n) {
            "use strict";
            n(1190)
        },
        1316: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(886),
                r = n(885),
                l = n(40),
                c = n(1134),
                d = n(89),
                h = l.z.extend({
                    name: "PlanActivityPage",
                    components: {
                        ActivityPlan: c.default
                    },
                    data: () => ({
                        planData: {},
                        loading: !0
                    }),
                    created() {
                        this.init()
                    },
                    methods: {
                        init() {
                            this.flow !== d.a.CREATE || this.$accessor.programming.isPlanningImportedActivity || this.$accessor.programming.resetActivityPlan(), this.planData = this.freeze(this.getPlanData()), this.loading = !1
                        },
                        getPlanData() {
                            return this.$storeProgramming.isPlanningProposedActivity ? this.$storeProgramming.getProposal : this.$storeProgramming.getActivity
                        }
                    },
                    beforeDestroy() {
                        this.$accessor.programming.setIsPlanningProposedActivity(!1), this.$accessor.programming.setIsPlanningImportedActivity(!1)
                    }
                }),
                m = (n(1242), n(9)),
                component = Object(m.a)(h, (function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("div", {
                        staticClass: "PlanActivityPage"
                    }, [t(r.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(o.a, {
                        staticClass: "mx-auto",
                        attrs: {
                            sm: "12",
                            md: "11",
                            lg: "12"
                        }
                    }, [this.loading ? this._e() : t("ActivityPlan", {
                        attrs: {
                            "flow-step": this.$accessor.programming.getStep,
                            "plan-data": this.planData
                        }
                    })], 1)], 1)], 1)
                }), [], !1, null, "0c1bdfd6", null);
            e.default = component.exports
        },
        1496: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(1316).default.extend({
                    name: "ViewActivityPage",
                    created() {
                        this.init(), this.$accessor.programming.setAsSummaryStep()
                    }
                }),
                r = n(9),
                component = Object(r.a)(o, void 0, void 0, !1, null, "999e59b2", null);
            e.default = component.exports
        },
        907: function(t, e, n) {
            "use strict";
            n.d(e, "a", (function() {
                return o
            }));
            const o = t => (null == t ? void 0 : t.includes("required")) ? [t => !!t || "This input is required"] : []
        },
        910: function(t, e, n) {
            t.exports = {}
        },
        913: function(t, e, n) {
            t.exports = {}
        },
        914: function(t, e, n) {
            t.exports = {}
        },
        915: function(t, e, n) {
            t.exports = {}
        },
        921: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(870),
                r = n(62),
                l = n(948),
                c = n(1432),
                d = n(1197),
                h = n(1036),
                m = n(171),
                v = (n(947), n(87)),
                _ = n(907),
                y = v.a.extend({
                    components: {
                        Vue2DatePicker: l.a
                    },
                    props: {
                        cypress: {
                            type: String,
                            default: null
                        },
                        label: {
                            type: String
                        },
                        dateRange: {
                            type: String
                        },
                        dateRangeMin: {
                            type: Boolean
                        },
                        dateRangeMax: {
                            type: Boolean
                        },
                        initialDate: {
                            type: String,
                            default: ""
                        },
                        disabled: {
                            type: Boolean
                        },
                        rules: {
                            type: String,
                            default: ""
                        }
                    },
                    data: () => ({
                        date: new Date,
                        placeholder: "DD/MM/YYYY",
                        isReady: !1,
                        open: !1
                    }),
                    watch: {
                        date() {
                            this.$data.isReady && this.$emit("dateChange", this.parseDate(this.date))
                        }
                    },
                    created() {
                        if (this.date = this.initialDate ? new Date(this.initialDate) : "", this.placeholder = this.initialDate ? this.formatDate(this.initialDate) : this.placeholder, this.dateRangeMin && this.dateRangeMax) throw new Error("Use only a min or max date range.");
                        this.isReady = !0
                    },
                    computed: {
                        isDateSelected() {
                            return !!this.date
                        }
                    },
                    methods: {
                        rulesFromString: _.a,
                        cancel() {
                            this.open = !1
                        },
                        disabledDateRange(t) {
                            let e = 0;
                            return this.dateRangeMin ? e = Object(c.a)(t, Object(d.a)(this.dateRange)) : this.dateRangeMax && (e = Object(h.a)(t, Object(d.a)(this.dateRange))), 1 === e
                        },
                        parseDate: t => t ? Object(m.a)(new Date(t), "yyyy-MM-dd") : null
                    }
                }),
                f = (n(923), n(9)),
                component = Object(f.a)(y, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "DatePicker",
                        class: {
                            disabled: t.disabled
                        }
                    }, [e("Icon", {
                        staticClass: "DatePicker__icon",
                        attrs: {
                            outline: "",
                            name: "calendar"
                        }
                    }), t._v(" "), t.label ? e("div", {
                        staticClass: "DatePicker__label"
                    }, [t._v(t._s(t.label))]) : t._e(), t._v(" "), e("Vue2DatePicker", {
                        staticClass: "DatePicker__date-picker",
                        attrs: {
                            open: t.open,
                            clearable: !1,
                            disabled: t.disabled,
                            placeholder: t.placeholder,
                            format: "DD/MM/YYYY",
                            "disabled-date": t.disabledDateRange
                        },
                        on: {
                            "update:open": function(e) {
                                t.open = e
                            }
                        },
                        scopedSlots: t._u([{
                            key: "footer",
                            fn: function() {
                                return [e(o.a, {
                                    staticClass: "DatePicker__btn-cancel",
                                    attrs: {
                                        small: "",
                                        outlined: "",
                                        type: "button"
                                    },
                                    on: {
                                        keydown: function(e) {
                                            return !e.type.indexOf("key") && t._k(e.keyCode, "enter", 13, e.key, "Enter") ? null : t.cancel.apply(null, arguments)
                                        },
                                        click: t.cancel
                                    }
                                }, [t._v("\n        Cancel\n      ")])]
                            },
                            proxy: !0
                        }]),
                        model: {
                            value: t.date,
                            callback: function(e) {
                                t.date = e
                            },
                            expression: "date"
                        }
                    }), t._v(" "), t.rules ? [e(r.a, {
                        staticClass: "d-none",
                        attrs: {
                            value: t.isDateSelected,
                            rules: t.rulesFromString(t.rules)
                        }
                    })] : t._e()], 2)
                }), [], !1, null, null, null);
            e.default = component.exports;
            installComponents(component, {
                Icon: n(55).default
            })
        },
        923: function(t, e, n) {
            "use strict";
            n(910)
        },
        924: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(236),
                r = n(132),
                l = n(241),
                c = n(33),
                d = n(62),
                h = n(1),
                m = n(907),
                v = n(287),
                _ = h.a.extend({
                    name: "TwoColumnSelectableList",
                    props: {
                        items: {
                            type: Array,
                            required: !0
                        },
                        enumerated: {
                            type: Boolean
                        },
                        iconSize: {
                            type: String,
                            default: "48px"
                        },
                        single: {
                            type: Boolean
                        },
                        disabled: {
                            type: Boolean
                        },
                        selectedCallback: {
                            type: Function,
                            default: null
                        },
                        rules: {
                            type: String,
                            default: ""
                        }
                    },
                    data: () => ({
                        ICONS: v
                    }),
                    computed: {
                        isSomethingSelected() {
                            return !!this.items.find(t => t.selected)
                        }
                    },
                    methods: {
                        rulesFromString: m.a,
                        selectItem(t) {
                            if (!this.disabled) {
                                if (!t.selected && this.single)
                                    for (let i = 0; i < this.items.length; i++) this.items[i].selected = !1;
                                return t.selected = !t.selected, this.selectedCallback ? this.selectedCallback(t) : void 0
                            }
                        },
                        fetchIcon(t, e) {
                            return n(707)(`./icons${this.ICONS.TEMPLATE_ASSETS_PATH}/${this.ICONS.TEMPLATE_ASSET_ICON_NAMES[t]}${this.disabled||!e?this.ICONS.UNSELECTED_SUFFIX:this.ICONS.SELECTED_SUFFIX}.svg`)
                        }
                    }
                }),
                y = (n(926), n(9)),
                component = Object(y.a)(_, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        class: "TwoColumnSelectableList" + (t.disabled ? " disabled" : "")
                    }, [t._l(t.disabled ? t.items.filter(t => t.selected) : t.items, (function(n, i) {
                        return e(o.a, {
                            key: i,
                            staticClass: "TwoColumnSelectableList__card",
                            class: {
                                "--selected": n.selected
                            },
                            attrs: {
                                flat: ""
                            },
                            on: {
                                click: function(e) {
                                    return e.stopPropagation(), t.selectItem(n)
                                }
                            }
                        }, [e(r.a, [e(l.a, {
                            attrs: {
                                size: t.iconSize,
                                tile: ""
                            }
                        }, [e("img", {
                            directives: [{
                                name: "show",
                                rawName: "v-show",
                                value: n.selected,
                                expression: "item.selected"
                            }],
                            attrs: {
                                alt: n.title,
                                src: t.fetchIcon(n.asset, !0)
                            }
                        }), t._v(" "), e("img", {
                            directives: [{
                                name: "show",
                                rawName: "v-show",
                                value: !n.selected,
                                expression: "!item.selected"
                            }],
                            attrs: {
                                alt: n.title,
                                src: t.fetchIcon(n.asset, !1)
                            }
                        })]), t._v(" "), e(c.a, [e(c.b, [t._v(t._s(t.enumerated ? i + ". " : "") + t._s(n.title))])], 1)], 1)], 1)
                    })), t._v(" "), t.rules ? [e(d.a, {
                        staticClass: "d-none",
                        attrs: {
                            value: t.isSomethingSelected,
                            rules: t.rulesFromString(t.rules)
                        }
                    })] : t._e()], 2)
                }), [], !1, null, "7eb8e8c4", null);
            e.default = component.exports
        },
        925: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(886),
                r = n(1439),
                l = n(885),
                c = n(11),
                d = n.n(c),
                h = n(171),
                m = n(40),
                v = n(4);
            const _ = n(23);
            var y = m.c.extend({
                    name: "SubmissionsResponses",
                    props: {
                        unitId: {
                            type: String,
                            required: !0
                        },
                        submissionId: {
                            type: String,
                            required: !0
                        }
                    },
                    data: () => ({
                        isFinalised: !1,
                        tableKey: "submission-responses",
                        submissionHeaders: [{
                            text: "Reviewed by",
                            value: "name"
                        }, {
                            text: "Date",
                            value: "date"
                        }, {
                            text: "Response",
                            value: "response"
                        }, {
                            text: "Comment",
                            value: "comment"
                        }],
                        submissionData: [{}]
                    }),
                    beforeMount() {
                        this.getSubmissionData()
                    },
                    methods: {
                        getSubmissionData() {
                            this.handleRequest({
                                axiosRequest: d.a.get,
                                url: `${this.$config.api.achievements}${v.UNITS_PATH}/${this.unitId}${v.SUBMISSIONS_PATH}/${this.submissionId}`,
                                successResponseCode: _.OK,
                                responseHandler: t => {
                                    this.transformSubmissionData(t.data.submission)
                                }
                            })
                        },
                        transformSubmissionData(t) {
                            this.submissionData = t.actioned_by.map(t => ({
                                name: `${t.member_first_name} ${t.member_last_name}`,
                                date: Object(h.a)(new Date(t.time), "yyyy-MM-dd"),
                                response: t.outcome.toUpperCase(),
                                comment: t.comment
                            })), this.isFinalised = "finalised" === t.status
                        }
                    }
                }),
                f = n(9),
                component = Object(f.a)(y, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", [e(l.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [e(o.a, [e(r.a, {
                        key: t.tableKey,
                        attrs: {
                            headers: t.submissionHeaders,
                            items: t.submissionData,
                            "hide-default-footer": ""
                        }
                    })], 1)], 1), t._v(" "), t.isFinalised ? t._e() : e("div", {
                        staticClass: "mt-8"
                    }, [e("p", [t._v("This achievement will remain read-only until either:")]), t._v(" "), t._m(0), t._v(" "), e("p", [t._v("or")]), t._v(" "), t._m(1)])], 1)
                }), [function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("ul", [t("li", [this._v("Two members of the unit council approve the submission")])])
                }, function() {
                    var t = this._self._c;
                    this._self._setupProxy;
                    return t("ul", [t("li", [this._v("Two members of the unit council request changes")])])
                }], !1, null, null, null);
            e.default = component.exports
        },
        926: function(t, e, n) {
            "use strict";
            n(913)
        },
        927: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(886),
                r = n(1206),
                l = n(885),
                c = n(11),
                d = n.n(c),
                h = n(4),
                m = n(55),
                v = n(79),
                _ = n(5),
                y = n(220);
            var f = y.a.extend({
                    name: "FileUploader",
                    components: {
                        Icon: m.default,
                        ConfirmationDialog: v.default
                    },
                    props: {
                        addUploadFunc: {
                            type: Function,
                            default: null
                        },
                        removeUploadFunc: {
                            type: Function,
                            default: null
                        },
                        disabled: {
                            type: Boolean
                        },
                        input: {
                            type: Object,
                            required: !0
                        },
                        initialUploads: {
                            type: Array,
                            required: !0
                        },
                        uploadUrl: {
                            type: String,
                            default: null
                        },
                        reduceGutter: {
                            type: Boolean,
                            default: !1
                        }
                    },
                    data: () => ({
                        uploads: [],
                        model: null,
                        answer: [],
                        dialog: !1,
                        toBeDeleted: null,
                        LABEL: _.i,
                        firstLoad: !0
                    }),
                    computed: {
                        counterString() {
                            return this.uploads.length + " files"
                        },
                        getUploadUrl() {
                            return this.uploadUrl ? this.uploadUrl : `${this.$config.api.achievements}${h.MEMBERS_PATH}/${this.$accessor.user.getUserId}${h.UPLOADS_PATH}`
                        }
                    },
                    watch: {
                        uploads() {
                            this.firstLoad || this.$nuxt.$emit("hasUploadedFilesChanged"), this.uploads.length ? this.$nuxt.$emit("hasUploads", !0) : this.$nuxt.$emit("hasUploads", !1), this.firstLoad = !1
                        },
                        input: function(t) {
                            !this.answer || this.input.answer !== [] && "" !== this.input.answer || (this.input.answer = this.answer.slice(0))
                        },
                        initialUploads: function(t, e) {
                            t.slice(0).filter(t => this.input.answer.includes(t.id)).filter(t => !this.uploads.includes(t)).filter(t => {
                                const e = this.uploads.find(e => t.key === e.key);
                                if (void 0 !== e) {
                                    if (void 0 !== e.url) return !1;
                                    this.uploads = this.uploads.filter(t => t.key !== e.key)
                                }
                                return !0
                            }).forEach(t => this.uploads.push(t))
                        }
                    },
                    created() {
                        this.input.answer || (this.input.answer = []), this.answer = this.input.answer.slice(0), this.uploads = this.initialUploads.slice(0).filter(t => this.answer.includes(t.id))
                    },
                    beforeDestroy() {
                        this.$nuxt.$off("hasUploadedFilesChanged"), this.$root.$off("fileChanged")
                    },
                    methods: {
                        fileUploaded(t) {
                            if (!t || 0 === t.length) return;
                            const e = [];
                            for (const n of t) n.size > 10485760 ? e.push(n.name) : d.a.post(this.getUploadUrl, {
                                filename: n.name
                            }).then(t => {
                                this.answer.push(t.data.id), this.input.answer = this.answer.slice(0);
                                (new FormData).append("file", n);
                                const e = new XMLHttpRequest;
                                e.open("PUT", t.data.upload_url), e.setRequestHeader("Content-Type", " "), e.send(n);
                                const o = {
                                    bucket: t.data.bucket,
                                    filename: t.data.filename,
                                    key: t.data.key,
                                    uploaded_on: new Date
                                };
                                this.addUploadFunc(o), this.uploads.push({
                                    id: t.data.id,
                                    bucket: t.data.bucket,
                                    filename: t.data.filename,
                                    key: t.data.key,
                                    uploaded_on: new Date
                                })
                            }).catch(t => {
                                this.$accessor.snackbar.setSnack({
                                    message: "File could not be uploaded. Please try again",
                                    icon: "nope"
                                }), console.error("File upload error: ", t)
                            }).then(t => {
                                this.model = null, this.$nuxt.$emit("fileChanged", this.answer)
                            });
                            e.length > 0 && this.$accessor.snackbar.setSnack({
                                message: `${e.join(", ")} ${e.length>1?"are":"is"} greater than 10MB in size. Please try again`,
                                icon: "nope"
                            })
                        },
                        deleteUploadedFile() {
                            if (!this.toBeDeleted) return;
                            const t = this.toBeDeleted;
                            this.uploads = this.uploads.filter(u => u.id !== t.id), d.a.delete(`${this.getUploadUrl}/${t.id}`).then(e => {
                                this.removeUploadFunc(t.key), this.input.answer = this.input.answer.filter(e => e !== t.id)
                            }).catch(t => {
                                this.$accessor.snackbar.setSnack({
                                    message: "File could not be deleted. Please try again",
                                    icon: "nope"
                                }), console.error("File deletion error: ", t)
                            }).then(t => {
                                this.toBeDeleted = null, this.$nuxt.$emit("fileChanged", this.answer)
                            })
                        },
                        openDialog(t) {
                            this.toBeDeleted = t, this.dialog = !0
                        },
                        closeDialog() {
                            this.dialog = !1
                        },
                        clearFiles() {
                            this.uploads.slice(0).forEach(t => {
                                this.toBeDeleted = t, this.deleteUploadedFile()
                            })
                        }
                    }
                }),
                w = (n(929), n(9)),
                component = Object(w.a)(f, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "FileUploader pl-2 mb-6"
                    }, [t.disabled && 0 !== t.uploads.length ? t._e() : e(l.a, {
                        staticClass: "mb-0",
                        class: t.reduceGutter ? "pr-2" : "px-2"
                    }, [e(r.a, {
                        staticClass: "mb-0",
                        attrs: {
                            label: t.input.label,
                            disabled: t.disabled,
                            multiple: "",
                            clearable: !1,
                            counter: "",
                            "counter-string": t.counterString
                        },
                        on: {
                            change: function(e) {
                                return t.fileUploaded(e)
                            }
                        },
                        model: {
                            value: t.model,
                            callback: function(e) {
                                t.model = e
                            },
                            expression: "model"
                        }
                    })], 1), t._v(" "), t.input.alt && !t.disabled ? e(l.a, {
                        staticClass: "mb-4 px-3"
                    }, [e("div", {
                        staticClass: "FileUploader__alt-text ml-1"
                    }, [t._v(t._s(t.input.alt))])]) : t._e(), t._v(" "), t.uploads.length > 0 ? e(l.a, {
                        staticClass: "pl-5 mb-2"
                    }, [e(o.a, [e("div", {
                        staticClass: "FileUploader__uploaded-files"
                    }, [t._v("Uploaded Files")])])], 1) : t._e(), t._v(" "), t._l(t.uploads, (function(n) {
                        return e(l.a, {
                            key: n.id,
                            staticClass: "pl-5 py-2",
                            attrs: {
                                align: "center"
                            }
                        }, [e(o.a, {
                            staticClass: "d-flex justify-space-between"
                        }, [e("div", [t.disabled ? t._e() : e("Icon", {
                            staticClass: "d-inline mr-4",
                            staticStyle: {
                                cursor: "pointer"
                            },
                            attrs: {
                                name: "nope-grey"
                            },
                            nativeOn: {
                                click: function(e) {
                                    return e.stopPropagation(), t.openDialog(n)
                                }
                            }
                        }), t._v(" "), e("a", {
                            staticClass: "FileUploader__filename",
                            class: {
                                "ml-1": t.disabled, "no-link": !n.url
                            },
                            attrs: {
                                href: n.url,
                                download: ""
                            }
                        }, [t._v("\n          " + t._s(n.filename) + "\n        ")])], 1), t._v(" "), e("div", {
                            staticClass: "FileUploader__uploaded"
                        }, [t._v("Uploaded on: " + t._s(new Date(n.uploaded_on).toLocaleDateString()))])])], 1)
                    })), t._v(" "), e("ConfirmationDialog", {
                        attrs: {
                            model: t.dialog,
                            title: "Delete file?",
                            subtitle: "File will be permanently deleted",
                            "confirm-button-label": t.LABEL.OK,
                            "close-button-label": t.LABEL.CANCEL,
                            "confirm-callback": t.deleteUploadedFile,
                            "close-dialog": t.closeDialog
                        }
                    })], 2)
                }), [], !1, null, "f885b948", null);
            e.default = component.exports;
            installComponents(component, {
                Icon: n(55).default,
                ConfirmationDialog: n(79).default
            })
        },
        928: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(870),
                r = n(40),
                l = n(5),
                c = n(3),
                d = r.z.extend({
                    name: "RiskAssessment",
                    data: () => ({
                        PATH: c,
                        EXTERNAL_LINKS: l.h
                    }),
                    props: {
                        fieldName: {
                            type: String,
                            default: "Upload Supporting Files"
                        }
                    }
                }),
                h = (n(930), n(9)),
                component = Object(h.a)(d, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("section", {
                        staticClass: "RiskAssessment"
                    }, [e("div", {
                        staticClass: "RiskAssessment__header"
                    }, [t._v("Risk assessment")]), t._v(" "), e("div", {
                        staticClass: "RiskAssessment__text"
                    }, [t._v("\n    If you are running an activity that requires Risk Assessment, please complete the Scouts Australia Youth Program\n    Risk Identification Template, download it from Google Docs and attach it along with other supporting documents\n    using the " + t._s(t.fieldName) + " field below.\n  ")]), t._v(" "), e("div", {
                        staticClass: "RiskAssessment__actions"
                    }, [e(o.a, {
                        staticClass: "RiskAssessment__button",
                        attrs: {
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: function(e) {
                                return t.openLinkNewTab(t.EXTERNAL_LINKS.RISK_TEMPLATE)
                            }
                        }
                    }, [t._v("\n      Youth Program Risk Identification Table\n    ")]), t._v(" "), e("a", {
                        staticClass: "RiskAssessment__link",
                        attrs: {
                            href: t.PATH.RISK_ASSESSMENT,
                            target: "_blank",
                            rel: "noopener noreferrer"
                        }
                    }, [t._v("\n      What is Risk Assessment?\n    ")])], 1)])
                }), [], !1, null, "264ea88e", null);
            e.default = component.exports
        },
        929: function(t, e, n) {
            "use strict";
            n(914)
        },
        930: function(t, e, n) {
            "use strict";
            n(915)
        },
        946: function(t, e, n) {
            t.exports = {}
        },
        949: function(t, e, n) {
            t.exports = {}
        },
        950: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(235),
                r = n(234),
                l = {
                    props: {
                        loading: {
                            type: Boolean
                        },
                        overlay: {
                            type: Boolean
                        },
                        size: {
                            type: Number,
                            default: 50
                        },
                        overlayColor: {
                            type: String,
                            default: "#ffffff"
                        }
                    }
                },
                c = (n(961), n(9)),
                component = Object(c.a)(l, (function() {
                    var t = this._self._c;
                    return t("div", {
                        staticClass: "Loading"
                    }, [this.loading && this.overlay ? t(o.a, {
                        attrs: {
                            color: this.overlayColor,
                            opacity: "0.8"
                        }
                    }, [t(r.a, {
                        attrs: {
                            indeterminate: "",
                            size: this.size,
                            color: "primary"
                        }
                    })], 1) : this.loading ? t("div", [t(r.a, {
                        attrs: {
                            indeterminate: "",
                            size: this.size,
                            color: "primary"
                        }
                    })], 1) : this._e()], 1)
                }), [], !1, null, "f099b51a", null);
            e.default = component.exports
        },
        953: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(886),
                r = n(885),
                l = n(1).a.extend({
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
                c = (n(959), n(9)),
                component = Object(c.a)(l, (function() {
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
                    }, [e(o.a, {
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
                    }, [e(o.a, {
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
        959: function(t, e, n) {
            "use strict";
            n(946)
        },
        961: function(t, e, n) {
            "use strict";
            n(949)
        },
        965: function(t, e, n) {
            t.exports = {}
        },
        972: function(t, e, n) {
            t.exports = {}
        },
        973: function(t, e, n) {
            t.exports = {}
        },
        974: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(10),
                r = n(5),
                l = n(1037),
                c = n(982),
                d = n(287),
                h = n(27).a.extend({
                    name: "AchievementOverview",
                    components: {
                        List: c.default,
                        InProgressAchievementList: l.default
                    },
                    props: {
                        roundedList: {
                            type: Boolean
                        },
                        items: {
                            type: Array,
                            required: !0
                        },
                        awardedTitle: {
                            type: String,
                            default: "Awarded"
                        },
                        titleFunc: {
                            type: Function,
                            required: !0
                        },
                        editFunc: {
                            type: Function,
                            default: null
                        },
                        editReviewFunc: {
                            type: Function,
                            default: null
                        },
                        viewFunc: {
                            type: Function,
                            default: null
                        },
                        viewReviewFunc: {
                            type: Function,
                            default: null
                        },
                        reviewFunc: {
                            type: Function,
                            default: null
                        },
                        deleteFunc: {
                            type: Function,
                            default: null
                        },
                        iconFunc: {
                            type: Function,
                            default: () => {}
                        },
                        isOas: {
                            type: Boolean
                        },
                        isSia: {
                            type: Boolean
                        },
                        isAj: {
                            type: Boolean
                        },
                        isMilestones: {
                            type: Boolean
                        },
                        showPlannedHeadlines: {
                            type: Boolean,
                            default: !0
                        },
                        showAwardHeadline: {
                            type: Boolean,
                            default: !0
                        }
                    },
                    data: () => ({
                        showSubmissionDetails: !1
                    }),
                    computed: {
                        hasAwardedProjects() {
                            return !!this.awardedAllProjects.length
                        },
                        unitId() {
                            return this.$accessor.user.getUnitId
                        },
                        submissionId() {
                            return this.items && this.items.length > 0 && this.items[0].latest_submission ? this.items[0].latest_submission.submission_id : 0
                        },
                        plannedSiaAjProjects() {
                            return this.$props.items.filter(p => [o.a.DRAFT_APPROVAL, o.a.PENDING_APPROVAL, o.a.FEEDBACK_APPROVAL].includes(p.status)).filter(p => !!this.isOas || p.section === this.$accessor.global.getAppSection).map(t => this.achievementToListItem(t))
                        },
                        plannedProjects() {
                            return this.$props.items.filter(p => [o.a.DRAFT_REVIEW, o.a.PENDING_APPROVAL, o.a.FEEDBACK_APPROVAL].includes(p.status)).filter(p => !!this.isOas || p.section === this.$accessor.global.getAppSection).map(t => this.achievementToListItem(t))
                        },
                        inProgressProjects() {
                            return this.$props.items.filter(p => p.status === o.a.IN_PROGRESS).filter(p => !!this.isOas || p.section === this.$accessor.global.getAppSection).map(t => this.achievementToListItem(t))
                        },
                        awaitingSiaAjReviewProjects() {
                            return this.$props.items.filter(p => [o.a.DRAFT_REVIEW, o.a.PENDING_REVIEW, o.a.FEEDBACK_REVIEW].includes(p.status)).filter(p => !!this.isOas || p.section === this.$accessor.global.getAppSection).map(t => this.achievementToListItem(t))
                        },
                        awaitingReviewProjects() {
                            return this.$props.items.filter(p => [o.a.PENDING_REVIEW, o.a.FEEDBACK_REVIEW].includes(p.status)).filter(p => !!this.isOas || p.section === this.$accessor.global.getAppSection).map(t => this.achievementToListItem(t))
                        },
                        awardedProjects() {
                            return this.$props.items.filter(p => p.status === o.a.AWARDED && !p.imported).filter(p => !!this.isOas || p.section === this.$accessor.global.getAppSection).map(t => this.achievementToListItem(t))
                        },
                        awardedImportedProjects() {
                            return this.$props.items.filter(p => p.status === o.a.AWARDED && p.imported).filter(p => !!this.isOas || p.section === this.$accessor.global.getAppSection).map(t => this.achievementToListItem(t))
                        },
                        awardedAllProjects() {
                            return [...this.awardedProjects, ...this.awardedImportedProjects]
                        },
                        plannedHeadline() {
                            return this.isOas ? "In progress" : "Plan>"
                        }
                    },
                    methods: {
                        achievementToListItem(t) {
                            const e = [];
                            return [o.a.DRAFT_APPROVAL, o.a.FEEDBACK_APPROVAL].includes(t.status) ? (this.$nuxt.isOnline && null !== this.deleteFunc && !this.$accessor.user.currentProfileIsAssumed && e.push({
                                title: r.i.DELETE,
                                callback: () => this.deleteFunc(t),
                                iconPath: `${d.OUTLINE_PATH}/${d.OUTLINE.delete}`
                            }), null !== this.editFunc && e.push({
                                title: this.$nuxt.isOffline ? r.i.VIEW : r.i.EDIT,
                                callback: () => this.editFunc(t),
                                iconPath: `${d.OUTLINE_PATH}/${d.OUTLINE.edit}`
                            })) : [o.a.DRAFT_REVIEW, o.a.FEEDBACK_REVIEW].includes(t.status) ? (!this.$nuxt.isOnline || null === this.deleteFunc || this.isSia || this.isAj || this.$accessor.user.currentProfileIsAssumed || e.push({
                                title: r.i.DELETE,
                                callback: () => this.deleteFunc(t),
                                iconPath: `${d.OUTLINE_PATH}/${d.OUTLINE.delete}`
                            }), null !== this.editReviewFunc && e.push({
                                title: this.$nuxt.isOffline || this.$accessor.user.hasAnySupportLeaderRole ? r.i.VIEW : r.i.EDIT,
                                callback: () => this.editReviewFunc(t),
                                iconPath: `${d.OUTLINE_PATH}/${d.OUTLINE.edit}`
                            })) : [o.a.PENDING_APPROVAL, o.a.IN_PROGRESS].includes(t.status) ? (null === this.viewFunc || t.imported || e.push({
                                title: r.i.VIEW,
                                callback: () => this.viewFunc(t),
                                iconPath: `${d.OUTLINE_PATH}/${d.OUTLINE.view}`
                            }), [o.a.IN_PROGRESS].includes(t.status) && (null === this.reviewFunc || t.imported || e.push({
                                title: r.i.REVIEW,
                                callback: () => this.reviewFunc(t),
                                iconPath: `${d.OUTLINE_PATH}/${d.OUTLINE.review}`
                            }))) : [o.a.PENDING_REVIEW].includes(t.status) ? (null === this.viewReviewFunc || t.imported || e.push({
                                title: r.i.VIEW,
                                callback: () => this.viewReviewFunc(t),
                                iconPath: `${d.OUTLINE_PATH}/${d.OUTLINE.view}`
                            }), this.isMilestones && e.push({
                                title: r.i.SUBMISSION_INFO,
                                callback: () => {
                                    this.showSubmissionDetails = !0
                                }
                            })) : ([o.a.AWARDED].includes(t.status) && [o.b.SIA, o.b.JOURNEY].includes(t.type) || [o.a.AWARDED].includes(t.status)) && (null === this.viewReviewFunc || t.imported || e.push({
                                title: r.i.VIEW,
                                callback: () => this.viewReviewFunc(t),
                                iconPath: `${d.OUTLINE_PATH}/${d.OUTLINE.view}`
                            })), {
                                title: this.titleFunc(t),
                                iconPath: this.iconFunc ? this.iconFunc(t) : "",
                                status: r.a[t.status],
                                imported: t.imported,
                                status_updated: t.status_updated,
                                colour: r.c.get(t.status),
                                actions: e
                            }
                        }
                    }
                }),
                m = (n(1043), n(9)),
                component = Object(m.a)(h, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "AchievementOverview"
                    }, [t.profileSectionEqualsAppSection ? [(t.isSia || t.isAj) && t.plannedSiaAjProjects.length ? e("div", {
                        staticClass: "AchievementOverview AchievementOverview__plan"
                    }, [t.showPlannedHeadlines ? e("span", {
                        staticClass: "AchievementOverview__headline AchievementOverview__headline--plan"
                    }, [t._v("\n        " + t._s(t.plannedHeadline) + "\n      ")]) : t._e(), t._v(" "), t.$props.link ? e("a", {
                        staticClass: "AchievementOverview__link",
                        attrs: {
                            href: t.$props.link
                        }
                    }, [t._v(t._s(t.$props.linkText))]) : t._e(), t._v(" "), e("List", {
                        attrs: {
                            "rounded-list": t.roundedList,
                            items: t.plannedSiaAjProjects
                        }
                    })], 1) : t.isSia || t.isAj || !t.plannedProjects.length ? t._e() : e("div", {
                        staticClass: "AchievementOverview AchievementOverview__plan"
                    }, [t.showPlannedHeadlines ? e("span", {
                        staticClass: "AchievementOverview__headline AchievementOverview__headline--plan"
                    }, [t._v("\n        " + t._s(t.plannedHeadline) + "\n      ")]) : t._e(), t._v(" "), t.$props.link ? e("a", {
                        staticClass: "AchievementOverview__link",
                        attrs: {
                            href: t.$props.link
                        }
                    }, [t._v(t._s(t.$props.linkText))]) : t._e(), t._v(" "), e("List", {
                        attrs: {
                            "rounded-list": t.roundedList,
                            items: t.plannedProjects
                        }
                    })], 1)] : t._e(), t._v(" "), t._t("page-end"), t._v(" "), !t.$slots["in-progress"] && t.profileSectionEqualsAppSection && t.inProgressProjects.length > 0 ? e("div", {
                        staticClass: "AchievementOverview__do mb-6"
                    }, [t.showPlannedHeadlines ? e("span", {
                        staticClass: "AchievementOverview__headline"
                    }, [t._v("Do>")]) : t._e(), t._v(" "), e("div", [t.$props.link ? e("a", {
                        staticClass: "AchievementOverview__link",
                        attrs: {
                            href: t.$props.link
                        }
                    }, [t._v(t._s(t.$props.linkText))]) : t._e(), t._v(" "), e("List", {
                        attrs: {
                            "rounded-list": t.roundedList,
                            items: t.inProgressProjects
                        }
                    })], 1)]) : t.$slots["in-progress"] ? [t.showPlannedHeadlines ? e("span", {
                        staticClass: "AchievementOverview__headline"
                    }, [t._v("Do>")]) : t._e(), t._v(" "), t._t("in-progress")] : t._e(), t._v(" "), t.profileSectionEqualsAppSection ? [(t.isSia || t.isAj) && t.awaitingSiaAjReviewProjects.length > 0 ? e("div", {
                        staticClass: "AchievementOverview__review"
                    }, [t.showPlannedHeadlines ? e("span", {
                        staticClass: "AchievementOverview__headline"
                    }, [t._v("'Review>'")]) : t._e(), t._v(" "), t.$props.link ? e("a", {
                        staticClass: "AchievementOverview__link",
                        attrs: {
                            href: t.$props.link
                        }
                    }, [t._v(t._s(t.$props.linkText))]) : t._e(), t._v(" "), e("List", {
                        attrs: {
                            items: t.awaitingSiaAjReviewProjects,
                            "rounded-list": t.roundedList
                        }
                    })], 1) : t._e(), t._v(" "), !t.isSia && !t.isAj && t.awaitingReviewProjects.length > 0 ? e("div", {
                        staticClass: "AchievementOverview__review"
                    }, [t.showPlannedHeadlines ? e("span", {
                        staticClass: "AchievementOverview__headline"
                    }, [t._v("\n        " + t._s(t.isOas ? "Review" : "Review>") + "\n      ")]) : t._e(), t._v(" "), t.$props.link ? e("a", {
                        staticClass: "AchievementOverview__link",
                        attrs: {
                            href: t.$props.link
                        }
                    }, [t._v(t._s(t.$props.linkText))]) : t._e(), t._v(" "), e("List", {
                        attrs: {
                            items: t.awaitingReviewProjects,
                            "rounded-list": t.roundedList
                        }
                    })], 1) : t._e()] : t._e(), t._v(" "), t.hasAwardedProjects ? [t.showAwardHeadline ? e("div", {
                        staticClass: "AchievementOverview__awarded AchievementOverview__headline"
                    }, [t._v("\n      " + t._s(t.awardedTitle) + "\n    ")]) : t._e(), t._v(" "), e("div", [t.$props.link ? e("a", {
                        staticClass: "AchievementOverview__link",
                        attrs: {
                            href: t.$props.link
                        }
                    }, [t._v(t._s(t.$props.linkText))]) : t._e(), t._v(" "), e("List", {
                        attrs: {
                            items: t.awardedAllProjects,
                            "rounded-list": t.roundedList
                        }
                    })], 1)] : t._e(), t._v(" "), t._t("new-achievement"), t._v(" "), e("InformationDialog", {
                        attrs: {
                            model: t.showSubmissionDetails,
                            title: "Submission Details",
                            "max-width": "800px !important",
                            persistent: !1,
                            "close-button-label": "close",
                            "close-dialog": () => t.showSubmissionDetails = !1
                        }
                    }, [e("div", {
                        attrs: {
                            slot: "content"
                        },
                        slot: "content"
                    }, [e("SubmissionInformation", {
                        attrs: {
                            "unit-id": t.unitId,
                            "submission-id": t.submissionId
                        }
                    })], 1)])], 2)
                }), [], !1, null, "6d5f1028", null);
            e.default = component.exports;
            installComponents(component, {
                List: n(982).default,
                SubmissionInformation: n(925).default,
                InformationDialog: n(219).default
            })
        },
        975: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(1),
                r = n(1062),
                l = n(55),
                c = o.a.extend({
                    name: "TimePicker",
                    components: {
                        VueTimepicker: r.a,
                        Icon: l.default
                    },
                    props: {
                        cypress: {
                            type: String,
                            default: null
                        },
                        label: {
                            type: String,
                            default: "Date"
                        },
                        initialTime: {
                            type: String,
                            default: null
                        },
                        disabled: {
                            type: Boolean
                        },
                        hideClearButton: {
                            type: Boolean,
                            default: !0
                        }
                    },
                    data: () => ({
                        time: {},
                        menu: !1
                    }),
                    watch: {
                        time() {
                            this.updateTime()
                        }
                    },
                    created() {
                        this.initTime()
                    },
                    methods: {
                        initTime() {
                            this.$data.time = this.initialTime ? this.formatInitialTime(this.initialTime) : this.formatInitialTime(""), this.updateTime()
                        },
                        updateTime() {
                            this.$emit("timeChange", this.format24hrTo12hr(this.time))
                        },
                        formatInitialTime(time) {
                            if (!time) return {
                                h: "",
                                mm: "",
                                A: "AM"
                            };
                            const hr = time.split(":")[0];
                            hr.replace(/^0+/, "");
                            let t = parseInt(hr);
                            const e = time.split(":")[1];
                            let n = "PM";
                            t < 12 && (n = "AM", 0 === t && (t = 12)), 24 === t ? t = 12 : t > 12 && (t -= 12);
                            return {
                                h: t.toString(),
                                mm: e,
                                A: n
                            }
                        },
                        format24hrTo12hr(time) {
                            if (!time.h || !time.mm || !time.A) return "";
                            let t = parseInt(time.h);
                            if ("PM" === time.A && t < 12 ? t = parseInt(time.h) + 12 : "AM" === time.A && 12 === t && (t = parseInt(time.h) - 12), t < 10) {
                                let e = t.toString();
                                return e = "0" + t, `${e}:${time.mm}`
                            }
                            return `${t}:${time.mm}`
                        }
                    }
                }),
                d = (n(1056), n(9)),
                component = Object(d.a)(c, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "TimePicker"
                    }, [e("Icon", {
                        staticClass: "TimePicker__icon",
                        attrs: {
                            outline: "",
                            name: "time"
                        }
                    }), t._v(" "), e("div", {
                        staticClass: "TimePicker__label",
                        class: {
                            "TimePicker--disabled": t.disabled
                        }
                    }, [t._v(t._s(t.label))]), t._v(" "), e("vue-timepicker", {
                        staticClass: "TimePicker",
                        class: {
                            "TimePicker--disabled": t.disabled
                        },
                        attrs: {
                            "data-cy": t.cypress,
                            format: "h:mm A",
                            "hide-clear-button": t.hideClearButton,
                            "hour-label": "Hour",
                            "minute-label": "Min",
                            "apm-label": "AM/PM",
                            "manual-input": "",
                            disabled: t.disabled
                        },
                        on: {
                            close: function(e) {
                                return t.updateTime()
                            }
                        },
                        model: {
                            value: t.time,
                            callback: function(e) {
                                t.time = e
                            },
                            expression: "time"
                        }
                    })], 1)
                }), [], !1, null, "13ff6a0f", null);
            e.default = component.exports;
            installComponents(component, {
                Icon: n(55).default
            })
        },
        977: function(t, e, n) {
            t.exports = {}
        },
        981: function(t, e, n) {
            t.exports = {}
        },
        982: function(t, e, n) {
            "use strict";
            n.r(e);
            var o = n(870),
                r = n(236),
                l = n(267),
                c = n(886),
                d = n(885),
                h = n(40),
                m = n(10),
                v = h.l.extend({
                    name: "List",
                    props: {
                        roundedList: {
                            type: Boolean
                        },
                        items: {
                            type: Array,
                            required: !0
                        },
                        iconSize: {
                            type: String,
                            default: "16"
                        },
                        actionIconSize: {
                            type: String,
                            default: "16"
                        },
                        actionIconSizeSmall: {
                            type: String,
                            default: "24"
                        }
                    },
                    methods: {
                        isAwarded: t => [m.a.AWARDED, "Awarded"].includes(t.status),
                        fetchIcon: path => n(987)(`./icons${path}.svg`)
                    }
                }),
                _ = (n(1e3), n(9)),
                component = Object(_.a)(v, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "List"
                    }, t._l(t.items, (function(n, i) {
                        return e(r.a, {
                            key: i,
                            staticClass: "ListItem",
                            class: {
                                "ListItem--rounded": t.roundedList
                            },
                            attrs: {
                                height: "max-content",
                                flat: ""
                            }
                        }, [e(d.a, {
                            attrs: {
                                align: "center"
                            }
                        }, [e(c.a, {
                            staticClass: "ListItem__title-col"
                        }, [n.iconPath ? e("img", {
                            staticClass: "ListItem__area-icon mt-0",
                            attrs: {
                                src: t.fetchIcon(n.iconPath),
                                alt: "",
                                height: t.actionIconSizeSmall,
                                width: t.actionIconSizeSmall
                            }
                        }) : t._e(), t._v(" "), e("div", {
                            staticClass: "ListItem__title"
                        }, [t._v("\n          " + t._s(n.title) + "\n        ")])]), t._v(" "), e(c.a, {
                            staticClass: "ListItem__action-col",
                            attrs: {
                                cols: t.$vuetify.breakpoint.xs ? "12" : "auto"
                            }
                        }, [e(c.a, {
                            staticClass: "ListItem__status-col"
                        }, [t.isAwarded(n) ? e(l.a, {
                            staticClass: "ListItem__status",
                            style: {
                                background: n.colour
                            },
                            attrs: {
                                label: ""
                            }
                        }, [t._v("\n            " + t._s(t.achievedDate(n)) + "\n          ")]) : n.status ? e(l.a, {
                            staticClass: "ListItem__status",
                            style: {
                                background: n.colour
                            },
                            attrs: {
                                label: ""
                            }
                        }, [t._v("\n            " + t._s(n.status) + "\n          ")]) : t._e()], 1), t._v(" "), e("div", {
                            staticClass: "ListItem__action-btn-col"
                        }, t._l(n.actions, (function(r, l) {
                            return e(o.a, {
                                key: l,
                                staticClass: "ListItem__action",
                                attrs: {
                                    text: ""
                                },
                                on: {
                                    click: () => r.callback(n)
                                }
                            }, [r.iconPath ? e("img", {
                                staticClass: "ListItem__action-icon",
                                attrs: {
                                    src: t.fetchIcon(r.iconPath),
                                    alt: "Action icon",
                                    height: t.$vuetify.breakpoint.xs ? t.actionIconSizeSmall : t.actionIconSize,
                                    width: t.$vuetify.breakpoint.xs ? t.actionIconSizeSmall : t.actionIconSize
                                }
                            }) : t._e(), t._v(" "), e("span", {
                                directives: [{
                                    name: "show",
                                    rawName: "v-show",
                                    value: t.$vuetify.breakpoint.smAndUp || !r.iconPath,
                                    expression: "$vuetify.breakpoint.smAndUp || !action.iconPath"
                                }]
                            }, [t._v(t._s(r.title))])])
                        })), 1)], 1)], 1)], 1)
                    })), 1)
                }), [], !1, null, "1b4fefe6", null);
            e.default = component.exports
        },
        987: function(t, e, n) {
            var map = {
                "./icons/icon--caution-inverse.svg": 215,
                "./icons/icon--check-inverse.svg": 216,
                "./icons/icon--hint-inverse.svg": 217,
                "./icons/icon--locked.svg": 308,
                "./icons/icon--logbook-distance-travelled.svg": 300,
                "./icons/icon--logbook-nights-camped.svg": 301,
                "./icons/icon--nope-inverse.svg": 218,
                "./icons/icon--oas-alpine.svg": 309,
                "./icons/icon--oas-aquatics.svg": 310,
                "./icons/icon--oas-boating.svg": 311,
                "./icons/icon--oas-bushcraft.svg": 312,
                "./icons/icon--oas-bushwalking.svg": 313,
                "./icons/icon--oas-camping.svg": 314,
                "./icons/icon--oas-cycling.svg": 315,
                "./icons/icon--oas-paddling.svg": 316,
                "./icons/icon--oas-vertical.svg": 317,
                "./icons/icon--plan.svg": 307,
                "./icons/icon--review.svg": 318,
                "./icons/icon--spices--3x2.svg": 319,
                "./icons/icon--system-admin.svg": 320,
                "./icons/icon--time-inverse.svg": 321,
                "./icons/icon--time.svg": 322,
                "./icons/icon-alert-blue-in-progress.svg": 323,
                "./icons/icon-alert-green-check.svg": 324,
                "./icons/icon-area-community.svg": 176,
                "./icons/icon-area-creativity.svg": 178,
                "./icons/icon-area-outdoors.svg": 177,
                "./icons/icon-area-personal-growth.svg": 179,
                "./icons/icon-attach.svg": 325,
                "./icons/icon-caution.svg": 326,
                "./icons/icon-check-grey.svg": 288,
                "./icons/icon-check.svg": 289,
                "./icons/icon-chevron-right.svg": 327,
                "./icons/icon-danger.svg": 328,
                "./icons/icon-hint-blue.svg": 302,
                "./icons/icon-hint-grey.svg": 329,
                "./icons/icon-in-progress.svg": 330,
                "./icons/icon-info.svg": 331,
                "./icons/icon-nope-grey.svg": 332,
                "./icons/icon-nope.svg": 333,
                "./icons/icon-peak-award-cub-active.svg": 290,
                "./icons/icon-peak-award-cub-disabled.svg": 291,
                "./icons/icon-peak-award-joey-active.svg": 292,
                "./icons/icon-peak-award-joey-disabled.svg": 293,
                "./icons/icon-peak-award-rover-active.svg": 294,
                "./icons/icon-peak-award-rover-disabled.svg": 295,
                "./icons/icon-peak-award-scout-active.svg": 296,
                "./icons/icon-peak-award-scout-disabled.svg": 297,
                "./icons/icon-peak-award-venturer-active.svg": 298,
                "./icons/icon-peak-award-venturer-disabled.svg": 299,
                "./icons/icon-pencil.svg": 334,
                "./icons/icon-success.svg": 335,
                "./icons/icon-view-doc.svg": 336,
                "./icons/outline/icon--add-member.svg": 180,
                "./icons/outline/icon--approve.svg": 181,
                "./icons/outline/icon--archive.svg": 182,
                "./icons/outline/icon--calendar-toggle.svg": 183,
                "./icons/outline/icon--calendar.svg": 184,
                "./icons/outline/icon--check-green.svg": 185,
                "./icons/outline/icon--check-grey.svg": 186,
                "./icons/outline/icon--clipboard-inverse.svg": 187,
                "./icons/outline/icon--clipboard.svg": 188,
                "./icons/outline/icon--close.svg": 189,
                "./icons/outline/icon--comments.svg": 190,
                "./icons/outline/icon--copy.svg": 191,
                "./icons/outline/icon--delete.svg": 192,
                "./icons/outline/icon--download.svg": 193,
                "./icons/outline/icon--edit.svg": 194,
                "./icons/outline/icon--hamburger.svg": 195,
                "./icons/outline/icon--idea.svg": 196,
                "./icons/outline/icon--import-inverse.svg": 197,
                "./icons/outline/icon--import.svg": 198,
                "./icons/outline/icon--improve.svg": 199,
                "./icons/outline/icon--info.svg": 200,
                "./icons/outline/icon--legal.svg": 201,
                "./icons/outline/icon--logout.svg": 202,
                "./icons/outline/icon--notification.svg": 203,
                "./icons/outline/icon--offline.svg": 204,
                "./icons/outline/icon--patrol.svg": 205,
                "./icons/outline/icon--plan.svg": 206,
                "./icons/outline/icon--privacy.svg": 207,
                "./icons/outline/icon--reject.svg": 208,
                "./icons/outline/icon--resource.svg": 209,
                "./icons/outline/icon--review.svg": 210,
                "./icons/outline/icon--support.svg": 211,
                "./icons/outline/icon--time-blue.svg": 212,
                "./icons/outline/icon--time.svg": 213,
                "./icons/outline/icon--view.svg": 214,
                "./icons/template-assets/adventure-sport--default.svg": 337,
                "./icons/template-assets/adventure-sport--selected.svg": 338,
                "./icons/template-assets/adventure-sport--unselected.svg": 339,
                "./icons/template-assets/affordable-and-clean-energy--selected.svg": 340,
                "./icons/template-assets/affordable-and-clean-energy--unselected.svg": 341,
                "./icons/template-assets/art-literature--default.svg": 342,
                "./icons/template-assets/art-literature--selected.svg": 343,
                "./icons/template-assets/art-literature--unselected.svg": 344,
                "./icons/template-assets/character--selected.svg": 345,
                "./icons/template-assets/character--unselected.svg": 346,
                "./icons/template-assets/clean-water-and-sanitation--selected.svg": 347,
                "./icons/template-assets/clean-water-and-sanitation--unselected.svg": 348,
                "./icons/template-assets/climate-action--selected.svg": 349,
                "./icons/template-assets/climate-action--unselected.svg": 350,
                "./icons/template-assets/community--default.svg": 303,
                "./icons/template-assets/community--selected.svg": 351,
                "./icons/template-assets/community--unselected.svg": 352,
                "./icons/template-assets/community-involvement--default.svg": 353,
                "./icons/template-assets/community-involvement--selected.svg": 354,
                "./icons/template-assets/community-involvement--unselected.svg": 355,
                "./icons/template-assets/creating-a-better-world--default.svg": 356,
                "./icons/template-assets/creating-a-better-world--selected.svg": 357,
                "./icons/template-assets/creating-a-better-world--unselected.svg": 358,
                "./icons/template-assets/creative--default.svg": 304,
                "./icons/template-assets/creative--selected.svg": 359,
                "./icons/template-assets/creative--unselected.svg": 360,
                "./icons/template-assets/decent-work-and-economic-growth--selected.svg": 361,
                "./icons/template-assets/decent-work-and-economic-growth--unselected.svg": 362,
                "./icons/template-assets/emotional--selected.svg": 363,
                "./icons/template-assets/emotional--unselected.svg": 364,
                "./icons/template-assets/environment--default.svg": 365,
                "./icons/template-assets/environment--selected.svg": 366,
                "./icons/template-assets/environment--unselected.svg": 367,
                "./icons/template-assets/gender-equality--selected.svg": 368,
                "./icons/template-assets/gender-equality--unselected.svg": 369,
                "./icons/template-assets/good-health-and-wellbeing--selected.svg": 370,
                "./icons/template-assets/good-health-and-wellbeing--unselected.svg": 371,
                "./icons/template-assets/growth-development--default.svg": 372,
                "./icons/template-assets/growth-development--selected.svg": 373,
                "./icons/template-assets/growth-development--unselected.svg": 374,
                "./icons/template-assets/industry-innovation-and-infrastructure--selected.svg": 375,
                "./icons/template-assets/industry-innovation-and-infrastructure--unselected.svg": 376,
                "./icons/template-assets/intellectual--selected.svg": 377,
                "./icons/template-assets/intellectual--unselected.svg": 378,
                "./icons/template-assets/learn-by-doing--default.svg": 379,
                "./icons/template-assets/learn-by-doing--selected.svg": 380,
                "./icons/template-assets/learn-by-doing--unselected.svg": 381,
                "./icons/template-assets/life-below-water--selected.svg": 382,
                "./icons/template-assets/life-below-water--unselected.svg": 383,
                "./icons/template-assets/life-on-land--selected.svg": 384,
                "./icons/template-assets/life-on-land--unselected.svg": 385,
                "./icons/template-assets/nature-and-outdoors--default.svg": 386,
                "./icons/template-assets/nature-and-outdoors--selected.svg": 387,
                "./icons/template-assets/nature-and-outdoors--unselected.svg": 388,
                "./icons/template-assets/no-poverty--selected.svg": 389,
                "./icons/template-assets/no-poverty--unselected.svg": 390,
                "./icons/template-assets/oas-alpine--selected.svg": 391,
                "./icons/template-assets/oas-alpine--unselected.svg": 392,
                "./icons/template-assets/oas-aquatics--selected.svg": 393,
                "./icons/template-assets/oas-aquatics--unselected.svg": 394,
                "./icons/template-assets/oas-boating--selected.svg": 395,
                "./icons/template-assets/oas-boating--unselected.svg": 396,
                "./icons/template-assets/oas-bushcraft--selected.svg": 397,
                "./icons/template-assets/oas-bushcraft--unselected.svg": 398,
                "./icons/template-assets/oas-bushwalking--selected.svg": 399,
                "./icons/template-assets/oas-bushwalking--unselected.svg": 400,
                "./icons/template-assets/oas-camping--selected.svg": 401,
                "./icons/template-assets/oas-camping--unselected.svg": 402,
                "./icons/template-assets/oas-cycling--selected.svg": 403,
                "./icons/template-assets/oas-cycling--unselected.svg": 404,
                "./icons/template-assets/oas-padding--unselected.svg": 405,
                "./icons/template-assets/oas-paddling--selected.svg": 406,
                "./icons/template-assets/oas-vertical--selected.svg": 407,
                "./icons/template-assets/oas-vertical--unselected.svg": 408,
                "./icons/template-assets/outdoors--default.svg": 305,
                "./icons/template-assets/outdoors--selected.svg": 409,
                "./icons/template-assets/outdoors--unselected.svg": 410,
                "./icons/template-assets/partnerships-for-the-goals--selected.svg": 411,
                "./icons/template-assets/partnerships-for-the-goals--unselected.svg": 412,
                "./icons/template-assets/patrol-system--default.svg": 413,
                "./icons/template-assets/patrol-system--selected.svg": 414,
                "./icons/template-assets/patrol-system--unselected.svg": 415,
                "./icons/template-assets/peace-justice-and-strong-institutions--selected.svg": 416,
                "./icons/template-assets/peace-justice-and-strong-institutions--unselected.svg": 417,
                "./icons/template-assets/personal-growth--default.svg": 306,
                "./icons/template-assets/personal-growth--selected.svg": 418,
                "./icons/template-assets/personal-growth--unselected.svg": 419,
                "./icons/template-assets/personal-progression--default.svg": 420,
                "./icons/template-assets/personal-progression--selected.svg": 421,
                "./icons/template-assets/personal-progression--unselected.svg": 422,
                "./icons/template-assets/physical--selected.svg": 423,
                "./icons/template-assets/physical--unselected.svg": 424,
                "./icons/template-assets/promise-and-law--default.svg": 425,
                "./icons/template-assets/promise-and-law--selected.svg": 426,
                "./icons/template-assets/promise-and-law--unselected.svg": 427,
                "./icons/template-assets/quality-education--selected.svg": 428,
                "./icons/template-assets/quality-education--unselected.svg": 429,
                "./icons/template-assets/reduced-inequalities--selected.svg": 430,
                "./icons/template-assets/reduced-inequalities--unselected.svg": 431,
                "./icons/template-assets/responsible-consumption-and-production--selected.svg": 432,
                "./icons/template-assets/responsible-consumption-and-production--unselected.svg": 433,
                "./icons/template-assets/social--selected.svg": 434,
                "./icons/template-assets/social--unselected.svg": 435,
                "./icons/template-assets/spiritual--selected.svg": 436,
                "./icons/template-assets/spiritual--unselected.svg": 437,
                "./icons/template-assets/stem-innovation--default.svg": 438,
                "./icons/template-assets/stem-innovation--selected.svg": 439,
                "./icons/template-assets/stem-innovation--unselected.svg": 440,
                "./icons/template-assets/sustainable-communities--selected.svg": 441,
                "./icons/template-assets/sustainable-communities--unselected.svg": 442,
                "./icons/template-assets/symbolic-framework--default.svg": 443,
                "./icons/template-assets/symbolic-framework--selected.svg": 444,
                "./icons/template-assets/symbolic-framework--unselected.svg": 445,
                "./icons/template-assets/youth-leading-adult-supporting--default.svg": 446,
                "./icons/template-assets/youth-leading-adult-supporting--selected.svg": 447,
                "./icons/template-assets/youth-leading-adult-supporting--unselected.svg": 448,
                "./icons/template-assets/zero-hunger--selected.svg": 449,
                "./icons/template-assets/zero-hunger--unselected.svg": 450
            };

            function o(t) {
                var e = r(t);
                return n(e)
            }

            function r(t) {
                if (!n.o(map, t)) {
                    var e = new Error("Cannot find module '" + t + "'");
                    throw e.code = "MODULE_NOT_FOUND", e
                }
                return map[t]
            }
            o.keys = function() {
                return Object.keys(map)
            }, o.resolve = r, t.exports = o, o.id = 987
        },
        992: function(t, e, n) {
            t.exports = {}
        },
        997: function(t, e, n) {
            t.exports = {}
        }
    }
]);