import moment from "moment-timezone";

// Convert local time to UTC (Ensures consistency)
export const convertToUtc = (timeString: string, userTimezoneOffset: number): string => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const now = new Date();
    now.setHours(hours, minutes, 0, 0);

    // Convert to UTC
    const utcTime = moment(now).utc().format("HH:mm");
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