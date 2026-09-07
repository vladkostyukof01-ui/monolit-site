// Прайс-лист — перенесён ДОСЛОВНО с оригинала monolit-advokat.ru (разведка 2026-09-03,
// извлечение через page.evaluate innerText, не транскрипция со скриншота — исключает
// опечатки в ценах). price_from/price_to — распарсенные числа для фильтра/калькулятора,
// price_note — точный текст с оригинала как единственный источник истины для отображения.

const categories = [
  {
    slug: 'konsultatsii',
    title: 'Консультационные услуги',
    intro: 'По вопросам, связанным с недвижимостью, взысканием долгов, жилищным, наследственным и семейным правом.',
    sort_order: 1,
  },
  {
    slug: 'podgotovka-dokumentov',
    title: 'Подготовка документов',
    intro: '',
    sort_order: 2,
  },
  {
    slug: 'oformlenie-nedvizhimosti',
    title: 'Оформление недвижимости',
    intro: '',
    sort_order: 3,
  },
  {
    slug: 'dosudebnoe-uregulirovanie',
    title: 'Досудебное урегулирование споров',
    intro: 'Претензионная работа и ведение переговоров.',
    sort_order: 4,
  },
  {
    slug: 'predstavitelstvo-v-sudah',
    title: 'Представительство в судах',
    intro: 'В мировых судах и федеральных районных судах общей юрисдикции г. Новосибирска.',
    sort_order: 5,
  },
  {
    slug: 'apellyatsiya-kassatsiya',
    title: 'Апелляция, кассация, надзор',
    intro: 'Представительство в судах апелляционной, кассационной и надзорной инстанции — федеральные районные суды общей юрисдикции г. Новосибирска, Новосибирский областной суд.',
    sort_order: 6,
  },
  {
    slug: 'ispolnitelnoe-proizvodstvo',
    title: 'Исполнительное производство и корпоративные услуги',
    intro: 'Представительство на стадии исполнительного производства.',
    sort_order: 7,
  },
];

