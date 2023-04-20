// input the geodata public json
var geodata = d3.json("world.geojson", function (error, world) {
    // Set up the SVG container



    var data = d3.json("all_years_data.json", function (error, data) {

        var margin = { top: 20, right: 20, bottom: 20, left: 20 };
        var width = 960 - margin.left - margin.right;
        var height = 600 - margin.top - margin.bottom;

        Object.keys(data).forEach(function (year) {
            // Set up the SVG container
            var svg = d3.select("#map-elements")
                .append("svg")
                .attr("width", 960)
                .attr("height", 600);
            // set the id attribute to svg-{year}
            svg.attr("id", `svg-${year}`)
            // if the year is 2011, set the display to block, otherwise display none
            svg.style("display", year == 2011 ? "block" : "none");

            // Define the projection
            var projection = d3.geoMercator()
                .scale(130)
                .translate([480, 300]);

            // Define the path generator
            var path = d3.geoPath()
                .projection(projection);
            svg.selectAll("path")
                .data(world.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("fill", "#e2e8f0")
                .attr("stroke", "#94a3b8");

            var tooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("visibility", "hidden")
                .style("background-color", "rgba(255, 255, 255, 0.9)")
                .style("border-radius", "5px")
                .style("border", "1px solid #ccc")
                .style("padding", "5px");




            // Count the number of occurrences of each location
            var counts = {};
            data[year].forEach(function (d) {
                if (d.location in counts) {
                    counts[d.location] += 1;
                } else {
                    counts[d.location] = 1;
                }
            });

            // whats the total count
            // whats the length of the array
            console.log(Object.values(counts).length);

            // Define the scale for the bubble sizes
            var maxCount = d3.max(Object.values(counts));
            var bubbleScale = d3.scaleSqrt()
                .domain([1, maxCount])
                .range([10, 30]);

            // Define the color scale for the continents

            var colorScale = d3.scaleOrdinal()
                .domain(["North America", "South America", "Europe", "Asia", "Africa", "Oceania"])
                .range(["#ff0000", "#00ff00", "#0000ff", "#ffa500", "#800080", "#00ffff"]);



            console.log(colorScale.domain());
            console.log(data[year].map(function (d) { return d.continent; }));


            console.log(counts);

            // Draw the circles
            svg.selectAll("circle")
                .data(data[year])
                .enter()
                .append("circle")
                .attr("fill", function (d) {
                    var continent = d.continent.trim();
                    return colorScale(continent);
                })
                .attr("cx", function (d) { return projection([d.lon, d.lat])[0]; })
                .attr("cy", function (d) { return projection([d.lon, d.lat])[1]; })
                .attr("r", function (d) { return bubbleScale(counts[d.location]); })
                .attr("fill-opacity", 0.5)
                .attr("stroke", "white")
                .on("mouseover", function (d) {
                    var tooltipText = "Country: " + d.location +
                        "<tspan x=\"0\" dy=\"1.2em\"> | Universities: " + counts[d.location] + "</tspan>";

                    tooltip.html(tooltipText);
                    tooltip.style("visibility", "visible");
                })
                .on("mousemove", function (d) {
                    tooltip.style("top", (d3.event.pageY - 10) + "px")
                        .style("left", (d3.event.pageX + 10) + "px");
                })
                .on("mouseout", function (d) {
                    tooltip.style("visibility", "hidden");
                });


            var width = 960 - margin.left - margin.right;
            var height = 600 - margin.top - margin.bottom;
            // add a title
            svg.append("text")
                .attr("class", "title")
                .attr("x", width / 2)
                .attr("y", 30)
                .attr("text-anchor", "middle")
                // put a white background with 5px of padding and rounded


                .text(year)

            // add a subtitle
            svg.append("text")
                .attr("class", "subtitle")
                .attr("x", width / 2)
                .attr("y", height - 60)
                .attr("text-anchor", "middle")
                .text("Number of Countries: " + Object.values(counts).length)
                .style("font-size", "13px") // set the font size to 24 pixels
                .style("font-weight", "bold") // set the font weight to bold
                .style("font-family", "Inter"); // set the font family to nter

            // ! bars start here



            // Define an array of all the continent names
            var allContinents = ["Europe", "North America", "Asia", "Oceania", "Africa", "South America"];

            // Group the data by continent
            var continentCounts = {};
            allContinents.forEach(function (continent) {
                if (!(continent in continentCounts)) {
                    continentCounts[continent] = 0;
                }
            });
            data[year].forEach(function (d) {
                if (d.continent in continentCounts) {
                    continentCounts[d.continent] += 1;
                }
            });

            // Define the scale for the bar heights
            var maxCount = d3.max(Object.values(continentCounts));
            var heightScale = d3.scaleLinear()
                .domain([0, maxCount])
                .range([0, 100]);

            // Define the scale for the bar positions
            var continentScale = d3.scaleBand()
                .domain(Object.keys(continentCounts))
                .range([0, 800])
                .padding(0.1);



            // Draw the bars
            svg.selectAll("rect")
                .data(Object.keys(continentCounts))
                .enter()
                .append("rect")
                // set fill to a pastel green
                .attr("fill", function (d) {
                    return colorScale(d);
                })
                .attr("x", function (d) { return continentScale(d); })
                .attr("y", function (d) { return 600 - heightScale(continentCounts[d]); })
                .attr("width", continentScale.bandwidth())
                .attr("height", function (d) { return heightScale(continentCounts[d]); })
                .attr("fill-opacity", 0.5)
                .attr("stroke", "white")
                .on("mouseover", function (d) {
                    var tooltipText = "Continent: " + d +
                        "<tspan x=\"0\" dy=\"1.2em\"> | Universities: " + continentCounts[d] + "</tspan>";

                    tooltip.html(tooltipText);
                    tooltip.style("visibility", "visible")
                })
                .on("mousemove", function (d) {
                    tooltip.style("top", (d3.event.pageY - 10) + "px")
                        .style("left", (d3.event.pageX + 10) + "px");
                })
                .on("mouseout", function (d) {
                    tooltip.style("visibility", "hidden");
                });

            // Add the continent names as separate text elements on top of each bar
            var continentNames = ["Europe", "North America", "Asia", "Oceania", "Africa", "South America"];
            svg.selectAll(".continent-name")
                .data(continentNames)
                .enter()
                .append("text")
                .attr("class", "continent-name")
                .text(function (d) { return d; })
                .attr("text-anchor", "middle")
                .style("background-color", "white")
                .style("border-radius", "5px")
                .style("padding", "5px")
                .attr("x", function (d, i) { return (i * 133) + 69; })
                .attr("y", function (d) { return 550; })
                .attr("font-size", "10px")
                .style("z-index", "1")
                .attr("fill", "#666");

        });


    });
});

var yearSlider = document.getElementById("year-slider");

// Add an event listener for the "input" event
yearSlider.addEventListener("input", function () {
    var year = parseInt(yearSlider.value);


    // Loop through all the SVG elements and toggle their visibility based on the current year
    for (var i = 2011; i <= 2022; i++) {
        var svg = document.getElementById("svg-" + i);
        if (i === year) {
            svg.style.display = "block";
        } else {
            svg.style.display = "none";
        }
    }
});

// Select the main container
const container = document.querySelectorAll(".range-slider");

// Select the individual parts
const slider = document.querySelector(".slider");
const thumb = document.querySelector(".slider-thumb");
const tooltipLabel = document.querySelector(".tooltip-label");
const progress = document.querySelector(".progress");

// Function for handling the slider values
function customSlider() {
    // Get the percentage
    const maxVal = slider.getAttribute("max") - 2011;
    const val = ((slider.value - 2011) / maxVal) * 100 + "%";

    //Display the value in the tooltip
    tooltipLabel.textContent = slider.value;

    // Set the thumb and progress to the current value
    progress.style.width = val;
    thumb.style.left = val;
}

customSlider();

slider.addEventListener("input", () => {
    customSlider();
})


// "N° of European universities over the years" Chart

var europeanUnisChart = echarts.init(document.getElementById("european-unis"));

var europeanUnisChartOption = {
    title: {
        text: 'N° of european universities over the years',
        textStyle: {
            color: '#64748b', // tailwind slate-500
            fontWeight: '600',
            fontFamily: 'Inter'
        }
    },
    color: '#334155', // tailwind slate-700
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    tooltip: {
        trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'European Universities',
        data: [72, 161, 164, 166, 163, 310, 348, 370, 401, 435, 466, 600],
        type: 'line'
      }
    ]
  };

