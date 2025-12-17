import { useState, useEffect } from 'react'
import { Sparkles, Copy, RefreshCw, Check, Settings, X, Cpu, Key, Globe, Box } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'

type Provider = 'openai' | 'gemini' | 'claude'

interface AppSettings {
  provider: Provider
  apiKey: string
  baseUrl: string
  model: string
}

const DEFAULT_SETTINGS: AppSettings = {
  provider: 'openai',
  apiKey: '',
  baseUrl: '',
  model: 'gpt-4o',
}

const PROVIDER_OPTIONS = [
  {
    value: 'openai' as Provider,
    label: 'OpenAI',
    defaultModel: 'gpt-4o',
    placeholder: 'sk-...',
    baseUrlPlaceholder: 'https://api.openai.com/v1',
    baseUrlHint: '示例: https://api.openai.com/v1 或代理地址',
  },
  {
    value: 'gemini' as Provider,
    label: 'Gemini',
    defaultModel: 'gemini-2.0-flash',
    placeholder: 'AIza...',
    baseUrlPlaceholder: 'https://generativelanguage.googleapis.com',
    baseUrlHint: '示例: https://generativelanguage.googleapis.com',
  },
  {
    value: 'claude' as Provider,
    label: 'Claude',
    defaultModel: 'claude-sonnet-4-20250514',
    placeholder: 'sk-ant-...',
    baseUrlPlaceholder: 'https://api.anthropic.com',
    baseUrlHint: '示例: https://api.anthropic.com 或代理地址',
  },
]

const EXAMPLE_ROLES = ['Python 后端工程师', '儿童故事作家', '法律顾问', '数据分析师', '产品经理']

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: AppSettings
  onSave: (s: AppSettings) => void
}

type ProviderConfig = { apiKey: string; baseUrl: string; model: string }

