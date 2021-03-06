module.exports = {
  create
}

function create(graph) {
  var width = window.innerWidth,
    height = window.innerHeight;

  var countExtent = d3.extent(graph.nodes, d => d.references)
  var circleRadius = d3.scale.sqrt().range([3, 32]).domain(countExtent)

  graph.nodes.forEach(n => {
    n.x = Math.floor(Math.random() * width)
    n.y = Math.floor(Math.random() * height)
    n.radius = circleRadius(n.references)
  });

  var force = d3.layout.force()
    .charge(-200)
    .linkDistance(50)
    .size([width, height]);

  var svg = d3.select("body").append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .call(d3.behavior.zoom().on('zoom', () => {
      svg.attr('transform', 'translate(' + d3.event.translate + ') scale(' + d3.event.scale + ')')
    }))
    .append('g')

  var color = d3.scale.category20()

  var nodeById = d3.map();

  graph.nodes.forEach(function(node) {
    nodeById.set(node.id, node);
  });

  graph.links.forEach(function(link) {
    link.source = nodeById.get(link.source);
    link.target = nodeById.get(link.target);
  });

  force
      .nodes(graph.nodes)
      .links(graph.links)
      .start();

  var link = svg.selectAll(".link")
      .data(graph.links)
    .enter().append("line")
      .attr("class", "link");

  var node = svg.selectAll(".node")
      .data(graph.nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", (d) => d.radius)
      .style("fill", d => color(d.group))
      .call(force.drag);

  node.append("title")
    .text(d => d.name)

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  });
}

