interface Map<K, V> {
  intersect(...maps: Map<K, V>[]): Map<K, V>;
  difference(...maps: Map<K, V>[]): Map<K, V>;
  union(...maps: Map<K, V>[]): Map<K, V>;
}

(() => {
  function intersect<K, V>(this: Map<K, V>, ...maps: Map<K, V>[]): Map<K, V> {
    const intersection = new Map<K, V>();

    maps.push(this);
    maps = maps.sort((a, b) => a.size - b.size);

    const smallestMap = maps[0];

    for (const [key, value] of smallestMap) {
      let intersects = true;

      for (let i = 1; i < maps.length; i++) {
        const map = maps[i];

        const has = map.has(key);
        if (!has) {
          intersects = false;
          break;
        }
      }

      if (intersects) {
        intersection.set(key, value);
      }
    }

    return intersection;
  }

  function difference<K, V>(this: Map<K, V>, ...maps: Map<K, V>[]): Map<K, V> {
    const difference = new Map<K, V>();

    for (const [key, value] of this) {
      let unique = true;

      for (const map of maps) {
        const has = map.has(key);

        if (has) {
          unique = false;
          break;
        }
      }

      if (unique) {
        difference.set(key, value);
      }
    }

    return difference;
  }

  function union<K, V>(this: Map<K, V>, ...maps: Map<K, V>[]): Map<K, V> {
    const union = new Map<K, V>(this);

    for (const map of maps) {
      for (const [key, value] of map) {
        union.set(key, value);
      }
    }

    return union;
  }

  if (Map.prototype.intersect == undefined) {
    Map.prototype.intersect = intersect;
  }

  if (Map.prototype.difference == undefined) {
    Map.prototype.difference = difference;
  }

  if (Map.prototype.union == undefined) {
    Map.prototype.union = union;
  }
})();
