# task-core Specification

## Purpose
定义任务实体的最小数据模型与字段语义（ID、时间戳、完成状态、Nudge 元数据、可选时间规划），作为后续 CRUD 与 UI 的统一基础。

## Requirements

### Requirement: Task Data Structure
The system SHALL store tasks with unique identifiers and essential metadata.

#### Scenario: Create new task
- GIVEN a user submits task text
- WHEN the system creates a task
- THEN assign a unique numeric ID (timestamp)
- AND store the title, creation time, and completion status

### Requirement: Task Completion State
The system SHALL track task completion status as a boolean.

#### Scenario: Mark task complete
- GIVEN an incomplete task exists
- WHEN user marks it complete
- THEN set completed to true
- AND record completedAt timestamp

#### Scenario: Mark task incomplete
- GIVEN a completed task exists
- WHEN user marks it incomplete
- THEN set completed to false
- AND clear completedAt timestamp

### Requirement: Nudge Metadata
The system SHALL store Nudge-related metadata for tasks created via Nudge mode.

#### Scenario: Store Nudge conversation
- GIVEN a task is created via Nudge mode
- WHEN the task is saved
- THEN store isNudged as true
- AND store the persona type used
- AND store the full chat history

### Requirement: Time Planning
The system SHALL store optional time planning information when provided.

#### Scenario: Store scheduled time
- GIVEN user provides time information during Nudge
- WHEN task is created
- THEN store scheduledTime, scheduledDate, and duration
