import { useEffect, useState } from 'react'
import { AlertCircle, Check, KeyRound, Loader2, Shield } from 'lucide-react'
import { WORKER_URL, authHeaders } from '@/lib/adminApi'

interface AdminSecurityProps {
  password: string
}

type SetupState = {
  secret: string
  otpauthUrl: string
  qrUrl: string
  recoveryCodes: string[]
} | null

export function AdminSecurity({ password }: AdminSecurityProps) {
  const [enabled, setEnabled] = useState(false)
  const [recoveryRemaining, setRecoveryRemaining] = useState(0)
  const [legacyEnvSecret, setLegacyEnvSecret] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [setup, setSetup] = useState<SetupState>(null)
  const [confirmCode, setConfirmCode] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [disableMode, setDisableMode] = useState<'totp' | 'recovery'>('totp')
  const [freshRecoveryCodes, setFreshRecoveryCodes] = useState<string[] | null>(null)

  async function refreshStatus() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${WORKER_URL}/api/totp/status`, {
        headers: authHeaders(password),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '加载失败')
      setEnabled(Boolean(data.enabled))
      setRecoveryRemaining(data.recoveryCodesRemaining || 0)
      setLegacyEnvSecret(Boolean(data.legacyEnvSecret))
    } catch (err: any) {
      setError(err.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshStatus()
  }, [password])

  async function startSetup() {
    setBusy(true)
    setError('')
    setMessage('')
    setFreshRecoveryCodes(null)
    try {
      const res = await fetch(`${WORKER_URL}/api/totp/setup`, {
        method: 'POST',
        headers: authHeaders(password, true),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '开始设置失败')
      setSetup({
        secret: data.secret,
        otpauthUrl: data.otpauthUrl,
        qrUrl: data.qrUrl,
        recoveryCodes: data.recoveryCodes || [],
      })
      setConfirmCode('')
    } catch (err: any) {
      setError(err.message || '开始设置失败')
    } finally {
      setBusy(false)
    }
  }

  async function confirmEnable() {
    if (confirmCode.length !== 6) {
      setError('请输入验证器中的 6 位验证码')
      return
    }
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`${WORKER_URL}/api/totp/enable`, {
        method: 'POST',
        headers: authHeaders(password, true),
        body: JSON.stringify({ code: confirmCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '启用失败')
      setFreshRecoveryCodes(setup?.recoveryCodes || null)
      setSetup(null)
      setMessage('两步验证已启用。请立刻保存恢复码，丢失验证器时可用它登录。')
      await refreshStatus()
    } catch (err: any) {
      setError(err.message || '启用失败')
    } finally {
      setBusy(false)
    }
  }

  async function disableTotp() {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const body =
        disableMode === 'recovery'
          ? { recoveryCode: disableCode }
          : { code: disableCode }
      const res = await fetch(`${WORKER_URL}/api/totp/disable`, {
        method: 'POST',
        headers: authHeaders(password, true),
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '关闭失败')
      setDisableCode('')
      setFreshRecoveryCodes(null)
      setMessage('两步验证已关闭')
      await refreshStatus()
    } catch (err: any) {
      setError(err.message || '关闭失败')
    } finally {
      setBusy(false)
    }
  }

  async function regenerateRecovery() {
    const code = window.prompt('请输入当前 6 位验证码以重新生成恢复码')
    if (!code) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch(`${WORKER_URL}/api/totp/regenerate-recovery`, {
        method: 'POST',
        headers: authHeaders(password, true),
        body: JSON.stringify({ code: code.replace(/\D/g, '') }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '重新生成失败')
      setFreshRecoveryCodes(data.recoveryCodes || [])
      setMessage('已生成新的恢复码（旧恢复码全部失效）')
      await refreshStatus()
    } catch (err: any) {
      setError(err.message || '重新生成失败')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        加载安全设置…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">安全设置</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          在前端启用两步验证（验证器 6 位动态码），并生成丢失时可用的恢复码。
        </p>
      </div>

      <div className="rounded-lg border bg-card p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <div className="font-medium">两步验证（TOTP）</div>
              <div className="mt-1 text-sm text-muted-foreground">
                状态：{enabled ? (
                  <span className="text-green-600">已启用</span>
                ) : (
                  <span>未启用</span>
                )}
                {enabled && (
                  <span className="ml-2">· 剩余恢复码 {recoveryRemaining} 个</span>
                )}
              </div>
              {legacyEnvSecret && (
                <p className="mt-2 text-xs text-orange-600">
                  当前生效的是 Cloudflare Secret `ADMIN_TOTP_SECRET`。若要改用前端配置/恢复码，请先在 Dashboard 删除该 Secret，再在这里重新启用。
                </p>
              )}
            </div>
          </div>

          {!enabled && !setup && !legacyEnvSecret && (
            <button
              type="button"
              disabled={busy}
              onClick={startSetup}
              className="shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              启用
            </button>
          )}
        </div>

        {setup && (
          <div className="space-y-4 rounded-lg border bg-background p-4">
            <p className="text-sm font-medium">1. 用验证器扫码（或手动输入密钥）</p>
            <div className="flex flex-col items-start gap-3 sm:flex-row">
              <img src={setup.qrUrl} alt="TOTP QR" className="h-40 w-40 rounded border bg-white p-2" />
              <div className="text-xs text-muted-foreground break-all">
                <div className="mb-1 font-medium text-foreground">手动密钥</div>
                <code className="rounded bg-muted px-2 py-1">{setup.secret}</code>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">2. 保存恢复码（只显示一次）</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {setup.recoveryCodes.map((c) => (
                  <code key={c} className="rounded border bg-muted px-2 py-1 text-center text-xs">
                    {c}
                  </code>
                ))}
              </div>
              <button
                type="button"
                className="mt-2 text-xs text-primary hover:underline"
                onClick={() => navigator.clipboard.writeText(setup.recoveryCodes.join('\n'))}
              >
                复制全部恢复码
              </button>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">3. 输入验证器中的 6 位码以确认启用</p>
              <div className="flex gap-2">
                <input
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  inputMode="numeric"
                  className="w-40 rounded-lg border bg-background px-3 py-2 text-center tracking-[0.3em]"
                  placeholder="••••••"
                />
                <button
                  type="button"
                  disabled={busy || confirmCode.length !== 6}
                  onClick={confirmEnable}
                  className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  确认启用
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setSetup(null)}
                  className="rounded-lg border px-3 py-2 text-sm text-muted-foreground"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {enabled && !legacyEnvSecret && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={regenerateRecovery}
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
              >
                <KeyRound className="h-4 w-4" />
                重新生成恢复码
              </button>
            </div>

            <div className="rounded-lg border bg-background p-4 space-y-3">
              <p className="text-sm font-medium">关闭两步验证</p>
              <div className="inline-flex rounded-lg border p-1">
                <button
                  type="button"
                  onClick={() => setDisableMode('totp')}
                  className={`rounded-md px-3 py-1.5 text-xs ${disableMode === 'totp' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                >
                  验证码
                </button>
                <button
                  type="button"
                  onClick={() => setDisableMode('recovery')}
                  className={`rounded-md px-3 py-1.5 text-xs ${disableMode === 'recovery' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                >
                  恢复码
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  value={disableCode}
                  onChange={(e) => setDisableCode(
                    disableMode === 'totp'
                      ? e.target.value.replace(/\D/g, '').slice(0, 6)
                      : e.target.value.toUpperCase(),
                  )}
                  className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder={disableMode === 'totp' ? '6 位验证码' : '如 ABCD-EFGH'}
                />
                <button
                  type="button"
                  disabled={busy || !disableCode}
                  onClick={disableTotp}
                  className="rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-500 disabled:opacity-50"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {freshRecoveryCodes && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-green-700">
            <Check className="h-4 w-4" />
            请立即保存这些恢复码（只显示一次）
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {freshRecoveryCodes.map((c) => (
              <code key={c} className="rounded border bg-background px-2 py-1 text-center text-xs">
                {c}
              </code>
            ))}
          </div>
          <button
            type="button"
            className="mt-2 text-xs text-primary hover:underline"
            onClick={() => navigator.clipboard.writeText(freshRecoveryCodes.join('\n'))}
          >
            复制全部
          </button>
        </div>
      )}

      {message && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Check className="h-4 w-4" />
          {message}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  )
}
