const express = require('express');
const path = require('path');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

require("dotenv").config();

const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 5000;

// Multi-process to utilize all CPU cores.
if (!isDev && cluster.isMaster)
{
	console.error(`Node cluster master ${process.pid} is running`);

	// Fork workers.
	for (let i = 0; i < numCPUs; i++)
	{
		cluster.fork();
	}

	cluster.on('exit', (worker, code, signal) =>
	{
		console.error(`Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`);
	});

}

else
{
	const app = express();
	app.use(express.json());

	// Priority serve any static files.
	app.use(express.static(path.resolve(__dirname, './frontend/build')));

	const session = require("express-session");

	const xmlparser = require('express-xml-bodyparser');
	app.use(xmlparser());
	
	// Google OAuth
	const passport = require("./utils/utils.google_oauth");
	app.use(session({ secret: 'cats', resave: true, saveUninitialized: true }));
	app.use(passport.initialize());
	app.use(passport.session());

	// Then handle backend routing
	app.use("/api", require("./routes"));

	// User profile pictures
	app.use('/profile-pictures', express.static(__dirname + '/assets/user/profile-images'));
	
	// Purchase invoices
	app.use('/invoice/download', express.static(__dirname + '/assets/invoice'));
	
	// Product images
	app.use('/product-image', express.static(__dirname + '/assets/product-images'));

	// Exception: Keeping this in the end prevents it to be default routing
	app.get('*', function (request, response)
	{
		response.sendFile(path.resolve(__dirname, './frontend/build', 'index.html'));
	});

	app.listen(PORT, function ()
	{
		console.error(`Node ${isDev ? 'dev server' : 'cluster worker ' + process.pid}: listening on port ${PORT}`);
	});

}
