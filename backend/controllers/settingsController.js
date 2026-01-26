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

// @desc    Get appointment settings
// @route   GET /api/settings/appointments
// @access  Public
export const getAppointmentSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getInstance();

    // Backfill defaults if the singleton document was created before these fields existed
    const defaults = {
      consultationFee: 2000,
      healingFee: 3000,
      hikmatFee: 2500,
      ruqyahFee: 3500,
      taveezFee: 1500,
      workingHoursStart: '09:00',
      workingHoursEnd: '18:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      appointmentDuration: 60,
      advanceBookingDays: 1,
      appointmentInstructions: 'Please arrive 10 minutes before your scheduled appointment. Bring any relevant medical documents or previous prescriptions.',
    };

    let requiresSave = false;
    Object.entries(defaults).forEach(([key, value]) => {
      if (settings[key] === undefined) {
        settings[key] = value;
        requiresSave = true;
      }
    });

    if (requiresSave) {
      await settings.save();
    }
    
    // Return only appointment-related settings
    res.status(200).json({
      success: true,
      data: {
        consultationFee: settings.consultationFee,
        healingFee: settings.healingFee,
        hikmatFee: settings.hikmatFee,
        ruqyahFee: settings.ruqyahFee,
        taveezFee: settings.taveezFee,
        workingHoursStart: settings.workingHoursStart,
        workingHoursEnd: settings.workingHoursEnd,
        workingDays: settings.workingDays,
        appointmentDuration: settings.appointmentDuration,
        advanceBookingDays: settings.advanceBookingDays,
        instructions: settings.appointmentInstructions,
        phone: settings.phone,
        email: settings.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment settings
// @route   PUT /api/settings/appointments
// @access  Private/Admin
export const updateAppointmentSettings = async (req, res, next) => {
  try {
    const {
      consultationFee,
      healingFee,
      hikmatFee,
      ruqyahFee,
      taveezFee,
      workingHoursStart,
      workingHoursEnd,
      workingDays,
      appointmentDuration,
      advanceBookingDays,
      instructions,
      phone,
      email,
    } = req.body;

    let settings = await Settings.getInstance();

    // Update appointment fields if provided
    if (consultationFee !== undefined) settings.consultationFee = consultationFee;
    if (healingFee !== undefined) settings.healingFee = healingFee;
    if (hikmatFee !== undefined) settings.hikmatFee = hikmatFee;
    if (ruqyahFee !== undefined) settings.ruqyahFee = ruqyahFee;
    if (taveezFee !== undefined) settings.taveezFee = taveezFee;
    if (workingHoursStart !== undefined) settings.workingHoursStart = workingHoursStart;
    if (workingHoursEnd !== undefined) settings.workingHoursEnd = workingHoursEnd;
    if (workingDays !== undefined) settings.workingDays = workingDays;
    if (appointmentDuration !== undefined) settings.appointmentDuration = appointmentDuration;
    if (advanceBookingDays !== undefined) settings.advanceBookingDays = advanceBookingDays;
    if (instructions !== undefined) settings.appointmentInstructions = instructions;
    if (phone !== undefined) settings.phone = phone;
    if (email !== undefined) settings.email = email;

    settings.lastUpdatedBy = req.user._id;
    settings.lastUpdatedAt = Date.now();

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Appointment settings updated successfully',
      data: {
        consultationFee: settings.consultationFee,
        healingFee: settings.healingFee,
        hikmatFee: settings.hikmatFee,
        ruqyahFee: settings.ruqyahFee,
        taveezFee: settings.taveezFee,
        workingHoursStart: settings.workingHoursStart,
        workingHoursEnd: settings.workingHoursEnd,
        workingDays: settings.workingDays,
        appointmentDuration: settings.appointmentDuration,
        advanceBookingDays: settings.advanceBookingDays,
        instructions: settings.appointmentInstructions,
        phone: settings.phone,
        email: settings.email,
      },
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
      // Bank Payment Details
      bankName,
      accountTitle,
      accountNumber,
      ibanNumber,
      bankBranch,
      paymentInstructions,
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
    
    // Update Bank Payment Details if provided
    if (bankName !== undefined) settings.bankName = bankName;
    if (accountTitle !== undefined) settings.accountTitle = accountTitle;
    if (accountNumber !== undefined) settings.accountNumber = accountNumber;
    if (ibanNumber !== undefined) settings.ibanNumber = ibanNumber;
    if (bankBranch !== undefined) settings.bankBranch = bankBranch;
    if (paymentInstructions !== undefined) settings.paymentInstructions = paymentInstructions;

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
