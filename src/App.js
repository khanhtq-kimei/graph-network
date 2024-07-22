import './App.css';
import data from './data';
import { useEffect, useRef, useState } from 'react';
import * as d3 from "d3";

function App() {
    const svgRef = useRef();
    const width = svgRef?.current?.clientWidth ?? 0;
    const height = svgRef?.current?.clientHeight ?? 0;

    const { nodes, links } = data;

    const [linksData, setLinksData] = useState();
    const [nodesData, setNodesData] = useState();
    const [strategicNode, setStrategicNode] = useState([])
    const [simulation, setSimulation] = useState(null)

    
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
            

            const simulation = d3
                .forceSimulation(nodesData)
                .force("charge", d3.forceManyBody()
                    .strength((d) => {
                        switch (d.nodeType) {
                            case 'root':
                                return -100
                            case 'business_unit_root':
                                return -1e3
                            case 'goal':
                                switch (d.goalKind) {
                                    case 'organization': return -1e3;
                                    case 'team': return -800;
                                    case 'personal': return -200;
                                    case 'business_unit': return -200;
                                    default: return -200
                                }
                            case 'key_result':
                                switch (d.goalKind) {
                                    case 'organization': return -1e3;
                                    case 'team': return -1e3;
                                    case 'personal': return -1e3;
                                    case 'business_unit': return -200;
                                    default: return -200
                                }
                            default: return -200
                        }
                    })
                )
                .force("link", d3.forceLink(linksData).id((d) => d.id)
                    .distance((d) => {
                        switch (d.source.nodeType) {
                            case 'business_unit_root':
                                switch (d.target.nodeType) {
                                    case "root": return 250;
                                    case "goal": return 300;
                                    case "key_result": return 125;
                                    default: return 125
                                }
                            case 'goal':
                                switch (d.target.nodeType) {
                                    case "root": return 250;
                                    case "goal": return 300;
                                    case "key_result": return 125;
                                    case "business_unit_root": return 300
                                    default: return 125
                                }
                            case 'key_result':
                                switch (d.target.nodeType) {
                                    case "goal": return 125;
                                    case "business_unit_root": return 125;
                                    default: return 125
                                }
                            default: return 125;
                        }
                    })
                    .strength((d) => {
                        switch (d.source.nodeType) {
                            case 'business_unit_root':
                                switch (d.target.nodeType) {
                                    case "root": return 2;
                                    case "goal": return 2;
                                    case "key_result": return 2;
                                    default: return 2
                                }
                            case 'goal':
                                switch (d.target.nodeType) {
                                    case "root": return 2;
                                    case "goal": return 2;
                                    case "key_result": return 2;
                                    case "business_unit_root": return 2
                                    default: return 2
                                }
                            case 'key_result':
                                switch (d.target.nodeType) {
                                    case "goal": return 2;
                                    case "business_unit_root": return 2;
                                    default: return 2
                                }
                            default: return 2
                        }
                    })
                )
                .force('collision', d3.forceCollide().radius(d => {
                    switch (d.nodeType) {
                        case 'root': return 200;
                        case 'business_unit_root': return 120;
                        case 'goal':
                            switch (d.goalKind) {
                                case 'organization': return 120;
                                case 'team': return 80;
                                case 'personal': return 40;
                                case 'business_unit': return 40;
                                default: return 40;
                            }
                        case 'key_result':
                            switch (d.goalKind) {
                                case 'organization': return 48;
                                case 'team': return 20;
                                case 'personal': return 10;
                                case 'business_unit': return 40;
                                default: return 40;
                            }
                        default: return 40;
                    }
                }))
                .force("center", d3.forceCenter(width / 2, height / 2))
                .force("x", d3.forceX().strength(0.05))
                .force("y", d3.forceY().strength(0.05))
                .tick(1)

            setSimulation(simulation)
        }
    }, [linksData, nodesData, svgRef]);

    useEffect(() => {
        if(simulation) {
            const svg = d3.create("svg").append("g")

            const link = svg.append("g")
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
                .enter()

            const nodeDetail = node
                .append("g")
                .attr('class', (d) => `graphNode_${d.id}`);
            
            const nodeCollapse = node.append('circle')
            .attr('r', (d) => {
                return d.nodeType === 'root' ? 0 : 10
            })
            .on('click', (event, d) => {
                console.log(event, d)
                handleOnCollapseNode(d)
            })

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


            const text = nodeDetail.append("g").join('g');

            //percent progress
            text.append("text")
            .text((d) => {
                switch (d.nodeType) {
                    case "root":
                        return d.title;
                    case "goal":
                        return `${d.progress * 100}%`;
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


            nodeDetail.call(
                d3.drag()
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
                nodeCollapse.attr("cx", (d) => {
                    let r = Math.atan2(d.y - height/2, d.x - width/2);
                    r > -2.6 && r <= -1 ? r = -2.6 : r > -1 && r < -.6 && (r = -.6);
                    
                    let size
                    switch (d.nodeType) {
                        case "root":
                            size = 100;
                            break;
                        case "goal":
                            size = 55;
                            break;
                        case "key_result":
                            size = 30;
                            break;
                        default: return
                    }

                    const a = size + 15

                    return  d.x + a * Math.cos(r)
                }).attr("cy", (d) => {
                    let r = Math.atan2(d.y - height/2, d.x - width/2);
                    r > 2.6 && r <= 1 ? r = 2.6 : r > 1 && r < .6 && (r = -.6);

                    let size
                    switch (d.nodeType) {
                        case "root":
                            size = 100;
                            break;
                        case "goal":
                            size = 55;
                            break;
                        case "key_result":
                            size = 30;
                            break;
                        default: return
                    }
                    const a = size + 15

                    return  d.y + a * Math.sin(r)
                })
            });

            svgRef.current.appendChild(svg.node());
        }
    } , [simulation])

    const handleOnCollapseNode = (nodeData) => {
        const node = [];
        const link = links.filter((item) => item.target === nodeData.id);
        link.forEach((link) => {
            node.push(nodes.find((n) => n.id === link.source));
        });

        setLinksData((prev) => [...prev, ...link])
        setNodesData((prev) => [...prev, ...node]);
    }

    return (
        <div className="App">
            <svg ref={svgRef} className='svg-main' />
        </div>
    );
}

export default App;
