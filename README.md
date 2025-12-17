# Role Prompt Generation

AI 角色提示词生成器，支持多种 AI 提供商，生成具有防注入能力的专业角色提示词。

## 功能特性

- 支持 OpenAI、Claude、Gemini 多种 AI 提供商
- 生成结构化、专业的角色提示词
- 内置防注入安全机制
- 支持自定义 API Base URL

## 技术栈

**Frontend:** React 19 + Vite + Tailwind CSS
**Backend:** FastAPI + Python 3.12

## 快速开始

### 本地开发

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

### Docker 部署

```bash
# 拉取镜像
docker pull ghcr.io/<username>/role-prompt-generation-backend:main
docker pull ghcr.io/<username>/role-prompt-generation-frontend:main

# 运行
docker run -d -p 8000:8000 ghcr.io/<username>/role-prompt-generation-backend:main
docker run -d -p 80:80 ghcr.io/<username>/role-prompt-generation-frontend:main
```

## API

### POST /api/generate

生成角色提示词。

**Request Body:**
```json
{
  "role_input": "翻译专家",
  "provider": "openai",
  "api_key": "sk-xxx",
  "model": "gpt-4",
  "base_url": "https://api.openai.com/v1"
}
```

**Response:**
```json
{
  "prompt": "生成的角色提示词..."
}
```

## License

MIT
