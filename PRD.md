# Product Requirements Document: CemAI Control Tower

**Version:** 1.0  
**Status:** In Development  
**Author:** Cement AI Hackathon Team

## 1. Introduction & Vision

### 1.1. Vision Statement

The CemAI Control Tower is not just a dashboard; it is the **collaborative cockpit for the human-AI partnership** in cement manufacturing. It transforms raw data and complex AI decisions into a clear, calm, and actionable narrative, empowering plant operators to transition from reactive problem-solvers to strategic overseers of an autonomous plant.

### 1.2. Problem Statement

Plant operators are currently overwhelmed by disconnected data streams, constant alarms, and complex control systems. They lack a single, unified view of plant health that shows not just what *is* happening, but what *will* happen next. Existing tools don't provide the context behind alerts or the reasoning for control adjustments, leading to a lack of trust and slow decision-making.

### 1.3. Target User Persona

* **Name:** Rajesh Kumar
* **Role:** Senior Control Room Operator (20+ years of experience)
* **Goals:**
    * Run a safe, stable, and efficient shift.
    * Prevent unexpected shutdowns and quality deviations.
    * Meet production and energy targets.
* **Frustrations:**
    * **Alert Fatigue:** "I get hundreds of alarms a shift. Most are just noise."
    * **Information Silos:** "To understand a kiln issue, I have to check three different screens that don't talk to each other."
    * **Mistrust in Automation:** "The old APC system sometimes does things I don't understand, so I just turn it off. I need to know *why* it's making a change."

---

## 2. Goals & Success Metrics

### 2.1. Product Goals

* **Build Trust:** Create an interface that makes the AI's reasoning transparent and understandable.
* **Reduce Cognitive Load:** Consolidate all critical information into a single pane of glass, presenting it intuitively.
* **Facilitate Swift Action:** Enable operators to review and approve AI recommendations with full context and confidence in seconds.
* **Enhance Situational Awareness:** Provide predictive insights that allow operators to be proactive, not reactive.

### 2.2. Success Metrics

* **Adoption Rate:** >90% of operator decisions are made through the HITL (Human-in-the-Loop) workflow instead of manual overrides on the old SCADA system.
* **Decision Velocity:** Time to approve or reject a critical AI recommendation is < 30 seconds.
* **Confidence Score:** Quarterly operator surveys show a >85% confidence rating in the AI's proposals.
* **Business Impact:** The UI directly contributes to achieving the project's core business objectives (e.g., 5-8% power reduction, +/- 2% quality variation).

---

## 3. Core Features & Requirements

This section details the features organized by user-centric "Epics."

### Epic 1: The "Glass Cockpit" — At-a-Glance Situational Awareness

This is the main dashboard view, designed for constant, ambient monitoring.

* **User Story 1.1: As an operator, I want to see the plant's vital KPIs in real-time.**
    * **Requirement:** A clean, configurable header displaying the core KPIs: Specific Power (kWh/ton), Heat Rate (kcal/kg), Clinker LSF, and Thermal Substitution Rate (TSR).
    * **UX:** Each KPI will show the current value, a target range, and a subtle trend indicator (e.g., ▲ improving, ▼ worsening).

* **User Story 1.2: As an operator, I need to understand the health of the pyro-process instantly.**
    * **Requirement:** A dedicated "Pyro-Process Stability" widget showing a real-time chart of the predicted Lime Saturation Factor (LSF) for the next 60 minutes.
    * **✨ Wow Factor:** Instead of just a line chart, we will use **Predictive Health Glyphs**. These are minimalist, color-coded icons for key systems (Kiln, Cooler, Mill). A solid green circle means "Stable." A slowly pulsing yellow circle means "Predicted deviation in 30-60 mins." A rapidly pulsing red circle means "Imminent deviation requiring action." This provides a zero-cognition overview of future state.

* **User Story 1.3: As an operator, I want to follow the AI swarm's thought process.**
    * **Requirement:** A "Master Control Log" panel that displays the real-time decision-making process of the swarm as a structured, readable log.
    * **UX:** This will not be a raw text dump. It will be formatted like an IDE console with syntax highlighting. Guardian proposals will be colored blue `[GUARDIAN]`, Optimizer proposals green `[OPTIMIZER]`, and Master Control decisions bold `[MASTER]`. This makes the log highly scannable.

