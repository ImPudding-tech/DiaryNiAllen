// Google Apps Script: minimal REST-like endpoints to store & rate Hugots in a Google Sheet.
// Set SHEET_ID to your sheet's ID (the long ID in the sheet URL).
// Rows expected: header row, then rows with [ID, Hugot, Author, Timestamp, RatingsCount, RatingsSum]

const SHEET_ID = "YOUR_GOOGLE_SHEET_ID_HERE"; // <-- set this
const SHEET_NAME = "Sheet1"; // change if your sheet tab name is different

function doGet(e) {
  const action = (e.parameter && e.parameter.action) || 'list';
  if (action === 'list') return listHugots();
  return jsonResponse({ error: 'unknown action' });
}

function doPost(e) {
  let body = {};
  try {
    body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
  } catch (err) {
    return jsonResponse({ error: 'invalid JSON' });
  }
  const action = body.action;
  if (action === 'submit') return submitHugot(body);
  if (action === 'rate') return rateHugot(body);
  return jsonResponse({ error: 'unknown action' });
}

function listHugots() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  // assume first row is a header
  const rows = data.slice(1);
  const hugots = rows.map((r, i) => {
    return {
      id: r[0] ? String(r[0]) : String(i + 1),
      hugot: r[1] || '',
      author: r[2] || '',
      ts: r[3] || '',
      ratingsCount: Number(r[4] || 0),
      ratingsSum: Number(r[5] || 0),
      averageRating: r[4] ? (Number(r[5] || 0) / Number(r[4] || 1)).toFixed(2) : 0
    };
  }).reverse(); // newest first
  return jsonResponse({ hugots });
}

function submitHugot(body) {
  const hugot = String(body.hugot || '').trim();
  const author = String(body.author || '').trim();
  if (!hugot) return jsonResponse({ success: false, error: 'empty hugot' });

  const id = 'H' + (new Date().getTime()); // simple id
  const ts = new Date().toLocaleString();
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  sheet.appendRow([id, hugot, author, ts, 0, 0]);
  return jsonResponse({ success: true, id });
}

function rateHugot(body) {
  const id = String(body.id || '');
  const rating = Number(body.rating || 1);
  if (!id) return jsonResponse({ success: false, error: 'missing id' });

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  // iterate rows to find ID in column A
  for (let r = 1; r < data.length; r++) {
    if (String(data[r][0]) === id) {
      const rowIndex = r + 1; // sheet rows are 1-based
      const currentCount = Number(data[r][4] || 0);
      const currentSum = Number(data[r][5] || 0);
      const newCount = currentCount + 1;
      const newSum = currentSum + rating;
      sheet.getRange(rowIndex, 5).setValue(newCount);
      sheet.getRange(rowIndex, 6).setValue(newSum);
      return jsonResponse({ success: true, id, newCount, newSum });
    }
  }
  return jsonResponse({ success: false, error: 'id not found' });
}

// helper to return JSON with proper mime
function jsonResponse(obj) {
  const output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}