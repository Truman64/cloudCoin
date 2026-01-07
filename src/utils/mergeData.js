export function mergeLastSeen(resultsBySource) {
  const map = new Map();

  Object.entries(resultsBySource).forEach(([source, list]) => {
    if (!list) return;

    list.forEach(item => {
      const sym = item.symbol;
      const last = new Date(item.lastSeen);

      const existing = map.get(sym);

      // pick the most recent timestamp
      if (!existing || last > existing.lastSeen) {
        map.set(sym, {
          symbol: sym,
          name: item.name,
          lastSeen: last,
          source
        });
      }
    });
  });

  return Array.from(map.values())
    .map(x => ({ 
      ...x, 
      lastSeen: x.lastSeen.toISOString() 
    }));
}
