const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const Job = require('../models/Job');
const aiService = require('../services/aiService');

// 1. Smart Employee Search (Natural Language Directory Queries)
exports.searchEmployees = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide a search query' });
    }

    const employees = await Employee.find({ tenant: req.tenant })
      .populate('department')
      .lean();

    const employeeDataContext = employees.map(emp => ({
      _id: emp._id,
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      lastName: emp.lastName,
      designation: emp.designation,
      department: emp.department ? emp.department.name : 'Unassigned',
      status: emp.status,
      phone: emp.phone || 'N/A'
    }));

    const systemPrompt = `You are an AI directory search assistant for EMS Platform. You will receive a natural-language search query and a list of employee profiles in JSON.
Your job is to parse the search query (understanding synonyms, departments, roles, names, designations) and filter the employees that match the user's intent.
You MUST return ONLY a JSON object formatted exactly as:
{
  "matches": [
    {
      "_id": "mongoose_id",
      "employeeId": "EMP_ID",
      "name": "First Last",
      "designation": "Designation",
      "department": "Department",
      "phone": "Phone"
    }
  ],
  "explanation": "Brief explanation of how the results match the search query.",
  "confidenceScore": 95,
  "requiresHumanApproval": false
}`;

    const userPrompt = `Search Query: "${query}"\n\nEmployee Directory Context:\n${JSON.stringify(employeeDataContext, null, 2)}`;

    const result = await aiService.getAiResponse(systemPrompt, userPrompt, true);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. AI-Generated Employee Summary
exports.generateEmployeeSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findOne({ _id: id, tenant: req.tenant })
      .populate('department')
      .lean();

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const attendance = await Attendance.find({ employee: id, tenant: req.tenant })
      .limit(30)
      .sort({ date: -1 })
      .lean();

    const leaves = await LeaveRequest.find({ employee: id, tenant: req.tenant })
      .limit(10)
      .sort({ createdAt: -1 })
      .lean();

    const context = {
      profile: {
        name: `${employee.firstName} ${employee.lastName}`,
        designation: employee.designation,
        department: employee.department ? employee.department.name : 'Unassigned',
        dateOfJoining: employee.dateOfJoining,
        status: employee.status
      },
      attendanceSummary: attendance.map(a => ({
        date: a.date,
        status: a.status,
        workHours: a.workHours
      })),
      leaveHistory: leaves.map(l => ({
        startDate: l.startDate,
        endDate: l.endDate,
        type: l.leaveType,
        status: l.status,
        reason: l.reason
      }))
    };

    const systemPrompt = `You are an advisory HR analyst for EMS Platform. You will receive an employee's profile details, attendance records (last 30 days), and leave request history. Generate an insightful professional summary about their performance, attendance reliability, and active contributions.
You MUST return ONLY a JSON object formatted exactly as:
{
  "summary": "Markdown formatted summary paragraph.",
  "strengths": ["Strength 1", "Strength 2"],
  "concerns": ["Concern 1" or "None"],
  "confidenceScore": 85,
  "requiresHumanApproval": false
}`;

    const userPrompt = `Employee Context:\n${JSON.stringify(context, null, 2)}`;
    const result = await aiService.getAiResponse(systemPrompt, userPrompt, true);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Workforce Planning Recommendations & Skill-Gap Analysis
