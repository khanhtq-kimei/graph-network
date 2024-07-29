import * as d3 from "d3";
import data from './data';
  
export const loadGraph = () => {
    const svg = d3.select("#container");
    const width = svg?._parents?.[0].clientWidth;
    const height = svg?._parents?.[0].clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    const { nodes, links } = data;

    let nodeData = [];
    let linkData = []

    const nodeMain = nodes.find((item) => item.nodeType === "root");
    const linkMain = links.filter((item) => item.target === nodeMain.id);

    //Drag
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

    let dragInteraction = d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)

   
    
    //Find Node Main
    linkData = linkMain
    nodeData.push(nodeMain)
    linkMain.forEach((link) => {
        nodeData.push(nodes.find((n) => n.id === link.source));
    });
    
    const simulation = d3
        .forceSimulation(nodeData)
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
        .force("link", d3.forceLink(linkData).id((d) => d.id)
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
        .force("center", d3.forceCenter(centerX, centerY))
        .force("x", d3.forceX().strength(0.05))
        .force("y", d3.forceY().strength(0.05))
        .tick(1)


        // Initialize
       const container = svg.append('g')

       svg.call(
        d3.zoom().on("zoom", (event) => {
            container.attr("transform", event.transform);
        })
      );

       // Links
       const link = container.append("g")
        .attr('id', 'linkContainer')
        .attr("stroke", "#ccc")
        .attr("stroke-opacity", 1)
        .attr('stroke-dasharray', 10)
        .selectAll("line")
        .data(linkData)
        .join("line")
        .attr("stroke-width", 2)


        //Node 
        let nodeContainer = container.append('g').attr('id', 'nodeContainer')
        
        nodeData.forEach(d => {
            const nodeDetail = nodeContainer.append('g').attr('class', `graphNode_${d.id}`)
            let radius = null;
            let stroke = null;
            let strokeWidth = null;
            let fill = null;
            let text = null;
            
            switch (d.nodeType) {
                case "root":
                    radius = 100;
                    stroke = "#E8EBF2"
                    strokeWidth = 6;
                    fill= "#fcfcfc";
                    text = d.title
                    break;
                case "goal":
                    radius = 55;
                    stroke = "#669C89"
                    strokeWidth = 5;
                    fill= "#669C89";
                    text = `${d.progress * 100}%`
                    break;
                case "key_result":
                    radius = 30;
                    stroke = "yellow"
                    strokeWidth = 2;
                    fill= "#yellow";
                    text = '2'
                    break;
                default: break;
            }

            nodeDetail.append("circle")
                .attr("r", radius)
                .attr("stroke", stroke)
                .attr("stroke-width", strokeWidth)
                .attr("fill", fill)

            nodeDetail.append("g").append("text")
                .text(text)
                .attr('font-size', 20)
                .attr('dy', '12')
                .attr('text-anchor', 'middle')
    
                // title
                // const titleContainer =  text.append('text').attr('font-size', 14).attr('text-anchor', 'middle')
            
            if (links.find(item => item.target === d.id)) {
                nodeContainer.append('g').attr('class', `collapseNode_${d.id}`).append('circle').attr('r', 10).on('click', (event) => {
                    handleOnCollapseNode(d)
                })
            }
        })

    //Update
    const update = () => {
        simulation.nodes(nodeData);
        simulation.force("link").links(linkData)

        nodeContainer.selectAll('g').remove();


        nodeData.forEach(d => {
            const nodeDetail = nodeContainer.append('g').attr('class', `graphNode_${d.id}`)
            let radius = null;
            let stroke = null;
            let strokeWidth = null;
            let fill = null;
            let text = null;

            switch (d.nodeType) {
                case "root":
                    radius = 100;
                    stroke = "#E8EBF2"
                    strokeWidth = 6;
                    fill= "#fcfcfc";
                    text = d.title
                    break;
                case "goal":
                    radius = 55;
                    stroke = "#669C89"
                    strokeWidth = 5;
                    fill= "#669C89";
                    text = `${d.progress * 100}%`
                    break;
                case "key_result":
                    radius = 30;
                    stroke = "yellow"
                    strokeWidth = 2;
                    fill= "#yellow";
                    text = '2'
                    break;
                default: break;
            }

            nodeDetail.append("circle")
                .attr("r", radius)
                .attr("stroke", stroke)
                .attr("stroke-width", strokeWidth)
                .attr("fill", fill)

            nodeDetail.append("g").append("text")
                .text(text)
                .attr('font-size', 20)
                .attr('dy', '12')
                .attr('text-anchor', 'middle')
    
                // title
                // const titleContainer =  text.append('text').attr('font-size', 14).attr('text-anchor', 'middle')
            
            if (links.find(item => item.target === d.id)) {
                nodeContainer.append('g').attr('class', `collapseNode_${d.id}`).append('circle').attr('r', 10).on('click', (event) => {
                    handleOnCollapseNode(d)
                })
            }
        })

        simulation.alpha(1).restart();
    }


    // Draw
    simulation.on("tick", () => {
        link
            .attr("x1", (d) => d.source.x)
            .attr("y1", (d) => d.source.y)
            .attr("x2", (d) => d.target.x)
            .attr("y2", (d) => d.target.y);

        nodeData.forEach(node => {
            if (node.type !== 'root') {
                nodeContainer.select(`.graphNode_${node.id}`).select('circle').attr('cx', node.x).attr('cy', node.y)
                nodeContainer.select(`.graphNode_${node.id}`).select('text').attr('x', node.x).attr('y', node.y)
            } else {
                nodeContainer.select(`.graphNode_${node.id}`).select('circle').attr('cx', centerX).attr('cy', centerY)
                nodeContainer.select(`.graphNode_${node.id}`).select('text').attr('x', centerX).attr('y', centerY)
            }
            let x = 0;
            let y = 0;
            const targetInfo = linkData?.find(link => link?.source?.id === node?.id)?.target

            if (targetInfo) {
                let nodeSize = 0
                switch (node.nodeType) {
                    case "root":
                        nodeSize = 100;
                        break;
                    case "goal":
                        nodeSize = 55;
                        break;
                    case "key_result":
                        nodeSize = 30;
                        break;
                    default: break;
                }

                let r = Math.atan2(-targetInfo.y + node.y, -targetInfo.x + node.x)
                r > -2.6 && r <= -1 ? r = -2.6 : r > -1 && r < -.6 && (r = -.6);
                const a = nodeSize + 15;

                x = node.x + a*Math.cos(r)
                y = node.y + a*Math.sin(r)
            }
            nodeContainer.select(`.collapseNode_${node.id}`).select('circle').attr('cx', x).attr('cy', y)
        })
    });
        

    const handleOnCollapseNode = (data) => {
        const node = [];
        const link = links.filter((item) => item.target === data.id);
        link.forEach((link) => {
            node.push(nodes.find((n) => n.id === link.source));
        });

        
        nodeData = [...nodeData, ...node];
        linkData = [...linkData, ...link];
        update()
    }
  };