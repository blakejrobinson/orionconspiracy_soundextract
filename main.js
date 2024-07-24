const fs = require('fs');
const path = require('path');
const voc = require('./vocObject');
const wav = require('./wavHandler');

//Take in a folder or file
if (process.argv.length < 3)
{
	console.log('Usage: node main.js <dat file/dat path>');
	process.exit();
}

//Wlways turn to an array
if (fs.statSync(process.argv[2]).isDirectory())
	process.argv[2] = fs.readdirSync(process.argv[2]).filter(f => (f.toLowerCase().endsWith(".dat") && (f.toLowerCase().match('/cer_s\d+/') || f.toLowerCase().includes('cer_vg') || f.toLowerCase().includes('cer_vs') || f.toLowerCase().includes('cer_vb')))).map(f => path.join(process.argv[2], f));
else
	process.argv[2]	= [process.argv[2]];

//Each file
process.argv[2].forEach((file) =>
{
	//Read it in
	try
	{
		test = new voc(file);
	}
	catch (e)
	{
		console.error(`Error reading file ${file}:`);
		console.error(e);
		process.exit(1);
	}

	//Save each block to a WAV
	test.Blocks.forEach((block,i) =>
	{
		console.log(`Block ${i} (${block.data.length} bytes @ ${block.samplingRate}hz):`);
		var WAVFile = wav(block.samplingRate, block.data);
		if (!fs.existsSync('output'))
			fs.mkdirSync('output');
		fs.writeFileSync(`output/${path.parse(file).name}_${i}.wav`, WAVFile);
	});
});