"use strict";

const fsa = require("fs").promises;
const path = require("path");
const os = require('os');
const UUID = require("pure-uuid");

const FormatException = require("@framework/FormatException.js");
const NotImplementedException = require("@framework/NotImplementedException.js");
const InvalidOperationException = require("@framework/InvalidOperationException.js");
const DbException = require("@framework/DbException.js");
const IoException = require("@framework/IoException.js");
const UnexpectedException = require("@framework/UnexpectedException.js");

const ELoggerLevel = require("@framework/ELoggerLevel.js");
const EResponseType = require("@framework/EResponseType.js");

const Utility = require("@framework/Utility.js");

const Command = require("@framework/Command.js");
const CommandResult = require("@framework/CommandResult.js");

const ECsvFileProcessedState =
{
	Missing: 1,
	Partial: 2,
	Complete: 3,
};

//	r -b full -c /Maintenance/ImportTruefx -- -d /media/host/fxhistory

module.exports = class ImportTruefxCommand extends Command
{
    constructor(data)
    {
        super(data);

		this.pairCache = {};
    }

	static get __manifest()
	{
		const result =
		{
			rest: false,
			cli:
			{
				options:
				[
					{
						names: ["directory", "d"],
						type: "string",
						help: "specify the source directory containing *.csv files downloaded from truefx.com",
					},
				],
				validate:
				{
					args:
					{
						type: "object",
						properties:
						{
							directory: { type: "string" },
						},
						required: ["directory"],
					},
				},
			},
		};
		return result;
	}

    async execute(inboundStream, outboundStream)
    {
		try
		{
			//	_data_getPair
			await db.collection("forex.tickData.pair").createIndex(

				{ name: 1 },
				{ unique: true }
			);

			//	for _data_setForexTickDataItem
			await db.collection("forex.tickData").createIndex(

				{ pid: 1, dt: 1 },
				{ unique: true }
			);
		}
		catch (ex)
		{
			throw new DbException(ex);
		}

		async function processFile(filePath, processedState)
		{
			return new Promise(async (resolve, reject) =>
			{
				let csvData;
				try
				{
					csvData = await fsa.readFile(filePath, { encoding: "ascii" });
				}
				catch (ex)
				{
					return reject(new IoException(ex));
				}

				try
				{
					const lines = csvData.split(/\r?\n/);

					let lastPrintedPercent = -1;

					logger.write(ELoggerLevel.Info, ` [${lines.length}]     `);

					for (let length = lines.length, i = 0; i < length; ++i)
					{
						const line = lines[i].trim();
						if (!line)
						{
							continue;
						}
						const fields = line.split(',');
						if (fields.length != 4)
						{
							return reject(new FormatException(filePath + " L:" + i, "Unexpected count of CSV fields"));
						}

						const isoDateTime = ImportTruefxCommand.csvDateToIsoDateText(fields[1]);
						const dateTime = new Date(isoDateTime);
						const record_pair = await this._data_getPair(fields[0]);
						await this._data_setForexTickDataItem(processedState, record_pair._id, dateTime, Number(fields[2]), Number(fields[3]));

						let progressPercent = Math.round(i * 100 / length);
						if (lastPrintedPercent != progressPercent)
						{
							let progressPercentText = String(progressPercent).padStart(3, ' ') + '%';
							logger.write(ELoggerLevel.Info, "\b\b\b\b" + progressPercentText);
						}

						//	break; //	DEBUG
					}
				}
				catch (ex)
				{
					return reject(new UnexpectedException(ex));
				}

				return resolve();
			});
		}

		//////////////////////////////////////////////////////////////////////
		log("Enumerating files...");
		let fileList;
		try
		{
			fileList = await Utility.Fs.getFiles(
			{
				path: this.data.fields.directory,
				patternRegex: /[^\.]?\.csv/gi,
			});
		}
		catch (ex)
		{
			throw new IoException(ex);
		}
		fileList.sort();
		log(`Found ${fileList.length} files.`);
		log("Ready.");

		//////////////////////////////////////////////////////////////////////
		log("Processing files...");
		for (let length = fileList.length, i = 0; i < length; ++i)
		{
			var item = fileList[i];
			logger.write(ELoggerLevel.Info, item + ": ");
			var processedState = await this._data_getCsvFileProcessedState(item);
			switch (processedState)
			{
				case ECsvFileProcessedState.Missing:
					logger.write(ELoggerLevel.Info, "new, processing...");
					await this._data_setCsvFileProcessedState(item, ECsvFileProcessedState.Partial);
					await processFile.bind(this)(item, ECsvFileProcessedState.Missing);
					await this._data_setCsvFileProcessedState(item, ECsvFileProcessedState.Complete);
					break;
				case ECsvFileProcessedState.Partial:
					logger.write(ELoggerLevel.Info, "partial, restarting...");
					await processFile.bind(this)(item, ECsvFileProcessedState.Partial);
					await this._data_setCsvFileProcessedState(item, ECsvFileProcessedState.Complete);
					break;
				case ECsvFileProcessedState.Complete:
					logger.write(ELoggerLevel.Info, "already processed, skipping." + os.EOL);
					continue;
				default:
					throw new NotImplementedException();
			}
			logger.write(ELoggerLevel.Info, "OK" + os.EOL);

			//break; //	DEBUG
		}
		log("Ready.");

		//////////////////////////////////////////////////////////////////////
		log("Done.");
		return new CommandResult();
    }

	async _data_getCsvFileProcessedState(fileName)
	{
		try
		{
			await db.collection("forex.tickData.importedFiles").createIndex(

				{ fileIdentifier: 1 },
				{ unique: true }
			);

			const fileIdentifier = path.basename(fileName, ".csv");
			const record = await db.collection("forex.tickData.importedFiles").findOne({ fileIdentifier });
			if (!record)
			{
				return ECsvFileProcessedState.Missing;
			}
			return record.processedState;
		}
		catch (ex)
		{
			throw new DbException(ex);
		}
	}

	async _data_setCsvFileProcessedState(fileName, processedState)
	{
		try
		{
			const fileIdentifier = path.basename(fileName, ".csv");
			await db.collection("forex.tickData.importedFiles").updateOne(

				{ fileIdentifier },
				{ $set: { processedState } },
				{ upsert: true }
			);
		}
		catch (ex)
		{
			throw new DbException(ex);
		}
	}

	async _data_setForexTickDataItem(processedState, pid, utcDateTime, bid, ask)
	{
		switch (processedState)
		{
			case ECsvFileProcessedState.Missing:
				try
				{
					//	inserting is not appropriate, because of inconsistent records in the source data
					//		- multiple records with the same datetime and different ask and/or bid values
					//		- identical records

					//await db.collection("forex.tickData").insertOne(

					//	{
					//		pid: pid,
					//		dt: utcDateTime.getTime(),
					//		bid,
					//		ask,
					//	},
					//);

					//	upserts will guarantee unique pairs of (pid, dt)
					//	among duplicates, the latest available record from the source data will be available in the database
					await db.collection("forex.tickData").updateOne(

						{
							pid: pid,
							dt: utcDateTime.getTime(),
						},
						{
							$set:
							{
								bid,
								ask,
							}
						},
						{ upsert: true }
					);
				}
				catch (ex)
				{
					logger.error(90010, ex);
				}
				break;
			case ECsvFileProcessedState.Partial:
				try
				{
					await db.collection("forex.tickData").updateOne(

						{
							pid: pid,
							dt: utcDateTime.getTime(),
						},
						{
							$set:
							{
								bid,
								ask,
							}
						},
						{ upsert: true }
					);
				}
				catch (ex)
				{
					logger.error(90011, ex);
				}
				break;
			case ECsvFileProcessedState.Complete:
				throw new InvalidOperationException();
			default:
				throw new NotImplementedException();
		}
	}

	async _data_getPair(name)
	{
		try
		{
			let result = this.pairCache[name];
			if (!result)
			{
				result = (await db.collection("forex.tickData.pair").findOneAndUpdate(

					{ name },
					{ $setOnInsert: { name } },
					{
						returnOriginal: false,
						upsert: true,
					}
				)).value;
				this.pairCache[name] = result;
			}
			return result;
		}
		catch (ex)
		{
			throw new DbException(ex);
		}
	}

	static csvDateToIsoDateText(csvDateText)
	{
		if (csvDateText.length != 21)
		{
			throw new FormatException("CSV Date time", "Must be long exactly 21 bytes: " + csvDateText);
		}

		var yearText = csvDateText.substr(0, 4);
		var monthText = csvDateText.substr(4, 2);
		var dayText = csvDateText.substr(6, 2);
		var timeText = csvDateText.substr(9, 12);

		var result =
			yearText + "-" +
			monthText + "-" +
			dayText + "T" +
			timeText + "Z";

		return result;
	}
}
