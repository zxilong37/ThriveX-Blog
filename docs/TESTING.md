# ThriveX Testing And QA Guide

## Static Checks

Run from each project:

```bash
cd ThriveX-Blog
npm run lint
npm run build

cd ../ThriveX-Admin
npm run lint
npm run build

cd ../ThriveX-Server
mvn test
mvn -pl blog -am package -DskipTests
```

Current note: the frontend projects do not yet define Vitest/Jest test scripts. Start with lint/build plus browser QA, then add focused tests around request helpers and critical components.

## Database Verification

For a fresh database:

1. Create an empty MySQL database.
2. Import `ThriveX-Server/ThriveX.sql`.
3. Confirm these tables exist: `article`, `article_config`, `cate`, `tag`, `comment`, `wall`, `web_config`, `env_config`, `file_detail`, `work_report`, `work_report_export`, `work_report_schedule`.
4. Start Server and open `http://localhost:9003/doc.html`.

## Browser QA Matrix

Use Playwright/browser MCP after all three services are running.

| App | Viewport | Pages |
| --- | --- | --- |
| Blog | 375, 768, 1440 | `/`, `/article/1`, `/tags`, `/wall/all`, `/record`, `/reports` |
| Admin | 375, 768, 1440 | `/login`, `/`, `/article`, `/config`, `/file`, `/work` |

Checks:

- No critical console errors.
- No unexpected 4xx/5xx API requests.
- Header/sidebar do not overflow.
- Dark mode keeps text readable.
- Article cards keep stable height and readable contrast.
- Admin login form validates empty fields and submits with valid credentials.
- Work report page can load current user report, save draft, export, and list exports.

## Minimum Regression Scenarios

| Area | Scenario |
| --- | --- |
| Auth | Login, token persistence, token check, logout |
| Article | List, detail, encrypted article prompt, create/edit/delete/recycle |
| Comments | Public submit, admin audit, article comment tree |
| Config | Read/write `web`, `theme`, `other`, env configs |
| Files | Upload, list directory, delete file |
| Work reports | Save draft, update draft, export Word, download export, update schedule |
| Database | Fresh SQL import matches active models and controllers |

## Recommended Future Automated Tests

- Blog: request helper tests for query building and fallback response; component tests for Header auth state and Swiper single/multiple slide behavior.
- Admin: request interceptor tests for token injection and 401 flow; smoke tests for route protection and login.
- Server: `@SpringBootTest` smoke test, `MockMvc` tests for `/user/login`, `/article`, `/web_config/name/{name}`, `/work_report`.
