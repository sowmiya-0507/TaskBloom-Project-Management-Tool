# Taskbloom-ProjectManagement-Tool

A Java + Spring Boot + MySQL task board with an HTML/CSS/JavaScript frontend.

## Features
- Create, edit and delete tasks
- Kanban workflow: To do, In progress, Review, Done
- Assignee, due date, priority, description and comment/note
- Dashboard statistics and completion rate
- Search, priority filtering and Focus Mode
- Persistent MySQL storage through Spring Data JPA
- Responsive interface

## Requirements
- JDK 21
- MySQL Server 8+
- Maven 3.9+ (or VS Code Java extensions with Maven support)
- Internet connection for Maven to download dependencies on first run

## Run on Windows
1. Start MySQL.
2. Open `src/main/resources/application.properties`.
3. Change `spring.datasource.password=CHANGE_ME` to your MySQL root password. Keep this local file private; don't commit real credentials.
4. Open a terminal in this project folder and run:
   ```powershell
   mvn spring-boot:run
   ```
   If Maven isn't installed globally, use the Maven wrapper if you add one, or run via VS Code's Spring Boot/Maven support.
5. Wait until the console says the application started on port 8080.
6. Open http://localhost:8080

The database `codealpha_pm` and table are created automatically by the configured local development settings.

## API
- `GET /api/tasks` — list tasks
- `POST /api/tasks` — create task
- `PUT /api/tasks/{id}` — update task
- `DELETE /api/tasks/{id}` — delete task

Example POST JSON:
```json
{
  "title": "Prepare project demo",
  "description": "Record a short walkthrough",
  "status": "TODO",
  "priority": "HIGH",
  "assignee": "Sowmiya",
  "dueDate": "2026-10-10",
  "comments": "Show create, move and delete"
}
```

## Local database password
Set your own MySQL password in `src/main/resources/application.properties` or set `DB_PASSWORD` in the terminal before starting Spring Boot. Never commit credentials.

## Notes
- This is an internship MVP, not a production-secure multi-user service.
- Login/registration, per-project task separation, real-time WebSockets and role-based permissions are not implemented in this MVP.
- Projects are selectable and saved in browser local storage; tasks are stored in MySQL with a project name. Project lists are browser-local, not shared between users.
- Do not expose this local database configuration publicly. For deployment, use environment variables and production security settings.
