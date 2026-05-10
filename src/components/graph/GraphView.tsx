"use client";

import React, { useState, useCallback, useRef } from "react";

export interface GraphNode {
  id: string;
  label: string;
  type: "document" | "regulation" | "entity";
  x: number;
  y: number;
  size?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  weight: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const NODE_RADIUS = 38;
const CANVAS_W = 820;
const CANVAS_H = 600;
const VIEWBOX_PADDING = 20;

const NODE_COLORS: Record<GraphNode["type"], { fill: string; stroke: string; text: string }> = {
  document: { fill: "#1e40af", stroke: "#3b82f6", text: "#eff6ff" },
  regulation: { fill: "#9a3412", stroke: "#f97316", text: "#fff7ed" },
  entity: { fill: "#065f46", stroke: "#10b981", text: "#ecfdf5" },
};

const LEGEND_ITEMS: { type: GraphNode["type"]; label: string }[] = [
  { type: "document", label: "Document" },
  { type: "regulation", label: "Regulation" },
  { type: "entity", label: "Entity" },
];

function getNodeById(nodes: GraphNode[], id: string): GraphNode | undefined {
  return nodes.find((n) => n.id === id);
}

function edgePath(source: GraphNode, target: GraphNode): string {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return "";
  const ux = dx / dist;
  const uy = dy / dist;
  const x1 = source.x + ux * NODE_RADIUS;
  const y1 = source.y + uy * NODE_RADIUS;
  const x2 = target.x - ux * (NODE_RADIUS + 8);
  const y2 = target.y - uy * (NODE_RADIUS + 8);
  return `M ${x1} ${y1} L ${x2} ${y2}`;
}

function edgeLabelPoint(
  source: GraphNode,
  target: GraphNode
): { x: number; y: number } {
  return {
    x: (source.x + target.x) / 2,
    y: (source.y + target.y) / 2,
  };
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  content: string;
}

export default function GraphView({ data }: { data: GraphData }) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: "",
  });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleNodeMouseEnter = useCallback(
    (node: GraphNode, e: React.MouseEvent<SVGGElement>) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const sizeLabel = node.size
        ? ` · ${(node.size / 1024).toFixed(1)} KB`
        : "";
      setTooltip({
        visible: true,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 12,
        content: `${node.label}${sizeLabel}`,
      });
    },
    []
  );

  const handleNodeMouseLeave = useCallback(() => {
    setTooltip((t) => ({ ...t, visible: false }));
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNode((prev) => (prev === nodeId ? null : nodeId));
  }, []);

  const isHighlighted = useCallback(
    (edgeOrNodeId: string, kind: "node" | "edge"): boolean => {
      if (!selectedNode) return true;
      if (kind === "node") return edgeOrNodeId === selectedNode;
      const edge = data.edges.find((e) => e.id === edgeOrNodeId);
      return !!edge && (edge.source === selectedNode || edge.target === selectedNode);
    },
    [selectedNode, data.edges]
  );

  const highlightedNeighbours = useCallback(
    (nodeId: string): boolean => {
      if (!selectedNode) return true;
      if (nodeId === selectedNode) return true;
      return data.edges.some(
        (e) =>
          (e.source === selectedNode && e.target === nodeId) ||
          (e.target === selectedNode && e.source === nodeId)
      );
    },
    [selectedNode, data.edges]
  );

  return (
    <div className="relative w-full">
      {/* Legend */}
      <div className="flex gap-4 mb-3 flex-wrap">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.type} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full border"
              style={{
                backgroundColor: NODE_COLORS[item.type].fill,
                borderColor: NODE_COLORS[item.type].stroke,
              }}
            />
            <span className="text-xs text-zinc-400">{item.label}</span>
          </div>
        ))}
        {selectedNode && (
          <button
            className="ml-auto text-xs text-zinc-500 hover:text-white underline"
            onClick={() => setSelectedNode(null)}
          >
            Clear selection
          </button>
        )}
      </div>

      {/* Graph */}
      <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
        <svg
          ref={svgRef}
          viewBox={`${-VIEWBOX_PADDING} ${-VIEWBOX_PADDING} ${CANVAS_W + VIEWBOX_PADDING * 2} ${CANVAS_H + VIEWBOX_PADDING * 2}`}
          className="w-full"
          style={{ minHeight: 420 }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#52525b" />
            </marker>
            <marker
              id="arrowhead-highlight"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#10b981" />
            </marker>
          </defs>

          {/* Edges */}
          {data.edges.map((edge) => {
            const src = getNodeById(data.nodes, edge.source);
            const tgt = getNodeById(data.nodes, edge.target);
            if (!src || !tgt) return null;
            const highlighted = isHighlighted(edge.id, "edge");
            const d = edgePath(src, tgt);
            const mid = edgeLabelPoint(src, tgt);
            return (
              <g key={edge.id} opacity={highlighted ? 1 : 0.15}>
                <path
                  d={d}
                  stroke={highlighted && selectedNode ? "#10b981" : "#3f3f46"}
                  strokeWidth={highlighted && selectedNode ? 2 : 1.5}
                  fill="none"
                  markerEnd={
                    highlighted && selectedNode
                      ? "url(#arrowhead-highlight)"
                      : "url(#arrowhead)"
                  }
                />
                <text
                  x={mid.x}
                  y={mid.y - 4}
                  textAnchor="middle"
                  fill="#71717a"
                  fontSize={10}
                  className="select-none"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {data.nodes.map((node) => {
            const colors = NODE_COLORS[node.type];
            const active = highlightedNeighbours(node.id);
            const selected = selectedNode === node.id;
            const words = node.label.split(" ");
            const lines: string[] =
              words.length > 2
                ? [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")]
                : [node.label];

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                style={{ cursor: "pointer" }}
                onClick={() => handleNodeClick(node.id)}
                onMouseEnter={(e) => handleNodeMouseEnter(node, e)}
                onMouseLeave={handleNodeMouseLeave}
                opacity={active ? 1 : 0.2}
              >
                {/* Glow ring when selected */}
                {selected && (
                  <circle
                    r={NODE_RADIUS + 6}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth={2}
                    strokeDasharray="4 3"
                    opacity={0.7}
                  />
                )}
                <circle
                  r={NODE_RADIUS}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={selected ? 2.5 : 1.5}
                />
                {lines.map((line, i) => (
                  <text
                    key={i}
                    textAnchor="middle"
                    fill={colors.text}
                    fontSize={10}
                    fontWeight={600}
                    dy={lines.length === 1 ? "0.35em" : i === 0 ? "-0.35em" : "0.85em"}
                    className="select-none"
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>

        {/* SVG tooltip */}
        {tooltip.visible && (
          <div
            className="pointer-events-none absolute z-10 rounded bg-zinc-800 px-2 py-1 text-xs text-white shadow-lg"
            style={{ left: tooltip.x + 12, top: tooltip.y - 28 }}
          >
            {tooltip.content}
          </div>
        )}
      </div>

      <p className="mt-2 text-center text-xs text-zinc-600">
        Click a node to highlight its connections
      </p>
    </div>
  );
}
