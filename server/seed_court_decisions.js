// Решения судов с участием фирмы — реальные PDF-сканы, скачаны с оригинала
// monolit-advokat.ru (data/uploads/rs_pdf/) 2026-09-03, лежат в public/files/resheniya/.
// Порядок и заголовки — как на оригинале (два раздела: "по нашим уникальным
// предложениям" (1-14) и "по разным темам" (1-21), здесь объединены одним списком
// с сохранением исходного порядка отображения).

const decisions = [
  { file: 'reshenie_suda_001.pdf', title: 'Решение суда о признании прав собственности на объект незавершённого строительства', sort_order: 1 },
  { file: 'reshenie_suda_004.pdf', title: 'Решение о признании права на нежилое помещение', sort_order: 2 },
  { file: 'reshenie_suda_007.pdf', title: 'Решение о признании права на самострой', sort_order: 3 },
  { file: 'reshenie_suda_012.pdf', title: 'Решение о признании права на жилое помещение', sort_order: 4 },
  { file: 'reshenie_suda_013.pdf', title: 'Решение о признании права на нежилое помещение', sort_order: 5 },
  { file: 'reshenie_suda_014.pdf', title: 'Решение о признании права на жилое помещение', sort_order: 6 },
  { file: 'reshenie_suda_017.pdf', title: 'Решение о признании права собственности', sort_order: 7 },
  { file: 'reshenie_suda_020.pdf', title: 'Решение о признании прав собственности', sort_order: 8 },
  { file: 'reshenie_suda_023.pdf', title: 'Решение о признании права общей долевой собственности на долю в жилом доме', sort_order: 9 },
  { file: 'reshenie_suda_025.pdf', title: 'Решение о признании права собственности', sort_order: 10 },
  { file: 'reshenie_suda_027.pdf', title: 'Решение об оспаривании приказа об исключении из списка детей-сирот', sort_order: 11 },
  { file: 'reshenie_suda_030.pdf', title: 'Решение о признании права собственности', sort_order: 12 },
  { file: 'reshenie_suda_035.pdf', title: 'Признание права собственности на самовольную постройку', sort_order: 13 },
  { file: 'reshenie_suda_003.pdf', title: 'Решение о взыскании убытков', sort_order: 14 },
  { file: 'reshenie_suda_005.pdf', title: 'Решение об установлении сервитута', sort_order: 15 },
  { file: 'reshenie_suda_006.pdf', title: 'Решение о признании ответчиков не приобретшими права пользования жилым помещением', sort_order: 16 },
  { file: 'reshenie_suda_008.pdf', title: 'Решение о прекращении права долевой собственности на дом', sort_order: 17 },
  { file: 'reshenie_suda_009.pdf', title: 'Решение о возврате денег за неоказанную услугу', sort_order: 18 },
  { file: 'reshenie_suda_011.pdf', title: 'Решение суда об изменении взыскания алиментов', sort_order: 19 },
  { file: 'reshenie_suda_010.pdf', title: 'Решение об исключении квартиры из совместно нажитого имущества', sort_order: 20 },
  { file: 'reshenie_suda_015.pdf', title: 'Решение о сносе незаконного строения', sort_order: 21 },
  { file: 'reshenie_suda_016.pdf', title: 'Решение по апелляции', sort_order: 22 },
  { file: 'reshenie_suda_018.pdf', title: 'Решение об освобождении земельного участка', sort_order: 23 },
  { file: 'reshenie_suda_019.pdf', title: 'Решение о взыскании неосновательного обогащения', sort_order: 24 },
  { file: 'reshenie_suda_021.pdf', title: 'Решение об оспаривании отцовства', sort_order: 25 },
  { file: 'reshenie_suda_022.pdf', title: 'Решение о сносе самовольно возведённого строения', sort_order: 26 },
  { file: 'reshenie_suda_024.pdf', title: 'Решение о регистрации перехода права собственности', sort_order: 27 },
  { file: 'reshenie_suda_026.pdf', title: 'Решение об изменении долей в праве общей долевой собственности на жилой дом и земельный участок', sort_order: 28 },
  { file: 'reshenie_suda_028.pdf', title: 'Решение о взыскании задолженности', sort_order: 29 },
  { file: 'reshenie_suda_029.pdf', title: 'Решение об установлении факта родственных отношений', sort_order: 30 },
];

module.exports = { decisions };
