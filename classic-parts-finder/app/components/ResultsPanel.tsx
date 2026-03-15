"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

interface ResultsPanelProps {
  content: string;
  isLoading: boolean;
  carLabel: string;
}

export default function ResultsPanel({ content, isLoading, carLabel }: ResultsPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [content, isLoading]);

  if (!content && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-600">
        <div className="text-6xl mb-4">🚗</div>
        <p className="text-lg">Entrez les détails de votre voiture pour commencer</p>
        <p className="text-sm mt-2">L&apos;agent cherchera des specs et des sources de pièces sur le web</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {carLabel && (
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-700" />
          <span className="text-amber-500 font-semibold text-sm uppercase tracking-wider">
            {carLabel}
          </span>
          <div className="h-px flex-1 bg-zinc-700" />
        </div>
      )}

      <div className="prose prose-invert prose-amber max-w-none
        prose-headings:text-amber-400
        prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
        prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-amber-200
        prose-ul:text-zinc-300
        prose-li:marker:text-amber-500
        prose-code:text-amber-300 prose-code:bg-zinc-800 prose-code:px-1 prose-code:rounded
        prose-blockquote:border-amber-600 prose-blockquote:text-zinc-400
      ">
        <ReactMarkdown
          components={{
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 hover:underline"
              >
                {children}
                <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 mt-4 text-amber-500">
          <span className="inline-flex gap-1">
            <span className="animate-bounce" style={{ animationDelay: "0ms" }}>●</span>
            <span className="animate-bounce" style={{ animationDelay: "150ms" }}>●</span>
            <span className="animate-bounce" style={{ animationDelay: "300ms" }}>●</span>
          </span>
          <span className="text-sm text-zinc-500">L&apos;agent recherche sur le web...</span>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
