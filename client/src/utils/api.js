export async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || `Lỗi máy chủ (${response.status})`);
  return body;
}

export function mergeServerProducts(current, rows) {
  const merged = [...current];
  for (const row of rows) {
    const legacyMatch = row.legacyId && merged.findIndex(p => String(p._id) === String(row.legacyId));
    const realMatch = merged.findIndex(p => String(p._id) === String(row._id));
    const index = Number.isInteger(legacyMatch) && legacyMatch >= 0 ? legacyMatch : realMatch;
    const image = row.image || merged[index]?.image;
    const normalized = { ...merged[index], ...row, _id: String(row._id), image };
    if (index >= 0) merged[index] = normalized;
    else merged.unshift(normalized);
  }
  return merged;
}
