const multer = require("multer");

const { get_file_name_and_extension } = require("../lib/lib.generator");

const {
	validate_file_extension_for_upload_type,
	get_file_type_directory
} = require("../lib/lib.validation");

const fs = require("fs");

// disk storage configuration
const storage = multer.diskStorage({
	destination: (request, filename, callback) =>
	{
		const file_name_ = get_file_name_and_extension(filename.originalname);

		// Validate if file name is correct
		if (
			!(
				file_name_ &&
				file_name_.extension &&
				file_name_.extension.toLowerCase()
			)
		)
		{
			callback(new Error("Invalid file name. Extension missing."));
			return;
		}

		// Validate if file type is valid for upload type and 
		if (
			!validate_file_extension_for_upload_type(
				file_name_.extension.toLowerCase(),
				filename.fieldname
			)
		)
		{
			callback(new Error("File extension is wrong."));
			return;
		}

		const directory_ = get_file_type_directory(
			file_name_.extension.toLowerCase(),
			filename.fieldname
		);

		if (!directory_)
		{
			callback(new Error("File type is wrong."));
			return;
		}

		if (!fs.existsSync(directory_))
			fs.mkdirSync(directory_, { recursive: true });

		callback(
			null,
			directory_
		);

	},
	filename: (request, filename, callback) =>
	{
		const file_name_ = get_file_name_and_extension(filename.originalname);

		callback(
			null,
			`${request.query.user_id}-${file_name_.filename}.${file_name_.extension}`
		);
	}
});

// create the multer object to be used
const multer_upload = multer(
	{
		storage: storage,
	}
);

const file_upload_middleware = (file_type, multiple = false) =>
{
	return (request, response, next) =>
	{
		try
		{
			const multer_middleware_ = (!multiple)
				? multer_upload.single(file_type)
				: multer_upload.array(
					file_type,
					10
				);

			multer_middleware_(request, response, (m_err) =>
			{
				// requires passing the same request and response objects
				if (m_err && !(request.file || request.files))
				{
					const error_ = new Error(`Could not upload file type - ${file_type}`);
					error_.status = 500;
					next(error_);
				}

				next();
			});

		}
		catch (error)
		{
			const err_ = new Error(`Could not upload file type - ${file_type}`);
			err_.status = 500;
			next(err_);
		}
	}
}

module.exports = {
	create_multer_object:
		() =>
		{
			return multer({
				storage: storage,
			});
		},
	multer_upload,
	file_upload_middleware,
};
