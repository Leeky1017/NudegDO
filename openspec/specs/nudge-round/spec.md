# nudge-round Specification

## Purpose
轮次制追问系统，控制问题数量和深度。

## Requirements

### Requirement: Round Configuration
The system SHALL support configurable round settings.

#### Scenario: Default configuration
- GIVEN no custom settings
- WHEN Nudge is triggered
- THEN use 1 round with 2-3 questions per round

#### Scenario: Custom configuration
- GIVEN user has set maxRounds=2
- WHEN Nudge is triggered
- THEN allow up to 2 rounds of questions

### Requirement: Question Dimensions
The system SHALL generate questions covering key dimensions.

#### Scenario: First round questions
- GIVEN first round of Nudge
- WHEN generating questions
- THEN cover: specific goal, time arrangement, potential obstacles

#### Scenario: Second round questions (optional)
- GIVEN second round is enabled
- AND user completed first round
- WHEN generating second round
- THEN cover: backup plans, subtask breakdown, reminder preferences

### Requirement: Question Count
The system SHALL generate 2-3 questions per round.

#### Scenario: Generate questions
- GIVEN a round is starting
- WHEN questions are generated
- THEN produce exactly 2 or 3 questions
- AND avoid duplicate questions from previous rounds
