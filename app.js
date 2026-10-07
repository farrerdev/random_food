import { filterDishes, pick, meal } from './logic.js';
const $ = selector => document.querySelector(selector);
const icons = { 'Món Heo': '🥓', 'Món Gà': '🍗', 'Món Vịt & Ngan': '🦆', 'Món Bò & Trâu': '🥩', 'Món Cá': '🐟', 'Tôm & Hải Sản': '🦐', 'Món Trứng': '🍳', 'Đậu Phụ & Nấm': '🍄', 'Món Rau': '🥬', 'Món Canh': '🥣', 'Món Nước & Đổi Vị': '🍜', 'Món Chay': '🌱' };
let dishes = [], view = 'all', category = '', limit = 24, chosen = [], mode = 'one', toastTimer;
function read(key) { try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } }
let favorites = read('comnha.favorites').filter(v => typeof v === 'string');
let history = read('comnha.history').filter(v => v && typeof v.id === 'string' && Number.isFinite(v.at));
function notify(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3200); }
function save() { try { localStorage.setItem('comnha.favorites', JSON.stringify(favorites)); localStorage.setItem('comnha.history', JSON.stringify(history)); } catch { notify('Trình duyệt không cho phép lưu. Dữ liệu chỉ giữ trong lần mở này.'); } }
function eligible() { return filterDishes(dishes, { query: $('#search').value.trim(), category, method: $('#method').value, favorites: view === 'favorites' ? favorites : view === 'history' ? history.map(h => h.id) : null }); }
function excluded() { return $('#avoid').checked ? history.filter(h => Date.now() - h.at < 7 * 86400000).map(h => h.id) : []; }
function button(text, className, action) { const node = document.createElement('button'); node.textContent = text; node.className = className; node.addEventListener('click', action); return node; }
function card(dish, index, suggestion = false) {
  const article = document.createElement('article'); article.className = 'dish-card';
  const visual = document.createElement('div'); visual.className = `dish-visual tone-${Object.keys(icons).indexOf(dish.category) % 5}`;
  const emoji = document.createElement('span'); emoji.className = 'dish-emoji'; emoji.textContent = icons[dish.category] || '🍽️'; emoji.setAttribute('aria-hidden', 'true'); visual.append(emoji);
  const favorite = button(favorites.includes(dish.id) ? '♥' : '♡', 'favorite', () => { favorites = favorites.includes(dish.id) ? favorites.filter(id => id !== dish.id) : [...favorites, dish.id]; save(); render(); renderChosen(); });
  favorite.setAttribute('aria-label', `Yêu thích ${dish.name}`); favorite.setAttribute('aria-pressed', String(favorites.includes(dish.id))); visual.append(favorite);
  const tag = document.createElement('span'); tag.className = 'visual-tag'; tag.textContent = suggestion && mode === 'meal' ? ['MÓN CHÍNH', 'MÓN RAU', 'MÓN CANH'][index] : dish.category; visual.append(tag);
  const body = document.createElement('div'); body.className = 'dish-body';
  const method = document.createElement('p'); method.className = 'dish-method'; method.textContent = dish.method;
  const name = document.createElement('h3'); name.textContent = dish.name;
  const bottom = document.createElement('div'); bottom.className = 'card-bottom';
  const latest = history.find(h => h.id === dish.id);
  const info = document.createElement('span'); info.textContent = view === 'history' && latest ? new Date(latest.at).toLocaleDateString('vi-VN') : 'Vị ngon quen thuộc';
  bottom.append(info, button('Chọn món ↗', 'text-button', () => { mode = 'one'; chosen = [dish]; showChosen(); }));
  if (view === 'history' && !suggestion) bottom.append(button('Bỏ khỏi lịch sử', 'text-button', () => { history = history.filter(h => h.id !== dish.id); save(); render(); }));
  body.append(method, name, bottom); article.append(visual, body); return article;
}
function render() {
  $('#favorite-count').textContent = favorites.length;
  $('#library-title').textContent = { all: 'Quen vị nhà, đủ món ngon.', favorites: 'Những món mình thương.', history: 'Bữa ngon đã chọn.' }[view];
  const list = eligible(); $('#result-count').textContent = `${list.length} món ăn`;
  $('#dish-grid').replaceChildren(...list.slice(0, limit).map((d, i) => card(d, i)));
  if (!list.length) { const empty = document.createElement('div'); empty.className = 'empty'; empty.textContent = view === 'favorites' && !favorites.length ? 'Chạm vào trái tim trên món ăn để lưu món yêu thích.' : view === 'history' && !history.length ? 'Chốt một bữa ăn, Cơm Nhà sẽ ghi nhớ giúp bạn.' : 'Chưa có món phù hợp. Thử đổi từ khóa hoặc bỏ bớt bộ lọc nhé.'; $('#dish-grid').append(empty); }
  $('#load-more').hidden = limit >= list.length;
  document.querySelectorAll('.nav').forEach(el => { el.classList.toggle('active', el.dataset.view === view); el.setAttribute('aria-pressed', String(el.dataset.view === view)); });
}
function renderChosen() {
  $('#suggestion-cards').replaceChildren(...chosen.map((d, i) => card(d, i, true)));
  if (mode === 'meal') [...$('#suggestion-cards').children].forEach((node, index) => node.append(button('↻ Đổi món này', 'swap text-button', () => {
    const pool = index === 0 ? dishes.filter(d => !['Món Rau', 'Món Canh', 'Món Nước & Đổi Vị', 'Món Chay'].includes(d.category)) : dishes.filter(d => d.category === ['','Món Rau','Món Canh'][index]);
    const next = pick(pool, [...excluded(), ...chosen.map(d => d.id)]);
    if (next) { chosen[index] = next; showChosen(); } else notify('Không còn món khác phù hợp.');
  })));
}
function showChosen() {
  $('#suggestion').hidden = false;
  $('#suggestion-title').textContent = mode === 'meal' ? 'Một mâm cơm, đủ vị nhà.' : 'Bữa này thử món này nhé!';
  $('#suggestion-note').textContent = mode === 'meal' ? 'Thêm cơm trắng là có một bữa cơm nhà. Bạn có thể đổi riêng từng món.' : 'Ưng rồi thì chốt nhé. Món sẽ được ghi vào lịch sử đã ăn.';
  renderChosen();
  $('#suggestion').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function randomize(nextMode = mode) {
  const omit = [...excluded(), ...chosen.map(d => d.id)];
  const next = nextMode === 'meal' ? meal(dishes, omit) : [pick(eligible(), omit)].filter(Boolean);
  if (!next.length) { notify('Không còn món mới phù hợp. Đổi bộ lọc hoặc bỏ chọn tránh món đã ăn.'); return; }
  mode = nextMode; chosen = next; showChosen();
}
try {
  const response = await fetch('./data/menu.json'); if (!response.ok) throw new Error('load');
  const data = await response.json(); dishes = data.dishes;
  $('#total').textContent = dishes.length;
  $('#source-note').textContent = `Nguồn: ${data.source} · Yêu thích và lịch sử lưu trên trình duyệt này.`;
  const cats = ['', ...new Set(dishes.map(d => d.category))];
  cats.forEach(cat => { const chip = button(cat ? `${icons[cat]} ${cat.replace(/^Món /, '')}` : 'Tất cả món', 'chip' + (!cat ? ' selected' : ''), () => { category = cat; limit = 24; $('#categories').querySelectorAll('button').forEach(b => { b.classList.toggle('selected', b === chip); b.setAttribute('aria-pressed', String(b === chip)); }); render(); }); chip.setAttribute('aria-pressed', String(!cat)); $('#categories').append(chip); });
  [...new Set(dishes.map(d => d.method))].sort().forEach(method => { const option = document.createElement('option'); option.value = method; option.textContent = method; $('#method').append(option); });
  render();
} catch { $('#dish-grid').textContent = 'Không tải được sổ tay món ăn. Hãy tải lại trang.'; $('#random-one').disabled = true; $('#random-meal').disabled = true; }
$('#search').addEventListener('input', () => { limit = 24; render(); });
$('#method').addEventListener('change', () => { limit = 24; render(); });
$('#load-more').addEventListener('click', () => { limit += 24; render(); });
document.querySelectorAll('.nav').forEach(el => el.addEventListener('click', () => { view = el.dataset.view; limit = 24; render(); $('#library').scrollIntoView({ behavior: 'smooth' }); }));
$('#random-one').addEventListener('click', () => randomize('one'));
$('#random-meal').addEventListener('click', () => randomize('meal'));
$('#reroll').addEventListener('click', () => randomize());
$('#close-suggestion').addEventListener('click', () => { $('#suggestion').hidden = true; });
$('#accept-meal').addEventListener('click', () => { const at = Date.now(); history = [...chosen.map(d => ({ id: d.id, at })), ...history].slice(0, 600); save(); render(); $('#suggestion').hidden = true; notify('Đã lưu bữa ăn. Chúc bạn ngon miệng!'); });
