const createWaveFile = (sampleRate, rawBytes) =>
{
	// WAVE file header
	const header = Buffer.alloc(44);

	// RIFF chunk descriptor
	header.write('RIFF', 0);
	header.writeUInt32LE(36 + rawBytes.length, 4);
	header.write('WAVE', 8);

	// fmt sub-chunk
	header.write('fmt ', 12);
	header.writeUInt32LE(16, 16); // Sub-chunk size
	header.writeUInt16LE(1, 20); // Audio format (PCM)
	header.writeUInt16LE(1, 22); // Num of channels
	header.writeUInt32LE(sampleRate, 24); // Sample rate
	header.writeUInt32LE(sampleRate, 28); // Byte rate
	header.writeUInt16LE(1, 32); // Block align
	header.writeUInt16LE(8, 34); // Bits per sample

	// data sub-chunk
	header.write('data', 36);
	header.writeUInt32LE(rawBytes.length, 40);

	// Combine header and raw audio data
	return Buffer.concat([header, rawBytes]);
};

module.exports = createWaveFile;