// Конфиг для PM2 — process manager, который следит за сервером на VPS-хостинге
// и автоматически перезапускает его при падении или перезагрузке сервера.
// Не нужен для PaaS-хостингов (Render, Railway и т.п.) — там перезапуск
// уже встроен в саму платформу.
//
// Использование на сервере (после npm install -g pm2):
//   pm2 start ecosystem.config.js   — запустить
//   pm2 save                         — запомнить текущий список процессов
//   pm2 startup                      — включить автозапуск PM2 при перезагрузке сервера
//   pm2 logs monolit-advokat-site    — посмотреть логи
//   pm2 restart monolit-advokat-site — перезапустить вручную

module.exports = {
  apps: [
    {
      name: 'monolit-advokat-site',
      script: 'server/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
