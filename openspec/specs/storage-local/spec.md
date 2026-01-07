# storage-local Specification

## Purpose
定义浏览器本地持久化的键、数据结构与导入导出规则，确保任务/设置在刷新后可恢复，并对损坏数据提供安全默认值。

## Requirements

### Requirement: Task Persistence
The system SHALL persist tasks to localStorage.

#### Scenario: Save tasks
- GIVEN tasks array is modified
- WHEN save is triggered
- THEN serialize tasks to JSON
- AND store under key 'nudgedo_tasks'

#### Scenario: Load tasks
- GIVEN app initializes
- WHEN loading tasks
- THEN read from 'nudgedo_tasks'
- AND parse JSON to Task array
- AND return empty array if not found

### Requirement: Settings Persistence
The system SHALL persist user settings to localStorage.

#### Scenario: Save settings
- GIVEN settings are modified
- WHEN save is triggered
- THEN serialize settings to JSON
- AND store under key 'nudgedo_settings'

#### Scenario: Load settings with defaults
- GIVEN app initializes
- WHEN loading settings
- THEN read from 'nudgedo_settings'
- AND merge with default settings
- AND return merged result

### Requirement: Data Export
The system SHALL support exporting all data.

#### Scenario: Export data
- GIVEN user requests export
- WHEN export is triggered
- THEN combine tasks and settings
- AND return as JSON string
- AND include version number

### Requirement: Data Import
The system SHALL support importing data.

#### Scenario: Import data
- GIVEN user provides JSON string
- WHEN import is triggered
- THEN validate JSON structure
- AND replace current tasks and settings
- AND trigger UI refresh
