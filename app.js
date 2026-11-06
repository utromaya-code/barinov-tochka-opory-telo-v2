(() => {
  'use strict';
  const config = window.SITE_CONFIG || {};
  window.dataLayer = window.dataLayer || [];
  const track = (event, details = {}) => {
    const item = { event, ...details };
    window.dataLayer.push(item);
    window.dispatchEvent(new CustomEvent('course:analytics', { detail: item }));
    if (typeof window.gtag === 'function') window.gtag('event', event, details);
  };
  if (/^G-[A-Z0-9]+$/.test(config.analyticsId || '')) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.analyticsId)}`;
    document.head.appendChild(script);
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', config.analyticsId);
  }
  document.querySelectorAll('[data-event]').forEach((element) => {
    element.addEventListener('click', () => track(element.dataset.event, {
      location: element.dataset.place || 'pricing',
      ...(element.dataset.tariff ? { tariff: element.dataset.tariff } : {})
    }));
  });
  document.querySelectorAll('.faq-list details').forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) track('faq_open', { question: item.querySelector('summary').textContent.replace('+', '').trim() });
    });
  });
  document.querySelectorAll('[data-tariff]').forEach((link) => {
    link.addEventListener('click', () => {
      const tariff = document.getElementById('tariff');
      if (tariff) tariff.value = link.dataset.tariff;
    });
  });

  // Заявка: собираем готовое сообщение и открываем Telegram (до подключения GetCourse)
  const form = document.getElementById('lead-form');
  if (form) {
    const params = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((key) => {
      if (form.elements[key] && params.get(key)) form.elements[key].value = params.get(key);
    });
    const error = document.getElementById('form-error');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (form.elements.website && form.elements.website.value) return;
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const contact = String(data.get('contact') || '').trim();
      const tariff = String(data.get('tariff') || '');
      const problems = [];
      if (name.length < 2) problems.push('имя');
      if (contact.length < 3) problems.push('телефон, Telegram или email');
      if (!tariff) problems.push('формат участия');
      if (!data.get('consent')) problems.push('согласие на обработку данных');
      if (problems.length) {
        error.textContent = `Заполните: ${problems.join(', ')}.`;
        error.hidden = false;
        return;
      }
      error.hidden = true;
      const utm = ['utm_source', 'utm_medium', 'utm_campaign'].map((k) => data.get(k)).filter(Boolean).join(' / ');
      const lines = [
        'Здравствуйте! Хочу на курс «Точка опоры · Тело» (старт 22 ноября).',
        `Имя: ${name}`,
        `Связь: ${contact}`,
        `Формат: ${tariff}`,
      ];
      const message = String(data.get('message') || '').trim();
      if (message) lines.push(`Вопрос: ${message}`);
      if (utm) lines.push(`Источник: ${utm}`);
      track('form_submit', { location: 'apply', tariff });
      window.location.assign(`https://t.me/vsemaya?text=${encodeURIComponent(lines.join('\n'))}`);
    });
  }

  // Закреплённая кнопка на телефоне: после первого экрана, кроме тарифов и заявки
  const sticky = document.querySelector('.mobile-cta');
  if (sticky && 'IntersectionObserver' in window) {
    sticky.hidden = false;
    const hidden = new Set(['top']);
    const update = () => sticky.classList.toggle('is-visible', hidden.size === 0);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) hidden.add(e.target.id); else hidden.delete(e.target.id); });
      update();
    });
    ['top', 'pricing', 'apply'].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }
})();
