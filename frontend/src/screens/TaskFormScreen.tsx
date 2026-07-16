import { useMemo, useState, type FormEvent } from 'react'
import { useTasks } from '../context/useTasks'
import type { TaskCategory, TaskFrequency } from '../types'

type TaskPriority = 'low' | 'medium' | 'high'

type TaskFormValues = {
  title: string
  description: string
  category: TaskCategory
  priority: TaskPriority
  frequency: TaskFrequency
  dueDate: string
  points: number
  needsNfc: boolean
}

type TaskFormScreenProps = {
  onSuccess?: () => void
  onCancel?: () => void
  initialValues?: Partial<TaskFormValues>
}

const defaultValues: TaskFormValues = {
  title: '',
  description: '',
  category: 'general',
  priority: 'medium',
  frequency: 'weekly',
  dueDate: '',
  points: 20,
  needsNfc: false,
}

const CATEGORY_OPTIONS: { value: TaskCategory; label: string }[] = [
  { value: 'general', label: 'Général' },
  { value: 'kitchen', label: 'Cuisine' },
  { value: 'bathroom', label: 'Salle de bain' },
  { value: 'bedroom', label: 'Chambre' },
  { value: 'living-room', label: 'Salon' },
  { value: 'pet', label: 'Animal' },
]

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Douce' },
  { value: 'medium', label: 'Normale' },
  { value: 'high', label: 'Importante' },
]

const FREQUENCY_OPTIONS: { value: TaskFrequency; label: string }[] = [
  { value: 'daily', label: 'Chaque jour' },
  { value: 'weekly', label: 'Chaque semaine' },
  { value: 'biweekly', label: 'Toutes les 2 semaines' },
  { value: 'monthly', label: 'Chaque mois' },
  { value: 'seasonal', label: 'Chaque saison' },
  { value: 'yearly', label: 'Chaque année' },
]

function labelFor<T extends string>(
  options: { value: T; label: string }[],
  value: T,
): string {
  return options.find((option) => option.value === value)?.label ?? value
}

export default function TaskFormScreen({
  onSuccess,
  onCancel,
  initialValues,
}: TaskFormScreenProps) {
  const { createTask } = useTasks()

  const [values, setValues] = useState<TaskFormValues>({
    ...defaultValues,
    ...initialValues,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormValues, string>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const summary = useMemo(() => {
    const parts: string[] = []
    parts.push(labelFor(CATEGORY_OPTIONS, values.category))
    parts.push(labelFor(PRIORITY_OPTIONS, values.priority))
    parts.push(labelFor(FREQUENCY_OPTIONS, values.frequency))
    if (values.points > 0) parts.push(`${values.points} pts`)
    return parts
  }, [values])

  const setField = <K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
    setSubmitError(null)
  }

  const validate = () => {
    const nextErrors: Partial<Record<keyof TaskFormValues, string>> = {}

    if (!values.title.trim()) {
      nextErrors.title = 'Le titre est requis.'
    } else if (values.title.trim().length > 150) {
      nextErrors.title = 'Le titre doit rester sous 150 caractères.'
    }

    if (values.points < 0 || values.points > 200) {
      nextErrors.points = 'Les points doivent être entre 0 et 200.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)

    if (!validate() || submitting) return

    setSubmitting(true)
    try {
      await createTask({
        title: values.title.trim(),
        description: values.description.trim(),
        category: values.category,
        priority: values.priority,
        frequency: values.frequency,
        points: values.points,
        dueDate: values.dueDate || null,
        needsNfc: values.needsNfc,
      })
      onSuccess?.()
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Impossible de créer la tâche. Réessaie.',
      )
    } finally {
      setSubmitting(false)
    }
  }

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
        {submitError ? (
          <p className="form-error" role="alert">
            {submitError}
          </p>
        ) : null}

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
              maxLength={150}
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
            <span className="small muted">{values.description.length}/300</span>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="task-category">Catégorie</label>
              <select
                id="task-category"
                value={values.category}
                onChange={(e) => setField('category', e.target.value as TaskCategory)}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="task-priority">Priorité</label>
              <select
                id="task-priority"
                value={values.priority}
                onChange={(e) => setField('priority', e.target.value as TaskPriority)}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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
              <label htmlFor="task-frequency">Récurrence</label>
              <select
                id="task-frequency"
                value={values.frequency}
                onChange={(e) => setField('frequency', e.target.value as TaskFrequency)}
              >
                {FREQUENCY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="task-date">Échéance</label>
              <input
                id="task-date"
                type="date"
                value={values.dueDate}
                onChange={(e) => setField('dueDate', e.target.value)}
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
              value={values.points}
              onChange={(e) => setField('points', Number(e.target.value))}
            />
            <div className="range-labels">
              <span>0 pt</span>
              <strong>{values.points} pts</strong>
              <span>100 pts</span>
            </div>
            {errors.points ? <span className="small muted">{errors.points}</span> : null}
          </div>
        </div>

        <div className="task-form-card">
          <div className="section-head">
            <h2>Options</h2>
            <p>Rendre la tâche plus utile</p>
          </div>

          <div className="form-toggles">
            <label className="toggle-label" htmlFor="task-nfc">
              <input
                id="task-nfc"
                type="checkbox"
                checked={values.needsNfc}
                onChange={(e) => setField('needsNfc', e.target.checked)}
              />
              <span>Valider avec un badge NFC</span>
            </label>
          </div>

          <div className="row-badges">
            <span className="badge badge-info">
              {labelFor(CATEGORY_OPTIONS, values.category)}
            </span>
            <span className="badge badge-rank">
              {labelFor(PRIORITY_OPTIONS, values.priority)}
            </span>
            {values.needsNfc ? <span className="badge badge-pet">NFC</span> : null}
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
                <h3 className="task-title">{values.title.trim() || 'Titre de la tâche'}</h3>
                <p className="task-meta">
                  {values.description.trim() ||
                    'Ajoute une description courte pour aider à passer à l’action.'}
                </p>
              </div>

              <span className="calendar-event-due">{values.dueDate || 'Sans date'}</span>
            </div>

            <div className="row-badges">
              <span className="pill">{labelFor(CATEGORY_OPTIONS, values.category)}</span>
              <span className="pill">{labelFor(PRIORITY_OPTIONS, values.priority)}</span>
              <span className="pill">{values.points} pts</span>
              {values.needsNfc ? <span className="pill">NFC</span> : null}
            </div>
          </article>
        </div>

        <div className="task-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Enregistrement…' : 'Enregistrer la tâche'}
          </button>
        </div>
      </form>
    </section>
  )
}
