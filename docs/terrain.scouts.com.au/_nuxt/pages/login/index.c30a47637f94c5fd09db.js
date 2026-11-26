(window.webpackJsonp = window.webpackJsonp || []).push([
    [202, 97], {
        1140: function(t, e, o) {
            "use strict";
            o.r(e);
            var n = o(886),
                l = o(901),
                r = o(885),
                c = o(1),
                d = o(32),
                _ = c.a.extend({
                    name: "LoginHelp",
                    head: () => ({
                        script: [{
                            hid: "freshdesk",
                            src: "https://widget.freshworks.com/widgets/14000000236.js"
                        }]
                    }),
                    methods: {
                        backToSignIn: () => d.default.$emit("authState", "signIn")
                    }
                }),
                h = o(9),
                component = Object(h.a)(_, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e(l.a, [e(r.a, [e(n.a, {
                        staticClass: "mx-auto",
                        attrs: {
                            sm: "8",
                            md: "6",
                            lg: "5"
                        }
                    }, [e("div", {
                        staticClass: "LoginHelp"
                    }, [e("NavLink", {
                        staticClass: "Login__module-back-link",
                        attrs: {
                            direction: "left",
                            text: "Back to Login"
                        },
                        nativeOn: {
                            click: function(e) {
                                return t.backToSignIn()
                            },
                            keydown: function(e) {
                                return t.backToSignIn()
                            }
                        }
                    }), t._v(" "), e("AppLogo", {
                        staticClass: "Login__app-logo",
                        attrs: {
                            "show-name": ""
                        }
                    }), t._v(" "), e("h1", {
                        staticClass: "LoginModule__title"
                    }, [t._v("Can't log in?")]), t._v(" "), e("h2", {
                        staticClass: "LoginModule__subtitle"
                    }, [t._v("I'm using Scouts | Terrain for the first time")]), t._v(" "), e("p", {
                        staticClass: "LoginModule__text text-left"
                    }, [t._v("\n          Your Leader will provide you with your Membership No. and a temporary password. You will be asked to enter\n          your email address and set up a new password for future log ins.\n        ")]), t._v(" "), e("h2", {
                        staticClass: "LoginModule__subtitle"
                    }, [t._v("I can’t remember my Membership No.")]), t._v(" "), e("p", {
                        staticClass: "LoginModule__text text-left"
                    }, [t._v("\n          Contact your Leader and they can find out for you. If you had logged in to Scouts | Terrain before, we can\n          send it via email.\n        ")]), t._v(" "), e("h2", {
                        staticClass: "LoginModule__subtitle"
                    }, [t._v("I lost my temporary password")]), t._v(" "), e("p", {
                        staticClass: "LoginModule__text text-left"
                    }, [t._v("Contact your Leader and they can generate a new one for you.")]), t._v(" "), e("hr"), t._v(" "), e("p", {
                        staticClass: "LoginModule__text text-left"
                    }, [t._v("If you have any other issues please click the Help button.")]), t._v(" "), e("hr")], 1)])], 1)], 1)
                }), [], !1, null, "a132bc5a", null);
            e.default = component.exports;
            installComponents(component, {
                NavLink: o(100).default,
                AppLogo: o(80).default
            })
        },
        1278: function(t, e, o) {
            t.exports = {}
        },
        1377: function(t, e, o) {
            "use strict";
            o(1278)
        },
        1450: function(t, e, o) {
            "use strict";
            o.r(e);
            var n = o(886),
                l = o(172),
                r = o(885),
                c = o(1),
                d = o(32),
                _ = o(80),
                h = o(1140),
                f = c.a.extend({
                    name: "LoginPage",
                    components: {
                        AppLogo: _.default,
                        LoginHelp: h.default
                    },
                    layout: "login",
                    data: () => ({
                        passwordResetSuccess: !1,
                        shouldAnimate: !0,
                        email: "",
                        oneColumnLayout: !1,
                        displayModules: {
                            loginHelp: !1
                        },
                        authConfig: {
                            usernameAttributes: "Member Number",
                            signInConfig: {
                                header: "Log in",
                                isSignUpDisplayed: !1
                            }
                        }
                    }),
                    created() {
                        d.default.$on("authState", t => {
                            "signIn" === t ? (this.toggleModuleDisplay("none"), this.oneColumnLayout = !1) : "resetSuccess" === t ? this.passwordResetSuccess = !0 : "loginHelp" === t ? this.toggleModuleDisplay("loginHelp") : this.oneColumnLayout = !0
                        })
                    },
                    mounted() {
                        setTimeout(() => {
                            this.shouldAnimate = !1
                        }, 4e3)
                    },
                    methods: {
                        toggleModuleDisplay(t) {
                            Object.keys(this.displayModules).forEach(t => this.displayModules[t] = !1), "none" !== t && (this.displayModules[t] = !0), this.oneColumnLayout = !0
                        }
                    }
                }),
                m = (o(1377), o(9)),
                component = Object(m.a)(f, (function() {
                    var t = this,
                        e = t._self._c;
                    t._self._setupProxy;
                    return e("div", {
                        staticClass: "Login",
                        class: {
                            "Login--one-col-layout": t.oneColumnLayout
                        }
                    }, [e(r.a, {
                        staticClass: "Login__cols-container"
                    }, [t.oneColumnLayout ? t._e() : e(n.a, {
                        staticClass: "Login__layout-left"
                    }, [e("div", {
                        staticClass: "Login__layout-left-inner"
                    }, [e("AppLogo", {
                        staticClass: "Login__app-logo",
                        attrs: {
                            "show-name": "",
                            "text-inverted": "",
                            animate: t.shouldAnimate
                        }
                    }), t._v(" "), e("div", {
                        staticClass: "Login__strapline",
                        class: {
                            "anim-text-focus-in": t.shouldAnimate
                        }
                    }, [t._v("\n          Your personal progression and programming tool in one place.\n        ")])], 1)]), t._v(" "), t.$nuxt.isOnline ? e(n.a, {
                        staticClass: "Login__layout-right"
                    }, [t.displayModules.loginHelp ? e("LoginHelp") : t._e(), t._v(" "), e("amplify-authenticator", {
                        attrs: {
                            "auth-config": t.authConfig,
                            "password-reset-success": t.passwordResetSuccess
                        }
                    }), t._v(" "), t.oneColumnLayout ? e(l.a, {
                        staticClass: "Login__scouts-logo",
                        attrs: {
                            height: "120",
                            contain: "",
                            src: "/images/logo-scouts.svg"
                        }
                    }) : t._e()], 1) : t.$nuxt.isOffline ? e(n.a, [e(n.a, {
                        staticClass: "Login__layout-right"
                    }, [e("div", {
                        staticClass: "Login__offline-container"
                    }, [e("h2", {
                        staticClass: "Login__offline-title"
                    }, [t._v("Connection not detected.")]), t._v(" "), e("br"), t._v(" "), e("h3", {
                        staticClass: "Login__offline-subtitle"
                    }, [t._v("\n            You must be connected to the Internet to log in to Scouts | Terrain.\n          ")])])])], 1) : t._e(), t._v(" "), e("div", [t.oneColumnLayout ? t._e() : e(l.a, {
                        staticClass: "Login__scouts-logo",
                        attrs: {
                            height: "120",
                            contain: "",
                            src: "/images/logo-scouts-inverted.svg"
                        }
                    })], 1)], 1)], 1)
                }), [], !1, null, null, null);
            e.default = component.exports;
            installComponents(component, {
                AppLogo: o(80).default,
                LoginHelp: o(1140).default,
                AmplifyAuthenticator: o(463).default
            })
        }
    }
]);