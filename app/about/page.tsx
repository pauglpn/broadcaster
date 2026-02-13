import Navigation from '@/components/Navigation';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">À propos de Broadcaster</h1>
        
        <div className="bg-white rounded-lg shadow p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Comment ça fonctionne ?</h2>
            <p className="text-gray-700 leading-relaxed">
              Broadcaster est une plateforme qui vous permet de trouver rapidement où et quand 
              regarder vos films et séries préférés en France. Notre service centralise les 
              informations provenant de multiples sources pour vous offrir une vue d'ensemble 
              complète de la disponibilité des programmes audiovisuels.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Fonctionnalités</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Recherche avancée</strong> : Trouvez des films et séries par titre, réalisateur, année et type</li>
              <li><strong>Sorties cinéma</strong> : Consultez les dates de sortie en salles en France</li>
              <li><strong>Diffusions TV</strong> : Découvrez quand vos programmes passent à la télévision</li>
              <li><strong>Plateformes SVOD</strong> : Trouvez sur quelles plateformes de streaming vos contenus sont disponibles</li>
              <li><strong>Export Excel</strong> : Téléchargez les grilles TV pour consultation hors ligne</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Sources de données</h2>
            <p className="text-gray-700 leading-relaxed">
              Broadcaster utilise l'API The Movie Database (TMDB) pour les informations sur les films 
              et séries, ainsi que d'autres sources pour les données de disponibilité en France. 
              Les informations sont mises à jour régulièrement pour vous garantir des données à jour.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Géolocalisation</h2>
            <p className="text-gray-700 leading-relaxed">
              Broadcaster est conçu spécifiquement pour le marché français. Toutes les informations 
              de disponibilité (cinéma, TV, SVOD) sont filtrées pour ne montrer que les contenus 
              disponibles en France.
            </p>
          </section>

          <div className="pt-6 border-t border-gray-200">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium underline"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