function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings)
  const [providerConfigs, setProviderConfigs] = useState<Record<Provider, ProviderConfig>>(() => {
    const saved = localStorage.getItem('rpg_provider_configs')
    if (saved) {
      try { return JSON.parse(saved) } catch {}
    }
    return PROVIDER_OPTIONS.reduce((acc, p) => {
      acc[p.value] = { apiKey: '', baseUrl: '', model: p.defaultModel }
      return acc
    }, {} as Record<Provider, ProviderConfig>)
  })

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings)
      setProviderConfigs(prev => ({
        ...prev,
        [settings.provider]: { apiKey: settings.apiKey, baseUrl: settings.baseUrl, model: settings.model }
      }))
    }
  }, [isOpen, settings])

  const handleChange = (field: keyof AppSettings, value: string) => {
    if (field === 'provider') {
      setProviderConfigs(prev => {
        const updated = { ...prev, [localSettings.provider]: { apiKey: localSettings.apiKey, baseUrl: localSettings.baseUrl, model: localSettings.model } }
        localStorage.setItem('rpg_provider_configs', JSON.stringify(updated))
        return updated
      })
      const targetConfig = providerConfigs[value as Provider]
      setLocalSettings({ provider: value as Provider, ...targetConfig })
    } else {
      setLocalSettings(prev => ({ ...prev, [field]: value }))
    }
  }

  const currentProvider = PROVIDER_OPTIONS.find(p => p.value === localSettings.provider)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 id="settings-title" className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" aria-hidden="true" />
            API 配置
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="关闭设置"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <fieldset className="space-y-2">
            <legend className="block text-sm font-medium text-slate-700">AI 提供商</legend>
            <div className="grid grid-cols-3 gap-2">
              {PROVIDER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleChange('provider', opt.value)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                    localSettings.provider === opt.value
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200'
                  }`}
                  aria-pressed={localSettings.provider === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2">
            <label htmlFor="model-input" className="block text-sm font-medium text-slate-700 flex items-center gap-2">
              <Box className="w-4 h-4" aria-hidden="true" /> 模型名称
            </label>
            <input
              id="model-input"
              type="text"
              value={localSettings.model}
              onChange={(e) => handleChange('model', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="baseurl-input" className="block text-sm font-medium text-slate-700 flex items-center gap-2">
              <Globe className="w-4 h-4" aria-hidden="true" /> API 地址 (可选)
            </label>
            <input
              id="baseurl-input"
              type="text"
              placeholder={currentProvider?.baseUrlPlaceholder || '留空使用默认地址'}
              value={localSettings.baseUrl}
              onChange={(e) => handleChange('baseUrl', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
            />
            <p className="text-xs text-slate-400">{currentProvider?.baseUrlHint || '留空使用官方默认地址'}</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="apikey-input" className="block text-sm font-medium text-slate-700 flex items-center gap-2">
              <Key className="w-4 h-4" aria-hidden="true" /> API Key
            </label>
            <input
              id="apikey-input"
              type="password"
              placeholder={currentProvider?.placeholder || 'API Key'}
              value={localSettings.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono text-sm"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={() => { onSave(localSettings); onClose() }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all text-sm font-medium cursor-pointer"
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('rpg_settings')
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch {
        setIsSettingsOpen(true)
      }
    } else {
      setIsSettingsOpen(true)
    }
  }, [])

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings)
    localStorage.setItem('rpg_settings', JSON.stringify(newSettings))
  }

  const handleGenerate = async () => {
    if (!input.trim()) return
    if (!settings.apiKey) {
      setIsSettingsOpen(true)
      return
    }

    setIsLoading(true)
    setResult('')
    setError('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role_input: input,
          provider: settings.provider,
          api_key: settings.apiKey,
          base_url: settings.baseUrl || undefined,
          model: settings.model,
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || `请求失败: ${response.status}`)
      }

      const data = await response.json()
      setResult(data.prompt)
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentProviderLabel = PROVIDER_OPTIONS.find(p => p.value === settings.provider)?.label

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      <div className="w-full max-w-3xl space-y-8 relative">
        <div className="absolute top-0 right-0">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200 hover:shadow-sm cursor-pointer"
            aria-label="打开 API 设置"
          >
            <Settings className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        <header className="text-center space-y-3 pt-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-2">
            <Sparkles className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            角色提示词生成器
          </h1>
          <p className="text-slate-500 text-lg max-w-lg mx-auto">
            输入角色名称或用途，生成专业的 AI System Prompt
          </p>
        </header>

        <main>
          <div className="bg-white rounded-2xl shadow-xl p-2 transition-all duration-300 hover:shadow-2xl border border-slate-100">
            <div className="flex flex-col sm:flex-row gap-2 p-2">
              <label htmlFor="role-input" className="sr-only">角色名称或用途</label>
              <input
                id="role-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleGenerate()}
                placeholder="输入角色，例如：Python 资深后端工程师、儿童故事作家..."
                className="flex-1 px-4 py-3 rounded-xl bg-transparent focus:bg-slate-50 outline-none transition-all text-lg placeholder:text-slate-400 border-none"
                autoFocus
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 min-w-[140px] shadow-md cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" aria-hidden="true" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" aria-hidden="true" />
                    生成提示词
                  </>
                )}
              </button>
            </div>

            <div className="px-4 pb-2 pt-0 flex items-center gap-2 text-xs text-slate-400">
              <Cpu className="w-3 h-3" aria-hidden="true" />
              <span>当前模型: {settings.model} ({currentProviderLabel})</span>
            </div>
          </div>

          {!result && !error && (
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400 mb-3">快速开始：</p>
              <div className="flex flex-wrap justify-center gap-2">
                {EXAMPLE_ROLES.map((role) => (
                  <button
                    key={role}
                    onClick={() => setInput(role)}
                    className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-full text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all cursor-pointer"
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-fade-in" role="alert">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-6 animate-slide-up">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50/80 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true"></span>
                    <h2 className="font-semibold text-slate-700">生成结果</h2>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="group px-3 py-1.5 hover:bg-white rounded-lg transition-all text-slate-500 hover:text-indigo-600 flex items-center gap-2 text-sm font-medium border border-transparent hover:border-slate-200 hover:shadow-sm cursor-pointer"
                    aria-label={copied ? '已复制到剪贴板' : '复制 Markdown 到剪贴板'}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" aria-hidden="true" />
                        <span className="text-green-600">已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
                        复制 Markdown
                      </>
                    )}
                  </button>
                </div>
                <div className="p-6 bg-slate-50/30 max-h-[600px] overflow-y-auto">
                  <article className="prose prose-slate prose-sm max-w-none">
                    <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{result}</ReactMarkdown>
                  </article>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
