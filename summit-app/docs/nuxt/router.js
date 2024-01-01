/**
 * Vue Router - Route:
 * A route in Vue Router is a mapping between a URL path and a component. 
 * Each route maps a path to a component which will be rendered when the path is visited in the browser.
 * Routes can be defined with various properties like path, name, component(s), children (for nested routes), and navigation guards.
 * Routes also support dynamic segments, which are parts of the URL that can change, captured as params in the component.
 * Example of a Route: { path: '/user/:id', component: UserComponent, name: 'user' }
 * Here, visiting /user/123 will render the UserComponent, with '123' as the value of $route.params.id.
 */


// Assuming you have access to the $nuxt object
const nuxtRouter = window.$nuxt.$router;

const nuxtRouterBoilerplate = {
      // Navigate to a different route
      navigateTo(route) {
        if (typeof route === 'string') {
            window.$nuxt.$router.push(route);
        } else {
            // route is an object with additional options
            window.$nuxt.$router.push({
                path: route.path,
                name: route.name,
                query: route.query, // Object representing the URL query parameters
                params: route.params, // Object representing dynamic segments of the path
                hash: route.hash, // URL hash fragment (e.g., #section-name)
                // Additional options like `replace` or `append` can also be included
            });
        }
    },

    // Replace the current route
    replaceRoute(path) {
        nuxtRouter.replace(path);
    },

    // Go back to the previous page
    goBack() {
        nuxtRouter.go(-1);
    },

    // Go forward to the next page
    goForward() {
        nuxtRouter.go(1);
    },

    // Get the current route
    getCurrentRoute() {
        return nuxtRouter.currentRoute;
    },

    // Check if a route exists
    checkRouteExists(path) {
        return nuxtRouter.resolve(path).route.matched.length > 0;
    },

    // Add a new route (Note: Use with caution)
    addRoute(parentName, route) {
      window.$nuxt.$router.addRoutes([
          {
              path: route.path,
              name: route.name,
              component: route.component,
              children: route.children, // Array of child route objects
              beforeEnter: route.beforeEnter, // Guard specific for this route
              meta: route.meta, // Meta tags for this route
              // Other route-specific options can also be added here
          }
      ], parentName); // Optionally specify a parent route name
  },
  
    // List all registered routes
    listRoutes() {
        return nuxtRouter.options.routes;
    },

    // Properties of the router
    properties: {
        mode: nuxtRouter.mode,
        base: nuxtRouter.base,
        currentRoute: nuxtRouter.currentRoute,
    }
};

// Example Usage
console.log('Current Route:', getCurrentRoute());
navigateTo('/about');
navigateTo({ path: '/user', query: { id: '123' }, hash: '#profile' });

// Add a new dynamic route (example)
addRoute('', { 
  path: '/new-route', 
  name: 'newRoute', 
  component: NewRouteComponent,
  meta: { requiresAuth: true }
});

// Vue Router Navigation Guards
const router = new VueRouter({ ... });

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
        // Check for authentication
        if (!isLoggedIn()) {
            next('/login');
        } else {
            next();
        }
    } else {
        next();
    }
});
