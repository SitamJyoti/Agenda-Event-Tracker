import type { Category, Status } from '../types'

export const CATEGORY_COLORS: Record<Category, string> = {
  work: '#4f46e5',
  personal: '#0d9488',
  meeting: '#d97706',
  social: '#db2777',
  health: '#16a34a',
  other: '#64748b',
}

const STATUS_STYLES: Record<Status, string> = {
  upcoming: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-slate-100 text-slate-600 ring-slate-300',
}

export const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function CategoryDot({ category }: { category: Category }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: CATEGORY_COLORS[category] }}
      aria-hidden="true"
    />
  )
}

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
      <CategoryDot category={category} />
      {titleCase(category)}
    </span>
  )
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}>
      {titleCase(status)}
    </span>
  )
}
