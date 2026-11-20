import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { API_URL } from '../../data/database';
import { voteToPoints } from '../../data/sprintMetrics';

export interface ProfileStudent {
  id: string;
  name: string;
  email?: string;
  teamId?: string;
  courseId?: string;
}

interface Props {
  student: ProfileStudent | null;
  onClose: () => void;
}

/** Janela com o perfil de um formando: equipa e votos nas user stories. */
export function StudentProfile({ student, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [votes, setVotes] = useState<{ id: string; title: string; vote: string }[]>([]);

  useEffect(() => {
    if (!student) return;
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const q = student.courseId ? `?courseId=${encodeURIComponent(student.courseId)}` : '';
        const [st, tm] = await Promise.all([
          fetch(`${API_URL}/stories${q}`).then((r) => r.json()),
          fetch(`${API_URL}/teams${q}`).then((r) => r.json()),
        ]);
        if (cancel) return;
        setTeamName(tm.success ? (tm.teams.find((t: any) => t.id === student.teamId)?.name || '') : '');
        const list = (st.success ? st.stories : [])
          .map((s: any) => {
            const v = (s.votes || []).find((x: any) => x.userId === student.id || x.userName === student.name);
            return v ? { id: s.id, title: s.title, vote: String(v.vote) } : null;
          })
          .filter(Boolean);
        setVotes(list as any);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [student?.id]);

  const points = votes.reduce((sum, v) => sum + (voteToPoints(v.vote) || 0), 0);
  const initials = (student?.name || '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Dialog open={!!student} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[440px] max-h-[85vh] overflow-y-auto z-[100]">
        <DialogHeader>
          <DialogTitle>Perfil do formando</DialogTitle>
        </DialogHeader>
        {student && (
          <>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-[1rem] flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-[1.0625rem] text-slate-800 dark:text-slate-100">{student.name}</p>
                {student.email && <p className="text-[0.8125rem] text-slate-500 truncate">{student.email}</p>}
                <p className="text-[0.8125rem] text-slate-600 dark:text-slate-300">{teamName || 'Sem equipa'}</p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="animate-spin text-slate-400" size={24} />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-[12px] p-3 text-center dark:bg-slate-700">
                    <p className="text-[1.25rem] text-slate-800 dark:text-slate-100">{votes.length}</p>
                    <p className="text-[0.75rem] text-slate-500">Votos dados</p>
                  </div>
                  <div className="bg-slate-50 rounded-[12px] p-3 text-center dark:bg-slate-700">
                    <p className="text-[1.25rem] text-slate-800 dark:text-slate-100">{points}</p>
                    <p className="text-[0.75rem] text-slate-500">Pontos votados</p>
                  </div>
                </div>
                <div>
                  <p className="text-[0.8125rem] text-slate-600 mb-2 dark:text-slate-300">Votos nas user stories</p>
                  {votes.length === 0 ? (
                    <p className="text-[0.8125rem] text-slate-500">Ainda não votou.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {votes.map((v) => (
                        <li key={v.id} className="flex items-center justify-between gap-2 bg-slate-50 rounded-[10px] px-3 py-2 dark:bg-slate-700">
                          <span className="text-[0.8125rem] text-slate-700 truncate dark:text-slate-200">{v.title}</span>
                          <span className="bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-[8px] text-[0.8125rem] font-bold flex-shrink-0">{v.vote}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
