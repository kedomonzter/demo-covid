require('jest-fetch-mock').enableMocks();
var jsdom = require('jsdom');
const { JSDOM } = jsdom;

const { document } = new JSDOM('<!doctype html><html><body></body></html>').window;
global.document = document;
global.window = document.defaultView;
// global.window = dom.window;
