// eslint-disable-next-line @typescript-eslint/no-unused-vars
let Vue = window.$nuxt.$root && window.$nuxt.$root.constructor;

let VueInstance = window.$nuxt.$root;

function findNavMenuComponent(instance, name) {
  if (instance.$options.name === name) {
    return instance;
  }
  for (let child of instance.$children) {
    let found = findNavMenuComponent(child);
    if (found) {
      return found;
    }
  }
  return null;
}

const navMenuComponent = findNavMenuComponent(VueInstance, "NavMenu");

let roles = [true, false];
navMenuComponent.items.push({ title: "Basecamp", to: "/basecamp", items: [], locked: false, roles });

navMenuComponent.$data.drawer = !navMenuComponent.$data.drawer; //flip this back and forth to force a re-render
navMenuComponent.$data.drawer = !navMenuComponent.$data.drawer;
