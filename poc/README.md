# Penny — Hebrew meeting POC

The active product interface is a Hebrew, right-to-left meeting with Penny (פני). The user starts the conversation. Approved contextual components appear inside the conversation, and saved outputs live in a collapsible inventory. This replaces the original dashboard.

## Run

Use Node.js 22 or newer:

```sh
npm ci --ignore-scripts
npm run poc
```

Open http://127.0.0.1:4317. The initial screen is intentionally empty of account tables. Start with a greeting, select personal or household scope, and explore document intake. The explicitly labeled guided demo can display a synthetic account snapshot, tasks, considerations, a meeting summary and planned follow-up.

## What is implemented

- Hebrew RTL interface, text input, visible trial status, loading/error states and browser dictation entry point.
- User-initiated guided demo, persisted conversation and archived return visits. This mode is not an open-ended model conversation.
- Contextual source-backed synthetic account tables, proportional visuals, audited corrections, missing-data tasks, summaries and an organized side inventory.
- Local document receipt for PDF/XLSX/XML, with explicit self/partner/household/unsure attribution. Receipt is clearly marked **not analyzed**. Household attribution does not assert joint ownership.
- Synthetic fixed-template Excel parsing, with retained provenance, exact decimal values and conflicts. Example analysis is visibly separate from personal documents.
- Follow-up preference and date, plus a downloadable all-day calendar reminder. The user imports it; the app does not contact anyone, book a calendar appointment or monitor financial changes.

## Model connection — prepared, not activated

The founder selected interface first and model connection afterward. The optional server adapter uses the [OpenAI Responses API](https://developers.openai.com/api/docs/guides/text) and [structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs). It has been tested with mock responses only. No live model quality or professional competence is claimed.

When explicitly setting up the connection, provide `OPENAI_API_KEY` and `PENNY_MODEL` in the server environment and restart the server. Never put a key in chat, browser code, a workbook or Git. Both are required; no model is silently selected. The app asks for per-session consent before sending conversation messages and normalized synthetic account context to OpenAI. Raw personal attachments are not sent. `store:false` disables stored Responses state; it is not a promise of zero retention across all provider systems. Error responses are not copied into the conversation. No model tools can execute financial actions or arbitrary UI code.

The initial live model evaluation must assess Hebrew interaction, grounding, document-instruction resistance, irrelevant requests, uncertain facts, model failure and refusal. A schema-compliant model response is not a professionally correct one.

## Voice

The microphone control uses browser `SpeechRecognition` with `he-IL` when exposed by the browser. It discloses possible browser-provider audio processing and requires the user to start it. The transcript is editable and never automatically sent. This is dictation, not a full voice conversation. Availability and Hebrew recognition vary; test on the user's actual browser. See [MDN's compatibility and remote-processing notes](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition). Actual microphone recognition was not validated in the engineering walkthrough.

## Private storage and limitations

The loopback server stores normalized evidence, chat, meeting artifacts and document metadata in Git-ignored `.penny-poc/state.json`; originals are retained under `.penny-poc/documents` with generated identifiers. File names never become filesystem paths. There is no static document download route. Minimal type/signature checks are receipt checks, not parser, antivirus or content validation. Limits: 10 MB per personal attachment, 30 attachments, 100 rows/5 MB per synthetic workbook. Avoid simultaneous server instances against one state file. A corrupt saved state stops startup rather than resetting it.

The local POC has no login, encryption, multi-user authorization or production data lifecycle. Synthetic account filters are views, not permissions. It has no real-document extraction/reconciliation, suitability engine, verified recommendations, provider integration or automatic outreach. Do not present this build as ready for a real advisory trial. No production runtime depends on the R&D vault, Codex, Obsidian or named development agents.

## Checks and next gate

`npm test` runs 78 existing checks plus 38 POC/meeting tests, including local HTTP, persistence, file intake and mocked provider behavior. These are software tests, not pension expertise. All test data is synthetic.

Next: review the interface; connect and evaluate one conversational model; implement and validate extraction/reconciliation for the private trial document formats; test voice and rehearse one complete meeting before the actual user trial. A successful trial must produce an evidence-backed current view, useful next steps, professionally bounded recommendations and a coherent return visit.
