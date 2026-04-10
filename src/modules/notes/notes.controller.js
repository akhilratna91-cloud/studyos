const Note = require('./notes.model');

// @desc    Create a new note
// @route   POST /api/v1/notes
// @access  Private
exports.createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    
    if (!title) {
      return res.status(400).json({ success: false, message: 'Please provide a title for the note' });
    }

    const note = await Note.create({
      userId: req.user.id,
      title,
      content,
    });

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all notes for logged-in user
// @route   GET /api/v1/notes
// @access  Private
exports.getNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Notes retrieved successfully',
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single note by ID
// @route   GET /api/v1/notes/:id
// @access  Private
exports.getSingleNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Note retrieved successfully',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a note
// @route   PATCH /api/v1/notes/:id
// @access  Private
exports.updateNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a note
// @route   DELETE /api/v1/notes/:id
// @access  Private
exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
