'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Invalid email or password: ' + error.message)
      setLoading(false)
      return
    }

    if (data?.session) {
      window.location.replace('/')
    } else {
      setError('Login succeeded but no session was created. Please try again.')
      setLoading(false)
    }
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
          <svg width="36" height="36" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="28" height="28" rx="8" fill="#1a1916"/>
            <circle cx="14" cy="14" r="4" fill="none" stroke="#fff" strokeWidth="1.5"/>
            <circle cx="14" cy="6" r="2" fill="#fff"/>
            <circle cx="14" cy="22" r="2" fill="#fff"/>
            <circle cx="6" cy="14" r="2" fill="#fff"/>
            <circle cx="22" cy="14" r="2" fill="#fff"/>
            <line x1="14" y1="8" x2="14" y2="10" stroke="#fff" strokeWidth="1.5"/>
            <line x1="14" y1="18" x2="14" y2="20" stroke="#fff" strokeWidth="1.5"/>
            <line x1="8" y1="14" x2="10" y2="14" stroke="#fff" strokeWidth="1.5"/>
            <line x1="18" y1="14" x2="20" y2="14" stroke="#fff" strokeWidth="1.5"/>
          </svg>
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', fontWeight: 600, color: '#1a1916', lineHeight: 1.2 }}>Nexus Labs</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#a09f9a', lineHeight: 1.4 }}>leads.tracker</div>
          </div>
        </div>

        <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>Sign in</div>
        <div style={{ fontSize: '13px', color: '#6b6a65', marginBottom: '1.75rem' }}>
          Enter your credentials to access the leads dashboard.
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block', fontSize: '11px', color: '#a09f9a',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              marginBottom: '6px', fontFamily: "'DM Mono', monospace",
            }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: '100%', fontSize: '13px', padding: '10px 12px',
                borderRadius: '8px', border: '1px solid rgba(0,0,0,0.18)',
                background: '#f5f4f0', color: '#1a1916', outline: 'none',
                fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block', fontSize: '11px', color: '#a09f9a',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              marginBottom: '6px', fontFamily: "'DM Mono', monospace",
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', fontSize: '13px', padding: '10px 12px',
                borderRadius: '8px', border: '1px solid rgba(0,0,0,0.18)',
                background: '#f5f4f0', color: '#1a1916', outline: 'none',
                fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div style={{
              fontSize: '13px', color: '#8a2020', background: '#fde8e8',
              border: '1px solid #f5b8b8', borderRadius: '8px',
              padding: '10px 12px', marginBottom: '1rem',
            }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '11px', borderRadius: '8px',
              border: 'none', background: '#1a1916', color: '#fff',
              fontSize: '14px', fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              fontFamily: "'DM Sans', sans-serif", transition: 'opacity 0.12s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
