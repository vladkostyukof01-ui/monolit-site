require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const db = require('./db');
const { verifyAdmin, changePassword, changeUsername, requireAuth, issueCsrfToken, requireCsrf } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3500;
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-secret-before-deploy';

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      frameSrc: ["https://yandex.ru"],
    },
  },
}));

app.use(express.json());
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
}));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много попыток входа. Попробуйте снова через 15 минут.' },
});

app.use('/api/admin', (req, res, next) => {
  const isSafeMethod = req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS';
  const isLoginRoute = req.path === '/login';
  if (isSafeMethod || isLoginRoute) return next();
  return requireCsrf(req, res, next);
});

// ===================== ПУБЛИЧНОЕ API =====================

app.get('/api/settings', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  res.json(Object.fromEntries(rows.map(r => [r.key, r.value])));
});

app.get('/api/service-categories', (req, res) => {
  res.json(db.prepare('SELECT id, slug, title, intro FROM service_categories ORDER BY sort_order').all());
});

app.get('/api/service-categories/:slug', (req, res) => {
  const category = db.prepare('SELECT * FROM service_categories WHERE slug = ?').get(req.params.slug);
  if (!category) return res.status(404).json({ error: 'Раздел не найден.' });
  const services = db.prepare('SELECT id, title, price_note, price_from, price_to FROM services WHERE category_id = ? ORDER BY sort_order').all(category.id);
  res.json({ ...category, services });
});

// Для калькулятора примерной стоимости — все категории со всеми позициями сразу,
// клиент считает диапазон на лету без похода на сервер при каждом клике.
app.get('/api/price-index', (req, res) => {
  const categories = db.prepare('SELECT id, slug, title FROM service_categories ORDER BY sort_order').all();
  const allServices = db.prepare('SELECT id, category_id, title, price_note, price_from, price_to FROM services ORDER BY sort_order').all();
  res.json(categories.map(cat => ({
    ...cat,
    services: allServices.filter(s => s.category_id === cat.id),
  })));
});

app.get('/api/court-decisions', (req, res) => {
  res.json(db.prepare('SELECT id, title, file_path FROM court_decisions ORDER BY sort_order').all());
});

app.get('/api/testimonials', (req, res) => {
  res.json(db.prepare('SELECT id, image_path, caption FROM testimonials ORDER BY sort_order').all());
});

app.get('/api/contract-templates', (req, res) => {
  res.json(db.prepare('SELECT id, group_title, title, file_path FROM contract_templates ORDER BY sort_order').all());
});

app.post('/api/leads', (req, res) => {
  const { name, phone, email, message, consent, source } = req.body || {};
  if (!phone || !String(phone).trim()) {
    return res.status(400).json({ error: 'Укажите телефон.' });
  }
  if (!consent) {
    return res.status(400).json({ error: 'Нужно согласие на обработку персональных данных.' });
  }
  db.prepare(`
    INSERT INTO leads (name, phone, email, message, source, consent_given) VALUES (?, ?, ?, ?, ?, 1)
  `).run(name || null, String(phone).trim(), email || null, message || null, source || 'contact-form');
  res.json({ ok: true });
});

// ===================== АДМИН: АВТОРИЗАЦИЯ =====================

app.post('/api/admin/login', loginLimiter, (req, res) => {
  const { username, password } = req.body || {};
  if (!verifyAdmin(username, password)) {
    return res.status(401).json({ error: 'Неверный логин или пароль.' });
  }
  req.session.adminUsername = username;
  const csrfToken = issueCsrfToken(req);
  res.json({ ok: true, username, csrfToken });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/admin/me', (req, res) => {
  if (req.session && req.session.adminUsername) {
    const csrfToken = req.session.csrfToken || issueCsrfToken(req);
    return res.json({ username: req.session.adminUsername, csrfToken });
  }
  res.status(401).json({ error: 'Не авторизован.' });
});

app.post('/api/admin/change-password', requireAuth, (req, res) => {
  const { newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Пароль должен быть не короче 6 символов.' });
  }
  changePassword(req.session.adminUsername, newPassword);
  res.json({ ok: true });
});

