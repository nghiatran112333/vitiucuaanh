const MAX_TRACKED_ADDRESSES = 20000;

function clearExpired(entries, now) {
  for (const [address, entry] of entries) {
    if (entry.resetAt <= now) entries.delete(address);
  }
}

export function createRateLimit({ windowMs, limit, message }) {
  const entries = new Map();
  const cleanupTimer = setInterval(() => clearExpired(entries, Date.now()), 60_000);
  cleanupTimer.unref();

  return (req, res, next) => {
    const now = Date.now();
    const address = req.ip || req.socket.remoteAddress || 'unknown';
    let entry = entries.get(address);

    if (!entry || entry.resetAt <= now) {
      if (entries.size >= MAX_TRACKED_ADDRESSES) clearExpired(entries, now);
      if (entries.size >= MAX_TRACKED_ADDRESSES) {
        return res.status(503).json({ message: 'Máy chủ đang bận. Vui lòng thử lại sau.' });
      }
      entry = { count: 0, resetAt: now + windowMs };
      entries.set(address, entry);
    }

    entry.count += 1;
    const remaining = Math.max(0, limit - entry.count);
    res.setHeader('RateLimit-Policy', `${limit};w=${Math.ceil(windowMs / 1000)}`);
    res.setHeader('RateLimit-Limit', String(limit));
    res.setHeader('RateLimit-Remaining', String(remaining));
    res.setHeader('RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > limit) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((entry.resetAt - now) / 1000))));
      return res.status(429).json({ message });
    }

    next();
  };
}
