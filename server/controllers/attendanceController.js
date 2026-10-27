const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Mark attendance for students (Faculty / Admin)
// @route   POST /api/attendance
// @access  Faculty / Admin
const markAttendance = async (req, res, next) => {
  try {
    const { subject, date, department, semester, records } = req.body;

    if (!subject || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: 'Subject, date, and student records are required',
      });
    }

    const attendanceDate = new Date(date);
    // Normalize to date without time for unique match
    const startOfDay = new Date(attendanceDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(attendanceDate.setHours(23, 59, 59, 999));

    let attendance = await Attendance.findOne({
      subject: subject.trim(),
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (attendance) {
      // Update existing records
      attendance.records = records;
      attendance.markedBy = req.user._id;
      if (department) attendance.department = department;
      if (semester) attendance.semester = semester;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        subject: subject.trim(),
        date: startOfDay,
        department: department || req.user.department || 'Computer Science & Engineering',
        semester: semester || 'Semester 6',
        markedBy: req.user._id,
        records,
      });
    }

    const populated = await Attendance.findById(attendance._id)
      .populate('records.student', 'name email rollNumber')
      .populate('markedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Attendance saved successfully',
      attendance: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance summary & subject breakdown for a student
// @route   GET /api/attendance/student/:studentId?
// @access  Private
const getStudentAttendance = async (req, res, next) => {
  try {
    // If student, force req.user._id; if faculty/admin and param passed, view target student
    let studentId = req.user._id;
    if ((req.user.role === 'faculty' || req.user.role === 'admin') && req.params.studentId) {
      studentId = req.params.studentId;
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Find all attendance records containing this student
    const attendances = await Attendance.find({
      'records.student': studentId,
    }).sort({ date: -1 });

    const subjectMap = {};
    let totalClasses = 0;
    let totalAttended = 0;
    const history = [];

    attendances.forEach((att) => {
      const rec = att.records.find((r) => r.student.toString() === studentId.toString());
      if (!rec) return;

      const isAttended = rec.status === 'present' || rec.status === 'late';
      totalClasses += 1;
      if (isAttended) totalAttended += 1;

      if (!subjectMap[att.subject]) {
        subjectMap[att.subject] = {
          subject: att.subject,
          department: att.department,
          total: 0,
          attended: 0,
          present: 0,
          absent: 0,
          late: 0,
        };
      }

      subjectMap[att.subject].total += 1;
      if (rec.status === 'present') {
        subjectMap[att.subject].present += 1;
        subjectMap[att.subject].attended += 1;
      } else if (rec.status === 'late') {
        subjectMap[att.subject].late += 1;
        subjectMap[att.subject].attended += 1;
      } else {
        subjectMap[att.subject].absent += 1;
      }

      history.push({
        _id: att._id,
        date: att.date,
        subject: att.subject,
        status: rec.status,
        remarks: rec.remarks,
        markedBy: att.markedBy,
      });
    });

    const subjectStats = Object.values(subjectMap).map((item) => {
      const percentage = item.total > 0 ? Math.round((item.attended / item.total) * 100) : 0;
      return {
        ...item,
        percentage,
        isLow: percentage < 75,
      };
    });

    const overallPercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;
    const lowSubjects = subjectStats.filter((s) => s.isLow);

    res.status(200).json({
      success: true,
      student: {
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        department: student.department,
      },
      summary: {
        totalClasses,
        totalAttended,
        overallPercentage,
        isBelow75: overallPercentage < 75,
        warningMessage:
          overallPercentage < 75
            ? `Warning: Your overall attendance is ${overallPercentage}%, which is below the mandatory 75% threshold.`
            : 'Good standing! Your attendance exceeds the required 75% minimum.',
        lowSubjectsCount: lowSubjects.length,
      },
      subjects: subjectStats,
      history,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance records marked by faculty or for department
// @route   GET /api/attendance/faculty
// @access  Faculty / Admin
const getFacultyAttendance = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'faculty') {
      filter.markedBy = req.user._id;
    }
    if (req.query.subject) {
      filter.subject = req.query.subject;
    }

    const records = await Attendance.find(filter)
      .populate('records.student', 'name email rollNumber')
      .populate('markedBy', 'name email')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      attendance: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student list for attendance marking
// @route   GET /api/attendance/students
// @access  Faculty / Admin
const getEligibleStudents = async (req, res, next) => {
  try {
    const { department } = req.query;
    const filter = { role: 'student', status: 'active' };
    if (department) filter.department = department;

    const students = await User.find(filter)
      .select('name email rollNumber department avatar')
      .sort({ rollNumber: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markAttendance,
  getStudentAttendance,
  getFacultyAttendance,
  getEligibleStudents,
};
