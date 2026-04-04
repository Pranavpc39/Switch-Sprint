# Switch Sprint

React tracker for a 30-day company switch sprint.

## Run

1. Install dependencies with `npm install`
2. Sync job report snapshots with `npm run sync:jobs`
3. Start the app with `npm run dev`

## Features

- 30-day roadmap with daily tasks
- Date-based "today" mapping from your chosen start date
- Daily counters for DSA, applications, Java or Spring time, workout time, and sleep target
- Notes per day
- Lightweight progress charts
- Recruiter and interview logs
- Jobs page backed by daily CSV snapshots
- Export and import progress as JSON
- Print-friendly view
- Deploy setup for Vercel and GitHub Pages

## Files

- Entry HTML: [index.html](/Users/pranav/Documents/Playground/index.html)
- React app: [src/App.jsx](/Users/pranav/Documents/Playground/src/App.jsx)
- Plan data: [src/plan.js](/Users/pranav/Documents/Playground/src/plan.js)
- Java revision data: [src/javaRevision.js](/Users/pranav/Documents/Playground/src/javaRevision.js)
- Generated job reports: [src/jobReportsData.generated.js](/Users/pranav/Documents/Playground/src/jobReportsData.generated.js)
- Storage helpers: [src/storage.js](/Users/pranav/Documents/Playground/src/storage.js)
- Job sync script: [scripts/sync-job-reports.mjs](/Users/pranav/Documents/Playground/scripts/sync-job-reports.mjs)
- Auto-publish script: [scripts/publish-job-reports.sh](/Users/pranav/Documents/Playground/scripts/publish-job-reports.sh)
- Vite config: [vite.config.js](/Users/pranav/Documents/Playground/vite.config.js)
- GitHub Pages workflow: [.github/workflows/deploy-pages.yml](/Users/pranav/Documents/Playground/.github/workflows/deploy-pages.yml)

## Job Reports

- Source folder currently points to `/Users/pranav/Documents/Job Application Automations/job-search-reports`
- The app reads daily files named like `YYYY-MM-DD-jobs.csv`
- The Codex automation is now configured to run [scripts/publish-job-reports.sh](/Users/pranav/Documents/Playground/scripts/publish-job-reports.sh) after generating the daily reports
- That script runs `npm run sync:jobs`, commits the updated generated data, and pushes it to GitHub so Vercel can redeploy
- The `Jobs` page will then show each snapshot day and preserve older days too

## Deploy

### Vercel

- Import the repo into Vercel.
- Framework preset should be detected as `Vite`.
- [vercel.json](/Users/pranav/Documents/Playground/vercel.json) is already included.

### GitHub Pages

- Push this project to GitHub.
- In repository settings, enable GitHub Pages and set source to `GitHub Actions`.
- The workflow builds on pushes to `main`.
