import { NavMenuComponent, NavMenuItem } from "src/types/NavMenu";
import { FindComponent } from ".";

function addMenuItems(items: NavMenuItem[]) {
  const VueInstance = window.$nuxt.$root;
  const navMenuComponent: NavMenuComponent = FindComponent("NavMenu", VueInstance) as NavMenuComponent;
  if (navMenuComponent) {
    for (let i = 0; i < items.length; i++) {
      navMenuComponent.items.push(items[i]);
    }
    //flip this back and forth to force a re-render
    navMenuComponent.$data.drawer = !navMenuComponent.$data.drawer;
    navMenuComponent.$data.drawer = !navMenuComponent.$data.drawer;
  }
}

export default function AddMenuItems(items: NavMenuItem[]) {
  window.$nuxt.$nextTick(() => {
    addMenuItems(items);
  });
}
