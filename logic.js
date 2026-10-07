export const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
export function filterDishes(dishes, { query = '', category = '', method = '', favorites = null } = {}) {
  return dishes.filter(d => (!query || normalize(d.name).includes(normalize(query))) && (!category || d.category === category) && (!method || d.method === method) && (!favorites || favorites.includes(d.id)));
}
export function pick(pool, excluded = [], random = Math.random) {
  const candidates = pool.filter(d => !excluded.includes(d.id));
  return candidates.length ? candidates[Math.floor(random() * candidates.length)] : null;
}
export function meal(dishes, excluded = [], random = Math.random) {
  const groups = [dishes.filter(d => !['Món Rau', 'Món Canh', 'Món Nước & Đổi Vị', 'Món Chay'].includes(d.category)), dishes.filter(d => d.category === 'Món Rau'), dishes.filter(d => d.category === 'Món Canh')];
  const result = groups.map(group => pick(group, excluded, random));
  return result.every(Boolean) ? result : [];
}
