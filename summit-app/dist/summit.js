/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/mini-css-extract-plugin/dist/loader.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/MyComponent.vue?vue&type=style&index=0&id=e855639e&scoped=true&lang=css":
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/MyComponent.vue?vue&type=style&index=0&id=e855639e&scoped=true&lang=css ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/modules/summitModule.ts":
/*!*************************************!*\
  !*** ./src/modules/summitModule.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const Summit = {
    namespaced: true,
    state: {
        message: "Bob",
    },
    mutations: {
        updateMessage(state, newMessage) {
            console.log("updateMessage in Summit module", newMessage);
            state.message = newMessage;
        },
    },
    actions: {
        setMessage({ commit }, message) {
            console.log("setMessage in Summit module:", message);
            commit("updateMessage", message);
        },
    },
    getters: {
        getMessage(state) {
            console.log("getMessage in Summit module:", state.message);
            return state.message;
        },
    },
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Summit);


/***/ }),

/***/ "./src/components/MyComponent.vue":
/*!****************************************!*\
  !*** ./src/components/MyComponent.vue ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _MyComponent_vue_vue_type_template_id_e855639e_scoped_true__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./MyComponent.vue?vue&type=template&id=e855639e&scoped=true */ "./src/components/MyComponent.vue?vue&type=template&id=e855639e&scoped=true");
/* harmony import */ var _MyComponent_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./MyComponent.vue?vue&type=script&lang=js */ "./src/components/MyComponent.vue?vue&type=script&lang=js");
/* harmony import */ var _MyComponent_vue_vue_type_style_index_0_id_e855639e_scoped_true_lang_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./MyComponent.vue?vue&type=style&index=0&id=e855639e&scoped=true&lang=css */ "./src/components/MyComponent.vue?vue&type=style&index=0&id=e855639e&scoped=true&lang=css");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");



;


/* normalize component */

var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _MyComponent_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_1__["default"],
  _MyComponent_vue_vue_type_template_id_e855639e_scoped_true__WEBPACK_IMPORTED_MODULE_0__.render,
  _MyComponent_vue_vue_type_template_id_e855639e_scoped_true__WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  "e855639e",
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/components/MyComponent.vue"
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (component.exports);

/***/ }),

/***/ "./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/MyComponent.vue?vue&type=script&lang=js":
/*!***************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/MyComponent.vue?vue&type=script&lang=js ***!
  \***************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  data() {
    return {
      // Local data property to store the message
      localMessage: "Initial Value",
    };
  },
  computed: {
    // Computed property to get the message from Vuex
    computedMessage() {
      return this.$store.getters["Summit/getMessage"];
    },
  },
  watch: {
    // Watch for changes in Vuex state
    "$store.state.Summit.message": function (newVal) {
      this.localMessage = newVal;
    },
  },
  mounted() {
    // Initialize local message from Vuex store
    this.localMessage = this.$store.state.Summit.message;
  },
  // Include other methods as needed...
});


/***/ }),

/***/ "./src/components/MyComponent.vue?vue&type=style&index=0&id=e855639e&scoped=true&lang=css":
/*!************************************************************************************************!*\
  !*** ./src/components/MyComponent.vue?vue&type=style&index=0&id=e855639e&scoped=true&lang=css ***!
  \************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_mini_css_extract_plugin_dist_loader_js_node_modules_css_loader_dist_cjs_js_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_vue_loader_lib_index_js_vue_loader_options_MyComponent_vue_vue_type_style_index_0_id_e855639e_scoped_true_lang_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../node_modules/mini-css-extract-plugin/dist/loader.js!../../node_modules/css-loader/dist/cjs.js!../../node_modules/vue-loader/lib/loaders/stylePostLoader.js!../../node_modules/vue-loader/lib/index.js??vue-loader-options!./MyComponent.vue?vue&type=style&index=0&id=e855639e&scoped=true&lang=css */ "./node_modules/mini-css-extract-plugin/dist/loader.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/MyComponent.vue?vue&type=style&index=0&id=e855639e&scoped=true&lang=css");


/***/ }),

/***/ "./src/components/MyComponent.vue?vue&type=script&lang=js":
/*!****************************************************************!*\
  !*** ./src/components/MyComponent.vue?vue&type=script&lang=js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_index_js_vue_loader_options_MyComponent_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../node_modules/vue-loader/lib/index.js??vue-loader-options!./MyComponent.vue?vue&type=script&lang=js */ "./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/MyComponent.vue?vue&type=script&lang=js");
 /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_vue_loader_lib_index_js_vue_loader_options_MyComponent_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_0__["default"]); 

/***/ }),

