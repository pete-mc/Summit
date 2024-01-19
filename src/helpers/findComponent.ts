export function findComponent(componentName: string, instance: Vue): Vue | null {
  if (instance.$options.name === componentName) {
    return instance;
  }
  for (const child of instance.$children) {
    const found = findComponent(componentName, child);
    if (found) {
      return found;
    }
  }
  return null;
}
