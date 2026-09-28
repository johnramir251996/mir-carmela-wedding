// Bound to your Google Sheet: Extensions > Apps Script. Deploy as Web app (Execute as: Me, Access: Anyone).
const SHEET_NAME = "RSVPs";
const HEADERS = ["Timestamp","Name","Mobile","Attendance","Guests","Additional Guest","Food 1","Food 2","Food 3","Food 4","Transportation","Passengers","Dietary Restrictions","Message"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const d = JSON.parse(e.postData.contents);
    if (!d.name || !d.mobile || !d.attendance) throw new Error("Missing required fields");
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
    const t = v => { v = String(v == null ? "" : v); return /^[=+\-@]/.test(v) ? "'" + v : v; }; // block formula injection
    sh.appendRow([new Date(), d.name, d.mobile, d.attendance, d.guests, d.additionalGuest, d.food1, d.food2, d.food3, d.food4,
      d.transportation, d.passengers, d.dietaryRestrictions, d.message].map(t));
    return out({ success: true });
  } catch (err) {
    return out({ success: false, error: String(err) });
  } finally { lock.releaseLock(); }
}
function doGet() { return out({ ok: true }); }
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
