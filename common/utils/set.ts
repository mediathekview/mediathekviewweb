export function intersectSets<T>(...sets: Set<T>[]): Set<T> {
  const intersection = new Set<T>();

  const sortedSets = [...sets].sort((a, b) => a.size - b.size);
  const smallestSet = sortedSets[0];

  for (const value of smallestSet) {
    let intersects = true;

    for (let i = 1; i < sortedSets.length; i++) {
      const set = sortedSets[i];

      const has = set.has(value);
      if (!has) {
        intersects = false;
        break;
      }
    }

    if (intersects) {
      intersection.add(value);
    }
  }

  return intersection;
}

export function differenceSets<T>(base: Set<T>, ...sets: Set<T>[]): Set<T> {
  const difference = new Set<T>();

  for (const value of base) {
    let unique = true;

    for (const set of sets) {
      const has = set.has(value);

      if (has) {
        unique = false;
        break;
      }
    }

    if (unique) {
      difference.add(value);
    }
  }

  return difference;
}

export function unionSets<T>(...sets: Set<T>[]): Set<T> {
  const union = new Set<T>();

  for (const set of sets) {
    for (const value of set) {
      union.add(value);
    }
  }

  return union;
}

