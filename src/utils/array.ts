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
