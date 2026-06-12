const Document = require('../models/Document');
const { uploadFile } = require('../services/s3Service');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const fileUrl = await uploadFile(req.file);

    const documentName = req.body.name || req.file.originalname;
    const document = await Document.create({
      name: documentName,
      url: fileUrl,
      type: req.file.mimetype.split('/')[1] || 'unknown',
      uploadedBy: req.user._id,
      employee: req.user.employeeProfile ? req.user.employeeProfile._id : undefined,
      tenant: req.tenant
    });

    // Notify uploader and notify Admin/HR if uploaded by regular employee
    try {
      await createNotification({
        recipient: req.user._id,
        title: 'Document Uploaded',
        message: `Your document "${documentName}" was uploaded successfully.`,
        type: 'Document',
        tenant: req.tenant
      });

      if (req.user.role === 'Employee') {
        const adminsAndHrs = await User.find({ role: { $in: ['Admin', 'HR'] }, tenant: req.tenant });
        for (const adminOrHr of adminsAndHrs) {
          await createNotification({
            recipient: adminOrHr._id,
            title: 'New Document Uploaded',
            message: `${req.user.employeeProfile?.firstName || 'An employee'} uploaded a new document: "${documentName}".`,
            type: 'Document',
            tenant: req.tenant
          });
        }
      }
    } catch (notifErr) {
      console.error('Failed to notify document upload:', notifErr.message);
    }

    res.status(201).json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ tenant: req.tenant })
      .populate('uploadedBy', 'email')
      .populate('employee', 'firstName lastName employeeId');

    res.status(200).json({ success: true, count: documents.length, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, tenant: req.tenant });
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    await document.deleteOne();
    res.status(200).json({ success: true, message: 'Document removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEmployeeDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ employee: req.params.employeeId, tenant: req.tenant })
      .populate('uploadedBy', 'email');
    res.status(200).json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
