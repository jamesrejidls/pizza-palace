const cron = require('node-cron');
const Inventory = require('../models/Inventory');
const { sendEmail, emailTemplates } = require('../utils/email');

// Run every day at 8 AM
const scheduleStockCheck = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('🕗 Running daily stock check...');
    try {
      const lowStockItems = await Inventory.find({
        $expr: { $lte: ['$stock', '$threshold'] }
      });

      if (lowStockItems.length > 0) {
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: '⚠️ Daily Stock Alert - Pizza Palace',
          html: emailTemplates.stockAlert(lowStockItems)
        });
        console.log(`📧 Stock alert sent for ${lowStockItems.length} items`);
      } else {
        console.log('✅ All stock levels are healthy');
      }
    } catch (error) {
      console.error('❌ Stock check error:', error.message);
    }
  });

  console.log('🕐 Stock monitoring cron job scheduled (daily at 8 AM)');
};

module.exports = scheduleStockCheck;
