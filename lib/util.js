const util = {
  getTimestamp: () => {
    return new Date().getTime();
  },
  priceValidator: (price) => {
    if (isNaN(price)) {
      return false;
    }
    return true;
  } 
};

module.exports = util;
