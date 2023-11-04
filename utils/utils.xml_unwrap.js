const SF_outbound_message_xml_unwrap = (xml_body) =>
{
	if(!(
		xml_body["soapenv:envelope"] && 
		xml_body["soapenv:envelope"]["soapenv:body"][0] && 
		xml_body["soapenv:envelope"]["soapenv:body"][0]["notifications"][0] && 
		xml_body["soapenv:envelope"]["soapenv:body"][0]["notifications"][0]["notification"]
	))	return [];

	return(
		xml_body["soapenv:envelope"]
		["soapenv:body"][0]
		["notifications"][0]
		["notification"]
	);
}

const build_SOAP_response = () =>
{
	return (`
	<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
		<soapenv:Body>
			<notificationsResponse xmlns="http://soap.sforce.com/2005/09/outbound">
				<Ack>true</Ack>
			</notificationsResponse>
		</soapenv:Body>
	</soapenv:Envelope>
	`);
}

module.exports = {
	SF_outbound_message_xml_unwrap,
	build_SOAP_response,
};
