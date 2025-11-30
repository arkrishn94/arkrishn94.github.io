# Personal Website

This repository powers a personal website. It is a lightweight static site that loads content from structured data files so updates stay fast and repeatable.

### Editing Content

- `data/profile.json`: Name, tagline, location, email, CV link, and external profiles.
- `data/about.md`: Markdown for the main bio. Supports standard Markdown formatting and inline links.
- `data/publications.json`: Preprints and publications. Entries accept `title`, `authors`, `venue`, `year`, and `links`.
- `data/service.json`: Markdown-enabled bullet list of service activities (each string can include inline links).

Additions appear instantly on reload because `main.js` fetches these files and renders sections dynamically. To add new sections (for example, a blog), create an additional data file and extend the renderer in `main.js` with the desired layout.

### Local Development

1. Serve the repo with any static file server (for example `python3 -m http.server`).
2. Open the served URL in a browser to preview changes.
3. Commit and push to publish via GitHub Pages.

### License

Content and design are © Aditya Krishnan. The codebase is available for personal use; please request permission before reusing substantial portions.
