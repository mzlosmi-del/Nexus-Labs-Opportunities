'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f4f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.10)',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        width: '100%',
        maxWidth: '380px',
      }}>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '15px',
          fontWeight: 500,
          marginBottom: '2rem',
          color: '#1a1916',
        }}>
          leads<span style={{ color: '#a09f9a' }}>.tracker</span>
        </div>

        <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Sign in</div>
        <div style={{ fontSize: '13px', color: '#6b6a65', marginBottom: '1.75rem' }}>
          Enter your credentials to access the leads dashboard.
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              color: '#a09f9a',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '6px',
              fontFamily: "'DM Mono', monospace",
            }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: '100%',
                fontSize: '13px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.18)',
                background: '#f5f4f0',
                color: '#1a1916',
                outline: 'none',
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              color: '#a09f9a',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '6px',
              fontFamily: "'DM Mono', monospace",
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                fontSize: '13px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.18)',
                background: '#f5f4f0',
                color: '#1a1916',
                outline: 'none',
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div style={{
              fontSize: '13px',
              color: '#8a2020',
              background: '#fde8e8',
              border: '1px solid #f5b8b8',
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '1rem',
            }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '8px',
              border: 'none',
              background: '#1a1916',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              fontFamily: "'DM Sans', sans-serif",
              transition: 'opacity 0.12s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
