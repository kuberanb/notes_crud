import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { api, useCreateNoteMutation, useDeleteNoteMutation, useGetNotesQuery, useLogoutMutation, useUpdateNoteMutation } from '@/services/api'
import { clearCredentials } from '@/features/auth/authSlice'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { Button } from '@/components/ui/button'

import NoteForm from './NoteForm'
import NoteList from './NoteList'

export default function NotesPage() {
  const dispatch = useDispatch()
  const [page, setPage] = useState(1)
  const [view, setView] = useState('list')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [original, setOriginal] = useState({ id: null, title: '', content: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const notesQuery = useGetNotesQuery(page)
  const { currentData, isFetching, refetch } = notesQuery
  const [createNote, { isLoading: isCreating }] = useCreateNoteMutation()
  const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation()
  const [deleteNote, { isLoading: isDeleting }] = useDeleteNoteMutation()
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation()
  const isEditing = original.id !== null
  const isSaving = isCreating || isUpdating
  const isDirty = title !== original.title || content !== original.content

  useEffect(() => {
    if (view !== 'editor' || !isDirty) return
    function warnBeforeLeaving(event) {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnBeforeLeaving)
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving)
  }, [view, isDirty])

  function openEditor(note) {
    const values = { title: note?.title ?? '', content: note?.content ?? '' }
    setTitle(values.title)
    setContent(values.content)
    setOriginal({ id: note?.id ?? null, ...values })
    setErrorMessage('')
    setSuccessMessage('')
    setView('editor')
  }

  function closeEditor() {
    if (isDirty && !window.confirm('Discard your unsaved changes?')) return
    setErrorMessage('')
    setView('list')
  }

  async function handleSave(event) {
    event.preventDefault()
    if (isSaving) return
    if (!title.trim()) return setErrorMessage('Give your note a title before saving.')
    setErrorMessage('')
    try {
      const body = { title: title.trim(), content }
      await (isEditing ? updateNote({ id: original.id, ...body }) : createNote(body)).unwrap()
      if (!isEditing) setPage(1)
      setSuccessMessage(isEditing ? 'Changes saved.' : 'Your new note is saved.')
      setView('list')
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Could not save your note. Please try again.'))
    }
  }

  async function handleDelete(id) {
    if (isDeleting) return
    setErrorMessage('')
    setSuccessMessage('')
    try {
      await deleteNote(id).unwrap()
      if (currentData?.notes?.length === 1 && page > 1) setPage(page - 1)
      setSuccessMessage('Note deleted.')
      return true
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Could not delete your note.'))
      return false
    }
  }

  async function handleLogout() {
    if (isDirty && view === 'editor' && !window.confirm('Discard your unsaved changes and log out?')) return
    try {
      await logout().unwrap()
      dispatch(clearCredentials())
      dispatch(api.util.resetApiState())
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Could not log out. Please try again.'))
    }
  }

  return (
    <section aria-label="Notes workspace" className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Notes</h1>
        <div className="flex flex-wrap gap-2">
          {view === 'list' && (
            <>
              <Button variant="outline" disabled={isFetching} onClick={refetch}>{isFetching ? 'Refreshing…' : 'Refresh'}</Button>
              <Button onClick={() => openEditor()}>Create note</Button>
            </>
          )}
          <Button variant="outline" disabled={isLoggingOut || isSaving || isDeleting} onClick={handleLogout}>
            {isLoggingOut ? 'Logging out…' : 'Log out'}
          </Button>
        </div>
      </header>
      {errorMessage && <p role="alert" className="text-sm text-destructive">{errorMessage}</p>}
      {successMessage && <p role="status" className="text-sm text-muted-foreground">{successMessage}</p>}

      {view === 'editor' ? (
        <NoteForm
          title={title} content={content} setTitle={setTitle} setContent={setContent}
          isEditing={isEditing} isSaving={isSaving}
          onSave={handleSave} onCancel={closeEditor}
        />
      ) : (
        <NoteList
          query={notesQuery} page={page} onPageChange={setPage}
          isDeleting={isDeleting} onEdit={openEditor} onDelete={handleDelete}
        />
      )}
    </section>
  )
}

