import moment from "moment-timezone";

// Convert local time to UTC (Ensures consistency)
export const convertToUtc = (timeString: string, userTimezoneOffset: number): string => {
    console.log(`Converting local time ${timeString} with offset ${userTimezoneOffset}`);
    
    // Parse hours and minutes
    const [hours, minutes] = timeString.split(":").map(Number);
    
    // Calculate total minutes
    let totalMinutes = hours * 60 + minutes;
    
    // Adjust for timezone offset - subtract because getTimezoneOffset returns 
    // minutes west of UTC (positive means behind UTC)
    totalMinutes = totalMinutes + userTimezoneOffset;
    
    // Handle day crossing
    if (totalMinutes < 0) {
        totalMinutes += 24 * 60;
    }
    if (totalMinutes >= 24 * 60) {
        totalMinutes -= 24 * 60;
    }
    
    // Convert back to hours and minutes
    const utcHours = Math.floor(totalMinutes / 60);
    const utcMinutes = totalMinutes % 60;
    
    // Format as HH:mm
    const utcTime = `${utcHours.toString().padStart(2, '0')}:${utcMinutes.toString().padStart(2, '0')}`;
    
    console.log(`Converted: ${timeString} → ${utcTime} (UTC)`);
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