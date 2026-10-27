const mongoose = require('mongoose');
const QRCode = require('qrcode');
require('dotenv').config();

const User = require('./models/User');
const Assignment = require('./models/Assignment');
const Submission = require('./models/Submission');
const Attendance = require('./models/Attendance');
const Announcement = require('./models/Announcement');
const Material = require('./models/Material');
const Doubt = require('./models/Doubt');
const Event = require('./models/Event');
const Booking = require('./models/Booking');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusconnect';
    console.log(`[Seed] Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected successfully.');

    // Clear existing collections
    console.log('[Seed] Cleaning existing data...');
    await Promise.all([
      User.deleteMany({}),
      Assignment.deleteMany({}),
      Submission.deleteMany({}),
      Attendance.deleteMany({}),
      Announcement.deleteMany({}),
      Material.deleteMany({}),
      Doubt.deleteMany({}),
      Event.deleteMany({}),
      Booking.deleteMany({}),
    ]);
    console.log('[Seed] Cleaned database.');

    // 1. Create Users (1 Admin, 2 Faculty, 5 Students)
    console.log('[Seed] Creating users...');

    // Admin (seeded, cannot signup via normal page)
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@campusconnect.edu',
      password: 'Admin@123',
      role: 'admin',
      department: 'Central Administration',
      employeeId: 'ADM-2026-001',
      phone: '+91 98765 00001',
      bio: 'Chief IT Administrator & Academic Operations Overseer.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      status: 'active',
    });

    // Faculty 1
    const faculty1 = await User.create({
      name: 'Prof. Rajesh Sharma',
      email: 'prof.sharma@campusconnect.edu',
      password: 'Faculty@123',
      role: 'faculty',
      department: 'Computer Science & Engineering',
      employeeId: 'FAC-CSE-101',
      phone: '+91 98765 00101',
      bio: 'Professor of Distributed Computing and Operating Systems. 15+ years academic & research experience.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      status: 'active',
    });

    // Faculty 2
    const faculty2 = await User.create({
      name: 'Dr. Sunita Patel',
      email: 'dr.patel@campusconnect.edu',
      password: 'Faculty@123',
      role: 'faculty',
      department: 'Computer Science & Engineering',
      employeeId: 'FAC-CSE-102',
      phone: '+91 98765 00102',
      bio: 'Associate Professor specializing in AI, Machine Learning and Modern Database Architecture.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      status: 'active',
    });

    // Students (5)
    const student1 = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav.sharma@student.campusconnect.edu',
      password: 'Student@123',
      role: 'student',
      department: 'Computer Science & Engineering',
      rollNumber: 'CS202301',
      phone: '+91 98765 11001',
      bio: 'Third-year CSE undergraduate passionate about Distributed Systems and Full-Stack Engineering.',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      status: 'active',
    });

    const student2 = await User.create({
      name: 'Priya Verma',
      email: 'priya.verma@student.campusconnect.edu',
      password: 'Student@123',
      role: 'student',
      department: 'Computer Science & Engineering',
      rollNumber: 'CS202302',
      phone: '+91 98765 11002',
      bio: 'Undergraduate student exploring UI/UX and Data Analytics. Student council representative.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      status: 'active',
    });

    const student3 = await User.create({
      name: 'Rohan Mehta',
      email: 'rohan.mehta@student.campusconnect.edu',
      password: 'Student@123',
      role: 'student',
      department: 'Computer Science & Engineering',
      rollNumber: 'CS202303',
      phone: '+91 98765 11003',
      bio: 'Open source contributor and competitive programming enthusiast.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      status: 'active',
    });

    const student4 = await User.create({
      name: 'Ananya Iyer',
      email: 'ananya.iyer@student.campusconnect.edu',
      password: 'Student@123',
      role: 'student',
      department: 'Computer Science & Engineering',
      rollNumber: 'CS202304',
      phone: '+91 98765 11004',
      bio: 'AI researcher and President of the Robotics & Innovation Club.',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      status: 'active',
    });

    const student5 = await User.create({
      name: 'Vikram Singh',
      email: 'vikram.singh@student.campusconnect.edu',
      password: 'Student@123',
      role: 'student',
      department: 'Computer Science & Engineering',
      rollNumber: 'CS202305',
      phone: '+91 98765 11005',
      bio: 'Cybersecurity buff, cloud builder and campus sports captain.',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
      status: 'active',
    });

    const allStudents = [student1, student2, student3, student4, student5];

    console.log('[Seed] Users created: 1 Admin, 2 Faculty, 5 Students.');

    // 2. Create Assignments
    console.log('[Seed] Creating assignments...');
    const now = new Date();
    const in5Days = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const in12Days = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000);
    const past2Days = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const assignment1 = await Assignment.create({
      title: 'Lab 04: Raft Distributed Consensus Protocol',
      description:
        'Implement the leader election and log replication states of the Raft consensus algorithm. Submit your documented source code along with simulation traces demonstrating fault recovery.',
      subject: 'Distributed Systems',
      department: 'Computer Science & Engineering',
      deadline: in5Days,
      maxMarks: 100,
      attachmentUrl: '/uploads/sample-distributed-systems.pdf',
      attachmentName: 'Raft_Lab_Specification.pdf',
      createdBy: faculty1._id,
    });

    const assignment2 = await Assignment.create({
      title: 'Assignment 3: B+ Tree Indexing & Query Cost Estimation',
      description:
        'Construct a simulation of B+ Tree split and merge algorithms under high volume concurrent insertions. Provide execution time metrics versus linear table scans.',
      subject: 'Database Systems',
      department: 'Computer Science & Engineering',
      deadline: in12Days,
      maxMarks: 50,
      attachmentUrl: '/uploads/sample-database-notes.pdf',
      attachmentName: 'BPlusTree_ProblemSet.pdf',
      createdBy: faculty2._id,
    });

    const assignment3 = await Assignment.create({
      title: 'Project 1: Real-time Multi-Client TCP/IP Chat Server',
      description:
        'Develop an asynchronous, non-blocking TCP socket server handling multiple simultaneous clients using epoll or select loops.',
      subject: 'Computer Networks',
      department: 'Computer Science & Engineering',
      deadline: past2Days,
      maxMarks: 100,
      attachmentUrl: '/uploads/sample-networks-lab.pdf',
      attachmentName: 'SocketProgramming_Specification.pdf',
      createdBy: faculty1._id,
    });

    console.log('[Seed] Assignments created.');

    // 3. Create Submissions
    console.log('[Seed] Creating submissions...');
    // Aarav submitted Assignment 1 & 3
    await Submission.create({
      assignment: assignment1._id,
      student: student1._id,
      fileUrl: '/uploads/sample-distributed-systems.pdf',
      fileName: 'Aarav_CS202301_RaftImplementation.zip',
      fileSize: 1024 * 340,
      notes: 'Included test suite covering network partition scenarios and election timeouts.',
      submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      marksObtained: 94,
      feedback: 'Outstanding implementation! The heartbeat timing logic handles edge cases cleanly.',
      gradedBy: faculty1._id,
      gradedAt: new Date(),
      status: 'graded',
    });

    // Priya submitted Assignment 1 (pending review)
    await Submission.create({
      assignment: assignment1._id,
      student: student2._id,
      fileUrl: '/uploads/sample-distributed-systems.pdf',
      fileName: 'Priya_Verma_RaftLab.pdf',
      fileSize: 1024 * 210,
      notes: 'Implemented leader election; log replication tests are documented in appendix.',
      submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      status: 'submitted',
    });

    // Rohan submitted Assignment 3 (graded)
    await Submission.create({
      assignment: assignment3._id,
      student: student3._id,
      fileUrl: '/uploads/sample-networks-lab.pdf',
      fileName: 'Rohan_SocketChat.zip',
      fileSize: 1024 * 450,
      submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      marksObtained: 88,
      feedback: 'Good implementation of asynchronous socket handlers. Solid code comments.',
      gradedBy: faculty1._id,
      gradedAt: new Date(),
      status: 'graded',
    });

    console.log('[Seed] Submissions created.');

    // 4. Create Attendance Records
    // We create multiple class dates.
    // Notice: Aarav will have ~90% attendance.
    // Priya will have ~68% attendance (below 75%!) so the warning badge is clearly visible.
    console.log('[Seed] Creating attendance records...');
    const subjectsList = ['Distributed Systems', 'Database Systems', 'Computer Networks', 'Artificial Intelligence'];

    const dates = [
      new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    ];

    for (let i = 0; i < dates.length; i++) {
      const classDate = dates[i];
      const subject = subjectsList[i % subjectsList.length];
      const faculty = subject === 'Distributed Systems' || subject === 'Computer Networks' ? faculty1 : faculty2;

      const records = [
        // Aarav: present in 7 out of 8 classes (87.5%)
        { student: student1._id, status: i === 3 ? 'absent' : i === 5 ? 'late' : 'present' },
        // Priya: present in only 4 out of 8 classes (50% or ~60% -> warning banner!)
        { student: student2._id, status: i % 2 === 0 ? 'present' : 'absent' },
        // Rohan: 85%
        { student: student3._id, status: i === 1 ? 'absent' : 'present' },
        // Ananya: 100%
        { student: student4._id, status: 'present' },
        // Vikram: 75%
        { student: student5._id, status: i === 2 || i === 4 ? 'absent' : 'present' },
      ];

      await Attendance.create({
        subject,
        date: classDate,
        department: 'Computer Science & Engineering',
        semester: 'Semester 6',
        markedBy: faculty._id,
        records,
      });
    }
    console.log('[Seed] Attendance records created.');

    // 5. Create Study Materials
    console.log('[Seed] Creating study materials...');
    await Material.create([
      {
        title: 'Distributed Systems: Consensus Protocols & Fault Models',
        description:
          'Comprehensive lecture slides and technical notes covering Paxos, Raft, Byzantine fault tolerance, and network synchrony models.',
        subject: 'Distributed Systems',
        department: 'Computer Science & Engineering',
        semester: 'Semester 6',
        fileUrl: '/uploads/sample-distributed-systems.pdf',
        fileName: 'Distributed_Systems_Lec_Consensus.pdf',
        fileType: 'pdf',
        fileSize: 1024 * 1250,
        uploadedBy: faculty1._id,
        downloadCount: 42,
      },
      {
        title: 'Database Systems: B+ Tree Indexing & Buffer Pool Design',
        description:
          'In-depth reference notes on internal storage managers, page layout, slotted pages, and tree indexing benchmarks.',
        subject: 'Database Systems',
        department: 'Computer Science & Engineering',
        semester: 'Semester 6',
        fileUrl: '/uploads/sample-database-notes.pdf',
        fileName: 'DBMS_Indexing_DeepDive.pdf',
        fileType: 'pdf',
        fileSize: 1024 * 890,
        uploadedBy: faculty2._id,
        downloadCount: 56,
      },
      {
        title: 'Computer Networks: Advanced Socket Programming Lab Manual',
        description:
          'Hands-on laboratory guide with sample implementations for TCP/UDP socket servers, epoll multiplexing, and packet analyzers in C and Python.',
        subject: 'Computer Networks',
        department: 'Computer Science & Engineering',
        semester: 'Semester 6',
        fileUrl: '/uploads/sample-networks-lab.pdf',
        fileName: 'Networks_Socket_LabManual.pdf',
        fileType: 'pdf',
        fileSize: 1024 * 730,
        uploadedBy: faculty1._id,
        downloadCount: 38,
      },
      {
        title: 'Machine Learning: Mathematics Foundations - Linear Algebra & Calculus',
        description:
          'Core mathematical foundations for deep learning: gradient descent formulations, matrix factorization, and probabilistic inference.',
        subject: 'Artificial Intelligence',
        department: 'Computer Science & Engineering',
        semester: 'Semester 6',
        fileUrl: '/uploads/sample-database-notes.pdf',
        fileName: 'ML_Math_Foundations.pdf',
        fileType: 'pdf',
        fileSize: 1024 * 1420,
        uploadedBy: faculty2._id,
        downloadCount: 65,
      },
    ]);
    console.log('[Seed] Study materials created.');

    // 6. Create Announcements
    console.log('[Seed] Creating announcements...');
    await Announcement.create([
      {
        title: '🚀 TechPulse 2026: Annual Campus Tech Symposium & Hackathon Announced!',
        content:
          'We are delighted to announce TechPulse 2026, the premier campus engineering symposium featuring keynote speeches, competitive coding rounds, robotics demos, and a 36-hour hackathon. Seat reservations are now live on the Events portal!',
        category: 'Events',
        priority: 'urgent',
        targetAudience: 'all',
        isPinned: true,
        author: admin._id,
      },
      {
        title: '📅 Mid-Term Examination Schedule - Fall Semester 2026',
        content:
          'The official mid-semester examination timetable has been published. Theory papers will commence from the 15th of next month. Students with attendance below 75% are advised to meet their respective subject faculty immediately.',
        category: 'Academic',
        priority: 'high',
        targetAudience: 'students',
        isPinned: true,
        author: faculty1._id,
      },
      {
        title: '🎤 Guest Lecture: Frontiers of Large Language Models & Autonomous Agents',
        content:
          'Dr. Arvind Joshi, Principal Research Scientist, will deliver an exclusive keynote on practical LLM orchestration and vector architectures in Auditorium A. Entry by registration pass only.',
        category: 'Academic',
        priority: 'medium',
        targetAudience: 'all',
        isPinned: false,
        author: faculty2._id,
      },
      {
        title: '📚 Central Campus Library: Extended 24/7 Hours During Revision Week',
        content:
          'The Central Library and Digital Learning Hub will remain operational 24/7 starting Monday. High-speed study cubicles and coffee stations will be open across floors 2 and 3.',
        category: 'General',
        priority: 'low',
        targetAudience: 'all',
        isPinned: false,
        author: admin._id,
      },
    ]);
    console.log('[Seed] Announcements created.');

    // 7. Create Doubts and Replies
    console.log('[Seed] Creating doubts and forum discussions...');
    const doubt1 = await Doubt.create({
      title: 'How does Raft handle network partitions during the election phase?',
      description:
        'If a cluster of 5 nodes gets partitioned into 2 and 3 nodes, what happens if the partitioned minority keeps incrementing its term? Does it disrupt the majority when the network heals?',
      subject: 'Distributed Systems',
      department: 'Computer Science & Engineering',
      tags: ['Raft', 'Consensus', 'Network Partition', 'Distributed Systems'],
      author: student1._id,
      upvotes: [student2._id, student3._id, student4._id],
      isSolved: true,
      replies: [
        {
          author: student3._id,
          content:
            'In standard Raft, the minority candidate will time out, increment its term, and send RequestVote RPCs that no majority answers. When the partition heals, its higher term might force the leader to step down.',
          upvotes: [student1._id],
          isAcceptedAnswer: false,
          createdAt: new Date(Date.now() - 40 * 60 * 60 * 1000),
        },
        {
          author: faculty1._id,
          content:
            'Excellent question! To prevent this term disruption, modern Raft implementations use the Pre-Vote phase (Section 9.6 of Diego Ongaro’s thesis). Before incrementing its term, a candidate enters Pre-Candidate state and checks if a majority would grant it a vote. If not, it never increments its term, preserving cluster stability upon reunification.',
          upvotes: [student1._id, student2._id, student4._id, student5._id],
          isAcceptedAnswer: true,
          createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
        },
      ],
    });

    // Mark accepted answer id on doubt1
    doubt1.solvedReplyId = doubt1.replies[1]._id;
    await doubt1.save();

    await Doubt.create({
      title: 'Why do B+ Trees store all actual record pointers solely in leaf nodes instead of internal nodes?',
      description:
        'In classic B-Trees, data pointers can reside in any internal node. Why did B+ Trees separate index keys in internal nodes and keep records strictly at the bottom?',
      subject: 'Database Systems',
      department: 'Computer Science & Engineering',
      tags: ['DBMS', 'Indexing', 'BPlusTree', 'Query Optimization'],
      author: student2._id,
      upvotes: [student1._id, student3._id],
      isSolved: false,
      replies: [
        {
          author: faculty2._id,
          content:
            'Because internal nodes don’t have to waste bytes storing row pointers or data payloads, an internal index page can pack far more branching keys. This dramatically increases the fanout factor, reducing the overall tree height to just 3 or 4 levels even for millions of records. Furthermore, leaf nodes form a doubly linked list, making sequential range scans O(k) once you find the starting point.',
          upvotes: [student2._id, student1._id],
          isAcceptedAnswer: false,
          createdAt: new Date(Date.now() - 15 * 60 * 60 * 1000),
        },
      ],
    });

    console.log('[Seed] Doubts and forum threads created.');

    // 8. Create BookMyShow-style Events
    console.log('[Seed] Creating events with seat layouts (Rows A-J)...');
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

    const event1 = await Event.create({
      title: 'TechPulse 2026: Campus Annual Tech Symposium',
      description:
        'The premier collegiate engineering conference featuring visionary keynotes, cutting-edge AI demonstrations, robotics showcases, and networking sessions with leading tech innovators.',
      category: 'Fest',
      bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      startTime: '09:30 AM',
      endTime: '05:30 PM',
      venue: 'Main Campus Grand Auditorium (Block A)',
      ticketPrice: 150,
      seatRows: rows,
      seatsPerRow: 10,
      organizer: admin._id,
      status: 'upcoming',
      heldSeats: [],
      bookedSeats: [],
    });

    const event2 = await Event.create({
      title: 'CineNight: Interstellar 4K Campus Screening',
      description:
        'Grab your popcorn! Student Council presents an exclusive outdoor amphitheatre screening of Christopher Nolan’s sci-fi masterpiece Interstellar with Dolby surround sound under the open night sky.',
      category: 'Movie Night',
      bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      startTime: '07:00 PM',
      endTime: '10:15 PM',
      venue: 'Open Air Amphitheatre',
      ticketPrice: 50,
      seatRows: rows,
      seatsPerRow: 10,
      organizer: faculty1._id,
      status: 'upcoming',
      heldSeats: [],
      bookedSeats: [],
    });

    const event3 = await Event.create({
      title: 'Frontiers of Large Language Models & Agentic AI',
      description:
        'An intensive technical seminar exploring context-aware LLMs, reasoning models, fine-tuning, and building multi-agent systems from research papers to production architectures.',
      category: 'Guest Lecture',
      bannerUrl: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&w=1200&q=80',
      date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      startTime: '02:00 PM',
      endTime: '04:30 PM',
      venue: 'Conference Hall 2 - Innovation Wing',
      ticketPrice: 0, // Free registration
      seatRows: rows,
      seatsPerRow: 10,
      organizer: faculty2._id,
      status: 'upcoming',
      heldSeats: [],
      bookedSeats: [],
    });

    const event4 = await Event.create({
      title: 'HackSpark: 36-Hour National Collegiate Hackathon',
      description:
        'Sprint from idea to demo in 36 uninterrupted hours. Over ₹2,00,000 in bounties, mentorship from industry architects, free food, energy drinks, and merchandise!',
      category: 'Workshop',
      bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
      date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      startTime: '09:00 AM',
      endTime: '09:00 PM',
      venue: 'Computing Laboratories 1 & 2',
      ticketPrice: 200,
      seatRows: rows,
      seatsPerRow: 10,
      organizer: admin._id,
      status: 'upcoming',
      heldSeats: [],
      bookedSeats: [],
    });

    console.log('[Seed] Events created.');

    // 9. Create Sample Bookings & Mark pre-booked seats
    console.log('[Seed] Creating demo bookings with QR codes...');
    const booking1Id = 'CC-2026-TK89A';
    const booking1Seats = ['A3', 'A4'];
    const qr1Payload = JSON.stringify({
      app: 'CampusConnect',
      bookingId: booking1Id,
      eventId: event1._id,
      eventTitle: event1.title,
      userName: student1.name,
      userEmail: student1.email,
      seats: booking1Seats,
      venue: event1.venue,
      date: event1.date,
      totalAmount: 300,
      issuedAt: new Date(),
    });
    const qr1 = await QRCode.toDataURL(qr1Payload, {
      margin: 1,
      color: { dark: '#1e1b4b', light: '#ffffff' },
    });

    const booking1 = await Booking.create({
      bookingId: booking1Id,
      event: event1._id,
      user: student1._id,
      seats: booking1Seats,
      seatCount: 2,
      ticketPrice: 150,
      totalAmount: 300,
      qrCodeDataUrl: qr1,
      status: 'confirmed',
      bookedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    });

    // Mark seats on Event 1
    event1.bookedSeats = [
      { seatId: 'A3', bookedBy: student1._id, bookingId: booking1._id, bookedAt: new Date() },
      { seatId: 'A4', bookedBy: student1._id, bookingId: booking1._id, bookedAt: new Date() },
      { seatId: 'B5', bookedBy: student3._id, bookingId: booking1._id, bookedAt: new Date() },
      { seatId: 'B6', bookedBy: student3._id, bookingId: booking1._id, bookedAt: new Date() },
      { seatId: 'C1', bookedBy: student4._id, bookingId: booking1._id, bookedAt: new Date() },
      { seatId: 'C2', bookedBy: student4._id, bookingId: booking1._id, bookedAt: new Date() },
    ];
    await event1.save();

    // Booking on Event 2 (Movie Night)
    const booking2Id = 'CC-2026-MV41P';
    const booking2Seats = ['D5', 'D6'];
    const qr2Payload = JSON.stringify({
      app: 'CampusConnect',
      bookingId: booking2Id,
      eventId: event2._id,
      eventTitle: event2.title,
      userName: student2.name,
      userEmail: student2.email,
      seats: booking2Seats,
      venue: event2.venue,
      date: event2.date,
      totalAmount: 100,
      issuedAt: new Date(),
    });
    const qr2 = await QRCode.toDataURL(qr2Payload, {
      margin: 1,
      color: { dark: '#1e1b4b', light: '#ffffff' },
    });

    const booking2 = await Booking.create({
      bookingId: booking2Id,
      event: event2._id,
      user: student2._id,
      seats: booking2Seats,
      seatCount: 2,
      ticketPrice: 50,
      totalAmount: 100,
      qrCodeDataUrl: qr2,
      status: 'confirmed',
      bookedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    });

    event2.bookedSeats = [
      { seatId: 'D5', bookedBy: student2._id, bookingId: booking2._id, bookedAt: new Date() },
      { seatId: 'D6', bookedBy: student2._id, bookingId: booking2._id, bookedAt: new Date() },
      { seatId: 'E4', bookedBy: student5._id, bookingId: booking2._id, bookedAt: new Date() },
      { seatId: 'E5', bookedBy: student5._id, bookingId: booking2._id, bookedAt: new Date() },
    ];
    await event2.save();

    console.log('[Seed] Demo bookings and pre-booked seats initialized.');

    console.log('\n======================================================');
    console.log('🎉 CAMPUSCONNECT DATABASE SEEDED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Credentials for Testing:');
    console.log('------------------------------------------------------');
    console.log('ADMIN:');
    console.log('  Email:    admin@campusconnect.edu');
    console.log('  Password: Admin@123\n');
    console.log('FACULTY:');
    console.log('  1. prof.sharma@campusconnect.edu  / Faculty@123 (CSE Head)');
    console.log('  2. dr.patel@campusconnect.edu     / Faculty@123 (AI & DB)');
    console.log('\nSTUDENTS:');
    console.log('  1. aarav.sharma@student.campusconnect.edu  / Student@123 (High attendance: >85%)');
    console.log('  2. priya.verma@student.campusconnect.edu   / Student@123 (Low attendance: <75% warning)');
    console.log('  3. rohan.mehta@student.campusconnect.edu   / Student@123');
    console.log('  4. ananya.iyer@student.campusconnect.edu   / Student@123');
    console.log('  5. vikram.singh@student.campusconnect.edu  / Student@123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedData();
