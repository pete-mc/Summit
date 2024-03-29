// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function HasPropAtPath(obj: Record<string, any>, path: string, value: any): boolean {
  const pathParts = path.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = obj;
  for (const part of pathParts) {
    if (current[part] === undefined) {
      return false;
    }
    current = current[part];
  }

  return current === value;
}
