import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function NoteForm({ title, content, setTitle, setContent, isEditing, isSaving, onSave, onCancel }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit note' : 'Create note'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSave} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="note-title">Title</Label>
            <Input id="note-title" name="title" placeholder="Note title" value={title}
              onChange={(event) => setTitle(event.target.value)} maxLength={200} required disabled={isSaving} autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note-content">Content</Label>
            <Textarea id="note-content" name="content" placeholder="Write your note…" value={content}
              onChange={(event) => setContent(event.target.value)} maxLength={50000} disabled={isSaving}
              rows={8} className="min-h-48 resize-y" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isSaving || !title.trim()}>
              {isSaving ? 'Saving…' : isEditing ? 'Save changes' : 'Create note'}
            </Button>
            <Button variant="outline" disabled={isSaving} onClick={onCancel} type="button">Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

