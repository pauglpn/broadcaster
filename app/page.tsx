import SearchForm from '@/components/SearchForm';
import Navigation from '@/components/Navigation';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="flex min-h-screen w-full max-w-4xl mx-auto flex-col items-center justify-center py-16 px-8">
        <div className="flex flex-col items-center gap-8 text-center mb-12">
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-black">
            Broadcaster
          </h1>
          <p className="max-w-2xl text-xl leading-8 text-gray-600">
            Trouvez où et quand regarder vos films et séries préférés en France
          </p>
        </div>
        <SearchForm />
      </main>
    </div>
  );
}
