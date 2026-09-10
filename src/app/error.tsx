"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="shell workspace">
      <h1>Не удалось открыть страницу</h1>
      <p>Сервис временно недоступен. Попробуйте ещё раз позже.</p>
      <button className="button" onClick={reset}>
        Повторить
      </button>
    </main>
  );
}
