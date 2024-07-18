import './App.css';
import data from './data';
import { useEffect, useRef, useState } from 'react';
import * as d3 from "d3";

function App() {
  const svgRef = useRef();
  const { nodes, links } = data;

  const configNode = {
    ticksBeforeShowingGraph: 300,
    forces: {
        x: {
            strength: .05
        },
        y: {
            strength: .05
        },
        charge: {
            strength: {
                root: {
                    organization: -100
                },
                business_unit_root: {
                    organization: -1e3
                },
                goal: {
                    organization: -1e3,
                    team: -800,
                    personal: -200,
                    business_unit: -200
                },
                key_result: {
                    organization: -1e3,
                    team: -1e3,
                    personal: -1e3,
                    business_unit: -200
                }
            }
        },
        link: {
            distance: {
                business_unit_root: {
                    root: 250,
                    goal: 300,
                    key_result: 125
                },
                goal: {
                    root: 250,
                    goal: 300,
                    key_result: 125,
                    business_unit_root: 300
                },
                key_result: {
                    goal: 125,
                    business_unit_root: 125
                }
            },
            strength: {
                business_unit_root: {
                    root: 2,
                    goal: 2,
                    key_result: 2
                },
                goal: {
                    root: 2,
                    goal: 2,
                    key_result: 2,
                    business_unit_root: 2
                },
                key_result: {
                    goal: 2,
                    business_unit_root: 2
                }
            },
            iterations: 1
        },
        collision: {
            radius: {
                root: {
                    organization: 200
                },
                business_unit_root: {
                    organization: 120
                },
                goal: {
                    organization: 120,
                    team: 80,
                    personal: 40,
                    business_unit: 40
                },
                key_result: {
                    organization: 48,
                    team: 20,
                    personal: 10,
                    business_unit: 40
                }
            },
            strength: 1,
            iterations: 1
        }
    }
  };

  const configCircle = {
      forces: {
          radial: {
              radius: 250,
              strength: {
                  root: {
                      organization: 2
                  },
                  business_unit_root: {
                      organization: 2
                  },
                  goal: {
                      business_unit: 2,
                      organization: 2,
                      team: 2,
                      personal: 2
                  },
                  key_result: {
                      business_unit: 2,
                      organization: 2,
                      team: 2,
                      personal: 2
                  }
              }
          }
      }
  };

  const [linksData, setLinksData] = useState([]);
  const [nodesData, setNodesData] = useState([]);
  const [strategicNode, setStrategicNode] = useState([])

  useEffect(() => {
    const node = [];
    const nodeMain = nodes.find((item) => item.nodeType === "root");
    const strategicLink = links.filter((item) => item.target === nodeMain.id);


    strategicLink.forEach((link) => {
      node.push(nodes.find((n) => n.id === link.source));
    });

    //link strategic 1 child 
    const childStrategicLink = links.filter((item) => item.target === node?.[1]?.id);
    childStrategicLink.forEach((link) => {
      node.push(nodes.find((n) => n.id === link.source));
    });
    
    
    setStrategicNode(node)
    setLinksData([...strategicLink, ...childStrategicLink]);
    setNodesData([nodeMain, ...node]);
  }, [links, nodes]);

  useEffect(() => {
    if (svgRef && nodesData?.length && linksData?.length) {
      const width = svgRef?.current?.clientWidth;
      const height = svgRef?.current?.clientHeight;
  
      const simulation = d3
        .forceSimulation(nodesData)
        .force()
        .force("link", d3.forceLink(linksData).id((d) => d.id)
            .distance((d, _, ds) => {
              console.log("🚀 ~ .distance ~ ds:", ds)
              switch (d.nodeType) {
                
                default: 
                  break;
              }

              return 100
            })
        )
        .force("charge", d3.forceManyBody().strength((d) => {
          switch (d.nodeType) {
            case 'root':
              if (d.organization === 'root') {
                return  -100
              }
              else return -3400;
            case 'business_unit_root':
              if (d.organization === 'root') {
                return  -1e3
              }
            // eslint-disable-next-line no-fallthrough
            case 'goal':
              switch (d.goalKind) {
                case 'organization':
                  return -2500;
                  case 'team':
                    return -30;
                  case 'personal':
                    return -10;
                  case 'business_unit':
                      return '-2'
                default:
                  break;
              }
            // eslint-disable-next-line no-fallthrough
            case 'key_result': 
              switch (d.goalKind) {
                case 'organization':
                  return -100;
                  case 'team':
                    return -10;
                  case 'personal':
                    return -10;
                  case 'business_unit':
                      return '-200'
                default:
                  break;
              }
            // eslint-disable-next-line no-fallthrough
            default:
              break;
          }
        }))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", {
          strength: 0.05
        })
        .force("y", {
          strength: 0.05
        })

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
        .selectAll(".nodeContainer")
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

      
      const buttonContainer = nodeDetail
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
        buttonContainer.attr('transform', (d) => {
          return 'translate(' + 0.8 * 250 + ',0)';
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
