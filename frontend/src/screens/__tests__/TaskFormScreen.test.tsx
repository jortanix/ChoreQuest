import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskFormScreen from '../TaskFormScreen'

const createTask = vi.fn()

vi.mock('../../context/useTasks', () => ({
  useTasks: () => ({ createTask }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TaskFormScreen', () => {
  it('crée une tâche et appelle onSuccess', async () => {
    createTask.mockResolvedValueOnce({ id: '1', title: 'Sortir la poubelle' })
    const onSuccess = vi.fn()
    const user = userEvent.setup()

    render(<TaskFormScreen onSuccess={onSuccess} />)

    await user.type(screen.getByLabelText('Titre'), 'Sortir la poubelle')
    await user.click(screen.getByRole('button', { name: 'Enregistrer la tâche' }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
    expect(createTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Sortir la poubelle' }),
    )
  })

  it('affiche une erreur de validation sans titre', async () => {
    const onSuccess = vi.fn()
    const user = userEvent.setup()

    render(<TaskFormScreen onSuccess={onSuccess} />)

    await user.click(screen.getByRole('button', { name: 'Enregistrer la tâche' }))

    expect(await screen.findByText('Le titre est requis.')).toBeInTheDocument()
    expect(createTask).not.toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it("affiche le message d'erreur renvoyé par l'API", async () => {
    createTask.mockRejectedValueOnce(new Error('Le titre existe déjà.'))
    const onSuccess = vi.fn()
    const user = userEvent.setup()

    render(<TaskFormScreen onSuccess={onSuccess} />)

    await user.type(screen.getByLabelText('Titre'), 'Doublon')
    await user.click(screen.getByRole('button', { name: 'Enregistrer la tâche' }))

    expect(await screen.findByText('Le titre existe déjà.')).toBeInTheDocument()
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
