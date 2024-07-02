const util = {
  getTimestamp: () => {
    return new Date().getTime();
  },
  priceValidator: (price) => {
    if (isNaN(price)) {
      return false;
    }
    return true;
  }, 
  validNumber: (number) => {
    // Check if the argument is a number and not NaN
    if (typeof number !== 'number' || isNaN(number)) {
      return false;
    }
    
    // Additional check for finite numbers (not Infinity or -Infinity)
    if (!isFinite(number)) {
      return false;
    }
    
    // If all checks pass, it's a valid number
    return true;
  },
  removeSensitiveData: (user) => {
    if (user && typeof user === 'object') { 
        const { email, password, ...rest } = user;
        return rest;
    }
    return user;
  },
  formattedDateTime: (timestamp) => {
    const date = new Date(parseInt(timestamp));
    
    if (isNaN(date.getTime())) {
        return ''; // Invalid date
    }

    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert hours from 24-hour format to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' should be '12'

    // Pad minutes with leading zeros
    minutes = minutes < 10 ? '0' + minutes : minutes;

    const formattedDate = `${month} ${day}, ${date.getFullYear()} - ${hours}:${minutes}${ampm}`;

    return formattedDate;
  }
};

module.exports = util;
