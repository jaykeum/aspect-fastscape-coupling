# ASPECT–FastScape coupling tutorial

Docusaurus site for the talk *Coupling ASPECT and FastScape* (GeoFLAC/DynEarthSol Workshop & Hackathon 2026, KIGAM).

## Publish on GitHub Pages

1. Edit `docusaurus.config.js`: set `GITHUB_USER` to your GitHub user name (the repository name is `aspect-fastscape-coupling`; change `REPO_NAME` if you pick another).
2. Create an empty repository with that name on GitHub, then from this folder:
   ```bash
   git init -b main
   git add .
   git commit -m "ASPECT-FastScape coupling tutorial"
   git remote add origin https://github.com/<user>/aspect-fastscape-coupling.git
   git push -u origin main
   ```
3. On GitHub: Settings → Pages → Build and deployment → Source: **GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` builds and publishes on every push to `main`. The site appears at `https://<user>.github.io/aspect-fastscape-coupling/`.

## Local preview

```bash
npm install
npm start        # http://localhost:3000/aspect-fastscape-coupling/
npm run build    # static site in build/
```

## Layout

- `docs/` – pages (Markdown)
- `static/img/` – figures; `aspect-fastscape-loop.svg` is the animated loop (SMIL)
- `examples/` – the ASPECT parameter file of the Gaussian core-complex model
- `media/` – GIF and MP4 of the loop animation for slides
