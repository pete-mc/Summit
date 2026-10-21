/** Vuetify ships no types for its util folder; only what Summit uses is declared. */
declare module "vuetify/es5/util/helpers" {
  export function sortItems<T>(items: T[], sortBy: string[], sortDesc: boolean[], locale: string, customSorters?: Record<string, (a: unknown, b: unknown) => number>): T[];
}
