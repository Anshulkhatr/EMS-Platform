const express = require('express');
const router = express.Router();
const { getEmployees, getEmployeeById, createEmployee, updateEmployee, getOrgChart, getDirectory } = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize, authorizeSelfOrRoles } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', authorize('Admin', 'HR', 'Manager', 'Leadership'), getEmployees);
router.post('/', authorize('HR'), createEmployee);
router.get('/org-chart', getOrgChart);
router.get('/directory', getDirectory);
router.get('/:id', authorizeSelfOrRoles('id', 'Admin', 'HR', 'Manager', 'Leadership'), getEmployeeById);
router.put('/:id', authorize('HR'), updateEmployee);

module.exports = router;

