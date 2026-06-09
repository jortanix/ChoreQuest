import EmptyState from '../components/EmptyState'

function TeamScreen() {
    return (
        <section className="screen">
            <div className="section-head">
                <h1>Équipe</h1>
            </div>

            <EmptyState
                icon="👥"
                title="Ton équipe est encore tranquille"
                description="Ajoute plus tard les membres, rôles et petites missions partagées pour transformer les corvées en aventure coopérative."
            />
        </section>
    )
}

export default TeamScreen