import fs from "node:fs/promises";
import path from "node:path";

const reportsDir =
  process.env.JOB_REPORTS_DIR ||
  "/Users/pranav/Documents/Job Application Automations/job-search-reports";
const outputFile = path.resolve("src/jobReportsData.generated.js");

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

function parseCsv(content) {
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce((acc, header, index) => {
      acc[header] = values[index] || "";
      return acc;
    }, {});
  });
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function main() {
  let files = [];

  try {
    files = await fs.readdir(reportsDir);
  } catch (error) {
    const fallback = `export const jobReportMeta = ${JSON.stringify(
      {
        sourceDir: reportsDir,
        lastSyncedAt: null,
        snapshotCount: 0,
        error: `Could not read reports directory: ${error.message}`
      },
      null,
      2
    )};\n\nexport const jobReportHistory = [];\n`;
    await fs.writeFile(outputFile, fallback, "utf8");
    return;
  }

  const csvFiles = files
    .filter((file) => /^\d{4}-\d{2}-\d{2}-jobs\.csv$/.test(file))
    .sort();

  const snapshots = [];

  for (const file of csvFiles) {
    const fullPath = path.join(reportsDir, file);
    const raw = await fs.readFile(fullPath, "utf8");
    const jobs = parseCsv(raw).map((job) => ({
      ...job,
      fit_score: toNumber(job.fit_score)
    }));
    const date = file.slice(0, 10);

    snapshots.push({
      date,
      fileName: file,
      jobCount: jobs.length,
      jobs
    });
  }

  snapshots.sort((a, b) => b.date.localeCompare(a.date));

  const output = `export const jobReportMeta = ${JSON.stringify(
    {
      sourceDir: reportsDir,
      lastSyncedAt: new Date().toISOString(),
      snapshotCount: snapshots.length,
      error: null
    },
    null,
    2
  )};\n\nexport const jobReportHistory = ${JSON.stringify(snapshots, null, 2)};\n`;

  await fs.writeFile(outputFile, output, "utf8");
}

main().catch(async (error) => {
  const fallback = `export const jobReportMeta = ${JSON.stringify(
    {
      sourceDir: reportsDir,
      lastSyncedAt: null,
      snapshotCount: 0,
      error: error.message
    },
    null,
    2
  )};\n\nexport const jobReportHistory = [];\n`;
  await fs.writeFile(outputFile, fallback, "utf8");
  process.exitCode = 1;
});
