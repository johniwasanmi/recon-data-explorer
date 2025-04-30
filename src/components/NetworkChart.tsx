
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node {
  id: string;
  name: string;
  platform?: string;
  technique_id?: string;
  status?: string;
  paw?: string;
  value?: number;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

interface NetworkData {
  nodes: Node[];
  links: Link[];
}

interface NetworkChartProps {
  data: NetworkData;
}

const NetworkChart: React.FC<NetworkChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Create a force simulation for node positioning
    const simulation = d3.forceSimulation(data.nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(data.links)
        .id((d: any) => d.id)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide(30));

    const svg = d3.select(svgRef.current);

    // Define marker for arrowheads
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#999')
      .style('stroke', 'none');

    // Create links
    const link = svg.append('g')
      .selectAll('line')
      .data(data.links)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrowhead)');

    // Create node groups
    const nodeGroup = svg.append('g')
      .selectAll('g')
      .data(data.nodes)
      .enter()
      .append('g')
      .call(d3.drag<any, any>()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded));

    // Add circles to nodes
    nodeGroup.append('circle')
      .attr('r', (d: any) => {
        return d.platform ? 20 : 10; // Hosts are larger than command nodes
      })
      .attr('fill', (d: any) => {
        if (d.platform) {
          // Host nodes
          const colors: { [key: string]: string } = {
            'windows': '#60a5fa',
            'linux': '#f472b6',
            'darwin': '#fbbf24'
          };
          return colors[d.platform.toLowerCase()] || '#6366f1';
        } else {
          // Command nodes
          return d.status === 'success' ? '#10b981' : '#ef4444';
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    // Add labels to nodes
    nodeGroup.append('text')
      .text((d: any) => d.name)
      .attr('font-size', 10)
      .attr('dx', 15)
      .attr('dy', 4)
      .attr('fill', '#fff');

    // Tooltip for more details
    nodeGroup.append('title')
      .text((d: any) => {
        if (d.platform) {
          return `Host: ${d.name}\nPlatform: ${d.platform}\nCommands: ${d.value || 0}`;
        } else if (d.technique_id) {
          return `Command: ${d.name}\nTechnique: ${d.technique_id}\nStatus: ${d.status}`;
        }
        return d.name;
      });

    // Animation
    simulation
      .nodes(data.nodes as d3.SimulationNodeDatum[])
      .on('tick', ticked);

    if (simulation.force('link')) {
      (simulation.force('link') as d3.ForceLink<d3.SimulationNodeDatum, d3.SimulationLinkDatum<d3.SimulationNodeDatum>>)
        .links(data.links);
    }

    function ticked() {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeGroup
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    }

    function dragStarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <svg 
      ref={svgRef} 
      className="w-full h-full bg-card rounded-md"
      aria-label="Network visualization of commands executed across hosts"
    />
  );
};

export default NetworkChart;
