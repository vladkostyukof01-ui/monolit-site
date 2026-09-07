const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'monolit.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  -- Разделы прайс-листа (7 штук с оригинала: консультации, подготовка документов,
  -- оформление недвижимости, досудебное урегулирование, представительство в судах,
  -- апелляция/кассация, исполнительное производство).
  CREATE TABLE IF NOT EXISTS service_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    intro TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  -- Позиция прайс-листа. price_note хранит цену как есть с оригинала (диапазоны вида
  -- "2 000-3 000 руб." не сводимы к одному числу без домысливания) — price_from/price_to
  -- парсятся из неё для фильтра/калькулятора, но price_note остаётся источником истины
  -- для отображения.
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    price_note TEXT NOT NULL DEFAULT '',
    price_from INTEGER,
    price_to INTEGER,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  -- Решения судов с участием фирмы — доказательства опыта, каждое ссылается на
  -- реальный PDF-скан с оригинала (public/files/resheniya/).
  CREATE TABLE IF NOT EXISTS court_decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  -- Благодарственные письма от клиентов — сканы изображений.
  CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_path TEXT NOT NULL,
    caption TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  -- Образцы договоров для скачивания. group_title группирует подпункты (например
  -- "Договора аренды" -> типовой/общая форма/жилого фонда/...), как на оригинале —
  -- NULL group_title = самостоятельный пункт верхнего уровня без группы.
  CREATE TABLE IF NOT EXISTS contract_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_title TEXT,
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  -- Заявки с формы обратной связи — НОВАЯ функция, которой на оригинале не было вовсе
  -- (там только телефон/почта текстом, отправить сообщение прямо с сайта было нельзя).
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    email TEXT,
    message TEXT,
    source TEXT NOT NULL DEFAULT 'contact-form',
    consent_given INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    status TEXT NOT NULL DEFAULT 'new'
  );
`);

module.exports = db;
