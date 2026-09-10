import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProject, renameProject, uploadProjectAsset, logout } from "@/app/auth-actions";
import { getDb } from "@/shared/db/client";
import { requireUser } from "@/shared/auth/session";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const project = await getDb().project.findFirst({ where: { id, userId: user.id }, include: { assets: { orderBy: { createdAt: "desc" } } } });
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
            <h2>Фотографии проекта</h2>
            <form className="upload-form" action={uploadProjectAsset}>
              <input type="hidden" name="projectId" value={project.id} />
              <input name="file" type="file" accept="image/*" required />
              <button className="button" type="submit">Загрузить фото</button>
              <p className="field-hint">PNG, JPG или WEBP, до 10 МБ.</p>
            </form>
            {project.assets.length > 0 && <div className="asset-grid">{project.assets.map((asset) => <figure key={asset.id}><img src={`/uploads/${user.id}/${project.id}/${asset.fileName}`} alt={asset.originalName} /><figcaption>{asset.originalName}</figcaption></figure>)}</div>}
          </div>
        </section>
      </section>
    </main>
  );
}
