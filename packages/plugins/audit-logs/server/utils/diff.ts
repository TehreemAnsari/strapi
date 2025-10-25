export function computeDiff(a: any, b: any) {
    if (!a && !b) return {};
    if (!a) return { _added: true, fields: b };
    if (!b) return { _deleted: true, fields: a };
  
    const changed: Record<string, { before: any; after: any }> = {};
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      const va = a?.[k];
      const vb = b?.[k];
      // shallow compare; for nested objects you may want to recurse or stringify
      const equal = JSON.stringify(va) === JSON.stringify(vb);
      if (!equal) changed[k] = { before: va, after: vb };
    }
    return changed;
  }
  