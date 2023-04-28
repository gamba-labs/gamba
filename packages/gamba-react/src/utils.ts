export const randomSeed = (len = 16) =>
  Array.from({ length: len }).map(() =>
    (Math.random() * 16 | 0).toString(16),
  ).join('')
