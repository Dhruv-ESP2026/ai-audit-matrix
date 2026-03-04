import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import LoginPage from './components/LoginPage'
import Matrix from './components/Matrix'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="loading-screen">
        <span className="spinner" />
        Loading…
      </div>
    )
  }

  if (!user) return <LoginPage />

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-left">
          <div className="topbar-logo">⚡</div>
          <span className="topbar-title">AI Opportunity Audit Matrix</span>
        </div>
        <div className="topbar-right">
          <span className="topbar-email">{user.email}</span>
          <button
            className="btn btn-secondary"
            style={{ fontSize: 13, padding: '6px 14px' }}
            onClick={() => supabase.auth.signOut()}
          >
            Sign out
          </button>
        </div>
      </header>
      <Matrix userId={user.id} />
    </div>
  )
}
