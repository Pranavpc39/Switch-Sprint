import React, { useEffect, useMemo, useRef, useState } from "react";
import { jobReportHistory, jobReportMeta } from "./jobReportsData.generated";
import { javaRevisionPlan } from "./javaRevision";
import { plan, quotes, statFields } from "./plan";
import {
  clearLegacyState,
  exportState,
  getTodayISO,
  importState,
  loadState,
  resetState,
  saveState
} from "./storage";

const recruiterStages = ["Applied", "Recruiter Screen", "Interviewing", "Offer", "Rejected", "No Reply"];
const interviewStages = ["Scheduled", "Completed", "Cleared", "Rejected", "Cancelled"];
const noteColors = [
  { id: "sun", label: "Sun", fill: "#fff3b6", border: "#e3c766" },
  { id: "mint", label: "Mint", fill: "#dbf6e4", border: "#77bf8f" },
  { id: "sky", label: "Sky", fill: "#dff1ff", border: "#79a8d8" },
  { id: "peach", label: "Peach", fill: "#ffe3cf", border: "#db9d77" },
  { id: "rose", label: "Rose", fill: "#ffdce8", border: "#cb7f98" }
];

function getTaskKey(day, index) {
  return `${day}-${index}`;
}

function getStatsForDay(stats, day) {
  return stats[day] || {};
}

function getCompletedCount(tasks, day, dayPlan) {
  return dayPlan.tasks.filter((_, index) => tasks[getTaskKey(day, index)]).length;
}

function isDayComplete(tasks, day, dayPlan) {
  return dayPlan.tasks.every((_, index) => tasks[getTaskKey(day, index)]);
}

function getRelativeDayNumber(startDate) {
  const start = new Date(startDate);
  const today = new Date(getTodayISO());
  if (Number.isNaN(start.getTime()) || Number.isNaN(today.getTime())) {
    return 1;
  }
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
  return Math.min(30, Math.max(1, diff));
}

function getCurrentStreak(tasks) {
  let streak = 0;
  for (const dayPlan of plan) {
    if (isDayComplete(tasks, dayPlan.day, dayPlan)) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

function formatLongDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "today";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function formatShortDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString || "-";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric"
  }).format(date);
}

function formatDateWithYear(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function stripHtml(value) {
  return (value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function toChartBars(values, maxValue) {
  return values.map((value, index) => ({
    x: 16 + index * 34,
    y: 118 - (maxValue ? (value / maxValue) * 92 : 0),
    height: maxValue ? (value / maxValue) * 92 : 0
  }));
}

function MiniBarChart({ title, subtitle, values, labels, colorClass }) {
  const maxValue = Math.max(...values, 1);
  const bars = toChartBars(values, maxValue);

  return (
    <article className="chart-card">
      <div className="chart-head">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <strong>{values.reduce((sum, value) => sum + value, 0)}</strong>
      </div>
      <svg className="mini-chart" viewBox="0 0 240 140" role="img" aria-label={title}>
        <line x1="10" y1="118" x2="232" y2="118" className="chart-axis" />
        {bars.map((bar, index) => (
          <g key={`${title}-${index}`}>
            <rect
              x={bar.x}
              y={bar.y}
              width="20"
              height={bar.height}
              rx="8"
              className={`chart-bar ${colorClass}`}
            />
            <text x={bar.x + 10} y="134" textAnchor="middle" className="chart-label">
              {labels[index]}
            </text>
          </g>
        ))}
      </svg>
    </article>
  );
}

function DonutChart({ value, title, caption }) {
  const normalized = Math.max(0, Math.min(100, value));
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (normalized / 100) * circumference;

  return (
    <article className="chart-card chart-card-compact">
      <div className="chart-head">
        <div>
          <h3>{title}</h3>
          <p>{caption}</p>
        </div>
      </div>
      <div className="donut-wrap">
        <svg viewBox="0 0 100 100" className="donut-chart" role="img" aria-label={title}>
          <circle cx="50" cy="50" r={radius} className="donut-track" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="donut-value"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: dashoffset
            }}
          />
        </svg>
        <div className="donut-center">
          <strong>{normalized}%</strong>
          <span>done</span>
        </div>
      </div>
    </article>
  );
}

function createNoteDraft(concept) {
  return {
    id: crypto.randomUUID(),
    title: concept,
    colorId: noteColors[0].id,
    content: ""
  };
}

function RichTextEditor({ value, onChange, editorId }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  function applyCommand(command) {
    document.execCommand(command, false);
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML || "");
  }

  return (
    <div className="rich-editor">
      <div className="rich-toolbar">
        <button type="button" className="ghost-btn rich-btn" onClick={() => applyCommand("bold")}>
          B
        </button>
        <button type="button" className="ghost-btn rich-btn" onClick={() => applyCommand("italic")}>
          I
        </button>
        <button type="button" className="ghost-btn rich-btn" onClick={() => applyCommand("underline")}>
          U
        </button>
        <button
          type="button"
          className="ghost-btn rich-btn"
          onClick={() => applyCommand("insertUnorderedList")}
        >
          • List
        </button>
      </div>
      <div
        id={editorId}
        ref={editorRef}
        className="rich-surface"
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
      />
    </div>
  );
}

