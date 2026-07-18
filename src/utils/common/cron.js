const cron = require("node-cron");
const Service = require("../../services/index");

function scheduleCron() {
  cron.schedule('*/1 * * * *', async () => {
    await Service.BookingService.cancelOldBookings();
  });
}

module.exports = {
  scheduleCron
};