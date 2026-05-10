"use client";

import React, { useEffect, useState } from "react";
import GraphView, { GraphData } from "@/components/graph/GraphView";
import { Loader2 } from "lucide-react";

export default function GraphPage() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/mock/graph.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load graph data");
        return res.json() as Promise<GraphData>;
      })
      .then(setGraphData)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white">Knowledge Graph</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Visual map of document relationships, regulations and key entities
            extracted from your data sources.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950/30 p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {!graphData && !error && (
          <div className="flex items-center justify-center h-80">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        )}

        {graphData && (
          <>
            <GraphView data={graphData} />

            {/* Stats row */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                  Nodes
                </p>
                <p className="text-2xl font-semibold text-white">
                  {graphData.nodes.length}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                  Connections
                </p>
                <p className="text-2xl font-semibold text-white">
                  {graphData.edges.length}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                  Documents
                </p>
                <p className="text-2xl font-semibold text-white">
                  {graphData.nodes.filter((n) => n.type === "document").length}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
