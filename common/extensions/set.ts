interface Set<T> {
  intersect(...sets: Set<T>[]): Set<T>;
  difference(...sets: Set<T>[]): Set<T>;
  union(...sets: Set<T>[]): Set<T>;
}

(() => {
  function intersect<T>(this: Set<T>, ...sets: Set<T>[]): Set<T> {
    const intersection = new Set<T>();

    sets.push(this);
    sets = sets.sort((a, b) => a.size - b.size);

    const smallestSet = sets[0];

    for (const value of smallestSet) {
      let intersects = true;

      for (let i = 1; i < sets.length; i++) {
        const set = sets[i];

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

  function difference<T>(this: Set<T>, ...sets: Set<T>[]): Set<T> {
    const difference = new Set<T>();

    for (const value of this) {
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

  function union<T>(this: Set<T>, ...sets: Set<T>[]): Set<T> {
    const union = new Set<T>(this);

    for (const set of sets) {
      for (const value of set) {
        union.add(value);
      }
    }

    return union;
  }

  if (Set.prototype.intersect == undefined) {
    Set.prototype.intersect = intersect;
  }

  if (Set.prototype.difference == undefined) {
    Set.prototype.difference = difference;
  }

  if (Set.prototype.union == undefined) {
    Set.prototype.union = union;
  }
})();
