import { TabIcon, type Tab } from './icons'

const TABS: { key: Tab; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'goals', label: 'Goals' },
  { key: 'schedule', label: 'Schedule' },
]

export default function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="tabs">
      <div className="tabs-in">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? 'on' : ''}`}
            onClick={() => onChange(t.key)}
            aria-current={tab === t.key ? 'page' : undefined}
          >
            <TabIcon tab={t.key} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