europeanUnisChart.setOption(europeanUnisChartOption);


// "N° of Asian universities over the years" Chart

var asianUnisChart = echarts.init(document.getElementById("asian-unis"));

var asianUnisChartOption = {
    title: {
        text: 'N° of asian universities over the years',
        textStyle: {
            color: '#64748b', // tailwind slate-500
            fontWeight: '600',
            fontFamily: 'Inter'
        }
    },
    color: '#0ea5e9', // tailwind sky-500
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    tooltip: {
        trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Asian Universities',
        data: [19, 46, 45, 46, 48, 158, 245, 305, 356, 416, 473, 775],
        type: 'line'
      }
    ]
  };

asianUnisChart.setOption(asianUnisChartOption);


// "Comparison between N° of Asian and European universities over the years" Chart

var asianEuropeanUnisChart = echarts.init(document.getElementById("asian-european-unis"));

var asianEuropeanUnisChartOption = option = {
    title: {
        text: 'N° of asian and european universities over the years',
        textStyle: {
            color: '#64748b', // tailwind slate-500
            fontWeight: '600',
            fontFamily: 'Inter'
        }
    },
    color: ['#0ea5e9','#334155'], // // tailwind sky-500, tailwind slate-700
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
        type: 'category',
        data: ['2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Asian Universities',
          data: [19, 46, 45, 46, 48, 158, 245, 305, 356, 416, 473, 775],
          type: 'line'
        },
        {
          name: 'European Universities',
          data: [72, 161, 164, 166, 163, 310, 348, 370, 401, 435, 466, 600],
          type: 'line'
        }
      ]
};

