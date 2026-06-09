# 实时热点聚合 Agent 方案

本文档说明本地实时热点系统的 Agent 分工、数据流、API 来源和验收方式。当前方案只面向本地使用，不需要域名、不需要部署公网服务。

## 本地数据流

```text
第三方热榜 API / 本地 DailyHotApi
  -> ThriveX-Server 定时抓取
  -> MySQL hotspot 表
  -> ThriveX-Blog /hotspot 页面展示
```

本地端口约定：

- Server: `http://localhost:9003`
- Blog: `http://localhost:3001`
- Admin: `http://localhost:9100`
- 本地 DailyHotApi: `http://localhost:6688`

## 推荐 Agent 数量

建议使用 7 个 Agent。主 Agent 负责总体设计、集成、验证和最终交付；子 Agent 按边界执行，避免互相覆盖文件。

| Agent | 主要功能 | 产出 |
| --- | --- | --- |
| 热点源研究 Agent | 调研微博、知乎、抖音、B 站、小红书、腾讯视频、百度、头条等平台可用接口、限制和替代方案。 | 平台源清单、合规风险、字段映射。 |
| 采集适配 Agent | 把不同接口统一成 `title/url/cover/summary/rankNo/hotValue/fetchedAt/rawJson`。 | 标准化热点 item。 |
| 调度与容错 Agent | 定时刷新、手动刷新、并发锁、超时、失败隔离和日志记录。 | 稳定刷新任务与失败报告。 |
| 数据契约 Agent | 维护 `hotspot` 表、实体、DTO/VO、Mapper、前端类型一致。 | MySQL 表结构、后端模型、前端类型。 |
| 后端 API Agent | 提供公开查询接口和后台刷新接口，保持 `Result<T>`、`@NoTokenRequired`、`@RateLimit` 契约。 | `/api/hotspot`、`/api/hotspot/sources`、`/api/hotspot/summary`、`/api/hotspot/refresh`。 |
| Blog 展示 Agent | 实现 `/hotspot` 页面、平台筛选、指标卡片、空态、加载态、暗色模式和响应式布局。 | 本地热点展示页面。 |
| QA 浏览器 Agent | 启动三端，检查接口、MySQL 入库、1440/768/375 页面、Console 和 Network 错误。 | QA 报告、截图和问题清单。 |

## 已落地接口

| 方法 | 地址 | 说明 |
| --- | --- | --- |
| `GET` | `/api/hotspot?page=1&size=120` | 获取热点分页列表，公开接口。 |
| `GET` | `/api/hotspot/sources` | 获取热点源配置，公开接口；不会返回第三方 API Token。 |
| `GET` | `/api/hotspot/summary` | 获取平台统计摘要，公开接口。 |
| `POST` | `/api/hotspot/refresh` | 手动刷新热点，需要后台 token。 |

## 默认数据源

当前后端默认使用混合源：

- DailyHotApi 或兼容服务：知乎、抖音、B 站、百度、今日头条。
- xxapi 微博热搜：`https://v2.xxapi.cn/api/weibohot`。
- JustOne API 小红书热搜：`/api/xiaohongshu/hot-search/v1`，token 放在本地 `application-local.yml`，不要提交。
- 顺为数据快手热榜：`https://api.itapi.cn/api/hotnews/kuaishou`，key 放在本地 `application-local.yml`，不要提交。
- TikHub 小红书热搜词：`/api/v1/xiaohongshu/web_v3/fetch_trending`，密钥放在本地 `application-local.yml` 的 headers 中；当前账号余额不足，源默认禁用。
- 腾讯视频：默认预留但不启用，等填入稳定第三方 API 后再启用。

本地 DailyHotApi 启动方式：

```powershell
node E:\Awork-project\.tools\dailyhot-smoke\start.mjs
```

后端本地启动示例：

```powershell
java -jar .\blog\target\blog-1.0-SNAPSHOT.jar `
  --server.port=9003 `
  --spring.profiles.active=pro,local `
  --hotspot.source-base-url=http://localhost:6688 `
  --hotspot.allow-local-source=true `
  --hotspot.max-items-per-source=20
```

如果需要单独配置第三方源，可以通过 `hotspot.sources` 覆盖默认源。带鉴权的第三方 API 可使用 `headers`，后端抓取时会带上，公开 `/api/hotspot/sources` 不会泄露 headers。

示例：

```yaml
hotspot:
  sources:
    - platform: weibo
      platform-name: 微博
      url: https://v2.xxapi.cn/api/weibohot
      enabled: true
    - platform: xiaohongshu
      platform-name: 小红书
      url: https://你的第三方服务/小红书热榜
      enabled: true
      headers:
        Authorization: Bearer 你的Token
```

## 你可能需要注册或提供的 API

基础本地展示不强制注册。当前小红书已接入 JustOne API，快手已接入顺为数据，TikHub 小红书热搜词已做本地预留，本地 token/key 写在 Server 的 `application-local.yml`，该文件已被 `.gitignore` 忽略。可复制 Server 的 `application-local.example.yml` 作为本地配置模板。

要补齐腾讯视频，建议选择稳定第三方服务：

- 腾讯视频：可找影视/视频榜单类第三方 API，拿到 JSON 热榜接口后填入 `hotspot.sources`。
- 微博：当前已接入免认证 xxapi 微博热搜；如果后续不稳定，可替换为六派数据、TikHub 等带 key 的源。

注册后需要提供的信息：

- 请求 URL。
- 鉴权方式：例如 `Authorization`、`X-API-Key`、`appkey` 参数。
- 返回 JSON 示例，至少包含标题字段。
- 平台名称和平台标识，例如 `xiaohongshu`、`tencent_video`。

## 数据库

热点数据存入 MySQL `hotspot` 表，主结构来源是 `ThriveX-Server/ThriveX.sql`。运行时 `HotspotSchemaInitializer` 只做本地兼容兜底，不能替代总 SQL。

去重策略：

- `platform + title_hash` 防止同平台同标题重复。
- `platform + link_hash` 防止同平台同链接重复。

## 验收标准

- 后端构建：`mvn -pl blog -am package -DskipTests` 成功。
- 后端日志出现 `startup_hotspot_refresh` 或 `scheduled_hotspot_refresh`，且 `successSources > 0`。
- `/api/hotspot/summary` 返回 `totalItems > 0`。
- MySQL `hotspot` 表有数据。
- Blog `/hotspot` 能展示卡片、平台筛选、刷新时间和统计指标。
- 浏览器检查 1440/768/375 三个宽度没有首屏错位、按钮溢出、关键 Console error 或热点接口 4xx/5xx。
