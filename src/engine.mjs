/** Deterministic, dependency-free game engine. Local demo only, NOT an authorization boundary. */
export const VERSION = 1;
export const STAT_NAMES = Object.freeze({ energy: '電力', food: '食料', trust: '信頼', safety: '安全' });
export const ROLES = Object.freeze([
  { id: 'engineer', name: '灯りの技師', mark: '✧', color: 'mint', description: '街の明かりを守る。小さな工夫で、みんなの日常を支える。', strength: 'energy' },
  { id: 'researcher', name: '海の研究員', mark: '◈', color: 'lilac', description: 'まだ知らない海の秘密を探す。好奇心が、未来への道になる。', strength: 'safety' },
  { id: 'gardener', name: '庭園の世話人', mark: '❋', color: 'peach', description: '海底の小さな庭を育てる。食べものと、ほっとする居場所を届ける。', strength: 'food' },
  { id: 'storyteller', name: '街の語り部', mark: '☾', color: 'rose', description: '人と人をつなぐ。声を聞き、街の記憶を次の日へつなぐ。', strength: 'trust' }
]);

export const DAYS = Object.freeze([
  { title: 'はじまりの灯り', eyebrow: 'WELCOME TO ATLANTICA',
    lead: '海の底にも、朝は来る。',
    text: '青い光がドームを透かすころ、あなたはアトランティカにたどり着いた。広場の時計台は止まっている。「あと七日で、潮の祭りなんです」。案内人のミオが、少し困った顔で笑った。まずは、この街の小さな困りごとから。',
    question: '新しい街で、最初に何をしよう？',
    options: [
      { id: 'light', title: '時計台の灯りを直す', detail: '消えていた明かりを、広場に取り戻す。', effect: { energy: 14, food: -3, trust: 2, safety: 0 } },
      { id: 'garden', title: '共同庭園を手伝う', detail: '明日の食卓のために、小さな苗を植える。', effect: { energy: -2, food: 13, trust: 3, safety: 0 } },
      { id: 'listen', title: '住民の話を聞く', detail: '街で暮らす人たちの願いを集める。', effect: { energy: 0, food: 0, trust: 12, safety: 3 } }
    ], weather: { energy: -5, food: -4, trust: 0, safety: -2 }, discovery: '止まっていた時計が、一度だけ音を鳴らした。' },
  { title: '海から届いた手紙', eyebrow: 'A LETTER FROM THE SEA', lead: '誰かが、ここにいる。',
    text: '観測窓の外に、淡い光が三回またたいた。海流に乗って届いた古いカプセルには、もう一つの街の印がある。ミオは言う。「返事を待っているのかもしれません」。でも、外へ出るには準備が必要だ。',
    question: '遠くの誰かに、どう応えよう？', options: [
      { id: 'signal', title: '光で返事を送る', detail: '少しの電力を使って、存在を知らせる。', effect: { energy: -7, food: 0, trust: 13, safety: 4 } },
      { id: 'decode', title: '手紙の印を調べる', detail: '急がずに、相手のことを知っておく。', effect: { energy: -2, food: 0, trust: 3, safety: 12 } },
      { id: 'prepare', title: '迎える準備をする', detail: '知らない誰かの席を、食卓に用意する。', effect: { energy: 2, food: 10, trust: 5, safety: -2 } }
    ], weather: { energy: -4, food: -5, trust: 0, safety: -3 }, discovery: '光の向こうにも、同じ海を見ている誰かがいる。' },
  { title: '嵐の前の食卓', eyebrow: 'BEFORE THE CURRENT', lead: '一緒に食べると、少し強くなる。',
    text: '海流予報は、明日から大きな潮が来ると告げた。庭園の収穫はいつもより少ない。広場には、保存するべきだという声と、今夜こそ皆で集まりたいという声。どちらも、この街を思っている。',
    question: '限られた時間を、何に使う？', options: [
      { id: 'store', title: '保存食をみんなで作る', detail: '明日への安心を、少しずつ積み重ねる。', effect: { energy: -3, food: 16, trust: 2, safety: 0 } },
      { id: 'dinner', title: '小さな夕食会を開く', detail: '不安を話せる時間を、街に作る。', effect: { energy: 0, food: -5, trust: 17, safety: 2 } },
      { id: 'reinforce', title: '庭園の窓を補強する', detail: '嵐のあとも、緑が残るように。', effect: { energy: -4, food: 5, trust: 0, safety: 13 } }
    ], weather: { energy: -5, food: -5, trust: -2, safety: -5 }, discovery: '窓の外は暗い。それでも食卓には、笑い声があった。' },
  { title: '灯りを分けあう夜', eyebrow: 'THE NIGHT WE SHARE', lead: '全部は守れない。だから、選ぶ。',
    text: '大きな海流が送電設備を揺らした。今夜、街の電力は足りない。研究所、庭園、住民たちの部屋。どの灯りにも、そこにいる誰かの理由がある。ミオがそっと尋ねる。「あなたなら、どこから手を差し伸べますか」',
    question: '今夜、あなたが守りたい灯りは？', options: [
      { id: 'repair', title: '送電設備の修理に向かう', detail: '自分にできる作業から、電力を取り戻す。', effect: { energy: 22, food: -3, trust: 0, safety: -5 } },
      { id: 'shelter', title: '温かな避難所を開く', detail: '一人きりの夜を過ごす人を減らす。', effect: { energy: -3, food: -2, trust: 15, safety: 7 } },
      { id: 'save', title: '節電の工夫を集める', detail: '小さな協力で、街全体の灯りを保つ。', effect: { energy: 12, food: 0, trust: 7, safety: 2 } }
    ], weather: { energy: -8, food: -4, trust: -1, safety: -6 }, discovery: 'いくつかの窓は暗くなった。でも、街の灯りは消えなかった。' },
  { title: '忘れられた温室', eyebrow: 'THE HIDDEN GARDEN', lead: 'この街には、まだ未来がある。',
    text: '潮が引いた旧区画で、誰も知らない温室が見つかった。透明な葉が、海の光を集めている。新しい電源になるかもしれない。食料を増やせるかもしれない。窓の向こうで、小さな芽が揺れた。',
    question: '見つけた可能性を、どう育てる？', options: [
      { id: 'power', title: '光を電力に変える実験', detail: '明日の街を支える、新しい仕組みを探す。', effect: { energy: 17, food: -2, trust: 0, safety: 4 } },
      { id: 'seed', title: '種を共同庭園に移す', detail: '発見を、みんなの暮らしにつなげる。', effect: { energy: -3, food: 19, trust: 3, safety: 0 } },
      { id: 'protect', title: '温室を記録して守る', detail: '知らないものと、慎重に向き合う。', effect: { energy: 2, food: 2, trust: 4, safety: 14 } }
    ], weather: { energy: -4, food: -4, trust: 0, safety: -2 }, discovery: '新しい芽に、誰かが「明日」という名前をつけた。' },
  { title: '海の向こうの隣人', eyebrow: 'WE ARE NOT ALONE', lead: 'はじめまして、を届けよう。',
    text: '二日目に届いた光の主が、小さな潜水艇でやってきた。隣の街も、嵐を乗り越えたばかりだという。持ち寄れるものは多くない。それでも、彼らは会いに来た。明日は、潮の祭り。',
    question: '新しい隣人と、何を分かちあう？', options: [
      { id: 'trade', title: '食料と部品を交換する', detail: '足りないものを、お互いに補いあう。', effect: { energy: 9, food: 9, trust: 2, safety: 0 } },
      { id: 'invite', title: '祭りに招待する', detail: '明日の思い出を、一緒に作る。', effect: { energy: 0, food: -3, trust: 18, safety: 3 } },
      { id: 'route', title: '安全な航路を一緒に調べる', detail: 'これからも会える道を、海に描く。', effect: { energy: -3, food: 2, trust: 5, safety: 17 } }
    ], weather: { energy: -4, food: -5, trust: 0, safety: -2 }, discovery: '海図に一本の線が増えた。それは、会いに行ける道だった。' },
  { title: 'わたしたちの潮の祭り', eyebrow: 'A STORY WE MADE', lead: 'この一週間は、あなたがいた世界。',
    text: '広場の時計が、七日目の朝を告げる。直した灯り。育てた苗。交わした言葉。全部が、この街の今につながっている。祭りの最後に、住民たちは海へひとつの願いを流す。あなたは何を残そう。',
    question: 'これからの街に、何を贈ろう？', options: [
      { id: 'lantern', title: '消えない灯りを灯す', detail: '遠い海からも見える、帰る場所のしるし。', effect: { energy: 16, food: 0, trust: 5, safety: 3 } },
      { id: 'feast', title: 'みんなの食卓を作る', detail: '誰もが席を見つけられる、温かな街。', effect: { energy: 0, food: 14, trust: 9, safety: 0 } },
      { id: 'memory', title: '街の物語を残す', detail: 'ここで過ごした日々を、次の誰かへ。', effect: { energy: 2, food: 2, trust: 13, safety: 6 } }
    ], weather: { energy: -2, food: -3, trust: 0, safety: 0 }, discovery: '七日前は知らない人だった。今は、同じ街の思い出がある。' }
]);