app.post('/api/admin/change-username', requireAuth, (req, res) => {
  const { newUsername, currentPassword } = req.body || {};
  const trimmed = String(newUsername || '').trim();
  if (!trimmed || trimmed.length < 3) {
    return res.status(400).json({ error: 'Логин должен быть не короче 3 символов.' });
  }
  if (!currentPassword) {
    return res.status(400).json({ error: 'Укажите текущий пароль для подтверждения.' });
  }
  const result = changeUsername(req.session.adminUsername, trimmed, currentPassword);
  if (result.error === 'wrong_password') {
    return res.status(401).json({ error: 'Неверный текущий пароль.' });
  }
  if (result.error === 'taken') {
    return res.status(409).json({ error: 'Такой логин уже занят.' });
  }
  req.session.adminUsername = result.username;
  res.json({ ok: true, username: result.username });
});

// ===================== АДМИН: НАСТРОЙКИ =====================

app.put('/api/admin/settings', requireAuth, (req, res) => {
  const updates = req.body || {};
  const upsert = db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`);
  const tx = db.transaction(() => { Object.entries(updates).forEach(([k, v]) => upsert.run(k, String(v))); });
  tx();
  res.json({ ok: true });
});

// ===================== АДМИН: ПРАЙС-ЛИСТ =====================

app.put('/api/admin/service-categories/:id', requireAuth, (req, res) => {
  const { title, intro } = req.body || {};
  const fields = [];
  const values = [];
  if (title !== undefined) { fields.push('title = ?'); values.push(title); }
  if (intro !== undefined) { fields.push('intro = ?'); values.push(intro); }
  if (!fields.length) return res.status(400).json({ error: 'Нечего обновлять.' });
  values.push(req.params.id);
  db.prepare(`UPDATE service_categories SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  res.json({ ok: true });
});

app.put('/api/admin/services/:id', requireAuth, (req, res) => {
  const { title, price_note, price_from, price_to } = req.body || {};
  const fields = [];
  const values = [];
  if (title !== undefined) { fields.push('title = ?'); values.push(title); }
  if (price_note !== undefined) { fields.push('price_note = ?'); values.push(price_note); }
  if (price_from !== undefined) { fields.push('price_from = ?'); values.push(price_from); }
  if (price_to !== undefined) { fields.push('price_to = ?'); values.push(price_to); }
  if (!fields.length) return res.status(400).json({ error: 'Нечего обновлять.' });
  values.push(req.params.id);
  db.prepare(`UPDATE services SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  res.json({ ok: true });
});

// ===================== АДМИН: ЗАЯВКИ =====================

app.get('/api/admin/leads', requireAuth, (req, res) => {
  res.json(db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all());
});

app.put('/api/admin/leads/:id', requireAuth, (req, res) => {
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: 'status обязателен.' });
  db.prepare('UPDATE leads SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ ok: true });
});

// ===================== СТАТИКА И СТРАНИЦЫ =====================

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.get('/uslugi', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'uslugi.html'));
});

app.get('/uslugi/:slug', (req, res) => {
  const category = db.prepare('SELECT title, intro FROM service_categories WHERE slug = ?').get(req.params.slug);
  if (!category) {
    return res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html'));
  }
  const template = fs.readFileSync(path.join(__dirname, '..', 'public', 'category.html'), 'utf8');
  const title = escapeHtml(category.title + ' — Юридическая фирма «Монолит», Новосибирск');
  const description = escapeHtml((category.intro || 'Юридические услуги в Новосибирске.')).slice(0, 160);
  const canonical = `https://ЗАМЕНИТЕ-НА-ДОМЕН.ru/uslugi/${escapeHtml(req.params.slug)}`;
  const html = template
    .replace('<title id="pageTitle">Раздел — Юридическая фирма «Монолит»</title>', `<title id="pageTitle">${title}</title>`)
    .replace(
      '<meta name="description" id="pageDescription" content="Юридические услуги в Новосибирске.">',
      `<meta name="description" id="pageDescription" content="${description}">\n<link rel="canonical" href="${canonical}">\n<meta property="og:title" content="${title}">\n<meta property="og:description" content="${description}">\n<meta property="og:type" content="website">`
    );
  res.send(html);
});

app.get('/resheniya-sudov', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'resheniya-sudov.html'));
});

app.get('/blagodarnosti', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'blagodarnosti.html'));
});

app.get('/obrazcy-dogovorov', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'obrazcy-dogovorov.html'));
});

app.get('/kontakty', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'kontakty.html'));
});

app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'privacy.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin', 'index.html'));
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html'));
});

app.listen(PORT, () => {
  console.log(`Юридическая фирма «Монолит» запущена: http://localhost:${PORT}`);
  console.log(`Админ-панель: http://localhost:${PORT}/admin`);
});
