# Anatomy Explorer

An original, browser-based 3D muscular-system learning demo. Built with Three.js and a procedural illustrative model; it does **not** copy SciMynd source code, assets, branding, or interface.

## Features

- Rotate, zoom, and reset the 3D view
- Front, side, and back camera presets
- Select muscles in the model or in the searchable list
- Highlight selected muscle groups
- Isolate the selected structure
- Toggle the anatomy palette and transparency; adjust opacity
- Responsive layout for desktop and mobile

## Run locally

Because the application uses JavaScript ES modules, run it through a local web server rather than opening `index.html` directly.

With Python 3 installed, from this folder run:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Publish with GitHub Pages

1. Create a new **public** repository on GitHub named `anatomy-explorer` (or another name you prefer).
2. Upload `index.html`, `styles.css`, `app.js`, and this `README.md` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then save.
6. Wait for the Pages deployment workflow to finish. The public URL is typically `https://YOUR-USERNAME.github.io/anatomy-explorer/`.

If the repository is named `YOUR-USERNAME.github.io`, the site URL is typically `https://YOUR-USERNAME.github.io/`.

## Dependencies and network requirements

- [Three.js 0.164.1](https://threejs.org/) loaded from jsDelivr CDN
- `OrbitControls` from the same Three.js version, also loaded from jsDelivr
- Google Fonts (DM Sans and Manrope); the system falls back to generic sans-serif fonts if fonts cannot load

The site needs an internet connection to load the JavaScript module dependencies from the CDN. No backend, account, database, or API key is required. For fully offline use, download and vendor the Three.js distribution and OrbitControls module into the repository, then update the import paths.

## Anatomy asset and licensing note

This first version uses original, procedurally generated ellipsoid and capsule meshes made in code. It does not redistribute third-party anatomy models. The shapes are intentionally stylized and educational; they are not a medically accurate anatomical atlas and should not be used for clinical decision-making.

The project source is provided under the MIT License below. Third-party dependencies retain their own licenses; see the Three.js project for details.

## Attribution and honest project description

You can describe this as a project you built, for example:

> “I built Anatomy Explorer, an interactive 3D muscular-system visualization using Three.js, with searchable muscle groups, selection/highlighting, isolation, transparency controls, and GitHub Pages deployment.”

If you use or adapt this code, it is accurate to say you built the web application. Do not imply that the stylized meshes are a professionally validated anatomical model.

## License

MIT License

Copyright (c) 2026 Anatomy Explorer contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
