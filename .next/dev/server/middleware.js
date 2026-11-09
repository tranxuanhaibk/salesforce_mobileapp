"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "proxy";
exports.ids = ["proxy"];
exports.modules = {

/***/ "(middleware)/./node_modules/next/dist/build/webpack/loaders/next-middleware-loader.js?absolutePagePath=%2FUsers%2Fadmin%2FDocuments%2FProject%20List%2Fsalesforce_mobileapp%2Fproxy.ts&page=%2Fproxy&rootDir=%2FUsers%2Fadmin%2FDocuments%2FProject%20List%2Fsalesforce_mobileapp&matchers=&preferredRegion=&middlewareConfig=e30%3D!":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-middleware-loader.js?absolutePagePath=%2FUsers%2Fadmin%2FDocuments%2FProject%20List%2Fsalesforce_mobileapp%2Fproxy.ts&page=%2Fproxy&rootDir=%2FUsers%2Fadmin%2FDocuments%2FProject%20List%2Fsalesforce_mobileapp&matchers=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   handler: () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var next_dist_build_adapter_setup_node_env_external__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/build/adapter/setup-node-env.external */ \"next/dist/build/adapter/setup-node-env.external\");\n/* harmony import */ var next_dist_build_adapter_setup_node_env_external__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_build_adapter_setup_node_env_external__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_web_globals__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/web/globals */ \"(middleware)/./node_modules/next/dist/server/web/globals.js\");\n/* harmony import */ var next_dist_server_web_globals__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_web_globals__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/web/adapter */ \"(middleware)/./node_modules/next/dist/server/web/adapter.js\");\n/* harmony import */ var next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var next_dist_server_lib_incremental_cache__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/dist/server/lib/incremental-cache */ \"(middleware)/./node_modules/next/dist/server/lib/incremental-cache/index.js\");\n/* harmony import */ var next_dist_server_lib_incremental_cache__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_incremental_cache__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _proxy_ts__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./proxy.ts */ \"(middleware)/./proxy.ts\");\n/* harmony import */ var next_dist_client_components_is_next_router_error__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! next/dist/client/components/is-next-router-error */ \"(middleware)/./node_modules/next/dist/client/components/is-next-router-error.js\");\n/* harmony import */ var next_dist_client_components_is_next_router_error__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(next_dist_client_components_is_next_router_error__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! next/dist/server/web/utils */ \"(middleware)/./node_modules/next/dist/server/web/utils.js\");\n/* harmony import */ var next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_6__);\n\n\n\n\nconst incrementalCacheHandler = null\n// Import the userland code.\n;\n\n\n\nconst mod = {\n    ..._proxy_ts__WEBPACK_IMPORTED_MODULE_4__\n};\nconst page = \"/proxy\";\nconst isProxy = page === '/proxy' || page === '/src/proxy';\nconst handlerUserland = (isProxy ? mod.proxy : mod.middleware) || mod.default;\nclass ProxyMissingExportError extends Error {\n    constructor(message){\n        super(message);\n        // Stack isn't useful here, remove it considering it spams logs during development.\n        this.stack = '';\n    }\n}\n// TODO: This spams logs during development. Find a better way to handle this.\n// Removing this will spam \"fn is not a function\" logs which is worse.\nif (typeof handlerUserland !== 'function') {\n    throw new ProxyMissingExportError(`The ${isProxy ? 'Proxy' : 'Middleware'} file \"${page}\" must export a function named \\`${isProxy ? 'proxy' : 'middleware'}\\` or a default function.`);\n}\n// Proxy will only sent out the FetchEvent to next server,\n// so load instrumentation module here and track the error inside proxy module.\nfunction errorHandledHandler(fn) {\n    return async (...args)=>{\n        try {\n            return await fn(...args);\n        } catch (err) {\n            // In development, error the navigation API usage in runtime,\n            // since it's not allowed to be used in proxy as it's outside of react component tree.\n            if (true) {\n                if ((0,next_dist_client_components_is_next_router_error__WEBPACK_IMPORTED_MODULE_5__.isNextRouterError)(err)) {\n                    err.message = `Next.js navigation API is not allowed to be used in ${isProxy ? 'Proxy' : 'Middleware'}.`;\n                    throw err;\n                }\n            }\n            const req = args[0];\n            const url = new URL(req.url);\n            const resource = url.pathname + url.search;\n            await (0,next_dist_server_web_globals__WEBPACK_IMPORTED_MODULE_1__.edgeInstrumentationOnRequestError)(err, {\n                path: resource,\n                method: req.method,\n                headers: Object.fromEntries(req.headers.entries())\n            }, {\n                routerKind: 'Pages Router',\n                routePath: '/proxy',\n                routeType: 'proxy',\n                revalidateReason: undefined\n            });\n            throw err;\n        }\n    };\n}\nconst internalHandler = async (opts)=>{\n    if (true) {\n        var _opts_request_requestMeta, _opts_request_requestMeta1;\n        // This mirrors what `RouteModule#prepare` does for routes\n        // edge runtime handles loading instrumentation at the edge adapter level\n        const { join, relative } = __webpack_require__(/*! node:path */ \"node:path\");\n        const { ensureInstrumentationRegistered } = __webpack_require__(/*! next/dist/server/lib/router-utils/instrumentation-globals.external */ \"next/dist/server/lib/router-utils/instrumentation-globals.external\");\n        const absoluteProjectDir = join(/* turbopackIgnore: true */ process.cwd(), ((_opts_request_requestMeta = opts.request.requestMeta) == null ? void 0 : _opts_request_requestMeta.relativeProjectDir) || '');\n        const absoluteDistDir = (_opts_request_requestMeta1 = opts.request.requestMeta) == null ? void 0 : _opts_request_requestMeta1.distDir;\n        const distDir = absoluteDistDir ? relative(absoluteProjectDir, absoluteDistDir) : '.next';\n        await ensureInstrumentationRegistered(absoluteProjectDir, distDir);\n    }\n    return (0,next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_2__.adapter)({\n        ...opts,\n        IncrementalCache: next_dist_server_lib_incremental_cache__WEBPACK_IMPORTED_MODULE_3__.IncrementalCache,\n        incrementalCacheHandler,\n        page,\n        handler: errorHandledHandler(handlerUserland)\n    });\n};\nasync function handler(request, ctx) {\n    const result = await internalHandler({\n        request: {\n            url: request.url,\n            method: request.method,\n            headers: (0,next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_6__.toNodeOutgoingHttpHeaders)(request.headers),\n            nextConfig: {\n                basePath: \"\",\n                i18n: \"\",\n                trailingSlash: Boolean(false),\n                experimental: {\n                    cacheLife: {\"default\":{\"stale\":300,\"revalidate\":900,\"expire\":4294967294},\"seconds\":{\"stale\":30,\"revalidate\":1,\"expire\":60},\"minutes\":{\"stale\":300,\"revalidate\":60,\"expire\":3600},\"hours\":{\"stale\":300,\"revalidate\":3600,\"expire\":86400},\"days\":{\"stale\":300,\"revalidate\":86400,\"expire\":604800},\"weeks\":{\"stale\":300,\"revalidate\":604800,\"expire\":2592000},\"max\":{\"stale\":300,\"revalidate\":2592000,\"expire\":31536000}},\n                    authInterrupts: Boolean(false),\n                    clientParamParsingOrigins: []\n                }\n            },\n            page: {\n                name: page\n            },\n            body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body ?? undefined : undefined,\n            waitUntil: ctx.waitUntil,\n            requestMeta: ctx.requestMeta,\n            signal: ctx.signal || new AbortController().signal\n        }\n    });\n    ctx.waitUntil == null ? void 0 : ctx.waitUntil.call(ctx, result.waitUntil);\n    return result.response;\n}\n// backwards compat for non-adapter setups\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (internalHandler);\n\n//# sourceMappingURL=middleware.js.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKG1pZGRsZXdhcmUpLy4vbm9kZV9tb2R1bGVzL25leHQvZGlzdC9idWlsZC93ZWJwYWNrL2xvYWRlcnMvbmV4dC1taWRkbGV3YXJlLWxvYWRlci5qcz9hYnNvbHV0ZVBhZ2VQYXRoPSUyRlVzZXJzJTJGYWRtaW4lMkZEb2N1bWVudHMlMkZQcm9qZWN0JTIwTGlzdCUyRnNhbGVzZm9yY2VfbW9iaWxlYXBwJTJGcHJveHkudHMmcGFnZT0lMkZwcm94eSZyb290RGlyPSUyRlVzZXJzJTJGYWRtaW4lMkZEb2N1bWVudHMlMkZQcm9qZWN0JTIwTGlzdCUyRnNhbGVzZm9yY2VfbW9iaWxlYXBwJm1hdGNoZXJzPSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBeUQ7QUFDbkI7QUFDaUI7QUFDbUI7QUFDMUU7QUFDQTtBQUNBLENBQW1DO0FBQzhDO0FBQ0k7QUFDZDtBQUN2RTtBQUNBLE9BQU8sc0NBQUk7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLGtDQUFrQyxRQUFRLEtBQUssbUNBQW1DLGlDQUFpQztBQUNoSztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0EsZ0JBQWdCLElBQXFDO0FBQ3JELG9CQUFvQixtR0FBaUI7QUFDckMseUZBQXlGLGlDQUFpQztBQUMxSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsK0ZBQWlDO0FBQ25EO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxJQUFtQztBQUMzQztBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsaUJBQWlCLEVBQUUsbUJBQU8sQ0FBQyw0QkFBVztBQUN0RCxnQkFBZ0Isa0NBQWtDLEVBQUUsbUJBQU8sQ0FBQyw4SUFBb0U7QUFDaEk7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcscUVBQU87QUFDbEI7QUFDQSx3QkFBd0I7QUFDeEI7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQixxRkFBeUI7QUFDOUM7QUFDQSwwQkFBMEIsRUFBNEI7QUFDdEQsc0JBQXNCLEVBQThCO0FBQ3BELHVDQUF1QyxLQUFpQztBQUN4RTtBQUNBLCtCQUErQiwyWUFBNkI7QUFDNUQsNENBQTRDLEtBQStDO0FBQzNGLCtDQUErQyxFQUErQztBQUM5RjtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRUFBZSxlQUFlLEVBQUM7O0FBRS9CIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFwibmV4dC9kaXN0L2J1aWxkL2FkYXB0ZXIvc2V0dXAtbm9kZS1lbnYuZXh0ZXJuYWxcIjtcbmltcG9ydCBcIm5leHQvZGlzdC9zZXJ2ZXIvd2ViL2dsb2JhbHNcIjtcbmltcG9ydCB7IGFkYXB0ZXIgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci93ZWIvYWRhcHRlclwiO1xuaW1wb3J0IHsgSW5jcmVtZW50YWxDYWNoZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9pbmNyZW1lbnRhbC1jYWNoZVwiO1xuY29uc3QgaW5jcmVtZW50YWxDYWNoZUhhbmRsZXIgPSBudWxsXG4vLyBJbXBvcnQgdGhlIHVzZXJsYW5kIGNvZGUuXG5pbXBvcnQgKiBhcyBfbW9kIGZyb20gXCIuL3Byb3h5LnRzXCI7XG5pbXBvcnQgeyBlZGdlSW5zdHJ1bWVudGF0aW9uT25SZXF1ZXN0RXJyb3IgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci93ZWIvZ2xvYmFsc1wiO1xuaW1wb3J0IHsgaXNOZXh0Um91dGVyRXJyb3IgfSBmcm9tIFwibmV4dC9kaXN0L2NsaWVudC9jb21wb25lbnRzL2lzLW5leHQtcm91dGVyLWVycm9yXCI7XG5pbXBvcnQgeyB0b05vZGVPdXRnb2luZ0h0dHBIZWFkZXJzIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvd2ViL3V0aWxzXCI7XG5jb25zdCBtb2QgPSB7XG4gICAgLi4uX21vZFxufTtcbmNvbnN0IHBhZ2UgPSBcIi9wcm94eVwiO1xuY29uc3QgaXNQcm94eSA9IHBhZ2UgPT09ICcvcHJveHknIHx8IHBhZ2UgPT09ICcvc3JjL3Byb3h5JztcbmNvbnN0IGhhbmRsZXJVc2VybGFuZCA9IChpc1Byb3h5ID8gbW9kLnByb3h5IDogbW9kLm1pZGRsZXdhcmUpIHx8IG1vZC5kZWZhdWx0O1xuY2xhc3MgUHJveHlNaXNzaW5nRXhwb3J0RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IobWVzc2FnZSl7XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgICAgICAvLyBTdGFjayBpc24ndCB1c2VmdWwgaGVyZSwgcmVtb3ZlIGl0IGNvbnNpZGVyaW5nIGl0IHNwYW1zIGxvZ3MgZHVyaW5nIGRldmVsb3BtZW50LlxuICAgICAgICB0aGlzLnN0YWNrID0gJyc7XG4gICAgfVxufVxuLy8gVE9ETzogVGhpcyBzcGFtcyBsb2dzIGR1cmluZyBkZXZlbG9wbWVudC4gRmluZCBhIGJldHRlciB3YXkgdG8gaGFuZGxlIHRoaXMuXG4vLyBSZW1vdmluZyB0aGlzIHdpbGwgc3BhbSBcImZuIGlzIG5vdCBhIGZ1bmN0aW9uXCIgbG9ncyB3aGljaCBpcyB3b3JzZS5cbmlmICh0eXBlb2YgaGFuZGxlclVzZXJsYW5kICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFByb3h5TWlzc2luZ0V4cG9ydEVycm9yKGBUaGUgJHtpc1Byb3h5ID8gJ1Byb3h5JyA6ICdNaWRkbGV3YXJlJ30gZmlsZSBcIiR7cGFnZX1cIiBtdXN0IGV4cG9ydCBhIGZ1bmN0aW9uIG5hbWVkIFxcYCR7aXNQcm94eSA/ICdwcm94eScgOiAnbWlkZGxld2FyZSd9XFxgIG9yIGEgZGVmYXVsdCBmdW5jdGlvbi5gKTtcbn1cbi8vIFByb3h5IHdpbGwgb25seSBzZW50IG91dCB0aGUgRmV0Y2hFdmVudCB0byBuZXh0IHNlcnZlcixcbi8vIHNvIGxvYWQgaW5zdHJ1bWVudGF0aW9uIG1vZHVsZSBoZXJlIGFuZCB0cmFjayB0aGUgZXJyb3IgaW5zaWRlIHByb3h5IG1vZHVsZS5cbmZ1bmN0aW9uIGVycm9ySGFuZGxlZEhhbmRsZXIoZm4pIHtcbiAgICByZXR1cm4gYXN5bmMgKC4uLmFyZ3MpPT57XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgZm4oLi4uYXJncyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgLy8gSW4gZGV2ZWxvcG1lbnQsIGVycm9yIHRoZSBuYXZpZ2F0aW9uIEFQSSB1c2FnZSBpbiBydW50aW1lLFxuICAgICAgICAgICAgLy8gc2luY2UgaXQncyBub3QgYWxsb3dlZCB0byBiZSB1c2VkIGluIHByb3h5IGFzIGl0J3Mgb3V0c2lkZSBvZiByZWFjdCBjb21wb25lbnQgdHJlZS5cbiAgICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzTmV4dFJvdXRlckVycm9yKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyLm1lc3NhZ2UgPSBgTmV4dC5qcyBuYXZpZ2F0aW9uIEFQSSBpcyBub3QgYWxsb3dlZCB0byBiZSB1c2VkIGluICR7aXNQcm94eSA/ICdQcm94eScgOiAnTWlkZGxld2FyZSd9LmA7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZXEgPSBhcmdzWzBdO1xuICAgICAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChyZXEudXJsKTtcbiAgICAgICAgICAgIGNvbnN0IHJlc291cmNlID0gdXJsLnBhdGhuYW1lICsgdXJsLnNlYXJjaDtcbiAgICAgICAgICAgIGF3YWl0IGVkZ2VJbnN0cnVtZW50YXRpb25PblJlcXVlc3RFcnJvcihlcnIsIHtcbiAgICAgICAgICAgICAgICBwYXRoOiByZXNvdXJjZSxcbiAgICAgICAgICAgICAgICBtZXRob2Q6IHJlcS5tZXRob2QsXG4gICAgICAgICAgICAgICAgaGVhZGVyczogT2JqZWN0LmZyb21FbnRyaWVzKHJlcS5oZWFkZXJzLmVudHJpZXMoKSlcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICByb3V0ZXJLaW5kOiAnUGFnZXMgUm91dGVyJyxcbiAgICAgICAgICAgICAgICByb3V0ZVBhdGg6ICcvcHJveHknLFxuICAgICAgICAgICAgICAgIHJvdXRlVHlwZTogJ3Byb3h5JyxcbiAgICAgICAgICAgICAgICByZXZhbGlkYXRlUmVhc29uOiB1bmRlZmluZWRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmNvbnN0IGludGVybmFsSGFuZGxlciA9IGFzeW5jIChvcHRzKT0+e1xuICAgIGlmIChwcm9jZXNzLmVudi5ORVhUX1JVTlRJTUUgIT09ICdlZGdlJykge1xuICAgICAgICB2YXIgX29wdHNfcmVxdWVzdF9yZXF1ZXN0TWV0YSwgX29wdHNfcmVxdWVzdF9yZXF1ZXN0TWV0YTE7XG4gICAgICAgIC8vIFRoaXMgbWlycm9ycyB3aGF0IGBSb3V0ZU1vZHVsZSNwcmVwYXJlYCBkb2VzIGZvciByb3V0ZXNcbiAgICAgICAgLy8gZWRnZSBydW50aW1lIGhhbmRsZXMgbG9hZGluZyBpbnN0cnVtZW50YXRpb24gYXQgdGhlIGVkZ2UgYWRhcHRlciBsZXZlbFxuICAgICAgICBjb25zdCB7IGpvaW4sIHJlbGF0aXZlIH0gPSByZXF1aXJlKCdub2RlOnBhdGgnKTtcbiAgICAgICAgY29uc3QgeyBlbnN1cmVJbnN0cnVtZW50YXRpb25SZWdpc3RlcmVkIH0gPSByZXF1aXJlKFwibmV4dC9kaXN0L3NlcnZlci9saWIvcm91dGVyLXV0aWxzL2luc3RydW1lbnRhdGlvbi1nbG9iYWxzLmV4dGVybmFsXCIpO1xuICAgICAgICBjb25zdCBhYnNvbHV0ZVByb2plY3REaXIgPSBqb2luKC8qIHR1cmJvcGFja0lnbm9yZTogdHJ1ZSAqLyBwcm9jZXNzLmN3ZCgpLCAoKF9vcHRzX3JlcXVlc3RfcmVxdWVzdE1ldGEgPSBvcHRzLnJlcXVlc3QucmVxdWVzdE1ldGEpID09IG51bGwgPyB2b2lkIDAgOiBfb3B0c19yZXF1ZXN0X3JlcXVlc3RNZXRhLnJlbGF0aXZlUHJvamVjdERpcikgfHwgJycpO1xuICAgICAgICBjb25zdCBhYnNvbHV0ZURpc3REaXIgPSAoX29wdHNfcmVxdWVzdF9yZXF1ZXN0TWV0YTEgPSBvcHRzLnJlcXVlc3QucmVxdWVzdE1ldGEpID09IG51bGwgPyB2b2lkIDAgOiBfb3B0c19yZXF1ZXN0X3JlcXVlc3RNZXRhMS5kaXN0RGlyO1xuICAgICAgICBjb25zdCBkaXN0RGlyID0gYWJzb2x1dGVEaXN0RGlyID8gcmVsYXRpdmUoYWJzb2x1dGVQcm9qZWN0RGlyLCBhYnNvbHV0ZURpc3REaXIpIDogJy5uZXh0JztcbiAgICAgICAgYXdhaXQgZW5zdXJlSW5zdHJ1bWVudGF0aW9uUmVnaXN0ZXJlZChhYnNvbHV0ZVByb2plY3REaXIsIGRpc3REaXIpO1xuICAgIH1cbiAgICByZXR1cm4gYWRhcHRlcih7XG4gICAgICAgIC4uLm9wdHMsXG4gICAgICAgIEluY3JlbWVudGFsQ2FjaGUsXG4gICAgICAgIGluY3JlbWVudGFsQ2FjaGVIYW5kbGVyLFxuICAgICAgICBwYWdlLFxuICAgICAgICBoYW5kbGVyOiBlcnJvckhhbmRsZWRIYW5kbGVyKGhhbmRsZXJVc2VybGFuZClcbiAgICB9KTtcbn07XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXF1ZXN0LCBjdHgpIHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBpbnRlcm5hbEhhbmRsZXIoe1xuICAgICAgICByZXF1ZXN0OiB7XG4gICAgICAgICAgICB1cmw6IHJlcXVlc3QudXJsLFxuICAgICAgICAgICAgbWV0aG9kOiByZXF1ZXN0Lm1ldGhvZCxcbiAgICAgICAgICAgIGhlYWRlcnM6IHRvTm9kZU91dGdvaW5nSHR0cEhlYWRlcnMocmVxdWVzdC5oZWFkZXJzKSxcbiAgICAgICAgICAgIG5leHRDb25maWc6IHtcbiAgICAgICAgICAgICAgICBiYXNlUGF0aDogcHJvY2Vzcy5lbnYuX19ORVhUX0JBU0VfUEFUSCxcbiAgICAgICAgICAgICAgICBpMThuOiBwcm9jZXNzLmVudi5fX05FWFRfSTE4Tl9DT05GSUcsXG4gICAgICAgICAgICAgICAgdHJhaWxpbmdTbGFzaDogQm9vbGVhbihwcm9jZXNzLmVudi5fX05FWFRfVFJBSUxJTkdfU0xBU0gpLFxuICAgICAgICAgICAgICAgIGV4cGVyaW1lbnRhbDoge1xuICAgICAgICAgICAgICAgICAgICBjYWNoZUxpZmU6IHByb2Nlc3MuZW52Ll9fTkVYVF9DQUNIRV9MSUZFLFxuICAgICAgICAgICAgICAgICAgICBhdXRoSW50ZXJydXB0czogQm9vbGVhbihwcm9jZXNzLmVudi5fX05FWFRfRVhQRVJJTUVOVEFMX0FVVEhfSU5URVJSVVBUUyksXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudFBhcmFtUGFyc2luZ09yaWdpbnM6IHByb2Nlc3MuZW52Ll9fTkVYVF9DTElFTlRfUEFSQU1fUEFSU0lOR19PUklHSU5TXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhZ2U6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiBwYWdlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYm9keTogcmVxdWVzdC5tZXRob2QgIT09ICdHRVQnICYmIHJlcXVlc3QubWV0aG9kICE9PSAnSEVBRCcgPyByZXF1ZXN0LmJvZHkgPz8gdW5kZWZpbmVkIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgd2FpdFVudGlsOiBjdHgud2FpdFVudGlsLFxuICAgICAgICAgICAgcmVxdWVzdE1ldGE6IGN0eC5yZXF1ZXN0TWV0YSxcbiAgICAgICAgICAgIHNpZ25hbDogY3R4LnNpZ25hbCB8fCBuZXcgQWJvcnRDb250cm9sbGVyKCkuc2lnbmFsXG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBjdHgud2FpdFVudGlsID09IG51bGwgPyB2b2lkIDAgOiBjdHgud2FpdFVudGlsLmNhbGwoY3R4LCByZXN1bHQud2FpdFVudGlsKTtcbiAgICByZXR1cm4gcmVzdWx0LnJlc3BvbnNlO1xufVxuLy8gYmFja3dhcmRzIGNvbXBhdCBmb3Igbm9uLWFkYXB0ZXIgc2V0dXBzXG5leHBvcnQgZGVmYXVsdCBpbnRlcm5hbEhhbmRsZXI7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1pZGRsZXdhcmUuanMubWFwXG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(middleware)/./node_modules/next/dist/build/webpack/loaders/next-middleware-loader.js?absolutePagePath=%2FUsers%2Fadmin%2FDocuments%2FProject%20List%2Fsalesforce_mobileapp%2Fproxy.ts&page=%2Fproxy&rootDir=%2FUsers%2Fadmin%2FDocuments%2FProject%20List%2Fsalesforce_mobileapp&matchers=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(middleware)/./proxy.ts":
/*!******************!*\
  !*** ./proxy.ts ***!
  \******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   config: () => (/* binding */ config),\n/* harmony export */   proxy: () => (/* binding */ proxy)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(middleware)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _utils_supabase_middleware__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/utils/supabase/middleware */ \"(middleware)/./utils/supabase/middleware.ts\");\n\n\n/**\n * Next.js Proxy (previously Middleware) — Route Protection\n * Renamed from middleware.ts → proxy.ts for Next.js 16 compatibility.\n *\n * Protected routes (require Supabase auth):\n *   /dashboard/**\n *\n * Public routes (always accessible):\n *   /login\n *   /api/auth/salesforce (OAuth flow — must be accessible to initiate)\n *   /api/auth/salesforce/callback\n *\n * Also refreshes the Supabase session token on every request.\n */ async function proxy(request) {\n    const { pathname } = request.nextUrl;\n    // ── Always refresh session (even on public routes) ─────────────\n    const { supabaseResponse, user } = await (0,_utils_supabase_middleware__WEBPACK_IMPORTED_MODULE_1__.updateSession)(request);\n    // ── Protected route guard ──────────────────────────────────────\n    const isProtected = pathname.startsWith('/dashboard');\n    const isAuthRoute = pathname === '/login';\n    if (isProtected && !user) {\n        // Redirect unauthenticated users to /login, preserving the intended URL\n        const loginUrl = new URL('/login', request.url);\n        loginUrl.searchParams.set('redirectTo', pathname);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.redirect(loginUrl);\n    }\n    if (isAuthRoute && user) {\n        // Already logged in — redirect away from /login\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.redirect(new URL('/dashboard', request.url));\n    }\n    return supabaseResponse;\n}\nconst config = {\n    matcher: [\n        /*\n     * Match all request paths EXCEPT:\n     * - _next/static (static files)\n     * - _next/image (image optimization)\n     * - favicon.ico\n     * - Public asset files (.svg, .png, .jpg, .ico, .webp)\n     */ '/((?!_next/static|_next/image|favicon\\\\.ico|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'\n    ]\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKG1pZGRsZXdhcmUpLy4vcHJveHkudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUE0RDtBQUNEO0FBRTNEOzs7Ozs7Ozs7Ozs7O0NBYUMsR0FDTSxlQUFlRSxNQUFNQyxPQUFvQjtJQUM5QyxNQUFNLEVBQUVDLFFBQVEsRUFBRSxHQUFHRCxRQUFRRSxPQUFPO0lBRXBDLGtFQUFrRTtJQUNsRSxNQUFNLEVBQUVDLGdCQUFnQixFQUFFQyxJQUFJLEVBQUUsR0FBRyxNQUFNTix5RUFBYUEsQ0FBQ0U7SUFFdkQsa0VBQWtFO0lBQ2xFLE1BQU1LLGNBQWNKLFNBQVNLLFVBQVUsQ0FBQztJQUN4QyxNQUFNQyxjQUFjTixhQUFhO0lBRWpDLElBQUlJLGVBQWUsQ0FBQ0QsTUFBTTtRQUN4Qix3RUFBd0U7UUFDeEUsTUFBTUksV0FBVyxJQUFJQyxJQUFJLFVBQVVULFFBQVFVLEdBQUc7UUFDOUNGLFNBQVNHLFlBQVksQ0FBQ0MsR0FBRyxDQUFDLGNBQWNYO1FBQ3hDLE9BQU9KLHFEQUFZQSxDQUFDZ0IsUUFBUSxDQUFDTDtJQUMvQjtJQUVBLElBQUlELGVBQWVILE1BQU07UUFDdkIsZ0RBQWdEO1FBQ2hELE9BQU9QLHFEQUFZQSxDQUFDZ0IsUUFBUSxDQUFDLElBQUlKLElBQUksY0FBY1QsUUFBUVUsR0FBRztJQUNoRTtJQUVBLE9BQU9QO0FBQ1Q7QUFFTyxNQUFNVyxTQUFTO0lBQ3BCQyxTQUFTO1FBQ1A7Ozs7OztLQU1DLEdBQ0Q7S0FDRDtBQUNILEVBQUMiLCJzb3VyY2VzIjpbIi9Vc2Vycy9hZG1pbi9Eb2N1bWVudHMvUHJvamVjdCBMaXN0L3NhbGVzZm9yY2VfbW9iaWxlYXBwL3Byb3h5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHR5cGUgTmV4dFJlcXVlc3QsIE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJ1xuaW1wb3J0IHsgdXBkYXRlU2Vzc2lvbiB9IGZyb20gJ0AvdXRpbHMvc3VwYWJhc2UvbWlkZGxld2FyZSdcblxuLyoqXG4gKiBOZXh0LmpzIFByb3h5IChwcmV2aW91c2x5IE1pZGRsZXdhcmUpIOKAlCBSb3V0ZSBQcm90ZWN0aW9uXG4gKiBSZW5hbWVkIGZyb20gbWlkZGxld2FyZS50cyDihpIgcHJveHkudHMgZm9yIE5leHQuanMgMTYgY29tcGF0aWJpbGl0eS5cbiAqXG4gKiBQcm90ZWN0ZWQgcm91dGVzIChyZXF1aXJlIFN1cGFiYXNlIGF1dGgpOlxuICogICAvZGFzaGJvYXJkLyoqXG4gKlxuICogUHVibGljIHJvdXRlcyAoYWx3YXlzIGFjY2Vzc2libGUpOlxuICogICAvbG9naW5cbiAqICAgL2FwaS9hdXRoL3NhbGVzZm9yY2UgKE9BdXRoIGZsb3cg4oCUIG11c3QgYmUgYWNjZXNzaWJsZSB0byBpbml0aWF0ZSlcbiAqICAgL2FwaS9hdXRoL3NhbGVzZm9yY2UvY2FsbGJhY2tcbiAqXG4gKiBBbHNvIHJlZnJlc2hlcyB0aGUgU3VwYWJhc2Ugc2Vzc2lvbiB0b2tlbiBvbiBldmVyeSByZXF1ZXN0LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJveHkocmVxdWVzdDogTmV4dFJlcXVlc3QpIHtcbiAgY29uc3QgeyBwYXRobmFtZSB9ID0gcmVxdWVzdC5uZXh0VXJsXG5cbiAgLy8g4pSA4pSAIEFsd2F5cyByZWZyZXNoIHNlc3Npb24gKGV2ZW4gb24gcHVibGljIHJvdXRlcykg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4gIGNvbnN0IHsgc3VwYWJhc2VSZXNwb25zZSwgdXNlciB9ID0gYXdhaXQgdXBkYXRlU2Vzc2lvbihyZXF1ZXN0KVxuXG4gIC8vIOKUgOKUgCBQcm90ZWN0ZWQgcm91dGUgZ3VhcmQg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4gIGNvbnN0IGlzUHJvdGVjdGVkID0gcGF0aG5hbWUuc3RhcnRzV2l0aCgnL2Rhc2hib2FyZCcpXG4gIGNvbnN0IGlzQXV0aFJvdXRlID0gcGF0aG5hbWUgPT09ICcvbG9naW4nXG5cbiAgaWYgKGlzUHJvdGVjdGVkICYmICF1c2VyKSB7XG4gICAgLy8gUmVkaXJlY3QgdW5hdXRoZW50aWNhdGVkIHVzZXJzIHRvIC9sb2dpbiwgcHJlc2VydmluZyB0aGUgaW50ZW5kZWQgVVJMXG4gICAgY29uc3QgbG9naW5VcmwgPSBuZXcgVVJMKCcvbG9naW4nLCByZXF1ZXN0LnVybClcbiAgICBsb2dpblVybC5zZWFyY2hQYXJhbXMuc2V0KCdyZWRpcmVjdFRvJywgcGF0aG5hbWUpXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5yZWRpcmVjdChsb2dpblVybClcbiAgfVxuXG4gIGlmIChpc0F1dGhSb3V0ZSAmJiB1c2VyKSB7XG4gICAgLy8gQWxyZWFkeSBsb2dnZWQgaW4g4oCUIHJlZGlyZWN0IGF3YXkgZnJvbSAvbG9naW5cbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLnJlZGlyZWN0KG5ldyBVUkwoJy9kYXNoYm9hcmQnLCByZXF1ZXN0LnVybCkpXG4gIH1cblxuICByZXR1cm4gc3VwYWJhc2VSZXNwb25zZVxufVxuXG5leHBvcnQgY29uc3QgY29uZmlnID0ge1xuICBtYXRjaGVyOiBbXG4gICAgLypcbiAgICAgKiBNYXRjaCBhbGwgcmVxdWVzdCBwYXRocyBFWENFUFQ6XG4gICAgICogLSBfbmV4dC9zdGF0aWMgKHN0YXRpYyBmaWxlcylcbiAgICAgKiAtIF9uZXh0L2ltYWdlIChpbWFnZSBvcHRpbWl6YXRpb24pXG4gICAgICogLSBmYXZpY29uLmljb1xuICAgICAqIC0gUHVibGljIGFzc2V0IGZpbGVzICguc3ZnLCAucG5nLCAuanBnLCAuaWNvLCAud2VicClcbiAgICAgKi9cbiAgICAnLygoPyFfbmV4dC9zdGF0aWN8X25leHQvaW1hZ2V8ZmF2aWNvblxcXFwuaWNvfC4qXFxcXC4oPzpzdmd8cG5nfGpwZ3xqcGVnfGdpZnx3ZWJwKSQpLiopJyxcbiAgXSxcbn1cbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJ1cGRhdGVTZXNzaW9uIiwicHJveHkiLCJyZXF1ZXN0IiwicGF0aG5hbWUiLCJuZXh0VXJsIiwic3VwYWJhc2VSZXNwb25zZSIsInVzZXIiLCJpc1Byb3RlY3RlZCIsInN0YXJ0c1dpdGgiLCJpc0F1dGhSb3V0ZSIsImxvZ2luVXJsIiwiVVJMIiwidXJsIiwic2VhcmNoUGFyYW1zIiwic2V0IiwicmVkaXJlY3QiLCJjb25maWciLCJtYXRjaGVyIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(middleware)/./proxy.ts\n");

