import { useEffect, useMemo, useRef } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type FilterFn,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { type Photo } from '@/entities/photo'
import { VisuallyHidden } from '@/shared/ui'
import { HighlightText } from '@/features/search-photos'
import { Thumbnail } from '../Thumbnail/Thumbnail'
import styles from './PhotosTableWidget.module.css'

interface PhotosTableWidgetProps {
  data: Photo[]
  searchQuery: string
}

// Фильтр по подстроке в заголовке: регистронезависимый, без учёта пробелов по краям
const titleIncludesFilter: FilterFn<Photo> = (row, _columnId, filterValue) => {
  const query = String(filterValue ?? '')
    .trim()
    .toLowerCase()
  if (!query) return true
  return row.original.title.toLowerCase().includes(query)
}

/**
 * Виджет виртуализированной таблицы фотографий с использованием TanStack Table & Virtual
 */
export function PhotosTableWidget({ data, searchQuery }: PhotosTableWidgetProps) {
  // Колонки таблицы: ID, миниатюра, заголовок с подсветкой совпадений
  const columns = useMemo<ColumnDef<Photo>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 80,
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'thumbnailUrl',
        header: 'Миниатюра',
        size: 110,
        cell: (info) => (
          <Thumbnail
            src={info.getValue() as string}
            originalUrl={info.row.original.url}
            alt={info.row.original.title}
          />
        ),
      },
      {
        accessorKey: 'title',
        header: 'Заголовок',
        size: 600,
        filterFn: titleIncludesFilter,
        cell: (info) => <HighlightText text={info.getValue() as string} query={searchQuery} />,
      },
    ],
    [searchQuery]
  )

  // Фильтрация выполняется возможностями TanStack Table, а не вручную до таблицы
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter: searchQuery.trim() },
    globalFilterFn: titleIncludesFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const rows = table.getRowModel().rows

  // Ссылка на контейнер таблицы для виртуализации
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 70, // Примерная высота строки в пикселях
    overscan: 10,
    measureElement: (element) => (element as HTMLElement).getBoundingClientRect().height,
  })

  // Когда список сужается (фильтр или новые данные), позиция прокрутки может оказаться
  // за пределами нового диапазона: виртуализатор в этом состоянии не отдаёт видимых строк,
  // и таблица выглядит пустой до следующего события прокрутки. Возвращаем прокрутку в начало
  useEffect(() => {
    // scrollTo нет в jsdom — проверяем наличие, тесты таблицы не должны падать из-за прокрутки
    tableContainerRef.current?.scrollTo?.({ top: 0 })
    rowVirtualizer.scrollToOffset(0)
  }, [searchQuery, data, rowVirtualizer])

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()

  return (
    <>
      <div ref={tableContainerRef} className={styles.container}>
        <table role="table" className={styles.table} aria-rowcount={rows.length + 1}>
          <caption>
            <VisuallyHidden>
              Таблица фотографий: идентификатор, миниатюра и заголовок. Строк: {rows.length}
            </VisuallyHidden>
          </caption>
          <thead role="rowgroup" className={styles.head}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} role="row" className={styles.headRow}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    role="columnheader"
                    scope="col"
                    className={styles.headCell}
                    style={{ width: header.column.columnDef.size }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody role="rowgroup" className={styles.body} style={{ height: `${totalSize}px` }}>
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index]
              return (
                <tr
                  key={row.id}
                  role="row"
                  aria-rowindex={virtualRow.index + 2}
                  className={styles.row}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  ref={rowVirtualizer.measureElement}
                  data-index={virtualRow.index}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      role="cell"
                      className={`${styles.cell} ${
                        cell.column.id === 'title' ? styles.titleCell : ''
                      }`}
                      style={{ width: cell.column.columnDef.size }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className={styles.empty}>Ничего не найдено по запросу «{searchQuery}»</div>
        )}
      </div>
      <p className={styles.counter}>
        Найдено записей: {rows.length} из {data.length}
      </p>
    </>
  )
}