asianEuropeanUnisChart.setOption(asianEuropeanUnisChartOption);

// N° of top 10 spots takeover by UnitedStates over the years

var topUnisChart = echarts.init(document.getElementById("top-unis"));

var topUnisChartOption = {
    title: {
        text: 'N° of top 10 spots takeover by UnitedStates over the years',
        textStyle: {
            color: '#64748b', // tailwind slate-500
            fontWeight: '600',
            fontFamily: 'Inter'
        }
    },
    color: '#334155', // tailwind slate-700
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    tooltip: {
        trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Top 10 Universities',
        data: [7,7, 7, 7, 7, 6, 7, 7, 7, 7, 8, 8],
        type: 'line'
      }
    ]
  };

topUnisChart.setOption(topUnisChartOption);


// N° of top 10 spots takeover by Asia in coming years

var futuretopUnisChart = echarts.init(document.getElementById("future-top-unis"));

var futuretopUnisChartOption = {
    title: {
        text: 'N° of top 10 spots takeover by Asian Unis over the years',
        textStyle: {
            color: '#64748b', // tailwind slate-500
            fontWeight: '600',
            fontFamily: 'Inter'
        }
    },
    color: '#334155', // tailwind slate-700
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    tooltip: {
        trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['20x1', '20x2', '20x3', '20x4', '20x5', '20x6', '20x7', '20x8', '20x9', '20x0', '20x1', '20x2']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Top 10 Universities',
        data: [10,10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
        type: 'line'
      }
    ]
  };

futuretopUnisChart.setOption(topUnisChartOption);



