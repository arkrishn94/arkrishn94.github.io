document.addEventListener("DOMContentLoaded", initSite);

async function initSite() {
  updateFooterYear();
  await Promise.all([loadProfile(), loadAbout()]);
}

async function loadProfile() {
  try {
    const profile = await fetchJson("data/profile.json");
    renderProfile(profile);
  } catch (error) {
    console.error("Failed to load profile", error);
  }
}

async function loadAbout() {
  try {
    const md = await fetchText("data/about.md");
    const container = document.querySelector("[data-about-content]");
    if (!container) return;
    if (window.marked && window.marked.parse) {
      container.innerHTML = window.marked.parse(md);
    } else if (window.marked) {
      container.innerHTML = window.marked(md);
    } else {
      container.innerHTML = md;
    }
  } catch (error) {
    console.error("Failed to load about content", error);
  }
}

function renderProfile(profile) {
  setText("[data-profile-name]", profile.name);
  setText("[data-profile-tagline]", profile.tagline);

  const email = Array.isArray(profile.email)
    ? profile.email[0] + "@" + profile.email[1]
    : profile.email;

  setText("[data-contact-email]", email);

  const headshot = document.querySelector("[data-profile-headshot]");
  if (headshot && profile.headshot) headshot.src = profile.headshot;

  const locationEl = document.querySelector("[data-profile-location] span");
  if (locationEl) locationEl.textContent = profile.location || "";

  const emailEl = document.querySelector("[data-profile-email] a");
  if (emailEl && email) {
    emailEl.href = "mai" + "lto:" + email;
    emailEl.textContent = "Email";
  }

  const cvLink = document.querySelector("[data-cv-link]");
  if (cvLink && profile.cv) cvLink.href = profile.cv;

  if (Array.isArray(profile.links)) {
    profile.links.forEach(link => {
      const icon = link.icon;
      if (!icon) return;
      const el = document.querySelector(`[data-profile-${icon}] a`);
      if (el) {
        el.href = link.url;
        el.textContent = link.label;
      }
    });
  }
}

async function fetchJson(path) {
  const r = await fetch(path, { cache: "no-cache" });
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return r.json();
}

async function fetchText(path) {
  const r = await fetch(path, { cache: "no-cache" });
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return r.text();
}

function setText(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.textContent = value || "";
}

function updateFooterYear() {
  const el = document.querySelector("[data-footer-year]");
  if (el) el.textContent = new Date().getFullYear();
}
