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
      // Video Call PKR
      consultationFeeVideoCall: 3000,
      healingFeeVideoCall: 4000,
      hikmatFeeVideoCall: 3500,
      ruqyahFeeVideoCall: 4500,
      taveezFeeVideoCall: 2500,
      // INR Voice Call
      consultationFeeINR: 700,
      healingFeeINR: 1000,
      hikmatFeeINR: 850,
      ruqyahFeeINR: 1200,
      taveezFeeINR: 500,
      // INR Video Call
      consultationFeeVideoCallINR: 1000,
      healingFeeVideoCallINR: 1400,
      hikmatFeeVideoCallINR: 1200,
      ruqyahFeeVideoCallINR: 1600,
      taveezFeeVideoCallINR: 850,
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
        // PKR Voice Call
        consultationFee: settings.consultationFee,
        healingFee: settings.healingFee,
        hikmatFee: settings.hikmatFee,
        ruqyahFee: settings.ruqyahFee,
        taveezFee: settings.taveezFee,
        // PKR Video Call
        consultationFeeVideoCall: settings.consultationFeeVideoCall,
        healingFeeVideoCall: settings.healingFeeVideoCall,
        hikmatFeeVideoCall: settings.hikmatFeeVideoCall,
        ruqyahFeeVideoCall: settings.ruqyahFeeVideoCall,
        taveezFeeVideoCall: settings.taveezFeeVideoCall,
        // INR Voice Call
        consultationFeeINR: settings.consultationFeeINR,
        healingFeeINR: settings.healingFeeINR,
        hikmatFeeINR: settings.hikmatFeeINR,
        ruqyahFeeINR: settings.ruqyahFeeINR,
        taveezFeeINR: settings.taveezFeeINR,
        // INR Video Call
        consultationFeeVideoCallINR: settings.consultationFeeVideoCallINR,
        healingFeeVideoCallINR: settings.healingFeeVideoCallINR,
        hikmatFeeVideoCallINR: settings.hikmatFeeVideoCallINR,
        ruqyahFeeVideoCallINR: settings.ruqyahFeeVideoCallINR,
        taveezFeeVideoCallINR: settings.taveezFeeVideoCallINR,
        // Other
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
      // PKR Voice Call
      consultationFee,
      healingFee,
      hikmatFee,
      ruqyahFee,
      taveezFee,
      // PKR Video Call
      consultationFeeVideoCall,
      healingFeeVideoCall,
      hikmatFeeVideoCall,
      ruqyahFeeVideoCall,
      taveezFeeVideoCall,
      // INR Voice Call
      consultationFeeINR,
      healingFeeINR,
      hikmatFeeINR,
      ruqyahFeeINR,
      taveezFeeINR,
      // INR Video Call
      consultationFeeVideoCallINR,
      healingFeeVideoCallINR,
      hikmatFeeVideoCallINR,
      ruqyahFeeVideoCallINR,
      taveezFeeVideoCallINR,
      // Other
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

    // Update PKR Voice Call fees if provided
    if (consultationFee !== undefined) settings.consultationFee = consultationFee;
    if (healingFee !== undefined) settings.healingFee = healingFee;
    if (hikmatFee !== undefined) settings.hikmatFee = hikmatFee;
    if (ruqyahFee !== undefined) settings.ruqyahFee = ruqyahFee;
    if (taveezFee !== undefined) settings.taveezFee = taveezFee;
    
    // Update PKR Video Call fees if provided
    if (consultationFeeVideoCall !== undefined) settings.consultationFeeVideoCall = consultationFeeVideoCall;
    if (healingFeeVideoCall !== undefined) settings.healingFeeVideoCall = healingFeeVideoCall;
    if (hikmatFeeVideoCall !== undefined) settings.hikmatFeeVideoCall = hikmatFeeVideoCall;
    if (ruqyahFeeVideoCall !== undefined) settings.ruqyahFeeVideoCall = ruqyahFeeVideoCall;
    if (taveezFeeVideoCall !== undefined) settings.taveezFeeVideoCall = taveezFeeVideoCall;
    
    // Update INR Voice Call fees if provided
    if (consultationFeeINR !== undefined) settings.consultationFeeINR = consultationFeeINR;
    if (healingFeeINR !== undefined) settings.healingFeeINR = healingFeeINR;
    if (hikmatFeeINR !== undefined) settings.hikmatFeeINR = hikmatFeeINR;
    if (ruqyahFeeINR !== undefined) settings.ruqyahFeeINR = ruqyahFeeINR;
    if (taveezFeeINR !== undefined) settings.taveezFeeINR = taveezFeeINR;
    
    // Update INR Video Call fees if provided
    if (consultationFeeVideoCallINR !== undefined) settings.consultationFeeVideoCallINR = consultationFeeVideoCallINR;
    if (healingFeeVideoCallINR !== undefined) settings.healingFeeVideoCallINR = healingFeeVideoCallINR;
    if (hikmatFeeVideoCallINR !== undefined) settings.hikmatFeeVideoCallINR = hikmatFeeVideoCallINR;
    if (ruqyahFeeVideoCallINR !== undefined) settings.ruqyahFeeVideoCallINR = ruqyahFeeVideoCallINR;
    if (taveezFeeVideoCallINR !== undefined) settings.taveezFeeVideoCallINR = taveezFeeVideoCallINR;
    
    // Update other settings if provided
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
        // PKR Voice Call
        consultationFee: settings.consultationFee,
        healingFee: settings.healingFee,
        hikmatFee: settings.hikmatFee,
        ruqyahFee: settings.ruqyahFee,
        taveezFee: settings.taveezFee,
        // PKR Video Call
        consultationFeeVideoCall: settings.consultationFeeVideoCall,
        healingFeeVideoCall: settings.healingFeeVideoCall,
        hikmatFeeVideoCall: settings.hikmatFeeVideoCall,
        ruqyahFeeVideoCall: settings.ruqyahFeeVideoCall,
        taveezFeeVideoCall: settings.taveezFeeVideoCall,
        // INR Voice Call
        consultationFeeINR: settings.consultationFeeINR,
        healingFeeINR: settings.healingFeeINR,
        hikmatFeeINR: settings.hikmatFeeINR,
        ruqyahFeeINR: settings.ruqyahFeeINR,
        taveezFeeINR: settings.taveezFeeINR,
        // INR Video Call
        consultationFeeVideoCallINR: settings.consultationFeeVideoCallINR,
        healingFeeVideoCallINR: settings.healingFeeVideoCallINR,
        hikmatFeeVideoCallINR: settings.hikmatFeeVideoCallINR,
        ruqyahFeeVideoCallINR: settings.ruqyahFeeVideoCallINR,
        taveezFeeVideoCallINR: settings.taveezFeeVideoCallINR,
        // Other
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

// @desc    Get about page settings
// @route   GET /api/settings/about
// @access  Public
export const getAboutSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getInstance();

    res.status(200).json({
      success: true,
      data: {
        profileImage: settings.aboutProfileImage,
        introductionText: settings.aboutIntroductionText,
        descriptionText: settings.aboutDescriptionText,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update about page settings
// @route   PUT /api/settings/about
// @access  Private/Admin
export const updateAboutSettings = async (req, res, next) => {
  try {
    const { profileImage, introductionText, descriptionText } = req.body;

    let settings = await Settings.getInstance();

    if (profileImage !== undefined) settings.aboutProfileImage = profileImage;
    if (introductionText !== undefined) settings.aboutIntroductionText = introductionText;
    if (descriptionText !== undefined) settings.aboutDescriptionText = descriptionText;

    settings.lastUpdatedBy = req.user._id;
    settings.lastUpdatedAt = Date.now();

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'About settings updated successfully',
      data: {
        profileImage: settings.aboutProfileImage,
        introductionText: settings.aboutIntroductionText,
        descriptionText: settings.aboutDescriptionText,
      },
    });
  } catch (error) {
    next(error);
  }
};