const services = {
  'konsultatsii': [
    { title: 'Юридическая консультация (устная)', price_note: '800 руб./час', price_from: 800, price_to: 800, sort_order: 1 },
    { title: 'Юридическая консультация (устная постоянным клиентам)', price_note: '500 руб./час', price_from: 500, price_to: 500, sort_order: 2 },
    { title: 'Юридическая консультация (письменная)', price_note: '1 000 руб. / 1 вопрос', price_from: 1000, price_to: 1000, sort_order: 3 },
    { title: 'Сложная (комплексная) письменная юридическая консультация, объединяющая ряд вопросов', price_note: '1 500–3 000 руб. / 1 вопрос', price_from: 1500, price_to: 3000, sort_order: 4 },
    { title: 'Правовой анализ (экспертиза) документов', price_note: '500 руб. / 1 лист', price_from: 500, price_to: 500, sort_order: 5 },
  ],
  'podgotovka-dokumentov': [
    { title: 'Подготовка договора купли-продажи, дарения, мены квартиры, дома, земельного участка, дачи, гаража, овощехранилища', price_note: '2 000–3 000 руб.', price_from: 2000, price_to: 3000, sort_order: 1 },
    { title: 'Подготовка договора займа денежных средств', price_note: '1 500 руб.', price_from: 1500, price_to: 1500, sort_order: 2 },
    { title: 'Подготовка договора купли-продажи автомобиля', price_note: '1 500 руб.', price_from: 1500, price_to: 1500, sort_order: 3 },
    { title: 'Подготовка жалоб, заявлений, писем, запросов', price_note: '500–1 000 руб.', price_from: 500, price_to: 1000, sort_order: 4 },
    { title: 'Подготовка соглашения о разделе совместно нажитого имущества между супругами', price_note: '2 000–3 000 руб.', price_from: 2000, price_to: 3000, sort_order: 5 },
    { title: 'Подготовка мотивированной досудебной претензии', price_note: '1 500 руб.', price_from: 1500, price_to: 1500, sort_order: 6 },
    { title: 'Подготовка искового заявления, встречного искового заявления, кассационной и надзорной жалобы', price_note: '2 000–3 000 руб.', price_from: 2000, price_to: 3000, sort_order: 7 },
    { title: 'Подготовка искового заявления о разводе, об алиментах', price_note: '1 000 руб.', price_from: 1000, price_to: 1000, sort_order: 8 },
    { title: 'Подготовка заявлений по делам особого производства', price_note: '1 000 руб.', price_from: 1000, price_to: 1000, sort_order: 9 },
    { title: 'Подготовка возражений на исковое заявление', price_note: '2 000–3 000 руб.', price_from: 2000, price_to: 3000, sort_order: 10 },
    { title: 'Подготовка судебных ходатайств', price_note: '500–1 000 руб.', price_from: 500, price_to: 1000, sort_order: 11 },
  ],
  'oformlenie-nedvizhimosti': [
    { title: 'Приватизация квартиры или комнаты в общежитии, служебных квартир', price_note: '10 000 / 16 000 руб. / 30 000 руб.', price_from: 10000, price_to: 30000, sort_order: 1 },
    { title: 'Оформление в собственность дач, земли, гаражей, овощехранилищ', price_note: '15 000–20 000 руб.', price_from: 15000, price_to: 20000, sort_order: 2 },
    { title: 'Узаконивание перепланировки, переустройства в административном или судебном порядке', price_note: '10 000 / 15 000 руб.', price_from: 10000, price_to: 15000, sort_order: 3 },
    { title: 'Оформление наследства по завещанию или по закону', price_note: 'от 10 000 руб.', price_from: 10000, price_to: null, sort_order: 4 },
    { title: 'Регистрация прав на недвижимость в Управлении Федеральной регистрационной службы по Новосибирской области', price_note: '5 000 руб. / 1 объект', price_from: 5000, price_to: 5000, sort_order: 5 },
    { title: 'Получение информации из ЕГРП (Единого государственного реестра прав, включая госпошлину)', price_note: '1 000 руб.', price_from: 1000, price_to: 1000, sort_order: 6 },
    { title: 'Оформление коммерческой недвижимости, линейных объектов', price_note: 'от 30 000 руб.', price_from: 30000, price_to: null, sort_order: 7 },
    { title: 'Прекращение долевой собственности на дома и земельные участки (коммерческую недвижимость)', price_note: 'от 30 000 руб.', price_from: 30000, price_to: null, sort_order: 8 },
    { title: 'Оформление земельных участков (изменение разрешённого использования, выкуп)', price_note: 'от 16 000 руб.', price_from: 16000, price_to: null, sort_order: 9 },
    { title: 'Вывод из жилого фонда', price_note: 'от 150 000 руб.', price_from: 150000, price_to: null, sort_order: 10 },
  ],
  'dosudebnoe-uregulirovanie': [
    { title: 'Комплексное оказание услуг по сопровождению спора (переговоры с представителями спорной стороны (1-2 встречи), телефонные переговоры, подготовка писем и претензий и направление их спорной стороне (2-3 документа), консультации) — стандартный пакет', price_note: '3 000–5 000 руб.', price_from: 3000, price_to: 5000, sort_order: 1 },
    { title: 'Дополнительные переговоры', price_note: '1 500 руб. / час', price_from: 1500, price_to: 1500, sort_order: 2 },
  ],
  'predstavitelstvo-v-sudah': [
    { title: 'Взыскание долга по расписке или договору займа', price_note: '800 руб./час', price_from: 800, price_to: 800, sort_order: 1 },
    { title: 'Споры о собственности, недвижимости', price_note: '800 руб./час', price_from: 800, price_to: 800, sort_order: 2 },
    { title: 'Споры со строительными компаниями (предварительные договоры и договоры участия в долевом строительстве, инвестиционные и т.п.)', price_note: '800 руб./час', price_from: 800, price_to: 800, sort_order: 3 },
    { title: 'Признание права собственности на недвижимость', price_note: '800 руб./час', price_from: 800, price_to: 800, sort_order: 4 },
    { title: 'Истребование имущества из чужого незаконного владения', price_note: '800 руб./час', price_from: 800, price_to: 800, sort_order: 5 },
    { title: 'Признание сделок (договоров) недействительными', price_note: '800 руб./час', price_from: 800, price_to: 800, sort_order: 6 },
    { title: 'Снос самовольной постройки (узаконивание самовольной постройки)', price_note: '800 руб./час', price_from: 800, price_to: 800, sort_order: 7 },
    { title: 'Раздел совместной собственности супругов', price_note: '800 руб./час', price_from: 800, price_to: 800, sort_order: 8 },
    { title: 'Раздел общей долевой собственности жилого помещения (выделение доли в натуре или в денежном выражении)', price_note: '800 руб./час', price_from: 800, price_to: 800, sort_order: 9 },
    { title: 'Перепланировка и переустройство жилого помещения', price_note: '800 руб./час', price_from: 800, price_to: 800, sort_order: 10 },
    { title: 'Жилищные споры: признание права пользования жилым помещением, вселение, признание утратившим право пользования', price_note: '800 руб./час', price_from: 800, price_to: 800, sort_order: 11 },
    { title: 'Наследственное право: споры о праве на наследование и о разделе наследства, признание завещания недействительным', price_note: '800 руб./час', price_from: 800, price_to: 800, sort_order: 12 },
  ],
  'apellyatsiya-kassatsiya': [
    { title: 'Представительство в судах апелляционной, кассационной и надзорной инстанции', price_note: 'от 8 000 руб.', price_from: 8000, price_to: null, sort_order: 1 },
  ],
  'ispolnitelnoe-proizvodstvo': [
    { title: 'Разработка учредительных документов, договорное право', price_note: 'от 5 000 руб.', price_from: 5000, price_to: null, sort_order: 1 },
    { title: 'Регистрация ООО, учреждений, внесение изменений', price_note: 'по договорённости', price_from: null, price_to: null, sort_order: 2 },
    { title: 'Абонентское юридическое обслуживание', price_note: 'по договорённости', price_from: null, price_to: null, sort_order: 3 },
  ],
};

module.exports = { categories, services };
