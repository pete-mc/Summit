interface NavMenuComponent extends Vue {
  items: Array<NavMenuItem>;
}

export interface NavMenuItem {
  title: string;
  to: string;
  items: NavMenuItem[];
  locked: boolean;
  roles: boolean[];
}
