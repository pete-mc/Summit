export default function FindComponent(componentName: string, instance: Vue): Vue | null {
  if (instance.$options.name === componentName) {
    return instance;
  }
  for (const child of instance.$children) {
    const found = FindComponent(componentName, child);
    if (found != null) {
      return found;
    }
  }
  return null;
}
