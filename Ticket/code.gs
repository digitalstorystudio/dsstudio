// Code.gs (Google Apps Script Backend)

const SHEET_ID = "1YIcKR2GAShQ0k-nnWl9yWpQ97x-8jkSHjW1n7c4XiWs"; // ⚠️ अपनी Google Sheet ID यहाँ डालें
const sheet = SpreadsheetApp.openById(SHEET_ID);
const ticketsSheet = sheet.getSheetByName("Tickets");
const usersSheet = sheet.getSheetByName("Users");

function doGet(e) {
  const id = e.parameter.id;
  if (!id) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Ticket ID is required." })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    const data = ticketsSheet.getDataRange().getValues();
    const headers = data.shift();
    const idCol = headers.indexOf("TicketID");
    const verifiedCol = headers.indexOf("Verified");
    const verifiedAtCol = headers.indexOf("VerifiedAt");
    const nameCol = headers.indexOf("Name");
    const typeCol = headers.indexOf("TicketType");

    for (let i = 0; i < data.length; i++) {
      if (data[i][idCol] == id) {
        if (data[i][verifiedCol] === true || data[i][verifiedCol] === "TRUE") {
          return ContentService.createTextOutput(JSON.stringify({
            status: "already_verified",
            message: "This ticket has already been verified.",
            data: { name: data[i][nameCol], type: data[i][typeCol] }
          })).setMimeType(ContentService.MimeType.JSON);
        }

        ticketsSheet.getRange(i + 2, verifiedCol + 1).setValue(true);
        ticketsSheet.getRange(i + 2, verifiedAtCol + 1).setValue(new Date());

        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          message: "Ticket verified successfully.",
          data: { name: data[i][nameCol], type: data[i][typeCol] }
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "not_found",
      message: "Ticket ID not found."
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'createTicket') {
      ticketsSheet.appendRow([
        data.ticketId,
        data.name,
        data.age,
        data.phone,
        data.ticketType,
        new Date(),
        false, // Verified status
        "" // VerifiedAt
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Ticket created successfully." })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'login') {
      const usersData = usersSheet.getDataRange().getValues();
      const headers = usersData.shift();
      const usernameCol = headers.indexOf("Username");
      const passwordCol = headers.indexOf("Password");
      const roleCol = headers.indexOf("Role");

      for (let i = 0; i < usersData.length; i++) {
        if (usersData[i][usernameCol] === data.username && usersData[i][passwordCol] === data.password) {
          return ContentService.createTextOutput(JSON.stringify({
            status: "success",
            role: usersData[i][roleCol]
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Invalid username or password." })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Invalid action." })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Post request failed: " + error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}