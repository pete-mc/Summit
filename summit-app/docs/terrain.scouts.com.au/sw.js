const options = {
    "workboxURL": "https://cdn.jsdelivr.net/npm/workbox-cdn@5.1.4/workbox/workbox-sw.js",
    "importScripts": [],
    "config": {
        "debug": false
    },
    "cacheOptions": {
        "cacheId": "ScoutsTerrain-prod",
        "directoryIndex": "/",
        "revision": "x3hQKjgT3JS3"
    },
    "clientsClaim": true,
    "skipWaiting": true,
    "cleanupOutdatedCaches": true,
    "offlineAnalytics": true,
    "preCaching": [{
        "revision": "x3hQKjgT3JS3",
        "url": "/additional-awards"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/adventurous-journey"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/basecamp"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/basecamp?youth"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/intro-scouting"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/intro-section"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/members"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/members/units"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/milestones"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/oas"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/oas/alpine"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/oas/aquatics"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/oas/boating"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/oas/bushcraft"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/oas/bushwalking"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/oas/camping"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/oas/cycling"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/oas/paddling"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/oas/vertical"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/personal-development"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/personal-reflection"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/programming"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/programming/risk-assessment"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/sia"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/support"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/terms-and-conditions"
    }, {
        "revision": "x3hQKjgT3JS3",
        "url": "/?standalone=true"
    }],
    "runtimeCaching": [{
        "urlPattern": "https://achievements.develop.scouts.twobulls.dev/.*",
        "handler": "NetworkFirst",
        "method": "GET",
        "strategyPlugins": []
    }, {
        "urlPattern": "https://achievements.feature.scouts.twobulls.dev/.*",
        "handler": "NetworkFirst",
        "method": "GET",
        "strategyPlugins": []
    }, {
        "urlPattern": "https://achievements.release.scouts.twobulls.dev/.*",
        "handler": "NetworkFirst",
        "method": "GET",
        "strategyPlugins": []
    }, {
        "urlPattern": "https://achievements.terrain.scouts.com.au/.*",
        "handler": "NetworkFirst",
        "method": "GET",
        "strategyPlugins": []
    }, {
        "urlPattern": "https://events.develop.scouts.twobulls.dev/.*",
        "handler": "NetworkFirst",
        "method": "GET",
        "strategyPlugins": []
    }, {
        "urlPattern": "https://events.feature.scouts.twobulls.dev/.*",
        "handler": "NetworkFirst",
        "method": "GET",
        "strategyPlugins": []
    }, {
        "urlPattern": "https://events.release.scouts.twobulls.dev/.*",
        "handler": "NetworkFirst",
        "method": "GET",
        "strategyPlugins": []
    }, {
        "urlPattern": "https://events.terrain.scouts.com.au/.*",
        "handler": "NetworkFirst",
        "method": "GET",
        "strategyPlugins": []
    }, {
        "urlPattern": "https://members.develop.scouts.twobulls.dev/.*",
        "handler": "NetworkFirst",
        "method": "GET",
        "strategyPlugins": []
    }, {
        "urlPattern": "https://members.feature.scouts.twobulls.dev/.*",
        "handler": "NetworkFirst",
        "method": "GET",
        "strategyPlugins": []
    }, {
        "urlPattern": "https://members.release.scouts.twobulls.dev/.*",
        "handler": "NetworkFirst",
        "method": "GET",
        "strategyPlugins": []
    }, {
        "urlPattern": "https://members.terrain.scouts.com.au/.*",
        "handler": "NetworkFirst",
        "method": "GET",
        "strategyPlugins": []
    }, {
        "urlPattern": "https://metrics.develop.scouts.twobulls.dev/.*",
        "handler": "NetworkFirst",
        "method": "GET",
        "strategyPlugins": []
    }, {
        "urlPattern": "https://metrics.feature.scouts.twobulls.dev/.*",
        "handler": "NetworkFirst",
        "method": "GET",
        "strategyPlugins": []
    }, {
        "urlPattern": "https://metrics.release.scouts.twobulls.dev/.*",
        "handler": "NetworkFirst",
        "method": "GET",
        "strategyPlugins": []
    }, {
        "urlPattern": "https://metrics.terrain.scouts.com.au/.*",
        "handler": "NetworkFirst",
        "method": "GET",
        "strategyPlugins": []
    }, {
        "urlPattern": "https://templates.develop.scouts.twobulls.dev/.*",
        "handler": "NetworkFirst",
        "method": "GET",
        "strategyPlugins": []
    }, {
        "urlPattern": "https://templates.feature.scouts.twobulls.dev/.*",
        "handler": "NetworkFirst",
        "method": "GET",
        "strategyPlugins": []
    }, {
        "urlPattern": "https://templates.release.scouts.twobulls.dev/.*",
        "handler": "NetworkFirst",
        "method": "GET",
        "strategyPlugins": []
    }, {
        "urlPattern": "https://templates.terrain.scouts.com.au/.*",
        "handler": "NetworkFirst",
        "method": "GET",
        "strategyPlugins": []
    }, {
        "urlPattern": "https://agenda.develop.scouts.twobulls.dev/.*",
        "handler": "NetworkFirst",
        "method": "GET",
        "strategyPlugins": []
    }, {
        "urlPattern": "https://agenda.feature.scouts.twobulls.dev/.*",
        "handler": "NetworkFirst",
        "method": "GET",
        "strategyPlugins": []
    }, {
        "urlPattern": "https://agenda.release.scouts.twobulls.dev/.*",
        "handler": "NetworkFirst",
        "method": "GET",
        "strategyPlugins": []
    }, {
        "urlPattern": "https://agenda.terrain.scouts.com.au/.*",
        "handler": "NetworkFirst",
        "method": "GET",
        "strategyPlugins": []
    }, {
        "urlPattern": "/_nuxt/",
        "handler": "CacheFirst",
        "method": "GET",
        "strategyPlugins": []
    }, {
        "urlPattern": "/",
        "handler": "NetworkFirst",
        "method": "GET",
        "strategyPlugins": []
    }],
    "offlinePage": null,
    "pagesURLPattern": "/",
    "offlineStrategy": "NetworkFirst"
}

