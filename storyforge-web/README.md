# StoryForge Web

React + Vite 前端应用，对接当前仓库中的 Spring Boot 后端单体，覆盖本轮 MVP 的已实现能力：

- 登录 / 注册 / 当前用户信息
- 项目 CRUD 与项目工作区
- 世界设定、角色、角色关系、剧情大纲
- 章节 CRUD、审核发布、版本历史
- 风格约束
- 世界模板 CRUD
- 模板下世界设定
- 从项目生成模板、把模板应用到项目

## 本地启动

### 1. 启动后端

在仓库根目录执行：

```bash
mvn -pl storyforge-app spring-boot:run
```

默认后端地址：

- API: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui.html`
- OpenAPI: `http://localhost:8080/v3/api-docs`

### 2. 启动前端

在仓库根目录执行：

```bash
npm --prefix storyforge-web install
npm --prefix storyforge-web run dev
```

默认前端地址：

- `http://localhost:5173`

## 环境变量

开发环境配置文件：`storyforge-web/.env.development`

当前默认值：

```env
VITE_API_BASE_URL=http://localhost:8080
```

如需切换联调后端地址，只需要修改这个值即可。

## 注册联调说明

当前开发环境后端已启用固定邮箱验证码：

- 默认验证码：`123456`
- 配置位置：`storyforge-app/src/main/resources/application-dev.yml`
- 可通过环境变量 `DEV_FIXED_REGISTER_EMAIL_CODE` 覆盖

注册流程：

1. 先获取注册图形验证码
2. 再发送邮箱验证码
3. 在注册表单中填写固定邮箱验证码
4. 注册成功后自动登录

## 常用脚本

```bash
npm --prefix storyforge-web run dev
npm --prefix storyforge-web run build
npm --prefix storyforge-web run lint
npm --prefix storyforge-web run test
```

## 路由说明

### 公共路由

- `/login`
- `/register`

### 业务路由

- `/projects`
- `/projects/:projectId/overview`
- `/projects/:projectId/world-settings`
- `/projects/:projectId/characters`
- `/projects/:projectId/character-relations`
- `/projects/:projectId/outlines`
- `/projects/:projectId/chapters`
- `/projects/:projectId/chapters/:chapterId/versions`
- `/projects/:projectId/style-constraint`
- `/world-templates`
- `/world-templates/:templateId/overview`
- `/world-templates/:templateId/world-settings`
- `/me`

## 已知说明

- 当前已做路由级懒加载，生产构建体积已比一次性全量打包更友好。
- Ant Design 仍然占据较大体积，构建时可能仍有 chunk size warning，但不影响功能使用。
- AI 章节生成、上传、忘记密码、模板市场、章节版本恢复仍不在本轮范围内。
