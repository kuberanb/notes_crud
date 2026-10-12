import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getErrorMessage } from '@/lib/getErrorMessage'

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Just now' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function NoteList({ query, page, onPageChange, isDeleting, onEdit, onDelete }) {
  const { currentData, isLoading, isFetching, isError, error: fetchError, refetch } = query
  const notes = currentData?.notes ?? []
  const [pendingDelete, setPendingDelete] = useState(null)

  function setPage(nextPage) {
    setPendingDelete(null)
    onPageChange(nextPage)
  }

  async function confirmDelete(id) {
    if (await onDelete(id)) setPendingDelete(null)
  }

  return (
    <>
      {isLoading || (isFetching && !currentData) ? (
        <p role="status" className="py-8 text-center text-sm text-muted-foreground">Loading notes…</p>
      ) : isError ? (
        <Card>
          <CardContent className="space-y-3 py-6">
            <p role="alert" className="text-sm text-destructive">{getErrorMessage(fetchError, 'Could not load notes.')}</p>
            <Button variant="outline" onClick={refetch}>Try again</Button>
          </CardContent>
        </Card>
      ) : notes.length === 0 ? (
        <Card>
          <CardContent className="space-y-2 py-10 text-center">
            <h3 className="font-medium">{page === 1 ? 'No notes yet' : 'No more notes'}</h3>
            <p className="text-sm text-muted-foreground">
              {page === 1 ? 'Create a note to get started.' : 'Go to the previous page to see your notes.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4" aria-busy={isFetching}>
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <CardTitle className="break-words">{note.title}</CardTitle>
                <CardDescription>Updated <time dateTime={note.updated_at}>{formatDate(note.updated_at)}</time></CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="line-clamp-3 whitespace-pre-wrap break-words text-sm text-muted-foreground">{note.content || 'No content.'}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(note)}>Edit</Button>
                  <Button variant="destructive" size="sm" disabled={isDeleting} onClick={() => setPendingDelete(note.id)}>Delete</Button>
                </div>
                {pendingDelete === note.id && (
                  <div className="space-y-3 border-t pt-4">
                    <p className="text-sm">Delete this note? This cannot be undone.</p>
                    <div className="flex gap-2">
                      <Button variant="destructive" size="sm" disabled={isDeleting} onClick={() => confirmDelete(note.id)}>
                        {isDeleting ? 'Deleting…' : 'Confirm delete'}
                      </Button>
                      <Button variant="outline" size="sm" disabled={isDeleting} onClick={() => setPendingDelete(null)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <nav className="flex items-center justify-between gap-3 border-t pt-4" aria-label="Notes pagination">
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page === 1 || isFetching || isDeleting}
            onClick={() => setPage(page - 1)}>Previous</Button>
          <Button variant="outline" disabled={isFetching || isError || isDeleting || notes.length < (currentData?.pageSize ?? 10) || page >= 10000}
            onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      </nav>
    </>
  )
}
