const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', authorize('Admin', 'HR'), createJob);
router.put('/:id', authorize('Admin', 'HR'), updateJob);
router.delete('/:id', authorize('Admin', 'HR'), deleteJob);

module.exports = router;
