# task-crud Specification

## Purpose
任务的增删改查操作。

## Requirements

### Requirement: Create Task (OnMe Mode)
The system SHALL create tasks directly when user submits in OnMe mode.

#### Scenario: Submit via Enter key
- GIVEN user has typed task text in input box
- AND Nudge mode is NOT active
- WHEN user presses Enter
- THEN create task with isNudged=false
- AND add to task list at top
- AND clear input box

#### Scenario: Empty input rejection
- GIVEN input box is empty
- WHEN user attempts to submit
- THEN do nothing
- AND keep focus on input box

### Requirement: Create Task (Nudge Mode)
The system SHALL create tasks with conversation history when completed via Nudge.

#### Scenario: Complete Nudge conversation
- GIVEN user has answered Nudge questions
- WHEN user clicks "Confirm and Create"
- THEN create task with isNudged=true
- AND store chat history
- AND close Nudge panel
- AND clear input box

### Requirement: Toggle Task Completion
The system SHALL allow toggling task completion status.

#### Scenario: Toggle via checkbox
- GIVEN a task is displayed
- WHEN user clicks the checkbox
- THEN toggle the completed status
- AND update visual state (strikethrough if complete)

### Requirement: View Task Details
The system SHALL allow viewing Nudge conversation history.

#### Scenario: Expand task drawer
- GIVEN a Nudge task is displayed
- WHEN user clicks expand button
- THEN show chat history in drawer below task card
