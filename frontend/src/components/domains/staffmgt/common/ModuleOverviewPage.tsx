import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/domains/aacommon/index.js";
import { Search, RefreshCcw, ChevronDown, ClipboardList, Sparkles, ShieldCheck, UserCheck, SlidersHorizontal } from "lucide-react";

interface ModuleOverviewPageProps {
  title: string;
  description: string;
  fetcher: (params?: any) => Promise<any>;
  badgeKey?: string;
  highlightKey?: string;
}

export function ModuleOverviewPage({ title, description, fetcher, badgeKey, highlightKey }: ModuleOverviewPageProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRaw, setShowRaw] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetcher();
      const records = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : Array.isArray(response?.records)
        ? response.records
        : [];
      setData(records);
    } catch (err) {
      console.error(err);
      setError("Unable to load records. Try refreshing the page.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0])
      .filter((key) => key !== "id" && key !== badgeKey)
      .slice(0, 6);
  }, [data, badgeKey]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value ?? "").toLowerCase().includes(term)
      )
    );
  }, [data, searchTerm]);

  const summaryItems = useMemo(() => {
    const total = data.length;
    const badgeSummary = badgeKey
      ? Object.entries(
          data.reduce((acc, item) => {
            const value = String(item[badgeKey] ?? "Unknown");
            acc[value] = (acc[value] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        )
      : [];

    return [
      { label: "Total Records", value: total },
      { label: badgeKey ? `By ${badgeKey}` : "Active records", value: badgeSummary.length },
    ];
  }, [data, badgeKey]);

  const highlightValue = useMemo(() => {
    if (!highlightKey || !data || data.length === 0) return null;
    return data[0][highlightKey] ?? null;
  }, [data, highlightKey]);

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-[2rem] bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-500 px-8 py-8 text-white shadow-lg shadow-cyan-500/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-100/80">Staff Management</p>
            <h1 className="text-4xl font-black leading-tight">{title}</h1>
            <p className="mt-3 max-w-2xl text-cyan-100/90 text-sm sm:text-base">{description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button className="bg-white text-cyan-700 hover:bg-slate-100 shadow-cyan-400/20" onClick={loadData}>
              <RefreshCcw className="w-4 h-4" /> Refresh
            </Button>
            <Button className="bg-cyan-700 text-white hover:bg-cyan-800 shadow-cyan-800/30">
              <Sparkles className="w-4 h-4" /> New Action
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-cyan-100 bg-white/90 p-5 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Search records</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-500" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, type, status or ID"
                  className="w-full rounded-full border border-cyan-200 bg-cyan-50/80 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:w-auto sm:grid-cols-3">
              {summaryItems.map((item) => (
                <div key={item.label} className="rounded-3xl bg-cyan-50 px-4 py-3 text-sm text-slate-700 shadow-sm border border-cyan-100">
                  <p className="font-medium text-slate-900">{item.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-cyan-600/80">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-cyan-50 px-5 py-4">
              <div className="flex items-center gap-2 text-cyan-700">
                <ClipboardList className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Record overview</h2>
              </div>
              <Button className="bg-cyan-700 text-white hover:bg-cyan-800">View all</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    {(badgeKey ? [badgeKey, ...columns] : columns).map((column) => (
                      <th key={column} className="px-4 py-3 text-xs uppercase tracking-[0.16em] text-slate-500">
                        {column.replace(/_/g, " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-slate-500">
                        Loading records...
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-slate-500">
                        No records found.
                      </td>
                    </tr>
                  ) : (
                    filteredData.slice(0, 10).map((item, index) => (
                      <tr key={index} className="border-t border-slate-100 hover:bg-cyan-50/40 transition-colors">
                        {badgeKey && (
                          <td className="px-4 py-4 align-top text-sm text-slate-700">
                            <span className="inline-flex rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
                              {String(item[badgeKey] ?? "Unknown")}
                            </span>
                          </td>
                        )}
                        {columns.map((column) => (
                          <td key={column} className="px-4 py-4 align-top text-sm text-slate-700">
                            {String(item[column] ?? "—")}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-cyan-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 text-cyan-700">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="text-base font-semibold">Spotlight</h3>
            </div>
            <p className="mt-3 text-sm text-slate-600">{highlightKey ? `Highlighting field ${highlightKey} from the latest record.` : "A quick snapshot of the latest dataset."}</p>
            {highlightValue !== null && (
              <div className="mt-4 rounded-3xl bg-cyan-50 p-4 text-slate-900">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-700/80">Latest {highlightKey}</p>
                <p className="mt-2 text-xl font-semibold">{String(highlightValue)}</p>
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-cyan-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 text-cyan-700">
              <SlidersHorizontal className="h-5 w-5" />
              <h3 className="text-base font-semibold">Insights</h3>
            </div>
            <p className="mt-3 text-sm text-slate-600">Pull dynamic insights from the dataset and use them to shape the next iteration of your staff workflows.</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-cyan-500" />Fast-loading overview cards</li>
              <li className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-cyan-500" />Smart search across record fields</li>
              <li className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-cyan-500" />Ready for deeper action flows</li>
            </ul>
          </div>

          <div className="rounded-[2rem] border border-cyan-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-cyan-700">
                <Sparkles className="h-5 w-5" />
                <h3 className="text-base font-semibold">Raw preview</h3>
              </div>
              <Button className="bg-cyan-700 text-white hover:bg-cyan-800" onClick={() => setShowRaw((current) => !current)}>
                {showRaw ? "Hide" : "Show"}
                <ChevronDown className={`w-4 h-4 transition-transform ${showRaw ? "rotate-180" : "rotate-0"}`} />
              </Button>
            </div>
            {showRaw && (
              <pre className="mt-4 max-h-72 overflow-auto rounded-3xl border border-slate-200 bg-slate-950/95 p-4 text-xs text-slate-100">
                {JSON.stringify(filteredData.slice(0, 6), null, 2)}
              </pre>
            )}
          </div>
        </aside>
      </div>

      {error && <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}
    </div>
  );
}

export default ModuleOverviewPage;
