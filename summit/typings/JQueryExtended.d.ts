declare global {
  interface JQuery {
    xpath(expr: string): JQuery<Node[]>;
  }
}
export {};