/***/ "./src/components/MyComponent.vue?vue&type=template&id=e855639e&scoped=true":
/*!**********************************************************************************!*\
  !*** ./src/components/MyComponent.vue?vue&type=template&id=e855639e&scoped=true ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   render: () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_ruleSet_1_rules_2_node_modules_vue_loader_lib_index_js_vue_loader_options_MyComponent_vue_vue_type_template_id_e855639e_scoped_true__WEBPACK_IMPORTED_MODULE_0__.render),
/* harmony export */   staticRenderFns: () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_ruleSet_1_rules_2_node_modules_vue_loader_lib_index_js_vue_loader_options_MyComponent_vue_vue_type_template_id_e855639e_scoped_true__WEBPACK_IMPORTED_MODULE_0__.staticRenderFns)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_ruleSet_1_rules_2_node_modules_vue_loader_lib_index_js_vue_loader_options_MyComponent_vue_vue_type_template_id_e855639e_scoped_true__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!../../node_modules/vue-loader/lib/index.js??vue-loader-options!./MyComponent.vue?vue&type=template&id=e855639e&scoped=true */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/MyComponent.vue?vue&type=template&id=e855639e&scoped=true");


/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/MyComponent.vue?vue&type=template&id=e855639e&scoped=true":
/*!**************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/MyComponent.vue?vue&type=template&id=e855639e&scoped=true ***!
  \**************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   render: () => (/* binding */ render),
/* harmony export */   staticRenderFns: () => (/* binding */ staticRenderFns)
/* harmony export */ });
var render = function render(){var _vm=this,_c=_vm._self._c;return _c('div',[_c('div',[_vm._v("Component Awesome")]),_vm._v(" "),_c('div',[_vm._v("\n    "+_vm._s(_vm.localMessage)+"\n    ")])])
}
var staticRenderFns = []
render._withStripped = true


/***/ }),

/***/ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js":
/*!********************************************************************!*\
  !*** ./node_modules/vue-loader/lib/runtime/componentNormalizer.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ normalizeComponent)
/* harmony export */ });
/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

function normalizeComponent(
  scriptExports,
  render,
  staticRenderFns,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier /* server only */,
  shadowMode /* vue-cli only */
) {
  // Vue.extend constructor export interop
  var options =
    typeof scriptExports === 'function' ? scriptExports.options : scriptExports

  // render functions
  if (render) {
    options.render = render
    options.staticRenderFns = staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = 'data-v-' + scopeId
  }

  var hook
  if (moduleIdentifier) {
    // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = shadowMode
      ? function () {
          injectStyles.call(
            this,
            (options.functional ? this.parent : this).$root.$options.shadowRoot
          )
        }
      : injectStyles
  }

  if (hook) {
    if (options.functional) {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functional component in vue file
      var originalRender = options.render
      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context)
        return originalRender(h, context)
      }
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook]
    }
  }

  return {
    exports: scriptExports,
    options: options
  }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _components_MyComponent_vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/MyComponent.vue */ "./src/components/MyComponent.vue");
/* harmony import */ var _modules_summitModule__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./modules/summitModule */ "./src/modules/summitModule.ts");


