"""Browser smoke checks. Requires Python Playwright + Chromium; no live services used."""
from pathlib import Path
import json
import os
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'test-results'
OUT.mkdir(exist_ok=True)
BASE = 'about:blank'
HTML = (ROOT / 'dist/worlds-playable.html').read_text()
# Navigation to HTTP/file URLs is blocked in this execution environment.
# The exact built standalone document is rendered with page.set_content.
# Storage and cross-tab events are simulated; this does NOT test a hosted origin.
def load(page, route='home', saved=None, blocked=False):
    page.goto('about:blank')
    if blocked:
        page.evaluate("Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('Blocked','SecurityError')}})")
    else:
        page.evaluate("""initial => {
          const values = new Map(initial ? [['worlds.demo.v1', initial]] : []);
          Object.defineProperty(window, 'localStorage', {configurable:true, value: {
            getItem:key=>values.get(key)??null,
            setItem:(key,value)=>values.set(key,String(value)),
            removeItem:key=>values.delete(key)
          }});
        }""", saved)
    page.set_content(HTML)
    page.locator('.brand').wait_for()
    page.evaluate('(route)=>location.hash=route', route)
    page.wait_for_function('(route)=>location.hash === "#" + route',arg=route)
    page.wait_for_timeout(70)

def go(page, route):
    page.evaluate('(route)=>location.hash=route', route)
    page.wait_for_function('(route)=>location.hash === "#" + route',arg=route)
    page.wait_for_timeout(70)

results = []
def passed(name):
    results.append({'test': name, 'passed': True})
    print('PASS', name, flush=True)

def assert_fit(page):
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'Horizontal overflow'

