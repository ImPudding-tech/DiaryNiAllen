```markdown
# Hugot Wall — Frontend + Apps Script example

This repository contains a minimal static frontend (for GitHub Pages) and an example Google Apps Script that stores and serves "Hugot" entries using Google Sheets.

How it works:
- The static site (index.html + JS) runs on GitHub Pages.
- Forms and rating actions call a Google Apps Script web app (deployed by you) which reads/writes a Google Sheet.

Setup steps
1. Create a Google Sheet for the hugots.
   - Suggested columns (first row = header):
     ID | Hugot | Author | Timestamp | RatingsCount | RatingsSum
   - Note the sheet ID (part of the URL).

2. Create a Google Apps Script project
   - In script.google.com create a new project and paste the code from apps-script/apps-script.gs.
   - Replace SHEET_ID constant with your sheet's ID.
   - Save.

3. Deploy the Apps Script as web app
   - Deploy > New deployment > type: Web app
   - Execute as: Me
   - Who has access: Anyone (or Anyone, even anonymous) — choose based on your privacy/security needs.
   - Deploy and copy the web app URL.

4. Update the frontend
   - Open index.html and replace the placeholder WEB_APP_URL with your web app URL (or set it in a config in app.js).

5. Enable GitHub Pages
   - In repository Settings → Pages, select branch (main) and root (or /docs) where index.html lives.
   - Save and open the published site.

Security & spam
- Anyone can submit if you deploy web app as "Anyone". Consider adding reCAPTCHA or a moderation workflow if spam is a concern.
- If you need auth, the Apps Script can be set to require Google sign-in, but that changes frontend behavior.

If you want, I can:
- Create a PR with these files added to your repo (I will need your OK to push).
- Extend the Apps Script to store user email (if permissioned), or to support deleting/moderation features.

```
