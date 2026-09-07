// Образцы договоров — реальные .doc файлы, скачаны с оригинала monolit-advokat.ru
// (data/uploads/doc/) 2026-09-03, лежат в public/files/dogovory/.

const contracts = [
  { file: 'arendat.doc', group_title: 'Договора аренды', title: 'типовой', sort_order: 1 },
  { file: 'arenda.doc', group_title: 'Договора аренды', title: 'общая форма', sort_order: 2 },
  { file: 'arendavilogo.doc', group_title: 'Договора аренды', title: 'жилого фонда', sort_order: 3 },
  { file: 'arendawykup.doc', group_title: 'Договора аренды', title: 'с выкупом', sort_order: 4 },
  { file: 'arendypodriyada.doc', group_title: 'Договора аренды', title: 'подряда', sort_order: 5 },
  { file: 'arendaawtotransporta.doc', group_title: 'Договора аренды', title: 'автотранспорта', sort_order: 6 },
  { file: 'subarenda.doc', group_title: null, title: 'Договор субаренды', sort_order: 7 },
  { file: 'postawki.doc', group_title: 'Договора поставки', title: 'типовой', sort_order: 8 },
  { file: 'postawki1.doc', group_title: 'Договора поставки', title: 'вариант 1', sort_order: 9 },
  { file: 'postawki2.doc', group_title: 'Договора поставки', title: 'вариант 2', sort_order: 10 },
  { file: 'kupliprodavi.doc', group_title: null, title: 'Договор купли-продажи, общий', sort_order: 11 },
  { file: 'kreditnyj.doc', group_title: null, title: 'Кредитный договор', sort_order: 12 },
  { file: 'okazaniyauslug.doc', group_title: null, title: 'Договор возмездного оказания услуг, типовой', sort_order: 13 },
  { file: 'podryada.doc', group_title: null, title: 'Договор подряда, типовой', sort_order: 14 },
  { file: 'trudowojdogowor.doc', group_title: null, title: 'Трудовой договор (контракт)', sort_order: 15 },
  { file: 'soglashenieozadatke3.doc', group_title: null, title: 'Трёхстороннее соглашение о задатке', sort_order: 16 },
  { file: 'porucheniya.doc', group_title: null, title: 'Договор поручения', sort_order: 17 },
];

module.exports = { contracts };
