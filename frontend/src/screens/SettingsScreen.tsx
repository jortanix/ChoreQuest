function SettingsScreen() {
    return (
        <section className="screen active">
            <div className="task-list">
                <div className="card">
                    <div className="eyebrow">✦ Réglages du jeu</div>
                    <h2 className="hero-title team-title">Style & progression</h2>
                    <div className="row-badges">
                        <span className="pill">mode coopératif</span>
                        <span className="pill">objectif mensuel</span>
                        <span className="pill">NFC ≤ 1 mois</span>
                        <span className="pill">check app &gt; 1 mois</span>
                    </div>
                </div>

                <div className="card">
                    <h3 className="task-title">Base de tâches</h3>
                    <p className="task-meta">
                        Quotidien : faire le lit, aérer, vaisselle, surfaces, cuisine, croquettes, eau, litière.
                        Hebdo : aspirateur, SDB/WC, poussière, miroir, recyclage, poubelles.
                        Bihebdo : four, serviettes, torchons, tapis SDB, frigo, changer la litière.
                    </p>
                </div>
            </div>
        </section>
    )
}

export default SettingsScreen