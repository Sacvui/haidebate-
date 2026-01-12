
import React, { useEffect, useRef, useState } from 'react';
import { RotateCw } from 'lucide-react';

interface MermaidChartProps {
    chart: string;
}

export const MermaidChart = ({ chart }: MermaidChartProps) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const [svgId] = useState(() => `mermaid-${Math.random().toString(36).substr(2, 9)}`);
    const [isRendered, setIsRendered] = useState(false);

    useEffect(() => {
        const initAndRender = async () => {
            const mermaid = (await import('mermaid')).default;
            mermaid.initialize({
                startOnLoad: false,
                theme: 'default',
                securityLevel: 'loose',
            });

            try {
                if (chartRef.current && chart) {
                    const { svg } = await mermaid.render(svgId, chart);
                    chartRef.current.innerHTML = svg;
                    setIsRendered(true);
                }
            } catch (error) {
                console.error("Mermaid Render Error:", error);
                if (chartRef.current) {
                    chartRef.current.innerHTML = `<div class="text-red-500 text-sm p-2 bg-red-50 rounded">Lỗi hiển thị biểu đồ. (Syntax Error)</div>`;
                }
            }
        };

        initAndRender();
    }, [chart, svgId]);

    return (
        <div className="my-4 overflow-x-auto bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            {!isRendered && (
                <div className="flex items-center gap-2 text-slate-400 text-sm p-4">
                    <RotateCw className="animate-spin" size={16} /> Đang vẽ biểu đồ logic...
                </div>
            )}
            <div key={chart} ref={chartRef} className="mermaid flex justify-center" />
        </div>
    );
};
