import { useEffect, useState } from 'react';
import { GraduationCap, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '../data/database';

interface Trainer {
  id: string;
  name: string;
  email: string;
}

interface CourseTrainersProps {
  courseId: string;
  /** Formador com sessão iniciada (não se pode retirar a si próprio se for o último) */
  currentTrainerId?: string;
}

/**
 * Separador "Formadores" do curso: quem dá o curso.
 * Permite acrescentar um formador (novo ou já registado) e retirar formadores.
 */
export function CourseTrainers({ courseId, currentTrainerId }: CourseTrainersProps) {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetch(`${API_URL}/trainers?courseId=${encodeURIComponent(courseId)}`).then((r) => r.json());
      setTrainers(data.success ? data.trainers : []);
    } catch {
      toast.error('Não foi possível carregar os formadores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [courseId]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Escreva o nome do formador');
      return;
    }
    setAdding(true);
    try {
      // Cria o formador (ou encontra-o, se já existir com este nome) e liga-o ao curso
      const created = await fetch(`${API_URL}/trainers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      }).then((r) => r.json());
      if (!created.success) throw new Error(created.error || 'Erro ao criar o formador');

      const linked = await fetch(`${API_URL}/course-trainers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, trainerId: created.trainer.id }),
      }).then((r) => r.json());
      if (!linked.success) throw new Error(linked.error || 'Erro ao associar o formador');

      toast.success(
        created.existing
          ? `${created.trainer.name} foi associado ao curso`
          : `${created.trainer.name} foi criado e associado ao curso`
      );
      setName('');
      setEmail('');
      load();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setAdding(false);
    }
  };

  const remove = async (trainer: Trainer) => {
    const self = trainer.id === currentTrainerId;
    const question = self
      ? 'Retirar-se deste curso? Deixa de o ver na sua lista de cursos.'
      : `Retirar ${trainer.name} deste curso?`;
    if (!confirm(question)) return;
    try {
      const data = await fetch(
        `${API_URL}/course-trainers?courseId=${encodeURIComponent(courseId)}&trainerId=${encodeURIComponent(trainer.id)}`,
        { method: 'DELETE' }
      ).then((r) => r.json());
      if (!data.success) throw new Error(data.error || 'Erro ao retirar o formador');
      toast.success(self ? 'Retirou-se do curso' : `${trainer.name} foi retirado do curso`);
      load();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const inputCls =
    'w-full px-3 py-2.5 border-2 border-slate-200 rounded-[10px] text-[0.9375rem] focus:outline-none focus:border-[#3b8433] dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100';

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-[16px] p-5 shadow-sm dark:bg-slate-800">
        <h3 className="text-[1.125rem] text-slate-800 mb-1 dark:text-slate-100">Formadores do curso</h3>
        <p className="text-[0.8125rem] text-slate-500 mb-4 dark:text-slate-400">
          Cada formador só vê os cursos em que está. Os formandos escolhem a que formador escrevem.
        </p>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-[#3b8433]" size={24} />
          </div>
        ) : trainers.length === 0 ? (
          <p className="text-[0.875rem] text-slate-500 text-center py-4">Este curso ainda não tem formadores.</p>
        ) : (
          <ul className="space-y-2">
            {trainers.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 bg-slate-50 rounded-[12px] p-3 dark:bg-slate-700">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#3b8433] text-white flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[0.9375rem] text-slate-800 truncate dark:text-slate-100">
                      {t.name}
                      {t.id === currentTrainerId && <span className="text-[0.75rem] text-slate-500"> (você)</span>}
                    </p>
                    {t.email && <p className="text-[0.75rem] text-slate-500 truncate">{t.email}</p>}
                  </div>
                </div>
                {trainers.length > 1 && (
                  <button
                    onClick={() => remove(t)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                    aria-label={`Retirar ${t.name} do curso`}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={add} className="bg-white rounded-[16px] p-5 shadow-sm space-y-3 dark:bg-slate-800">
        <h3 className="text-[1rem] text-slate-800 dark:text-slate-100">Acrescentar formador</h3>
        <label className="block">
          <span className="block text-[0.8125rem] text-slate-600 mb-1 dark:text-slate-300">Nome *</span>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Maria Santos" />
        </label>
        <label className="block">
          <span className="block text-[0.8125rem] text-slate-600 mb-1 dark:text-slate-300">Email</span>
          <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <p className="text-[0.75rem] text-slate-500 dark:text-slate-400">
          Se já existir um formador com este nome, é ele que fica associado. O formador entra na aplicação escrevendo o seu nome.
        </p>
        <button
          type="submit"
          disabled={adding}
          className="w-full py-3 bg-[#3b8433] hover:bg-[#2f6b29] text-white rounded-[12px] flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {adding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          Acrescentar ao curso
        </button>
      </form>
    </div>
  );
}
