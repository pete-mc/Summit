const options = {"workboxURL":"https://cdn.jsdelivr.net/npm/workbox-cdn@5.1.4/workbox/workbox-sw.js","importScripts":[],"config":{"debug":false},"cacheOptions":{"cacheId":"ScoutsTerrain-prod","directoryIndex":"/","revision":"rJpOvsLAVd2y"},"clientsClaim":true,"skipWaiting":true,"cleanupOutdatedCaches":true,"offlineAnalytics":true,"preCaching":[{"revision":"rJpOvsLAVd2y","url":"/additional-awards"},{"revision":"rJpOvsLAVd2y","url":"/adventurous-journey"},{"revision":"rJpOvsLAVd2y","url":"/basecamp"},{"revision":"rJpOvsLAVd2y","url":"/basecamp?youth"},{"revision":"rJpOvsLAVd2y","url":"/intro-scouting"},{"revision":"rJpOvsLAVd2y","url":"/intro-section"},{"revision":"rJpOvsLAVd2y","url":"/members"},{"revision":"rJpOvsLAVd2y","url":"/members/units"},{"revision":"rJpOvsLAVd2y","url":"/milestones"},{"revision":"rJpOvsLAVd2y","url":"/oas"},{"revision":"rJpOvsLAVd2y","url":"/oas/alpine"},{"revision":"rJpOvsLAVd2y","url":"/oas/aquatics"},{"revision":"rJpOvsLAVd2y","url":"/oas/boating"},{"revision":"rJpOvsLAVd2y","url":"/oas/bushcraft"},{"revision":"rJpOvsLAVd2y","url":"/oas/bushwalking"},{"revision":"rJpOvsLAVd2y","url":"/oas/camping"},{"revision":"rJpOvsLAVd2y","url":"/oas/cycling"},{"revision":"rJpOvsLAVd2y","url":"/oas/paddling"},{"revision":"rJpOvsLAVd2y","url":"/oas/vertical"},{"revision":"rJpOvsLAVd2y","url":"/personal-development"},{"revision":"rJpOvsLAVd2y","url":"/personal-reflection"},{"revision":"rJpOvsLAVd2y","url":"/programming"},{"revision":"rJpOvsLAVd2y","url":"/programming/risk-assessment"},{"revision":"rJpOvsLAVd2y","url":"/sia"},{"revision":"rJpOvsLAVd2y","url":"/support"},{"revision":"rJpOvsLAVd2y","url":"/terms-and-conditions"},{"revision":"rJpOvsLAVd2y","url":"/?standalone=true"}],"runtimeCaching":[{"urlPattern":"https://achievements.develop.scouts.twobulls.dev/.*","handler":"NetworkFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"https://achievements.feature.scouts.twobulls.dev/.*","handler":"NetworkFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"https://achievements.release.scouts.twobulls.dev/.*","handler":"NetworkFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"https://achievements.terrain.scouts.com.au/.*","handler":"NetworkFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"https://events.develop.scouts.twobulls.dev/.*","handler":"NetworkFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"https://events.feature.scouts.twobulls.dev/.*","handler":"NetworkFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"https://events.release.scouts.twobulls.dev/.*","handler":"NetworkFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"https://events.terrain.scouts.com.au/.*","handler":"NetworkFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"https://members.develop.scouts.twobulls.dev/.*","handler":"NetworkFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"https://members.feature.scouts.twobulls.dev/.*","handler":"NetworkFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"https://members.release.scouts.twobulls.dev/.*","handler":"NetworkFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"https://members.terrain.scouts.com.au/.*","handler":"NetworkFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"https://metrics.develop.scouts.twobulls.dev/.*","handler":"NetworkFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"https://metrics.feature.scouts.twobulls.dev/.*","handler":"NetworkFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"https://metrics.release.scouts.twobulls.dev/.*","handler":"NetworkFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"https://metrics.terrain.scouts.com.au/.*","handler":"NetworkFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"https://templates.develop.scouts.twobulls.dev/.*","handler":"NetworkFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"https://templates.feature.scouts.twobulls.dev/.*","handler":"NetworkFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"https://templates.release.scouts.twobulls.dev/.*","handler":"NetworkFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"https://templates.terrain.scouts.com.au/.*","handler":"NetworkFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"https://agenda.develop.scouts.twobulls.dev/.*","handler":"NetworkFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"https://agenda.feature.scouts.twobulls.dev/.*","handler":"NetworkFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"https://agenda.release.scouts.twobulls.dev/.*","handler":"NetworkFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"https://agenda.terrain.scouts.com.au/.*","handler":"NetworkFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"/_nuxt/","handler":"CacheFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"/","handler":"NetworkFirst","method":"GET","strategyPlugins":[]}],"offlinePage":null,"pagesURLPattern":"/","offlineStrategy":"NetworkFirst"}

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
    requestWillFetch({ request }) {
      if (request.cache === 'only-if-cached' && request.mode === 'no-cors') {
        return new Request(request.url, { ...request, cache: 'default', mode: 'no-cors' })
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
      .map(p => new (getProp(workbox, p.use))(...p.config))

    plugins.unshift(requestInterceptor)

    const strategyOptions = { ...entry.strategyOptions, plugins }

    const strategy = new workbox.strategies[entry.handler](strategyOptions)

    workbox.routing.registerRoute(urlPattern, strategy, method)
  }
}

function offlinePage(workbox, options) {
  if (options.offlinePage) {
    // Register router handler for offlinePage
    workbox.routing.registerRoute(new RegExp(options.pagesURLPattern), ({ request, event }) => {
      const strategy = new workbox.strategies[options.offlineStrategy]
      return strategy
        .handle({ request, event })
        .catch(() => caches.match(options.offlinePage))
    })
  }
}

function workboxExtensions(workbox, options) {
  
}

function cachingExtensions(workbox, options) {
  workbox.precaching.precacheAndRoute([{"revision":"738eea3171bd255568e74556d7d3f65b","url":"default/_nuxt/266.6d77a1d92ccefddff80e.js"},{"revision":"744f204e14d4449c8aeee51323f1f156","url":"default/_nuxt/app.b1920f6e0e9f191f52fe.js"},{"revision":"1947634dd14015f9f47eae3be6198d09","url":"default/_nuxt/c2970e7.js"},{"revision":"c3d6ab184686b99097d1ab30f678d83a","url":"default/_nuxt/pages/oas/index.0479ec481cbafa4ff6d6.js"},{"revision":"8773dd9ae77f890199a9987ce4c1759b","url":"default/oas/index.html"},{"revision":"e8ff63779d0d5f5141d46589532c3959","url":"default/_nuxt/components/oas-overview.69074814946feab08a39.js"},{"revision":"5ba806f8c27ed082b057f79a2c6628ab","url":"default/_nuxt/components/oas-stage-sidebar-content.96adc3035d7181e2c228.js"},{"revision":"0615c298569590107893e8522663a88a","url":"default/_nuxt/components/oas-stage-sidebar.4324f1bbfaf738755be6.js"},{"revision":"59b90fe2080c05310386d8638fca1330","url":"default/_nuxt/components/oas-stage.540eda4517aa0234c787.js"},{"revision":"b481edd6a573f678fa14aa9fc8f2a9e6","url":"default/_nuxt/components/oas-stream-card.a224beeb414da22a40de.js"},{"revision":"cdfbf6454e0f04ee7f8f69a2b355df58","url":"default/_nuxt/components/oas-stream-tree-node.515b52411ffdae54d9aa.js"},{"revision":"83e5b27c49d846faaceab39ef0c4fd35","url":"default/_nuxt/components/oas-stream-tree.5adbedff06d18677d15a.js"},{"revision":"edc8cc21b792cff9dc32e6904594f1f7","url":"default/_nuxt/components/oas-stream.bf209bcd3eab1996ea3f.js"},{"revision":"be22fe01efad948839bda0e5486dd744","url":"default/_nuxt/components/oas-sub-description-small.96ea6b9550112838098f.js"},{"revision":"beea48b71fdc2601e18a700d1e00a87d","url":"default/_nuxt/img/oas--side.--beea48b.svg"},{"revision":"100ef4a6075d8269255a9726eb404afa","url":"default/_nuxt/img/oas--welcome.--100ef4a.svg"},{"revision":"525325119a4e984639ffd800cc458548","url":"default/_nuxt/img/oas-alpine--selected.--5253251.svg"},{"revision":"93fb5a5016ee6d71e5b763e99f2582c3","url":"default/_nuxt/img/oas-alpine--unselected.--93fb5a5.svg"},{"revision":"856cd6071514cc49b62927d5a049bc4e","url":"default/_nuxt/img/oas-aquatics--selected.--856cd60.svg"},{"revision":"242ffc2c1f912f015703546d5dd3f3ab","url":"default/_nuxt/img/oas-aquatics--unselected.--242ffc2.svg"},{"revision":"3dd139ce2a4df7046480f5e0d5349452","url":"default/_nuxt/img/oas-boating--selected.--3dd139c.svg"},{"revision":"5f6dd0d39af2a9ad77960afa44a45a5a","url":"default/_nuxt/img/oas-boating--unselected.--5f6dd0d.svg"},{"revision":"de8b466884b2dc9eceb98a2bdf3bdb7a","url":"default/_nuxt/img/oas-bushcraft--selected.--de8b466.svg"},{"revision":"c923fbe3a805a5e311fd91873da35650","url":"default/_nuxt/img/oas-bushcraft--unselected.--c923fbe.svg"},{"revision":"d0d8c47f9ab0b065ac57ba9c020b2afe","url":"default/_nuxt/img/oas-bushwalking--selected.--d0d8c47.svg"},{"revision":"e5d956adbf2b2e0d9c0efb2ead353ad0","url":"default/_nuxt/img/oas-bushwalking--unselected.--e5d956a.svg"},{"revision":"7f8262a21a437c2ea2402ce2ec3eab52","url":"default/_nuxt/img/oas-padding--unselected.--7f8262a.svg"},{"revision":"1da4c26d2941283fa440b27f90f0eb69","url":"default/_nuxt/img/oas-paddling--selected.--1da4c26.svg"},{"revision":"d3ac3a15bd09967ce53ce16867c146bf","url":"default/_nuxt/img/oas-vertical--selected.--d3ac3a1.svg"},{"revision":"210d985daba19ab41945d2a64afed4f6","url":"default/_nuxt/pages/oas/_stream/_stage/_stage.f6f104534bb117ac05b1.js"},{"revision":"bb822c749b9653263270d3c152a58cdb","url":"default/_nuxt/pages/oas/_stream/index.c5f7b4e0f5d9964feb9b.js"},{"revision":"4c39ba8f344cfe83fd7ce898f10d2d2e","url":"default/images/error--offline.svg"},{"revision":"08f2e29132c550f5c09dfc2faaeed75e","url":"default/images/image-placeholder-dark.svg"},{"revision":"fe68ff177226bb77eee0c24d8e1d000f","url":"default/images/image-placeholder-large-light.svg"},{"revision":"372d248dc58c215688bdb3f1c60cbcb1","url":"default/images/image-placeholder-light.svg"},{"revision":"fe06be293d4abbd58c1968fa3d99e41b","url":"default/images/logo-scouts-terrain-inline-inverted.svg"},{"revision":"614e3033474f435add389a7ae6a29d37","url":"default/_nuxt/fonts/NunitoSans-Light.614e303.woff2"},{"revision":"29a974775a8f152e321c3c791176a9ba","url":"default/_nuxt/fonts/NunitoSans-Regular.29a9747.woff2"},{"revision":"2a7fabf1796c1b2b6dfd1b1b0b846cbb","url":"default/_nuxt/fonts/NunitoSans-SemiBold.2a7fabf.woff2"}])
}

function routingExtensions(workbox, options) {
  
}
