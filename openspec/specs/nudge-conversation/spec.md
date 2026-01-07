# nudge-conversation Specification

## Purpose
定义 Nudge 面板的展开、问题展示、用户回答、确认/取消等交互链路，确保无需页面跳转也能完成从输入到创建任务的闭环。

## Requirements

### Requirement: Panel Expansion
The system SHALL expand Nudge panel below input box without page navigation.

#### Scenario: Expand panel
- GIVEN Nudge mode is active
- AND user has entered task text
- WHEN panel expansion is triggered
- THEN animate panel open (max-height transition 0.5s)
- AND display task text at top
- AND show persona avatar and name

### Requirement: Question Display
The system SHALL display 2-3 questions with staggered animation.

#### Scenario: Show questions
- GIVEN Nudge panel is expanding
- WHEN questions are ready
- THEN display each question with number badge
- AND animate questions in sequence (0.15s stagger)

### Requirement: User Response
The system SHALL provide textarea for user to answer questions.

#### Scenario: Enter response
- GIVEN questions are displayed
- WHEN user types in response textarea
- THEN capture the response text
- AND enable confirm button when non-empty

### Requirement: Confirm Action
The system SHALL create task when user confirms.

#### Scenario: Click confirm
- GIVEN user has entered response
- WHEN user clicks "Confirm and Create"
- THEN create task with chat history
- AND collapse Nudge panel
- AND clear input box
- AND deactivate Nudge mode

### Requirement: Cancel Action
The system SHALL allow canceling without creating task.

#### Scenario: Click cancel
- GIVEN Nudge panel is open
- WHEN user clicks "Cancel"
- THEN collapse Nudge panel
- AND preserve input text
- AND deactivate Nudge mode
