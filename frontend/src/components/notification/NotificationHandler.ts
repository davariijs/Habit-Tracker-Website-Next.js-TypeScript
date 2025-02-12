function showNotification(title: string, body: string) {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, { body });
        }
      });
    }
  }
  
  // Example usage (you'd call this based on your habit's reminderTime)
  // showNotification("Habit Reminder", "Time to do your habit!");
  
  export {showNotification};