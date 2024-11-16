import './App.css';
import * as d3 from 'd3'; 
import { useEffect, useRef, useState } from 'react';

function HeatMap() {

  const svgRef = useRef(null);
  const paletteRef = useRef(null);
  const [data, setData] = useState([]);
  const [fetchedData, setFetchedData] = useState(false);
  
  useEffect(() => {

    const mSvg = svgRef.current;
    const mPalette = paletteRef.current;

    // SVG MAIN SIZE
    const height = 550;
    const width = 1300;
    const margin = { top: 100, right: 200, bottom: 100, left: 200 };
    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;
    // SVG MAIN SIZE

    // PALETTE MAIN SIZE
    const heightP = 70;
    const widthP = 300;
    const marginP = { top: 10, right: 20, bottom: 10, left: 20 };
    const innerHeightP = heightP - marginP.top - marginP.bottom;
    const innerWidthP = widthP - marginP.left - marginP.right;
    // PALETTE MAIN SIZE

    // Palette Data - Value Data
    const colorScheme = ['#99BFD7','#80C7E9','#66D2FB','#4DD8FF','#E6FFD2','#FFD680','#FFAB40','#E67300','#E63900','#B32400'];
    const valueScheme = [2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8];
    const months = ["January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"];
    // Palette Data - Value Data

    const colorScale = d3.scaleLinear() // Unify version
    .domain(valueScheme)
    .range(colorScheme); // Map values directly from colors

    const xScaleP = d3.scaleBand()
    .domain(valueScheme)
    .range([0, innerWidthP])
    .padding(0.1);

    const palette = d3.select(mPalette).append('svg').attr('height', heightP).attr('width', widthP); //.attr('x', 1000) IS NOT APPLICABLE

    const paletteG = palette.append('g')
    .attr('transform', `translate(${marginP.left}, ${marginP.top})`);

    paletteG.selectAll('rect').data(valueScheme)
    .enter().append('rect')
    .attr('x', d => xScaleP(d))
    .attr('y', innerHeightP / 3)
    .attr('width', xScaleP.bandwidth())
    .attr('height', innerHeightP / 3)
    .attr('fill', d => colorScale(d));

    /* SVG MAIN (G) - PALETTE MAIN (G) */
    const svg = d3.select(mSvg).append('svg')
      .attr('height', height)
      .attr('width', width);

    const xAxisPalette = d3.axisBottom(xScaleP);

    palette.append('g')
    .attr('transform', `translate(${marginP.left}, ${marginP.bottom + 35})`)
    .style('color', 'white')
    .call(xAxisPalette);

    // Fetch data only once
    d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
      .then(d => {
        const main = d.monthlyVariance;
        setData(main);
        setFetchedData(true);
      })
      .catch(error => console.error("Error fetching data: ", error));

    // Render the heatmap if data is available
    if (data.length > 0 && fetchedData === true) {

      data.map(d => {
        d.result = 8.66 + d.variance;
        return d.result // Create 'd.result' within the state with dot notation
      });

      const xScale = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([0, innerWidth])
        .padding(0.2);

      const xScaleA = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([0, innerWidth]);
      
        const yScaleA = d3.scaleBand()
        .domain(months.map(d => d))
        .range([innerHeight, 0]);
  
      const yScale = d3.scaleBand()
        .domain(data.map(d => d.month))
        .range([innerHeight, 0]);

      const parseFormat = d3.format(".1f");

      // EUE ║║║║║║║

      const bindData = svg.selectAll('g').data(data);
      const enter = bindData.enter().append('g');
        bindData.merge(enter) // EX. const = eU
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
      bindData.exit()
        .remove();

      // EUE ║║║║║║║║
      
     enter.append('text')
    .text('Monthly Global Land-Surface Temperature')
    .attr('transform', `translate(${innerWidth / 4 - 40}, -60)`)
    .attr('font-size', 30);

     enter.append('text')
    .text('1753 - 2015: base temperature 8.66℃')
    .attr('transform', `translate(${innerWidth / 3 + 30}, -30)`)
    .attr('font-size', 15);

    const rectangles = enter.append('rect')
      .attr('x', d => xScale(d.year))
      .attr('y', d => yScale(d.month))
      .attr('height', yScale.bandwidth())
      .attr('width', xScale.bandwidth() + 1)
      .attr('fill', d => colorScale(d.result))
      .attr('class', 'hoverBorder');

      rectangles.append('title')
        .text(d => {
          d.result = +d.result;
          const formatted = parseFormat(d.result);
          return `Temperature: ${formatted}°C\nMonth: ${d.month}\nYear: ${d.year}`;
        });

      const xAxis = d3.axisBottom(xScaleA).ticks(22)
      .tickFormat(d3.format(".0f"))

      const yAxis = d3.axisLeft(yScaleA);

      svg.append('g')
        .attr('transform', `translate(${margin.left}, ${height - margin.bottom})`)
        .attr('class', 'text-size')
        .call(xAxis)
        .select('.domain')
        .remove()

      svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .call(yAxis)        
        .select('.domain')
        .remove();

    } // end of IF

    return () => {
      // Cleanup
      d3.select(mSvg).select('svg').remove();
      d3.select(mPalette).select('svg').remove();
    }
  }, [fetchedData, data]);

  return (
    <div>
      <div ref={paletteRef} className="ColorPalette"></div>
      <div ref={svgRef} className="HeatMap"></div>
    </div>
  );
}

export default HeatMap;