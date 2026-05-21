const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  // General
  siteName: { type: String, default: 'VFXVault Education' },
  siteTagline: { type: String, default: 'Master the Art of Digital Creation' },
  contactEmail: { type: String, default: 'support@vfxvault.com' },
  
  // Social Links
  socialTwitter: { type: String, default: '' },
  socialYoutube: { type: String, default: '' },
  socialDiscord: { type: String, default: '' },
  
  // Feature Toggles
  enableRegistration: { type: Boolean, default: true },
  enableComments: { type: Boolean, default: true },
  requireCommentApproval: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false }
}, { timestamps: true });

// Ensure only one settings document exists
settingSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Setting', settingSchema);