importScripts(...[options.workboxURL, ...options.importScripts])

initWorkbox(workbox, options)
workboxExtensions(workbox, options)
precacheAssets(workbox, options)
cachingExtensions(workbox, options)
runtimeCaching(workbox, options)
offlinePage(workbox, options)
routingExtensions(workbox, options)

function getProp(obj, prop) {
    return prop.split('.').reduce((p, c) => p[c], obj)
}

function initWorkbox(workbox, options) {
    if (options.config) {
        // Set workbox config
        workbox.setConfig(options.config)
    }

    if (options.cacheNames) {
        // Set workbox cache names
        workbox.core.setCacheNameDetails(options.cacheNames)
    }

    if (options.clientsClaim) {
        // Start controlling any existing clients as soon as it activates
        workbox.core.clientsClaim()
    }

    if (options.skipWaiting) {
        workbox.core.skipWaiting()
    }

    if (options.cleanupOutdatedCaches) {
        workbox.precaching.cleanupOutdatedCaches()
    }

    if (options.offlineAnalytics) {
        // Enable offline Google Analytics tracking
        workbox.googleAnalytics.initialize()
    }
}

function precacheAssets(workbox, options) {
    if (options.preCaching.length) {
        workbox.precaching.precacheAndRoute(options.preCaching, options.cacheOptions)
    }
}


