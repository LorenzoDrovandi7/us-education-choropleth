const width = 960;
const height = 600;
const svg = d3.select("#map").append("svg").attr("width", width).attr("height", height);

const tooltip = d3.select("#tooltip");

const educationURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const countiesURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

Promise.all([d3.json(countiesURL), d3.json(educationURL)]).then(([us, educationData]) => {
  const colorScale = d3.scaleThreshold().domain([10, 20, 30, 40, 50]).range(d3.schemeBlues[5]);

  const path = d3.geoPath();

  svg
    .append("g")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .join("path")
    .attr("class", "county")
    .attr("data-fips", (d) => d.id)
    .attr("data-education", (d) => {
      const county = educationData.find((e) => e.fips === d.id);
      return county ? county.bachelorsOrHigher : 0;
    })
    .attr("fill", (d) => {
      const county = educationData.find((e) => e.fips === d.id);
      return county ? colorScale(county.bachelorsOrHigher) : "#ccc";
    })
    .attr("d", path)
    .on("mouseover", (event, d) => {
      const county = educationData.find((e) => e.fips === d.id);
      tooltip
        .style("opacity", 1)
        .attr("data-education", county ? county.bachelorsOrHigher : 0)
        .html(
          `
            <strong>${county ? county.area_name : "Unknown"}, ${county ? county.state : ""}</strong><br>
            ${county ? county.bachelorsOrHigher : 0}%`
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

  // Leyenda
  const legendWidth = 300;
  const legendHeight = 50;
  const legend = d3.select("#legend").attr("width", legendWidth).attr("height", legendHeight);

  const legendScale = d3.scaleLinear().domain([10, 50]).range([0, legendWidth]);

  const legendAxis = d3
    .axisBottom(legendScale)
    .tickValues([10, 20, 30, 40, 50])
    .tickFormat((d) => d + "%");

  const legendColors = [10, 20, 30, 40, 50].map((d) => colorScale(d));

  legend
    .selectAll("rect")
    .data(legendColors)
    .join("rect")
    .attr("x", (d, i) => i * (legendWidth / legendColors.length))
    .attr("y", 0)
    .attr("width", legendWidth / legendColors.length)
    .attr("height", legendHeight - 20)
    .attr("fill", (d) => d);

  legend
    .append("g")
    .attr("transform", `translate(0, ${legendHeight - 20})`)
    .call(legendAxis);
});
