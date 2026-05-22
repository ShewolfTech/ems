// Auto-generated compose utilities

/**
 * Compose functions from right to left.
 * Example: compose(f, g, h)(x) === f(g(h(x)))
 */
export function compose<T>(...fns: Array<(arg: T) => T>) {
  return (initial: T): T => fns.reduceRight((acc, fn) => fn(acc), initial);
}

/**
 * Pipe functions from left to right.
 * Example: pipe(f, g, h)(x) === h(g(f(x)))
 */
export function pipe<T>(...fns: Array<(arg: T) => T>) {
  return (initial: T): T => fns.reduce((acc, fn) => fn(acc), initial);
}

/**
 * Async version of pipe for Promise-returning functions.
 */
export function pipeAsync<T>(...fns: Array<(arg: T) => Promise<T>>) {
  return async (initial: T): Promise<T> => {
    let acc = initial;
    for (const fn of fns) {
      acc = await fn(acc);
    }
    return acc;
  };
}
