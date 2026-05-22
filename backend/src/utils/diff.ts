// Auto-generated diff utilities

/**
 * Return keys that differ between two objects.
 */
export function diffObjects<T extends Record<string, any>>(a: T, b: T): string[] {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const diffs: string[] = [];
  for (const key of keys) {
    if (a[key] !== b[key]) {
      diffs.push(key);
    }
  }
  return diffs;
}

/**
 * Return items present in array a but not in array b.
 */
export function diffArrays<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b);
  return a.filter(item => !setB.has(item));
}
