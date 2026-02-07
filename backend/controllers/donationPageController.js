import asyncHandler from 'express-async-handler';
import DonationPage from '../models/DonationPage.js';

const slugify = (value = '') => value
  .toString()
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)+/g, '');

// @desc    Get published donation pages
// @route   GET /api/donation-pages
// @access  Public
export const getPublishedDonationPages = asyncHandler(async (req, res) => {
  const pages = await DonationPage.find({ isPublished: true })
    .sort({ order: 1, createdAt: -1 });

  res.json({
    success: true,
    data: pages
  });
});

// @desc    Get all donation pages (admin)
// @route   GET /api/donation-pages/admin/all
// @access  Private/Admin
export const getAllDonationPages = asyncHandler(async (req, res) => {
  const pages = await DonationPage.find()
    .sort({ order: 1, createdAt: -1 });

  res.json({
    success: true,
    data: pages
  });
});

// @desc    Get donation page by slug
// @route   GET /api/donation-pages/slug/:slug
// @access  Public
export const getDonationPageBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const page = await DonationPage.findOne({ slug, isPublished: true });
  if (!page) {
    res.status(404);
    throw new Error('Donation page not found');
  }

  res.json({
    success: true,
    data: page
  });
});

// @desc    Create donation page
// @route   POST /api/donation-pages
// @access  Private/Admin
export const createDonationPage = asyncHandler(async (req, res) => {
  const {
    title,
    slug,
    shortDescription,
    description,
    coverImage,
    galleryImages,
    youtubeShortsUrl,
    isPublished,
    order
  } = req.body;

  const finalSlug = slugify(slug || title);
  if (!finalSlug) {
    res.status(400);
    throw new Error('Slug or title is required');
  }

  const existing = await DonationPage.findOne({ slug: finalSlug });
  if (existing) {
    res.status(400);
    throw new Error('Slug already exists');
  }

  const page = await DonationPage.create({
    title,
    slug: finalSlug,
    shortDescription,
    description,
    coverImage,
    galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
    youtubeShortsUrl,
    isPublished: isPublished !== undefined ? isPublished : true,
    order: order || 0
  });

  res.status(201).json({
    success: true,
    data: page
  });
});

// @desc    Update donation page
// @route   PUT /api/donation-pages/:id
// @access  Private/Admin
export const updateDonationPage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updates = { ...req.body };
  if (updates.slug) {
    updates.slug = slugify(updates.slug);
  }

  const page = await DonationPage.findById(id);
  if (!page) {
    res.status(404);
    throw new Error('Donation page not found');
  }

  if (updates.slug && updates.slug !== page.slug) {
    const existing = await DonationPage.findOne({ slug: updates.slug });
    if (existing) {
      res.status(400);
      throw new Error('Slug already exists');
    }
  }

  const updatedPage = await DonationPage.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true
  });

  res.json({
    success: true,
    data: updatedPage
  });
});

// @desc    Delete donation page
// @route   DELETE /api/donation-pages/:id
// @access  Private/Admin
export const deleteDonationPage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const page = await DonationPage.findById(id);
  if (!page) {
    res.status(404);
    throw new Error('Donation page not found');
  }

  await DonationPage.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Donation page deleted successfully'
  });
});
