const state = {
  profileName: null
};

document.addEventListener("DOMContentLoaded", initSite);

async function initSite() {
  updateFooterYear();

  await Promise.all([
    loadProfile(),
    loadAbout(),
    loadPublications(),
    loadService()
  ]);
}

async function loadProfile() {
  try {
    const profile = await fetchJson("data/profile.json");
    state.profileName = profile.name || null;
    renderProfile(profile);
  } catch (error) {
    console.error("Failed to load profile", error);
    showFallback("[data-profile-name]", "Profile unavailable");
  }
}

async function loadAbout() {
  try {
    const aboutMarkdown = await fetchText("data/about.md");
    renderAbout(aboutMarkdown);
  } catch (error) {
    console.error("Failed to load about content", error);
    showFallback("[data-about-content]", "About section coming soon.");
  }
}

async function loadPublications() {
  try {
    const publications = await fetchJson("data/publications.json");
    renderPublications(publications);
  } catch (error) {
    console.error("Failed to load publications", error);
    showFallback("[data-publications]", "No publications available yet.");
  }
}

async function loadService() {
  try {
    const service = await fetchJson("data/service.json");
    renderService(service);
  } catch (error) {
    console.error("Failed to load service entries", error);
    showFallback("[data-service-list]", "No service entries available yet.");
  }
}

async function fetchJson(path) {
  const response = await fetch(path, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Request for ${path} failed with ${response.status}`);
  }
  return response.json();
}

async function fetchText(path) {
  const response = await fetch(path, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Request for ${path} failed with ${response.status}`);
  }
  return response.text();
}

function renderProfile(profile) {
  setText("[data-profile-name]", profile.name);
  setText("[data-profile-tagline]", profile.tagline);
  setText("[data-profile-location]", profile.location || "");

  const headshot = document.querySelector("[data-profile-headshot]");
  if (headshot && profile.headshot) {
    headshot.src = profile.headshot;
  }

  const linksContainer = document.querySelector("[data-profile-links]");
  if (!linksContainer) {
    return;
  }

  const links = buildContactLinks(profile);
  linksContainer.innerHTML = links.length ? links.join(" \u00b7 ") : "Reach out for more details.";
}

function buildContactLinks(profile) {
  const entries = [];

  if (profile.email) {
    entries.push(createAnchor(profile.email, `mailto:${profile.email}`));
  }

  if (profile.cv) {
    entries.push(createAnchor("CV", profile.cv));
  }

  if (Array.isArray(profile.links)) {
    profile.links.forEach(link => {
      if (link && link.label && link.url) {
        entries.push(createAnchor(link.label, link.url));
      }
    });
  }

  return entries;
}

function createAnchor(label, url) {
  const safeUrl = url || "#";
  const needsBlank = safeUrl.startsWith("http");
  return `<a href="${safeUrl}"${needsBlank ? " target=\"_blank\" rel=\"noopener noreferrer\"" : ""}>${label}</a>`;
}

function renderAbout(markdown) {
  const container = document.querySelector("[data-about-content]");
  if (!container) {
    return;
  }

  if (window.marked && window.marked.parse) {
    container.innerHTML = window.marked.parse(markdown);
  } else if (window.marked) {
    container.innerHTML = window.marked(markdown);
  } else {
    container.innerHTML = markdown;
  }
}

function renderPublications(data) {
  const container = document.querySelector("[data-publications]");
  if (!container) {
    return;
  }

  container.innerHTML = "";

  const groups = [
    { heading: "Publications", items: Array.isArray(data?.publications) ? data.publications : [] },
    { heading: "Preprints", items: Array.isArray(data?.preprints) ? data.preprints : [] }
  ];

  const hasContent = groups.some(group => group.items.length);
  if (!hasContent) {
    container.innerHTML = "<p>No publications available yet.</p>";
    return;
  }

  groups.forEach(group => {
    if (!group.items.length) {
      return;
    }

    const wrapper = document.createElement("div");

    const heading = document.createElement("h3");
    heading.textContent = group.heading;
    wrapper.appendChild(heading);

    group.items.forEach(entry => {
      const block = document.createElement("div");
      block.className = "pub-entry";

      const title = document.createElement("p");
      const primaryLink = entry.links && entry.links[0]?.url;
      if (primaryLink) {
        const anchor = document.createElement("a");
        anchor.href = primaryLink;
        anchor.textContent = entry.title;
        anchor.target = primaryLink.startsWith("http") ? "_blank" : "_self";
        anchor.rel = primaryLink.startsWith("http") ? "noopener noreferrer" : "";
        title.appendChild(anchor);
      } else {
        title.textContent = entry.title;
      }
      block.appendChild(title);

      if (entry.authors) {
        const authors = document.createElement("p");
        authors.className = "pub-meta";
        authors.innerHTML = formatAuthors(entry.authors);
        block.appendChild(authors);
      }

      const venueBits = [];
      if (entry.venue) {
        venueBits.push(entry.venue);
      }
      if (entry.year) {
        venueBits.push(String(entry.year));
      }

      if (venueBits.length) {
        const venue = document.createElement("p");
        venue.className = "pub-meta";
        venue.textContent = venueBits.join(", ");
        block.appendChild(venue);
      }

      if (Array.isArray(entry.links) && entry.links.length > 1) {
        const more = document.createElement("p");
        more.className = "pub-meta";
        const extras = entry.links.slice(1).map(link => createAnchor(link.label, link.url));
        more.innerHTML = extras.join(" \u00b7 ");
        block.appendChild(more);
      }

      wrapper.appendChild(block);
    });

    container.appendChild(wrapper);
  });
}

function renderService(data) {
  const list = document.querySelector("[data-service-list]");
  if (!list) {
    return;
  }

  const items = Array.isArray(data?.items) ? data.items : [];
  list.innerHTML = "";

  if (!items.length) {
    const fallback = document.createElement("li");
    fallback.textContent = "No service entries available yet.";
    list.appendChild(fallback);
    return;
  }

  items.forEach(entry => {
    const item = document.createElement("li");
    if (window.marked && window.marked.parseInline) {
      item.innerHTML = window.marked.parseInline(entry);
    } else if (window.marked) {
      item.innerHTML = window.marked(entry);
    } else {
      item.innerHTML = entry;
    }
    list.appendChild(item);
  });
}

function formatAuthors(authors) {
  if (!Array.isArray(authors)) {
    return "";
  }

  return authors
    .map(author => {
      if (state.profileName && author.includes(state.profileName)) {
        return `<strong>${author}</strong>`;
      }
      return author;
    })
    .join(", ");
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (!element) {
    return;
  }
  element.textContent = value || "";
}

function showFallback(selector, message) {
  const element = document.querySelector(selector);
  if (!element) {
    return;
  }
  if (element instanceof HTMLUListElement) {
    element.innerHTML = `<li>${message}</li>`;
  } else {
    element.innerHTML = `<p>${message}</p>`;
  }
}

function updateFooterYear() {
  const footerYear = document.querySelector("[data-footer-year]");
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }
}
