const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Announcement = require('../models/Announcement');
const Material = require('../models/Material');
const Doubt = require('../models/Doubt');

// @desc    Get dashboard metrics tailored to role
// @route   GET /api/stats/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const user = req.user;
    const now = new Date();

    if (user.role === 'admin') {
      const [
        totalStudents,
        totalFaculty,
        totalEvents,
        totalBookings,
        totalAssignments,
        totalMaterials,
        totalAnnouncements,
        totalDoubts,
        recentBookings,
        revenueData,
      ] = await Promise.all([
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'faculty' }),
        Event.countDocuments(),
        Booking.countDocuments({ status: 'confirmed' }),
        Assignment.countDocuments(),
        Material.countDocuments(),
        Announcement.countDocuments(),
        Doubt.countDocuments(),
        Booking.find()
          .populate('user', 'name email rollNumber')
          .populate('event', 'title venue')
          .sort({ bookedAt: -1 })
          .limit(5),
        Booking.aggregate([
          { $match: { status: 'confirmed' } },
          { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
        ]),
      ]);

      const totalRevenue = revenueData[0]?.totalRevenue || 0;

      return res.status(200).json({
        success: true,
        stats: {
          totalStudents,
          totalFaculty,
          totalEvents,
          totalBookings,
          totalAssignments,
          totalMaterials,
          totalAnnouncements,
          totalDoubts,
          totalRevenue,
        },
        recentBookings,
      });
    }

    if (user.role === 'faculty') {
      const [
        myAssignments,
        myMaterials,
        myAnnouncements,
        submissionsToGrade,
        totalStudents,
        upcomingEvents,
        recentSubmissions,
      ] = await Promise.all([
        Assignment.countDocuments({ createdBy: user._id }),
        Material.countDocuments({ uploadedBy: user._id }),
        Announcement.countDocuments({ author: user._id }),
        Submission.countDocuments({
          status: 'submitted',
          assignment: { $in: await Assignment.find({ createdBy: user._id }).distinct('_id') },
        }),
        User.countDocuments({ role: 'student', department: user.department }),
        Event.find({ date: { $gte: new Date().setHours(0, 0, 0, 0) } })
          .sort({ date: 1 })
          .limit(4),
        Submission.find({
          assignment: { $in: await Assignment.find({ createdBy: user._id }).distinct('_id') },
        })
          .populate('student', 'name email rollNumber avatar')
          .populate('assignment', 'title subject maxMarks')
          .sort({ submittedAt: -1 })
          .limit(5),
      ]);

      return res.status(200).json({
        success: true,
        stats: {
          myAssignments,
          myMaterials,
          myAnnouncements,
          submissionsToGrade,
          totalStudents,
        },
        upcomingEvents,
        recentSubmissions,
      });
    }

    // Role: Student
    const [
      allAssignments,
      mySubmissions,
      attendances,
      upcomingEvents,
      latestAnnouncements,
      myBookingsCount,
    ] = await Promise.all([
      Assignment.find({ department: user.department }).sort({ deadline: 1 }),
      Submission.find({ student: user._id }),
      Attendance.find({ 'records.student': user._id }),
      Event.find({ date: { $gte: new Date().setHours(0, 0, 0, 0) } })
        .sort({ date: 1 })
        .limit(4),
      Announcement.find({ targetAudience: { $in: ['all', 'students'] } })
        .populate('author', 'name role')
        .sort({ isPinned: -1, createdAt: -1 })
        .limit(5),
      Booking.countDocuments({ user: user._id, status: 'confirmed' }),
    ]);

    const submittedMap = {};
    mySubmissions.forEach((s) => {
      submittedMap[s.assignment.toString()] = s;
    });

    const pendingAssignments = allAssignments.filter(
      (a) => !submittedMap[a._id.toString()] && new Date(a.deadline) > now
    );
    const overdueAssignments = allAssignments.filter(
      (a) => !submittedMap[a._id.toString()] && new Date(a.deadline) <= now
    );

    // Calculate attendance summary
    let totalClasses = 0;
    let totalAttended = 0;
    attendances.forEach((att) => {
      const rec = att.records.find((r) => r.student.toString() === user._id.toString());
      if (rec) {
        totalClasses += 1;
        if (rec.status === 'present' || rec.status === 'late') {
          totalAttended += 1;
        }
      }
    });

    const overallAttendance = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 100;

    return res.status(200).json({
      success: true,
      stats: {
        overallAttendance,
        isAttendanceLow: overallAttendance < 75,
        totalClasses,
        totalAttended,
        pendingAssignmentsCount: pendingAssignments.length,
        submittedAssignmentsCount: mySubmissions.length,
        overdueCount: overdueAssignments.length,
        myBookingsCount,
      },
      pendingAssignments: pendingAssignments.slice(0, 5),
      upcomingEvents,
      latestAnnouncements,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
