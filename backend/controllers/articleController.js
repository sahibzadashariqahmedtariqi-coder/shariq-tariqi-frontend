import Article from '../models/Article.js';

// @desc    Get all articles
// @route   GET /api/articles
// @access  Public
export const getAllArticles = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;

    let query = { isPublished: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const articles = await Article.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-comments');

    const total = await Article.countDocuments(query);

    res.status(200).json({
      success: true,
      count: articles.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: articles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured articles
// @route   GET /api/articles/featured
// @access  Public
export const getFeaturedArticles = async (req, res, next) => {
  try {
    const articles = await Article.find({ isFeatured: true, isPublished: true })
      .sort({ publishedAt: -1 })
      .limit(6)
      .select('-comments -content');

    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get article by ID
// @route   GET /api/articles/:id
// @access  Public
export const getArticleById = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Increment views
    article.views += 1;
    await article.save();

    // Only return approved comments
    article.comments = article.comments.filter(comment => comment.isApproved);

    res.status(200).json({
      success: true,
      data: article
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new article
// @route   POST /api/articles
// @access  Private/Admin
export const createArticle = async (req, res, next) => {
  try {
    const article = await Article.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: article
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private/Admin
export const updateArticle = async (req, res, next) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Article updated successfully',
      data: article
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private/Admin
export const deleteArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    await article.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to article
// @route   POST /api/articles/:id/comment
// @access  Public
export const addComment = async (req, res, next) => {
  try {
    const { name, email, comment } = req.body;

    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const newComment = {
      name,
      email,
      comment,
      isApproved: false
    };

    article.comments.push(newComment);
    await article.save();

    res.status(201).json({
      success: true,
      message: 'Comment submitted successfully. It will be visible after approval.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve comment
// @route   PUT /api/articles/:id/comment/:commentId/approve
// @access  Private/Admin
export const approveComment = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const comment = article.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    comment.isApproved = true;
    await article.save();

    res.status(200).json({
      success: true,
      message: 'Comment approved successfully'
    });
  } catch (error) {
    next(error);
  }
};
