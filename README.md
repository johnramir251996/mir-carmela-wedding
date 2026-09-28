# Mir & Carmela — Wedding Website

Static site (HTML/CSS/vanilla JS) with RSVPs saved to Google Sheets.

## 1. Run locally
Open `index.html` in a browser, or serve the folder: `python3 -m http.server 8000` then visit http://localhost:8000.

## 2. Change wedding information
Open `script.js`. Everything is in the **CONFIGURATION** block at the top: date, countdown time, story timeline, ceremony/reception details and map links, food menu, RSVP deadline, additional guest price. Names and page titles/SEO tags are in `index.html` (search for "Mir" and "Carmela").

## 3. Change images
Put optimized images (JPG, ~1600px wide, under 300 KB) in `assets/`:
- `hero.jpg` — hero background (portrait-friendly crop)
- `ceremony.jpg`, `reception.jpg` — venue photos (3:2)
Also update `og:image` in `index.html` with your full public URL after deploying. Missing images fall back to a neutral tone.

## 4. Connect Google Apps Script
1. Create a Google Sheet. Choose **Extensions > Apps Script**.
2. Paste `apps-script/Code.gs`, save.
3. **Deploy > New deployment > Web app**. Execute as **Me**, access **Anyone**. Authorize and copy the Web app URL.
4. Paste the URL into `GOOGLE_SCRIPT_URL` at the top of `script.js`.
5. Submit a test RSVP; an "RSVPs" tab is created automatically. If you edit the script later, create a **new deployment version**.

## 5. Deploy to GitHub Pages
1. Push this folder to a GitHub repository (files at the repo root).
2. **Settings > Pages**: source **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. Your site appears at `https://<username>.github.io/<repo>/`.
