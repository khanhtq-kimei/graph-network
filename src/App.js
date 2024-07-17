import './App.css';
import data from './data';
import { useEffect, useRef, useState } from 'react';
import * as d3 from "d3";

function App() {
  const svgRef = useRef();
  const { nodes, links } = data;

  const [linksData, setLinksData] = useState([]);
  const [nodesData, setNodesData] = useState([]);
  const [strategicNode, setStrategicNode] = useState([])

  useEffect(() => {
    const node = [];
    const nodeMain = nodes.find((item) => item.nodeType === "root");
    const links2 = links.filter((item) => item.target === nodeMain.id);
    setLinksData(links2);
    links2.forEach((link) => {
      node.push(nodes.find((n) => n.id === link.source));
    });
    setStrategicNode(node)
    setNodesData([nodeMain, ...node]);
  }, [links, nodes]);

  useEffect(() => {
    if (svgRef && nodesData?.length && linksData?.length) {
      const width = svgRef?.current?.clientWidth;
      const height = svgRef?.current?.clientHeight;
  
      const simulation = d3
        .forceSimulation(nodesData)
        .force( "link", d3.forceLink(linksData).id((d) => d.id).distance((d) => d.nodeType === 'goal' || d.nodeType === 'root' ? '750' : '250'))
        .force("charge", d3.forceManyBody().strength(-36000/strategicNode?.length))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX())
        .force("y", d3.forceY())

      const svg = d3
        .create("svg")
        .append("g")

      const link = svg
        .append("g")
        .attr("stroke", "#ccc")
        .attr("stroke-opacity", 1)
        .attr('stroke-dasharray', 10)
        .selectAll("line")
        .data(linksData)
        .join("line")
        .attr("stroke-width", 2)

      const node = svg.append('g')
        .attr('class', 'nodeContainer')
        .selectAll("nodeContainer")
        .data(nodesData)

      const nodeDetail = node
        .enter()
        .append("g")
        .attr('class', (d) => `graphNode_${d.id}`);

      nodeDetail
        .append("circle")
        .attr("r", (d) => {
          switch (d.nodeType) {
            case "root":
              return 100;
            case "goal":
              return 55;
            case "key_result":
              return 30;
            default: return null
          }
        })
        .attr("stroke", (d) => {
          switch (d.nodeType) {
            case "root":
              return "#E8EBF2";
            case "goal":
              return "#669C89";
            case "key_result":
              return "yellow";
              default: return null
          }
        })
        .attr("stroke-width", (d) => {
          switch (d.nodeType) {
            case "root":
              return "6";
            case "goal":
              return "5";
            case "key_result":
              return "2";
              default: return null
          }
        })
        .attr("fill", (d) => {
          switch (d.nodeType) {
            case "root":
              return "#fcfcfc";
            case "goal":
              return "#669C89";
            case "key_result":
              return "yellow";
              default: return null
          }
        })
        

      const text = nodeDetail
        .append("g")
        .join('g');

      //percent progress
      text
        .append("text")
        .text((d) => {
          switch (d.nodeType) {
            case "root":
              return d.title;
            case "goal":
              return `${d.progress*100}%`;
            case "key_result":
              return "2";
              default: return null
          }
        })
        .attr('font-size', 20)
        .attr('dy', '12')
        .attr('text-anchor', 'middle')

        // title
      // const titleContainer =  text.append('text').attr('font-size', 14).attr('text-anchor', 'middle')

      
      const buttonContainer = node
        .enter()
        .append('circle')
        .attr("r" ,  (d) => d.nodeType === 'root' ? 0 : 10)
        .attr('stroke', '#669C89')

      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      // Update the subject (dragged node) position during drag.
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      // Restore the target alpha so the simulation cools after dragging ends.
      // Unfix the subject position now that it’s no longer being dragged.
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = null;
        event.subject.fy = null;
      }

      nodeDetail.call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

      simulation.on("tick", () => {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);
          
        nodeDetail.selectAll('circle').attr("cx", (d) => d.x).attr("cy", (d) => d.y)
        nodeDetail.selectAll('text').attr("x", (d) => d.x).attr("y", (d) => d.y)
        buttonContainer.attr("cx", (d) => {
          return d.x - d.vx
        }).attr("cy", (d) => {
          return d.y - d.vy
        })
      });

      svgRef.current.appendChild(svg.node());
    }
  }, [svgRef, linksData, nodesData]);

  return (
    <div className="App">
      <svg ref={svgRef} className='svg-main'/>
    </div>
  );
}

export default App;
