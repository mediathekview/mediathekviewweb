export function intersectMaps<K, V>(...maps: Map<K, V>[]): Map<K, V> {
  const intersection = new Map<K, V>();

  const sortedMaps = [...maps].sort((a, b) => a.size - b.size);
  const smallestMap = sortedMaps[0];

  for (const [key, value] of smallestMap) {
    let intersects = true;

    for (let i = 1; i < sortedMaps.length; i++) {
      const map = sortedMaps[i];

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

export function differenceMaps<K, V>(base: Map<K, V>, ...maps: Map<K, V>[]): Map<K, V> {
  const difference = new Map<K, V>();

  for (const [key, value] of base) {
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

export function unionMaps<K, V>(...maps: Map<K, V>[]): Map<K, V> {
  const union = new Map<K, V>();

  for (const map of maps) {
    for (const [key, value] of map) {
      union.set(key, value);
    }
  }

  return union;
}
