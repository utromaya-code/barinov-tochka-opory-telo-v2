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
      const selected = document.getElementById('selected-tariff');
      if (selected) { selected.textContent = `Вы выбрали: ${link.dataset.tariff}. Укажите это в сообщении.`; selected.hidden = false; }
    });
  });
})();
