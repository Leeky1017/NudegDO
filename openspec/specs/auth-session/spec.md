# auth-session Specification

## Purpose
用户会话管理（Phase 2+）。

## Requirements

### Requirement: Anonymous Mode
The system SHALL support anonymous usage without login.

#### Scenario: First visit
- GIVEN user visits app for first time
- WHEN app loads
- THEN create anonymous session
- AND store data locally only

### Requirement: Optional Authentication
The system MAY support optional user authentication.

#### Scenario: User login
- GIVEN user chooses to login
- WHEN credentials are verified
- THEN create authenticated session
- AND enable cloud sync features

### Requirement: Session Expiration
The system SHALL handle session expiration gracefully.

#### Scenario: Session expires
- GIVEN authenticated session exists
- WHEN session token expires
- THEN prompt user to re-authenticate
- AND preserve local data
