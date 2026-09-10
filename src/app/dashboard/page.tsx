import Link from "next/link";
import { requireUser } from "@/shared/auth/session";
import { logout } from "@/app/auth-actions";
import { getDb } from "@/shared/db/client";
import { ProjectForm } from "./project-form";
export const metadata = { title: "Личный кабинет — Предмет" };

export default async function Dashboard() {
  const user = await requireUser();
  const projects = await getDb().project.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, createdAt: true },
  });
  return (
    <main className="shell">
      <header className="masthead">
        <Link className="brand" href="/">
          предмет<span> / studio</span>
        </Link>
        <form action={logout}>
          <button className="button secondary" type="submit">
            Выйти
          </button>
        </form>
      </header>
      <section className="workspace">
        <p className="eyebrow">Личный кабинет</p>
        <h1>Добро пожаловать в студию</h1>
        <p className="account-email">{user.email}</p>
        <p className="field-hint">
          Аккаунт создан{" "}
          {new Intl.DateTimeFormat("ru-RU", {
            dateStyle: "long",
            timeZone: "UTC",
          }).format(user.createdAt)}
        </p>
        <section className="projects-panel" aria-labelledby="projects-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Рабочее пространство</p>
              <h2 id="projects-title">Проекты</h2>
            </div>
            <span className="project-count">{projects.length}</span>
          </div>
          <ProjectForm />
          {projects.length === 0 ? (
            <div className="empty-state">
              <h3>Здесь появится ваш первый проект</h3>
              <p>Назовите проект, чтобы позже добавить фотографии товара.</p>
              <Link href="/">Узнать о студии</Link>
            </div>
          ) : (
            <ul className="project-list">
              {projects.map((project) => (
                <li key={project.id}>
                  <div>
                    <strong>{project.name}</strong>
                    <span>
                      Создан{" "}
                      {new Intl.DateTimeFormat("ru-RU", {
                        dateStyle: "long",
                        timeZone: "UTC",
                      }).format(project.createdAt)}
                    </span>
                  </div>
                  <span className="project-status">Подготовка</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}
