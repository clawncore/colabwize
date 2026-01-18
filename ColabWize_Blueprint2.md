# ColabWize 2.0 Blueprint: The "Academic Insurance" Platform

> **Core Philosophy:** We do not just "check" for errors; we actively **fix** them to provide immunity against false accusations and AI detection.
> **Pivot (Jan 2026):** Shift from "Passive Monitoring" to **"Active Defense"**.

## 1. The Problem (Revised)
Students are terrified of **False Positives**.
*   Professors use Turnitin/GPTZero which are aggressive and often wrong.
*   Existing tools (Grammarly, ChatGPT) help write, but increase the risk of being flagged.
*   **The Gap:** Students need a "Sanctuary" that guarantees their work is clean *before* submission.

## 2. The Solution: "Active Defense" Suite
ColabWize offers a 3-layer shield:
1.  **See it:** (Turnitin Mirror)
2.  **Fix it:** (Auto-Humanizer)
3.  **Prove it:** (Citation Armor + Authorship Backup)

---

## 3. Core Features (The "Ironclad Shield")

### 🛡️ Feature 1: The Turnitin Mirror (Verification)
> *Replaces: Weak "Originality Map" with generic string matching.*
*   **Goal:** Show the user *exactly* what the professor will see. No guessing.
*   **Mechanism:**
    *   **API:** **Copyleaks API** (Industry standard for "Turnitin-grade" detection).
    *   **Why:** Traditional "string similarity" is useless against modern plagiarism detectors. We need enterprise-grade indexing.
    *   **User Value:** "100% Certainty. If we say it's green, it's green."

### 🩸 Feature 2: The Auto-Humanizer (Bypass/Anxiety Relief)
> *Replaces: Robotic "Rephrase Service" (Spinner).*
*   **Goal:** Convert "Red Flag" AI text into "Green" human-like text instantly.
*   **Mechanism:**
    *   **Engine:** **Claude 3.5 Sonnet** (via API).
    *   **Strategy:** **Adversarial Rewriting**. We prompt the model to increase "Burstiness" and "Perplexity" specifically to break AI detection patterns.
    *   **Why:** Simple synonym swappers (Spinners) sound robotic and get flagged for bad grammar. Claude 3.5 produces high-quality, undetectable academic prose.
    *   **Action:** One-click "Sanitize" button for flagged paragraphs.

### ⚔️ Feature 3: Citation Armor (Legitimization)
> *New Feature: "Retroactive Citation Injection".*
*   **Goal:** Turn "Hallucinated AI Claims" into "Researched Facts".
*   **Mechanism:**
    *   **Engine:** **Semantic Scholar API** / **Crossref API**.
    *   **Action:** User highlights a claim (e.g., "Mitochondria is the powerhouse..."). System searches for a *real*, peer-reviewed paper that validates this claim and inserts a perfectly formatted citation.
    *   **Why:** AI is often detected because it lacks sources. Real sources make the text defensible.

### 📄 Feature 4: Enterprise-Grade Document Parsing (Infrastructure) [DONE]
> *Replaces: Fragile "pdf-parse" library.*
*   **Goal:** Handle complex Academic PDFs (columns, images, charts) without crashing.
*   **Solution:** **Mathpix OCR API** (Implemented).
*   **Why:** `pdf-parse` fails on multi-column layouts, common in academic papers. If we can't read the file, we can't verify it.

---

## 4. Secondary Features

### 🎓 Safe AI Integrity Assistant ("The Tutor")
*   **Goal:** A read-only chatbot that *explains* concepts but refuses to *write* the essay for you.
*   **Guardrails:** "I can explain Quantum Physics, but I cannot write your introduction."

### 📉 Anxiety Reality Check Panel
*   **Goal:** Contextualize the "Score".
*   **Message:** "Your 12% matches are just quotes/citations. You are safe."

---

## 5. The "Backup" Feature (Defensibility)

### 📜 Authorship Certificate (The "Last Resort" Moat)
*   **Status:** **Moved to BACKUP.**
*   **Goal:** A "Reciept" of the writing process.
*   **Why Demoted:** High friction. Requires users to write *inside* the platform. Great for "Defense" if accused, but not the primary driver for "Anxiety Relief".
*   **Function:** Tracks keystrokes, active time, and edit history. Generates a signed PDF certificate with a verifiable QR code.
*   **Strategic Upgrade:** Eventually needs a **Google Docs Extension** to track users where they naturally write.

---

## 6. What NOT to Build (Phase 1)
*   ❌ **Generic Grammar Checker:** (Let Grammarly win this).
*   ❌ **Bibliography Manager:** (Let Zotero win this).
*   ❌ **Collaboration Tools:** (Not for Phase 1).

## 7. Revised Tech Stack Priorities
1.  **Backend:** Node.js + Express (Robust).
2.  **AI/NLP:**
    *   **Copyleaks API** (Detection).
    *   **Claude 3.5 Sonnet** (Humanizing/Rewriting).
    *   **Semantic Scholar** (Citations).
3.  **Database:** PostgreSQL + Prisma (Store user logs for Certificate).
4.  **Parsing:** **Mathpix/Adobe API** (Reliable PDF OCR).

## 8. Development Roadmap (Next 4 Weeks)
1.  **Week 1: The Engine Upgrade.**
    *   Rip out local `string-similarity` & `pdf-parse`.
    *   Integrate Copyleaks API (Turnitin Mirror).
    *   Integrate Mathpix/Adobe OCR.
2.  **Week 2: The Humanizer.**
    *   Build `AutohumanizeService` using Claude 3.5.
    *   Fine-tune prompts for "Anti-Detection" style.
3.  **Week 3: Citation Armor.**
    *   Build `CitationInjectionService` using Semantic Scholar.
4.  **Week 4: The Backup.**
    *   Polish the Authorship Certificate UI (Verification Page is already done).
