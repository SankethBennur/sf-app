function generate_OTP(number_of_digits)
{
	return Math.floor(
		10 ** (number_of_digits - 1)
		+ Math.random() * 9 * (10 ** (number_of_digits - 1))
	);

}

function get_file_name_and_extension(fname)
{
	const arr_ = fname.split(".");

	const extension_ = arr_.pop();
	const filename_ = arr_.slice(0, arr_.length).join("");

	return ({
		filename: filename_,
		extension: extension_,
	});
}

function get_field_values_list(record_arr, field)
{
	const result = [];

	if (!record_arr.length || record_arr.length <= 0 || !record_arr[0][field])
		return result;

	record_arr.forEach(element =>
	{
		result.push(element[field]);
	});

	return result;
}

module.exports = {
	generate_OTP,
	get_field_values_list,
	get_file_name_and_extension,
};
