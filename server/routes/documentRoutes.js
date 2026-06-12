const express = require('express');
const router = express.Router();
const { uploadDocument, getDocuments, deleteDocument, getEmployeeDocuments } = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize, authorizeSelfOrRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.delete('/:id', deleteDocument);
router.get('/employee/:employeeId', authorizeSelfOrRoles('employeeId', 'Admin', 'HR', 'Manager', 'Leadership'), getEmployeeDocuments);

module.exports = router;

