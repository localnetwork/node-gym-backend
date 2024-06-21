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
  removeSensitiveData: (user) => {
    if (user && typeof user === 'object') {
        const { email, password, ...rest } = user;
        return rest;
    }
    return user;
  }
};

module.exports = util;
