const h = 650;
const w = 1000;
const legendRectHeight = 20;
const legendRectWidth = 30;

const urlEducationData = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const urlCountyData = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

const colorScheme = ["rgb(216, 245, 217)",
                        "rgb(180, 220, 180)",
                        "rgb(140, 202, 142)",
                        "rgb(108, 166, 104)",
                        "rgb(62, 138, 68)",
                        "rgb(24, 115, 24)", 
                        "rgb(0, 90, 0)",
                        "rgb(0, 50, 0"];

fetch(urlEducationData)
    .then(response => response.json())
    .then(data => loadCounties(data));

function loadCounties(dataEducation) {
fetch(urlCountyData)
    .then(response => response.json())
    .then(data => drawMap(dataEducation, data))
}

function drawMap(dataEducation, dataCounties) {
    let path = d3.geoPath();
    
    const svg = d3.select("#svg-container").append("svg").attr("height", h).attr("width", w).style("fill", "navy");
    const legendSvg = d3.select("#legend").attr("height", legendRectHeight + 400).attr("width", legendRectWidth * colorScheme);
    const tooltip = d3.select("#tooltip");

    console.log(dataEducation);
    console.log(dataCounties);

    let geojsonCounties = topojson.feature(dataCounties, dataCounties.objects.counties);
    console.log(geojsonCounties);

    let minEducation = Math.min(...dataEducation.map(county => county.bachelorsOrHigher));
    let maxEducation = Math.max(...dataEducation.map(county => county.bachelorsOrHigher));

    geojsonCounties.features.forEach(element => {
        element.county = dataEducation[dataEducation.findIndex(el => el.fips == element.id)];
    });

    let colorDomain = [];
    let step = (maxEducation - minEducation) / colorScheme.length;
    for (let i = 1; i < colorScheme.length; i++) {
        colorDomain.push(minEducation + i * step);
    }

    let colorScale = d3.scaleThreshold()
                        .domain(colorDomain)
                        .range(colorScheme);

    svg.selectAll("path")
        .data(geojsonCounties.features)
        .enter()
        .append("path")
        .attr("data-fips", d => d.id)
        .attr("data-education", d => d.county.bachelorsOrHigher)
        .attr("d", path)
        .attr("class", "county")
        .style("fill", d => colorScale(d.county.bachelorsOrHigher))
        .on("mouseover", (d, i) => {
              tooltip.attr("data-education", d.county.bachelorsOrHigher)
                    .style("opacity", 0.7)
                    .style("top", (d3.event.pageY - 48) + "px")
                    .style("left", (d3.event.pageX + 20) + "px")
                    .html(`${d.county.area_name}, ${d.county.state}: ${(d.county.bachelorsOrHigher).toFixed(1)}%`)
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0)
                    .style("top", -10000)
                    .style("left", -10000)
        });


    legendSvg.selectAll("rect")
        .data(colorScheme)
        .enter()
        .append("rect")
        .attr("height", legendRectHeight)
        .attr("width", legendRectWidth)
        .attr("y", 0)
        .attr("x", (d, i) => i * legendRectWidth)
        .style("fill", d => d)
        .style("stroke", "black")
        .style("stroke-width", 1);

    let legendScale = d3.scaleLinear()
                        .domain([minEducation, maxEducation])
                        .range([0, legendRectWidth * colorScheme.length]);
    let legendAxis = d3.axisBottom(legendScale).tickValues(colorDomain).tickFormat(d => `${d.toFixed(0)}%`);

    legendSvg.append("g")
        .attr("transform", "translate(0, " + legendRectHeight + ")")
        .call(legendAxis);

       svg.append("path")
      .datum(topojson.mesh(dataCounties, dataCounties.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "states")
      .attr("d", path);

    /*
    let geojsonStates = topojson.feature(dataCounties, dataCounties.objects.states);
    svg.data(geojsonStates.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", "orange")
        .style("stroke", "white")
        .style("stroke-width", 1);*/
}
