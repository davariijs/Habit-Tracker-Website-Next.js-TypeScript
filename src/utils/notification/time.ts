import moment from "moment-timezone";

// Convert local time to UTC (Ensures consistency)
export const convertToUtc = (timeString: string, userTimezoneOffset: number): string => {
    console.log(`Converting time: ${timeString} with offset: ${userTimezoneOffset}`);
    
    // Parse the time string
    const [hours, minutes] = timeString.split(":").map(Number);
    
    // Create a date object with the time
    const localTime = new Date();
    localTime.setHours(hours, minutes, 0, 0);
    console.log(`Local time object: ${localTime.toString()}`);
    
    // Apply the user's timezone offset
    const userTimeMs = localTime.getTime() - (userTimezoneOffset * 60000);
    const utcTime = moment(userTimeMs).utc().format("HH:mm");
    
    console.log(`Result UTC time: ${utcTime}`);
    return utcTime;
};

// Get current UTC time in "HH:mm" format
export const getCurrentUtcTime = (): string => {
    return moment().utc().format("HH:mm");
};

// Ensure time format is "HH:mm"
export const formatTime = (time: string): string => {
    return moment(time, "H:mm").format("HH:mm"); // Converts "13:3" → "13:03"
};