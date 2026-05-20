import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function SentimentDistribution({ data }: { data: any[] }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = 400;
    const height = 200;
    const margin = { top: 10, right: 10, bottom: 25, left: 10 };

    // 1. Setup Scales
    const x = d3
      .scaleLinear()
      .domain([0, 1])
      .range([margin.left, width - margin.right]);

    // 2. Binning (The "Buckets")
    const thresholds = d3.range(0, 1.05, 0.05);
    const bins = d3.bin().domain([0, 1]).thresholds(thresholds)(
      data.map((d) => d.s)
    );

    // 3. Y Scale (Dynamic height based on the buffer size)
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(bins, (d) => d.length) || 0])
      .range([height - margin.bottom, margin.top]);

    // 4. Initial Render of Axes (only if they don't exist)
    if (svg.selectAll('.x-axis').empty()) {
      svg
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(5).tickSizeOuter(0))
        .attr('color', '#64748b');
    }

    // 5. THE D3 DATA JOIN (Enter, Update, Exit)
    svg
      .selectAll('.bar')
      .data(bins)
      .join(
        (enter) =>
          enter
            .append('rect')
            .attr('class', 'bar')
            .attr('x', (d) => x(d.x0 || 0) + 1)
            .attr('width', (d) => Math.max(0, x(d.x1 || 0) - x(d.x0 || 0) - 1))
            .attr('y', height - margin.bottom)
            .attr('height', 0)
            .attr('fill', (d) => d3.interpolateRdYlGn(d.x0 || 0)),
        (update) => update,
        (exit) => exit.remove()
      )
      .transition() // Smoothly animate the bars to new heights
      .duration(400)
      .ease(d3.easeCubicOut)
      .attr('y', (d) => y(d.length))
      .attr('height', (d) => height - margin.bottom - y(d.length))
      .attr('fill', (d) => d3.interpolateRdYlGn(d.x0 || 0));
  }, [data]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 400 200`}
        className="w-full h-auto drop-shadow-2xl"
      />
      <div className="flex justify-between text-[10px] text-slate-500 px-2 mt-1 uppercase font-bold tracking-tighter">
        <span>Negative</span>
        <span>Neutral</span>
        <span>Positive</span>
      </div>
    </div>
  );
}
