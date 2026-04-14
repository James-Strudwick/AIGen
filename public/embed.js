/**
 * FomoForms embed loader.
 *
 * Usage — drop this script on the parent page and add a div with the
 * trainer's slug as a data attribute:
 *
 *   <div data-fomoforms="your-slug"></div>
 *   <script src="https://fomoforms.com/embed.js" async></script>
 *
 * The loader replaces each div with a responsive iframe that auto-resizes
 * as the form progresses through steps.
 */
(function () {
  'use strict';

  // Resolve origin from the script tag so this works on custom domains too.
  var currentScript = document.currentScript;
  var scriptSrc = currentScript ? currentScript.src : '';
  var origin = scriptSrc ? new URL(scriptSrc).origin : 'https://fomoforms.com';

  function mount(el) {
    if (el.getAttribute('data-fomoforms-mounted') === '1') return;
    var slug = el.getAttribute('data-fomoforms') || el.getAttribute('data-slug');
    if (!slug) return;

    var iframe = document.createElement('iframe');
    iframe.src = origin + '/embed/' + encodeURIComponent(slug);
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('allow', 'clipboard-write');
    iframe.setAttribute('title', 'FomoForms');
    iframe.style.width = '100%';
    iframe.style.border = '0';
    iframe.style.display = 'block';
    iframe.style.minHeight = '600px';
    iframe.setAttribute('data-fomoforms-slug', slug);
    el.setAttribute('data-fomoforms-mounted', '1');
    el.innerHTML = '';
    el.appendChild(iframe);
  }

  function mountAll() {
    var nodes = document.querySelectorAll('[data-fomoforms]');
    for (var i = 0; i < nodes.length; i++) mount(nodes[i]);
  }

  // Listen for height updates from the iframe and resize it to match.
  window.addEventListener('message', function (e) {
    var data = e.data;
    if (!data || data.type !== 'fomoforms:height' || typeof data.height !== 'number') return;
    var frames = document.querySelectorAll('iframe[data-fomoforms-slug="' + data.slug + '"]');
    for (var i = 0; i < frames.length; i++) {
      frames[i].style.height = data.height + 'px';
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountAll);
  } else {
    mountAll();
  }

  // Re-scan later in case the container is added dynamically.
  setTimeout(mountAll, 500);
})();
