# ThriveX Workspace Project Guide

## Overview

ThriveX is a three-project blog system:

| Project | Path | Stack | Responsibility |
| --- | --- | --- | --- |
| Blog | `ThriveX-Blog` | Next.js 15, React 19, Tailwind CSS | Public blog, article reading, comments, RSS, sitemap, report entry |
| Admin | `ThriveX-Admin` | Vite, React 19, Ant Design 6 | Content operations, site config, files, comments, workbench |
| Server | `ThriveX-Server` | Spring Boot 2.7, MyBatis-Plus, MySQL | REST API, auth, persistence, file storage, OpenAPI/Knife4j |

The stable-enhancement pass keeps existing API paths and database naming intact. It focuses on UI consistency, documented contracts, SQL/schema consistency, and repeatable testing.

## GitHub Benchmark

GitHub MCP tools were not exposed in this environment, and `gh` is installed but not authenticated. The benchmark was therefore verified through public GitHub repository metadata and README review.

Reference projects:

| Repository | Takeaway for ThriveX |
| --- | --- |
| `timlrx/tailwind-nextjs-starter-blog` | Strong SEO/RSS/Sitemap/MDX baseline and clear project documentation |
| `notionnext-org/NotionNext` | Theme customization, deployment simplicity, search, comments, analytics |
| `transitive-bullshit/nextjs-notion-starter-kit` | Command search, dark mode, social previews, table of contents |
| `Mereithhh/vanblog` | Full blog system with admin, editor, import/export, image hosting, statistics |
| `halo-dev/halo` | Mature CMS model with themes/plugins and structured docs |
| `fecommunity/reactpress` | Headless CMS/API separation and admin-managed appearance |

Applied direction: keep ThriveX's separated frontend/admin/server architecture, then make the existing system easier to run, inspect, document, and verify.

## Local Startup

Recommended ports used by the workspace:

| Service | Command | URL |
| --- | --- | --- |
| Server | `mvn -pl blog spring-boot:run` from `ThriveX-Server` | `http://localhost:9003` |
| Blog | `npm run dev` from `ThriveX-Blog` | `http://localhost:3000` or next available port |
| Admin | `npm run dev` from `ThriveX-Admin` | `http://localhost:5173` or next available port |
| MySQL | local MySQL service | `localhost:3306` |

Core environment variables:

| Project | Variables |
| --- | --- |
| Blog | `NEXT_PUBLIC_PROJECT_API`, `NEXT_PUBLIC_CACHING_TIME` |
| Admin | `VITE_PROJECT_API`, optional analytics/AI/map keys |
| Server | `PORT`, `DB_INFO`, `DB_USERNAME`, `DB_PASSWORD` |

## Database Source Of Truth

`ThriveX-Server/ThriveX.sql` is the baseline schema for new installations. The Server still has a runtime fallback initializer for work reports, but the SQL now includes:

- `work_report`
- `work_report_export`
- `work_report_schedule`

Album API/type declarations were removed from Admin because no matching Server controller/table is present in the current workspace. Keep album product UI hidden until backend and SQL support are implemented.

## Current Stable Enhancements

- Blog header, swiper, article layout, and homepage list path were restored to valid JSX and aligned around the existing green/teal editorial style.
- Admin login, header, sidebar, route titles, and user dropdown were restored to valid JSX with consistent 8px radius, Ant Design tokens, and readable Chinese labels.
- Server Knife4j configuration now declares a Docket for `liuyuyang.net.web.controller`.
- Work report database tables are defined both in total SQL and runtime fallback.
