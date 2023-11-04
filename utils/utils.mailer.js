const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const fs = require("fs");
const cheerio = require("cheerio");

const make_email_html_otp = (file_path, otp) =>
{
	// const html_content = fs.readFileSync("../assets/otp-validation.html", 'utf-8');
	const html_content = fs.readFileSync(file_path, 'utf-8');
	
	const $ = cheerio.load(html_content);
	$("#otp").html(otp);

	return $.html();

}

async function send_email(mail_options)
{
	// Initialize Nodemailer transporter
	const transporter = nodemailer.createTransport({
		service: 'hotmail',
		auth: {
			user: process.env.SENDER_EMAIL,
			pass: process.env.SENDER_EMAIL_PD,
		},
	});

	await transporter.sendMail(mail_options);

}

module.exports = {
	make_email_html_otp,
	send_email,
};
