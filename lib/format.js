function pad(n) {
  return n < 10 ? `0${n}` : n;
}

export function formatAmount(amt, precision, currency) {
  precision = precision || 0;
  const result = amt.toFixed(precision);
  if (currency) {
    return `${result} ${currency}`;
  }
  return result;
}

export function formatDate(d) {
  return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()].map(pad).join('-');
}

export function formatDescription(...args) {
  return args.filter(Boolean).flat().join(' / ');
}

export function formatDistance(dist, precision, units, withUnits) {
  const div = units === 'km' ? 1000 : 1609.344;
  precision = precision || 0;
  const result = (dist / div).toFixed(precision);
  if (withUnits) {
    return `${result} ${units}`;
  }
  return result;
}
