import { ROLES, DAYS, STAT_NAMES, createGame, submitAction, resolveDay, addPost, reportPost, blockAuthor, parseGame, serializeGame, getEnding } from './engine.mjs';

const KEY = 'worlds.demo.v1';
const app = document.querySelector('#app');
const modal = document.querySelector('#modal');
const toastNode = document.querySelector('#toast');
let game = null, corrupt = false, storageAvailable = true, toastTimer, sceneId = 0;
try { const raw = localStorage.getItem(KEY); game = raw ? parseGame(raw) : null; corrupt = Boolean(raw && !game); } catch { storageAvailable = false; }
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const paths = {
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>', back: '<path d="m14 6-6 6 6 6"/>',
  home: '<path d="m3 10 9-7 9 7v10H3zM9 20v-7h6v7"/>', star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/>',
  book: '<path d="M12 6C8 3 5 4 3 5v15c4-2 6-1 9 1 3-2 5-3 9-1V5c-2-1-5-2-9 1v15"/>',
  chat: '<path d="M21 11a9 9 0 0 1-9 9c-1.5 0-3-.4-4.2-1L3 21l1.7-4.8A9 9 0 1 1 21 11Z"/><path d="M8 11h8"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', people: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6m1 3a5 5 0 0 1 3 4v2"/>',
  spark: '<path d="m12 3 2 7 7 2-7 2-2 7-2-7-7-2 7-2zM20 2v4m-2-2h4"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4"/>',
  check: '<path d="m5 12 4 4L19 6"/>', close: '<path d="m6 6 12 12M6 18 18 6"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z"/><path d="m8 12 3 3 5-6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>', settings: '<path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3" fill="currentColor"/><circle cx="16" cy="17" r="3" fill="currentColor"/>'
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
const brand = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="m5 12 7 23 8-14 8 14 7-23" fill="none" stroke="#8f79bd" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="m20 3 1.6 5.4L27 10l-5.4 1.6L20 17l-1.6-5.4L13 10l5.4-1.6Z" fill="#b2a0d6"/></svg>';

function scene(kind = 'sea') {
  const id = `s${++sceneId}`;
  const palette = kind === 'forest' ? ['#30324e', '#807287', '#e6c5aa'] : kind === 'stars' ? ['#242747', '#554b81', '#dfb2df'] : ['#15243d', '#1c646f', '#a8e2df'];
  let lights = ''; for (let i = 0; i < 29; i++) lights += `<circle cx="${(i * 83 + 47) % 620}" cy="${(i * 37 + 25) % 285}" r="${i % 4 === 0 ? 2 : 1}" fill="${palette[2]}" opacity="${.18 + (i % 5) * .12}"/>`;
  let buildings = ''; const positions = [[96, 156, 30, 90], [137, 121, 31, 115], [181, 160, 39, 88], [238, 98, 32, 150], [351, 135, 30, 117], [396, 105, 35, 140], [445, 157, 39, 103], [492, 179, 27, 88]];
  for (const [x, y, w, h] of positions) {
    buildings += `<path d="M${x} ${y+7}q${w/2} -28 ${w} 0v${h}h-${w}z" fill="#193d50" stroke="${palette[2]}" stroke-opacity=".3"/><path d="M${x+w/2} ${y-8}v-17" stroke="${palette[2]}" stroke-opacity=".5"/>`;
    for(let j=0;j<4;j++) buildings += `<rect x="${x+7}" y="${y+20+j*16}" width="5" height="7" rx="2" fill="${palette[2]}" opacity=".6"/><rect x="${x+w-12}" y="${y+20+j*16}" width="5" height="7" rx="2" fill="#e1cc9d" opacity=".55"/>`;
  }
  const extra = kind === 'forest' ? '<path d="M30 310Q40 155 70 125Q60 230 125 290M500 305Q560 150 574 110Q563 200 605 268" fill="none" stroke="#a7b497" stroke-width="14" opacity=".4"/>' : kind === 'stars' ? `<circle cx="475" cy="80" r="37" fill="#edcfcb" opacity=".75"/><ellipse cx="475" cy="80" rx="63" ry="10" transform="rotate(-23 475 80)" fill="none" stroke="#e0bfda" stroke-width="3" opacity=".6"/>` : '<path d="M80 82q16-10 32 0l10-7v14l-10-7q-16 10-32 0M445 63q16-10 32 0l10-7v14l-10-7q-16 10-32 0M471 110q9-6 18 0l7-4v8l-7-4q-9 6-18 0" fill="#a3d7d8" opacity=".35"/>';
  return `<svg viewBox="0 0 620 340" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs><linearGradient id="${id}b" x2=".6" y2="1"><stop stop-color="${palette[0]}"/><stop offset="1" stop-color="${palette[1]}"/></linearGradient><radialGradient id="${id}g"><stop stop-color="${palette[2]}" stop-opacity=".23"/><stop offset="1" stop-color="${palette[2]}" stop-opacity="0"/></radialGradient><linearGradient id="${id}d" x2="0" y2="1"><stop stop-color="${palette[2]}" stop-opacity=".36"/><stop offset="1" stop-color="#b0d6e4" stop-opacity=".04"/></linearGradient></defs><path fill="url(#${id}b)" d="M0 0h620v340H0z"/><ellipse cx="315" cy="30" rx="260" ry="270" fill="url(#${id}g)"/><path d="m275 0-90 300M320 0l5 300M360 0l105 300" stroke="${palette[2]}" stroke-opacity=".035" stroke-width="34"/>${lights}${extra}<ellipse cx="310" cy="293" rx="252" ry="41" fill="#102c40" opacity=".6"/><ellipse cx="310" cy="285" rx="228" ry="31" fill="none" stroke="${palette[2]}" stroke-opacity=".3"/>${buildings}<path d="M211 265V176a99 99 0 0 1 198 0v89Z" fill="url(#${id}d)" stroke="${palette[2]}" stroke-opacity=".65" stroke-width="1.5"/><path d="M211 181h198M214 220h193M310 77v187M310 77q-87 74-53 188M310 77q87 74 53 188" fill="none" stroke="${palette[2]}" stroke-opacity=".38"/><path d="M289 265v-96q21-30 42 0v96" fill="#1a4254" stroke="${palette[2]}" stroke-opacity=".7"/><path d="M310 136v-25" stroke="#d7e5d1"/><path d="M300 185h20v10h-20zm0 22h20v10h-20zm0 22h20v16h-20z" fill="#e7d7a5" opacity=".85"/><ellipse cx="310" cy="268" rx="99" ry="12" fill="none" stroke="${palette[2]}" stroke-opacity=".6"/><path d="M310 279v45M197 278l-40 35M421 280l40 35" stroke="${palette[2]}" stroke-opacity=".4" stroke-width="2"/><path d="M0 320q25-38 50-11t40-1q18-35 34 15M495 323q30-43 48-10t41-4q20-35 36 6" fill="none" stroke="#57888b" stroke-opacity=".6" stroke-width="14"/><path d="M43 340v-49m0 28-16-15m16-1 15-17M577 340v-50m0 30 18-16m-18-1-12-14" fill="none" stroke="#b89cbe" stroke-opacity=".55" stroke-width="4" stroke-linecap="round"/></svg>`;
}
function toast(text) { clearTimeout(toastTimer); toastNode.textContent = text; toastNode.classList.add('visible'); toastTimer = setTimeout(() => toastNode.classList.remove('visible'), 4200); }
function setRoute(route) { if (location.hash === `#${route}`) render(); else location.hash = route; }
function route() { return location.hash.slice(1).split('?')[0] || 'home'; }
function save(next) {
  game = next;
  if (storageAvailable) { try { localStorage.setItem(KEY, serializeGame(next)); } catch { storageAvailable = false; toast('保存できませんでした。この画面を閉じると進行が失われます。'); } }
}
function mutate(fn) {
  try {
    if (storageAvailable) { const raw = localStorage.getItem(KEY); if (!raw) throw new Error('別のタブでデータが削除されました。再読み込みしてください。'); const latest = parseGame(raw); if (!latest) throw new Error('保存データに問題があります。設定からリセットしてください。'); game = latest; }
    save(fn(game)); render(); return true;
  } catch (error) { toast(error.message || '処理できませんでした。'); return false; }
}
function header() {
  return `<header><div class="wrap topbar"><a class="brand" href="#home" aria-label="WORLDS ホーム">${brand}<span>WORLDS</span><small>α</small></a><nav class="toplinks" aria-label="メインナビゲーション"><a href="#home" class="desktop-link ${route()==='home'?'active':''}">世界をさがす</a><a href="#guide" class="desktop-link">遊び方</a><button class="account" data-action="settings" aria-label="体験版の設定"><span class="avatar">${game?esc(ROLES.find(r=>r.id===game.player.role).mark):'✧'}</span><span>${game?'マイページ':'ゲスト'}</span></button></nav></div><div class="preview-strip"><div class="wrap"><span class="status-dot"></span><strong>EARLY PREVIEW</strong><span>無料体験 · この端末だけに保存 · 実際の通信・課金なし</span><span class="spacer"></span><button class="text-button" data-action="about">体験版について</button></div></div></header>`;
}
function footer() { return '<footer class="footer"><strong>WORLDS</strong><span>物語は、あなたがいるから動き出す。<br>プロトタイプ · 認証・共有・決済は未接続</span></footer>'; }
function bottomNav() {
  if (!game) return '';
  return `<nav class="bottom-nav" aria-label="物語のメニュー">${[['today','home','今日'],['actions','spark','行動'],['square','chat','広場'],['journal','book','記録']].map(([r,i,l])=>`<a href="#${r}" class="${route()===r?'active':''}" ${route()===r?'aria-current="page"':''}>${icon(i)}<span>${l}</span></a>`).join('')}</nav>`;
}
function home() {
  return `<section class="hero"><div class="hero-content"><div class="eyebrow">YOUR LITTLE ESCAPE</div><h1>観るだけじゃない。<br>物語の住民になる。</h1><p>知らない街で、誰かと出会って。<br>あなたの小さな選択が、世界の明日を変えていく。<br>七日間だけの、もうひとつの居場所。</p><div class="hero-actions"><a class="btn btn-white" href="#${game?'today':'world'}">${game?'あなたの物語へ戻る':'物語を体験する'}${icon('arrow')}</a></div><p class="hero-note">まずは一人で遊べる無料体験から。登録も決済も不要です。</p><div class="benefits"><span>${icon('clock')}一日ひとつの選択</span><span>${icon('phone')}スマホで完結</span><span>${icon('book')}あなたの物語</span></div></div><div class="hero-art">${scene()}<div class="scene-caption"><div><span>FEATURED WORLD</span><strong>海底都市アトランティカ</strong></div><span>7 DAYS · STORY</span></div></div></section>
  <section aria-labelledby="worlds-title"><div class="section-head"><div><h2 id="worlds-title">どんな世界で、過ごそう。</h2><p>勝ち負けよりも、ここで生まれる物語を。</p></div><span class="small-caps">FIND YOUR WORLD</span></div><div class="world-grid">
  <article class="world-card"><div class="world-art">${scene()}<span class="badge">✧ いま体験できる</span></div><div class="world-info"><div class="tags"><span># やさしいSF</span><span># 街づくり</span></div><h3>海底都市アトランティカ</h3><p>深い海の底で、灯りと暮らしを守る七日間。あなたは、この街の何を大切にする？</p><div class="world-meta">${icon('clock')}<span>全7日分</span><span class="spacer"></span><span>一人用体験 · 無料</span></div><a class="btn btn-secondary" href="#world">世界をのぞいてみる ${icon('arrow')}</a></div></article>
  <article class="world-card"><div class="world-art">${scene('forest')}<span class="badge">構想中</span></div><div class="world-info"><div class="tags"><span># ファンタジー</span><span># 日常</span></div><h3>月あかりの小さなホテル</h3><p>不思議なお客さまを迎える、一週間の物語。</p><div class="world-meta"><span>世界のアイデア · 未実装</span></div><button class="btn btn-outline" data-action="coming" data-world="hotel">どんな物語？</button></div></article>
  <article class="world-card"><div class="world-art">${scene('stars')}<span class="badge">構想中</span></div><div class="world-info"><div class="tags"><span># 宇宙</span><span># 旅</span></div><h3>星をあつめる夜行列車</h3><p>次の停車駅を、乗客たちで選ぶ星の旅。</p><div class="world-meta"><span>世界のアイデア · 未実装</span></div><button class="btn btn-outline" data-action="coming" data-world="train">どんな物語？</button></div></article></div></section>
  <section class="how-panel" aria-labelledby="how-title"><div><div class="eyebrow muted">HOW TO PLAY</div><h2 id="how-title">むずかしい操作は、<br>いりません。</h2></div><div class="how-steps">${[['01','自分の役割を選ぶ','どんな人になって過ごす？ 得意なことも、あこがれでも。'],['02','今日の行動をひとつ','物語を読んで、自分の気持ちに近い選択を。'],['03','世界の変化を楽しむ','選んだことが街に残る。最後には、あなただけの記録に。']].map(([n,t,d])=>`<div><span class="step-number">${n}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}</div></section>`;
}
function world() {
  return `<a class="back-link" href="#home">${icon('back')}世界をさがす</a><section class="detail-banner">${scene()}<div class="detail-title"><span class="badge">一人用の無料体験</span><h1>海底都市アトランティカ</h1><p>七日間、この街に、あなたがいる。</p></div></section><div class="detail-layout"><section class="card card-pad detail-copy"><div class="eyebrow muted">THE STORY</div><h2>海の底にも、帰りたい場所がある。</h2><p>海に沈んだ街、アトランティカ。大きな潮が近づくなか、住民たちは七日後の祭りを楽しみにしている。電力も食料も、十分ではない。それでも、誰かと暮らす日々には、小さな発見がある。</p><p>灯りを守る人。庭を育てる人。海の秘密を探す人。声をつなぐ人。あなたの役割で、この街の明日を少しだけ変えてみよう。</p><h3>ここでの、あなたの役割</h3><p class="note">どの役割でも、すべての選択肢を選べます。得意な分野の数値が一日ごとに少し回復します。</p><div class="role-previews">${ROLES.map(r=>`<div class="role-preview"><span class="role-symbol ${r.color}">${r.mark}</span><div><strong>${r.name}</strong><p>${STAT_NAMES[r.strength]}を支える役割</p></div></div>`).join('')}</div></section><aside class="card card-pad"><span class="badge purple">PLAYABLE PROTOTYPE</span><div class="price"><strong>無料</strong><span>アカウント登録・決済なし</span></div><div class="join-details"><span>${icon('clock')}7日分を自分のペースで</span><span>${icon('phone')}スマホのブラウザで遊べる</span><span>${icon('shield')}投稿・選択はこの端末内だけ</span></div><button class="btn btn-primary full" data-action="join">${game?'物語へ戻る':'この世界の住民になる'} ${icon('arrow')}</button><p class="note">体験版では「明日を見てみる」で次の日へ進めます。ほかの住民の投稿はサンプルです。</p><p class="note">オンラインの共同プレイ、主催者機能、AI生成、課金はまだありません。</p></aside></div>`;
}
function dayPill() {
  return `<div class="day-pill"><small>${game.status==='completed'?'STORY COMPLETE':'YOUR SEVEN DAYS'}</small><strong>DAY ${game.day} <span class="muted" style="font-size:12px">/ 7</span></strong><div class="progress-dots" aria-hidden="true">${Array.from({length:7},(_,i)=>`<span class="${i<game.history.length?'done':i===game.day-1?'current':''}"></span>`).join('')}</div></div>`;
}
function pageTop(title, sub) { const role=ROLES.find(r=>r.id===game.player.role); return `<div class="page-top"><div><div class="eyebrow">ATLANTICA · YOUR STORY</div><h1>${esc(title)}</h1><div class="heading-sub"><span class="badge purple">${role.mark} ${role.name}</span><p>${esc(sub)}</p></div></div>${dayPill()}</div>`; }
function sidebar() { const r=ROLES.find(r=>r.id===game.player.role); return `<aside class="side-stack"><section class="card card-pad"><div class="card-heading">${icon('home')}街のいま</div><div class="city-mini">${scene()}</div><div>${Object.entries(STAT_NAMES).map(([key,name])=>`<div class="stat"><div class="stat-line"><span>${name}</span><strong>${game.stats[key]} <small>/ 100</small></strong></div><div class="bar" role="meter" aria-label="${name}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${game.stats[key]}"><span style="width:${game.stats[key]}%"></span></div></div>`).join('')}</div><p class="note">あなたの選択と、日ごとの出来事で変わります。</p></section><section class="card card-pad"><div class="card-heading">${icon('spark')}この街の、あなた</div><div class="role-summary"><span class="role-symbol ${r.color}">${r.mark}</span><div><strong class="user-name">${esc(game.player.name)}</strong><small>${r.name}</small></div></div><p class="side-copy">${r.description}<br>毎日、${STAT_NAMES[r.strength]}に +3 の役割ボーナス。</p><p class="note">ランクも、競争もありません。</p></section></aside>`; }
function endingCard() { const ending=getEnding(game); return `<section class="ending"><div class="eyebrow">OUR SEVEN DAYS</div><div class="ending-symbol">✧</div><h2>${ending.title}</h2><p>${ending.text}</p><span class="badge purple">${esc(game.player.name)}がいた、七日間</span><div style="margin-top:20px"><button class="btn btn-primary" data-action="export">${icon('download')}物語の記録を保存する</button></div><p class="note" style="margin-top:12px;margin-bottom:0">選択と街の変化をJSONファイルで保存します。</p></section>`; }
function today() {
  const day=DAYS[game.day-1], chosen=game.choices.find(c=>c.day===game.day);
  return `${pageTop(game.status==='completed'?'この街で過ごした、七日間。':`おかえり、${game.player.name}さん。`,game.status==='completed'?'あなたの物語が完成しました。':'今日も、あなたの選択をひとつ。')}<div class="play-layout"><div>${game.status==='completed'?`${endingCard()}<a class="btn btn-outline full" href="#journal">七日間を振り返る ${icon('book')}</a>`:`<article class="card"><div class="story-art">${scene()}<div class="story-art-label"><div class="eyebrow">DAY ${game.day} · ${day.eyebrow}</div><h2>${day.title}</h2></div></div><div class="story-content"><p class="lead">${day.lead}</p><p class="story-text">${day.text}</p><div class="story-footer"><p>${chosen?'今日の選択が、街の明日につながります。':'正解は、ひとつじゃない。'}</p><a class="btn btn-primary" href="#actions">${chosen?'選んだ行動を確認する':'今日の行動を選ぶ'} ${icon('arrow')}</a></div></div></article>${game.history.length?`<section class="card card-pad" style="margin-top:20px"><div class="card-heading">${icon('book')}昨日、街に残ったこと</div><p class="side-copy" style="font-size:13px;margin-top:12px">${game.history.at(-1).discovery}</p></section>`:''}`}<p class="note">体験版では待ち時間なしで翌日に進めます。共有サーバーへの送信は行いません。</p></div>${sidebar()}</div>`;
}
function actions() {
  if (game.status==='completed') return `${pageTop('物語は、あなたの記録に。','七日間のすべての選択が完了しました。')}<div class="play-layout"><div>${endingCard()}<a class="btn btn-outline full" href="#journal">記録を振り返る</a></div>${sidebar()}</div>`;
  const day=DAYS[game.day-1], chosen=game.choices.find(c=>c.day===game.day);
  return `${pageTop('今日の、小さな選択。',`DAY ${game.day} · ${day.title}`)}<div class="play-layout"><section><h2 class="action-heading">${day.question}</h2><p class="action-intro">一日に選べるのは、ひとつだけ。<br>選択に役割ボーナスと、その日の出来事が加わります。</p><div class="choices">${day.options.map((o,i)=>`<button class="choice ${chosen?.optionId===o.id?'selected':''}" data-action="choose" data-id="${o.id}" ${chosen?'disabled':''} aria-label="${o.title}${chosen?.optionId===o.id?'、選択済み':''}"><span class="letter">${chosen?.optionId===o.id?'✓':String.fromCharCode(65+i)}</span><span><span class="choice-title">${o.title}</span><span class="choice-detail">${o.detail}</span><span class="effect-row">${Object.entries(o.effect).filter(([,v])=>v!==0).map(([k,v])=>`<span class="effect ${v<0?'negative':''}">${STAT_NAMES[k]} ${v>0?'+':''}${v}</span>`).join('')}</span></span><span class="choice-arrow">${icon(chosen?.optionId===o.id?'check':'arrow')}</span></button>`).join('')}</div>${chosen?`<div class="submitted"><h3>${icon('check')} 今日の行動を受け付けました</h3><p>「${day.options.find(o=>o.id===chosen.optionId).title}」を選びました。</p><button class="btn btn-primary" data-action="advance">${game.day===7?'七日間の結末を見る':'明日を見てみる'} ${icon('arrow')}</button><p class="note">体験版専用の早送りです。本番の締切処理ではありません。</p></div>`:`<div class="notice" style="margin-top:20px">選択は確認画面のあとに確定します。確定後は変更できません。</div>`}</section>${sidebar()}</div>`;
}
const samples=[{id:'sample-1',name:'ミオ',mark:'☾',text:'時計台の下で、小さなお茶会を開いています。今日のこと、少しだけ話しませんか。'}, {id:'sample-2',name:'ソラ',mark:'❋',text:'庭園に新しい芽が出ていました。この街に来て、はじめて迎える朝。なんだか、いい日になりそうです。'}, {id:'sample-3',name:'ナギ',mark:'◈',text:'窓の外に、小さな光が見えます。海の向こうにも、誰かがいるのかな。'}];
function square() {
  const posts=[...game.posts].reverse().map(p=>({...p,mark:ROLES.find(r=>r.id===game.player.role).mark,own:true})).concat(samples.filter(p=>!game.blocked.includes(p.name)));
  return `${pageTop('街の広場。','物語の合間に、ひとこと。')}<div class="play-layout"><section><div class="notice">ここは端末内だけの投稿体験です。ほかの人には届きません。住民の投稿はサンプルです。</div><form class="card card-pad composer" id="post-form"><label class="form-label" for="post-text" style="margin-top:0">今の気持ちを、残してみよう。</label><textarea id="post-text" name="text" rows="3" maxlength="560" required placeholder="今日、街で気づいたことは？" aria-describedby="post-help"></textarea><div class="composer-footer"><p id="post-help">280文字まで。個人情報は書かないでください。</p><button class="btn btn-primary small" type="submit">この端末に投稿</button></div></form><div class="card post-list">${posts.map(p=>`<article class="post"><div class="post-head"><span class="avatar">${p.mark}</span><div><strong>${esc(p.name)}</strong><small>${p.own?`DAY ${p.day} · この端末だけ`:'サンプルの住民 · 実際の投稿ではありません'}</small></div></div><p class="post-text">${esc(p.text)}</p>${!p.own?`<div class="post-actions"><button data-action="report" data-id="${p.id}">${game.reports.some(r=>r.id===p.id)?'通報体験を保存済み':'通報を試す'}</button><button data-action="block" data-name="${p.name}">この住民を非表示</button></div>`:''}</article>`).join('')}</div></section>${sidebar()}</div>`;
}
function journal() {
  return `${pageTop('あなたがいた、街の記憶。',`${game.history.length} / 7 日分の物語が記録されています。`)}<div class="play-layout"><section>${game.status==='completed'?endingCard():`<div class="notice">一日を進めるたびに、あなたの選択と街の変化がここに残ります。</div>`}<div class="card timeline">${DAYS.map((d,i)=>{const h=game.history.find(x=>x.day===i+1);return `<article class="timeline-row ${h?'':'future'}"><span class="timeline-number">${h?'✓':String(i+1).padStart(2,'0')}</span><div><h3>DAY ${i+1} · ${d.title}</h3>${h?`<p>${h.discovery}</p><div class="timeline-action">あなたの選択：${h.action}</div><div class="effect-row">${Object.keys(STAT_NAMES).map(k=>{const delta=h.after[k]-h.before[k];return `<span class="effect ${delta<0?'negative':''}">${STAT_NAMES[k]} ${delta>0?'+':''}${delta}</span>`;}).join('')}</div>`:`<p>${i+1===game.day?'今日の選択を、待っています。':'まだ出会っていない、明日の物語。'}</p>`}</div></article>`;}).join('')}</div><button class="btn btn-outline full" data-action="export" style="margin-top:18px">${icon('download')}ここまでの記録を保存</button></section>${sidebar()}</div>`;
}
function guide() { return `<section class="guide"><div class="eyebrow">WELCOME TO WORLDS</div><h1>物語の住民に、なる方法。</h1><article class="card"><h2>01 · 役割を選んで、街へ。</h2><p>表示名と、気になる役割を選んで参加します。ゲームの知識は必要ありません。どの役割でも、すべての選択肢を選べます。</p></article><article class="card"><h2>02 · 今日の行動を、ひとつ。</h2><p>その日の物語を読んで、三つの選択肢からひとつを選びます。確認画面で確定するまでは自由に迷って大丈夫。確定後の選び直しはできません。</p><p>体験版では「明日を見てみる」を押すと次の日へ進みます。毎日の決まった時間まで待つ必要はありません。</p></article><article class="card"><h2>03 · 変わっていく街と、七日後の物語。</h2><p>電力・食料・信頼・安全が、選択と出来事で変わります。七日後には、街の状態に応じた結末が残ります。結果は記録から振り返れます。</p></article><article class="card"><h2>この体験版について</h2><p>この試作は、一人用・端末内保存です。実際のログイン、ほかの参加者との共有、AIの文章生成、課金、開催者管理、自動の締切処理は未接続です。</p><p>広場の住民はサンプルです。通報も端末内への保存だけで、運営者には届きません。ブラウザのデータを消すと記録も消えます。ページを閉じる前に記録を書き出せます。</p><p>この端末を使うほかの人が記録を閲覧できる場合があります。名前はニックネームを使い、投稿に個人情報を含めないでください。</p></article><a href="#${game?'today':'world'}" class="btn btn-primary full">${game?'物語に戻る':'物語を体験する'} ${icon('arrow')}</a></section>`; }
function render() {
  const current=route(), needsGame=['today','actions','square','journal'].includes(current);
  if (needsGame&&!game) { setRoute('world'); return; }
  const pages={ home, world, guide, today, actions, square, journal };
  const content=(pages[current]||home)();
  document.body.classList.toggle('has-game',Boolean(game));
  app.innerHTML=header()+`<main class="wrap main" id="main" tabindex="-1">${corrupt?'<div class="error-notice">保存データを読み込めませんでした。マイページから体験版をリセットできます。自動で上書きはしません。</div>':''}${!storageAvailable?'<div class="error-notice">このブラウザでは進行を保存できません。画面を閉じると記録が失われます。</div>':''}${content}${footer()}</main>`+bottomNav();
  document.title=`${({home:'物語の住民になる',world:'海底都市アトランティカ',today:'今日の物語',actions:'今日の行動',square:'街の広場',journal:'街の記憶',guide:'遊び方'})[current]||'物語の住民になる'} | WORLDS`;
}
function openModal(title,content) {
  modal.innerHTML=`<div class="modal-inner"><div class="modal-top"><h2 id="modal-title">${esc(title)}</h2><button class="close-btn" data-action="close" aria-label="閉じる">${icon('close')}</button></div>${content}</div>`;
  if(!modal.open)modal.showModal();
}
function join() {
  if(game){setRoute('today');return;}
  if(corrupt){toast('保存データをリセットしてから始めてください。');settings();return;}
  openModal('この街で、何をして過ごそう。',`<p class="modal-copy">どの役割にも、その人だけの大切な仕事があります。<br>気になる役割を、ひとつ選んでください。</p><form id="join-form"><label class="form-label" for="display-name">街で呼ばれる名前</label><input class="text-input" id="display-name" name="name" placeholder="ニックネーム（20文字まで）" autocomplete="off" required maxlength="40"><fieldset style="border:0;padding:0;margin:0"><legend class="form-label">あなたの役割</legend><div class="role-grid">${ROLES.map(r=>`<label class="role-option"><input type="radio" name="role" value="${r.id}" required><span class="role-box ${r.color}"><span class="role-symbol">${r.mark}</span><strong>${r.name}</strong><p>${r.description}</p></span></label>`).join('')}</div></fieldset><p id="form-error" class="form-error" role="alert"></p><button class="btn btn-primary full" type="submit">物語をはじめる ${icon('arrow')}</button><p class="note">登録・決済なし。この端末内に、表示名と選択を保存します。</p></form>`);
}
function settings() {
  openModal('マイページ',`<p class="modal-copy">体験版の設定です。オンラインアカウントではありません。</p><div class="settings-row"><div><strong>${game?esc(game.player.name):'ゲスト'}</strong><p>${game?`DAY ${game.day} · ${ROLES.find(r=>r.id===game.player.role).name}`:'まだ物語は始まっていません。'}</p></div><span class="badge purple">この端末だけ</span></div><div class="settings-row"><div><strong>物語の記録</strong><p>表示名・投稿も含むJSONファイルです。</p></div><button class="btn btn-outline small" data-action="export" ${!game?'disabled':''}>保存する</button></div><div class="settings-row"><div><strong>体験版をリセット</strong><p>この端末のWORLDSデータを削除します。</p></div><button class="btn btn-outline small" data-action="reset-confirm" ${!game&&!corrupt?'disabled':''}>リセット</button></div><p class="note">サーバー同期・課金・通知はありません。共有端末では、体験後のリセットをおすすめします。</p><div class="modal-actions"><button class="btn btn-secondary" data-action="close">閉じる</button></div>`);
}
function exportRecord() {
  if(!game){toast('まだ記録がありません。');return;}
  const data={application:'WORLDS',mode:'local-demo',exportedAt:new Date().toISOString(),notice:'Local prototype. Includes nickname and local posts. Not a shared or verified game record.',...game,ending:getEnding(game)};
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download='worlds-atlantica-record.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('記録ファイルの保存を開始しました。');
}
function handleAction(button) {
  const action=button.dataset.action;
  if(action==='close'){modal.close();return;}
  if(action==='join'){join();return;}
  if(action==='settings'){settings();return;}
  if(action==='about'){modal.close();setRoute('guide');return;}
  if(action==='export'){exportRecord();return;}
  if(action==='coming'){const hotel=button.dataset.world==='hotel';openModal(hotel?'月あかりの小さなホテル':'星をあつめる夜行列車',`<p class="modal-copy" style="margin-top:16px">${hotel?'忘れものを探す旅人や、夜だけ現れるお客さま。あなたはホテルの住人として、誰かの大切な一日をそっと手伝います。':'星から星へと走る列車。次の行き先は、乗客たちの選択で決まります。出会いと、ささやかな別れの旅へ。'}</p><div class="notice">これは次の世界のアイデアです。まだ遊べません。現在は海底都市の7日間を体験できます。</div><button class="btn btn-primary full" data-action="open-world">海底都市を見てみる ${icon('arrow')}</button>`);return;}
  if(action==='open-world'){modal.close();setRoute('world');return;}
  if(action==='choose'&&game&&game.status==='playing'){const option=DAYS[game.day-1].options.find(o=>o.id===button.dataset.id);if(!option)return;openModal('この行動を、街の明日に。',`<p class="modal-copy" style="margin-top:15px">DAY ${game.day} の行動を確定します。あとから変更はできません。</p><div class="notice"><strong>${option.title}</strong><br>${option.detail}</div><div class="modal-actions"><button class="btn btn-outline" data-action="close">もう少し考える</button><button class="btn btn-primary" data-action="confirm-choice" data-id="${option.id}">この行動にする</button></div>`);return;}
  if(action==='confirm-choice'){const ok=mutate(s=>submitAction(s,button.dataset.id));modal.close();if(ok)toast('今日の行動を受け付けました。');return;}
  if(action==='advance'){if(mutate(s=>resolveDay(s))){setRoute(game.status==='completed'?'journal':'today');window.scrollTo(0,0);toast(game.status==='completed'?'七日間の物語が完成しました。':`DAY ${game.day} の朝が来ました。`);}return;}
  if(action==='report'){openModal('通報機能を体験する',`<p class="modal-copy" style="margin-top:15px">この投稿への通報を、この端末内に保存します。運営者には送信されません。実際の問題への対応を約束する機能ではありません。</p><div class="modal-actions"><button class="btn btn-outline" data-action="close">やめる</button><button class="btn btn-primary" data-action="confirm-report" data-id="${esc(button.dataset.id)}">体験として保存</button></div>`);return;}
  if(action==='confirm-report'){if(mutate(s=>reportPost(s,button.dataset.id)))toast('端末内に保存しました。運営者には送信されません。');modal.close();return;}
  if(action==='block'){if(mutate(s=>blockAuthor(s,button.dataset.name)))toast('このサンプル住民を非表示にしました。リセットで元に戻せます。');return;}
  if(action==='reset-confirm'){openModal('この端末の記録を削除しますか？',`<p class="modal-copy" style="margin-top:15px">役割・選択・投稿・物語の記録を削除します。この操作は取り消せません。必要な記録は先に保存してください。</p><div class="modal-actions"><button class="btn btn-outline" data-action="close">残しておく</button><button class="btn btn-danger" data-action="reset">削除して最初から</button></div>`);return;}
  if(action==='reset'){try{localStorage.removeItem(KEY);}catch{}game=null;corrupt=false;modal.close();setRoute('home');render();toast('この端末の記録をリセットしました。');}
}
document.addEventListener('click',event=>{const button=event.target.closest('[data-action]');if(button&&!button.disabled)handleAction(button);});
document.addEventListener('submit',event=>{
  if(event.target.id==='join-form'){
    event.preventDefault();const data=new FormData(event.target);
    try{const next=createGame(data.get('name'),data.get('role'));save(next);modal.close();setRoute('today');toast('アトランティカへ、ようこそ。');}catch(error){document.querySelector('#form-error').textContent=error.message;}
  }
  if(event.target.id==='post-form'){
    event.preventDefault();const data=new FormData(event.target);if(mutate(s=>addPost(s,data.get('text'))))toast('この端末に投稿を保存しました。ほかの人には届きません。');
  }
});
window.addEventListener('hashchange',()=>{modal.close();render();window.scrollTo(0,0);document.querySelector('#main')?.focus({preventScroll:true});});
window.addEventListener('storage',event=>{if(event.key!==KEY)return;game=event.newValue?parseGame(event.newValue):null;corrupt=Boolean(event.newValue&&!game);modal.close();render();toast('別のタブで変更された内容を読み込みました。');});
render();