exports.getWorkforcePlanning = async (req, res) => {
  try {
    const employees = await Employee.find({ tenant: req.tenant, status: 'Active' })
      .populate('department')
      .lean();

    const headcountContext = employees.map(emp => ({
      name: `${emp.firstName} ${emp.lastName}`,
      designation: emp.designation,
      department: emp.department ? emp.department.name : 'Unassigned'
    }));

    const systemPrompt = `You are an advisory workforce planning consultant for EMS Platform. Analyze the current headcount distribution by department and designations. Identify structural gaps, skill shortfalls, or bottlenecks, and provide actionable recruitment/training recommendations.
You MUST return ONLY a JSON object formatted exactly as:
{
  "recommendations": "Markdown formatted strategic advice on hiring, reorganization, or training.",
  "skillGaps": ["Skill Gap 1 (e.g. Lack of Senior Node.js devs)", "Skill Gap 2"],
  "departmentHealth": [
    {
      "departmentName": "Department Name",
      "healthStatus": "Healthy" or "Understaffed" or "At Risk",
      "explanation": "Short reasoning"
    }
  ],
  "confidenceScore": 80,
  "requiresHumanApproval": true
}`;

    const userPrompt = `Active Employee List Context:\n${JSON.stringify(headcountContext, null, 2)}`;
    const result = await aiService.getAiResponse(systemPrompt, userPrompt, true);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Attrition Prediction & Burnout-Risk Flags
exports.getBurnoutAttrition = async (req, res) => {
  try {
    const employees = await Employee.find({ tenant: req.tenant, status: 'Active' })
      .populate('department')
      .lean();

    // Fetch attendance for the last 30 days to check work hours and leaves
    const attendance = await Attendance.find({ tenant: req.tenant })
      .sort({ date: -1 })
      .lean();

    const leaves = await LeaveRequest.find({ tenant: req.tenant })
      .lean();

    const employeeContexts = employees.map(emp => {
      const empAttendance = attendance.filter(a => a.employee.toString() === emp._id.toString());
      const empLeaves = leaves.filter(l => l.employee.toString() === emp._id.toString());

      const totalWorkHours = empAttendance.reduce((acc, curr) => acc + (curr.workHours || 0), 0);
      const daysWorked = empAttendance.filter(a => a.status === 'Present' || a.status === 'Late' || a.status === 'Half-Day').length;
      const averageDailyHours = daysWorked > 0 ? (totalWorkHours / daysWorked) : 0;
      
      const lateCheckins = empAttendance.filter(a => a.status === 'Late').length;
      const approvedLeaves = empLeaves.filter(l => l.status === 'Approved').length;

      return {
        id: emp._id,
        name: `${emp.firstName} ${emp.lastName}`,
        designation: emp.designation,
        department: emp.department ? emp.department.name : 'Unassigned',
        metrics: {
          averageDailyHours: parseFloat(averageDailyHours.toFixed(1)),
          totalDaysTracked: empAttendance.length,
          lateArrivalsCount: lateCheckins,
          approvedLeavesCount: approvedLeaves
        }
      };
    });

    const systemPrompt = `You are an advisory HR health analyst for EMS Platform. Analyze the provided metrics (average daily work hours, late arrivals, leaves) for each employee to identify potential burnout risk or attrition risk. If average hours exceed 9 hours daily, flag as higher risk. If late check-ins are very high, it might indicate low engagement or burnout.
You MUST return ONLY a JSON object formatted exactly as:
{
  "atRiskEmployees": [
    {
      "employeeId": "mongo_id",
      "name": "Employee Name",
      "designation": "Designation",
      "department": "Department",
      "riskLevel": "High" or "Medium" or "Low",
      "flags": ["Frequent Overtime", "High Late Check-ins"],
      "recommendations": "Suggested actions (e.g. schedule 1-on-1, offer decompression leave)"
    }
  ],
  "burnoutIndex": 25, // organizational percentage
  "confidenceScore": 75,
  "requiresHumanApproval": true
}`;

    const userPrompt = `Employee Performance and Work Metrics Context:\n${JSON.stringify(employeeContexts, null, 2)}`;
    const result = await aiService.getAiResponse(systemPrompt, userPrompt, true);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Attendance Anomaly Detection & Smart Regularization Suggestions
exports.getAttendanceAnomalies = async (req, res) => {
  try {
    const attendance = await Attendance.find({ tenant: req.tenant })
      .populate('employee', 'firstName lastName designation employeeId')
      .limit(100)
      .sort({ date: -1 })
      .lean();

    const anomalyContext = attendance
      .filter(a => {
        // Filter anomalies: Missing punchout, short hours, or late check-ins
        const isAnomaly = (!a.punchOut && a.punchIn) || (a.status === 'Present' && a.workHours < 4) || a.status === 'Late';
        return isAnomaly;
      })
      .map(a => ({
        attendanceId: a._id,
        employeeId: a.employee ? a.employee.employeeId : 'N/A',
        name: a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : 'N/A',
        date: a.date,
        punchIn: a.punchIn,
        punchOut: a.punchOut,
        workHours: a.workHours,
        status: a.status
      }));

    const systemPrompt = `You are an advisory timekeeping auditor for EMS Platform. Review the recent attendance records for anomalous patterns (e.g. extremely short work hours, missing punch-outs, frequent late check-ins) and suggest logical regularization corrections.
You MUST return ONLY a JSON object formatted exactly as:
{
  "anomalies": [
    {
      "employeeId": "EMP_ID",
      "name": "Employee Name",
      "date": "YYYY-MM-DD",
      "anomalyType": "Missing Punch-out" or "Extremely Short Hours" or "Frequent Late",
      "explanation": "Short reasoning",
      "regularizationSuggestion": "Suggested update (e.g. Regularize status to Present with standard 8h check)"
    }
  ],
  "confidenceScore": 88,
  "requiresHumanApproval": true
}`;

    const userPrompt = `Anomalous Attendance Records Context:\n${JSON.stringify(anomalyContext, null, 2)}`;
    const result = await aiService.getAiResponse(systemPrompt, userPrompt, true);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Resume Screening for Recruitment
exports.screenResume = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ success: false, message: 'Please provide both resumeText and jobDescription' });
    }

    const systemPrompt = `You are an advisory ATS resume screening assistant. Screen the provided candidate resume text against the job description requirements. Give strengths, gaps, match percentage, and suitability.
You MUST return ONLY a JSON object formatted exactly as:
{
  "matchPercentage": 78,
  "strengths": ["Skill A matches perfectly", "Relevant experience in role"],
  "gaps": ["Missing certification X", "No clear experience in tool Y"],
  "recommendation": "Markdown formatted suggestion on whether to interview or decline.",
  "confidenceScore": 90,
  "requiresHumanApproval": true
}`;

    const userPrompt = `Job Description:\n${jobDescription}\n\nCandidate Resume:\n${resumeText}`;
    const result = await aiService.getAiResponse(systemPrompt, userPrompt, true);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
