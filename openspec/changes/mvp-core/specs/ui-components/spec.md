# Delta for ui-components

## ADDED Requirements

### Requirement: Task Input Component
The system SHALL provide a task input component with integrated N button.

#### Scenario: Render input box
- GIVEN app is loaded
- WHEN input area renders
- THEN display rounded input box (28px radius)
- AND display N button on the right
- AND display submit button

### Requirement: N Button Component
The system SHALL provide an N button with breathing animation.

#### Scenario: Render N button
- GIVEN input area is rendered
- WHEN N button is displayed
- THEN show 52x52px button with 16px radius
- AND use ZCOOL KuaiLe font

#### Scenario: Breathing animation
- GIVEN Nudge mode is active
- WHEN N button is rendered
- THEN apply 3s ease-in-out infinite scale animation
- AND apply pulsing shadow effect

### Requirement: Nudge Panel Component
The system SHALL provide an expandable Nudge panel.

#### Scenario: Panel expansion
- GIVEN Nudge mode is triggered with input
- WHEN panel expands
- THEN animate max-height from 0 to 500px
- AND use 0.5s cubic-bezier transition

#### Scenario: Question display
- GIVEN panel is expanded
- WHEN questions are ready
- THEN display questions with coral number badges
- AND stagger fade-in animation (0.15s delay each)

### Requirement: Task Card Component
The system SHALL display tasks as cards with checkbox and expand button.

#### Scenario: Render task card
- GIVEN tasks exist
- WHEN task list renders
- THEN display white card with 20px radius
- AND show checkbox on left
- AND show expand button for Nudge tasks

### Requirement: Task Drawer Component
The system SHALL provide expandable drawer for chat history.

#### Scenario: Expand drawer
- GIVEN Nudge task card is clicked
- WHEN expand button is pressed
- THEN animate drawer open below card
- AND display chat history

### Requirement: Chat Bubble Component
The system SHALL display chat messages as styled bubbles.

#### Scenario: AI message
- GIVEN chat contains AI message
- WHEN rendering
- THEN display white bubble on left
- AND show persona avatar

#### Scenario: User message
- GIVEN chat contains user message
- WHEN rendering
- THEN display light purple bubble on right
