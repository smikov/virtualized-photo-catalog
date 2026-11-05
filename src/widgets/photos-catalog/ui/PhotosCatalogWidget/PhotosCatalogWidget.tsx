import { useState } from 'react'
import { useAppSelector } from '@/app/store'
import { selectPhotos } from '@/features/load-photos/model/selectors'
import { useSearchQuery } from '@/features/search-photos/model/useSearchQuery'
import { SearchPhotosFeature } from '@/features/search-photos/ui/SearchPhotosFeature/SearchPhotosFeature'
import { PhotosTableWidget } from '@/widgets/photos-table/ui/PhotosTableWidget/PhotosTableWidget'

export function PhotosCatalogWidget() {
  const { query, setQuery } = useSearchQuery()
  const [filterQuery, setFilterQuery] = useState('')
  const data = useAppSelector(selectPhotos)

  return (
    <>
      <SearchPhotosFeature value={query} onChange={setQuery} onSearch={setFilterQuery} />
      <PhotosTableWidget data={data} searchQuery={filterQuery} />
    </>
  )
}
