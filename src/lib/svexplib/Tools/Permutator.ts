export function getPermutations<T>(arrays: T[][]): T[][] {
  return arrays.reduce(
    (acc, curr) => {
      return acc.flatMap((accItem) => curr.map((currItem) => [...accItem, currItem]));
    },
    [[]] as T[][],
  );
}

export function allccgPermutations<T>(avatars: T[], choices: T[]): T[][] {
    // 1. Pick p1 from avatars
    // 2. For that p1, pick p2 from avatars (can be same as p1)
    // 3. For those avatars, pick choice1 from choices
    // 4. For those avatars, pick choice2 from choices (cannot be same as choice1)
    // 5. Repeat for all avatars and choices
    const permutations: T[][] = [];
    for (const p1 of avatars) {
        for (const p2 of avatars) {
            for (const choice1 of choices) {
                for (const choice2 of choices) {
                    if (choice1 !== choice2) {
                        permutations.push([p1, p2, choice1, choice2]);
                    }
                }
            }
        }
    }
    return permutations;
}
