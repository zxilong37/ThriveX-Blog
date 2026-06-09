# ThriveX API Guide

## Base Contract

Base URL is configured by the frontend:

- Blog: `NEXT_PUBLIC_PROJECT_API`
- Admin: `VITE_PROJECT_API`

Default local API base: `http://localhost:9003/api`

The backend uses a common response wrapper:

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

Admin-only endpoints expect:

```http
Authorization: Bearer <token>
```

OpenAPI/Knife4j entry after the Server starts:

- UI: `http://localhost:9003/doc.html`
- Swagger JSON, if enabled by Knife4j/Springfox: `http://localhost:9003/v2/api-docs`

## Endpoint Groups

| Group | Paths | Purpose |
| --- | --- | --- |
| Auth/User | `POST /api/user/login`, `GET /api/user/check`, `GET /api/user/author`, user CRUD | Admin login, token validation, author info |
| Article | `GET /api/article`, `GET /api/article/{id}`, `POST /api/article`, `PATCH /api/article`, `DELETE /api/article/{id}/{is_del}` | Public listing/detail and admin article lifecycle |
| Article Discovery | `GET /api/article/hot`, `GET /api/article/random`, `GET /api/article/cate/{cate_id}`, `GET /api/article/tag/{tag_id}`, `GET /api/article/view/{article_id}` | Homepage/sidebar/category/tag/read count |
| Category/Tag | `/api/cate`, `/api/tag`, `/api/cate/article/count`, `/api/tag/article/count` | Navigation, taxonomy, counts |
| Comment/Wall | `/api/comment`, `/api/comment/article/{articleId}`, `/api/wall`, `/api/wall/cate`, audit endpoints | Article comments and message wall |
| Config | `/api/web_config`, `/api/page_config`, `/api/env_config` | Site, theme, page, map, email, analytics config |
| Media/File/Oss | `/api/file`, `/api/oss` | Upload, file browser, storage provider config |
| Content Blocks | `/api/record`, `/api/swiper`, `/api/footprint`, `/api/link`, `/api/rss` | Micro posts, carousel, map footprints, friend links, subscriptions |
| Statistics | `/api/statis` | Dashboard and public data summaries |
| Work Report | `/api/work_report`, `/api/work_report/list`, `/api/work_report/{id}/export`, `/api/work_report/export/list`, `/api/work_report/export/{id}/download`, `/api/work_report/schedule` | User-scoped daily/weekly/monthly reports and Word export |

## Important Compatibility Notes

- Existing public paths are preserved.
- Article list supports optional paging/filter query parameters through `ArticleFilterVo`.
- Comments and wall messages include audit states; public reads should only display approved records.
- Work report tables are user-scoped and enforce one report per `user_id + type + period`.
- Admin album API/type declarations were removed because current Server/SQL do not include matching controllers or tables.

## Common Error Scenarios

| Scenario | Expected Behavior |
| --- | --- |
| Missing token on protected API | HTTP 401 or response code indicating no permission |
| Invalid login | Non-200 wrapped response with backend message |
| Missing env var | Frontend proxy routes return a clear 500 JSON message |
| Missing database table | Server startup/API fails; verify `ThriveX.sql` import and work report tables |
| File storage not configured | Upload returns backend failure; verify `/oss` config and `file.dir` |
