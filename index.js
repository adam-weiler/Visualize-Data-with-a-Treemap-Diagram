console.clear();

const url =
  'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json'; //Data source.

const svgWidth = 1200; //Width of SVG.
const svgHeight = 500; //Height of SVG.
// const svgPadding = 70; //Padding from edge of SVG.

const svgVerticalPadding = 140; //Padding from top/bottom edge of SVG.
const svgHorizontalPadding = 90; //Padding from left/right edge of SVG.

let tooltipDiv = d3
  .select('body') //This is the div that holds the tooltip.
  .append('div')
  .attr('id', 'tooltip');

// const monthNames = [
//   'January',
//   'February',
//   'March',
//   'April',
//   'May',
//   'June',
//   'July',
//   'August',
//   'September',
//   'October',
//   'November',
//   'December'
// ];

// //#2f80ed to #9cecfb,  #FBD786,  #f5af19 to #f12711
const colours = [
  '#2f80ed',
  '#009ff8',
  '#27bbfb',
  '#65d5fa',
  '#9cecfb',
  '#FBD786',
  '#f5af19',
  '#f69400',
  '#f67800',
  '#f55600',
  '#f12711'
];

const treemap = d3.treemap().size([svgWidth, svgHeight]);

d3.json(url, (err, data) => {
  //Gets the data from the json file.
  console.log(data.children[0]); // 2600 system
  console.log(data.children[17]); // XOne system
  console.log(data.children[0].children[0]); // Pac-Man
  console.log(data.children[17].children[0]); // Call of Duty: Black Ops 3

  let root = d3
    .hierarchy(data)
    .eachBefore(d => {
      d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name;
    })
    .sum(sumBySize)
    .sort((a, b) => {
      return b.height - a.height || b.value - a.value;
    });

  treemap(root);

  //   //Defines elements for the x-axis.
  //   let minYear = d3.min(data.monthlyVariance, d => {
  //     return d.year;
  //   }); //Gets smallest year from data.
  //   // console.log('minYear', minYear)  // 1753

  //   let maxYear = d3.max(data.monthlyVariance, d => {
  //     return d.year;
  //   }); //Gets largest year from data.
  //   // console.log('maxYear', maxYear)  // 2015

  //   let xScale = d3 //Scale for the x-axis.
  //     .scaleLinear()
  //     .domain([minYear, maxYear]) //Uses minYear as earliest year, and maxYear as latest year.
  //     .range([svgHorizontalPadding, svgWidth - svgVerticalPadding / 1.5]);
  //   // console.log(xScale);  // Math lingo.

  //   let xAxis = d3
  //     .axisBottom() //The x-axis.
  //     .scale(xScale)
  //     .tickFormat(d3.format('d'))
  //     .ticks(26);
  //   // console.log(xAxis);  // Math lingo.

  //   const cellWidth = svgWidth / (maxYear - minYear); //There are 262 years in the database.
  //   // console.log(cellWidth) //3.435114503816794

  //   //Defines elements for the y-axis.
  //   let yScale = d3
  //     .scaleBand() //Scale for the y-axis.
  //     .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  //     .range([svgHorizontalPadding, svgHeight - svgVerticalPadding]);
  //   // console.log(yScale);  // Math lingo.

  //   let yAxis = d3
  //     .axisLeft(yScale) //The y-axis.
  //     .tickValues(yScale.domain())
  //     .tickFormat(d => {
  //       return monthNames[d];
  //     });
  //   // console.log(yAxis);  // Math lingo.

  //   const cellHeight = yScale.bandwidth();
  //   // console.log(cellHeight)  // 30

  //Defines the main SVG element.
  let svgContainer = d3
    .select('body')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

  svgContainer
    .append('text') //Appends the Title element.
    .attr('id', 'title')
    .attr('transform', 'translate(100,0)')
    .attr('x', svgHorizontalPadding * 2.5)
    .attr('y', svgVerticalPadding / 3.5)
    .text('Video Game Sales');

  svgContainer
    .append('text') //Appends the Description element.
    .attr('id', 'description')
    .attr('transform', 'translate(100,0)')
    .attr('x', svgHorizontalPadding * 4)
    .attr('y', svgVerticalPadding / 2)
    .text('Top 100 Most Solid Video Games (Grouped by System)');

  let cell = svgContainer
    .selectAll('g')
    .data(root.leaves())
    .enter()
    .append('g')
    .attr('class', 'group')
    .attr('transform', d => {
      return 'translate(' + d.x0 + ',' + d.y0 + ')';
    });

  let tile = cell
    .append('rect')
    .attr('id', d => {
      return d.data.id;
    })
    .attr('class', 'tile')
    .attr('width', d => {
      return d.x1 - d.x0;
    })
    .attr('height', d => {
      return d.y1 - d.y0;
    })
    .attr('data-name', d => {
      return d.data.name;
    })
    .attr('data-category', d => {
      return d.data.category;
    })
    .attr('data-value', d => {
      return d.data.value;
    })
    .attr('fill', d => {
      return colours(d.data.category);
    })
    .on('mouseover', d => {
      //When user mouse's over a rectangle.
      tooltipDiv.style('opacity', 0.9); //Tooltip div is made visible.
      tooltipDiv.attr('data-value', d.data.value); //Only visible with Chrome Dev tools. Uses date from data.
      //console.log('The data-date field: ', data.data[i][0]);

      //Populates tooltip div with current year, month, variance, and temperature.
      tooltipDiv
        .html(
          `<h2>Name: ${d.data.name}</h2>
					 <p>Category: ${d.data.category}/p>
					 <p>Value ${d.data.value}℃</p>`
        )
        .style('left', d3.event.pageX + 25 + 'px') //Div appears to the right of the rectangle.
        .style('top', d3.event.pageY - 10 + 'px');
    })
    .on('mouseout', () => {
      //When user mouses's away from rectangle.
      tooltipDiv.style('opacity', 0); //Tooltip div is made invisible.
    });

  //   svgContainer
  //     .append('text') //X-Axis label.
  //     .attr('transform', 'translate(100,0)')
  //     .attr('x', svgWidth / 2.8)
  //     .attr('y', svgHeight - 80)
  //     .text('Years');

  //   svgContainer
  //     .append('text') //Y-Axis label.
  //     .attr('transform', 'rotate(-90)')
  //     .attr('x', 0 - svgHeight / 1.65)
  //     .attr('y', 20)
  //     .text('Months');
  //   // console.log(svgContainer);

  //   d3.select('svg')
  //     .selectAll('rect') //Appends all of the Cell rectangles.
  //     .data(data.monthlyVariance)
  //     .enter()
  //     .append('rect')
  //     .attr('class', 'cell')

  //     .attr('x', d => {
  //       //Controls x-value for rectangles.
  //       // console.log('X position:' , xScale(d.year)) // Something like 535.2999566923778
  //       return xScale(d.year);
  //     })

  //     .attr('y', d => {
  //       //Controls y-value for rectangles.
  //       // console.log('Y position:' , yScale(d.month - 1)) // Something like ?????
  //       return yScale(d.month - 1);
  //     })
  //     .attr('width', cellWidth) //Width of all rectangles.
  //     .attr('height', cellHeight) //Height of all rectangles.

  //     .attr('data-month', d => {
  //       //Only visible with Chrome Dev tools.
  //       // console.log('The data-month field: ', d.month - 1);
  //       return d.month - 1; //Uses date from data.
  //     })
  //     .attr('data-year', d => {
  //       //Only visible with Chrome Dev tools.
  //       // console.log('The data-year field: ', d.year);
  //       return d.year; //Uses date from data.
  //     })
  //     .attr('data-temp', d => {
  //       //Only visible with Chrome Dev tools.
  //       // console.log('The data-temp field: ', d.variance);
  //       return d.variance; //Uses date from data.
  //     })

  //     .style('fill', d => {
  //       let temp = parseFloat(d.variance + data.baseTemperature);

  //       if (temp < 2.8) {
  //         return colours[0];
  //       } else if (temp < 3.9) {
  //         return colours[1];
  //       } else if (temp < 5) {
  //         return colours[2];
  //       } else if (temp < 6.1) {
  //         return colours[3];
  //       } else if (temp < 7.2) {
  //         return colours[4];
  //       } else if (temp < 8.3) {
  //         return colours[5];
  //       } else if (temp < 9.4) {
  //         return colours[6];
  //       } else if (temp < 10.5) {
  //         return colours[7];
  //       } else if (temp < 11.6) {
  //         return colours[8];
  //       } else if (temp < 12.7) {
  //         return colours[9];
  //       } else if (temp < 13.8) {
  //         // Higher than 12.8
  //         return colours[10];
  //       }
  //     })

  //

  //   svgContainer
  //     .append('g') //Appends the x-axis to the SVG file.
  //     .attr('id', 'x-axis')
  //     .attr('transform', 'translate(0,' + (svgHeight - svgVerticalPadding) + ')')
  //     .call(xAxis);

  //   svgContainer
  //     .append('g') //Appends the y-axis to the SVG file.
  //     .call(yAxis)
  //     .attr('id', 'y-axis')
  //     .attr('transform', 'translate(' + svgHorizontalPadding + ',0)');

  //   const svgLegend = d3
  //     .select('body')
  //     .append('svg')
  //     .attr('class', 'svg-legend')
  //     .attr('width', 450)
  //     .attr('height', 100)
  //     // .attr('x', svgHorizontalPadding)
  //     // .attr('y', -400)
  //     .attr('id', 'legend');

  //   const xScaleLegend = d3
  //     .scaleLinear()
  //     .domain([0, 11])
  //     .range([svgHorizontalPadding, 500 - svgVerticalPadding]);

  //   const xAxisLegend = d3.axisBottom(xScaleLegend).tickFormat((d, i) => {
  //     const scaleLabel = 1.7 + 1.1 * i;
  //     return scaleLabel.toFixed(1);
  //   });

  //   svgLegend
  //     .append('g')
  //     .attr('transform', 'translate(-23, 40)')
  //     .attr('id', 'x-axislegend')
  //     .call(xAxisLegend);

  //   svgLegend
  //     .selectAll('rect')
  //     .data(colours)
  //     .enter()
  //     .append('rect')
  //     .attr('x', (d, i) => {
  //       return xScaleLegend(i - 1);
  //     })
  //     .attr('y', d => {
  //       return 10;
  //     })
  //     .attr('width', 28)
  //     .attr('height', 30)
  //     .style('fill', (d, i) => {
  //       return colours[i];
  //     });

  console.log('End of chart');
});

function sumBySize(d) {
  return d.value;
}

console.log('End of program');
