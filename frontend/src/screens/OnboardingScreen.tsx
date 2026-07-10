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
            eyebrow: 'Bienvenue',
            title: 'Transforme les taches menageres en jeu cooperatif.',
            text: 'Cree une routine cute, suis les streaks, gagne des points et garde la maison propre sans charge mentale.',
            visual: '🏡',
        },
        {
            eyebrow: 'Badges NFC',
            title: 'Scanne un badge pour valider les taches frequentes.',
            text: 'Les taches quotidiennes, hebdo, bihebdo et mensuelles peuvent etre liees a un badge NFC dans une piece ou sur une zone precise.',
            visual: '📶',
        },
        {
            eyebrow: 'Mode de jeu',
            title: 'Choisis une ambiance simple, coop ou competitive.',
            text: "Le but du mois, les penalites de retard et les recompenses d'equipe rendent le menage plus vivant et plus motivant.",
            visual: '🏆',
        },
    ] as const

    const current = stepContent[step]

    return (
        <div style={{
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f3e8ff 0%, #dbeafe 100%)',
            padding: '2rem 1.5rem',
        }}>
            {/* Card */}
            <div style={{
                background: 'white',
                borderRadius: '1.5rem',
                padding: '2.5rem 2rem',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                textAlign: 'center',
            }}>
                {/* Visual */}
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                    {current.visual}
                </div>

                {/* Eyebrow */}
                <span style={{
                    display: 'inline-block',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#a855f7',
                    marginBottom: '0.75rem',
                }}>
                    {current.eyebrow}
                </span>

                {/* Title */}
                <h2 style={{
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    color: '#2d1b69',
                    lineHeight: 1.3,
                    marginBottom: '1rem',
                }}>
                    {current.title}
                </h2>

                {/* Text */}
                <p style={{
                    fontSize: '0.95rem',
                    color: '#666',
                    lineHeight: 1.6,
                    marginBottom: '2rem',
                }}>
                    {current.text}
                </p>

                {/* Dots */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginBottom: '2rem',
                }}>
                    {([0, 1, 2] as OnboardingStep[]).map((i) => (
                        <div
                            key={i}
                            style={{
                                width: step === i ? '1.5rem' : '0.5rem',
                                height: '0.5rem',
                                borderRadius: '9999px',
                                background: step === i ? '#a855f7' : '#e2e8f0',
                                transition: 'all 0.3s ease',
                            }}
                        />
                    ))}
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {step > 0 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: 'transparent',
                                border: '1.5px solid #e2e8f0',
                                borderRadius: '0.75rem',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                color: '#555',
                                cursor: 'pointer',
                            }}
                        >
                            Retour
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={nextStep}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                            border: 'none',
                            borderRadius: '0.75rem',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            color: 'white',
                            cursor: 'pointer',
                        }}
                    >
                        {step < 2 ? 'Suivant' : 'Commencer'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default OnboardingScreen