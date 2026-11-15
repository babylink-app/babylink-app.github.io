// BabyLink site: the theme button, the header shadow and the feature tiles.
// The theme follows the system (prefers-color-scheme: the phone's or the computer's setting)
// until someone presses the button. A choice different from the system is kept in
// localStorage; pressing back to what the system has returns to following the system.
// The <head> of every page applies a kept choice before the page is drawn.
(function () {
  var root = document.documentElement;
  var media = window.matchMedia('(prefers-color-scheme: light)');
  var KEY = 'babylink.theme';

  function system() {
    return media.matches ? 'light' : 'dark';
  }
  function current() {
    return root.dataset.theme || system();
  }

  var toggles = document.querySelectorAll('.theme-toggle');
  function label() {
    toggles.forEach(function (button) {
      button.setAttribute(
        'aria-label',
        document.documentElement.lang === 'de'
          ? current() === 'dark'
            ? 'Zum hellen Design wechseln'
            : 'Zum dunklen Design wechseln'
          : current() === 'dark'
            ? 'Switch to the light theme'
            : 'Switch to the dark theme'
      );
    });
  }

  toggles.forEach(function (button) {
    button.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      try {
        if (next === system()) {
          delete root.dataset.theme;
          localStorage.removeItem(KEY);
        } else {
          root.dataset.theme = next;
          localStorage.setItem(KEY, next);
        }
      } catch (e) {
        root.dataset.theme = next;
      }
      label();
    });
  });
  media.addEventListener('change', label);
  label();

  // Header: a shadow once the page scrolls under it.
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 4);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Feature tiles: a tap shows the details inside the same card; one open at a time.
  var tiles = document.querySelectorAll('.tile');
  function setOpen(tile, open) {
    tile.classList.toggle('open', open);
    tile.querySelector('.tile-toggle').setAttribute('aria-expanded', open ? 'true' : 'false');
    tile.querySelector('.detail').setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  tiles.forEach(function (tile) {
    tile.querySelector('.tile-toggle').addEventListener('click', function () {
      var open = !tile.classList.contains('open');
      tiles.forEach(function (other) {
        if (other !== tile) setOpen(other, false);
      });
      setOpen(tile, open);
    });
  });
})();
