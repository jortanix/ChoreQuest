import { useState } from 'react'

interface OnboardingScreenProps {
    onFinish: () => void
}

type OnboardingStep = 0 | 1 | 2

function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
    const [step, setStep] = useState<OnboardingStep>(0)

    const nextStep = () => {
        if (step < 2) {
            setStep((prev) => (prev + 1) as OnboardingStep)
            return
        }

        onFinish()
    }

    const prevStep = () => {
        if (step > 0) {
            setStep((prev) => (prev - 1) as OnboardingStep)
        }
    }

    const stepContent = [
        {
            eyebrow: '♡ Bienvenue',
            title: 'Transforme les tâches ménagères en jeu coopératif.',
            text: 'Crée une routine cute, suis les streaks, gagne des points et garde la maison propre sans charge mentale.',
            visual: '🏡',
        },
        {
            eyebrow: '✦ Badges NFC',
            title: 'Scanne un badge pour valider les tâches fréquentes.',
            text: 'Les tâches quotidiennes, hebdo, bihebdo et mensuelles peuvent être liées à un badge NFC dans une pièce ou sur une zone précise.',
            visual: '📶',
        },
        {
            eyebrow: '⚙️ Mode de jeu',
            title: 'Choisis une ambiance simple, coop ou compétitive.',
            text: 'Le but du mois, les pénalités de retard et les récompenses d’équipe rendent le ménage plus vivant et plus motivant.',
            visual: '🏆',
        },
    ] as const

    const current = stepContent[step]

    return (
        <section className="screen onboarding-screen">
            <div className="card onboarding-card">
                <div className="onboarding-progress">
                    <span className={step >= 0 ? 'is-active' : ''} />
                    <span className={step >= 1 ? 'is-active' : ''} />
                    <span className={step >= 2 ? 'is-active' : ''} />
                </div>

                <div className="eyebrow">{current.eyebrow}</div>

                <div className="onboarding-visual">{current.visual}</div>

                <h1 className="hero-title onboarding-title">{current.title}</h1>
                <p className="hero-sub onboarding-text">{current.text}</p>

                <div className="onboarding-pills">
                    <span className="pill">streaks</span>
                    <span className="pill">NFC</span>
                    <span className="pill">calendrier annuel</span>
                    <span className="pill">pénalités</span>
                </div>

                <div className="onboarding-actions">
                    {step > 0 ? (
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={prevStep}
                        >
                            Retour
                        </button>
                    ) : (
                        <button type="button" className="btn btn-secondary">
                            Plus tard
                        </button>
                    )}

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={nextStep}
                    >
                        {step === 2 ? 'Commencer' : 'Continuer'}
                    </button>
                </div>
            </div>
        </section>
    )
}

export default OnboardingScreen