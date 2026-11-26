(window.webpackJsonp = window.webpackJsonp || []).push([
    [206, 103], {
        1004: function(e, t, n) {
            "use strict";
            n(972);
            var r = n(869),
                l = n(62),
                h = n(36),
                o = n(2);
            const d = { ...r.b,
                offsetY: !0,
                offsetOverflow: !0,
                transition: !1
            };
            t.a = r.a.extend({
                name: "v-autocomplete",
                props: {
                    autoSelectFirst: {
                        type: Boolean,
                        default: !1
                    },
                    filter: {
                        type: Function,
                        default: (e, t, n) => n.toLocaleLowerCase().indexOf(t.toLocaleLowerCase()) > -1
                    },
                    hideNoData: Boolean,
                    menuProps: {
                        type: r.a.options.props.menuProps.type,
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
                        return { ...r.a.options.computed.classes.call(this),
                            "v-autocomplete": !0,
                            "v-autocomplete--is-selecting-index": this.selectedIndex > -1
                        }
                    },
                    computedItems() {
                        return this.filteredItems
                    },
                    selectedValues() {
                        return this.selectedItems.map(e => this.getValue(e))
                    },
                    hasDisplayedItems() {
                        return this.hideSelected ? this.filteredItems.some(e => !this.hasItem(e)) : this.filteredItems.length > 0
                    },
                    currentRange() {
                        return null == this.selectedItem ? 0 : String(this.getText(this.selectedItem)).length
                    },
                    filteredItems() {
                        return !this.isSearching || this.noFilter || null == this.internalSearch ? this.allItems : this.allItems.filter(e => {
                            const t = Object(o.q)(e, this.itemText),
                                text = null != t ? String(t) : "";
                            return this.filter(e, String(this.internalSearch), text)
                        })
                    },
                    internalSearch: {
                        get() {
                            return this.lazySearch
                        },
                        set(e) {
                            this.lazySearch !== e && (this.lazySearch = e, this.$emit("update:search-input", e))
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
                        const e = r.a.options.computed.$_menuProps.call(this);
                        return e.contentClass = ("v-autocomplete__content " + (e.contentClass || "")).trim(), { ...d,
                            ...e
                        }
                    },
                    searchIsDirty() {
                        return null != this.internalSearch && "" !== this.internalSearch
                    },
                    selectedItem() {
                        return this.multiple ? null : this.selectedItems.find(i => this.valueComparator(this.getValue(i), this.getValue(this.internalValue)))
                    },
                    listData() {
                        const data = r.a.options.computed.listData.call(this);
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
                    isFocused(e) {
                        e ? (document.addEventListener("copy", this.onCopy), this.$refs.input && this.$refs.input.select()) : (document.removeEventListener("copy", this.onCopy), this.blur(), this.updateSelf())
                    },
                    isMenuActive(e) {
                        !e && this.hasSlot && (this.lazySearch = null)
                    },
                    items(e, t) {
                        t && t.length || !this.hideNoData || !this.isFocused || this.isMenuActive || !e.length || this.activateMenu()
                    },
                    searchInput(e) {
                        this.lazySearch = e
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
                    onFilteredItemsChanged(e, t) {
                        if (e !== t) {
                            if (!this.autoSelectFirst) {
                                const n = t[this.$refs.menu.listIndex];
                                n ? this.setMenuIndex(e.findIndex(i => i === n)) : this.setMenuIndex(-1), this.$emit("update:list-index", this.$refs.menu.listIndex)
                            }
                            this.$nextTick(() => {
                                this.internalSearch && (1 === e.length || this.autoSelectFirst) && (this.$refs.menu.getTiles(), this.autoSelectFirst && e.length && (this.setMenuIndex(0), this.$emit("update:list-index", this.$refs.menu.listIndex)))
                            })
                        }
                    },
                    onInternalSearchChanged() {
                        this.updateMenuDimensions()
                    },
                    updateMenuDimensions() {
                        this.isMenuActive && this.$refs.menu && this.$refs.menu.updateDimensions()
                    },
                    changeSelectedIndex(e) {
                        this.searchIsDirty || (this.multiple && e === o.x.left ? -1 === this.selectedIndex ? this.selectedIndex = this.selectedItems.length - 1 : this.selectedIndex-- : this.multiple && e === o.x.right ? this.selectedIndex >= this.selectedItems.length - 1 ? this.selectedIndex = -1 : this.selectedIndex++ : e !== o.x.backspace && e !== o.x.delete || this.deleteCurrentItem())
                    },
                    deleteCurrentItem() {
                        const e = this.selectedIndex,
                            t = this.selectedItems[e];
                        if (!this.isInteractive || this.getDisabled(t)) return;
                        const n = this.selectedItems.length - 1;
                        if (-1 === this.selectedIndex && 0 !== n) return void(this.selectedIndex = n);
                        const r = e !== this.selectedItems.length - 1 ? e : e - 1;
                        this.selectedItems[r] ? this.selectItem(t) : this.setValue(this.multiple ? [] : null), this.selectedIndex = r
                    },
                    clearableCallback() {
                        this.internalSearch = null, r.a.options.methods.clearableCallback.call(this)
                    },
                    genInput() {
                        const input = l.a.options.methods.genInput.call(this);
                        return input.data = Object(h.a)(input.data, {
                            attrs: {
                                "aria-activedescendant": Object(o.o)(this.$refs.menu, "activeTile.id"),
                                autocomplete: Object(o.o)(input.data, "attrs.autocomplete", "off")
                            },
                            domProps: {
                                value: this.internalSearch
                            }
                        }), input
                    },
                    genInputSlot() {
                        const slot = r.a.options.methods.genInputSlot.call(this);
                        return slot.data.attrs.role = "combobox", slot
                    },
                    genSelections() {
                        return this.hasSlot || this.multiple ? r.a.options.methods.genSelections.call(this) : []
                    },
                    onClick(e) {
                        this.isInteractive && (this.selectedIndex > -1 ? this.selectedIndex = -1 : this.onFocus(), this.isAppendInner(e.target) || this.activateMenu())
                    },
                    onInput(e) {
                        if (this.selectedIndex > -1 || !e.target) return;
                        const t = e.target,
                            n = t.value;
                        t.value && this.activateMenu(), this.multiple || "" !== n || this.deleteCurrentItem(), this.internalSearch = n, this.badInput = t.validity && t.validity.badInput
                    },
                    onKeyDown(e) {
                        const t = e.keyCode;
                        !e.ctrlKey && [o.x.home, o.x.end].includes(t) || r.a.options.methods.onKeyDown.call(this, e), this.changeSelectedIndex(t)
                    },
                    onSpaceDown(e) {},
                    onTabDown(e) {
                        r.a.options.methods.onTabDown.call(this, e), this.updateSelf()
                    },
                    onUpDown(e) {
                        e.preventDefault(), this.activateMenu()
                    },
                    selectItem(e) {
                        r.a.options.methods.selectItem.call(this, e), this.setSearch()
                    },
                    setSelectedItems() {
                        r.a.options.methods.setSelectedItems.call(this), this.isFocused || this.setSearch()
                    },
                    setSearch() {
                        this.$nextTick(() => {
                            this.multiple && this.internalSearch && this.isMenuActive || (this.internalSearch = !this.selectedItems.length || this.multiple || this.hasSlot ? null : this.getText(this.selectedItem))
                        })
                    },
                    updateSelf() {
                        (this.searchIsDirty || this.internalValue) && (this.multiple || this.valueComparator(this.internalSearch, this.getValue(this.internalValue)) || this.setSearch())
                    },
                    hasItem(e) {
                        return this.selectedValues.indexOf(this.getValue(e)) > -1
                    },
                    onCopy(e) {
                        var t, n;
                        if (-1 === this.selectedIndex) return;
                        const r = this.selectedItems[this.selectedIndex],
                            l = this.getText(r);
                        null === (t = e.clipboardData) || void 0 === t || t.setData("text/plain", l), null === (n = e.clipboardData) || void 0 === n || n.setData("text/vnd.vuetify.autocomplete.item+plain", l), e.preventDefault()
                    }
                }
            })
        },
        1306: function(e, t, n) {
            e.exports = {}
        },
        1352: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(1004),
                l = n(870),
                h = n(62),
                o = n(11),
                d = n.n(o),
                c = n(23),
                m = n.n(c),
                I = n(40),
                f = n(4),
                M = n(152),
                S = I.z.extend({
                    name: "MemberLookup",
                    props: {
                        requestParams: {
                            type: Object,
                            required: !0
                        },
                        addLabel: {
                            type: String,
                            default: "Add another"
                        }
                    },
                    data: () => ({
                        requestPending: !1,
                        membershipNumber: "",
                        member: {},
                        branch: null,
                        branches: M.a
                    }),
                    computed: {
                        isValid() {
                            return !(!this.membershipNumber || !this.branch)
                        },
                        memberConfirmed() {
                            return !!this.member.id
                        }
                    },
                    methods: {
                        async lookupMember(e, t) {
                            this.requestPending || (this.requestPending = !0, await this.httpRequest({
                                axiosRequest: d.a.get,
                                url: `${this.$config.api.members}${f.MEMBERS_PATH}/?branch=${e}&member_number=${t}`,
                                successResponseCode: m.a.OK,
                                errorMessage: this.requestParams.errorMsg,
                                successMessage: this.requestParams.successMsg,
                                showSnackbar: !0,
                                responseHandler: e => {
                                    if (e.status === m.a.BAD_REQUEST) return !1;
                                    this.member = e.data, this.$emit("membershipNumberUpdate", this.member), this.requestPending = !1
                                },
                                errorHandler: () => {
                                    this.requestPending = !1
                                }
                            }))
                        }
                    }
                }),
                v = n(9),
                component = Object(v.a)(S, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return t("div", {
                        staticClass: "MemberLookup"
                    }, [e.memberConfirmed ? t("div", {
                        staticClass: "mt-3 mb-3"
                    }, [e._v(e._s(e.member.first_name) + " " + e._s(e.member.last_name))]) : e._e(), e._v(" "), e.memberConfirmed ? e._e() : t("div", [t(r.a, {
                        staticClass: "mt-5",
                        attrs: {
                            disabled: e.memberConfirmed,
                            items: e.branches,
                            "item-text": "name",
                            label: "Select branch"
                        },
                        model: {
                            value: e.branch,
                            callback: function(t) {
                                e.branch = t
                            },
                            expression: "branch"
                        }
                    }), e._v(" "), t(h.a, {
                        staticClass: "mb-0",
                        attrs: {
                            type: "text",
                            oninput: "this.value = this.value.replace(/[^0-9]/g, '').replace(/(\\..*)\\./g, '$1');",
                            disabled: e.memberConfirmed,
                            counter: "",
                            maxlength: "10",
                            label: "Enter membership number"
                        },
                        model: {
                            value: e.membershipNumber,
                            callback: function(t) {
                                e.membershipNumber = t
                            },
                            expression: "membershipNumber"
                        }
                    }), e._v(" "), e.memberConfirmed ? e._e() : t(l.a, {
                        attrs: {
                            outlined: "",
                            small: "",
                            disabled: !e.isValid,
                            loading: e.requestPending
                        },
                        on: {
                            keydown: function(t) {
                                return e.lookupMember(e.branch, e.membershipNumber)
                            },
                            click: function(t) {
                                return e.lookupMember(e.branch, e.membershipNumber)
                            }
                        }
                    }, [e._v("\n      Find Member\n    ")])], 1)])
                }), [], !1, null, null, null);
            t.default = component.exports
        },
        1407: function(e, t, n) {
            "use strict";
            n(1306)
        },
        1489: function(e, t, n) {
            "use strict";
            n.r(t);
            var r = n(1004),
                l = n(870),
                h = n(886),
                o = n(885),
                d = n(40),
                c = n(5),
                m = n(3),
                I = n(1352),
                f = d.n.extend({
                    name: "AddUnitMemberPage",
                    components: {
                        MemberLookup: I.default
                    },
                    data: () => ({
                        isReady: !1,
                        groupInsideMembers: [],
                        groupOutsideMembers: [],
                        groupMembersData: [],
                        LABEL: c.i,
                        MESSAGE: c.j,
                        PATH: m,
                        requestPending: !1,
                        groupOutsideMembersModel: [{}],
                        canAddAnother: !1,
                        globalDisable: !1
                    }),
                    beforeRouteLeave(e, t, n) {
                        e.params.defaultTab = 1, n()
                    },
                    async created() {
                        this.groupMembersData = await this.getGroupMembers(), this.$accessor.global.setBreadcrumbs([{
                            text: c.l.MEMBERS,
                            to: m.MEMBERS,
                            exact: !0
                        }, {
                            text: c.l.UNITS,
                            to: m.MEMBERS,
                            exact: !0
                        }, {
                            text: this.$accessor.me.getCurrentUnit.name,
                            exact: !0,
                            to: m.MEMBERS_UNITS
                        }, {
                            text: "Add Unit Member",
                            to: "",
                            disabled: !0
                        }]), this.isReady = !0
                    },
                    computed: {
                        groupMembersFullNames() {
                            if (this.groupMembersData) {
                                const e = this.groupMembersData.filter(e => this.$accessor.me.getUnitMembersData.every(t => t.id !== e.id));
                                return e.forEach(e => {
                                    e.full_name = `[${e.member_number}] ${e.first_name} ${e.last_name}`
                                }), e
                            }
                        },
                        hasSelections() {
                            return !(!this.groupInsideMembers.length && !this.groupOutsideMembers.length)
                        }
                    },
                    methods: {
                        addAnotherMemberOutsideGroup() {
                            this.groupOutsideMembersModel.push({}), this.canAddAnother = !1
                        },
                        addMemberOutsideGroup(e) {
                            this.groupOutsideMembers.push(e), this.canAddAnother = !0
                        },
                        async addAllMembers() {
                            this.globalDisable = !0;
                            const e = [...this.groupInsideMembers, ...this.groupOutsideMembers];
                            let t = "Member was ";
                            e.length > 1 && (t = "Members were "), await Promise.all(e.map(e => this.addUnitMember(this.$accessor.me.getCurrentUnit.id, e, t))), setTimeout(() => {
                                this.$router.push({
                                    path: m.MEMBERS_UNITS
                                })
                            }, 3e3), this.globalDisable = !0
                        }
                    }
                }),
                M = (n(1407), n(9)),
                component = Object(M.a)(f, (function() {
                    var e = this,
                        t = e._self._c;
                    e._self._setupProxy;
                    return e.isReady ? t("div", {
                        staticClass: "AddUnitMember"
                    }, [t(o.a, {
                        attrs: {
                            "no-gutters": ""
                        }
                    }, [t(h.a, [t("h1", {
                        staticClass: "AddUnitMember__title"
                    }, [e._v("Add Unit Member")]), e._v(" "), t("h2", {
                        staticClass: "AddUnitMember__subtitle"
                    }, [e._v("Select members inside your group")]), e._v(" "), t(r.a, {
                        staticClass: "mt-8",
                        attrs: {
                            items: e.groupMembersFullNames,
                            "item-text": "full_name",
                            label: "Select members",
                            "deletable-chips": "",
                            "return-object": "",
                            multiple: "",
                            chips: "",
                            "persistent-hint": ""
                        },
                        model: {
                            value: e.groupInsideMembers,
                            callback: function(t) {
                                e.groupInsideMembers = t
                            },
                            expression: "groupInsideMembers"
                        }
                    }, [t("template", {
                        slot: "no-data"
                    }, [t("div", {
                        staticClass: "py-1 px-2"
                    }, [e._v("No members available to add to Unit.")])])], 2), e._v(" "), t("h2", {
                        staticClass: "AddUnitMember__subtitle"
                    }, [e._v("Select members outside your Group")]), e._v(" "), e._l(e.groupOutsideMembersModel, (function(n, r) {
                        return [t("MemberLookup", {
                            key: r,
                            attrs: {
                                "request-params": {
                                    errorMsg: e.MESSAGE.MEMBER_NOT_FOUND,
                                    successMsg: e.MESSAGE.MEMBER_FOUND
                                }
                            },
                            on: {
                                membershipNumberUpdate: function(t) {
                                    return e.addMemberOutsideGroup(t)
                                }
                            }
                        })]
                    })), e._v(" "), e.canAddAnother ? t(l.a, {
                        staticClass: "mr-4 mt-5",
                        attrs: {
                            disabled: e.globalDisable,
                            outlined: "",
                            small: ""
                        },
                        on: {
                            click: e.addAnotherMemberOutsideGroup,
                            keydown: e.addAnotherMemberOutsideGroup
                        }
                    }, [e._v("\n        " + e._s(e.LABEL.ADD_ANOTHER) + "\n      ")]) : e._e(), e._v(" "), t("hr", {
                        staticClass: "mt-12"
                    }), e._v(" "), t("div", {
                        staticClass: "d-flex justify-end flex-column flex-sm-row"
                    }, [t("nuxt-link", {
                        attrs: {
                            to: e.PATH.MEMBERS_UNITS
                        }
                    }, [t(l.a, {
                        staticClass: "mb-4 mr-4",
                        attrs: {
                            disabled: e.globalDisable,
                            block: e.$vuetify.breakpoint.xs,
                            outlined: "",
                            small: ""
                        }
                    }, [e._v("\n            " + e._s(e.LABEL.CANCEL) + "\n          ")])], 1), e._v(" "), t(l.a, {
                        staticClass: "float-right",
                        attrs: {
                            disabled: !e.hasSelections || e.globalDisable,
                            loading: e.requestPending,
                            block: e.$vuetify.breakpoint.xs,
                            small: ""
                        },
                        on: {
                            click: function(t) {
                                return e.addAllMembers()
                            }
                        }
                    }, [e._v("\n          " + e._s(e.LABEL.ADD) + "\n        ")])], 1)], 2)], 1)], 1) : e._e()
                }), [], !1, null, "ae725434", null);
            t.default = component.exports
        },
        972: function(e, t, n) {
            e.exports = {}
        }
    }
]);