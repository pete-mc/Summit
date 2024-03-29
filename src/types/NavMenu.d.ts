interface NavMenuComponent extends Vue {
  items: NavMenuItem[];
  $data: { drawer: boolean };
}

export interface NavMenuItem {
  title: string;
  to?: string;
  items: NavMenuItem[];
  locked: boolean;
  roles: boolean[];
}
