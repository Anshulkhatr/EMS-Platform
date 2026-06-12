const Job = require('../models/Job');
const { notifyAllUsers } = require('../services/emailService');

const buildJobEmailHtml = (job, eventLabel) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
    <h2 style="color:#4f46e5;margin:0 0 8px;">${eventLabel}: ${job.title}</h2>
    <p style="color:#64748b;margin:0 0 16px;">
      ${job.department || 'General'} · ${job.location} · ${job.employmentType} · ${job.status}
    </p>
    <div style="color:#334155;line-height:1.6;margin-bottom:16px;">${job.description.replace(/\n/g, '<br/>')}</div>
    ${
      job.requirements
        ? `<p style="color:#475569;"><strong>Requirements:</strong><br/>${job.requirements.replace(/\n/g, '<br/>')}</p>`
        : ''
    }
    ${job.salary ? `<p style="color:#475569;"><strong>Compensation:</strong> ${job.salary}</p>` : ''}
    <hr style="margin:24px 0;border:none;border-top:1px solid #e2e8f0;" />
    <p style="color:#94a3b8;font-size:12px;">You received this because you are registered on EMS Platform.</p>
  </div>
`;

const notifyJobUpdate = async (job, eventLabel) => {
  const title = eventLabel === 'New Job Posted' ? 'New Job Opening' : 'Job Updated';
  const message = `${eventLabel}: ${job.title} (${job.status})`;

  notifyAllUsers({
    tenant: job.tenant,
    title,
    message,
    type: 'Job',
    emailSubject: `[EMS] ${title} — ${job.title}`,
    emailMessage: `${message}\n\n${job.description}`,
    emailHtml: buildJobEmailHtml(job, eventLabel),
  }).catch((err) => console.error('[jobController] Notification error:', err.message));
};

exports.getJobs = async (req, res) => {
  try {
    const query = { tenant: req.tenant };
    if (req.query.status) query.status = req.query.status;

    const jobs = await Job.find(query)
      .populate('postedBy', 'email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, tenant: req.tenant }).populate(
      'postedBy',
      'email role'
    );

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createJob = async (req, res) => {
  try {
    const { title, description, department, location, employmentType, status, salary, requirements } =
      req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const job = await Job.create({
      title,
      description,
      department,
      location,
      employmentType,
      status: status || 'Open',
      salary,
      requirements,
      postedBy: req.user._id,
      tenant: req.tenant,
    });

    if (job.status !== 'Draft') {
      notifyJobUpdate(job, 'New Job Posted');
    }

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, tenant: req.tenant },
      req.body,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.status !== 'Draft') {
      notifyJobUpdate(job, 'Job Updated');
    }

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, tenant: req.tenant });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.status(200).json({ success: true, message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
