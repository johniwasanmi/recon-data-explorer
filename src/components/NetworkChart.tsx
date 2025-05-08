import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface Node {
  id: string;
  name: string;
  platform?: string;
  technique_id?: string;
  status?: string;
  paw?: string;
  value?: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link {
  source: string | Node;
  target: string | Node;
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
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Setup zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 5])
      .on('zoom', (event) => {
        setZoomLevel(event.transform.k);
        g.attr('transform', event.transform);
      });

    // Create SVG and apply zoom
    const svg = d3.select(svgRef.current)
      .call(zoom as any);

    // Create a container group for all elements that will be zoomed
    const g = svg.append('g');

    // Add defs for gradients and filters
    const defs = g.append('defs');

    // Add shadow filter for nodes
    defs.append('filter')
      .attr('id', 'shadow')
      .attr('height', '120%')
      .append('feDropShadow')
      .attr('flood-color', 'rgba(0, 0, 0, 0.3)')
      .attr('flood-opacity', 0.5)
      .attr('dx', 0)
      .attr('dy', 2)
      .attr('stdDeviation', 2);

    // Add gradient for host nodes
    const platforms = ['windows', 'linux', 'darwin'];
    const colors = {
      'windows': ['#60a5fa', '#3b82f6'],
      'linux': ['#f472b6', '#ec4899'],
      'darwin': ['#fbbf24', '#f59e0b']
    };

    platforms.forEach(platform => {
      const gradient = defs.append('linearGradient')
        .attr('id', `gradient-${platform}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colors[platform as keyof typeof colors][0]);
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colors[platform as keyof typeof colors][1]);
    });

    // Add gradients for command status
    const statuses = ['success', 'failed'];
    const statusColors = {
      'success': ['#10b981', '#059669'],
      'failed': ['#ef4444', '#dc2626']
    };

    statuses.forEach(status => {
      const gradient = defs.append('linearGradient')
        .attr('id', `gradient-${status}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', statusColors[status as keyof typeof statusColors][0]);
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', statusColors[status as keyof typeof statusColors][1]);
    });

    // Default gradient
    const defaultGradient = defs.append('linearGradient')
      .attr('id', 'gradient-default')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    
    defaultGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#6366f1');
    
    defaultGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#4f46e5');

    // Define marker for arrowheads
    defs.append('marker')
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
      .attr('fill', '#666')
      .style('stroke', 'none');

    // Create a force simulation for node positioning
    const nodeCount = data.nodes.length;
    const dynamicStrength = -300 - (nodeCount * 5); // Adjust force based on node count
    const dynamicDistance = Math.max(100, 60 + nodeCount * 2); // Adjust distance based on node count

    const simulation = d3.forceSimulation(data.nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(data.links).id((d: any) => d.id).distance(dynamicDistance))
      .force('charge', d3.forceManyBody().strength(dynamicStrength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius((d: any) => {
        // Allow more space between nodes
        return d.platform ? 40 : 25;
      }))
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1));

    // Create curved links with gradient
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(data.links)
      .enter()
      .append('path')
      .attr('stroke', '#999')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.6)
      .attr('fill', 'none')
      .attr('marker-end', 'url(#arrowhead)')
      .style('stroke-dasharray', (d: any) => d.source === d.target ? '5, 5' : 'none')
      .style('stroke', (d: any, i) => {
        // Create unique gradient ID for this link
        const gradientId = `link-gradient-${i}`;
        
        // Create gradient
        const linkGradient = defs.append('linearGradient')
          .attr('id', gradientId)
          .attr('gradientUnits', 'userSpaceOnUse');
        
        // Source color based on platform
        let sourceColor = '#999';
        let targetColor = '#666';
        
        linkGradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', sourceColor);
        
        linkGradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', targetColor);
        
        return `url(#${gradientId})`;
      });

    // Create node groups
    const nodeGroup = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(data.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .style('filter', 'url(#shadow)')
      .call(d3.drag<SVGGElement, any>()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded));

    // Add circles to nodes with initial size 0 for animation
    nodeGroup.append('circle')
      .attr('r', 0) // Start with radius 0 for animation
      .attr('fill', (d: any) => {
        if (d.platform) {
          // Host nodes
          return `url(#gradient-${d.platform.toLowerCase()})` || 'url(#gradient-default)';
        } else {
          // Command nodes
          return d.status === 'success' ? 'url(#gradient-success)' : 'url(#gradient-failed)';
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .transition() // Add transition for animation
      .duration(800)
      .ease(d3.easeBounce)
      .attr('r', (d: any) => {
        return d.platform ? 20 : 12; // Hosts are larger than command nodes
      });

    // Add a pulse animation to highlight important nodes
    nodeGroup.filter((d: any) => d.platform)
      .append('circle')
      .attr('r', 20)
      .attr('fill', 'none')
      .attr('stroke', (d: any) => {
        if (d.platform) {
          const platformLower = d.platform.toLowerCase();
          return colors[platformLower as keyof typeof colors] ? 
            colors[platformLower as keyof typeof colors][0] : '#6366f1';
        }
        return '#6366f1';
      })
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 1)
      .style('pointer-events', 'none')
      .transition()
      .duration(1500)
      .ease(d3.easeLinear)
      .attr('r', 35)
      .attr('stroke-opacity', 0)
      .on('end', function() {
        // Restart animation
        d3.select(this)
          .attr('r', 20)
          .attr('stroke-opacity', 1)
          .transition()
          .duration(1500)
          .ease(d3.easeLinear)
          .attr('r', 35)
          .attr('stroke-opacity', 0);
      });

    // Add text bg for better readability
    nodeGroup.append('rect')
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('x', 15)
      .attr('y', -10)
      .attr('width', 0) // Start with width 0 for animation
      .attr('height', 20)
      .attr('fill', 'rgba(0, 0, 0, 0.7)')
      .attr('opacity', 0.9);

    // Add labels to nodes with fade-in animation
    const labels = nodeGroup.append('text')
      .text((d: any) => d.name)
      .attr('font-size', 10)
      .attr('dx', 18)
      .attr('dy', 4)
      .attr('fill', '#fff')
      .style('pointer-events', 'none')
      .style('opacity', 0); // Start with opacity 0 for animation

    // Calculate and update text background width based on text length
    labels.each(function() {
      const textWidth = this.getComputedTextLength();
      d3.select(this.parentNode)
        .select('rect')
        .transition()
        .duration(800)
        .attr('width', textWidth + 10);
    });

    // Fade in labels
    labels.transition()
      .delay(400)
      .duration(800)
      .style('opacity', 1);

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
      link.attr('d', (d: any) => {
        // Create curved paths between nodes
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 2;
        
        // If it's a self loop, create a loop back to the same node
        if (d.source === d.target) {
          const x = d.source.x;
          const y = d.source.y;
          return `M${x},${y} C${x+50},${y-50} ${x+50},${y+50} ${x},${y}`;
        }
        
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });

      // Update node positions with constraints to keep them within bounds
      nodeGroup.attr('transform', (d: any) => {
        // Keep nodes within bounds by clamping their positions
        d.x = Math.max(20, Math.min(width - 20, d.x));
        d.y = Math.max(20, Math.min(height - 20, d.y));
        return `translate(${d.x},${d.y})`;
      });

      // Update link gradient positions for proper coloring
      data.links.forEach((d: any, i: number) => {
        if (d.source.x && d.target.x) {
          d3.select(`#link-gradient-${i}`)
            .attr('x1', d.source.x)
            .attr('y1', d.source.y)
            .attr('x2', d.target.x)
            .attr('y2', d.target.y);
        }
      });
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

    // Function to handle initial centering and scaling
    const initialZoom = () => {
      // Give the simulation a chance to settle
      for (let i = 0; i < 100; ++i) simulation.tick();
      
      // Calculate the bounds of the graph
      const nodePositions = data.nodes.map((d: any) => ({ x: d.x || 0, y: d.y || 0 }));
      
      if (nodePositions.length === 0) return;
      
      const xExtent = d3.extent(nodePositions, d => d.x) as [number, number];
      const yExtent = d3.extent(nodePositions, d => d.y) as [number, number];
      
      const graphWidth = xExtent[1] - xExtent[0];
      const graphHeight = yExtent[1] - yExtent[0];
      
      // Calculate scaling factor
      const scaleX = width / (graphWidth + 100);
      const scaleY = height / (graphHeight + 100);
      const scale = Math.min(2, Math.min(scaleX, scaleY, 2)); // Limit max zoom
      
      // Calculate center points
      const centerX = (xExtent[0] + xExtent[1]) / 2;
      const centerY = (yExtent[0] + yExtent[1]) / 2;
      
      // Apply transform with transition
      svg.transition()
         .duration(750)
         .call(
           zoom.transform as any,
           d3.zoomIdentity
             .translate(width / 2, height / 2)
             .scale(scale)
             .translate(-centerX, -centerY)
         );
    };

    // Run initial centering after a delay to allow force layout to begin
    setTimeout(initialZoom, 100);

    return () => {
      simulation.stop();
    };
  }, [data]);

  // Handle manual zoom controls
  const handleZoomIn = () => {
    if (!svgRef.current) return;
    
    const zoom = d3.zoom<SVGSVGElement, unknown>();
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call((zoom as any).scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;
    
    const zoom = d3.zoom<SVGSVGElement, unknown>();
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call((zoom as any).scaleBy, 0.7);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <button 
          onClick={handleZoomIn} 
          className="bg-primary/80 hover:bg-primary text-white p-1.5 rounded-md shadow-md"
          aria-label="Zoom in"
        >
          <ZoomIn size={16} />
        </button>
        <button 
          onClick={handleZoomOut} 
          className="bg-primary/80 hover:bg-primary text-white p-1.5 rounded-md shadow-md"
          aria-label="Zoom out"
        >
          <ZoomOut size={16} />
        </button>
      </div>
      <svg 
        ref={svgRef} 
        className="w-full h-full bg-gradient-to-b from-card to-card/90 rounded-md"
        aria-label="Network visualization of commands executed across hosts"
      />
      <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
        Zoom: {Math.round(zoomLevel * 100)}% | Nodes: {data.nodes.length} | Links: {data.links.length}
      </div>
    </div>
  );
};

export default NetworkChart;
