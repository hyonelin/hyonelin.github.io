import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertCircle, Shield, Camera, NotebookPen, Lock } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { usePageTitle } from '@/hooks/usePageTitle'
import { WORKER_URL, TURNSTILE_SITE_KEY } from '@/lib/adminApi'
import { AdminPhotos } from '@/pages/admin/AdminPhotos'
import { AdminPosts } from '@/pages/admin/AdminPosts'
import { AdminSecurity } from '@/pages/admin/AdminSecurity'

declare global {
  interface Window {
    turnstile?: { reset: () => void }
    onTurnstileSuccess?: (token: string) => void
    onTurnstileExpired?: () => void
  }
}

type AdminTab = 'photos' | 'posts' | 'security'
type AuthStep = 'password' | 'totp'
type TotpInputMode = 'totp' | 'recovery' | 'breakglass'

export function Admin() {
  usePageTitle('pageTitle.admin')

  const [password, setPassword] = useState('')
  const [authStep, setAuthStep] = useState<AuthStep>('password')
  const [pendingToken, setPendingToken] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [totpInputMode, setTotpInputMode] = useState<TotpInputMode>('totp')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [tab, setTab] = useState<AdminTab>('photos')
  const totpInputRef = useRef<HTMLInputElement>(null)

  const [rateLimitInfo, setRateLimitInfo] = useState({
    attempts: 0,
    requireTurnstile: false,
    isLocked: false,
    lockedUntil: null as number | null,
    delay: 0,
  })
  const [lockdownCountdown, setLockdownCountdown] = useState(0)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileLoaded, setTurnstileLoaded] = useState(false)

  useEffect(() => {
    if (!rateLimitInfo.lockedUntil) {
      setLockdownCountdown(0)
      return
    }
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((rateLimitInfo.lockedUntil! - Date.now()) / 1000))
      setLockdownCountdown(remaining)
      if (remaining <= 0) {
        setRateLimitInfo((prev) => ({
          ...prev,
          isLocked: false,
          lockedUntil: null,
          attempts: 0,
          requireTurnstile: false,
        }))
      }
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [rateLimitInfo.lockedUntil])

  useEffect(() => {
    fetch(`${WORKER_URL}/api/rate-limit`)
      .then((res) => res.json())
      .then((data) => {
        setRateLimitInfo({
          attempts: data.attempts || 0,
          requireTurnstile: data.requireTurnstile || false,
          isLocked: data.isLocked || false,
          lockedUntil: data.lockedUntil || null,
          delay: data.delay || 0,
        })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    window.onTurnstileSuccess = (token: string) => setTurnstileToken(token)
    window.onTurnstileExpired = () => setTurnstileToken('')

    if (!document.querySelector('script[src*="turnstile"]')) {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.onload = () => setTurnstileLoaded(true)
      document.body.appendChild(script)
    } else {
      setTurnstileLoaded(true)
    }

    return () => {
      delete window.onTurnstileSuccess
      delete window.onTurnstileExpired
    }
  }, [])

  useEffect(() => {
    if (authStep === 'totp') {
      totpInputRef.current?.focus()
    }
  }, [authStep])

  const applyRateLimitFromError = (data: any) => {
    if (data.attempts !== undefined) {
      setRateLimitInfo((prev) => ({
        ...prev,
        attempts: data.attempts,
        requireTurnstile: data.requireTurnstile || false,
        delay: data.delay || 0,
        isLocked: Boolean(data.lockedUntil),
        lockedUntil: data.lockedUntil || null,
      }))
    }
  }

  const handleVerifyPassword = async () => {
    if (rateLimitInfo.isLocked) {
      setAuthError(`账户已锁定，请 ${lockdownCountdown} 秒后重试`)
      return
    }
    if (rateLimitInfo.requireTurnstile && !turnstileToken) {
      setAuthError('请完成人机验证')
      return
    }

    setAuthLoading(true)
    setAuthError('')
    try {
      const response = await fetch(`${WORKER_URL}/api/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          turnstileToken: rateLimitInfo.requireTurnstile ? turnstileToken : undefined,
        }),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        if (data.requireTotp) {
          setPendingToken(data.pendingToken || '')
          setTotpCode('')
          setAuthStep('totp')
        } else {
          setIsAuthenticated(true)
        }
      } else {
        setAuthError(data.error || '密码错误')
        applyRateLimitFromError(data)
        setTurnstileToken('')
        if (window.turnstile && rateLimitInfo.requireTurnstile) window.turnstile.reset()
      }
    } catch {
      setAuthError('连接失败，请检查网络或 Worker URL')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleVerifyTotp = async (codeOverride?: string) => {
    if (rateLimitInfo.isLocked) {
      setAuthError(`账户已锁定，请 ${lockdownCountdown} 秒后重试`)
      return
    }

    const raw = (codeOverride ?? totpCode).trim()
    const body =
      totpInputMode === 'recovery'
        ? { pendingToken, recoveryCode: raw }
        : totpInputMode === 'breakglass'
          ? { pendingToken, breakglass: raw }
          : { pendingToken, code: raw.replace(/\D/g, '') }

    if (totpInputMode === 'totp' && body.code!.length !== 6) {
      setAuthError('请输入 6 位验证码')
      return
    }
    if (totpInputMode === 'recovery' && !raw) {
      setAuthError('请输入恢复码')
      return
    }
    if (totpInputMode === 'breakglass' && !raw) {
      setAuthError('请输入紧急重置码')
      return
    }

    setAuthLoading(true)
    setAuthError('')
    try {
      const response = await fetch(`${WORKER_URL}/api/verify-totp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setIsAuthenticated(true)
        if (data.totpDisabled || data.usedBreakglass) {
          setAuthStep('password')
          setPendingToken('')
        }
      } else {
        setAuthError(data.error || '验证失败')
        applyRateLimitFromError(data)
        setTotpCode('')
        if (typeof data.error === 'string' && data.error.includes('过期')) {
          setAuthStep('password')
          setPendingToken('')
        }
      }
    } catch {
      setAuthError('连接失败，请检查网络或 Worker URL')
    } finally {
      setAuthLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="relative min-h-screen bg-background px-6 py-12 sm:py-24">
        <div className="mx-auto max-w-md">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>

          <div className="rounded-lg border bg-card p-6">
            <h1 className="text-2xl font-bold">管理后台</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {authStep === 'password'
                ? '上传照片、编辑博客文章'
                : totpInputMode === 'totp'
                  ? '请输入验证器中的 6 位动态码'
                  : totpInputMode === 'recovery'
                    ? '验证器不可用时，可使用一次性恢复码'
                    : '验证器与恢复码都丢失时，使用 Cloudflare 紧急重置码（会关闭两步验证）'}
            </p>

            {rateLimitInfo.attempts > 0 && !rateLimitInfo.isLocked && !rateLimitInfo.requireTurnstile && (
              <div className="mt-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-600">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  已尝试 {rateLimitInfo.attempts} 次，还剩 {Math.max(0, 3 - rateLimitInfo.attempts)} 次机会
                </div>
              </div>
            )}

            {rateLimitInfo.requireTurnstile && !rateLimitInfo.isLocked && authStep === 'password' && (
              <div className="mt-4 rounded-lg border border-orange-500/50 bg-orange-500/10 p-3 text-sm text-orange-600">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  请完成人机验证后继续
                </div>
              </div>
            )}

            {rateLimitInfo.isLocked && (
              <div className="mt-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-500">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  账户已锁定，请 <span className="font-bold">{lockdownCountdown}</span> 秒后重试
                </div>
              </div>
            )}

            <div className="mt-6 space-y-4">
              {authStep === 'password' ? (
                <>
                  <div>
                    <label className="text-sm font-medium">密码</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()}
                      className="mt-1 w-full rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="输入管理密码"
                      disabled={rateLimitInfo.isLocked}
                    />
                  </div>

                  {rateLimitInfo.requireTurnstile && !rateLimitInfo.isLocked && (
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <Shield className="h-4 w-4" />
                        人机验证
                      </label>
                      <div
                        className="cf-turnstile"
                        data-sitekey={TURNSTILE_SITE_KEY}
                        data-theme="light"
                        data-callback="onTurnstileSuccess"
                        data-expired-callback="onTurnstileExpired"
                      />
                      {!turnstileLoaded && (
                        <div className="text-xs text-muted-foreground">加载验证组件…</div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <div className="mb-2 inline-flex flex-wrap rounded-lg border p-1">
                    <button
                      type="button"
                      onClick={() => { setTotpInputMode('totp'); setTotpCode(''); setAuthError('') }}
                      className={`rounded-md px-3 py-1.5 text-xs ${totpInputMode === 'totp' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                    >
                      验证码
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTotpInputMode('recovery'); setTotpCode(''); setAuthError('') }}
                      className={`rounded-md px-3 py-1.5 text-xs ${totpInputMode === 'recovery' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                    >
                      恢复码
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTotpInputMode('breakglass'); setTotpCode(''); setAuthError('') }}
                      className={`rounded-md px-3 py-1.5 text-xs ${totpInputMode === 'breakglass' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                    >
                      紧急重置
                    </button>
                  </div>
                  <label className="text-sm font-medium">
                    {totpInputMode === 'totp' ? '两步验证码' : totpInputMode === 'recovery' ? '恢复码' : '紧急重置码'}
                  </label>
                  <input
                    ref={totpInputRef}
                    type="text"
                    inputMode={totpInputMode === 'totp' ? 'numeric' : 'text'}
                    autoComplete={totpInputMode === 'totp' ? 'one-time-code' : 'off'}
                    maxLength={totpInputMode === 'totp' ? 6 : 128}
                    value={totpCode}
                    onChange={(e) => {
                      if (totpInputMode === 'totp') {
                        const next = e.target.value.replace(/\D/g, '').slice(0, 6)
                        setTotpCode(next)
                        if (next.length === 6) handleVerifyTotp(next)
                      } else if (totpInputMode === 'recovery') {
                        setTotpCode(e.target.value.toUpperCase())
                      } else {
                        setTotpCode(e.target.value)
                      }
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyTotp()}
                    className={`mt-1 w-full rounded-lg border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary ${
                      totpInputMode === 'totp'
                        ? 'text-center text-2xl font-semibold tracking-[0.35em]'
                        : 'text-center text-sm tracking-wider'
                    }`}
                    placeholder={
                      totpInputMode === 'totp'
                        ? '••••••'
                        : totpInputMode === 'recovery'
                          ? 'ABCD-EFGH'
                          : 'Cloudflare Secret: ADMIN_2FA_BREAKGLASS'
                    }
                    disabled={rateLimitInfo.isLocked || authLoading}
                  />
                  {totpInputMode === 'breakglass' && (
                    <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
                      成功后会关闭两步验证并进入后台。若未配置紧急码，也可在 Cloudflare 删除 KV 键 <code className="rounded bg-muted px-1">admin_totp:config</code>。
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthStep('password')
                      setPendingToken('')
                      setTotpCode('')
                      setTotpInputMode('totp')
                      setAuthError('')
                    }}
                    className="mt-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    ← 返回重新输入密码
                  </button>
                </div>
              )}

              {authError && (
                <div className="flex items-center gap-2 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  {authError}
                </div>
              )}

              <button
                onClick={() => (authStep === 'password' ? handleVerifyPassword() : handleVerifyTotp())}
                disabled={
                  authLoading ||
                  rateLimitInfo.isLocked ||
                  (authStep === 'password'
                    ? !password || (rateLimitInfo.requireTurnstile && !turnstileToken)
                    : totpInputMode === 'totp'
                      ? totpCode.length !== 6
                      : !totpCode.trim())
                }
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {authLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    验证中…
                  </span>
                ) : rateLimitInfo.isLocked ? (
                  '账户已锁定'
                ) : authStep === 'password' ? (
                  '下一步'
                ) : (
                  '验证并进入'
                )}
              </button>
            </div>
          </div>
        </div>
        <Navbar />
      </main>
    )
  }

  return (
    <main className="relative min-h-screen bg-background px-6 py-12 sm:py-24">
      <div className="mx-auto max-w-4xl pb-24">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">管理后台</h1>
          <p className="mt-2 text-muted-foreground">照片上传到 R2，文章也可在线编辑并插图</p>
        </div>

        <div className="mb-8 inline-flex rounded-lg border p-1">
          <button
            type="button"
            onClick={() => setTab('photos')}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm ${
              tab === 'photos' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Camera className="h-4 w-4" />
            照片
          </button>
          <button
            type="button"
            onClick={() => setTab('posts')}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm ${
              tab === 'posts' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <NotebookPen className="h-4 w-4" />
            文章
          </button>
          <button
            type="button"
            onClick={() => setTab('security')}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm ${
              tab === 'security' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Lock className="h-4 w-4" />
            安全
          </button>
        </div>

        {tab === 'photos' ? (
          <AdminPhotos password={password} />
        ) : tab === 'posts' ? (
          <AdminPosts password={password} />
        ) : (
          <AdminSecurity password={password} />
        )}
      </div>
      <Navbar />
    </main>
  )
}
