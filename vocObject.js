const fs = require('fs');

const CODEC = {
	CODEC_8BIT: 0,
	CODEC_4BIT_TO_8BIT_ADPCM: 1,
	CODEC_3BIT_TO_8BIT_ADPCM: 2,
	CODEC_2BIT_TO_8BIT_ADPCM: 3,
	CODEC_16BIT_PCM: 4,
	CODEC_ALAW: 5,
	CODEC_ULAW: 6,
	CODEC_4BIT_TO_16BIT_ADPCM: 7
};

class CreativeVoiceFile
{
	Blocks = [];

	constructor(filePath)
	{
		this.readCreativeVoiceFile(filePath);
	}

	readCreativeVoiceFile(filePath)
	{
		const buffer = fs.readFileSync(filePath);
		let offset = 0;

		function readString(length)
		{
			const str = buffer.toString('ascii', offset, offset + length);
			offset += length;
			return str;
		}

		function readUInt8()
		{
			const value = buffer.readUInt8(offset);
			offset += 1;
			return value;
		}

		function readUInt16LE()
		{
			const value = buffer.readUInt16LE(offset);
			offset += 2;
			return value;
		}

		function readInt16LE()
		{
			const value = buffer.readInt16LE(offset);
			offset += 2;
			return value;
		}

		function readUInt24LE()
		{
			const value = buffer.readUInt8(offset) +
						(buffer.readUInt8(offset + 1) << 8) +
						(buffer.readUInt8(offset + 2) << 16);
			offset += 3;
			return value;
		}

		this.Blocks = [];
		while (offset < buffer.length)
		{
			// Read header

			const signature = readString(19);
			if (signature !== "Creative Voice File")
			{
				throw new Error("File is not a Creative Voice File");
			}

			const eof = readUInt8();
			const startingByte = readUInt16LE();
			const version = readInt16LE();
			const validation = readInt16LE();

			if (validation !== (~version + 4660) & 0xFFFF)
			{
				throw new Error("File is not a Creative Voice File");
			}

			// Skip to the starting byte
			offset += (startingByte-26);

			while (true)
			{
				//Check we're not past the end of the buffer
				const type = readUInt8();

				if (type === 0x00) break;

				const length = readUInt24LE();

				switch (type)
				{
					case 0x01: // Sound block
						const samplingRate = Math.floor(1000000 / (256 - readUInt8()));
						const codecRaw = readUInt8();
						const data = buffer.slice(offset, offset + length - 2);
						offset += length - 2;

						this.Blocks.push({
							type: 'sound',
							samplingRate,
							codec: CODEC[Object.keys(CODEC)[codecRaw]],
							data
						});
						break;

					default:
						throw new Error(`Type ${type} not implemented`);
				}
			}
		}
	}
}
module.exports = CreativeVoiceFile;