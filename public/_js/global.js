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

const getMastodonData = () => {
  fetch('https://mastodon.social/@cwbuecheler.rss')
    .then((response) => response.text())
    .then((str) => new window.DOMParser().parseFromString(str, 'text/xml'))
    .then((data) => {
      const items = data.querySelectorAll('item');
      const latestItem = items[0];
      let html = '';
      // link, pubdate, description
      const link = latestItem.querySelector('link').innerHTML;
      const pubDate = latestItem.querySelector('pubDate').innerHTML;
      const description = latestItem.querySelector('description').innerHTML;
      const cleanDescription = description.replace('&lt;p&gt;', '').replace('&lt;/p&gt;', '');
      const unformattedDate = new Date(pubDate);
      const formattedDate = unformattedDate.toLocaleString('en-US', { timeZone: 'EST' });

      html += `<p class="name"><a href="https://mastodon.social/cwbuecheler" target="_blank" rel="me">@cwbuecheler</a> · <span><a href="${link}" target="_blank">${formattedDate}</a></span></p>`;
      html += `<p class="text">${cleanDescription}</p>`;
      const mastodonDiv = document.getElementById('mastodon');
      mastodonDiv.innerHTML = html;
    });
};

const handleContactForm = async (e) => {
  e.preventDefault();
  const form = e.target;
  const resultEl = getById('contactform-result');
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';
  resultEl.className = 'contactform-result';
  resultEl.textContent = '';
  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: new FormData(form),
    });
    const json = await response.json();
    if (json.success) {
      form.innerHTML =
        '<div class="contactform-result contactform-result--success">Thanks for reaching out! I\'ll get back to you soon.</div>';
      return;
    } else {
      resultEl.classList.add('contactform-result--error');
      resultEl.textContent = 'Something went wrong. Please try again or email me directly.';
    }
  } catch {
    resultEl.classList.add('contactform-result--error');
    resultEl.textContent = 'Something went wrong. Please try again or email me directly.';
  }
  submitBtn.disabled = false;
  submitBtn.textContent = 'Send Message';
};

// Stuff to do after the DOM loads
const afterDOMLoaded = async () => {
  // Handle light or dark mode
  const mode = ls.get('mode');
  const htmltop = getById('htmltop');
  const setMode = (isDark) => {
    htmltop.classList.remove('dark', 'light');
    htmltop.classList.add(isDark ? 'dark' : 'light');
    const bskyEmbed = getById('embedbsky-com-timeline-embed');
    if (bskyEmbed) {
      bskyEmbed.classList.remove('dark', 'light', 'darkmode');
      bskyEmbed.classList.add(isDark ? 'darkmode' : 'light');
    }
  };
  // OS default first
  const prefersDark =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  setMode(prefersDark);
  // Localstorage overwrites OS pref
  if (mode === 'light') {
    setMode(false);
  } else if (mode === 'dark') {
    setMode(true);
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
    setMode(true);
  });
  getById('linkModeLight').addEventListener('click', (e) => {
    e.preventDefault();
    ls.set('mode', 'light');
    setMode(false);
  });

  // Handle contact form
  if (getById('contactform')) {
    getById('contactform').addEventListener('submit', handleContactForm);
  }

  // Handle Show Full Description Click
  if (getById('linkFullDesc')) {
    getById('linkFullDesc').addEventListener('click', (e) => {
      e.preventDefault();
      getByClass('desctoggle')[0].style.display = 'none';
      getByClass('fulldesc')[0].style.display = 'block';
    });
  }
};

// Handle checking DOM load at different times
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', afterDOMLoaded);
} else {
  afterDOMLoaded();
}
