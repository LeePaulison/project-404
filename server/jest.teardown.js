module.exports = async () => {
  console.log('Global Teardown: Closing Mongoose Connections');
  const mongoose = require('mongoose');
  await mongoose.connection.close();
};
