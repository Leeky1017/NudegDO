# audit-commercial-readiness Specification

## Purpose
Define the minimum deliverables and evidence requirements for a commercial-readiness audit of NudgeDO, so the audit results are reproducible, auditable, and actionable.

## Requirements

### Requirement: Audit scope
The audit MUST cover at minimum:
- Product readiness (core flows, UX, accessibility)
- Architecture & maintainability (module boundaries, state, data flow)
- Security & privacy (secrets, data handling, supply-chain risk)
- Reliability (error handling, offline/latency behavior)
- Delivery readiness (CI, release, observability, operational guardrails)

#### Scenario: Scope is explicit
- GIVEN an audit task for a specific Issue `#N`
- WHEN the audit report is produced
- THEN the report MUST list in-scope and out-of-scope areas explicitly

### Requirement: Audit report format
The audit report MUST include:
- Executive summary and risk posture
- Findings list with per-finding: `ID`, `Severity`, `Description`, `Evidence`, `Impact`, `Recommendation`, `Acceptance`
- A prioritized remediation shortlist for the next 1–2 iterations

#### Scenario: Findings are actionable
- GIVEN a finding is marked `High` or above
- WHEN the report is reviewed
- THEN the report MUST include a concrete remediation proposal and acceptance criteria

### Requirement: Optimization report format
The optimization report MUST include:
- A phased roadmap (e.g. MVP hardening → Beta → Production)
- Dependencies and sequencing constraints
- A breakdown into implementable tasks that can be turned into Issues

#### Scenario: Roadmap is implementable
- GIVEN the optimization report is produced
- WHEN creating follow-up Issues
- THEN each milestone MUST map to a small set of independently mergeable tasks

### Requirement: Evidence and traceability
The audit MUST be reproducible from the repo state.

#### Scenario: Evidence is archived
- GIVEN the audit is completed
- WHEN the PR is opened
- THEN key command outputs (tests/typecheck/build/audit) MUST be saved under `rulebook/tasks/issue-<N>-<slug>/evidence/`
- AND runs MUST be summarized in `openspec/_ops/task_runs/ISSUE-<N>.md`

