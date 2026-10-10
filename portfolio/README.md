# Khushi Sahu — Portfolio

Static site (HTML + CSS + JS). Animations use GSAP + ScrollTrigger and Lenis smooth scroll, loaded from CDNs. No build step.

## Run locally

```bash
cd portfolio
python3 -m http.server 5500
```

Open http://localhost:5500

## Structure

```
index.html        page content (edit text here)
css/style.css     styles, colors (see :root tokens at the top)
js/main.js        all animations & interactions
assets/           favicon (put resume PDF / images here)
```

## Deploy

Any static host works — point it at this folder, no build command:

- **Vercel**: `npx vercel` from this folder, or import the repo and set the root directory to `portfolio`.
- **Netlify**: drag the `portfolio` folder onto app.netlify.com/drop.
- **GitHub Pages**: push to a repo, Settings → Pages → deploy from branch.
