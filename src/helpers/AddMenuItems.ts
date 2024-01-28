import { type NavMenuComponent, type NavMenuItem } from '@/types/NavMenu'
import { FindComponent } from '.'

function addMenuItems (items: NavMenuItem[]): void {
  const navMenuComponent: NavMenuComponent = FindComponent('NavMenu', window.$nuxt.$root as Vue) as NavMenuComponent
  if (navMenuComponent != null) {
    for (let i = 0; i < items.length; i++) {
      navMenuComponent.items.push(items[i])
    }
    // flip this back and forth to force a re-render
    navMenuComponent.$data.drawer = !(navMenuComponent.$data.drawer)
    navMenuComponent.$data.drawer = !(navMenuComponent.$data.drawer)
  }
}

export default function AddMenuItems (items: NavMenuItem[]): void {
  window.$nuxt.$nextTick(() => {
    addMenuItems(items)
  })
}