/***/ }),

/***/ "(middleware)/./utils/supabase/middleware.ts":
/*!**************************************!*\
  !*** ./utils/supabase/middleware.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   updateSession: () => (/* binding */ updateSession)\n/* harmony export */ });\n/* harmony import */ var _supabase_ssr__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @supabase/ssr */ \"(middleware)/./node_modules/@supabase/ssr/dist/module/createServerClient.js\");\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(middleware)/./node_modules/next/dist/api/server.js\");\n\n\n/**\n * Updates the Supabase session in middleware.\n * Refreshes the auth token if it's about to expire.\n * Must be called at the top of your middleware.ts.\n */ async function updateSession(request) {\n    let supabaseResponse = next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.next({\n        request\n    });\n    const supabase = (0,_supabase_ssr__WEBPACK_IMPORTED_MODULE_1__.createServerClient)(\"https://placeholder.supabase.co\", \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder\", {\n        cookies: {\n            getAll () {\n                return request.cookies.getAll();\n            },\n            setAll (cookiesToSet) {\n                cookiesToSet.forEach(({ name, value })=>request.cookies.set(name, value));\n                supabaseResponse = next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.next({\n                    request\n                });\n                cookiesToSet.forEach(({ name, value, options })=>supabaseResponse.cookies.set(name, value, options));\n            }\n        }\n    });\n    // Refresh the session — important: do NOT remove this call.\n    // It silently refreshes the access token if expired.\n    const { data: { user } } = await supabase.auth.getUser();\n    return {\n        supabaseResponse,\n        user\n    };\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKG1pZGRsZXdhcmUpLy4vdXRpbHMvc3VwYWJhc2UvbWlkZGxld2FyZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBa0Q7QUFDVTtBQUU1RDs7OztDQUlDLEdBQ00sZUFBZUUsY0FBY0MsT0FBb0I7SUFDdEQsSUFBSUMsbUJBQW1CSCxxREFBWUEsQ0FBQ0ksSUFBSSxDQUFDO1FBQUVGO0lBQVE7SUFFbkQsTUFBTUcsV0FBV04saUVBQWtCQSxDQUNqQ08saUNBQW9DLEVBQ3BDQSxrREFBeUMsRUFDekM7UUFDRUksU0FBUztZQUNQQztnQkFDRSxPQUFPVCxRQUFRUSxPQUFPLENBQUNDLE1BQU07WUFDL0I7WUFDQUMsUUFBT0MsWUFBWTtnQkFDakJBLGFBQWFDLE9BQU8sQ0FBQyxDQUFDLEVBQUVDLElBQUksRUFBRUMsS0FBSyxFQUFFLEdBQ25DZCxRQUFRUSxPQUFPLENBQUNPLEdBQUcsQ0FBQ0YsTUFBTUM7Z0JBRTVCYixtQkFBbUJILHFEQUFZQSxDQUFDSSxJQUFJLENBQUM7b0JBQUVGO2dCQUFRO2dCQUMvQ1csYUFBYUMsT0FBTyxDQUFDLENBQUMsRUFBRUMsSUFBSSxFQUFFQyxLQUFLLEVBQUVFLE9BQU8sRUFBRSxHQUM1Q2YsaUJBQWlCTyxPQUFPLENBQUNPLEdBQUcsQ0FBQ0YsTUFBTUMsT0FBT0U7WUFFOUM7UUFDRjtJQUNGO0lBR0YsNERBQTREO0lBQzVELHFEQUFxRDtJQUNyRCxNQUFNLEVBQ0pDLE1BQU0sRUFBRUMsSUFBSSxFQUFFLEVBQ2YsR0FBRyxNQUFNZixTQUFTZ0IsSUFBSSxDQUFDQyxPQUFPO0lBRS9CLE9BQU87UUFBRW5CO1FBQWtCaUI7SUFBSztBQUNsQyIsInNvdXJjZXMiOlsiL1VzZXJzL2FkbWluL0RvY3VtZW50cy9Qcm9qZWN0IExpc3Qvc2FsZXNmb3JjZV9tb2JpbGVhcHAvdXRpbHMvc3VwYWJhc2UvbWlkZGxld2FyZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjcmVhdGVTZXJ2ZXJDbGllbnQgfSBmcm9tICdAc3VwYWJhc2Uvc3NyJ1xuaW1wb3J0IHsgTmV4dFJlc3BvbnNlLCB0eXBlIE5leHRSZXF1ZXN0IH0gZnJvbSAnbmV4dC9zZXJ2ZXInXG5cbi8qKlxuICogVXBkYXRlcyB0aGUgU3VwYWJhc2Ugc2Vzc2lvbiBpbiBtaWRkbGV3YXJlLlxuICogUmVmcmVzaGVzIHRoZSBhdXRoIHRva2VuIGlmIGl0J3MgYWJvdXQgdG8gZXhwaXJlLlxuICogTXVzdCBiZSBjYWxsZWQgYXQgdGhlIHRvcCBvZiB5b3VyIG1pZGRsZXdhcmUudHMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGVTZXNzaW9uKHJlcXVlc3Q6IE5leHRSZXF1ZXN0KSB7XG4gIGxldCBzdXBhYmFzZVJlc3BvbnNlID0gTmV4dFJlc3BvbnNlLm5leHQoeyByZXF1ZXN0IH0pXG5cbiAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVTZXJ2ZXJDbGllbnQoXG4gICAgcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMISxcbiAgICBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9BTk9OX0tFWSEsXG4gICAge1xuICAgICAgY29va2llczoge1xuICAgICAgICBnZXRBbGwoKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcXVlc3QuY29va2llcy5nZXRBbGwoKVxuICAgICAgICB9LFxuICAgICAgICBzZXRBbGwoY29va2llc1RvU2V0KSB7XG4gICAgICAgICAgY29va2llc1RvU2V0LmZvckVhY2goKHsgbmFtZSwgdmFsdWUgfSkgPT5cbiAgICAgICAgICAgIHJlcXVlc3QuY29va2llcy5zZXQobmFtZSwgdmFsdWUpXG4gICAgICAgICAgKVxuICAgICAgICAgIHN1cGFiYXNlUmVzcG9uc2UgPSBOZXh0UmVzcG9uc2UubmV4dCh7IHJlcXVlc3QgfSlcbiAgICAgICAgICBjb29raWVzVG9TZXQuZm9yRWFjaCgoeyBuYW1lLCB2YWx1ZSwgb3B0aW9ucyB9KSA9PlxuICAgICAgICAgICAgc3VwYWJhc2VSZXNwb25zZS5jb29raWVzLnNldChuYW1lLCB2YWx1ZSwgb3B0aW9ucylcbiAgICAgICAgICApXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH1cbiAgKVxuXG4gIC8vIFJlZnJlc2ggdGhlIHNlc3Npb24g4oCUIGltcG9ydGFudDogZG8gTk9UIHJlbW92ZSB0aGlzIGNhbGwuXG4gIC8vIEl0IHNpbGVudGx5IHJlZnJlc2hlcyB0aGUgYWNjZXNzIHRva2VuIGlmIGV4cGlyZWQuXG4gIGNvbnN0IHtcbiAgICBkYXRhOiB7IHVzZXIgfSxcbiAgfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXG5cbiAgcmV0dXJuIHsgc3VwYWJhc2VSZXNwb25zZSwgdXNlciB9XG59XG4iXSwibmFtZXMiOlsiY3JlYXRlU2VydmVyQ2xpZW50IiwiTmV4dFJlc3BvbnNlIiwidXBkYXRlU2Vzc2lvbiIsInJlcXVlc3QiLCJzdXBhYmFzZVJlc3BvbnNlIiwibmV4dCIsInN1cGFiYXNlIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX0FOT05fS0VZIiwiY29va2llcyIsImdldEFsbCIsInNldEFsbCIsImNvb2tpZXNUb1NldCIsImZvckVhY2giLCJuYW1lIiwidmFsdWUiLCJzZXQiLCJvcHRpb25zIiwiZGF0YSIsInVzZXIiLCJhdXRoIiwiZ2V0VXNlciJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(middleware)/./utils/supabase/middleware.ts\n");