function ConceptNoteModal({ note, concept, conceptIndex, updateConceptNote, removeConceptNote, closeModal }) {
  const color = noteColors.find((item) => item.id === note.colorId) || noteColors[0];

  return (
    <div className="note-modal-backdrop" onClick={closeModal}>
      <div
        className="note-modal"
        style={{ background: color.fill, borderColor: color.border }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="concept-note-head">
          <input
            type="text"
            value={note.title}
            onChange={(event) => updateConceptNote(conceptIndex, note.id, { title: event.target.value })}
            placeholder={concept}
          />
          <button type="button" className="icon-btn" onClick={closeModal}>
            Close
          </button>
        </div>

        <div className="note-color-row">
          {noteColors.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`note-color-dot ${note.colorId === option.id ? "active" : ""}`}
              style={{ background: option.fill, borderColor: option.border }}
              onClick={() => updateConceptNote(conceptIndex, note.id, { colorId: option.id })}
              aria-label={`Set ${option.label} note color`}
            />
          ))}
        </div>

        <RichTextEditor
          editorId={`concept-note-modal-${conceptIndex}-${note.id}`}
          value={note.content || ""}
          onChange={(content) => updateConceptNote(conceptIndex, note.id, { content })}
        />

        <div className="note-modal-actions">
          <button type="button" className="ghost-btn" onClick={() => removeConceptNote(conceptIndex, note.id)}>
            Delete Note
          </button>
        </div>
      </div>
    </div>
  );
}

function ConceptNotesBoard({
  concept,
  conceptIndex,
  notes,
  addConceptNote,
  updateConceptNote,
  removeConceptNote,
  openNote
}) {
  return (
    <article className="revision-block concept-board">
      <div className="concept-board-head">
        <div>
          <h3>{concept}</h3>
          <p>Keep separate cards for separate insights, examples, and edge cases.</p>
        </div>
        <button
          type="button"
          className="primary-btn concept-add-btn"
          onClick={() => addConceptNote(conceptIndex, concept)}
        >
          Add Note
        </button>
      </div>

      <div className="concept-note-grid">
        {notes.length === 0 ? (
          <div className="empty-note-card">
            <p>No notes yet for this concept. Add the first card after we discuss it.</p>
          </div>
        ) : (
          notes.map((note, noteIndex) => {
            const color = noteColors.find((item) => item.id === note.colorId) || noteColors[0];
            const preview = stripHtml(note.content);

            return (
              <button
                type="button"
                key={note.id}
                className="concept-note-card"
                style={{ background: color.fill, borderColor: color.border }}
                onClick={() => openNote({ concept, conceptIndex, note })}
              >
                <div className="concept-note-head">
                  <strong>{note.title || `${concept} ${noteIndex + 1}`}</strong>
                  <span className="concept-note-open">Open</span>
                </div>

                <div className="note-color-row">
                  {noteColors.map((option) => (
                    <span
                      key={option.id}
                      className={`note-color-dot ${note.colorId === option.id ? "active" : ""}`}
                      style={{ background: option.fill, borderColor: option.border }}
                    />
                  ))}
                </div>

                <p className="concept-note-preview">
                  {preview || "No content yet. Click to open and write this note."}
                </p>
              </button>
            );
          })
        )}
      </div>
    </article>
  );
}

