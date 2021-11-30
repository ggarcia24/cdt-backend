const AWS = require("aws-sdk");

const eventConsumer = async (event, context) => {
  console.log(`Do something with the event`);
  console.log(event);
  console.log(context);
};

module.exports = {
  eventConsumer,
};
