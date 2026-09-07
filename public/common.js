// Общий JS для всех публичных страниц: навигация, футер, вспомогательные утилиты.

function esc(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
}
function escAttr(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escMultiline(str) {
  return esc(str).replace(/\n/g, '<br>');
}
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
function formatPrice(n) {
  return new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
}
function fileExt(path) {
  const m = String(path || '').match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toUpperCase() : '';
}

const DOC_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>';

function renderServiceCards(categories) {
  // "Статьи дела" вместо grid-плиток: нумерация идёт через CSS-counter
  // (.services-grid { counter-reset: article }), поэтому здесь просто
  // строки без явного номера.
  return categories.map(c => `
    <a class="service-card" href="/uslugi/${esc(c.slug)}">
      <h3>${esc(c.title)}</h3>
      <p>${esc((c.intro || '').slice(0, 130))}${(c.intro || '').length > 130 ? '…' : ''}</p>
      <span class="go">смотреть цены →</span>
    </a>
  `).join('');
}

function renderPriceTable(services) {
  return `<table class="price-table">${services.map(s => `
    <tr>
      <td class="p-title">${esc(s.title)}</td>
      <td class="p-price">${esc(s.price_note)}</td>
    </tr>
  `).join('')}</table>`;
}

function renderDocGrid(docs) {
  return `<div class="doc-grid">${docs.map(d => `
    <a class="doc-card" href="${escAttr(d.file_path)}" target="_blank" rel="noopener">
      ${DOC_ICON}
      <span>
        <span class="doc-title">${esc(d.title)}</span>
        <span class="doc-ext">${esc(fileExt(d.file_path))}</span>
      </span>
    </a>
  `).join('')}</div>`;
}

function renderTestimonialsGrid(items) {
  return items.map(t => `
    <a class="testimonial-card" href="${escAttr(t.image_path)}" target="_blank" rel="noopener">
      <img src="${escAttr(t.image_path)}" alt="${escAttr(t.caption || 'Благодарственное письмо клиента')}" loading="lazy">
    </a>
  `).join('');
}

const NAV_LINKS = [
  { href: '/', label: 'Главная' },
  { href: '/uslugi', label: 'Услуги и цены' },
  { href: '/kontakty', label: 'Контакты' },
];
const NAV_MORE = [
  { href: '/resheniya-sudov', label: 'Решения судов' },
  { href: '/blagodarnosti', label: 'Благодарности' },
  { href: '/obrazcy-dogovorov', label: 'Образцы договоров' },
];
const NAV_ALL_FLAT = [NAV_LINKS[0], NAV_LINKS[1], ...NAV_MORE, NAV_LINKS[2]];

function renderNav(settings) {
  const brand = settings.brand_name || 'Юридическая фирма «Монолит»';
  // "Реестр" вместо sticky-меню по центру: номер дела + название слева,
  // ссылки в одну строку справа. Дропдаун "Наш опыт" и бургер-меню на
  // мобильных сохранены функционально, оформлены в dossier-палитре.
  const html = `
    <header class="registry">
      <div class="wrap registry-inner">
        <a href="/" class="registry-case" aria-label="${esc(brand)} — на главную">
          <span class="registry-case-brand">${esc(brand)}</span>
        </a>
        <ul class="registry-links">
          <li><a href="${NAV_LINKS[1].href}">${NAV_LINKS[1].label}</a></li>
          <li class="nav-more">
            <button type="button" class="nav-more-btn" aria-haspopup="true" aria-expanded="false">Наш опыт</button>
            <ul class="nav-more-panel">
              ${NAV_MORE.map(l => `<li><a href="${l.href}">${l.label}</a></li>`).join('')}
            </ul>
          </li>
          <li><a href="${NAV_LINKS[2].href}">${NAV_LINKS[2].label}</a></li>
        </ul>
        <a class="registry-phone" href="tel:${esc((settings.phone || '').replace(/[^\d+]/g, ''))}">${esc(settings.phone || '')}</a>
        <button type="button" class="nav-burger" id="navBurger" aria-label="Открыть меню" aria-expanded="false" aria-controls="navMobilePanel">
          <span></span><span></span><span></span>
        </button>
      </div>
      <div class="wrap">
        <div class="nav-mobile-panel" id="navMobilePanel" hidden>
          <ul class="nav-mobile-links">
            ${NAV_ALL_FLAT.map(l => `<li><a href="${l.href}">${l.label}</a></li>`).join('')}
          </ul>
          <a class="nav-mobile-phone" href="tel:${esc((settings.phone || '').replace(/[^\d+]/g, ''))}">${esc(settings.phone || '')}</a>
        </div>
      </div>
    </header>
  `;
  const placeholder = document.getElementById('navPlaceholder');
  if (placeholder) placeholder.outerHTML = html;

  const burger = document.getElementById('navBurger');
  const panel = document.getElementById('navMobilePanel');
  if (burger && panel) {
    burger.addEventListener('click', () => {
      const isOpen = !panel.hidden;
      panel.hidden = isOpen;
      burger.setAttribute('aria-expanded', String(!isOpen));
      burger.classList.toggle('is-open', !isOpen);
    });
    panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      panel.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      burger.classList.remove('is-open');
    }));
  }
}

function renderFooter(settings) {
  const html = `
    <footer>
      <div class="wrap footer-inner">
        <p>© 2014–2026 ${esc(settings.brand_name || '')}. Все права защищены.</p>
        <ul class="footer-links">
          <li><a href="/uslugi">Услуги и цены</a></li>
          <li><a href="/resheniya-sudov">Решения судов</a></li>
          <li><a href="/blagodarnosti">Благодарности</a></li>
          <li><a href="/obrazcy-dogovorov">Образцы договоров</a></li>
          <li><a href="/privacy">Обработка данных</a></li>
          <li><a href="/kontakty">Контакты</a></li>
        </ul>
      </div>
    </footer>
  `;
  const placeholder = document.getElementById('footerPlaceholder');
  if (placeholder) placeholder.outerHTML = html;
}


let cachedSettings = null;
async function loadSettingsGlobal() {
  if (cachedSettings) return cachedSettings;
  const res = await fetch('/api/settings');
  cachedSettings = await res.json();
  return cachedSettings;
}

async function initLayout() {
  try {
    const settings = await loadSettingsGlobal();
    renderNav(settings);
    renderFooter(settings);
  } catch (err) {
    console.error('Не удалось загрузить настройки сайта:', err);
  }
}
initLayout();
