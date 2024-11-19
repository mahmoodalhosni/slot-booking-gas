// Compiled using undefined undefined (TypeScript 4.9.5)
function doGet() {
    var template = HtmlService.createTemplateFromFile("page");
    var ss = SpreadsheetApp.getActive();
    var calendar_config_sheet = ss.getSheetByName(SHEET_NAMES.CALENDAR_CONFIG);
    template.enabledDays = getEnabledDays(calendar_config_sheet);
    return template
        .evaluate()
        .setSandboxMode(HtmlService.SandboxMode.IFRAME)
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag("viewport", "width=device-width, initial-scale=1");
}
function bookSlot(_a) {
    var date = _a.date, startTime = _a.startTime, endTime = _a.endTime, title = _a.title;
    if (!date)
        return JSON.stringify({ error: true, message: "missing date." });
    if (!startTime)
        return JSON.stringify({ error: true, message: "missing slot." });
    if (!endTime)
        return JSON.stringify({ error: true, message: "missing slot." });
    if (!title)
        return JSON.stringify({ error: true, message: "missing title." });
    var selectedDate = new Date(date);
    var st = new Date(date);
    var et = new Date(date);
    var tempStart = new Date(startTime);
    var tempEnd = new Date(endTime);
    st.setHours(tempStart.getHours());
    st.setMinutes(tempStart.getMinutes());
    st.setSeconds(tempStart.getSeconds());
    et.setHours(tempEnd.getHours());
    et.setMinutes(tempEnd.getMinutes());
    et.setSeconds(tempEnd.getSeconds());
    var ss = SpreadsheetApp.getActive();
    var calendar_config_sheet = ss.getSheetByName(SHEET_NAMES.CALENDAR_CONFIG);
    var enabledDays = getEnabledDays(calendar_config_sheet);
    var day = selectedDate.getDay();
    if (enabledDays.indexOf(day) == -1)
        return JSON.stringify({
            error: true,
            message: "time slot not available, please try again.",
            retry: true
        });
    var calendarId = calendar_config_sheet.getRange("A2").getValue();
    var calendar = CalendarApp.getCalendarById(calendarId);
    var events = calendar.getEvents(st, et);
    if (events.length)
        return JSON.stringify({
            error: true,
            message: "time slot not available, please try again.",
            retry: true
        });
    calendar.createEvent(title, st, et);
    return JSON.stringify({
        success: true,
        message: "slot booked successfully."
    });
}
function getEnabledDays(calendar_config_sheet) {
    var calData = calendar_config_sheet
        .getRange(1, 1, calendar_config_sheet.getLastRow(), calendar_config_sheet.getLastColumn())
        .getValues();
    var enabledDays = [];
    var dayNumber = -1;
    for (var i = 0; i < 14; i += 2) {
        var result = calData[4][i];
        dayNumber++;
        if (result != "on")
            continue;
        enabledDays.push(dayNumber);
    }
    return enabledDays;
}
function getAvailableTimeslots(_a) {
    var date = _a.date;
    var selectedDate = new Date(date);
    var ss = SpreadsheetApp.getActive();
    var calendar_config_sheet = ss.getSheetByName(SHEET_NAMES.CALENDAR_CONFIG);
    var calData = calendar_config_sheet
        .getRange(1, 1, calendar_config_sheet.getLastRow(), calendar_config_sheet.getLastColumn())
        .getValues();
    var calendarId = calData[1][0];
    var slots = [];
    var possibleSlots = getPossibleTimeslots(selectedDate.getDay(), calData);
    if (!possibleSlots.length)
        return JSON.stringify({ slots: slots });
    var calendar = CalendarApp.getCalendarById(calendarId);
    slots = getAvailableSlots(possibleSlots, calendar, date);
    return JSON.stringify({ slots: slots });
}
function getAvailableSlots(possibleSlots, calendar, date) {
    var slots = [];
    for (var i = 0; i < possibleSlots.length; i++) {
        var _a = possibleSlots[i], startTime = _a.startTime, endTime = _a.endTime;
        var st = new Date(date);
        var et = new Date(date);
        var tempStart = new Date(startTime);
        var tempEnd = new Date(endTime);
        st.setHours(tempStart.getHours());
        st.setMinutes(tempStart.getMinutes());
        st.setSeconds(tempStart.getSeconds());
        et.setHours(tempEnd.getHours());
        et.setMinutes(tempEnd.getMinutes());
        et.setSeconds(tempEnd.getSeconds());
        var events = calendar.getEvents(st, et);
        if (events.length)
            continue;
        slots.push(possibleSlots[i]);
    }
    return slots;
}
function getPossibleTimeslots(day, calData) {
    var indx = day == 0 ? 0 : day * 2;
    var slots = [];
    if (calData[4][indx] != "on")
        return slots;
    for (var i = 6; i < calData.length; i++) {
        var startTime = calData[i][indx];
        var endTime = calData[i][indx + 1];
        if (!startTime || !endTime)
            continue;
        var st = new Date(startTime);
        var et = new Date(endTime);
        if (et <= st)
            continue;
        slots.push({ startTime: st, endTime: et });
    }
    return slots;
}