---

### Epic 2: The "Co-Pilot" — Seamless Human-AI Collaboration

This epic focuses on the critical human-in-the-loop interaction, making it intuitive and trust-inspiring.

* **User Story 2.1: As an operator, I need a clear and unmistakable way to manage the plant's autonomy level.**
    * **Requirement:** A prominent, persistent "PAUSE AUTONOMY" button in the header.
    * **UX:** The button will have clear states:
        * `AUTONOMY: ON` (Green): The system is in full control.
        * `AUTONOMY: PAUSED` (Yellow): A decision is pending operator approval. The button will have a subtle pulse to draw attention.
        * `AUTONOMY: MANUAL` (Red): Autonomy is fully disabled.

* **User Story 2.2: As an operator, when a decision is required, I want to understand the full context and trade-offs before I approve it.**
    * **Requirement:** When autonomy is paused, clicking the control button opens a "Decision Hub" modal.
    * **✨ Wow Factor:** This is the core of the enterprise UX. The **Decision Hub** is not a simple "Yes/No" dialog. It presents a rich, comparative view:
        * **Side-by-Side Proposals:** It clearly shows the Guardian's stability proposal and the Optimizer's cost proposal next to each other.
        * **AI's Synthesis & Reasoning:** A dedicated section will display the Master Control agent's reasoning in plain English: *"The Optimizer's proposal to increase RDF by 3% saves $420/hr, but it risks a temperature drop. I have modified the proposal to 1.5% to capture half the savings while ensuring stability."* This directly exposes the AI's conflict resolution logic, building immense trust.
        * **Predicted Impact Simulation:** Simple graphics will show the predicted outcome of the approved action on key KPIs (e.g., a small chart showing the LSF line stabilizing).
        * **Clear Actions:** Large, unambiguous "Approve & Execute" and "Reject & Re-plan" buttons.

* **User Story 2.3: As a plant manager, I need to audit past autonomous decisions.**
    * **Requirement:** A searchable, filterable "Decision History" log accessible from the main dashboard.
    * **UX:** Each entry will be expandable to show the full Decision Hub context for that specific event, providing complete accountability.

---

### Epic 3: The "Oracle" — On-Demand Intelligence

This epic integrates the conversational "Cement Plant GPT" to serve as a proactive expert assistant.

* **User Story 3.1: As an operator, I want to ask questions about plant operations in natural language.**
    * **Requirement:** An embedded chat interface within the dashboard.
    * **UX:** Clean, modern chat UI. Will support queries like, "What is the standard procedure for a cooler jam?" and provide answers based on SOPs.

* **User Story 3.2: As an operator, I want the AI assistant to anticipate my needs during an event.**
    * **Requirement:** The chat interface must be context-aware.
    * **✨ Wow Factor:** The "Oracle" is **proactive, not just reactive**. When the "Pyro-Process Stability" glyph turns yellow, the chat panel will automatically surface **Contextual Action Buttons**:
        * `[Show me the SOP for LSF deviation]`
        * `[What were the raw mix parameters 1 hour ago?]`
        * `[Plot kiln temperature vs. fuel rate for the last 3 hours]`
        This transforms the chatbot from a simple Q&A tool into an intelligent co-pilot that anticipates the operator's next move, drastically reducing time-to-insight.

---

## 4. Non-Functional Requirements

* **Performance:** The dashboard must load in under 3 seconds. Real-time data visualizations must update with less than a 2-second lag from the source.
* **Security:** The UI must integrate with the plant's identity provider. Implement Role-Based Access Control (RBAC) – Operators can view and approve; Managers can view and audit; Engineers cannot execute commands.
* **Reliability:** The application must have 99.9% uptime and handle connection interruptions gracefully, clearly indicating to the user if data is stale.
* **Accessibility:** Must be compliant with WCAG 2.1 Level AA standards to ensure usability for all operators.

## 5. Out of Scope for v1.0 (Hackathon)

* User management and administration screens.
* Mobile-native application (the web app will be responsive).
* Interfaces for retraining or fine-tuning the AI models.
* Custom dashboard creation by end-users.