function JavaRevisionPage({
  todayDay,
  currentRevisionDay,
  setCurrentRevisionDay,
  revisionNotes,
  updateRevisionAnswer,
  addConceptNote,
  updateConceptNote,
  removeConceptNote
}) {
  const [activeModal, setActiveModal] = useState(null);
  const scheduledDays = Object.keys(javaRevisionPlan)
    .map(Number)
    .sort((a, b) => a - b);
  const todayRevision = javaRevisionPlan[todayDay];
  const activeDay = javaRevisionPlan[currentRevisionDay] ? currentRevisionDay : scheduledDays[0];
  const activeRevision = javaRevisionPlan[activeDay];
  const activeNotes = revisionNotes[activeDay] || {};

  return (
    <main className="revision-shell">
      <section className="panel revision-hero">
        <div className="panel-head">
          <h2>Java Revision</h2>
          <p>Use this instead of jumping between random resources.</p>
        </div>

        <div className="revision-summary-grid">
          <article className="revision-summary-card">
            <span className="mini-label">Today&apos;s scheduled Java work</span>
            {todayRevision ? (
              <>
                <strong>Day {todayDay}</strong>
                <p>{todayRevision.title}</p>
              </>
            ) : (
              <>
                <strong>No Java task</strong>
                <p>Nothing scheduled for Day {todayDay}. Stay with the main plan.</p>
              </>
            )}
          </article>
          <article className="revision-summary-card">
            <span className="mini-label">Scheduled revision days</span>
            <strong>{scheduledDays.length}</strong>
            <p>Only days with Java/Spring work are listed here.</p>
          </article>
        </div>
      </section>

      <section className="panel revision-panel">
        <div className="panel-head">
          <h2>Revision Schedule</h2>
          <p>Select a scheduled day.</p>
        </div>

        <div className="revision-chip-grid">
          {scheduledDays.map((day) => (
            <button
              key={day}
              className={`revision-chip ${day === activeDay ? "active" : ""} ${day === todayDay ? "today" : ""}`}
              onClick={() => setCurrentRevisionDay(day)}
            >
              <span>Day {day}</span>
              <small>{javaRevisionPlan[day].title}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="panel revision-detail-panel">
        <div className="panel-head">
          <h2>
            Day {activeDay}: {activeRevision.title}
          </h2>
          <p>Prepare these and stop resource-hopping.</p>
        </div>

        <div className="revision-detail-grid">
          <article className="revision-block">
            <h3>Concepts To Revise</h3>
            <ul className="revision-list">
              {activeRevision.concepts.map((concept) => (
                <li key={concept}>{concept}</li>
              ))}
            </ul>
          </article>
          <article className="revision-block">
            <h3>Interview Questions</h3>
            <ol className="revision-list ordered">
              {activeRevision.questions.map((question, index) => (
                <li key={question}>
                  <div className="revision-question-item">
                    <span>{question}</span>
                    <textarea
                      value={activeNotes.answers?.[index] || ""}
                      onChange={(event) =>
                        updateRevisionAnswer(activeDay, index, event.target.value)
                      }
                      placeholder="Write your prepared answer, examples, edge cases, or follow-up notes."
                    />
                  </div>
                </li>
              ))}
            </ol>
          </article>
        </div>

        <div className="concept-board-list">
          {activeRevision.concepts.map((concept, conceptIndex) => (
            <ConceptNotesBoard
              key={concept}
              concept={concept}
              conceptIndex={conceptIndex}
              notes={activeNotes.conceptNotes?.[conceptIndex] || []}
              addConceptNote={(index, title) => addConceptNote(activeDay, index, title)}
              updateConceptNote={(index, noteId, patch) =>
                updateConceptNote(activeDay, index, noteId, patch)
              }
              removeConceptNote={(index, noteId) => removeConceptNote(activeDay, index, noteId)}
              openNote={(payload) =>
                setActiveModal({
                  concept: payload.concept,
                  conceptIndex: payload.conceptIndex,
                  noteId: payload.note.id
                })
              }
            />
          ))}
        </div>
      </section>

      {activeModal ? (
        <ConceptNoteModal
          note={
            (activeNotes.conceptNotes?.[activeModal.conceptIndex] || []).find(
              (note) => note.id === activeModal.noteId
            ) || createNoteDraft(activeModal.concept)
          }
          concept={activeModal.concept}
          conceptIndex={activeModal.conceptIndex}
          updateConceptNote={(index, noteId, patch) =>
            updateConceptNote(activeDay, index, noteId, patch)
          }
          removeConceptNote={(index, noteId) => {
            removeConceptNote(activeDay, index, noteId);
            setActiveModal(null);
          }}
          closeModal={() => setActiveModal(null)}
        />
      ) : null}
    </main>
  );
}

function JobsPage() {
  const [selectedSnapshotDate, setSelectedSnapshotDate] = useState(jobReportHistory[0]?.date || null);
  const selectedSnapshot =
    jobReportHistory.find((snapshot) => snapshot.date === selectedSnapshotDate) || jobReportHistory[0];

  const topMatches = (selectedSnapshot?.jobs || [])
    .slice()
    .sort((a, b) => (b.fit_score || 0) - (a.fit_score || 0))
    .slice(0, 5);

  return (
    <main className="revision-shell">
      <section className="panel jobs-hero">
        <div className="panel-head">
          <h2>Job Reports</h2>
          <p>Daily snapshots from your Codex automation CSV files.</p>
        </div>

        <div className="revision-summary-grid">
          <article className="revision-summary-card">
            <span className="mini-label">Snapshots available</span>
            <strong>{jobReportMeta.snapshotCount}</strong>
            <p>{jobReportMeta.error ? jobReportMeta.error : "Historical CSV fetches loaded into the app."}</p>
          </article>
          <article className="revision-summary-card">
            <span className="mini-label">Last synced</span>
            <strong>{jobReportMeta.lastSyncedAt ? formatDateWithYear(jobReportMeta.lastSyncedAt) : "Not synced"}</strong>
            <p>{jobReportMeta.sourceDir}</p>
          </article>
        </div>
      </section>

      <section className="panel revision-panel">
        <div className="panel-head">
          <h2>Daily Snapshots</h2>
          <p>Open any day to review that CSV capture.</p>
        </div>

        <div className="revision-chip-grid">
          {jobReportHistory.length === 0 ? (
            <div className="empty-note-card">
              <p>No job snapshots loaded yet. Run `npm run sync:jobs` after the automation creates CSVs.</p>
            </div>
          ) : (
            jobReportHistory.map((snapshot) => (
              <button
                key={snapshot.date}
                className={`revision-chip ${snapshot.date === selectedSnapshot?.date ? "active" : ""}`}
                onClick={() => setSelectedSnapshotDate(snapshot.date)}
              >
                <span>{formatShortDate(snapshot.date)}</span>
                <small>{snapshot.jobCount} jobs</small>
              </button>
            ))
          )}
        </div>
      </section>

      {selectedSnapshot ? (
        <>
          <section className="panel jobs-panel">
            <div className="panel-head">
              <h2>{formatDateWithYear(selectedSnapshot.date)}</h2>
              <p>{selectedSnapshot.jobCount} jobs found in this CSV snapshot.</p>
            </div>

            <div className="pipeline-summary">
              <div>
                <span className="mini-label">Top fit score</span>
                <strong>{selectedSnapshot.jobs[0]?.fit_score || "-"}</strong>
              </div>
              <div>
                <span className="mini-label">Companies</span>
                <strong>{new Set(selectedSnapshot.jobs.map((job) => job.company)).size}</strong>
              </div>
              <div>
                <span className="mini-label">Sources</span>
                <strong>{new Set(selectedSnapshot.jobs.map((job) => job.source)).size}</strong>
              </div>
            </div>

            <div className="jobs-top-grid">
              {topMatches.map((job) => (
                <article key={`${job.company}-${job.role_title}-${job.direct_apply_url}`} className="log-entry">
                  <div className="log-entry-head">
                    <div>
                      <strong>{job.company}</strong>
                      <span>{job.role_title}</span>
                    </div>
                    <span className="job-score-pill">{job.fit_score ?? "-"}</span>
                  </div>
                  <div className="log-meta">
                    <span>{job.location}</span>
                    <span>{job.source}</span>
                  </div>
                  <p>{job.why_it_matches_profile}</p>
                  <a className="job-link" href={job.direct_apply_url} target="_blank" rel="noreferrer">
                    Open job
                  </a>
                </article>
              ))}
            </div>

            <div className="jobs-table-wrap">
              <table className="jobs-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Location</th>
                    <th>Fit</th>
                    <th>Source</th>
                    <th>Apply</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSnapshot.jobs.map((job) => (
                    <tr key={`${job.company}-${job.role_title}-${job.direct_apply_url}`}>
                      <td>{job.company}</td>
                      <td>{job.role_title}</td>
                      <td>{job.location}</td>
                      <td>{job.fit_score ?? "-"}</td>
                      <td>{job.source}</td>
                      <td>
                        <a href={job.direct_apply_url} target="_blank" rel="noreferrer">
                          Open
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}

function TrackerPage({
  state,
  fileInputRef,
  selectedPlan,
  todayDay,
  completedDays,
  completionPct,
  streak,
  totals,
  quote,
  chartLabels,
  dsaSeries,
  applicationSeries,
  movementSeries,
  averageTaskCompletion,
  activePipelines,
  interviewsCompleted,
  recruiterForm,
  setRecruiterForm,
  interviewForm,
  setInterviewForm,
  updateSelectedDay,
  handleExport,
  handleImport,
  handleReset,
  handleStartDateChange,
  updateTask,
  updateStat,
  updateNote,
  addRecruiterLog,
  addInterviewLog,
  removeRecruiterLog,
  removeInterviewLog
}) {
  const selectedStats = getStatsForDay(state.stats, selectedPlan.day);
  const focusProgress = getCompletedCount(state.tasks, selectedPlan.day, selectedPlan);

  return (
    <main className="dashboard">
      <section className="panel focus-panel">
        <div className="panel-head">
          <h2>Rules For This Month</h2>
          <p>Keep the scope intentionally narrow.</p>
        </div>

        <div className="rules-grid">
          <article>
            <h3>Primary Tracks</h3>
            <ul>
              <li>DSA</li>
              <li>Java/Spring interview prep</li>
              <li>Applications and follow-up</li>
            </ul>
          </article>
          <article>
            <h3>Health Floor</h3>
            <ul>
              <li>20 to 30 min movement</li>
              <li>Sleep before 12:00 AM target</li>
              <li>No zero days</li>
            </ul>
          </article>
          <article>
            <h3>Not This Month</h3>
            <ul>
              <li>Deep HLD study</li>
              <li>Too many resources</li>
              <li>Waiting to feel fully ready</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="hero hero-inline">
        <div className="hero-copy">
          <p className="eyebrow">30-Day Company Switch Tracker</p>
          <h1>One stable month. Not a perfect month.</h1>
          <p className="hero-text">
            Focus on showing up daily. Track the work, protect your health, and build
            interview readiness without carrying the full pressure every day.
          </p>

          <div className="hero-actions no-print">
            <button className="primary-btn" onClick={() => updateSelectedDay(todayDay)}>
              Jump To Today
            </button>
            <button className="ghost-btn" onClick={() => window.print()}>
              Print View
            </button>
            <button className="ghost-btn" onClick={handleExport}>
              Export Progress
            </button>
            <button className="ghost-btn" onClick={() => fileInputRef.current?.click()}>
              Import Progress
            </button>
            <button className="ghost-btn" onClick={handleReset}>
              Reset Progress
            </button>
            <input
              ref={fileInputRef}
              className="hidden-input"
              type="file"
              accept="application/json"
              onChange={handleImport}
            />
          </div>
        </div>

        <section className="summary-card">
          <p className="summary-label">Progress Snapshot</p>

          <div className="summary-grid">
            <div>
              <span className="summary-value">{completedDays}/30</span>
              <span className="summary-caption">days completed</span>
            </div>
            <div>
              <span className="summary-value">{completionPct}%</span>
              <span className="summary-caption">tasks checked</span>
            </div>
            <div>
              <span className="summary-value">{streak}</span>
              <span className="summary-caption">day streak</span>
            </div>
          </div>

          <div className="progress-bar" aria-hidden="true">
            <span style={{ width: `${completionPct}%` }} />
          </div>

          <p className="momentum-text">
            {completionPct === 0
              ? "Start with today. Momentum will follow action."
              : completionPct < 30
                ? "You are rebuilding rhythm. Small wins matter most here."
                : completionPct < 70
                  ? "This is the middle stretch. Protect consistency more than intensity."
                  : "You have enough evidence now. Start treating interviews as active prep."}
          </p>

          <div className="date-box">
            <label htmlFor="startDate">Sprint start date</label>
            <input
              id="startDate"
              type="date"
              value={state.startDate}
              max={getTodayISO()}
              onChange={(event) => handleStartDateChange(event.target.value)}
            />
            <p>Today maps to Day {todayDay} based on {formatLongDate(state.startDate)}.</p>
          </div>
        </section>
      </section>

      <section className="panel today-panel">
        <div className="panel-head">
          <h2>Today&apos;s Focus</h2>
          <p>
            {selectedPlan.week} • Day {selectedPlan.day}
          </p>
        </div>

        <div className="today-card">
          <div className="today-title">
            <div>
              <strong>{selectedPlan.title}</strong>
              <p>{selectedPlan.focus}</p>
            </div>
            <span className="chip-progress">
              {focusProgress}/{selectedPlan.tasks.length} done
            </span>
          </div>

          <div className="task-list">
            {selectedPlan.tasks.map((task, index) => {
              const checked = Boolean(state.tasks[getTaskKey(selectedPlan.day, index)]);

              return (
                <label key={task} className={`task-item ${checked ? "done" : ""}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => updateTask(selectedPlan.day, index, event.target.checked)}
                  />
                  <span>{task}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="stats-card">
          <div className="panel-head compact">
            <h2>Daily Counters</h2>
            <p>Track actual output, not only intent.</p>
          </div>

          <div className="stats-grid">
            {statFields.map((field) => (
              <label key={field.key} className="stat-field">
                <span>{field.label}</span>
                {field.type === "checkbox" ? (
                  <input
                    type="checkbox"
                    checked={Boolean(selectedStats[field.key])}
                    onChange={(event) =>
                      updateStat(selectedPlan.day, field.key, event.target.checked)
                    }
                  />
                ) : (
                  <input
                    type="number"
                    min={field.min}
                    step={field.step}
                    value={selectedStats[field.key] ?? ""}
                    onChange={(event) =>
                      updateStat(
                        selectedPlan.day,
                        field.key,
                        event.target.value === "" ? "" : Number(event.target.value)
                      )
                    }
                  />
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="note-box">
          <label htmlFor="dailyNote">Daily note</label>
          <textarea
            id="dailyNote"
            value={state.notes[selectedPlan.day] || ""}
            onChange={(event) => updateNote(selectedPlan.day, event.target.value)}
            placeholder="What felt hard today? What actually got done?"
          />
        </div>
      </section>

      <section className="panel motivation-panel">
        <div className="panel-head">
          <h2>When Energy Is Low</h2>
          <p>Use the minimum version. That day still counts.</p>
        </div>

        <ul className="fallback-list">
          <li>Revise one old DSA problem instead of solving a new one.</li>
          <li>Do 20 minutes of Java or Spring revision.</li>
          <li>Send one application or one recruiter follow-up.</li>
          <li>Walk for 15 minutes.</li>
          <li>Sleep before 12:30 AM and restart tomorrow.</li>
        </ul>

        <div className="totals-grid">
          <div>
            <span className="mini-label">DSA solved</span>
            <strong>{totals.dsaProblems}</strong>
          </div>
          <div>
            <span className="mini-label">Applications</span>
            <strong>{totals.applications}</strong>
          </div>
          <div>
            <span className="mini-label">Java/Spring mins</span>
            <strong>{totals.javaMinutes}</strong>
          </div>
          <div>
            <span className="mini-label">Workout mins</span>
            <strong>{totals.movementMinutes}</strong>
          </div>
          <div>
            <span className="mini-label">Sleep target days</span>
            <strong>{totals.sleepTargetMet}</strong>
          </div>
        </div>

        <blockquote className="quote-box">{quote}</blockquote>
      </section>

      <section className="panel charts-panel">
        <div className="panel-head">
          <h2>Progress Charts</h2>
          <p>Look for trend, not perfection.</p>
        </div>

        <div className="charts-grid">
          <MiniBarChart
            title="DSA Output"
            subtitle="Problems solved by day"
            values={dsaSeries}
            labels={chartLabels}
            colorClass="chart-bar-dsa"
          />
          <MiniBarChart
            title="Applications"
            subtitle="Applications sent by day"
            values={applicationSeries}
            labels={chartLabels}
            colorClass="chart-bar-apps"
          />
          <MiniBarChart
            title="Workout Minutes"
            subtitle="Movement logged by day"
            values={movementSeries}
            labels={chartLabels}
            colorClass="chart-bar-health"
          />
          <DonutChart
            title="Task Completion"
            caption="Average completion across active days"
            value={averageTaskCompletion}
          />
        </div>
      </section>

      <section className="panel logs-panel">
        <div className="panel-head">
          <h2>Pipeline Tracker</h2>
          <p>Keep interviews visible so the process feels real.</p>
        </div>

        <div className="pipeline-summary">
          <div>
            <span className="mini-label">Active pipelines</span>
            <strong>{activePipelines}</strong>
          </div>
          <div>
            <span className="mini-label">Interviews logged</span>
            <strong>{(state.interviewLogs || []).length}</strong>
          </div>
          <div>
            <span className="mini-label">Rounds completed</span>
            <strong>{interviewsCompleted}</strong>
          </div>
        </div>

        <div className="logs-grid">
          <section className="log-card">
            <div className="panel-head compact">
              <h3>Recruiter / Application Log</h3>
              <p>Company-side progress</p>
            </div>

            <form className="log-form" onSubmit={addRecruiterLog}>
              <input
                type="text"
                placeholder="Company"
                value={recruiterForm.company}
                onChange={(event) =>
                  setRecruiterForm((current) => ({ ...current, company: event.target.value }))
                }
              />
              <input
                type="text"
                placeholder="Role"
                value={recruiterForm.role}
                onChange={(event) =>
                  setRecruiterForm((current) => ({ ...current, role: event.target.value }))
                }
              />
              <input
                type="text"
                placeholder="Recruiter / contact"
                value={recruiterForm.contact}
                onChange={(event) =>
                  setRecruiterForm((current) => ({ ...current, contact: event.target.value }))
                }
              />
              <select
                value={recruiterForm.stage}
                onChange={(event) =>
                  setRecruiterForm((current) => ({ ...current, stage: event.target.value }))
                }
              >
                {recruiterStages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={recruiterForm.date}
                onChange={(event) =>
                  setRecruiterForm((current) => ({ ...current, date: event.target.value }))
                }
              />
              <textarea
                placeholder="Next step or follow-up note"
                value={recruiterForm.nextStep}
                onChange={(event) =>
                  setRecruiterForm((current) => ({ ...current, nextStep: event.target.value }))
                }
              />
              <button type="submit" className="primary-btn">
                Add Recruiter Log
              </button>
            </form>

            <div className="log-list">
              {(state.recruiterLogs || []).length === 0 ? (
                <p className="empty-state">No recruiter or application entries yet.</p>
              ) : (
                (state.recruiterLogs || []).map((item) => (
                  <article key={item.id} className="log-entry">
                    <div className="log-entry-head">
                      <div>
                        <strong>{item.company}</strong>
                        <span>{item.role}</span>
                      </div>
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => removeRecruiterLog(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="log-meta">
                      <span>{item.stage}</span>
                      <span>{formatShortDate(item.date)}</span>
                      {item.contact ? <span>{item.contact}</span> : null}
                    </div>
                    {item.nextStep ? <p>{item.nextStep}</p> : null}
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="log-card">
            <div className="panel-head compact">
              <h3>Interview Log</h3>
              <p>Round-by-round record</p>
            </div>

            <form className="log-form" onSubmit={addInterviewLog}>
              <input
                type="text"
                placeholder="Company"
                value={interviewForm.company}
                onChange={(event) =>
                  setInterviewForm((current) => ({ ...current, company: event.target.value }))
                }
              />
              <input
                type="text"
                placeholder="Round name"
                value={interviewForm.round}
                onChange={(event) =>
                  setInterviewForm((current) => ({ ...current, round: event.target.value }))
                }
              />
              <select
                value={interviewForm.outcome}
                onChange={(event) =>
                  setInterviewForm((current) => ({ ...current, outcome: event.target.value }))
                }
              >
                {interviewStages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={interviewForm.date}
                onChange={(event) =>
                  setInterviewForm((current) => ({ ...current, date: event.target.value }))
                }
              />
              <textarea
                placeholder="Questions asked, weak areas, follow-up"
                value={interviewForm.notes}
                onChange={(event) =>
                  setInterviewForm((current) => ({ ...current, notes: event.target.value }))
                }
              />
              <button type="submit" className="primary-btn">
                Add Interview Log
              </button>
            </form>

            <div className="log-list">
              {(state.interviewLogs || []).length === 0 ? (
                <p className="empty-state">No interview rounds logged yet.</p>
              ) : (
                (state.interviewLogs || []).map((item) => (
                  <article key={item.id} className="log-entry">
                    <div className="log-entry-head">
                      <div>
                        <strong>{item.company}</strong>
                        <span>{item.round}</span>
                      </div>
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => removeInterviewLog(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="log-meta">
                      <span>{item.outcome}</span>
                      <span>{formatShortDate(item.date)}</span>
                    </div>
                    {item.notes ? <p>{item.notes}</p> : null}
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </section>

      <section className="panel roadmap-panel">
        <div className="panel-head">
          <h2>30-Day Roadmap</h2>
          <p>Click a day to update progress. Everything saves automatically.</p>
        </div>

        <div className="roadmap-grid">
          {plan.map((entry) => {
            const doneCount = getCompletedCount(state.tasks, entry.day, entry);
            const isComplete = isDayComplete(state.tasks, entry.day, entry);
            const isSelected = entry.day === state.selectedDay;
            const isToday = entry.day === todayDay;

            return (
              <button
                key={entry.day}
                className={`day-chip ${isSelected ? "active" : ""} ${isComplete ? "complete" : ""} ${isToday ? "today" : ""}`}
                onClick={() => updateSelectedDay(entry.day)}
              >
                <div className="chip-top">
                  <span className="chip-day">Day {entry.day}</span>
                  <span className="chip-week">{entry.week}</span>
                </div>
                <div className="chip-focus">{entry.title}</div>
                <span className="chip-progress">
                  {doneCount}/{entry.tasks.length} done
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [state, setState] = useState(() => loadState());
  const [currentPage, setCurrentPage] = useState("tracker");
  const fileInputRef = useRef(null);
  const [currentRevisionDay, setCurrentRevisionDay] = useState(() => {
    const today = getRelativeDayNumber(getTodayISO());
    return javaRevisionPlan[today] ? today : Number(Object.keys(javaRevisionPlan)[0]);
  });
  const [recruiterForm, setRecruiterForm] = useState({
    company: "",
    role: "",
    contact: "",
    stage: "Applied",
    nextStep: "",
    date: getTodayISO()
  });
  const [interviewForm, setInterviewForm] = useState({
    company: "",
    round: "",
    outcome: "Scheduled",
    notes: "",
    date: getTodayISO()
  });

  useEffect(() => {
    clearLegacyState();
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const selectedPlan = plan.find((entry) => entry.day === state.selectedDay) || plan[0];
  const todayDay = useMemo(() => getRelativeDayNumber(state.startDate), [state.startDate]);
  const completedDays = useMemo(
    () => plan.filter((entry) => isDayComplete(state.tasks, entry.day, entry)).length,
    [state.tasks]
  );
  const totalTasks = useMemo(() => plan.reduce((sum, entry) => sum + entry.tasks.length, 0), []);
  const completedTasks = useMemo(() => Object.values(state.tasks).filter(Boolean).length, [state.tasks]);
  const completionPct = Math.round((completedTasks / totalTasks) * 100);
  const streak = useMemo(() => getCurrentStreak(state.tasks), [state.tasks]);
  const totals = useMemo(() => {
    return Object.values(state.stats).reduce(
      (acc, dayStats) => {
        acc.dsaProblems += Number(dayStats.dsaProblems || 0);
        acc.applications += Number(dayStats.applications || 0);
        acc.javaMinutes += Number(dayStats.javaMinutes || 0);
        acc.movementMinutes += Number(dayStats.movementMinutes || 0);
        acc.sleepTargetMet += dayStats.sleepTargetMet ? 1 : 0;
        return acc;
      },
      {
        dsaProblems: 0,
        applications: 0,
        javaMinutes: 0,
        movementMinutes: 0,
        sleepTargetMet: 0
      }
    );
  }, [state.stats]);
  const quote = quotes[new Date().getDate() % quotes.length];
  const chartDays = useMemo(() => {
    const limit = Math.max(todayDay, completedDays, 7);
    return plan.slice(0, limit);
  }, [completedDays, todayDay]);
  const chartLabels = chartDays.map((entry) => entry.day);
  const dsaSeries = chartDays.map((entry) => Number(state.stats[entry.day]?.dsaProblems || 0));
  const applicationSeries = chartDays.map((entry) => Number(state.stats[entry.day]?.applications || 0));
  const movementSeries = chartDays.map((entry) => Number(state.stats[entry.day]?.movementMinutes || 0));
  const taskCompletionSeries = chartDays.map((entry) =>
    Math.round((getCompletedCount(state.tasks, entry.day, entry) / entry.tasks.length) * 100)
  );
  const averageTaskCompletion = taskCompletionSeries.length
    ? Math.round(taskCompletionSeries.reduce((sum, value) => sum + value, 0) / taskCompletionSeries.length)
    : 0;
  const activePipelines = (state.recruiterLogs || []).filter(
    (item) => item.stage !== "Rejected" && item.stage !== "No Reply" && item.stage !== "Offer"
  ).length;
  const interviewsCompleted = (state.interviewLogs || []).filter((item) => item.outcome !== "Scheduled")
    .length;

  function updateSelectedDay(day) {
    setState((current) => ({ ...current, selectedDay: day }));
  }

  function updateTask(day, index, checked) {
    setState((current) => ({
      ...current,
      tasks: {
        ...current.tasks,
        [getTaskKey(day, index)]: checked
      }
    }));
  }

  function updateNote(day, note) {
    setState((current) => ({
      ...current,
      notes: {
        ...current.notes,
        [day]: note
      }
    }));
  }

  function updateStat(day, field, value) {
    setState((current) => ({
      ...current,
      stats: {
        ...current.stats,
        [day]: {
          ...getStatsForDay(current.stats, day),
          [field]: value
        }
      }
    }));
  }

  function updateRevisionAnswer(day, index, value) {
    setState((current) => ({
      ...current,
      revisionNotes: {
        ...current.revisionNotes,
        [day]: {
          ...(current.revisionNotes?.[day] || {}),
          answers: {
            ...(current.revisionNotes?.[day]?.answers || {}),
            [index]: value
          },
          conceptNotes: current.revisionNotes?.[day]?.conceptNotes || {}
        }
      }
    }));
  }

  function addConceptNote(day, conceptIndex, conceptTitle) {
    setState((current) => ({
      ...current,
      revisionNotes: {
        ...current.revisionNotes,
        [day]: {
          ...(current.revisionNotes?.[day] || {}),
          answers: current.revisionNotes?.[day]?.answers || {},
          conceptNotes: {
            ...(current.revisionNotes?.[day]?.conceptNotes || {}),
            [conceptIndex]: [
              ...((current.revisionNotes?.[day]?.conceptNotes || {})[conceptIndex] || []),
              createNoteDraft(conceptTitle)
            ]
          }
        }
      }
    }));
  }

  function updateConceptNote(day, conceptIndex, noteId, patch) {
    setState((current) => ({
      ...current,
      revisionNotes: {
        ...current.revisionNotes,
        [day]: {
          ...(current.revisionNotes?.[day] || {}),
          answers: current.revisionNotes?.[day]?.answers || {},
          conceptNotes: {
            ...(current.revisionNotes?.[day]?.conceptNotes || {}),
            [conceptIndex]: (((current.revisionNotes?.[day]?.conceptNotes || {})[conceptIndex]) || []).map(
              (note) => (note.id === noteId ? { ...note, ...patch } : note)
            )
          }
        }
      }
    }));
  }

  function removeConceptNote(day, conceptIndex, noteId) {
    setState((current) => ({
      ...current,
      revisionNotes: {
        ...current.revisionNotes,
        [day]: {
          ...(current.revisionNotes?.[day] || {}),
          answers: current.revisionNotes?.[day]?.answers || {},
          conceptNotes: {
            ...(current.revisionNotes?.[day]?.conceptNotes || {}),
            [conceptIndex]: (((current.revisionNotes?.[day]?.conceptNotes || {})[conceptIndex]) || []).filter(
              (note) => note.id !== noteId
            )
          }
        }
      }
    }));
  }

  function handleStartDateChange(value) {
    const safeValue = value || getTodayISO();
    setState((current) => ({
      ...current,
      startDate: safeValue,
      selectedDay: getRelativeDayNumber(safeValue)
    }));
    if (javaRevisionPlan[getRelativeDayNumber(safeValue)]) {
      setCurrentRevisionDay(getRelativeDayNumber(safeValue));
    }
  }

  function handleReset() {
    if (!window.confirm("Reset all saved progress and notes?")) return;
    resetState();
    setState(loadState());
  }

  function handleExport() {
    exportState(state);
  }

  async function handleImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const nextState = await importState(file);
      setState(nextState);
    } catch {
      window.alert("Could not import that file.");
    } finally {
      event.target.value = "";
    }
  }

  function addRecruiterLog(event) {
    event.preventDefault();
    if (!recruiterForm.company.trim() || !recruiterForm.role.trim()) {
      window.alert("Add at least company and role for the recruiter log.");
      return;
    }

    setState((current) => ({
      ...current,
      recruiterLogs: [
        {
          id: crypto.randomUUID(),
          ...recruiterForm
        },
        ...(current.recruiterLogs || [])
      ]
    }));

    setRecruiterForm({
      company: "",
      role: "",
      contact: "",
      stage: "Applied",
      nextStep: "",
      date: getTodayISO()
    });
  }

  function addInterviewLog(event) {
    event.preventDefault();
    if (!interviewForm.company.trim() || !interviewForm.round.trim()) {
      window.alert("Add at least company and round for the interview log.");
      return;
    }

    setState((current) => ({
      ...current,
      interviewLogs: [
        {
          id: crypto.randomUUID(),
          ...interviewForm
        },
        ...(current.interviewLogs || [])
      ]
    }));

    setInterviewForm({
      company: "",
      round: "",
      outcome: "Scheduled",
      notes: "",
      date: getTodayISO()
    });
  }

  function removeRecruiterLog(id) {
    setState((current) => ({
      ...current,
      recruiterLogs: (current.recruiterLogs || []).filter((item) => item.id !== id)
    }));
  }

  function removeInterviewLog(id) {
    setState((current) => ({
      ...current,
      interviewLogs: (current.interviewLogs || []).filter((item) => item.id !== id)
    }));
  }

  return (
    <div className="page-shell">
      <header className="top-nav no-print">
        <div>
          <p className="eyebrow">Switch Sprint</p>
          <h2>Preparation Workspace</h2>
        </div>
        <div className="page-toggle">
          <button
            className={`ghost-btn ${currentPage === "tracker" ? "toggle-active" : ""}`}
            onClick={() => setCurrentPage("tracker")}
          >
            Tracker
          </button>
          <button
            className={`ghost-btn ${currentPage === "java" ? "toggle-active" : ""}`}
            onClick={() => setCurrentPage("java")}
          >
            Java Revision
          </button>
          <button
            className={`ghost-btn ${currentPage === "jobs" ? "toggle-active" : ""}`}
            onClick={() => setCurrentPage("jobs")}
          >
            Jobs
          </button>
        </div>
      </header>

      {currentPage === "tracker" ? (
        <TrackerPage
          state={state}
          fileInputRef={fileInputRef}
          selectedPlan={selectedPlan}
          todayDay={todayDay}
          completedDays={completedDays}
          completionPct={completionPct}
          streak={streak}
          totals={totals}
          quote={quote}
          chartLabels={chartLabels}
          dsaSeries={dsaSeries}
          applicationSeries={applicationSeries}
          movementSeries={movementSeries}
          averageTaskCompletion={averageTaskCompletion}
          activePipelines={activePipelines}
          interviewsCompleted={interviewsCompleted}
          recruiterForm={recruiterForm}
          setRecruiterForm={setRecruiterForm}
          interviewForm={interviewForm}
          setInterviewForm={setInterviewForm}
          updateSelectedDay={updateSelectedDay}
          handleExport={handleExport}
          handleImport={handleImport}
          handleReset={handleReset}
          handleStartDateChange={handleStartDateChange}
          updateTask={updateTask}
          updateStat={updateStat}
          updateNote={updateNote}
          addRecruiterLog={addRecruiterLog}
          addInterviewLog={addInterviewLog}
          removeRecruiterLog={removeRecruiterLog}
          removeInterviewLog={removeInterviewLog}
        />
      ) : currentPage === "java" ? (
        <JavaRevisionPage
          todayDay={todayDay}
          currentRevisionDay={currentRevisionDay}
          setCurrentRevisionDay={setCurrentRevisionDay}
          revisionNotes={state.revisionNotes || {}}
          updateRevisionAnswer={updateRevisionAnswer}
          addConceptNote={addConceptNote}
          updateConceptNote={updateConceptNote}
          removeConceptNote={removeConceptNote}
        />
      ) : (
        <JobsPage />
      )}
    </div>
  );
}