function runtimeCaching(workbox, options) {
    const requestInterceptor = {
        requestWillFetch({
            request
        }) {
            if (request.cache === 'only-if-cached' && request.mode === 'no-cors') {
                return new Request(request.url, { ...request,
                    cache: 'default',
                    mode: 'no-cors'
                })
            }
            return request
        },
        fetchDidFail(ctx) {
            ctx.error.message =
                '[workbox] Network request for ' + ctx.request.url + ' threw an error: ' + ctx.error.message
            console.error(ctx.error, 'Details:', ctx)
        },
        handlerDidError(ctx) {
            ctx.error.message =
                `[workbox] Network handler threw an error: ` + ctx.error.message
            console.error(ctx.error, 'Details:', ctx)
            return null
        }
    }

    for (const entry of options.runtimeCaching) {
        const urlPattern = new RegExp(entry.urlPattern)
        const method = entry.method || 'GET'

        const plugins = (entry.strategyPlugins || [])
            .map(p => new(getProp(workbox, p.use))(...p.config))

        plugins.unshift(requestInterceptor)

        const strategyOptions = { ...entry.strategyOptions,
            plugins
        }

        const strategy = new workbox.strategies[entry.handler](strategyOptions)

        workbox.routing.registerRoute(urlPattern, strategy, method)
    }
}

function offlinePage(workbox, options) {
    if (options.offlinePage) {
        // Register router handler for offlinePage
        workbox.routing.registerRoute(new RegExp(options.pagesURLPattern), ({
            request,
            event
        }) => {
            const strategy = new workbox.strategies[options.offlineStrategy]
            return strategy
                .handle({
                    request,
                    event
                })
                .catch(() => caches.match(options.offlinePage))
        })
    }
}

function workboxExtensions(workbox, options) {

}

