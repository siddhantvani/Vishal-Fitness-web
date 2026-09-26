const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const request = (path, method, data, token) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173',
      }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    if (data) {
      const payload = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body: body ? JSON.parse(body) : null }));
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

(async () => {
  try {
    console.log('--- Setup Data ---');
    await prisma.attendance.deleteMany({});
    await prisma.progress.deleteMany({});
    await prisma.workoutExercise.deleteMany({});
    await prisma.workout.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.schedule.deleteMany({});
    await prisma.class.deleteMany({});
    await prisma.user.deleteMany({ where: { email: { contains: 'test.com' } } });

    // Members
    const mRes1 = await request('/api/auth/register', 'POST', { email: 'm1@test.com', password: 'password123', firstName: 'M1', lastName: 'L' });
    const m1Token = mRes1.body.token;

    const mRes2 = await request('/api/auth/register', 'POST', { email: 'm2@test.com', password: 'password123', firstName: 'M2', lastName: 'L' });
    const m2Token = mRes2.body.token;

    // Admin
    const adminRes = await request('/api/auth/register', 'POST', { email: 'admin@test.com', password: 'password123', firstName: 'A', lastName: 'L' });
    await prisma.user.update({ where: { id: adminRes.body.user.id }, data: { role: 'ADMIN' } });
    const adminLogin = await request('/api/auth/login', 'POST', { email: 'admin@test.com', password: 'password123' });
    const adminToken = adminLogin.body.token;

    // Trainers
    const tempT1 = await request('/api/auth/register', 'POST', { email: 'tlogin1@test.com', password: 'password123', firstName: 'T', lastName: 'L' });
    await prisma.user.update({ where: { id: tempT1.body.user.id }, data: { role: 'TRAINER' } });
    const t1Login = await request('/api/auth/login', 'POST', { email: 'tlogin1@test.com', password: 'password123' });
    const trainerToken = t1Login.body.token;
    const trainerId = tempT1.body.user.id;

    const tempT2 = await request('/api/auth/register', 'POST', { email: 'tlogin2@test.com', password: 'password123', firstName: 'T', lastName: 'L' });
    await prisma.user.update({ where: { id: tempT2.body.user.id }, data: { role: 'TRAINER' } });
    const t2Login = await request('/api/auth/login', 'POST', { email: 'tlogin2@test.com', password: 'password123' });
    const fakeTrainerToken = t2Login.body.token;

    // Class and Schedule
    const classRes = await request('/api/classes', 'POST', { name: 'Yoga', description: 'Yoga', type: 'YOGA', capacity: 10, duration: 60 }, adminToken);
    const classId = classRes.body.class.id;
    const futureTime = new Date(Date.now() + 86400000);
    const futureEndTime = new Date(Date.now() + 90000000);
    const schedRes = await request('/api/schedules', 'POST', { classId, trainerId, date: futureTime.toISOString(), day: 'Mon', startTime: futureTime.toISOString(), endTime: futureEndTime.toISOString() }, adminToken);
    const scheduleId = schedRes.body.schedule.id;

    // Bookings
    const bookingRes = await request('/api/bookings', 'POST', { scheduleId }, m1Token);
    const bookingId = bookingRes.body.booking.id;

    // Cancelled Booking
    const cancelledSchedRes = await request('/api/schedules', 'POST', { classId, trainerId, date: futureTime.toISOString(), day: 'Mon', startTime: futureTime.toISOString(), endTime: futureEndTime.toISOString() }, adminToken);
    const cancelledBookingRes = await request('/api/bookings', 'POST', { scheduleId: cancelledSchedRes.body.schedule.id }, m2Token);
    await request(`/api/bookings/${cancelledBookingRes.body.booking.id}/cancel`, 'PATCH', null, m2Token);
    const cancelledBookingId = cancelledBookingRes.body.booking.id;


    console.log('\n--- Test 1: Member cannot create attendance ---');
    let res = await request('/api/attendance', 'POST', { bookingId, status: 'PRESENT', checkInTime: new Date().toISOString() }, m1Token);
    console.log('Status (expect 403):', res.status);

    console.log('\n--- Test 2: Trainer creates attendance for authorized booking ---');
    res = await request('/api/attendance', 'POST', { bookingId, status: 'PRESENT', checkInTime: new Date().toISOString() }, trainerToken);
    console.log('Status (expect 201):', res.status);
    const attendanceId = res.body.attendance.id;

    console.log('\n--- Test 3: Duplicate attendance rejected ---');
    res = await request('/api/attendance', 'POST', { bookingId, status: 'LATE', checkInTime: new Date().toISOString() }, trainerToken);
    console.log('Status (expect 409):', res.status);

    console.log('\n--- Test 4: Trainer blocked from unauthorized booking ---');
    res = await request('/api/attendance', 'POST', { bookingId, status: 'PRESENT', checkInTime: new Date().toISOString() }, fakeTrainerToken);
    console.log('Status (expect 403):', res.status);

    console.log('\n--- Test 5: Cancelled booking rejected ---');
    res = await request('/api/attendance', 'POST', { bookingId: cancelledBookingId, status: 'PRESENT', checkInTime: new Date().toISOString() }, trainerToken);
    console.log('Status (expect 400):', res.status);

    console.log('\n--- Test 6: Invalid booking rejected ---');
    res = await request('/api/attendance', 'POST', { bookingId: '00000000-0000-0000-0000-000000000000', status: 'PRESENT', checkInTime: new Date().toISOString() }, trainerToken);
    console.log('Status (expect 404):', res.status);

    console.log('\n--- Test 7: Invalid status rejected ---');
    res = await request('/api/attendance', 'POST', { bookingId, status: 'INVALID', checkInTime: new Date().toISOString() }, adminToken);
    console.log('Status (expect 400):', res.status);

    console.log('\n--- Test 8: Checkout before checkin rejected ---');
    // Admin creates attendance for m2 (we need another booking)
    const bookingRes2 = await request('/api/bookings', 'POST', { scheduleId }, m2Token);
    const bookingId2 = bookingRes2.body.booking.id;
    res = await request('/api/attendance', 'POST', { bookingId: bookingId2, status: 'LATE', checkInTime: new Date().toISOString(), checkOutTime: new Date(Date.now() - 10000).toISOString() }, adminToken);
    console.log('Status (expect 400):', res.status);

    console.log('\n--- Test 9: Admin creates attendance ---');
    res = await request('/api/attendance', 'POST', { bookingId: bookingId2, status: 'PRESENT', checkInTime: new Date().toISOString() }, adminToken);
    console.log('Status (expect 201):', res.status);
    const adminAttendanceId = res.body.attendance.id;

    console.log('\n--- Test 10: Member views own attendance ---');
    res = await request('/api/attendance', 'GET', null, m1Token);
    console.log('Status (expect 200):', res.status, 'Count:', res.body.length);

    console.log('\n--- Test 11: Member cannot view another member\'s attendance ---');
    res = await request(`/api/attendance/${adminAttendanceId}`, 'GET', null, m1Token);
    console.log('Status (expect 403):', res.status);

    console.log('\n--- Test 12: Unauthorized update rejected ---');
    res = await request(`/api/attendance/${attendanceId}`, 'PATCH', { status: 'ABSENT' }, m1Token);
    console.log('Status (expect 403):', res.status);
    res = await request(`/api/attendance/${attendanceId}`, 'PATCH', { status: 'ABSENT' }, fakeTrainerToken);
    console.log('Status (expect 403):', res.status);

    console.log('\n--- Test 13: Unauthorized delete rejected ---');
    res = await request(`/api/attendance/${attendanceId}`, 'DELETE', null, m1Token);
    console.log('Status (expect 403):', res.status);
    res = await request(`/api/attendance/${attendanceId}`, 'DELETE', null, fakeTrainerToken);
    console.log('Status (expect 403):', res.status);

    console.log('\n--- Test 14: Admin can manage attendance ---');
    res = await request(`/api/attendance/${attendanceId}`, 'PATCH', { status: 'ABSENT' }, adminToken);
    console.log('Update Status (expect 200):', res.status);
    res = await request(`/api/attendance/${adminAttendanceId}`, 'DELETE', null, adminToken);
    console.log('Delete Status (expect 200):', res.status);

    console.log('\n--- Test 15: Unauthenticated request rejected ---');
    res = await request('/api/attendance', 'GET');
    console.log('Status (expect 401):', res.status);

    console.log('\n--- Tests Complete ---');
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