/***/ }),

/***/ "../app-render/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/server/app-render/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/app-render/action-async-storage.external.js");

/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "./memory-cache.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/lib/incremental-cache/memory-cache.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/lib/incremental-cache/memory-cache.external.js");

/***/ }),

/***/ "./runtime-reacts.external":
/*!**************************************************************!*\
  !*** external "next/dist/server/runtime-reacts.external.js" ***!
  \**************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/runtime-reacts.external.js");

/***/ }),

/***/ "./shared-cache-controls.external":
/*!*******************************************************************************************!*\
  !*** external "next/dist/server/lib/incremental-cache/shared-cache-controls.external.js" ***!
  \*******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/lib/incremental-cache/shared-cache-controls.external.js");

/***/ }),

/***/ "./tags-manifest.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/lib/incremental-cache/tags-manifest.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/lib/incremental-cache/tags-manifest.external.js");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "next/dist/build/adapter/setup-node-env.external":
/*!******************************************************************!*\
  !*** external "next/dist/build/adapter/setup-node-env.external" ***!
  \******************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/build/adapter/setup-node-env.external");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/server/lib/router-utils/instrumentation-globals.external":
/*!*************************************************************************************!*\
  !*** external "next/dist/server/lib/router-utils/instrumentation-globals.external" ***!
  \*************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/lib/router-utils/instrumentation-globals.external");

/***/ }),

/***/ "node:async_hooks":
/*!***********************************!*\
  !*** external "node:async_hooks" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("node:async_hooks");

/***/ }),

/***/ "node:path":
/*!****************************!*\
  !*** external "node:path" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("node:path");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("./webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tslib","vendor-chunks/iceberg-js","vendor-chunks/cookie","vendor-chunks/@swc"], () => (__webpack_exec__("(middleware)/./node_modules/next/dist/build/webpack/loaders/next-middleware-loader.js?absolutePagePath=%2FUsers%2Fadmin%2FDocuments%2FProject%20List%2Fsalesforce_mobileapp%2Fproxy.ts&page=%2Fproxy&rootDir=%2FUsers%2Fadmin%2FDocuments%2FProject%20List%2Fsalesforce_mobileapp&matchers=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();