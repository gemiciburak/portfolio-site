"use client";

import { useState } from "react";
import { adminApi } from "@/lib/admin-client";
import type { Message } from "@/types/api";

export default function MessagesPanel({
  messages,
  onChanged,
}: {
  messages: Message[];
  onChanged: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);

  const toggleRead = async (message: Message) => {
    setBusyId(message.id);
    try {
      await adminApi.markMessageRead(message.id, !message.isRead);
      onChanged();
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (message: Message) => {
    if (!window.confirm(`Delete the message from ${message.name}?`)) return;

    setBusyId(message.id);
    try {
      await adminApi.deleteMessage(message.id);
      onChanged();
    } finally {
      setBusyId(null);
    }
  };

  if (messages.length === 0) {
    return (
      <p className="glass rounded-xl p-8 text-center text-zinc-500 border border-white/5">
        No messages yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <article
          key={message.id}
          className={`glass-strong rounded-2xl p-6 border transition-colors ${
            message.isRead ? "border-white/10" : "border-accent/30"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
            <div>
              <p className="font-medium text-white">
                {message.name}
                {!message.isRead && (
                  <span className="ml-3 px-2 py-0.5 rounded-md bg-accent/20 text-accent text-xs align-middle">
                    New
                  </span>
                )}
              </p>
              <a
                href={`mailto:${message.email}`}
                className="text-sm text-zinc-400 hover:text-accent transition-colors"
              >
                {message.email}
              </a>
            </div>
            <time className="text-xs font-mono text-zinc-500">
              {new Date(message.createdAt).toLocaleString("en-GB")}
            </time>
          </div>

          <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap mb-4">
            {message.message}
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => toggleRead(message)}
              disabled={busyId === message.id}
              className="px-4 py-2 rounded-lg glass hover:bg-white/10 text-sm text-zinc-300 transition-colors border border-white/10 disabled:opacity-50"
            >
              Mark as {message.isRead ? "unread" : "read"}
            </button>
            <button
              type="button"
              onClick={() => remove(message)}
              disabled={busyId === message.id}
              className="px-4 py-2 rounded-lg glass hover:bg-red-500/10 text-sm text-red-400 transition-colors border border-red-500/20 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
