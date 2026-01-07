# Spec: nudgedo-roadmap

## Purpose

Define how NudgeDO maintains a lightweight execution plan for sequencing work and expressing hard dependencies between Issues.

## Requirements

### Requirement: Execution plan is the source for hard dependencies

The repository MUST maintain an execution plan at:
- `openspec/specs/nudgedo-roadmap/execution_plan.md`

The plan MUST be parseable by `scripts/agent_pr_preflight.sh` to detect hard dependencies.

#### Scenario: Preflight reads execution plan
- **WHEN** running `scripts/agent_pr_preflight.sh`
- **THEN** it can derive `Issue -> dependencies` edges from `openspec/specs/nudgedo-roadmap/execution_plan.md`

