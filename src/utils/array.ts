export const splitArrayByCount = <T>(arr: T[], count: number): T[][] => {
  if (count < 1) {
    throw new RangeError('Count must be greater than 1.');
  }

  const finalArray: T[][] = Array(Math.ceil(arr.length / count)).fill(null).map(() => []);

  return arr.reduce((table, cur, idx) => {
    const outputIdx = Math.floor(idx / count);
    table[outputIdx].push(cur);
    return table;
  }, finalArray);
};

export const containsAll = (arr1: unknown[], arr2: unknown[]): boolean => {
  return arr2.every((arr2Item) => arr1.includes(arr2Item));
};

export const sameArrays = (arr1: unknown[], arr2: unknown[]): boolean => {
  return containsAll(arr1, arr2) && containsAll(arr2, arr1);
};

export const randomItemFromArray = <T>(arr: T[]): T => {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
};
