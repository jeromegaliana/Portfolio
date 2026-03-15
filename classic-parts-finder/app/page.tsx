"use client";

import { useState } from "react";
import CarSearch from "./components/CarSearch";
import ResultsPanel from "./components/ResultsPanel";

export default function Home() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [carLabel, setCarLabel] = useState("");

  const handleSearch = async (make: string, model: string, year: string) => {
    setContent("");
    setIsLoading(true);
    setCarLabel(`${year} ${make} ${model}`);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ make, model, year }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "text") {
                setContent((prev) => prev + data.text);
              } else if (data.type === "done") {
                setIsLoading(false);
              } else if (data.type === "error") {
                setContent((prev) => prev + `\n\n**Erreur:** ${data.message}`);
                setIsLoading(false);
              }
            } catch {
              // skip malformed SSE lines
            }
          }
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erreur inconnue";
      setContent(`**Erreur de connexion:** ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <span className="text-3xl">🏎️</span>
          <div>
            <h1 className="text-xl font-bold text-amber-400">ClassicParts AI</h1>
            <p className="text-xs text-zinc-500">Trouvez les pièces pour votre voiture ancienne</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Search section */}
        <section className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <h2 className="text-lg font-semibold text-amber-300 mb-5 flex items-center gap-2">
            <span>🔧</span> Quelle voiture cherchez-vous ?
          </h2>
          <CarSearch onSearch={handleSearch} isLoading={isLoading} />
        </section>

        {/* Results section */}
        {(content || isLoading) && (
          <section className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <h2 className="text-lg font-semibold text-amber-300 mb-5 flex items-center gap-2">
              <span>📋</span> Résultats de l&apos;agent
            </h2>
            <ResultsPanel
              content={content}
              isLoading={isLoading}
              carLabel={carLabel}
            />
          </section>
        )}

        {/* Empty state with tips */}
        {!content && !isLoading && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: "🔩",
                title: "Pièces détachées",
                desc: "L'agent trouve les meilleurs fournisseurs spécialisés en ligne et en région",
              },
              {
                icon: "📐",
                title: "Fiche technique",
                desc: "Caractéristiques complètes, points faibles connus, conseils de restauration",
              },
              {
                icon: "🌍",
                title: "Clubs & forums",
                desc: "Liens vers les communautés de passionnés et les annonces de pièces d'occasion",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5"
              >
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="font-semibold text-zinc-200 mb-1">{card.title}</h3>
                <p className="text-sm text-zinc-500">{card.desc}</p>
              </div>
            ))}
          </section>
        )}
      </main>

      <footer className="border-t border-zinc-800 mt-16 py-6 text-center text-zinc-600 text-sm">
        ClassicParts AI — Propulsé par Groq · Llama 3.3 70B
      </footer>
    </div>
  );
}
