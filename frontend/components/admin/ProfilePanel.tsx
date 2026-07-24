"use client";

import { useEffect, useState } from "react";
import { AdminApiError, adminApi } from "@/lib/admin-client";
import type { Profile } from "@/types/api";

const inputClass =
  "w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-accent/50 transition-colors";
const labelClass = "block text-sm text-zinc-400 mb-2";

export default function ProfilePanel() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .getProfile()
      .then(setProfile)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Profil yüklenemedi"),
      );
  }, []);

  if (error && !profile) {
    return <p className="text-red-400 text-sm">{error}</p>;
  }

  if (!profile) {
    return <p className="text-zinc-500 font-mono text-sm">Loading…</p>;
  }

  const update = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setProfile((current) => (current ? { ...current, [key]: value } : current));

  const save = async () => {
    setSaving(true);
    setStatus(null);
    setError(null);

    try {
      const updated = await adminApi.updateProfile({
        fullName: profile.fullName,
        headline: profile.headline,
        heroDescription: profile.heroDescription,
        aboutParagraphs: profile.aboutParagraphs,
        aboutTags: profile.aboutTags,
        email: profile.email,
        location: profile.location,
        githubUrl: profile.githubUrl,
        linkedinUrl: profile.linkedinUrl,
        metaTitle: profile.metaTitle,
        metaDescription: profile.metaDescription,
      });

      setProfile(updated);
      setStatus("Saved.");
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Kaydedilemedi");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/10 space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass} htmlFor="pr-name">
            Full name
          </label>
          <input
            id="pr-name"
            className={inputClass}
            value={profile.fullName}
            onChange={(e) => update("fullName", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="pr-headline">
            Headline
          </label>
          <input
            id="pr-headline"
            className={inputClass}
            value={profile.headline}
            onChange={(e) => update("headline", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="pr-hero">
          Hero description
        </label>
        <textarea
          id="pr-hero"
          rows={3}
          className={`${inputClass} resize-none`}
          value={profile.heroDescription}
          onChange={(e) => update("heroDescription", e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="pr-about">
          About paragraphs (one per line)
        </label>
        <textarea
          id="pr-about"
          rows={6}
          className={`${inputClass} resize-none`}
          value={profile.aboutParagraphs.join("\n")}
          onChange={(e) =>
            update(
              "aboutParagraphs",
              e.target.value.split("\n").map((line) => line.trim()).filter(Boolean),
            )
          }
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="pr-tags">
          About tags (comma separated)
        </label>
        <input
          id="pr-tags"
          className={inputClass}
          value={profile.aboutTags.join(", ")}
          onChange={(e) =>
            update(
              "aboutTags",
              e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean),
            )
          }
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass} htmlFor="pr-email">
            Email
          </label>
          <input
            id="pr-email"
            type="email"
            className={inputClass}
            value={profile.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="pr-location">
            Location
          </label>
          <input
            id="pr-location"
            className={inputClass}
            value={profile.location ?? ""}
            onChange={(e) => update("location", e.target.value || null)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="pr-github">
            GitHub URL
          </label>
          <input
            id="pr-github"
            className={inputClass}
            value={profile.githubUrl ?? ""}
            onChange={(e) => update("githubUrl", e.target.value || null)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="pr-linkedin">
            LinkedIn URL
          </label>
          <input
            id="pr-linkedin"
            className={inputClass}
            value={profile.linkedinUrl ?? ""}
            onChange={(e) => update("linkedinUrl", e.target.value || null)}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass} htmlFor="pr-meta-title">
            Meta title (SEO)
          </label>
          <input
            id="pr-meta-title"
            className={inputClass}
            value={profile.metaTitle ?? ""}
            onChange={(e) => update("metaTitle", e.target.value || null)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="pr-meta-desc">
            Meta description (SEO)
          </label>
          <input
            id="pr-meta-desc"
            className={inputClass}
            value={profile.metaDescription ?? ""}
            onChange={(e) => update("metaDescription", e.target.value || null)}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-light text-white text-sm font-medium transition-all disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {status && <p className="text-sm text-emerald-400">{status}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
