import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Paper } from '../types';

interface PaperVisualizationProps {
  papers: Paper[];
}

const PaperVisualization: React.FC<PaperVisualizationProps> = ({ papers }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || papers.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;

    svg.attr('width', width).attr('height', height);

    // Clear previous content
    svg.selectAll('*').remove();

    const simulation = d3.forceSimulation(papers)
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const nodes = svg.selectAll('g')
      .data(papers)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag<SVGGElement, Paper>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    nodes.append('circle')
      .attr('r', d => Math.sqrt(d.citationCount || 1) * 3 + 5)
      .attr('fill', (d, i) => color(i.toString()));

    nodes.append('text')
      .text(d => d.title.substring(0, 20) + '...')
      .attr('font-size', '10px')
      .attr('fill', '#fff')
      .attr('text-anchor', 'middle')
      .attr('dy', 3);

    simulation.on('tick', () => {
      nodes.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: d3.D3DragEvent<SVGGElement, Paper, Paper>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, Paper, Paper>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, Paper, Paper>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

  }, [papers]);

  return (
    <div className="paper-visualization">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default PaperVisualization;