def join(page, name='ハル', role='storyteller'):
    go(page, 'world')
    page.get_by_role('button', name='この世界の住民になる').click()
    page.locator('#display-name').fill(name)
    page.locator(f'input[value="{role}"]').check()
    page.get_by_role('button', name='物語をはじめる', exact=True).click()
    page.wait_for_function('location.hash === "#today"')

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'), args=['--no-sandbox'])
    context = browser.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1, is_mobile=True, has_touch=True)
    page = context.new_page()
    page.set_default_timeout(6000)
    errors = []
    network = []
    page.on('pageerror', lambda err: errors.append(str(err)))
    page.on('request', lambda req: network.append(req.url))
    load(page)
    page.locator('.hero h1').wait_for()
    assert_fit(page)
    page.screenshot(path=str(OUT / 'mobile-home.png'), full_page=True)
    passed('390px mobile homepage, no horizontal overflow')
    page.get_by_role('link', name='物語を体験する', exact=True).click()
    page.get_by_role('button', name='この世界の住民になる').click()
    page.locator('#display-name').fill('ハル')
    page.locator('input[value="storyteller"]').check()
    page.screenshot(path=str(OUT / 'mobile-join.png'), full_page=True)
    assert page.locator('dialog').evaluate('(el)=>el.scrollWidth <= el.clientWidth')
    page.get_by_role('button', name='物語をはじめる', exact=True).click()
    page.wait_for_function('location.hash === "#today"')
    page.locator('.bottom-nav a').first.wait_for()
    assert page.locator('.bottom-nav a').count() == 4
    page.screenshot(path=str(OUT / 'mobile-today.png'), full_page=True)
    passed('Join with nickname and role; four mobile tabs')
    page.get_by_role('link', name='行動', exact=True).click()
    page.locator('.choice').first.click()
    page.get_by_role('button', name='もう少し考える').click()
    assert page.evaluate("JSON.parse(localStorage.getItem('worlds.demo.v1')).choices.length") == 0
    page.locator('.choice').first.click()
    page.get_by_role('button', name='この行動にする', exact=True).click()
    assert page.locator('.choice:disabled').count() == 3
    saved = page.evaluate("localStorage.getItem('worlds.demo.v1')")
    load(page, 'actions', saved)
    assert page.locator('.choice:disabled').count() == 3
    page.screenshot(path=str(OUT / 'mobile-actions.png'), full_page=True)
    passed('Action confirmation, cancel, single choice, serialized reload simulation')
    page.get_by_role('link', name='広場', exact=True).click()
    payload = '<img src=x onerror="window.PWNED=1">'
    page.locator('#post-text').fill(payload)
    page.get_by_role('button', name='この端末に投稿', exact=True).click()
    assert page.locator('.post-text').first.inner_text() == payload
    assert page.locator('.post img').count() == 0
    assert page.evaluate('window.PWNED') is None
    passed('Post renders untrusted HTML as literal text; no script execution')
    page.get_by_role('button', name='通報を試す').first.click()
    page.get_by_role('button', name='体験として保存').click()
    assert page.get_by_role('button', name='通報体験を保存済み').count() == 1
    page.get_by_role('button', name='この住民を非表示').first.click()
    assert page.locator('.post').count() == 3
    passed('Local report and sample-author hiding')
    page.get_by_role('link', name='行動', exact=True).click()
    page.get_by_role('button', name='明日を見てみる').click()
    for day in range(2,8):
        page.get_by_role('link', name='行動', exact=True).click()
        page.locator('.choice').nth(day % 3).click()
        page.get_by_role('button', name='この行動にする', exact=True).click()
        page.get_by_role('button', name='七日間の結末を見る' if day==7 else '明日を見てみる', exact=True).click()
    page.wait_for_function('location.hash === "#journal"')
    assert page.locator('.ending').count() == 1
    assert page.locator('.timeline-row:not(.future)').count() == 7
    assert page.evaluate("JSON.parse(localStorage.getItem('worlds.demo.v1')).status") == 'completed'
    page.screenshot(path=str(OUT / 'mobile-ending.png'), full_page=True)
    passed('Seven-day browser playthrough and ending')
    with page.expect_download() as downloaded:
        page.get_by_role('button', name='物語の記録を保存する').click()
    exported = json.loads(Path(downloaded.value.path()).read_text())
    assert exported['mode'] == 'local-demo' and len(exported['history']) == 7
    passed('JSON download contains complete history and demo label')
    for width in [360, 390, 768, 1440]:
        page.set_viewport_size({'width': width, 'height': 900})
        for route in ['home','world','today','actions','square','journal','guide']:
            go(page, route)
            assert_fit(page)
        passed(f'All seven routes fit {width}px viewport')
    page.set_viewport_size({'width':1440,'height':1050})
    go(page,'home')
    page.screenshot(path=str(OUT / 'desktop-home.png'), full_page=True)
    go(page,'today')
    page.screenshot(path=str(OUT / 'desktop-ending.png'), full_page=True)
    second = context.new_page()
    load(second,'today',page.evaluate("localStorage.getItem('worlds.demo.v1')"))
    page.get_by_role('button', name='体験版の設定').click()
    page.get_by_role('button', name='リセット', exact=True).click()
    page.get_by_role('button', name='削除して最初から', exact=True).click()
    assert page.evaluate("localStorage.getItem('worlds.demo.v1')") is None
    second.evaluate("localStorage.removeItem('worlds.demo.v1');window.dispatchEvent(new StorageEvent('storage',{key:'worlds.demo.v1',newValue:null}))")
    second.wait_for_function('location.hash === "#world"')
    passed('Reset clears demo data; simulated cross-tab storage event updates UI')
    load(page,'home','{broken')
    assert '保存データを読み込めませんでした' in page.locator('.error-notice').inner_text()
    assert page.evaluate("localStorage.getItem('worlds.demo.v1')") == '{broken'
    passed('Corrupt save handled visibly without overwriting data')
    assert not errors, errors
    assert not [u for u in network if u.startswith(('http:', 'https:'))], network
    passed('No uncaught browser errors or external network requests')
    context.close()
    offline = browser.new_context(viewport={'width':390,'height':844})
    unavailable = offline.new_page()
    load(unavailable, 'world', blocked=True)
    join(unavailable)
    assert unavailable.locator('.error-notice').count()==1
    unavailable.get_by_role('link', name='行動', exact=True).click()
    unavailable.locator('.choice').first.click()
    unavailable.get_by_role('button', name='この行動にする', exact=True).click()
    unavailable.get_by_role('button', name='明日を見てみる').click()
    assert 'DAY 2' in unavailable.locator('.day-pill').inner_text()
    passed('Storage blocked: clear warning and in-memory fallback')
    offline.close()
    browser.close()
(OUT/'browser-results.json').write_text(json.dumps({'browser':'Chromium 144; in-memory HTML harness, simulated storage, desktop/mobile viewport emulation. NOT hosted URL, native storage or physical iPhone testing.', 'checks':results},ensure_ascii=False,indent=2))
print(f'{len(results)} browser checks passed.')
