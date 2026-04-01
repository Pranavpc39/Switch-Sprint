const STORAGE_KEY = "switch-sprint-react-v1";

function isValidDateOnly(value) {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(new Date(value).getTime())
  );
}

function sanitizeState(raw) {
  const safeRaw = raw && typeof raw === "object" ? raw : {};

  return {
    selectedDay:
      Number.isInteger(safeRaw.selectedDay) && safeRaw.selectedDay >= 1 && safeRaw.selectedDay <= 30
        ? safeRaw.selectedDay
        : 1,
    startDate: isValidDateOnly(safeRaw.startDate) ? safeRaw.startDate : getTodayISO(),
    skipDates: Array.isArray(safeRaw.skipDates)
      ? safeRaw.skipDates.filter((value) => isValidDateOnly(value))
      : [],
    tasks: safeRaw.tasks && typeof safeRaw.tasks === "object" ? safeRaw.tasks : {},
    notes: safeRaw.notes && typeof safeRaw.notes === "object" ? safeRaw.notes : {},
    stats: safeRaw.stats && typeof safeRaw.stats === "object" ? safeRaw.stats : {},
    revisionNotes:
      safeRaw.revisionNotes && typeof safeRaw.revisionNotes === "object" ? safeRaw.revisionNotes : {},
    recruiterLogs: Array.isArray(safeRaw.recruiterLogs) ? safeRaw.recruiterLogs : [],
    interviewLogs: Array.isArray(safeRaw.interviewLogs) ? safeRaw.interviewLogs : []
  };
}

export function loadState() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    if (!raw) throw new Error("missing");
    return sanitizeState(raw);
  } catch {
    return sanitizeState({});
  }
}

export function saveState(state) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function getTodayISO() {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
}

export function exportState(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `switch-sprint-${getTodayISO()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function importState(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        resolve(sanitizeState(parsed));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function clearLegacyState() {
  window.localStorage.removeItem("switch-sprint-tracker-v1");
}
