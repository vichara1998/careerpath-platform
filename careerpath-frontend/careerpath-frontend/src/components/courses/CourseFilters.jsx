import { Search, X } from 'lucide-react'
import { useState } from 'react'

const COURSE_TYPES = ['DEGREE','DIPLOMA','NVQ','CERTIFICATE','ONLINE_CERTIFICATION','VOCATIONAL','SHORT_COURSE','POSTGRADUATE']
const MODES        = ['PHYSICAL','ONLINE','HYBRID']
const CAREER_FIELDS = ['Software Engineering','Data Science','Cybersecurity','Business','Marketing','Medicine','Engineering','Agriculture','Tourism','AI/ML','Networking','Accounting','Arts & Design','Media Studies']

export default function CourseFilters({ filters, onChange, onClear }) {
  return (
    <div className="card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
        <button onClick={onClear} className="text-xs text-brand hover:underline flex items-center gap-1">
          <X className="w-3 h-3" /> Clear all
        </button>
      </div>

      <div>
        <label className="label">Course Type</label>
        <select className="select text-sm" value={filters.type || ''} onChange={e => onChange('type', e.target.value || null)}>
          <option value="">All Types</option>
          {COURSE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
        </select>
      </div>

      <div>
        <label className="label">Study Mode</label>
        <select className="select text-sm" value={filters.mode || ''} onChange={e => onChange('mode', e.target.value || null)}>
          <option value="">All Modes</option>
          {MODES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div>
        <label className="label">Career Field</label>
        <select className="select text-sm" value={filters.careerField || ''} onChange={e => onChange('careerField', e.target.value || null)}>
          <option value="">All Fields</option>
          {CAREER_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div>
        <label className="label">Max Fee (LKR)</label>
        <input className="input text-sm" type="number" placeholder="e.g. 500000"
          value={filters.maxFee || ''} onChange={e => onChange('maxFee', e.target.value || null)} />
      </div>

      <div>
        <label className="label">District</label>
        <input className="input text-sm" placeholder="e.g. Colombo"
          value={filters.district || ''} onChange={e => onChange('district', e.target.value || null)} />
      </div>
    </div>
  )
}