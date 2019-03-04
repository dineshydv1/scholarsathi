const path = require('path');
//var baseUrl = 'http://localhost:5000'; // development
var baseUrl = 'https://www.scholarsathi.com'; // production

var scholarsathiUrl = 'https://www.scholarsathi.com';

// global variable
global.sourcePath = path.join(__dirname, 'src');
global.publicPath = path.join(__dirname, 'src', 'public');
global.modelsPath = path.join(__dirname, 'src', 'models');
global.scholarsathiUrl = scholarsathiUrl;
global.baseUrl = baseUrl;
global.publicUrl = baseUrl+'/public/';
global.publicPanelUrl = baseUrl+'/public/panel';