import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProject, renameProject, uploadProjectAsset, deleteProjectAsset, saveProjectBrief, generateProjectConcept, logout } from "@/app/auth-actions";
import { getDb } from "@/shared/db/client";
import { requireUser } from "@/shared/auth/session";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const project = await getDb().project.findFirst({ where: { id, userId: user.id }, include: { assets: { orderBy: { createdAt: "desc" } }, concepts: { orderBy: { createdAt: "desc" } } } });
  if (!project) notFound();
  return (
    <main className="shell">
      <header className="masthead">
        <Link className="brand" href="/dashboard">предмет<span> / studio</span></Link>
        <form action={logout}><button className="button secondary" type="submit">Выйти</button></form>
      </header>
      <section className="workspace">
        <Link href="/dashboard">← Все проекты</Link>
        <p className="eyebrow">Проект</p>
        <h1>{project.name}</h1>
        <p className="intro">Здесь будут храниться фотографии, варианты генерации и материалы проекта.</p>
        <section className="projects-panel project-detail-panel">
          <h2>Настройки проекта</h2>
          <form className="project-form" action={renameProject}>
            <input type="hidden" name="id" value={project.id} />
            <label htmlFor="project-name">Название</label>
            <div className="project-form-row"><input id="project-name" name="name" defaultValue={project.name} minLength={2} maxLength={80} required /><button className="button" type="submit">Сохранить</button></div>
          </form>
          <div className="project-actions">
            <p className="field-hint">Следующий шаг — добавить фотографии товара.</p>
            <form action={deleteProject}><input type="hidden" name="id" value={project.id} /><button className="button danger" type="submit">Удалить проект</button></form>
          </div>
          <div className="asset-section">
            <h2>Бриф проекта</h2>
            <form className="brief-form" action={saveProjectBrief}>
              <input type="hidden" name="projectId" value={project.id} />
              <label htmlFor="description">Что создаём?</label><textarea id="description" name="description" defaultValue={project.description ?? ""} maxLength={1000} placeholder="Например: предметные фотографии керамических ваз" />
              <label htmlFor="audience">Для кого?</label><input id="audience" name="audience" defaultValue={project.audience ?? ""} maxLength={1000} placeholder="Например: владельцы уютных квартир" />
              <label htmlFor="style">Желаемый стиль</label><input id="style" name="style" defaultValue={project.style ?? ""} maxLength={1000} placeholder="Например: тёплый минимализм" />
              <button className="button" type="submit">Сохранить бриф</button>
            </form>
            <h2>Фотографии проекта</h2>
            <form className="upload-form" action={uploadProjectAsset}>
              <input type="hidden" name="projectId" value={project.id} />
              <input name="file" type="file" accept="image/*" required />
              <button className="button" type="submit">Загрузить фото</button>
              <p className="field-hint">PNG, JPG или WEBP, до 10 МБ.</p>
            </form>
            {project.assets.length > 0 && <div className="asset-grid">{project.assets.map((asset) => <figure key={asset.id}><a href={`/uploads/${user.id}/${project.id}/${asset.fileName}`} target="_blank" rel="noreferrer"><img src={`/uploads/${user.id}/${project.id}/${asset.fileName}`} alt={asset.originalName} /></a><figcaption><span>{asset.originalName}</span><form action={deleteProjectAsset}><input type="hidden" name="assetId" value={asset.id} /><button className="asset-delete" type="submit">Удалить</button></form></figcaption></figure>)}</div>}
            <div className="concept-section">
              <div className="section-heading"><div><h2>Черновая генерация</h2><p className="field-hint">Создайте текстовую концепцию из брифа и материалов проекта.</p></div><form action={generateProjectConcept}><input type="hidden" name="projectId" value={project.id} /><button className="button" type="submit">Создать концепцию</button></form></div>
              {project.concepts.map((concept) => <article className="concept-card" key={concept.id}><h3>{concept.title}</h3><p>{concept.description}</p><small>{new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeZone: "UTC" }).format(concept.createdAt)}</small></article>)}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
