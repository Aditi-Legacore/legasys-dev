'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Note {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

interface NotesTabProps {
  notes: Note[];
  loadingNotes: boolean;
  newNote: string;
  setNewNote: (value: string) => void;
  addNote: () => void;
  deleteNote: (noteId: string) => void;
  formatDate: (dateString: string | null) => string;
}

export default function NotesTab({
  notes,
  loadingNotes,
  newNote,
  setNewNote,
  addNote,
  deleteNote,
  formatDate,
}: NotesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notes</CardTitle>
      </CardHeader>
      <CardContent>
        {loadingNotes ? (
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <Textarea
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <Button onClick={addNote}>Add Note</Button>
            </div>
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-base text-black dark:text-gray-200">{note.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDate(note.createdAt)} by {note.createdBy}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Delete note"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
