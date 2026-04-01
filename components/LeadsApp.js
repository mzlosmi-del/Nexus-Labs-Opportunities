'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

// ── constants ────────────────────────────────────────────────────────────────

const STATUSES = ['new', 'contacted', 'interested', 'proposal', 'closed', 'lost']
const STATUS_LABELS = {
  new: 'New', contacted: 'Contacted', interested: 'Interested',
  proposal: 'Proposal sent', closed: 'Closed (won)', lost: 'Lost',
}
const CONTACT_LABEL = { phone: 'Phone', email: 'Email', sms: 'SMS' }
const CONTACT_CLS   = { phone: 'on-phone', email: 'on-email', sms: 'on-sms' }
const CONTACT_PILL  = { phone: 'pill-phone', email: 'pill-email', sms: 'pill-sms' }
const MSG_CLS       = { viber: 'on-viber', whatsapp: 'on-whatsapp' }

const EMPTY_FORM = {
  name: '', contact: '', sector: '',
  phone: '', email: '', website: '',
  messaging: [], preferred_contact: [],
  last_contact: '',
  status: 'new', assignee: 'Milos',
  pitch: '', notes: '',
}

// ── helpers ──────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10)
}

function daysSince(dateStr) {
  if (!dateStr) return null
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function formatLastContact(dateStr) {
  const d = daysSince(dateStr)
  if (d === null) return null
  if (d === 0) return 'Contacted today'
  if (d === 1) return 'Contacted yesterday'
  if (d < 7)  return `Contacted ${d} days ago`
  return 'Last contact: ' + new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function msgPillClass(msgs) {
  const s = new Set(msgs)
  if (s.has('viber') && s.has('whatsapp')) return 'both'
  if (s.has('viber'))     return 'viber'
  if (s.has('whatsapp'))  return 'whatsapp'
  return null
}

// ── sub-components ───────────────────────────────────────────────────────────

function ToggleBtn({ label, active, cls, onClick }) {
  return (
    <button className={`toggle-btn${active ? ` ${cls}` : ''}`} onClick={onClick} type="button">
      {label}
    </button>
  )
}

function ExpandableText({ text, className, maxWidth }) {
  const [expanded, setExpanded] = useState(false)
  if (!text) return null
  return (
    <div
      className={className}
      style={{ maxWidth: expanded ? 'none' : maxWidth, whiteSpace: expanded ? 'normal' : 'nowrap', overflow: expanded ? 'visible' : 'hidden', textOverflow: expanded ? 'unset' : 'ellipsis', cursor: 'zoom-in', userSelect: 'none' }}
      onDoubleClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
      title={expanded ? 'Double-click to collapse' : 'Double-click to expand'}
    >
      {text}
    </div>
  )
}

function LeadCard({ lead, onClick }) {
  const lcLabel = formatLastContact(lead.last_contact)
  const stale   = lead.last_contact && daysSince(lead.last_contact) > 7
  const msgCls  = msgPillClass(lead.messaging || [])

  return (
    <div className="lead-card" onClick={onClick}>
      <div>
        <div className="lead-name">{lead.name}</div>
        <div className="lead-sub">
          {[lead.sector, lead.contact].filter(Boolean).join(' · ')}
        </div>

        {(lead.phone || lead.email || lead.website) && (
          <div className="lead-contacts">
            {lead.phone && <span>📞 {lead.phone}</span>}
            {lead.email && <span>✉ {lead.email}</span>}
            {lead.website && <span>🌐 {lead.website}</span>}
          </div>
        )}

        {((lead.preferred_contact?.length > 0) || msgCls) && (
          <div className="lead-pills">
            {(lead.preferred_contact || []).map(v => (
              <span key={v} className={`pill ${CONTACT_PILL[v]}`}>{CONTACT_LABEL[v]}</span>
            ))}
            {msgCls === 'viber'    && <span className="pill pill-viber">Viber</span>}
            {msgCls === 'whatsapp' && <span className="pill pill-whatsapp">WhatsApp</span>}
            {msgCls === 'both'     && <span className="pill pill-both">Viber + WhatsApp</span>}
          </div>
        )}

        {lcLabel && (
          <div className={`lead-last${stale ? ' stale' : ''}`}>{lcLabel}</div>
        )}

        {lead.pitch && (
          <ExpandableText text={lead.pitch} className="lead-pitch" maxWidth="440px" />
        )}
        {lead.notes && (
          <ExpandableText text={lead.notes} className="lead-pitch" maxWidth="440px" />
        )}
      </div>

      <div className="lead-right">
        <span className={`badge badge-${lead.status}`}>{STATUS_LABELS[lead.status]}</span>
        <span className="lead-assignee">{lead.assignee}</span>
      </div>
    </div>
  )
}

function Modal({ lead, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(lead ? { ...EMPTY_FORM, ...lead } : { ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const toggleArr = (key, val) =>
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val],
    }))

  const handleSave = async () => {
    if (!form.name.trim()) { alert('Business name is required.'); return }
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{lead ? 'Edit lead' : 'Add lead'}</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div className="field">
          <label className="field-label">Business name *</label>
          <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Pekara Žitko" />
        </div>

        <div className="field-row">
          <div className="field">
            <label className="field-label">Contact person</label>
            <input type="text" value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="Name" />
          </div>
          <div className="field">
            <label className="field-label">Sector</label>
            <input type="text" value={form.sector} onChange={e => set('sector', e.target.value)} placeholder="e.g. Catering" />
          </div>
        </div>

        <div className="section-sep">Contact details</div>

        <div className="field-row">
          <div className="field">
            <label className="field-label">Phone number</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+381 64 ..." />
          </div>
          <div className="field">
            <label className="field-label">Email address</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="name@example.com" />
          </div>
        </div>

        <div className="field">
          <label className="field-label">Website</label>
          <input type="text" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://example.com" />
        </div>

        <div className="field">
          <label className="field-label">Preferred contact</label>
          <div className="toggle-group">
            {['phone', 'email', 'sms'].map(v => (
              <ToggleBtn key={v} label={CONTACT_LABEL[v]}
                active={form.preferred_contact.includes(v)}
                cls={CONTACT_CLS[v]}
                onClick={() => toggleArr('preferred_contact', v)} />
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label">Messaging apps</label>
          <div className="toggle-group">
            {['viber', 'whatsapp'].map(v => (
              <ToggleBtn key={v} label={v === 'viber' ? 'Viber' : 'WhatsApp'}
                active={form.messaging.includes(v)}
                cls={MSG_CLS[v]}
                onClick={() => toggleArr('messaging', v)} />
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label">Last contacted</label>
          <div className="date-row">
            <input type="date" value={form.last_contact} onChange={e => set('last_contact', e.target.value)} />
            <button className="btn-today" type="button" onClick={() => set('last_contact', today())}>Today</button>
          </div>
        </div>

        <div className="section-sep">Pipeline</div>

        <div className="field-row">
          <div className="field">
            <label className="field-label">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Assigned to</label>
            <select value={form.assignee} onChange={e => set('assignee', e.target.value)}>
              <option value="Milos">Milos</option>
              <option value="Milenko">Milenko</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label className="field-label">Pitch used</label>
          <textarea value={form.pitch} onChange={e => set('pitch', e.target.value)} placeholder="Describe the pitch or paste your outreach message..." />
        </div>

        <div className="field">
          <label className="field-label">Notes</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any extra context..." style={{ minHeight: '56px' }} />
        </div>

        <div className="modal-footer">
          {lead && (
            <button className="btn btn-danger" onClick={() => onDelete(lead.id)} style={{ marginRight: 'auto' }}>
              Delete lead
            </button>
          )}
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── main app ─────────────────────────────────────────────────────────────────

export default function LeadsApp() {
  const router = useRouter()
  const [leads, setLeads]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [activeFilter, setFilter]   = useState('all')
  const [assigneeFilter, setAssignee] = useState('all')
  const [modal, setModal]           = useState(null)
  const [toast, setToast]           = useState(null)
  const [userEmail, setUserEmail]   = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserEmail(data.user.email)
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const loadLeads = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) showToast('Error loading leads: ' + error.message)
    else setLeads(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadLeads() }, [loadLeads])

  // realtime sync so both teammates see updates live
  useEffect(() => {
    const channel = supabase
      .channel('leads-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, loadLeads)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [loadLeads])

  const handleSave = async (form) => {
    const payload = {
      name:              form.name.trim(),
      contact:           form.contact.trim(),
      sector:            form.sector.trim(),
      phone:             form.phone.trim(),
      email:             form.email.trim(),
      website:           form.website.trim(),
      messaging:         form.messaging,
      preferred_contact: form.preferred_contact,
      last_contact:      form.last_contact || null,
      status:            form.status,
      assignee:          form.assignee,
      pitch:             form.pitch.trim(),
      notes:             form.notes.trim(),
    }

    let error
    if (form.id) {
      ;({ error } = await supabase.from('leads').update(payload).eq('id', form.id))
    } else {
      ;({ error } = await supabase.from('leads').insert(payload))
    }

    if (error) { showToast('Save failed: ' + error.message); return }
    setModal(null)
    loadLeads()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this lead?')) return
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) { showToast('Delete failed: ' + error.message); return }
    setModal(null)
    loadLeads()
  }

  const filtered = leads.filter(l => {
    const statusOk   = activeFilter === 'all'   || l.status === activeFilter
    const assigneeOk = assigneeFilter === 'all' || l.assignee === assigneeFilter
    return statusOk && assigneeOk
  })

  const counts = {}
  STATUSES.forEach(s => { counts[s] = leads.filter(l => l.status === s).length })

  return (
    <div className="app">
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600, color: '#1a1916', lineHeight: 1.2 }}>Nexus Labs</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#a09f9a', lineHeight: 1.2 }}>leads.tracker</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {userEmail && (
            <span style={{ fontSize: '12px', color: '#a09f9a', fontFamily: 'DM Mono, monospace' }}>
              {userEmail}
            </span>
          )}
          <select
            className="assignee-select"
            value={assigneeFilter}
            onChange={e => setAssignee(e.target.value)}
          >
            <option value="all">All assignees</option>
            <option value="Milos">Milos</option>
            <option value="Milenko">Milenko</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={() => setModal('add')}>
            + Add lead
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </header>

      <main className="main">
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total</div>
            <div className="stat-value">{leads.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Interested</div>
            <div className="stat-value">{counts.interested || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Proposals</div>
            <div className="stat-value">{counts.proposal || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Won</div>
            <div className="stat-value">{counts.closed || 0}</div>
          </div>
        </div>

        <div className="toolbar">
          <div className="toolbar-left">
            <button
              className={`filter-pill${activeFilter === 'all' ? ' active' : ''}`}
              onClick={() => setFilter('all')}
            >All</button>
            {STATUSES.map(s => (
              <button
                key={s}
                className={`filter-pill${activeFilter === s ? ' active' : ''}`}
                onClick={() => setFilter(s)}
              >{STATUS_LABELS[s]}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading leads…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-title">No leads here</div>
            <div className="empty-sub">
              {activeFilter === 'all' ? 'Add your first lead to get started.' : `No leads with status "${STATUS_LABELS[activeFilter]}".`}
            </div>
          </div>
        ) : (
          <div className="leads-list">
            {filtered.map(lead => (
              <LeadCard key={lead.id} lead={lead} onClick={() => setModal(lead)} />
            ))}
          </div>
        )}
      </main>

      {modal && (
        <Modal
          lead={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
