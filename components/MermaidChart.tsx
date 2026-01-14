"use client";

import { memo } from "react";
import mermaid from "mermaid";
import { useEffect, useRef } from "react";

interface MermaidChartProps {
    chart: string;
}

// Memoize to prevent re-render when chart hasn't changed
export const MermaidChart = memo(function MermaidChart({ chart }: MermaidChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chart || !containerRef.current) return;

        mermaid.initialize({
            startOnLoad: false,
            theme: "default",
            securityLevel: "loose",
        });

        const renderChart = async () => {
            try {
                const { svg } = await mermaid.render(`mermaid-${Date.now()}`, chart);
                if (containerRef.current) {
                    containerRef.current.innerHTML = svg;
                }
            } catch (error) {
                console.error("Mermaid render error:", error);
                if (containerRef.current) {
                    containerRef.current.innerHTML = `<div class="text-red-500 text-sm">Lỗi vẽ sơ đồ: ${error}</div>`;
                }
            }
        };

        renderChart();
    }, [chart]);

    return <div ref={containerRef} className="flex justify-center items-center min-h-[200px]" />;
}, (prevProps, nextProps) => {
    // Custom comparison: only re-render if chart content actually changed
    return prevProps.chart === nextProps.chart;
});
