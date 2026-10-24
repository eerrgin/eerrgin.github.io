# Tigerk · Local Engineering Reasoning Layer
**Design record:** EL-2945  
**Runtime:** browser / single tab  
**Primary files:** `tigerk.js`, `hat.js`, `index.html`

## System contract

Tigerk is a local-first developer-assistance prototype. It separates request routing, local reference retrieval, engineering response playbooks, and UI presentation so the visible answer does not depend on whichever intent happens to score highest in a small neural classifier.

## Request path

1. **Normalize.** Turkish-aware case folding and accent normalization produce a stable text form for route detection.
2. **Route.** Explicit local commands are resolved deterministically. Developer requests are mapped to a bounded topic family: code review, debugging, concurrency, API semantics, testing, data access, frontend rendering, performance, security, system design, delivery pipeline, or model systems.
3. **Retrieve.** A compact local reference corpus covers the site's own tools and curated topics. Retrieval is lexical and returns a weak-match signal instead of silently asserting every nearest match is correct.
4. **Compose.** A domain playbook returns an ordered diagnostic: evidence to collect, likely failure surfaces, verification steps, and minimal corrective action. Known reference entries remain available for site-specific questions.
5. **Render.** HAT and the Tigerk panel use the same answer function. The UI shows the route and local session state, not the classifier's raw confidence or text-normalization internals.

## Neural routing core

The training model is a compact feed-forward network built in plain JavaScript:

- Input vector: keyword-stem indicators plus hashed character-trigram buckets.
- Hidden layer: 16 sigmoid neurons.
- Output layer: current intent set.
- Update: mean-squared-error signal with back-propagation.
- Training examples and weights: local browser storage; Tigerk itself makes no remote inference request.

The network supplies intent-routing signals. Specialist engineering responses are deterministic playbooks, not a claim that this browser session runs a general-purpose hosted language model. Their purpose is to make common engineering paths consistent and auditable while keeping processing in the browser.

## Response quality contract

- Prefer a useful diagnostic structure over an ungrounded generic answer.
- Keep root-cause hypotheses distinct from verified facts.
- For code-specific review, use the code/diff/trace the user actually supplies; do not imply that an unseen repository was inspected or code was executed.
- For API and concurrency questions, explicitly address failure paths and repeatability.
- For security questions, focus on trust boundaries, server-side authorization, validation, and verifiable negative tests.
- Ask for the smallest missing artifact when a decision depends on unstated runtime, input, or expected behavior.
- Never expose raw keyword sparsity as a user's knowledge score.

## HAT command surface

Natural-language engineering requests can be entered directly. Operational commands include `help`, `hava`, `saat`, `ay`, `radyo`, `tema`, `git <bölüm>`, `tigerk <istem>`, `eğit`, `ağ`, `not`, `temiz`, and `kapat`.

The HAT panel is a visual local console, not an authentication boundary. It opens directly without a client-side hard-coded passcode.

## Evaluation checklist

When expanding this layer, keep a regression set containing:
- A direct request for each supported engineering topic.
- A topic phrased in Turkish and a topic phrased in English.
- A question that contains a project name but asks about code, to ensure it is not mistaken for navigation.
- An ambiguous request, which should ask for context instead of returning an unrelated corpus entry.
- Each explicit command, ensuring it executes only when the user actually invokes it.

## Next design increment

The next meaningful upgrade is a small golden set of prompts with expected route/topic and answer invariants, run in CI whenever response playbooks or classifier training examples change. That makes quality a testable property rather than a visual impression.