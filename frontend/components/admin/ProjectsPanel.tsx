"use client";

import { useState } from "react";
import { AdminApiError, adminApi } from "@/lib/admin-client";
import type { Project } from "@/types/api";

const EMPTY_DRAFT = {
  slug: "",
  title: "",
  summary: "",
  description: "",
  techStack: "",
  highlights: "",
  imageUrl: "",
  githubUrl: "",
  liveUrl: "",
  featured: true,
  status: "PUBLISHED" as const,
  sortOrder: 0,
};

type Draft = typeof EMPTY_DRAFT;

function toDraft(project: Project): Draft {
  return {
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    description: project.description ?? "",
    // Diziler formda satır satır düzenlenir.
    techStack: project.techStack.join("\n"),
    highlights: project.highlights.join("\n"),
    imageUrl: project.imageUrl ?? "",
    githubUrl: project.githubUrl ?? "",
    liveUrl: project.liveUrl ?? "",
    featured: project.featured,
    status: project.status as "PUBLISHED",
    sortOrder: project.sortOrder,
  };
}

/** Boş string'i null'a çevirir: API opsiyonel alanlarda URL formatı bekler. */
function nullIfBlank(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function toLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const inputClass =
  "w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-accent/50 transition-colors";
const labelClass = "block text-sm text-zinc-400 mb-2";

export default function ProjectsPanel({
  projects,
  onChanged,
}: {
  projects: Project[];
  onChanged: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const startCreate = () => {
    setEditingId("new");
    setDraft({ ...EMPTY_DRAFT, sortOrder: projects.length });
    setError(null);
    setFieldErrors({});
  };

  const startEdit = (project: Project) => {
    setEditingId(project.id);
    setDraft(toDraft(project));
    setError(null);
    setFieldErrors({});
  };

  const cancel = () => {
    setEditingId(null);
    setDraft(null);
    setError(null);
    setFieldErrors({});
  };

  const save = async () => {
    if (!draft || !editingId) return;

    setSaving(true);
    setError(null);
    setFieldErrors({});

    const payload = {
      slug: draft.slug.trim(),
      title: draft.title.trim(),
      summary: draft.summary.trim(),
      description: nullIfBlank(draft.description),
      techStack: toLines(draft.techStack),
      highlights: toLines(draft.highlights),
      imageUrl: nullIfBlank(draft.imageUrl),
      githubUrl: nullIfBlank(draft.githubUrl),
      liveUrl: nullIfBlank(draft.liveUrl),
      featured: draft.featured,
      status: draft.status,
      sortOrder: Number(draft.sortOrder) || 0,
    };

    try {
      if (editingId === "new") {
        await adminApi.createProject(payload);
      } else {
        await adminApi.updateProject(editingId, payload);
      }

      cancel();
      onChanged();
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors ?? {});
      } else {
        setError(err instanceof Error ? err.message : "Kaydedilemedi");
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async (project: Project) => {
    if (!window.confirm(`Delete "${project.title}"?`)) return;

    await adminApi.deleteProject(project.id);
    onChanged();
  };

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => (current ? { ...current, [key]: value } : current));

  return (
    <div className="space-y-6">
      {!editingId && (
        <button
          type="button"
          onClick={startCreate}
          className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-light text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-accent/25"
        >
          + New project
        </button>
      )}

      {draft && (
        <div className="glass-strong rounded-2xl p-6 border border-accent/30 space-y-5">
          <h2 className="text-lg font-semibold">
            {editingId === "new" ? "New project" : "Edit project"}
          </h2>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass} htmlFor="p-title">
                Title
              </label>
              <input
                id="p-title"
                className={inputClass}
                value={draft.title}
                onChange={(e) => update("title", e.target.value)}
              />
              {fieldErrors.title && (
                <p className="mt-2 text-sm text-red-400">{fieldErrors.title[0]}</p>
              )}
            </div>
            <div>
              <label className={labelClass} htmlFor="p-slug">
                Slug (URL)
              </label>
              <input
                id="p-slug"
                className={inputClass}
                value={draft.slug}
                onChange={(e) => update("slug", e.target.value)}
                placeholder="my-project"
              />
              {fieldErrors.slug && (
                <p className="mt-2 text-sm text-red-400">{fieldErrors.slug[0]}</p>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="p-summary">
              Summary (card text)
            </label>
            <textarea
              id="p-summary"
              rows={2}
              className={`${inputClass} resize-none`}
              value={draft.summary}
              onChange={(e) => update("summary", e.target.value)}
            />
            {fieldErrors.summary && (
              <p className="mt-2 text-sm text-red-400">{fieldErrors.summary[0]}</p>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="p-description">
              Description (detail page)
            </label>
            <textarea
              id="p-description"
              rows={4}
              className={`${inputClass} resize-none`}
              value={draft.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass} htmlFor="p-tech">
                Tech stack (one per line)
              </label>
              <textarea
                id="p-tech"
                rows={5}
                className={`${inputClass} resize-none font-mono text-sm`}
                value={draft.techStack}
                onChange={(e) => update("techStack", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="p-highlights">
                Highlights (one per line)
              </label>
              <textarea
                id="p-highlights"
                rows={5}
                className={`${inputClass} resize-none font-mono text-sm`}
                value={draft.highlights}
                onChange={(e) => update("highlights", e.target.value)}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            <div>
              <label className={labelClass} htmlFor="p-image">
                Image URL
              </label>
              <input
                id="p-image"
                className={inputClass}
                value={draft.imageUrl}
                onChange={(e) => update("imageUrl", e.target.value)}
                placeholder="/projects/x.png"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="p-github">
                GitHub URL
              </label>
              <input
                id="p-github"
                className={inputClass}
                value={draft.githubUrl}
                onChange={(e) => update("githubUrl", e.target.value)}
              />
              {fieldErrors.githubUrl && (
                <p className="mt-2 text-sm text-red-400">{fieldErrors.githubUrl[0]}</p>
              )}
            </div>
            <div>
              <label className={labelClass} htmlFor="p-live">
                Live URL
              </label>
              <input
                id="p-live"
                className={inputClass}
                value={draft.liveUrl}
                onChange={(e) => update("liveUrl", e.target.value)}
              />
              {fieldErrors.liveUrl && (
                <p className="mt-2 text-sm text-red-400">{fieldErrors.liveUrl[0]}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(e) => update("featured", e.target.checked)}
                className="w-4 h-4 accent-[#6366f1]"
              />
              Featured on home page
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              Status
              <select
                value={draft.status}
                onChange={(e) => update("status", e.target.value as "PUBLISHED")}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent/50"
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              Order
              <input
                type="number"
                value={draft.sortOrder}
                onChange={(e) => update("sortOrder", Number(e.target.value))}
                className="w-20 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent/50"
              />
            </label>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-light text-white text-sm font-medium transition-all disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="px-5 py-2.5 rounded-xl glass hover:bg-white/10 text-sm text-zinc-300 transition-colors border border-white/10"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="glass rounded-xl p-5 border border-white/5 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <p className="font-medium text-white flex items-center gap-3">
                {project.title}
                {project.status === "DRAFT" && (
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-zinc-400 text-xs">
                    Draft
                  </span>
                )}
                {project.featured && (
                  <span className="px-2 py-0.5 rounded-md bg-accent/20 text-accent text-xs">
                    Featured
                  </span>
                )}
              </p>
              <p className="text-sm text-zinc-500 font-mono mt-1">/{project.slug}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => startEdit(project)}
                className="px-4 py-2 rounded-lg glass hover:bg-white/10 text-sm text-zinc-300 transition-colors border border-white/10"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove(project)}
                className="px-4 py-2 rounded-lg glass hover:bg-red-500/10 text-sm text-red-400 transition-colors border border-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
