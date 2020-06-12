let data = null;
let rows = 6;
let primaryDataUrl = 'https://api.covid19api.com/summary';
let width = 500,
	height = 500,
	margin = 40;

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
let radius = Math.min(width, height) / 2 - margin;

function fetchData(url) {
	return fetch(url).then((response) => {
		if (response.status != 200) {
			throw new Error(`Unexpected response status: ${response.status}`);
		} else {
			return response.json();
		}
	});
}
function downloadData() {
	return fetchData(primaryDataUrl).catch((error) => {
		let backupDataUrl;
		console.warn(
			`Fetching data from primary API (${primaryDataUrl}) failed so attempting to use backup API (${backupDataUrl}).`
		);
		return fetchData(backupDataUrl).catch((error) => {
			console.log(error);
			console.error(`Fetching data failed.`);
		});
	});
}

function showMore() {
	rows += 6;
	drawTable();
}

function clearCountry() {
	d3.select('svg').remove();
	document.getElementById('selectedCountry').innerHTML = '';
	document.getElementById('clear-country').classList = 'hide-element';
}

function countryClicked(evt) {
	console.log('evt', evt.currentTarget.children[0].innerHTML);
	var clickedCountry = evt.currentTarget.children[0].innerHTML;
	var country = document.getElementById('selectedCountry');
	country.innerHTML = clickedCountry + ' / OVERVIEW';
	document.getElementById('clear-country').classList = '';

	for (var i = 0; i < data.Countries.length; i++) {
		if (data.Countries[i].Country == clickedCountry) {
			var confirmed = data.Countries[i].TotalConfirmed;
			var totalDeaths = data.Countries[i].TotalDeaths;
			var totalRecovered = data.Countries[i].TotalRecovered;

			drawChart({ confirmed: confirmed, totalDeaths: totalDeaths, totalRecovered: totalRecovered });

			break;
		}
	}
	return true;
}

function sub() {
	return true;
}
function submitCountry() {
	var countryName = document.getElementById('myInput').value;
	var country = document.getElementById('selectedCountry');

	if (countryName !== '') {
		country.innerHTML = countryName + ' / OVERVIEW';
		document.getElementById('clear-country').classList = '';
		if (data) {
			for (var i = 0; i < data.Countries.length; i++) {
				if (data.Countries[i].Country == countryName) {
					var confirmed = data.Countries[i].TotalConfirmed;
					var totalDeaths = data.Countries[i].TotalDeaths;
					var totalRecovered = data.Countries[i].TotalRecovered;

					drawChart({ confirmed: confirmed, totalDeaths: totalDeaths, totalRecovered: totalRecovered });

					break;
				}
			}
		}
	}

	return false;
}

function drawTable() {
	downloadData().then((rawData) => {
		data = rawData;

		// get the reference for the body
		var table = document.getElementById('table1');

		table.innerHTML = '';

		// creates a <table> element
		var tbl = document.createElement('table');

		//creates headers
		var row = document.createElement('thead');
		row.classList.add('text-color');
		row.classList.add('table-header');

		var cell = document.createElement('th');
		var cellText = document.createTextNode('COUNTRY');
		cell.appendChild(cellText);
		row.appendChild(cell);

		cell = document.createElement('th');
		cellText = document.createTextNode('TOTAL CONFIRMED');
		cell.appendChild(cellText);
		row.appendChild(cell);

		cell = document.createElement('th');
		cellText = document.createTextNode('TOTAL DEATHS');
		cell.appendChild(cellText);
		row.appendChild(cell);

		cell = document.createElement('th');
		cellText = document.createTextNode('TOTAL RECOVERED');
		cell.appendChild(cellText);
		row.appendChild(cell);

		tbl.appendChild(row);

		// creating rows
		for (var r = 0; r < rows; r++) {
			var row = document.createElement('tr');

			row.addEventListener('click', countryClicked);

			// create cells in row
			for (var c = 0; c < 4; c++) {
				var cell = document.createElement('td');

				var text = '';
				if (c == 0) {
					text = data.Countries[r].Country;
				}
				if (c == 1) {
					text = data.Countries[r].TotalConfirmed;
				}
				if (c == 2) {
					text = data.Countries[r].TotalDeaths;
				}
				if (c == 3) {
					text = data.Countries[r].TotalRecovered;
				}

				var cellText = document.createTextNode(text);
				cell.appendChild(cellText);
				row.appendChild(cell);
			}

			tbl.appendChild(row); // add the row to the end of the table body
		}

		table.appendChild(tbl); // appends <table> into <div1>
	});
}

async function draw() {
	await drawTable();
}

draw();

// append the svg object to the div called 'my_dataviz'

function drawChart(chartData) {
	d3.select('svg').remove();

	var svg = d3
		.select('#covid-pie')
		.append('svg')
		.attr('width', width)
		.attr('height', height)
		.append('g')
		.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
	// shape helper to build arcs:
	const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

	// set the color scale
	let color = d3.scaleOrdinal().domain(chartData).range(['#bce0fd', '#279af9', '#71bcfe']);

	// Compute the position of each group on the pie:
	let pie = d3.pie().value(function (d) {
		return d.value;
	});
	let data_ready = pie(d3.entries(chartData));

	// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
	svg.selectAll('whatever').empty();

	svg.selectAll('whatever')
		.data(data_ready)
		.enter()
		.append('path')
		.attr('d', d3.arc().innerRadius(0).outerRadius(radius))
		.attr('fill', function (d) {
			return color(d.data.key);
		})
		.style('opacity', 0.7);

	svg.selectAll('whatever')
		.data(data_ready)
		.enter()
		.append('text')
		.text(function (d) {
			return '' + d.data.value;
		})
		.attr('transform', function (d) {
			return 'translate(' + arcGenerator.centroid(d) + ')';
		})
		.style('text-anchor', 'middle')
		.style('font-size', 12)
		.style('color', 'white');
}

module.exports = {
	fetchData,
	downloadData,
	showMore,
	clearCountry,
	countryClicked,
	sub,
	submitCountry,
	drawTable,
	drawChart,
};
