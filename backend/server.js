const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const fs = require('fs');
const cp = require('child_process');
const config = require('./config');


var app = express();
app.use(logger('dev'));
app.use(bodyParser.json({limit: '5gb'}));
app.use(bodyParser.urlencoded());

app.post('/upload-pptx', (req, res) => {
	var writeFunc = fs.appendFileSync;
	if (req.body.token === -1) {
		var filename = crypto.Hash("md5").update(req.body.body).digest("hex");
		writeFunc = fs.writeFileSync;
	} else {
		var filename = req.body.token;
	}
	try {
		var filepath = path.resolve(config.data_path, filename + ".pptx.base64");
		writeFunc(filepath, req.body.body);
	} catch (error) {
		console.log(error);
		res.status(500).end("File Writing Error");
	}
	res.status(200).send(filename);
});

app.post('/generate-watermark', (req, res) => {
	var text = req.body.watermark;
	var filename = crypto.Hash("md5").update(text).digest("hex");
	var filepath = path.resolve(config.data_path, filename + '.pdf');
	if (fs.existsSync(filepath)) {
		return res.status(200).send("Exists");
	}
	var cmd = 'python3 ../core/genwatermark.py ' + filepath + ' "' + text + '"';
	console.log(cmd);
	cp.exec(cmd, (err, stdout, stderr) => {
		if (err) {
			console.log(stdout);
			console.log(stderr);
			return res.status(500).send("Text generation error");
		}
		res.status(200).send("Generated");
	});
});

app.post('/convert-to-pdf', (req, res) => {
	var token = req.body.token;
	var cmd = '../core/convert-to-pdf.sh ' + config.data_path + ' ' + token;
	console.log(cmd);
	cp.exec(cmd, (err, stdout, stderr) => {
		if (err) {
			console.log(stdout);
			console.log(stderr);
			return res.status(500).send("PPT conversion error");
		}
		res.status(200).send(stdout);
	});
});

app.post('/seal', (req, res) => {
	var ppttoken = req.body.token;
	var text = req.body.watermark;
	var wmtoken = crypto.Hash("md5").update(text).digest("hex");
	var output = crypto.Hash("md5").update(ppttoken + wmtoken).digest("hex");
	cmd = 'pdftk ' +
		path.resolve(config.data_path, ppttoken + ".pdf") +
		' stamp ' +
		path.resolve(config.data_path, wmtoken + ".pdf") +
		' output ' +
		path.resolve(config.data_path, output + ".pdf");
	console.log(cmd);
	cp.exec(cmd, (err, stdout, stderr) => {
		if (err) {
			console.log(stdout);
			console.log(stderr);
			return res.status(500).send("Final PDF generation error");
		}
		res.status(200).send(output);
	});
});

app.get('/get-output/:token', (req, res) => {
	var filepath = path.resolve(config.data_path, req.params.token + '.pdf');
	if (!path.existsSync(filepath)) {
		return res.status(404).send("File not found");
	}
	res.sendFile(filepath);
});

app.use(express.static(path.join(__dirname, '../frontend')));

app.use((req, res, next) => {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

app.use((err, req, res, next) => {
	res.status(err.status || 500);
	res.write(err.message);
});
var server = app.listen(config.port, () => {
	console.log('Server running on ' + server.address().port);
});
