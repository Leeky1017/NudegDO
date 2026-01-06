# nudge-trigger Specification

## Purpose
Nudge 模式的触发机制。

## Requirements

### Requirement: N Button Activation
The system SHALL provide an N button to toggle Nudge mode.

#### Scenario: Click N button to activate
- GIVEN Nudge mode is inactive
- WHEN user clicks N button
- THEN activate Nudge mode
- AND show breathing animation on N button
- AND if input has text, expand Nudge panel

#### Scenario: Click N button to deactivate
- GIVEN Nudge mode is active
- WHEN user clicks N button
- THEN deactivate Nudge mode
- AND stop breathing animation
- AND collapse Nudge panel

### Requirement: Keyboard Shortcut
The system SHALL support Ctrl+N to toggle Nudge mode.

#### Scenario: Press Ctrl+N
- GIVEN input box has focus
- WHEN user presses Ctrl+N
- THEN toggle Nudge mode state
- AND update N button visual state

### Requirement: Auto-expand on Input
The system SHALL auto-expand Nudge panel when text is entered in Nudge mode.

#### Scenario: Type in Nudge mode
- GIVEN Nudge mode is active
- AND Nudge panel is collapsed
- WHEN user types text and pauses
- THEN expand Nudge panel
- AND generate questions for the input
