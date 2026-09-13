# Maintenance Request Assistant

A responsive maintenance request application with Arabic and English
interfaces, light and dark themes, and Engineering Dimensions branding.

## Features

- Analyze a natural-language maintenance description using Gemini.
- Split multiple problems into separate requests.
- Suggest a specialty and priority for each request.
- Allow users to change the specialty and priority before saving.
- Display saved requests with their descriptions and creation dates.
- Remember the selected language and theme.
- Display validation, connection, and API quota errors.

## Requirements

- Node.js 24 or later
- npm
- A Gemini API key

## Run locally

### Backend

Open a terminal in the project root:

    cd server
    npm ci

Copy `.env.example` to `.env` and replace the placeholder with your
Gemini API key:

    GEMINI_API_KEY=your_gemini_api_key_here

Start the backend:

    node --env-file=.env index.js

The backend runs at http://127.0.0.1:3001.

### Frontend

Open a second terminal in the project root:

    cd client
    npm ci
    npm run dev

Open the local URL printed by Vite, normally http://localhost:5173.
Keep both terminals running.

## Checks

From the client directory:

    npm run lint
    npm run build

Optional live Gemini test, from the server directory:

    node --env-file=.env test-gemini.mjs

The live test uses API quota.

On Windows PowerShell, use `npm.cmd` if running `npm` is blocked.

## Implementation decisions

- React and Vite provide the frontend.
- Express provides the backend API.
- Gemini requests are made by the backend so the API key stays
  out of the browser.
- Structured output and backend validation constrain the suggested
  categories and priorities.
- Users review suggestions before saving.
- Requests are stored in server memory for this practical test.
- Interface translations are separate from stored request values.

## API endpoints

- GET /api/health — backend health check.
- POST /api/analyze — analyze a problem description.
- GET /api/requests — retrieve saved requests.
- POST /api/requests — validate and save reviewed requests.

## Manual verification

- Multiple problems were separated and assigned different specialties
  and priorities.
- A user-modified priority was saved successfully.
- Invalid categories were rejected with HTTP 400.
- Empty descriptions displayed a validation message.
- Connection errors displayed messages in Arabic and English.
- Language and theme preferences survived a page refresh.
- The interface was checked at a mobile viewport size.
- Frontend lint and production build completed successfully.

## Limitations

- Restarting the backend clears saved requests.
- There are no user accounts; saved requests are shared.
- Gemini requires internet access and available API quota.
- AI suggestions may be incorrect and require user review.
- The interface supports Arabic and English; generated descriptions
  currently use Arabic.
- The production frontend build does not deploy the backend.
- The application is a practical-test prototype, not a production service.

## AI tool disclosure

I used ChatGPT/Codex to help develop code, troubleshoot errors,
plan tests, and explain implementation choices. I applied the changes
and ran the application and checks locally.