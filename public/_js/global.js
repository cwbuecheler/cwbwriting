const getById = (elId) => document.getElementById(elId);
const getByClass = (className) => document.getElementsByClassName(className);

const buildEmail = (a, b, c, d) => `${c}${a}${d}${b}`;
const buildEmailLink = (eml) => `<a href="mailto:${eml}">${eml}</a>`;
const injectEmailLink = (el, a, b, c, d) => {
  const eml = buildEmail(a, b, c, d);
  getById(el).innerHTML = buildEmailLink(eml);
};

const setCopyrightYear = (elId) => {
  const year = new Date().getFullYear();
  const el = getById(elId);
  el.innerHTML = year;
};

const ls = {
  get: (name) => window.localStorage.getItem(name),
  set: (name, val) => window.localStorage.setItem(name, val),
  del: (name) => window.localStorage.removeItem(name),
};

// Stuff to do after the DOM loads
const afterDOMLoaded = () => {
  // Handle light or dark mode
  const mode = ls.get('mode');
  // OS default first
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    getById('htmltop').className = 'dark';
  } else {
    getById('htmltop').className = 'light';
  }
  // Localstorage overwrites OS pref
  if (mode === 'light') {
    getById('htmltop').className = 'light';
  } else {
    getById('htmltop').className = 'dark';
  }

  // Handle copyright year
  setCopyrightYear('copyyear');

  // Handle contact link
  if (getById('contactemail')) {
    injectEmailLink('contactemail', 'ack@c', 'ting.com', 'feedb', 'wbwri');
  }

  // Handle light/dark click
  getById('linkModeDark').addEventListener('click', (e) => {
    e.preventDefault();
    ls.set('mode', 'dark');
    document.getElementsByClassName('g-recaptcha')[0].setAttribute('data-theme', 'dark');
    getById('htmltop').className = 'dark';
    const iframe = document.querySelector('.g-recaptcha iframe');
    iframe.src = iframe.src;
  });
  getById('linkModeLight').addEventListener('click', (e) => {
    e.preventDefault();
    ls.set('mode', 'light');
    document.getElementsByClassName('g-recaptcha')[0].setAttribute('data-theme', 'light');
    getById('htmltop').className = 'light';
    const iframe = document.querySelector('.g-recaptcha iframe');
    iframe.src = iframe.src;
  });

  // Handle Show Full Description Click
  getById('linkFullDesc').addEventListener('click', (e) => {
    e.preventDefault();
    getByClass('desctoggle')[0].style.display = 'none';
    getByClass('fulldesc')[0].style.display = 'block';
  });
};

// Handle checking DOM load at different times
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', afterDOMLoaded);
} else {
  afterDOMLoaded();
}
