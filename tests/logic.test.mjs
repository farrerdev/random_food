import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { filterDishes, pick, meal } from '../logic.js';
const { dishes } = JSON.parse(readFileSync(new URL('../data/menu.json', import.meta.url)));
test('all workbook entries carry unique identity and provenance', () => {
  assert.equal(dishes.length, 479); assert.equal(new Set(dishes.map(d => d.id)).size, 479);
  assert.equal(new Set(dishes.map(d => d.source.sheet)).size, 8);
  assert.ok(dishes.every(d => d.name && d.category && d.method && d.source.row >= 2));
});
test('Vietnamese search works without accents and combines with filters', () => {
  assert.ok(filterDishes(dishes, { query: 'dau phu' }).some(d => d.name.includes('Đậu phụ')));
  const result = filterDishes(dishes, { query: 'ga', category: 'Món Gà', method: 'Kho / Rim' });
  assert.ok(result.length); assert.ok(result.every(d => d.category === 'Món Gà' && d.method === 'Kho / Rim'));
  assert.deepEqual(filterDishes(dishes, { favorites: [] }), []);
});
test('random respects exclusions and handles exhausted pools', () => {
  assert.equal(pick(dishes, [dishes[0].id], () => 0).id, dishes[1].id);
  assert.equal(pick([], []), null); assert.equal(pick([dishes[0]], [dishes[0].id]), null);
});
test('meal includes main, vegetable, soup and never ignores exclusions', () => {
  const result = meal(dishes, [], () => 0); assert.equal(result.length, 3);
  assert.equal(result[1].category, 'Món Rau'); assert.equal(result[2].category, 'Món Canh');
  assert.equal(new Set(result.map(d => d.id)).size, 3);
  const excluded = dishes.filter(d => d.category === 'Món Canh').map(d => d.id);
  assert.deepEqual(meal(dishes, excluded), []);
});
