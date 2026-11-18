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

  // The section the page is in: once its title reaches the header, its name shows next
  // to BabyLink ("BabyLink · How it works"), fading in. And a jump to a section (#how-to-use)
  // stops below the header, however tall it is (on a phone the menu takes a second line).
  var brand = header && header.querySelector('.brand');
  var titles = Array.prototype.slice.call(
    document.querySelectorAll('main h2, .doc h1')
  );
  if (header && brand && titles.length) {
    var here = document.createElement('span');
    here.className = 'here';
    here.setAttribute('aria-hidden', 'true');
    brand.appendChild(here);
    var shown = '';
    var swap = null;
    var update = function () {
      var line = header.getBoundingClientRect().bottom;
      var name = '';
      for (var i = 0; i < titles.length; i++) {
        // Under the header or right below it (where a jump to the section stops): this section.
        if (titles[i].getBoundingClientRect().top <= line + 24) name = titles[i].textContent.trim();
        else break;
      }
      if (name === shown) return;
      shown = name;
      here.classList.remove('show');
      clearTimeout(swap);
      swap = setTimeout(function () {
        here.textContent = name;
        if (!name) return;
        void here.offsetWidth; // drawn hidden first, so it fades in
        here.classList.add('show');
      }, here.textContent ? 140 : 0);
    };
    var ticking = false;
    window.addEventListener(
      'scroll',
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          ticking = false;
          update();
        });
      },
      { passive: true }
    );
    window.addEventListener('resize', update);
    update();
  }
  if (header) {
    var setHeight = function () {
      root.style.setProperty('--header-h', header.offsetHeight + 'px');
    };
    setHeight();
    if (window.ResizeObserver) new ResizeObserver(setHeight).observe(header);
    // A page opened at a section (support.html#troubleshooting): there again, below the header.
    if (location.hash.length > 1) {
      var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) setTimeout(function () { target.scrollIntoView(); }, 0);
    }
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