export class GameError extends Error { constructor(code, message) { super(message); this.name = 'GameError'; this.code = code; } }
const fail = (code, message) => { throw new GameError(code, message); };
const clone = value => structuredClone(value);
const cleanName = name => typeof name === 'string' ? name.trim().replace(/[\u0000-\u001f\u007f]/g, '') : '';
const clamp = value => Math.max(0, Math.min(100, value));
const timestamp = now => new Date(now ?? Date.now()).toISOString();
export function createGame(name, role, now) {
  name = cleanName(name);
  if (!name || [...name].length > 20) fail('NAME', '表示名は1〜20文字で入力してください。');
  if (!ROLES.some(r => r.id === role)) fail('ROLE', '役割を選んでください。');
  return { version: VERSION, player: { name, role }, day: 1, status: 'playing', stats: { energy: 60, food: 64, trust: 58, safety: 62 }, choices: [], history: [], posts: [], reports: [], blocked: [], createdAt: timestamp(now), updatedAt: timestamp(now) };
}
export function submitAction(state, optionId, now) {
  requireGame(state);
  if (state.status !== 'playing') fail('ENDED', 'この物語は完結しています。');
  if (state.choices.some(c => c.day === state.day)) fail('DUPLICATE', '今日の行動はすでに受け付けています。');
  if (!DAYS[state.day - 1].options.some(o => o.id === optionId)) fail('OPTION', 'この日の選択肢ではありません。');
  const next = clone(state);
  next.choices.push({ day: next.day, optionId, at: timestamp(now) });
  next.updatedAt = timestamp(now);
  return next;
}
export function resolveDay(state, now) {
  requireGame(state);
  if (state.status !== 'playing') fail('ENDED', 'この物語は完結しています。');
  const choice = state.choices.find(c => c.day === state.day);
  if (!choice) fail('NO_ACTION', 'まず、今日の行動を選んでください。');
  if (state.history.some(h => h.day === state.day)) fail('DUPLICATE', 'この日は集計済みです。');
  const next = clone(state), day = DAYS[next.day - 1], option = day.options.find(o => o.id === choice.optionId);
  const role = ROLES.find(r => r.id === next.player.role), before = clone(next.stats);
  for (const key of Object.keys(STAT_NAMES)) next.stats[key] = clamp(next.stats[key] + option.effect[key] + day.weather[key] + (key === role.strength ? 3 : 0));
  next.history.push({ day: next.day, title: day.title, optionId: choice.optionId, action: option.title, before, after: clone(next.stats), discovery: day.discovery, at: timestamp(now) });
  if (next.day === 7) next.status = 'completed'; else next.day += 1;
  next.updatedAt = timestamp(now);
  return next;
}
export function getEnding(state) {
  requireGame(state);
  if (state.status !== 'completed') return null;
  const low = Object.values(state.stats).some(x => x < 30);
  const strong = Object.entries(state.stats).sort((a, b) => b[1] - a[1])[0][0];
  const titles = { energy: '遠い海まで届く灯り', food: '誰もが帰れる食卓', trust: '名前を呼びあう街', safety: '明日へ続く航路' };
  return { title: low ? 'まだ続いていく、わたしたちの街' : titles[strong], text: low ? 'すべてがうまくいったわけではない。それでも、この一週間で街に残ったものがある。助けを求める声と、それに応える人。あなたの選択も、そのひとつだった。' : '一人では作れなかった今日が、ここにある。直したもの、育てたもの、交わした言葉。あなたの小さな選択が、街の未来の一部になった。潮の祭りの灯りは、海の向こうまで届いている。', highlight: STAT_NAMES[strong] };
}
export function addPost(state, text, now) {
  requireGame(state);
  if (typeof text !== 'string' || !text.trim() || [...text.trim()].length > 280) fail('POST', '投稿は1〜280文字で入力してください。');
  if (state.posts.length >= 50) fail('POST_LIMIT', '体験版の投稿は50件までです。');
  const next = clone(state);
  next.posts.push({ id: `post-${next.posts.length + 1}`, name: next.player.name, text: text.trim(), day: next.day, at: timestamp(now) });
  next.updatedAt = timestamp(now); return next;
}
export function reportPost(state, id, now) {
  requireGame(state);
  if (typeof id !== 'string' || !/^(sample-[1-3]|post-[1-9][0-9]?)$/.test(id)) fail('REPORT', '投稿を選んでください。');
  if (state.reports.some(r => r.id === id)) return clone(state);
  if (state.reports.length >= 20) fail('REPORT_LIMIT', '体験版の保存上限に達しました。');
  const next = clone(state); next.reports.push({ id, at: timestamp(now) }); return next;
}
export function blockAuthor(state, name) {
  requireGame(state);
  if (!['ミオ', 'ソラ', 'ナギ'].includes(name)) fail('BLOCK', 'サンプル住民のみ非表示にできます。');
  const next = clone(state); if (!next.blocked.includes(name)) next.blocked.push(name); return next;
}
export function isValidGame(s) {
  try {
    const record = v => v && typeof v === 'object' && !Array.isArray(v);
    const stats = v => record(v) && Object.keys(STAT_NAMES).every(k => Number.isInteger(v[k]) && v[k] >= 0 && v[k] <= 100);
    const time = v => typeof v === 'string' && v.length <= 32 && !Number.isNaN(Date.parse(v));
    if (!record(s) || s.version !== VERSION || !record(s.player) || !ROLES.some(r => r.id === s.player.role) || !cleanName(s.player.name) || [...s.player.name].length > 20) return false;
    if (!Number.isInteger(s.day) || s.day < 1 || s.day > 7 || !['playing', 'completed'].includes(s.status) || !stats(s.stats) || !time(s.createdAt) || !time(s.updatedAt)) return false;
    if (!Array.isArray(s.choices) || s.choices.length > 7 || !s.choices.every(c => record(c) && Number.isInteger(c.day) && c.day >= 1 && c.day <= s.day && DAYS[c.day - 1].options.some(o => o.id === c.optionId) && time(c.at))) return false;
    if (new Set(s.choices.map(c => c.day)).size !== s.choices.length) return false;
    if (!Array.isArray(s.history) || s.history.length !== (s.status === 'completed' ? 7 : s.day - 1)) return false;
    if (s.status === 'completed' && s.day !== 7) return false;
    if (!s.history.every((h, i) => record(h) && h.day === i + 1 && stats(h.before) && stats(h.after) && time(h.at) && DAYS[i].title === h.title && DAYS[i].discovery === h.discovery && DAYS[i].options.some(o => o.id === h.optionId && o.title === h.action) && s.choices.some(c => c.day === h.day && c.optionId === h.optionId))) return false;
    const expectedChoices = s.history.length + (s.status === 'playing' && s.choices.some(c => c.day === s.day) ? 1 : 0);
    if (s.choices.length !== expectedChoices) return false;
    if (!Array.isArray(s.posts) || s.posts.length > 50 || !s.posts.every((p,i) => record(p) && p.id === `post-${i+1}` && p.name === s.player.name && typeof p.text === 'string' && p.text.trim().length > 0 && [...p.text].length <= 280 && Number.isInteger(p.day) && p.day >= 1 && p.day <= s.day && time(p.at))) return false;
    if (!Array.isArray(s.reports) || s.reports.length > 20 || !s.reports.every(r => record(r) && typeof r.id === 'string' && /^(sample-[1-3]|post-[1-9][0-9]?)$/.test(r.id) && time(r.at))) return false;
    if (!Array.isArray(s.blocked) || s.blocked.length > 3 || !s.blocked.every(n => ['ミオ', 'ソラ', 'ナギ'].includes(n))) return false;
    return true;
  } catch { return false; }
}
function requireGame(state) { if (!isValidGame(state)) fail('STATE', '保存データを読み込めません。体験版をリセットしてください。'); }
export function serializeGame(state) { requireGame(state); return JSON.stringify(state); }
export function parseGame(value) { try { const s = JSON.parse(value); return isValidGame(s) ? s : null; } catch { return null; } }
