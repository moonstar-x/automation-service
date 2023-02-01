import { splitArrayByCount } from './array';

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

      for (const batch of batches) {
        const batchResult = await Promise.all(batch.map((fn) => fn()));
        await sleep(options.interval);
        result = result.concat(batchResult);
      }

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};
