global.fetch = require('node-fetch');
const data = require('./mock-api.json');
global.d3 = require('d3');

const createMockHtml = () => {
	const table = document.createElement('div');
	table.id = 'table1';

	const input = document.createElement('input');
	input.id = 'clear-country';

	const selectedCountry = document.createElement('div');
	selectedCountry.id = 'selectedCountry';
	selectedCountry.innerHTML = '';

	const inputSubmit = document.createElement('input');
	inputSubmit.id = 'myInput';
	inputSubmit.value = 'Afghanistan';

	document.body.appendChild(selectedCountry);
	document.body.appendChild(table);
	document.body.appendChild(input);
	document.body.appendChild(inputSubmit);
};
describe('testing all functions', () => {
	beforeEach(async () => {
		createMockHtml();
	});

	afterEach(async () => {
		document.body.innerHTML = '';
	});

	const {
		fetchData,
		downloadData,
		showMore,
		clearCountry,
		countryClicked,
		sub,
		submitCountry,
		drawTable,
		drawChart,
	} = require('./main');

	fetch = jest.fn().mockImplementation(() =>
		Promise.resolve({
			...data,
			status: 200,
			json: jest.fn(() => {
				return data;
			}),
		})
	);

	it('downloadData', async () => {
		const res = await downloadData();
		expect(Array.isArray(res.Countries)).toBe(true);
	});

	it('show more', async () => {
		await showMore();
		expect(document.querySelector('#table1 table')).toBeDefined();
	});

	it('click first row', async () => {
		const tr = document.createElement('tr');
		tr.innerHTML = 'Afghanistan';

		countryClicked({
			currentTarget: {
				children: [tr],
			},
		});
	});

	it('submit country', async () => {
		await drawTable();
		if (document.querySelector('#selectedCountry')) {
			submitCountry();

			expect(document.querySelector('#selectedCountry').innerHTML).toBe('Afghanistan / OVERVIEW');
		}
	});

	it('clear country', () => {
		clearCountry();

		expect(document.getElementById('selectedCountry').innerHTML).toBe('');
		expect(document.getElementById('clear-country').classList['0']).toBe('hide-element');
	});

	it('downloadData catch', async () => {
		fetch = jest.fn().mockImplementation(() => Promise.reject({ message: 'Error' }));

		try {
			const res = await downloadData();
		} catch (error) {
			expect(error).toBe(true);
		}
	});
});
