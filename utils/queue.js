const Agenda = require('agenda');
const { sendEmail } = require('./email');
const Subscriber = require('../models/Subscriber');
const Setting = require('../models/Setting');

const agenda = new Agenda({
  db: { address: process.env.MONGODB_URI, collection: 'agendaJobs' },
  processEvery: '30 seconds'
});

// Definitions
agenda.define('notify-maintenance-ended', async (job) => {
  try {
    const settings = await Setting.getSettings();
    const siteName = settings.siteName || 'VFXVault Education';
    
    // Fetch all subscribers not yet notified
    const subscribers = await Subscriber.find({ isNotified: false });
    
    if (subscribers.length === 0) return;

    console.log(`[Queue] Starting notification for ${subscribers.length} subscribers...`);

    for (const sub of subscribers) {
      await sendEmail({
        to: sub.email,
        subject: `🚀 We're Back! ${siteName} is Live`,
        html: `
          <div style="font-family: 'Inter', Arial, sans-serif; padding: 40px; background: #f9f9f9;">
            <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              <h1 style="color: #1a1a2e; margin-bottom: 20px;">Maintenance is Over! 🎉</h1>
              <p style="color: #555; line-height: 1.6; font-size: 16px;">
                Good news! <strong>${siteName}</strong> is back online and ready for you to continue your learning journey.
              </p>
              <p style="color: #555; line-height: 1.6; font-size: 16px;">
                Thank you for your patience while we were making improvements.
              </p>
              <div style="margin-top: 30px;">
                <a href="${process.env.CLIENT_URL}" style="background: #FFD700; color: #1a1a2e; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; display: inline-block;">
                  Visit Site Now
                </a>
              </div>
            </div>
          </div>
        `
      });
      
      sub.isNotified = true;
      await sub.save();
    }

    console.log(`[Queue] Notification complete.`);
  } catch (error) {
    console.error('[Queue Error] Maintenance notification failed:', error.message);
  }
});

module.exports = agenda;
