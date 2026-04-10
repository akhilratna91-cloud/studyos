const { Router } = require('express');
const {
  createNote,
  getNotes,
  getSingleNote,
  updateNote,
  deleteNote,
} = require('./notes.controller');
const { protect } = require('../../middleware/auth');

const router = Router();

// Protect all notes routes
router.use(protect);

router.route('/')
  .post(createNote)
  .get(getNotes);

router.route('/:id')
  .get(getSingleNote)
  .patch(updateNote)
  .delete(deleteNote);

module.exports = router;