function cachingExtensions(workbox, options) {
    workbox.precaching.precacheAndRoute([{
        "revision": "a13a1743571b74abfd456b455143206d",
        "url": "default/_nuxt/0a3b0f6.js"
    }, {
        "revision": "ead603e81be4cd12b0d90e9ddaeac1bd",
        "url": "default/_nuxt/235.ef1560dff05b5e2319c6.js"
    }, {
        "revision": "8cd5e7a653df6ceb55516500d9a55690",
        "url": "default/_nuxt/app.21ef2a2f0b1727b63ea0.js"
    }, {
        "revision": "ce0a4e80551359a89d9088783cdbf6ae",
        "url": "default/_nuxt/pages/oas/index.1cd429bee21aac31735c.js"
    }, {
        "revision": "dc7d61ad7de8d0994a699bd8c9a82250",
        "url": "default/oas/index.html"
    }, {
        "revision": "dc1ac0de13d5bd1b2552913e15a6f4e1",
        "url": "default/_nuxt/components/oas-overview.352cf38fc2f40043a1ee.js"
    }, {
        "revision": "8588f47f349cf99ceb5bc95175f220c2",
        "url": "default/_nuxt/components/oas-stage-sidebar-content.ad0fd9ba137a8d9aa9fe.js"
    }, {
        "revision": "98e77681a610d59a614273c36e9630fd",
        "url": "default/_nuxt/components/oas-stage-sidebar.194f8601b1b9e521502f.js"
    }, {
        "revision": "a64c4200b309bac98c032558a9f0e68c",
        "url": "default/_nuxt/components/oas-stage.629c0bfe84f606f869e8.js"
    }, {
        "revision": "be0e341b1acad424a47e39d122781763",
        "url": "default/_nuxt/components/oas-stream-card.bb53d7614dccf27b750e.js"
    }, {
        "revision": "05a21bfebb26baf7649e84bbc1e9bdfa",
        "url": "default/_nuxt/components/oas-stream-tree-node.1724aba96128d2d70403.js"
    }, {
        "revision": "0a0766c9281b65ac303ecf5a0c86e681",
        "url": "default/_nuxt/components/oas-stream-tree.b1b8ba06f360820f159d.js"
    }, {
        "revision": "dbb1a057772e4d0c7ad9bf7708ba1b97",
        "url": "default/_nuxt/components/oas-stream.d251df155d6314edb9d6.js"
    }, {
        "revision": "109fb18b7577d61fd5988450762e26d8",
        "url": "default/_nuxt/components/oas-sub-description-small.91acecffd0ce1c788ebc.js"
    }, {
        "revision": "beea48b71fdc2601e18a700d1e00a87d",
        "url": "default/_nuxt/img/oas--side.--caef4b9.svg"
    }, {
        "revision": "100ef4a6075d8269255a9726eb404afa",
        "url": "default/_nuxt/img/oas--welcome.--ed96021.svg"
    }, {
        "revision": "525325119a4e984639ffd800cc458548",
        "url": "default/_nuxt/img/oas-alpine--selected.--bd39342.svg"
    }, {
        "revision": "93fb5a5016ee6d71e5b763e99f2582c3",
        "url": "default/_nuxt/img/oas-alpine--unselected.--b2fcfea.svg"
    }, {
        "revision": "856cd6071514cc49b62927d5a049bc4e",
        "url": "default/_nuxt/img/oas-aquatics--selected.--11f1133.svg"
    }, {
        "revision": "242ffc2c1f912f015703546d5dd3f3ab",
        "url": "default/_nuxt/img/oas-aquatics--unselected.--10c218e.svg"
    }, {
        "revision": "3dd139ce2a4df7046480f5e0d5349452",
        "url": "default/_nuxt/img/oas-boating--selected.--37fc38a.svg"
    }, {
        "revision": "5f6dd0d39af2a9ad77960afa44a45a5a",
        "url": "default/_nuxt/img/oas-boating--unselected.--82998a5.svg"
    }, {
        "revision": "de8b466884b2dc9eceb98a2bdf3bdb7a",
        "url": "default/_nuxt/img/oas-bushcraft--selected.--50d203a.svg"
    }, {
        "revision": "c923fbe3a805a5e311fd91873da35650",
        "url": "default/_nuxt/img/oas-bushcraft--unselected.--939c8b6.svg"
    }, {
        "revision": "d0d8c47f9ab0b065ac57ba9c020b2afe",
        "url": "default/_nuxt/img/oas-bushwalking--selected.--b104d55.svg"
    }, {
        "revision": "e5d956adbf2b2e0d9c0efb2ead353ad0",
        "url": "default/_nuxt/img/oas-bushwalking--unselected.--fa6f775.svg"
    }, {
        "revision": "7f8262a21a437c2ea2402ce2ec3eab52",
        "url": "default/_nuxt/img/oas-padding--unselected.--4deec5a.svg"
    }, {
        "revision": "1da4c26d2941283fa440b27f90f0eb69",
        "url": "default/_nuxt/img/oas-paddling--selected.--64cf458.svg"
    }, {
        "revision": "d3ac3a15bd09967ce53ce16867c146bf",
        "url": "default/_nuxt/img/oas-vertical--selected.--4f3d104.svg"
    }, {
        "revision": "3cac1cec1ea2cb9972ca4f79c6b2b857",
        "url": "default/_nuxt/pages/oas/_stream/_stage/_stage.e61903fefb2e9e414337.js"
    }, {
        "revision": "5ccef9e0d57bdd0b65b14c83c2a1eb81",
        "url": "default/_nuxt/pages/oas/_stream/index.ce08dbe1600a575e891b.js"
    }, {
        "revision": "4c39ba8f344cfe83fd7ce898f10d2d2e",
        "url": "default/images/error--offline.svg"
    }, {
        "revision": "08f2e29132c550f5c09dfc2faaeed75e",
        "url": "default/images/image-placeholder-dark.svg"
    }, {
        "revision": "fe68ff177226bb77eee0c24d8e1d000f",
        "url": "default/images/image-placeholder-large-light.svg"
    }, {
        "revision": "372d248dc58c215688bdb3f1c60cbcb1",
        "url": "default/images/image-placeholder-light.svg"
    }, {
        "revision": "7c1221097a0f9172dd976a5623956cdc",
        "url": "default/images/logo-scouts-terrain-inline-inverted.svg"
    }, {
        "revision": "614e3033474f435add389a7ae6a29d37",
        "url": "default/_nuxt/fonts/NunitoSans-Light.11a9ce2.woff2"
    }, {
        "revision": "29a974775a8f152e321c3c791176a9ba",
        "url": "default/_nuxt/fonts/NunitoSans-Regular.2dbe377.woff2"
    }, {
        "revision": "2a7fabf1796c1b2b6dfd1b1b0b846cbb",
        "url": "default/_nuxt/fonts/NunitoSans-SemiBold.f916bc2.woff2"
    }])
}

function routingExtensions(workbox, options) {

}