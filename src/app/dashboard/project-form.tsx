"use client";

import { createProject } from "@/app/auth-actions";

export function ProjectForm() {
  return (
    <form className="project-form" action={createProject}>
      <label htmlFor="project-name">Новый проект</label>
      <div className="project-form-row">
        <input
          id="project-name"
          name="name"
          type="text"
          placeholder="Например, керамическая ваза"
          minLength={2}
          maxLength={80}
          required
        />
        <button className="button" type="submit">
          Создать
        </button>
      </div>
      <p className="field-hint">От 2 до 80 символов.</p>
    </form>
  );
}
