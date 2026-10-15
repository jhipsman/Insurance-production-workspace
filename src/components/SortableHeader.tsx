import { useState } from 'react'

type Direction = 'ascending' | 'descending'
type SortValue = string | number | boolean | null | undefined
const collator = new Intl.Collator('en-US', { sensitivity: 'base', numeric: true })

export function useTableSort<T, K extends string>(initialKey: K, value: (row: T, key: K) => SortValue, initialDirection: Direction = 'ascending') {
  const [sort, setSort] = useState({ key: initialKey, direction: initialDirection })
  function headerProps(key: K) {
    return {
      direction: sort.key === key ? sort.direction : undefined,
      onSort: () => setSort(current => ({ key, direction: current.key === key && current.direction === 'ascending' ? 'descending' : 'ascending' })),
    }
  }
  function sortRows(rows: T[]): T[] {
    return [...rows].sort((a, b) => {
      const left = value(a, sort.key), right = value(b, sort.key)
      const missing = (v: SortValue) => v == null || v === ''
      // Unknown values stay last in either direction.
      if (missing(left) || missing(right)) return Number(missing(left)) - Number(missing(right))
      const result = typeof left === 'string' && typeof right === 'string'
        ? collator.compare(left, right)
        : Number(left) - Number(right)
      return sort.direction === 'ascending' ? result : -result
    })
  }
  return { headerProps, sortRows }
}

export function SortableHeader({ label, direction, onSort }: { label: string; direction?: Direction; onSort: () => void }) {
  return <th scope="col" aria-sort={direction ?? 'none'}>
    <button className="sort-header" onClick={onSort} title={`Sort ${label.toLowerCase()} ${direction === 'ascending' ? 'descending' : 'ascending'}`}>
      {label}<span aria-hidden="true">{direction === 'ascending' ? '↑' : direction === 'descending' ? '↓' : '↕'}</span>
    </button>
  </th>
}
