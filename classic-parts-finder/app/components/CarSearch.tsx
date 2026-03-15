"use client";

import { useState } from "react";

interface CarSearchProps {
  onSearch: (make: string, model: string, year: string) => void;
  isLoading: boolean;
}

const CLASSIC_CARS = [
  { make: "Citroën", model: "DS 21", year: "1970" },
  { make: "Peugeot", model: "504", year: "1975" },
  { make: "Renault", model: "Alpine A110", year: "1973" },
  { make: "Ford", model: "Mustang", year: "1967" },
  { make: "Alfa Romeo", model: "Spider", year: "1972" },
  { make: "Volkswagen", model: "Beetle", year: "1969" },
];

export default function CarSearch({ onSearch, isLoading }: CarSearchProps) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (make && model && year) {
      onSearch(make, model, year);
    }
  };

  const handleQuickSelect = (car: typeof CLASSIC_CARS[0]) => {
    setMake(car.make);
    setModel(car.model);
    setYear(car.year);
    onSearch(car.make, car.model, car.year);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-amber-200 mb-1">
              Marque
            </label>
            <input
              type="text"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              placeholder="ex: Citroën"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-200 mb-1">
              Modèle
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="ex: DS 21"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-200 mb-1">
              Année
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="ex: 1970"
              min="1900"
              max="2000"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !make || !model || !year}
          className="w-full py-3 px-6 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Recherche en cours...
            </>
          ) : (
            <>
              <span>🔍</span> Rechercher pièces & infos
            </>
          )}
        </button>
      </form>

      <div className="mt-6">
        <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">
          Suggestions populaires
        </p>
        <div className="flex flex-wrap gap-2">
          {CLASSIC_CARS.map((car) => (
            <button
              key={`${car.make}-${car.model}`}
              onClick={() => handleQuickSelect(car)}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 rounded-full border border-zinc-700 hover:border-amber-600 transition-colors duration-200"
            >
              {car.year} {car.make} {car.model}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
