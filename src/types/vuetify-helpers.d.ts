/**
 * Vuetify 2.7's own sort helper (the function v-data-table sorts with), from its CommonJS build.
 * Vuetify ships no type declarations for its util folder. Only what Summit uses is declared:
 * see PresentAwardsTableVue's sortPresentAwardRows (.claude/Excel/PLAN_STAGE_3.md).
 */
declare module "vuetify/es5/util/helpers" {
  export function sortItems<T>(items: T[], sortBy: string[], sortDesc: boolean[], locale: string, customSorters?: Record<string, (a: unknown, b: unknown) => number>): T[];
}
