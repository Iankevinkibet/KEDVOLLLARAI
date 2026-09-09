/*
 * Optional fixed placements for this site.
 *
 * Create ad units in AdSense, then paste their numeric data-ad-slot IDs below.
 * Keep the values empty until you have real IDs; publisher ID alone is not enough
 * to request a fixed display ad unit.
 */
window.KEV_ADSENSE_SLOTS = {
  top: '',
  footer: ''
};

(function () {
  'use strict';

  var client = 'ca-pub-5671905101681007';
  var slots = window.KEV_ADSENSE_SLOTS || {};

  function renderPlacement(name) {
    var slotId = String(slots[name] || '').trim();
    var placement = document.querySelector('[data-adsense-placement="' + name + '"]');

    if (!placement || !slotId) {
      return;
    }

    var ad = document.createElement('ins');
    ad.className = 'adsbygoogle';
    ad.style.display = 'block';
    ad.setAttribute('data-ad-client', client);
    ad.setAttribute('data-ad-slot', slotId);
    ad.setAttribute('data-ad-format', 'auto');
    ad.setAttribute('data-full-width-responsive', 'true');

    placement.appendChild(ad);
    placement.hidden = false;

    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }

  function init() {
    renderPlacement('top');
    renderPlacement('footer');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}());
