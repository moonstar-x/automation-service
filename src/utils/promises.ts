import { splitArrayByCount } from '@utils/array';

export const sleep = (timeMilliseconds: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeMilliseconds);
  });
};

export type PromiseFunction<T> = () => Promise<T>;

export interface BatchPromiseOptions {
  batch: number
  interval: number
}

export const batchPromises = <T>(promises: PromiseFunction<T>[], options: BatchPromiseOptions): Promise<T[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const batches = splitArrayByCount(promises, options.batch);
      let result: T[] = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        result = result.concat(await Promise.all(batch.map((fn) => fn())));

        if (i < batches.length - 1) {
          await sleep(options.interval);
        }
      }

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};
