// src/utils/csv.js
// ======================================================
// CSV format:
// title,description,columnId,priority
// "Fix login","Users can't login","todo","high"
// ======================================================

const HEADERS = ["title", "description", "columnId", "priority"];


// ======================================================
// Escapes a value for CSV export
// ======================================================
function csvEscape(value) {
  const s = String(value ?? "");

  // quote if contains comma, quote or newline
  if (/[",\n\r]/.test(s)) {
    return `"${s.replaceAll('"', '""')}"`;
  }

  return s;
}


// ======================================================
// Convert tasks -> CSV string
// ======================================================
export function tasksToCsv(tasks) {
  const lines = [];

  // header row
  lines.push(HEADERS.join(","));

  for (const t of tasks) {
    const row = [
      csvEscape(t.title),
      csvEscape(t.description),
      csvEscape(t.columnId),
      csvEscape(t.priority),
    ];

    lines.push(row.join(","));
  }

  return lines.join("\n");
}


// ======================================================
// Download CSV in browser
// ======================================================
export function downloadCsv(csvString, filename = "kanban-tasks.csv") {

  // Add BOM so Excel opens UTF-8 correctly
  const BOM = "\uFEFF";

  const blob = new Blob([BOM + csvString], {
    type: "text/csv;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}



// ======================================================
// CSV parser (supports quotes, escaped quotes, newlines)
// ======================================================
function parseCsvText(text) {

  // Remove BOM if present
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
  }

  const rows = [];

  let row = [];
  let field = "";

  let i = 0;
  let inQuotes = false;

  function pushField() {
    row.push(field);
    field = "";
  }

  function pushRow() {
    const allEmpty = row.every(
      c => String(c ?? "").trim() === ""
    );

    if (!allEmpty) {
      rows.push(row);
    }

    row = [];
  }


  while (i < text.length) {

    const ch = text[i];

    if (inQuotes) {

      if (ch === '"') {

        // escaped quote
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }

        inQuotes = false;
        i++;
        continue;
      }

      field += ch;
      i++;
      continue;
    }


    // not in quotes

    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }

    if (ch === ",") {
      pushField();
      i++;
      continue;
    }

    if (ch === "\n") {
      pushField();
      pushRow();
      i++;
      continue;
    }

    if (ch === "\r") {
      i++;
      continue;
    }

    field += ch;
    i++;
  }

  // last field/row
  pushField();
  pushRow();

  return rows;
}



// ======================================================
// Normalization helpers
// ======================================================
function normalizeColumnId(v) {

  const s = String(v ?? "")
    .trim()
    .toLowerCase();

  if (s === "todo") return "todo";

  if (
    s === "inprogress" ||
    s === "in_progress" ||
    s === "in-progress"
  ) {
    return "inprogress";
  }

  if (s === "done") return "done";

  return null;
}


function normalizePriority(v) {

  const s = String(v ?? "")
    .trim()
    .toLowerCase();

  if (s === "low" || s === "1") return "low";

  if (s === "medium" || s === "2") return "medium";

  if (s === "high" || s === "3") return "high";

  return null;
}



// ======================================================
// Parse CSV File -> tasks[]
// ======================================================
export async function parseTasksCsvFile(file) {

  const text = await file.text();

  const rows = parseCsvText(text);

  if (rows.length === 0) {
    throw new Error("CSV is empty.");
  }


  // ============================================
  // HEADER DETECTION (FIXED VERSION)
  // ============================================

  const headerRow = rows[0].map((h, i) => {

    const raw = String(h ?? "");

    // remove BOM from first column
    const clean =
      i === 0
        ? raw.replace(/^\uFEFF/, "")
        : raw;

    return clean.trim();
  });


  const headerLower = headerRow.map(
    h => h.toLowerCase()
  );


  // Validate required headers (case-insensitive)
  for (const required of HEADERS) {

    const want = required.toLowerCase();

    if (!headerLower.includes(want)) {
      throw new Error(`Missing CSV column: ${required}`);
    }
  }


  const idx = {

    title:
      headerLower.indexOf("title"),

    description:
      headerLower.indexOf("description"),

    columnId:
      headerLower.indexOf("columnid"),

    priority:
      headerLower.indexOf("priority"),
  };


  // ============================================
  // Parse rows
  // ============================================

  const out = [];

  for (let r = 1; r < rows.length; r++) {

    const cols = rows[r];

    const title =
      String(cols[idx.title] ?? "").trim();

    const description =
      String(cols[idx.description] ?? "").trim();

    const columnId =
      normalizeColumnId(cols[idx.columnId]);

    const priority =
      normalizePriority(cols[idx.priority]);


    // skip empty rows
    if (!title && !description) continue;


    if (!title)
      throw new Error(
        `Row ${r + 1}: title is required.`
      );

    if (!description)
      throw new Error(
        `Row ${r + 1}: description is required.`
      );

    if (!columnId)
      throw new Error(
        `Row ${r + 1}: invalid columnId (todo/inprogress/done)`
      );

    if (!priority)
      throw new Error(
        `Row ${r + 1}: invalid priority (low/medium/high)`
      );


    out.push({
      title,
      description,
      columnId,
      priority
    });
  }


  if (out.length === 0) {
    throw new Error(
      "No valid tasks found in CSV."
    );
  }


  return out;
}
