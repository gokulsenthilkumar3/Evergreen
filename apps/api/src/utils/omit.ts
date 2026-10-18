/** Returns a shallow copy of `value` without the given keys. */
export function omit<T extends object, K extends keyof T>(
  value: T,
  keys: readonly K[],
): Omit<T, K> {
  const dropped = new Set<PropertyKey>(keys);
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => !dropped.has(key)),
  ) as Omit<T, K>;
}
