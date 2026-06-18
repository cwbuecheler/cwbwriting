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

const SIGNED_COPY_BOOK_PRICE = 12.99;
const SIGNED_COPY_SHIPPING_RATES = [
  { country: 'US',    label: 'United States',         rate: 5.22  },
  { country: 'FR',    label: 'France',                rate: 10.75 },
  { country: 'EU',    label: 'Other European Union',  rate: 22.50 },
  { country: 'UK',    label: 'United Kingdom',        rate: 27.00 },
  { country: 'other', label: 'Other (International)', rate: 45.50 },
];

const getSignedCopyRate = (code) => {
  const match = SIGNED_COPY_SHIPPING_RATES.find((r) => r.country === code);
  return match || SIGNED_COPY_SHIPPING_RATES.find((r) => r.country === 'other');
};

const updateSignedCopySummary = () => {
  const countryCode = getById('sc-country').value;
  const shippingEl  = getById('sc-shipping-display');
  const totalEl     = getById('sc-total-display');
  if (!countryCode) {
    shippingEl.textContent = 'Select a country';
    shippingEl.style.color = '#888';
    totalEl.textContent = '--';
    getById('sc-country-name').value = '';
    getById('sc-shipping-hidden').value = '';
    getById('sc-total-hidden').value = '';
    getById('sc-submit').disabled = true;
    return;
  }
  const entry = getSignedCopyRate(countryCode);
  const total = (SIGNED_COPY_BOOK_PRICE + entry.rate).toFixed(2);
  shippingEl.textContent = '$' + entry.rate.toFixed(2);
  shippingEl.style.color = '';
  totalEl.textContent = '$' + total;
  getById('sc-country-name').value = entry.label;
  getById('sc-shipping-hidden').value = '$' + entry.rate.toFixed(2);
  getById('sc-total-hidden').value = '$' + total;
  getById('sc-submit').disabled = false;
};

const handleSignedCopiesForm = async (e) => {
  e.preventDefault();
  const form = e.target;
  const resultEl = getById('sc-form-result');
  const submitBtn = form.querySelector('button[type="submit"]');
  if (!getById('sc-country').value) {
    resultEl.className = 'contactform-result contactform-result--error';
    resultEl.textContent = 'Please select your country.';
    return;
  }
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
      getById('signed-copy-form').style.display = 'none';
      getById('order-success').style.display = 'block';
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
  submitBtn.textContent = 'Request Order';
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

  // Handle signed copies order form
  if (getById('signed-copies-form')) {
    getById('sc-country').addEventListener('change', updateSignedCopySummary);
    getById('signed-copies-form').addEventListener('submit', handleSignedCopiesForm);
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
