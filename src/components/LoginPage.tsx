import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email to confirm your account, then log in.')
        setMode('login')
      }
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">⚡</div>
          <span className="login-logo-text">AI Audit Matrix</span>
        </div>

        <h1 className="login-heading">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="login-subheading">
          {mode === 'login'
            ? 'Sign in to your opportunity matrix'
            : 'Start auditing AI opportunities'}
        </p>

        {error && <div className="login-error">{error}</div>}
        {message && (
          <div className="login-error" style={{ color: '#4ade80', borderColor: 'rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.08)' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              className="form-input"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? (
              <><span className="spinner" style={{ width: 14, height: 14 }} /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
            ) : (
              mode === 'login' ? 'Sign in' : 'Create account'
            )}
          </button>
        </form>

        <div className="login-toggle">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}
