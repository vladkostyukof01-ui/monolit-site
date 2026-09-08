const bcrypt = require('bcryptjs');
const db = require('./db');
const { settings } = require('./seed_settings');
const { categories, services } = require('./seed_services');
const { decisions } = require('./seed_court_decisions');
const { testimonials } = require('./seed_testimonials');
const { contracts } = require('./seed_contracts');

function seedSettings() {
  const upsert = db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING`);
  const tx = db.transaction(() => {
    Object.entries(settings).forEach(([k, v]) => upsert.run(k, String(v)));
  });
  tx();
  console.log('Настройки сайта инициализированы.');
}

function seedServices() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM service_categories').get().c;
  if (count > 0) {
    console.log('Прайс-лист уже загружен, пропускаю.');
    return;
  }
  const insertCat = db.prepare(`
    INSERT INTO service_categories (slug, title, intro, sort_order) VALUES (@slug, @title, @intro, @sort_order)
  `);
  const insertService = db.prepare(`
    INSERT INTO services (category_id, title, price_note, price_from, price_to, sort_order)
    VALUES (@category_id, @title, @price_note, @price_from, @price_to, @sort_order)
  `);
  const tx = db.transaction(() => {
    categories.forEach(cat => {
      const result = insertCat.run(cat);
      const categoryId = result.lastInsertRowid;
      const list = services[cat.slug] || [];
      list.forEach(s => {
        insertService.run({
          category_id: categoryId,
          title: s.title,
          price_note: s.price_note || '',
          price_from: s.price_from ?? null,
          price_to: s.price_to ?? null,
          sort_order: s.sort_order || 0,
        });
      });
    });
  });
  tx();
  const totalServices = Object.values(services).reduce((sum, list) => sum + list.length, 0);
  console.log(`Загружено разделов прайс-листа: ${categories.length}, позиций: ${totalServices}.`);
}

function seedCourtDecisions() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM court_decisions').get().c;
  if (count > 0) {
    console.log('Решения судов уже загружены, пропускаю.');
    return;
  }
  const insert = db.prepare(`
    INSERT INTO court_decisions (title, file_path, sort_order) VALUES (@title, @file_path, @sort_order)
  `);
  const tx = db.transaction(() => {
    decisions.forEach(d => insert.run({ title: d.title, file_path: '/files/resheniya/' + d.file, sort_order: d.sort_order }));
  });
  tx();
  console.log(`Загружено решений судов: ${decisions.length}.`);
}

function seedTestimonials() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM testimonials').get().c;
  if (count > 0) {
    console.log('Благодарности уже загружены, пропускаю.');
    return;
  }
  const insert = db.prepare(`
    INSERT INTO testimonials (image_path, caption, sort_order) VALUES (@image_path, @caption, @sort_order)
  `);
  const tx = db.transaction(() => {
    testimonials.forEach(t => insert.run({ image_path: '/img/blagodarnosti/' + t.file, caption: t.caption || '', sort_order: t.sort_order }));
  });
  tx();
  console.log(`Загружено благодарностей: ${testimonials.length}.`);
}

function seedContracts() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM contract_templates').get().c;
  if (count > 0) {
    console.log('Образцы договоров уже загружены, пропускаю.');
    return;
  }
  const insert = db.prepare(`
    INSERT INTO contract_templates (group_title, title, file_path, sort_order) VALUES (@group_title, @title, @file_path, @sort_order)
  `);
  const tx = db.transaction(() => {
    contracts.forEach(c => insert.run({ group_title: c.group_title, title: c.title, file_path: '/files/dogovory/' + c.file, sort_order: c.sort_order }));
  });
  tx();
  console.log(`Загружено образцов договоров: ${contracts.length}.`);
}

function seedAdmin() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM admins').get().c;
  if (count > 0) {
    console.log('Админ уже существует, пропускаю.');
    return;
  }
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'monolit2026';
  const hash = bcrypt.hashSync(password, 12);
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(username, hash);
  console.log(`Создан админ: логин "${username}", пароль "${password}" (смените после первого входа!).`);
}

seedSettings();
seedServices();
seedCourtDecisions();
seedTestimonials();
seedContracts();
seedAdmin();
console.log('Готово.');
