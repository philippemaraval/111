function doPost(event) {
  try {
    const payload = JSON.parse(event.postData.contents);
    const expectedToken = PropertiesService.getScriptProperties().getProperty("EMAIL_AUTOMATION_TOKEN");
    const allowedTypes = ["contact_notification", "stock_back", "review_request"];
    if (!expectedToken || payload.token !== expectedToken || !allowedTypes.includes(payload.type)) {
      return jsonResponse({ success: false, error: "unauthorized" });
    }
    MailApp.sendEmail({
      to: payload.to,
      subject: payload.subject,
      body: payload.text,
      name: "111 Marseille",
      replyTo: payload.replyTo || "111wear.sunmedia@gmail.com"
    });
    return jsonResponse({ success: true, id: payload.id });
  } catch (error) {
    return jsonResponse({ success: false, error: String(error) });
  }
}

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
