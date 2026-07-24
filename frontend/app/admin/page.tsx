"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminApiError, adminApi, tokenStore } from "@/lib/admin-client";
import type { Message, Project } from "@/types/api";
import LoginForm from "@/components/admin/LoginForm";
import ProjectsPanel from "@/components/admin/ProjectsPanel";
import MessagesPanel from "@/components/admin/MessagesPanel";
import ProfilePanel from "@/components/admin/ProfilePanel";

type Tab = "projects" | "messages" | "profile";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setError(null);

    try {
      const [projectList, messageList] = await Promise.all([
        adminApi.listProjects(),
        adminApi.listMessages(),
      ]);

      setProjects(projectList);
      setMessages(messageList.items);
      setAuthed(true);
    } catch (err) {
      if (err instanceof AdminApiError && err.statusCode === 401) {
        tokenStore.clear();
        setAuthed(false);
        return;
      }

      setError(err instanceof Error ? err.message : "Veri yüklenemedi");
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (!tokenStore.access) {
      setAuthed(false);
      return;
    }

    void loadAll();
  }, [loadAll]);

  const handleLogout = async () => {
    await adminApi.logout();
    setAuthed(false);
    setProjects([]);
    setMessages([]);
  };

  if (authed === null) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500 font-mono text-sm">Loading…</p>
      </main>
    );
  }

  if (!authed) {
    return <LoginForm onSuccess={loadAll} />;
  }

  const unreadCount = messages.filter((message) => !message.isRead).length;

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: "projects", label: "Projects" },
    { id: "messages", label: "Messages", badge: unreadCount },
    { id: "profile", label: "Profile" },
  ];

  return (
    <main id="main-content" className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold">
              Admin <span className="gradient-text">Panel</span>
            </h1>
            <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest mt-2">
              Manage site content
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg glass hover:bg-white/10 text-sm text-zinc-300 transition-colors border border-white/10"
          >
            Log out
          </button>
        </div>

        {error && (
          <p className="mb-6 p-4 rounded-xl glass border border-red-500/20 text-red-400 text-sm">
            {error}
          </p>
        )}

        <nav className="flex gap-2 mb-8 border-b border-white/10">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === item.id
                  ? "border-accent text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {item.label}
              {item.badge ? (
                <span className="ml-2 px-1.5 py-0.5 rounded-md bg-accent/20 text-accent text-xs">
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        {tab === "projects" && (
          <ProjectsPanel projects={projects} onChanged={loadAll} />
        )}
        {tab === "messages" && (
          <MessagesPanel messages={messages} onChanged={loadAll} />
        )}
        {tab === "profile" && <ProfilePanel />}
      </div>
    </main>
  );
}
