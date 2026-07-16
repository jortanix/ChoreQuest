import React, { FormEvent, useMemo, useState } from 'react';

type TaskPriority = 'low' | 'medium' | 'high';
type TaskCategory = 'home' | 'school' | 'health' | 'pet' | 'other';

export type TaskFormValues = {
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string;
  dueTime: string;
  rewardPoints: number;
  recurring: boolean;
  reminder: boolean;
};

type TaskFormScreenProps = {
  onSubmit?: (values: TaskFormValues) => void;
  onCancel?: () => void;
  initialValues?: Partial<TaskFormValues>;
};

const defaultValues: TaskFormValues = {
  title: '',
  description: '',
  category: 'home',
  priority: 'medium',
  dueDate: '',
  dueTime: '',
  rewardPoints: 20,
  recurring: false,
  reminder: true,
};

function getPriorityLabel(priority: TaskPriority) {
  switch (priority) {
    case 'low':
      return 'Douce';
    case 'medium':
      return 'Normale';
    case 'high':
      return 'Importante';
    default:
      return priority;
  }
}

function getCategoryLabel(category: TaskCategory) {
  switch (category) {
    case 'home':
      return 'Maison';
    case 'school':
      return 'École';
    case 'health':
      return 'Santé';
    case 'pet':
      return 'Animal';
    case 'other':
      return 'Autre';
    default:
      return category;
  }
}

