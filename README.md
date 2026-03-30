# Snake-Pedia

Snake-Pedia is a lightweight, browser-based snake game built with vanilla HTML, CSS, and JavaScript.

## Run locally

Open `index.html` directly in your browser, or serve the folder with a simple static server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deployment (GitHub Pages)

This repository includes a GitHub Actions workflow at `.github/workflows/pages.yml` that deploys the static site to GitHub Pages.

To make the website live:

1. Go to **Settings → Pages** in the GitHub repository.
2. Set **Source** to **GitHub Actions**.
3. Push to the `main` branch (or re-run the workflow).

After the workflow completes, the live URL will appear in the Pages settings and in the workflow run output.