window.$nuxt.$store.registerModule("Summit", _modules_summitModule__WEBPACK_IMPORTED_MODULE_1__["default"]);
setTimeout(() => {
    window.$nuxt.$store.dispatch("Summit/setMessage", "Hello World");
}, 2000);
const router = window.$nuxt.$router;
router.addRoute({ path: "/my-new-component", component: _components_MyComponent_vue__WEBPACK_IMPORTED_MODULE_0__["default"] });
router.push("/my-new-component");
setTimeout(() => {
    window.$nuxt.$store.dispatch("Summit/setMessage", "Hello World 2");
}, 4000);

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7OztBQ051RDtBQUNMO0FBRWxELE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsNkRBQVksQ0FBQyxDQUFDO0FBRzNELFVBQVUsQ0FBQyxHQUFHLEVBQUU7SUFDZCxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDbkUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBRVQsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7QUFDcEMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBRSxTQUFTLEVBQUUsbUVBQVcsRUFBRSxDQUFDLENBQUM7QUFDdkUsTUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBRWpDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7SUFDZCxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFDckUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdGVycmFpbi1zdW1taXQtdnVlLy4vc3JjL2NvbXBvbmVudHMvTXlDb21wb25lbnQudnVlPzdlMGYiLCJ3ZWJwYWNrOi8vdGVycmFpbi1zdW1taXQtdnVlLy4vc3JjL21vZHVsZXMvc3VtbWl0TW9kdWxlLnRzIiwid2VicGFjazovL3RlcnJhaW4tc3VtbWl0LXZ1ZS8uL3NyYy9jb21wb25lbnRzL015Q29tcG9uZW50LnZ1ZT8xMTY0Iiwid2VicGFjazovL3RlcnJhaW4tc3VtbWl0LXZ1ZS9zcmMvY29tcG9uZW50cy9NeUNvbXBvbmVudC52dWUiLCJ3ZWJwYWNrOi8vdGVycmFpbi1zdW1taXQtdnVlLy4vc3JjL2NvbXBvbmVudHMvTXlDb21wb25lbnQudnVlPzBiZWIiLCJ3ZWJwYWNrOi8vdGVycmFpbi1zdW1taXQtdnVlLy4vc3JjL2NvbXBvbmVudHMvTXlDb21wb25lbnQudnVlPzY5ODciLCJ3ZWJwYWNrOi8vdGVycmFpbi1zdW1taXQtdnVlLy4vc3JjL2NvbXBvbmVudHMvTXlDb21wb25lbnQudnVlPzg4OGQiLCJ3ZWJwYWNrOi8vdGVycmFpbi1zdW1taXQtdnVlLy4vc3JjL2NvbXBvbmVudHMvTXlDb21wb25lbnQudnVlPzM2OTQiLCJ3ZWJwYWNrOi8vdGVycmFpbi1zdW1taXQtdnVlLy4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL3J1bnRpbWUvY29tcG9uZW50Tm9ybWFsaXplci5qcyIsIndlYnBhY2s6Ly90ZXJyYWluLXN1bW1pdC12dWUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vdGVycmFpbi1zdW1taXQtdnVlL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly90ZXJyYWluLXN1bW1pdC12dWUvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly90ZXJyYWluLXN1bW1pdC12dWUvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly90ZXJyYWluLXN1bW1pdC12dWUvLi9zcmMvbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBleHRyYWN0ZWQgYnkgbWluaS1jc3MtZXh0cmFjdC1wbHVnaW5cbmV4cG9ydCB7fTsiLCIvKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55ICovXHJcbi8vIGltcG9ydCB7IE1vZHVsZSwgVnVleE1vZHVsZSwgTXV0YXRpb24sIEFjdGlvbiwgZ2V0TW9kdWxlIH0gZnJvbSBcInZ1ZXgtbW9kdWxlLWRlY29yYXRvcnNcIjtcclxuXHJcbi8vIEBNb2R1bGUoeyBuYW1lOiBcIlN1bW1pdFwiLCBuYW1lc3BhY2VkOiB0cnVlLCBkeW5hbWljOiB0cnVlLCBzdG9yZTogd2luZG93LiRudXh0LiRzdG9yZSB9KVxyXG4vLyBjbGFzcyBTdW1taXQgZXh0ZW5kcyBWdWV4TW9kdWxlIHtcclxuLy8gICBwdWJsaWMgbWVzc2FnZSA9IFwiQm9iXCI7XHJcblxyXG4vLyAgIEBNdXRhdGlvblxyXG4vLyAgIHB1YmxpYyB1cGRhdGVNZXNzYWdlKG5ld01lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xyXG4vLyAgICAgY29uc29sZS5sb2coXCJ1cGRhdGVNZXNzYWdlIGluIFN1bW1pdCBtb2R1bGVcIiArIG5ld01lc3NhZ2UpO1xyXG4vLyAgICAgdGhpcy5tZXNzYWdlID0gbmV3TWVzc2FnZTtcclxuLy8gICB9XHJcblxyXG4vLyAgIEBBY3Rpb25cclxuLy8gICBwdWJsaWMgc2V0TWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcclxuLy8gICAgIGNvbnNvbGUubG9nKFwic2V0TWVzc2FnZSBpbiBTdW1taXQgbW9kdWxlOiBcIiArIG1lc3NhZ2UpO1xyXG4vLyAgICAgdGhpcy51cGRhdGVNZXNzYWdlKG1lc3NhZ2UpO1xyXG4vLyAgIH1cclxuXHJcbi8vICAgZ2V0IGdldE1lc3NhZ2UoKTogc3RyaW5nIHtcclxuLy8gICAgIGNvbnNvbGUubG9nKFwiZ2V0TWVzc2FnZSBpbiBTdW1taXQgbW9kdWxlOiBcIiArIHRoaXMubWVzc2FnZSk7XHJcbi8vICAgICByZXR1cm4gdGhpcy5tZXNzYWdlO1xyXG4vLyAgIH1cclxuLy8gfVxyXG5cclxuLy8gZXhwb3J0IGNvbnN0IHN1bW1pdE1vZHVsZSA9IGdldE1vZHVsZShTdW1taXQsIHdpbmRvdy4kbnV4dC4kc3RvcmUpO1xyXG5cclxuLy8gZXhwb3J0IGRlZmF1bHQgU3VtbWl0O1xyXG5cclxuY29uc3QgU3VtbWl0ID0ge1xyXG4gIG5hbWVzcGFjZWQ6IHRydWUsXHJcbiAgc3RhdGU6IHtcclxuICAgIC8vIEluaXRpYWwgc3RhdGVcclxuICAgIG1lc3NhZ2U6IFwiQm9iXCIsXHJcbiAgfSxcclxuICBtdXRhdGlvbnM6IHtcclxuICAgIC8vIE11dGF0aW9uIHRvIHVwZGF0ZSB0aGUgc3RhdGVcclxuICAgIHVwZGF0ZU1lc3NhZ2Uoc3RhdGU6IHsgbWVzc2FnZTogYW55IH0sIG5ld01lc3NhZ2U6IGFueSkge1xyXG4gICAgICBjb25zb2xlLmxvZyhcInVwZGF0ZU1lc3NhZ2UgaW4gU3VtbWl0IG1vZHVsZVwiLCBuZXdNZXNzYWdlKTtcclxuICAgICAgc3RhdGUubWVzc2FnZSA9IG5ld01lc3NhZ2U7XHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgYWN0aW9uczoge1xyXG4gICAgLy8gQWN0aW9uIHRvIGNvbW1pdCB0aGUgbXV0YXRpb25cclxuICAgIHNldE1lc3NhZ2UoeyBjb21taXQgfTogYW55LCBtZXNzYWdlOiBhbnkpIHtcclxuICAgICAgY29uc29sZS5sb2coXCJzZXRNZXNzYWdlIGluIFN1bW1pdCBtb2R1bGU6XCIsIG1lc3NhZ2UpO1xyXG4gICAgICBjb21taXQoXCJ1cGRhdGVNZXNzYWdlXCIsIG1lc3NhZ2UpO1xyXG4gICAgfSxcclxuICB9LFxyXG4gIGdldHRlcnM6IHtcclxuICAgIC8vIEdldHRlciB0byBhY2Nlc3MgdGhlIHN0YXRlXHJcbiAgICBnZXRNZXNzYWdlKHN0YXRlOiB7IG1lc3NhZ2U6IGFueSB9KSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiZ2V0TWVzc2FnZSBpbiBTdW1taXQgbW9kdWxlOlwiLCBzdGF0ZS5tZXNzYWdlKTtcclxuICAgICAgcmV0dXJuIHN0YXRlLm1lc3NhZ2U7XHJcbiAgICB9LFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTdW1taXQ7XHJcbiIsImltcG9ydCB7IHJlbmRlciwgc3RhdGljUmVuZGVyRm5zIH0gZnJvbSBcIi4vTXlDb21wb25lbnQudnVlP3Z1ZSZ0eXBlPXRlbXBsYXRlJmlkPWU4NTU2MzllJnNjb3BlZD10cnVlXCJcbmltcG9ydCBzY3JpcHQgZnJvbSBcIi4vTXlDb21wb25lbnQudnVlP3Z1ZSZ0eXBlPXNjcmlwdCZsYW5nPWpzXCJcbmV4cG9ydCAqIGZyb20gXCIuL015Q29tcG9uZW50LnZ1ZT92dWUmdHlwZT1zY3JpcHQmbGFuZz1qc1wiXG5pbXBvcnQgc3R5bGUwIGZyb20gXCIuL015Q29tcG9uZW50LnZ1ZT92dWUmdHlwZT1zdHlsZSZpbmRleD0wJmlkPWU4NTU2MzllJnNjb3BlZD10cnVlJmxhbmc9Y3NzXCJcblxuXG4vKiBub3JtYWxpemUgY29tcG9uZW50ICovXG5pbXBvcnQgbm9ybWFsaXplciBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9ydW50aW1lL2NvbXBvbmVudE5vcm1hbGl6ZXIuanNcIlxudmFyIGNvbXBvbmVudCA9IG5vcm1hbGl6ZXIoXG4gIHNjcmlwdCxcbiAgcmVuZGVyLFxuICBzdGF0aWNSZW5kZXJGbnMsXG4gIGZhbHNlLFxuICBudWxsLFxuICBcImU4NTU2MzllXCIsXG4gIG51bGxcbiAgXG4pXG5cbi8qIGhvdCByZWxvYWQgKi9cbmlmIChtb2R1bGUuaG90KSB7XG4gIHZhciBhcGkgPSByZXF1aXJlKFwiQzpcXFxcVXNlcnNcXFxccGV0ZXJcXFxcUmVwb3NcXFxcU3VtbWl0XFxcXHN1bW1pdC1hcHBcXFxcbm9kZV9tb2R1bGVzXFxcXHZ1ZS1ob3QtcmVsb2FkLWFwaVxcXFxkaXN0XFxcXGluZGV4LmpzXCIpXG4gIGFwaS5pbnN0YWxsKHJlcXVpcmUoJ3Z1ZScpKVxuICBpZiAoYXBpLmNvbXBhdGlibGUpIHtcbiAgICBtb2R1bGUuaG90LmFjY2VwdCgpXG4gICAgaWYgKCFhcGkuaXNSZWNvcmRlZCgnZTg1NTYzOWUnKSkge1xuICAgICAgYXBpLmNyZWF0ZVJlY29yZCgnZTg1NTYzOWUnLCBjb21wb25lbnQub3B0aW9ucylcbiAgICB9IGVsc2Uge1xuICAgICAgYXBpLnJlbG9hZCgnZTg1NTYzOWUnLCBjb21wb25lbnQub3B0aW9ucylcbiAgICB9XG4gICAgbW9kdWxlLmhvdC5hY2NlcHQoXCIuL015Q29tcG9uZW50LnZ1ZT92dWUmdHlwZT10ZW1wbGF0ZSZpZD1lODU1NjM5ZSZzY29wZWQ9dHJ1ZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICBhcGkucmVyZW5kZXIoJ2U4NTU2MzllJywge1xuICAgICAgICByZW5kZXI6IHJlbmRlcixcbiAgICAgICAgc3RhdGljUmVuZGVyRm5zOiBzdGF0aWNSZW5kZXJGbnNcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxufVxuY29tcG9uZW50Lm9wdGlvbnMuX19maWxlID0gXCJzcmMvY29tcG9uZW50cy9NeUNvbXBvbmVudC52dWVcIlxuZXhwb3J0IGRlZmF1bHQgY29tcG9uZW50LmV4cG9ydHMiLCI8IS0tIDx0ZW1wbGF0ZT5cclxuICA8ZGl2PlxyXG4gICAgPGRpdj5Db21wb25lbnQgQXdlc29tZTwvZGl2PlxyXG4gICAgPGRpdj5cclxuICAgICAge3sgbWVzc2FnZSB9fVxyXG4gICAgPC9kaXY+XHJcbiAgPC9kaXY+XHJcbjwvdGVtcGxhdGU+XHJcblxyXG48c2NyaXB0IGxhbmc9XCJ0c1wiPlxyXG5pbXBvcnQgeyBWdWUsIENvbXBvbmVudCB9IGZyb20gXCJ2dWUtcHJvcGVydHktZGVjb3JhdG9yXCI7XHJcblxyXG5AQ29tcG9uZW50XHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE15Q29tcG9uZW50IGV4dGVuZHMgVnVlIHtcclxuICBnZXQgbWVzc2FnZSgpIHtcclxuICAgIGNvbnNvbGUubG9nKFwiZ2V0dGluZyBtZXNzYWdlOiBcIiArIHRoaXMpO1xyXG4gICAgcmV0dXJuIHdpbmRvdy4kbnV4dC4kc3RvcmUuc3RhdGUuU3VtbWl0Lm1lc3NhZ2U7XHJcbiAgfVxyXG4gIHVwZGF0ZU1lc3NhZ2UobmV3TWVzc2FnZTogc3RyaW5nKSB7XHJcbiAgICAvLyBDb21taXQgYSBtdXRhdGlvbiB0byB1cGRhdGUgdGhlIG1lc3NhZ2UgaW4gdGhlIHN0b3JlXHJcbiAgICB3aW5kb3cuJG51eHQuJHN0b3JlLmNvbW1pdChcIlN1bW1pdC91cGRhdGVNZXNzYWdlXCIsIG5ld01lc3NhZ2UpO1xyXG4gIH1cclxufVxyXG48L3NjcmlwdD5cclxuXHJcbjxzdHlsZSBzY29wZWQ+XHJcbi8qIFlvdXIgY29tcG9uZW50LXNwZWNpZmljIHN0eWxlcyBoZXJlICovXHJcbjwvc3R5bGU+IC0tPlxyXG5cclxuPHRlbXBsYXRlPlxyXG4gIDxkaXY+XHJcbiAgICA8ZGl2PkNvbXBvbmVudCBBd2Vzb21lPC9kaXY+XHJcbiAgICA8ZGl2PlxyXG4gICAgICB7eyBsb2NhbE1lc3NhZ2UgfX1cclxuICAgICAgPCEtLSBEaXNwbGF5IHRoZSBsb2NhbCBtZXNzYWdlIC0tPlxyXG4gICAgPC9kaXY+XHJcbiAgPC9kaXY+XHJcbjwvdGVtcGxhdGU+XHJcblxyXG48c2NyaXB0PlxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgZGF0YSgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIC8vIExvY2FsIGRhdGEgcHJvcGVydHkgdG8gc3RvcmUgdGhlIG1lc3NhZ2VcclxuICAgICAgbG9jYWxNZXNzYWdlOiBcIkluaXRpYWwgVmFsdWVcIixcclxuICAgIH07XHJcbiAgfSxcclxuICBjb21wdXRlZDoge1xyXG4gICAgLy8gQ29tcHV0ZWQgcHJvcGVydHkgdG8gZ2V0IHRoZSBtZXNzYWdlIGZyb20gVnVleFxyXG4gICAgY29tcHV0ZWRNZXNzYWdlKCkge1xyXG4gICAgICByZXR1cm4gdGhpcy4kc3RvcmUuZ2V0dGVyc1tcIlN1bW1pdC9nZXRNZXNzYWdlXCJdO1xyXG4gICAgfSxcclxuICB9LFxyXG4gIHdhdGNoOiB7XHJcbiAgICAvLyBXYXRjaCBmb3IgY2hhbmdlcyBpbiBWdWV4IHN0YXRlXHJcbiAgICBcIiRzdG9yZS5zdGF0ZS5TdW1taXQubWVzc2FnZVwiOiBmdW5jdGlvbiAobmV3VmFsKSB7XHJcbiAgICAgIHRoaXMubG9jYWxNZXNzYWdlID0gbmV3VmFsO1xyXG4gICAgfSxcclxuICB9LFxyXG4gIG1vdW50ZWQoKSB7XHJcbiAgICAvLyBJbml0aWFsaXplIGxvY2FsIG1lc3NhZ2UgZnJvbSBWdWV4IHN0b3JlXHJcbiAgICB0aGlzLmxvY2FsTWVzc2FnZSA9IHRoaXMuJHN0b3JlLnN0YXRlLlN1bW1pdC5tZXNzYWdlO1xyXG4gIH0sXHJcbiAgLy8gSW5jbHVkZSBvdGhlciBtZXRob2RzIGFzIG5lZWRlZC4uLlxyXG59O1xyXG48L3NjcmlwdD5cclxuXHJcbjxzdHlsZSBzY29wZWQ+XHJcbi8qIFlvdXIgY29tcG9uZW50LXNwZWNpZmljIHN0eWxlcyBoZXJlICovXHJcbjwvc3R5bGU+XHJcbiIsImV4cG9ydCAqIGZyb20gXCItIS4uLy4uL25vZGVfbW9kdWxlcy9taW5pLWNzcy1leHRyYWN0LXBsdWdpbi9kaXN0L2xvYWRlci5qcyEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvbG9hZGVycy9zdHlsZVBvc3RMb2FkZXIuanMhLi4vLi4vbm9kZV9tb2R1bGVzL3Z1ZS1sb2FkZXIvbGliL2luZGV4LmpzPz92dWUtbG9hZGVyLW9wdGlvbnMhLi9NeUNvbXBvbmVudC52dWU/dnVlJnR5cGU9c3R5bGUmaW5kZXg9MCZpZD1lODU1NjM5ZSZzY29wZWQ9dHJ1ZSZsYW5nPWNzc1wiIiwiaW1wb3J0IG1vZCBmcm9tIFwiLSEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvaW5kZXguanM/P3Z1ZS1sb2FkZXItb3B0aW9ucyEuL015Q29tcG9uZW50LnZ1ZT92dWUmdHlwZT1zY3JpcHQmbGFuZz1qc1wiOyBleHBvcnQgZGVmYXVsdCBtb2Q7IGV4cG9ydCAqIGZyb20gXCItIS4uLy4uL25vZGVfbW9kdWxlcy92dWUtbG9hZGVyL2xpYi9pbmRleC5qcz8/dnVlLWxvYWRlci1vcHRpb25zIS4vTXlDb21wb25lbnQudnVlP3Z1ZSZ0eXBlPXNjcmlwdCZsYW5nPWpzXCIiLCJleHBvcnQgKiBmcm9tIFwiLSEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvbG9hZGVycy90ZW1wbGF0ZUxvYWRlci5qcz8/cnVsZVNldFsxXS5ydWxlc1syXSEuLi8uLi9ub2RlX21vZHVsZXMvdnVlLWxvYWRlci9saWIvaW5kZXguanM/P3Z1ZS1sb2FkZXItb3B0aW9ucyEuL015Q29tcG9uZW50LnZ1ZT92dWUmdHlwZT10ZW1wbGF0ZSZpZD1lODU1NjM5ZSZzY29wZWQ9dHJ1ZVwiIiwidmFyIHJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpe3ZhciBfdm09dGhpcyxfYz1fdm0uX3NlbGYuX2M7cmV0dXJuIF9jKCdkaXYnLFtfYygnZGl2JyxbX3ZtLl92KFwiQ29tcG9uZW50IEF3ZXNvbWVcIildKSxfdm0uX3YoXCIgXCIpLF9jKCdkaXYnLFtfdm0uX3YoXCJcXG4gICAgXCIrX3ZtLl9zKF92bS5sb2NhbE1lc3NhZ2UpK1wiXFxuICAgIFwiKV0pXSlcbn1cbnZhciBzdGF0aWNSZW5kZXJGbnMgPSBbXVxucmVuZGVyLl93aXRoU3RyaXBwZWQgPSB0cnVlXG5leHBvcnQgeyByZW5kZXIsIHN0YXRpY1JlbmRlckZucyB9IiwiLyogZ2xvYmFscyBfX1ZVRV9TU1JfQ09OVEVYVF9fICovXG5cbi8vIElNUE9SVEFOVDogRG8gTk9UIHVzZSBFUzIwMTUgZmVhdHVyZXMgaW4gdGhpcyBmaWxlIChleGNlcHQgZm9yIG1vZHVsZXMpLlxuLy8gVGhpcyBtb2R1bGUgaXMgYSBydW50aW1lIHV0aWxpdHkgZm9yIGNsZWFuZXIgY29tcG9uZW50IG1vZHVsZSBvdXRwdXQgYW5kIHdpbGxcbi8vIGJlIGluY2x1ZGVkIGluIHRoZSBmaW5hbCB3ZWJwYWNrIHVzZXIgYnVuZGxlLlxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBub3JtYWxpemVDb21wb25lbnQoXG4gIHNjcmlwdEV4cG9ydHMsXG4gIHJlbmRlcixcbiAgc3RhdGljUmVuZGVyRm5zLFxuICBmdW5jdGlvbmFsVGVtcGxhdGUsXG4gIGluamVjdFN0eWxlcyxcbiAgc2NvcGVJZCxcbiAgbW9kdWxlSWRlbnRpZmllciAvKiBzZXJ2ZXIgb25seSAqLyxcbiAgc2hhZG93TW9kZSAvKiB2dWUtY2xpIG9ubHkgKi9cbikge1xuICAvLyBWdWUuZXh0ZW5kIGNvbnN0cnVjdG9yIGV4cG9ydCBpbnRlcm9wXG4gIHZhciBvcHRpb25zID1cbiAgICB0eXBlb2Ygc2NyaXB0RXhwb3J0cyA9PT0gJ2Z1bmN0aW9uJyA/IHNjcmlwdEV4cG9ydHMub3B0aW9ucyA6IHNjcmlwdEV4cG9ydHNcblxuICAvLyByZW5kZXIgZnVuY3Rpb25zXG4gIGlmIChyZW5kZXIpIHtcbiAgICBvcHRpb25zLnJlbmRlciA9IHJlbmRlclxuICAgIG9wdGlvbnMuc3RhdGljUmVuZGVyRm5zID0gc3RhdGljUmVuZGVyRm5zXG4gICAgb3B0aW9ucy5fY29tcGlsZWQgPSB0cnVlXG4gIH1cblxuICAvLyBmdW5jdGlvbmFsIHRlbXBsYXRlXG4gIGlmIChmdW5jdGlvbmFsVGVtcGxhdGUpIHtcbiAgICBvcHRpb25zLmZ1bmN0aW9uYWwgPSB0cnVlXG4gIH1cblxuICAvLyBzY29wZWRJZFxuICBpZiAoc2NvcGVJZCkge1xuICAgIG9wdGlvbnMuX3Njb3BlSWQgPSAnZGF0YS12LScgKyBzY29wZUlkXG4gIH1cblxuICB2YXIgaG9va1xuICBpZiAobW9kdWxlSWRlbnRpZmllcikge1xuICAgIC8vIHNlcnZlciBidWlsZFxuICAgIGhvb2sgPSBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgICAgLy8gMi4zIGluamVjdGlvblxuICAgICAgY29udGV4dCA9XG4gICAgICAgIGNvbnRleHQgfHwgLy8gY2FjaGVkIGNhbGxcbiAgICAgICAgKHRoaXMuJHZub2RlICYmIHRoaXMuJHZub2RlLnNzckNvbnRleHQpIHx8IC8vIHN0YXRlZnVsXG4gICAgICAgICh0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC4kdm5vZGUgJiYgdGhpcy5wYXJlbnQuJHZub2RlLnNzckNvbnRleHQpIC8vIGZ1bmN0aW9uYWxcbiAgICAgIC8vIDIuMiB3aXRoIHJ1bkluTmV3Q29udGV4dDogdHJ1ZVxuICAgICAgaWYgKCFjb250ZXh0ICYmIHR5cGVvZiBfX1ZVRV9TU1JfQ09OVEVYVF9fICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjb250ZXh0ID0gX19WVUVfU1NSX0NPTlRFWFRfX1xuICAgICAgfVxuICAgICAgLy8gaW5qZWN0IGNvbXBvbmVudCBzdHlsZXNcbiAgICAgIGlmIChpbmplY3RTdHlsZXMpIHtcbiAgICAgICAgaW5qZWN0U3R5bGVzLmNhbGwodGhpcywgY29udGV4dClcbiAgICAgIH1cbiAgICAgIC8vIHJlZ2lzdGVyIGNvbXBvbmVudCBtb2R1bGUgaWRlbnRpZmllciBmb3IgYXN5bmMgY2h1bmsgaW5mZXJyZW5jZVxuICAgICAgaWYgKGNvbnRleHQgJiYgY29udGV4dC5fcmVnaXN0ZXJlZENvbXBvbmVudHMpIHtcbiAgICAgICAgY29udGV4dC5fcmVnaXN0ZXJlZENvbXBvbmVudHMuYWRkKG1vZHVsZUlkZW50aWZpZXIpXG4gICAgICB9XG4gICAgfVxuICAgIC8vIHVzZWQgYnkgc3NyIGluIGNhc2UgY29tcG9uZW50IGlzIGNhY2hlZCBhbmQgYmVmb3JlQ3JlYXRlXG4gICAgLy8gbmV2ZXIgZ2V0cyBjYWxsZWRcbiAgICBvcHRpb25zLl9zc3JSZWdpc3RlciA9IGhvb2tcbiAgfSBlbHNlIGlmIChpbmplY3RTdHlsZXMpIHtcbiAgICBob29rID0gc2hhZG93TW9kZVxuICAgICAgPyBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaW5qZWN0U3R5bGVzLmNhbGwoXG4gICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgKG9wdGlvbnMuZnVuY3Rpb25hbCA/IHRoaXMucGFyZW50IDogdGhpcykuJHJvb3QuJG9wdGlvbnMuc2hhZG93Um9vdFxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgOiBpbmplY3RTdHlsZXNcbiAgfVxuXG4gIGlmIChob29rKSB7XG4gICAgaWYgKG9wdGlvbnMuZnVuY3Rpb25hbCkge1xuICAgICAgLy8gZm9yIHRlbXBsYXRlLW9ubHkgaG90LXJlbG9hZCBiZWNhdXNlIGluIHRoYXQgY2FzZSB0aGUgcmVuZGVyIGZuIGRvZXNuJ3RcbiAgICAgIC8vIGdvIHRocm91Z2ggdGhlIG5vcm1hbGl6ZXJcbiAgICAgIG9wdGlvbnMuX2luamVjdFN0eWxlcyA9IGhvb2tcbiAgICAgIC8vIHJlZ2lzdGVyIGZvciBmdW5jdGlvbmFsIGNvbXBvbmVudCBpbiB2dWUgZmlsZVxuICAgICAgdmFyIG9yaWdpbmFsUmVuZGVyID0gb3B0aW9ucy5yZW5kZXJcbiAgICAgIG9wdGlvbnMucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyV2l0aFN0eWxlSW5qZWN0aW9uKGgsIGNvbnRleHQpIHtcbiAgICAgICAgaG9vay5jYWxsKGNvbnRleHQpXG4gICAgICAgIHJldHVybiBvcmlnaW5hbFJlbmRlcihoLCBjb250ZXh0KVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBpbmplY3QgY29tcG9uZW50IHJlZ2lzdHJhdGlvbiBhcyBiZWZvcmVDcmVhdGUgaG9va1xuICAgICAgdmFyIGV4aXN0aW5nID0gb3B0aW9ucy5iZWZvcmVDcmVhdGVcbiAgICAgIG9wdGlvbnMuYmVmb3JlQ3JlYXRlID0gZXhpc3RpbmcgPyBbXS5jb25jYXQoZXhpc3RpbmcsIGhvb2spIDogW2hvb2tdXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBleHBvcnRzOiBzY3JpcHRFeHBvcnRzLFxuICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgfVxufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgTXlDb21wb25lbnQgZnJvbSBcIi4vY29tcG9uZW50cy9NeUNvbXBvbmVudC52dWVcIjtcclxuaW1wb3J0IHN1bW1pdE1vZHVsZSBmcm9tIFwiLi9tb2R1bGVzL3N1bW1pdE1vZHVsZVwiO1xyXG5cclxud2luZG93LiRudXh0LiRzdG9yZS5yZWdpc3Rlck1vZHVsZShcIlN1bW1pdFwiLCBzdW1taXRNb2R1bGUpO1xyXG5cclxuLy93YWl0IGZvciBtb2R1bGUgdG8gcmVnaXN0ZXJcclxuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgd2luZG93LiRudXh0LiRzdG9yZS5kaXNwYXRjaChcIlN1bW1pdC9zZXRNZXNzYWdlXCIsIFwiSGVsbG8gV29ybGRcIik7XHJcbn0sIDIwMDApO1xyXG5cclxuY29uc3Qgcm91dGVyID0gd2luZG93LiRudXh0LiRyb3V0ZXI7XHJcbnJvdXRlci5hZGRSb3V0ZSh7IHBhdGg6IFwiL215LW5ldy1jb21wb25lbnRcIiwgY29tcG9uZW50OiBNeUNvbXBvbmVudCB9KTtcclxucm91dGVyLnB1c2goXCIvbXktbmV3LWNvbXBvbmVudFwiKTtcclxuXHJcbnNldFRpbWVvdXQoKCkgPT4ge1xyXG4gIHdpbmRvdy4kbnV4dC4kc3RvcmUuZGlzcGF0Y2goXCJTdW1taXQvc2V0TWVzc2FnZVwiLCBcIkhlbGxvIFdvcmxkIDJcIik7XHJcbn0sIDQwMDApO1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=