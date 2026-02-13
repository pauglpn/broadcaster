export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center py-16 px-8">
        <div className="flex flex-col items-center gap-8 text-center">
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-black dark:text-zinc-50">
            Broadcaster
          </h1>
          <p className="max-w-2xl text-xl leading-8 text-zinc-600 dark:text-zinc-400">
            Trouvez où et quand regarder vos films et séries préférés en France
          </p>
        </div>
      </main>
    </div>
  );
}
