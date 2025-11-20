import Settings from '../models/Settings.js';

// @desc    Get settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getInstance();
    
    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res, next) => {
  try {
    const {
      email,
      phone,
      whatsappLink,
      clinicName,
      clinicSubtitle,
      timings,
      address,
      facebookUrl,
      youtubeUrl,
      instagramUrl,
      tiktokUrl,
      whatsappChannelUrl,
      footerDescription,
    } = req.body;

    // Get the singleton settings document
    let settings = await Settings.getInstance();

    // Update fields if provided
    if (email !== undefined) settings.email = email;
    if (phone !== undefined) settings.phone = phone;
    if (whatsappLink !== undefined) settings.whatsappLink = whatsappLink;
    if (clinicName !== undefined) settings.clinicName = clinicName;
    if (clinicSubtitle !== undefined) settings.clinicSubtitle = clinicSubtitle;
    if (timings !== undefined) settings.timings = timings;
    if (address !== undefined) settings.address = address;
    if (facebookUrl !== undefined) settings.facebookUrl = facebookUrl;
    if (youtubeUrl !== undefined) settings.youtubeUrl = youtubeUrl;
    if (instagramUrl !== undefined) settings.instagramUrl = instagramUrl;
    if (tiktokUrl !== undefined) settings.tiktokUrl = tiktokUrl;
    if (whatsappChannelUrl !== undefined) settings.whatsappChannelUrl = whatsappChannelUrl;
    if (footerDescription !== undefined) settings.footerDescription = footerDescription;

    // Track who updated
    settings.lastUpdatedBy = req.user._id;
    settings.lastUpdatedAt = Date.now();

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};
