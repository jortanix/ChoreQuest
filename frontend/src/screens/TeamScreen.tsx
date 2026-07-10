import EmptyState from '../components/EmptyState'

function TeamScreen() {
    return (
        <section className="screen">
            <div className="home-header">
                <div>
                    <h1>Équipe</h1>
                    <p className="home-subtitle">
                        Prépare les rôles, les membres et les futures missions
                        coopératives.
                    </p>
                </div>
            </div>

            <section className="home-section">
                <div className="home-metrics">
                    <div className="metric-card">
                        <span className="metric-label">Membres</span>
                        <strong>0</strong>
                    </div>
                    <div className="metric-card">
                        <span className="metric-label">Rôles</span>
                        <strong>0</strong>
                    </div>
                    <div className="metric-card">
                        <span className="metric-label">Missions</span>
                        <strong>0</strong>
                    </div>
                </div>
            </section>

            <section className="home-section">
                <div className="section-head">
                    <h2>Organisation</h2>
                </div>

                <div className="card">
                    <p className="home-subtitle">
                        Cet espace servira à répartir les responsabilités, suivre
                        les membres du foyer et préparer une vraie dynamique
                        d’équipe autour des tâches.
                    </p>
                </div>
            </section>

            <section className="home-section">
                <div className="section-head">
                    <h2>Équipe à venir</h2>
                </div>

                <EmptyState
                    icon="👥"
                    title="Ton équipe est encore tranquille"
                    description="Ajoute plus tard les membres, rôles et petites missions partagées pour transformer les corvées en aventure coopérative."
                />
            </section>
        </section>
    )
}

export default TeamScreen