export default function TaskFormScreen({
  onSubmit,
  onCancel,
  initialValues,
}: TaskFormScreenProps) {
  const [values, setValues] = useState<TaskFormValues>({
    ...defaultValues,
    ...initialValues,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormValues, string>>>({});

  const summary = useMemo(() => {
    const parts: string[] = [];

    if (values.category) parts.push(getCategoryLabel(values.category));
    if (values.priority) parts.push(getPriorityLabel(values.priority));
    if (values.rewardPoints > 0) parts.push(`${values.rewardPoints} pts`);
    if (values.recurring) parts.push('Récurrente');

    return parts;
  }, [values]);

  const setField = <K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof TaskFormValues, string>> = {};

    if (!values.title.trim()) {
      nextErrors.title = 'Le titre est requis.';
    }

    if (values.title.trim().length > 80) {
      nextErrors.title = 'Le titre doit rester sous 80 caractères.';
    }

    if (values.description.trim().length > 300) {
      nextErrors.description = 'La description doit rester sous 300 caractères.';
    }

    if (values.rewardPoints < 0 || values.rewardPoints > 200) {
      nextErrors.rewardPoints = 'Les points doivent être entre 0 et 200.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) return;

    onSubmit?.({
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
    });
  };

  return (
    <section className="screen task-form-screen">
      <div className="eyebrow">Nouvelle tâche</div>

      <header className="home-header">
        <div>
          <h1>Ajouter une mission</h1>
          <p className="home-subtitle">
            Crée une tâche claire, motivante et facile à lancer depuis la nav.
          </p>
        </div>

        <button
          type="button"
          className="ghost"
          onClick={onCancel}
          aria-label="Fermer le formulaire"
        >
          Fermer
        </button>
      </header>

      <form className="task-form" onSubmit={handleSubmit}>
        <div className="task-form-card">
          <div className="section-head">
            <h2>Détails</h2>
            <p>{summary.join(' · ') || 'Prépare ta tâche'}</p>
          </div>

          <div className="form-field">
            <label htmlFor="task-title">Titre</label>
            <input
              id="task-title"
              type="text"
              placeholder="Ex. Ranger la chambre"
              value={values.title}
              onChange={(e) => setField('title', e.target.value)}
              maxLength={80}
            />
            {errors.title ? <span className="small muted">{errors.title}</span> : null}
          </div>

          <div className="form-field">
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              placeholder="Ajoute une consigne courte ou un contexte utile"
              value={values.description}
              onChange={(e) => setField('description', e.target.value)}
              maxLength={300}
            />
            {errors.description ? (
              <span className="small muted">{errors.description}</span>
            ) : (
              <span className="small muted">{values.description.length}/300</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="task-category">Catégorie</label>
              <select
                id="task-category"
                value={values.category}
                onChange={(e) => setField('category', e.target.value as TaskCategory)}
              >
                <option value="home">Maison</option>
                <option value="school">École</option>
                <option value="health">Santé</option>
                <option value="pet">Animal</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="task-priority">Priorité</label>
              <select
                id="task-priority"
                value={values.priority}
                onChange={(e) => setField('priority', e.target.value as TaskPriority)}
              >
                <option value="low">Douce</option>
                <option value="medium">Normale</option>
                <option value="high">Importante</option>
              </select>
            </div>
          </div>
        </div>

        <div className="task-form-card">
          <div className="section-head">
            <h2>Planning</h2>
            <p>Quand faut-il la faire ?</p>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="task-date">Date</label>
              <input
                id="task-date"
                type="date"
                value={values.dueDate}
                onChange={(e) => setField('dueDate', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="task-time">Heure</label>
              <input
                id="task-time"
                type="time"
                value={values.dueTime}
                onChange={(e) => setField('dueTime', e.target.value)}
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="task-reward">Points récompense</label>
            <input
              id="task-reward"
              type="range"
              min={0}
              max={100}
              step={5}
              value={values.rewardPoints}
              onChange={(e) => setField('rewardPoints', Number(e.target.value))}
            />
            <div className="range-labels">
              <span>0 pt</span>
              <strong>{values.rewardPoints} pts</strong>
              <span>100 pts</span>
            </div>
            {errors.rewardPoints ? (
              <span className="small muted">{errors.rewardPoints}</span>
            ) : null}
          </div>
        </div>

        <div className="task-form-card">
          <div className="section-head">
            <h2>Options</h2>
            <p>Rendre la tâche plus utile</p>
          </div>

          <div className="form-toggles">
            <label className="toggle-label" htmlFor="task-recurring">
              <input
                id="task-recurring"
                type="checkbox"
                checked={values.recurring}
                onChange={(e) => setField('recurring', e.target.checked)}
              />
              <span>Répéter cette tâche automatiquement</span>
            </label>

            <label className="toggle-label" htmlFor="task-reminder">
              <input
                id="task-reminder"
                type="checkbox"
                checked={values.reminder}
                onChange={(e) => setField('reminder', e.target.checked)}
              />
              <span>Activer un rappel</span>
            </label>
          </div>

          <div className="row-badges">
            <span className="badge badge-info">{getCategoryLabel(values.category)}</span>
            <span className="badge badge-rank">{getPriorityLabel(values.priority)}</span>
            {values.recurring ? <span className="badge badge-pet">Récurrente</span> : null}
          </div>
        </div>

        <div className="task-form-card">
          <div className="section-head">
            <h2>Aperçu</h2>
            <p>Version compacte</p>
          </div>

          <article className="task-card task-card-compact">
            <div className="task-top">
              <div>
                <h3 className="task-title">
                  {values.title.trim() || 'Titre de la tâche'}
                </h3>
                <p className="task-meta">
                  {values.description.trim() || 'Ajoute une description courte pour aider à passer à l’action.'}
                </p>
              </div>

              <span className="calendar-event-due">
                {values.dueDate || 'Sans date'}
              </span>
            </div>

            <div className="row-badges">
              <span className="pill">{getCategoryLabel(values.category)}</span>
              <span className="pill">{getPriorityLabel(values.priority)}</span>
              <span className="pill">{values.rewardPoints} pts</span>
              {values.reminder ? <span className="pill">Rappel</span> : null}
            </div>
          </article>
        </div>

        <div className="task-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary">
            Enregistrer la tâche
          </button>
        </div>
      </form>
    </section>
  );
}