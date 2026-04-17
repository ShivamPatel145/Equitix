"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SearchIcon, SlidersHorizontal, Star, StarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DASHBOARD_STOCKS,
  STOCK_SECTORS,
  WATCHLIST_STORAGE_KEY,
} from "@/lib/constants";

type SortMode = "relevance" | "gainers" | "losers" | "market-cap";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

const readStoredWatchlist = () => {
  if (typeof window === "undefined") return [] as string[];

  try {
    const storedValue = window.localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!storedValue) return [];

    const parsed = JSON.parse(storedValue) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState<(typeof STOCK_SECTORS)[number]>("All");
  const [sortMode, setSortMode] = useState<SortMode>("relevance");
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(
    readStoredWatchlist,
  );

  const persistWatchlist = (nextValue: string[]) => {
    setWatchlistSymbols(nextValue);
    window.localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(nextValue));
  };

  const toggleWatchlist = (symbol: string) => {
    const alreadyAdded = watchlistSymbols.includes(symbol);
    const nextWatchlist = alreadyAdded
      ? watchlistSymbols.filter((item) => item !== symbol)
      : [...watchlistSymbols, symbol];

    persistWatchlist(nextWatchlist);
  };

  const filteredStocks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const matchingStocks = DASHBOARD_STOCKS.filter((stock) => {
      const sectorMatched = sector === "All" || stock.sector === sector;
      const queryMatched =
        !normalizedQuery ||
        stock.symbol.toLowerCase().includes(normalizedQuery) ||
        stock.company.toLowerCase().includes(normalizedQuery);

      return sectorMatched && queryMatched;
    });

    if (sortMode === "gainers") {
      return [...matchingStocks].sort((a, b) => b.changePercent - a.changePercent);
    }

    if (sortMode === "losers") {
      return [...matchingStocks].sort((a, b) => a.changePercent - b.changePercent);
    }

    if (sortMode === "market-cap") {
      return [...matchingStocks].sort((a, b) => b.marketCapValue - a.marketCapValue);
    }

    if (!normalizedQuery) {
      return matchingStocks;
    }

    return [...matchingStocks].sort((a, b) => {
      const aStartsWith = a.symbol.toLowerCase().startsWith(normalizedQuery) ? 1 : 0;
      const bStartsWith = b.symbol.toLowerCase().startsWith(normalizedQuery) ? 1 : 0;
      return bStartsWith - aStartsWith;
    });
  }, [query, sector, sortMode]);

  const watchlistSet = useMemo(
    () => new Set(watchlistSymbols),
    [watchlistSymbols],
  );

  const averageMove = useMemo(() => {
    if (!filteredStocks.length) return 0;
    const total = filteredStocks.reduce((sum, stock) => sum + stock.changePercent, 0);
    return total / filteredStocks.length;
  }, [filteredStocks]);

  return (
    <div className="space-y-8 pb-8">
      <section className="relative overflow-hidden rounded-3xl border border-gray-700/50 bg-[#0a0a0a] p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,237,190,0.2),transparent_45%)]" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-yellow-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">
              Discover Opportunities
            </p>
            <h1 className="text-3xl font-bold text-gray-100 md:text-4xl">
              Stock Search
            </h1>
            <p className="max-w-2xl text-sm text-gray-400 md:text-base">
              Filter the most active Indian equities by sector, momentum, and market cap.
              Add promising names directly to your watchlist.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">
            <div className="rounded-xl border border-gray-700/60 bg-gray-800/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Results</p>
              <p className="mt-1 text-2xl font-semibold text-gray-100">{filteredStocks.length}</p>
            </div>
            <div className="rounded-xl border border-gray-700/60 bg-gray-800/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Avg Move</p>
              <p
                className={`mt-1 text-2xl font-semibold ${
                  averageMove >= 0 ? "text-teal-400" : "text-red-400"
                }`}
              >
                {averageMove >= 0 ? "+" : ""}
                {averageMove.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-700/50 bg-[#0a0a0a] p-4 md:p-5">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <label className="relative block">
            <span className="sr-only">Search stocks</span>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by symbol or company"
              className="h-11 border-gray-700/70 bg-gray-800/70 pl-10 text-gray-100 placeholder:text-gray-500"
            />
          </label>

          <Select value={sector} onValueChange={(value) => setSector(value as (typeof STOCK_SECTORS)[number])}>
            <SelectTrigger className="h-11 w-full border-gray-700/70 bg-gray-800/70 text-gray-100">
              <SelectValue placeholder="Filter by sector" />
            </SelectTrigger>
            <SelectContent className="border-gray-700/70 bg-gray-800 text-gray-100">
              {STOCK_SECTORS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortMode} onValueChange={(value) => setSortMode(value as SortMode)}>
            <SelectTrigger className="h-11 w-full border-gray-700/70 bg-gray-800/70 text-gray-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-gray-400" />
                <SelectValue placeholder="Sort" />
              </div>
            </SelectTrigger>
            <SelectContent className="border-gray-700/70 bg-gray-800 text-gray-100">
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="gainers">Top Gainers</SelectItem>
              <SelectItem value="losers">Top Losers</SelectItem>
              <SelectItem value="market-cap">Largest Market Cap</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {filteredStocks.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredStocks.map((stock) => {
            const isInWatchlist = watchlistSet.has(stock.symbol);
            const changeClass = stock.changePercent >= 0 ? "text-teal-400" : "text-red-400";

            return (
              <article
                key={stock.symbol}
                className="rounded-2xl border border-gray-700/50 bg-[#0a0a0a] p-5 shadow-xl transition-colors hover:border-teal-500/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                      {stock.exchange}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-gray-100">{stock.symbol}</h2>
                    <p className="mt-1 text-sm text-gray-400">{stock.company}</p>
                  </div>

                  <span className="rounded-full border border-gray-700/70 bg-gray-800 px-2.5 py-1 text-xs text-gray-300">
                    {stock.sector}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-gray-800/70 p-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Price</p>
                    <p className="mt-1 text-lg font-semibold text-gray-100">
                      {formatCurrency(stock.price)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-800/70 p-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Daily Change</p>
                    <p className={`mt-1 text-lg font-semibold ${changeClass}`}>
                      {stock.changePercent >= 0 ? "+" : ""}
                      {stock.changePercent.toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                  <span>Market Cap {stock.marketCapLabel}</span>
                  <span>P/E {stock.peRatio}</span>
                </div>

                <Button
                  type="button"
                  onClick={() => toggleWatchlist(stock.symbol)}
                  variant={isInWatchlist ? "secondary" : "outline"}
                  className={`mt-4 h-10 w-full cursor-pointer border-gray-700 text-sm font-medium ${
                    isInWatchlist
                      ? "bg-teal-500/10 text-teal-300 hover:bg-teal-500/20"
                      : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                  }`}
                >
                  {isInWatchlist ? (
                    <StarOff className="mr-2 h-4 w-4" />
                  ) : (
                    <Star className="mr-2 h-4 w-4" />
                  )}
                  {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                </Button>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="rounded-2xl border border-gray-700/50 bg-[#0a0a0a] p-10 text-center">
          <h3 className="text-xl font-semibold text-gray-100">No matching stocks found</h3>
          <p className="mt-2 text-gray-400">
            Try a different symbol, company name, or sector filter.
          </p>
        </section>
      )}

      <section className="rounded-2xl border border-gray-700/50 bg-[#0a0a0a] p-5 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-100">Review Saved Picks</h3>
            <p className="text-sm text-gray-400">
              {watchlistSymbols.length} stocks currently saved to your watchlist.
            </p>
          </div>
          <Link href="/watchlist">
            <Button className="h-10 cursor-pointer bg-teal-500 text-gray-950 hover:bg-teal-400">
              Open Watchlist
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default SearchPage;
