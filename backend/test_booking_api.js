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
    await prisma.booking.deleteMany({});
    await prisma.schedule.deleteMany({});
    await prisma.class.deleteMany({});
    await prisma.user.deleteMany({ where: { email: { contains: 'test.com' } } });

    // Users
    const memberRes1 = await request('/api/auth/register', 'POST', { email: 'member1@test.com', password: 'password123', firstName: 'M1', lastName: 'L' });
    const member1Token = memberRes1.body.token;

    const memberRes2 = await request('/api/auth/register', 'POST', { email: 'member2@test.com', password: 'password123', firstName: 'M2', lastName: 'L' });
    const member2Token = memberRes2.body.token;

    const adminRes = await request('/api/auth/register', 'POST', { email: 'admin@test.com', password: 'password123', firstName: 'A', lastName: 'L' });
    await prisma.user.update({ where: { id: adminRes.body.user.id }, data: { role: 'ADMIN' } });
    const adminLogin = await request('/api/auth/login', 'POST', { email: 'admin@test.com', password: 'password123' });
    const adminToken = adminLogin.body.token;

    // Trainer
    const trainerRes = await request('/api/trainers', 'POST', { email: 'trainer@test.com', firstName: 'T', lastName: 'L' }, adminToken);
    const trainerId = trainerRes.body.trainer.id;

    // Class (Capacity 2 for testing)
    const classRes = await request('/api/classes', 'POST', { name: 'Yoga', description: 'Yoga', type: 'YOGA', capacity: 2, duration: 60 }, adminToken);
    const classId = classRes.body.class.id;

    // Schedules
    const futureTime = new Date(Date.now() + 86400000);
    const pastTime = new Date(Date.now() - 86400000);
    const futureEndTime = new Date(Date.now() + 90000000);
    const pastEndTime = new Date(Date.now() - 80000000);

    const schedRes = await request('/api/schedules', 'POST', { classId, trainerId, date: futureTime.toISOString(), day: 'Mon', startTime: futureTime.toISOString(), endTime: futureEndTime.toISOString() }, adminToken);
    const scheduleId = schedRes.body.schedule.id;

    const pastSchedRes = await request('/api/schedules', 'POST', { classId, trainerId, date: pastTime.toISOString(), day: 'Mon', startTime: pastTime.toISOString(), endTime: pastEndTime.toISOString() }, adminToken);
    const pastScheduleId = pastSchedRes.body.schedule.id;

    const cancelledSchedRes = await request('/api/schedules', 'POST', { classId, trainerId, date: futureTime.toISOString(), day: 'Mon', startTime: futureTime.toISOString(), endTime: futureEndTime.toISOString(), status: 'CANCELLED' }, adminToken);
    const cancelledScheduleId = cancelledSchedRes.body.schedule.id;

    let bookingId1;

    // 2. Member successfully creates booking
    console.log('\n--- 2. Member successfully creates booking ---');
    let res = await request('/api/bookings', 'POST', { scheduleId }, member1Token);
    console.log('Status (expect 201):', res.status);
    bookingId1 = res.body.booking.id;

    // 6. availableSlots decreases after booking
    console.log('\n--- 6. availableSlots decreases after booking ---');
    let schedCheck = await request(`/api/schedules/${scheduleId}`, 'GET');
    console.log('Slots (expect 1):', schedCheck.body.availableSlots);

    // 8. Duplicate active booking is rejected
    console.log('\n--- 8. Duplicate active booking is rejected ---');
    res = await request('/api/bookings', 'POST', { scheduleId }, member1Token);
    console.log('Status (expect 409):', res.status);

    // 3. Member can view own bookings
    console.log('\n--- 3. Member can view own bookings ---');
    res = await request('/api/bookings', 'GET', null, member1Token);
    console.log('Status (expect 200):', res.status, 'Count:', res.body.length);

    // 4. Member can view own booking by ID
    console.log('\n--- 4. Member can view own booking by ID ---');
    res = await request(`/api/bookings/${bookingId1}`, 'GET', null, member1Token);
    console.log('Status (expect 200):', res.status);

    // 12. Member cannot access another member's booking
    console.log('\n--- 12. Member cannot access another member\'s booking ---');
    res = await request(`/api/bookings/${bookingId1}`, 'GET', null, member2Token);
    console.log('Status (expect 403):', res.status);

    // 13. Member cannot cancel another member's booking
    console.log('\n--- 13. Member cannot cancel another member\'s booking ---');
    res = await request(`/api/bookings/${bookingId1}/cancel`, 'PATCH', null, member2Token);
    console.log('Status (expect 403):', res.status);

    // 14. Member cannot change booking status
    console.log('\n--- 14. Member cannot change booking status ---');
    res = await request(`/api/bookings/${bookingId1}/status`, 'PATCH', { status: 'COMPLETED' }, member1Token);
    console.log('Status (expect 403):', res.status); // authorize['ADMIN'] blocks it

    // 5. Member can cancel own booking
    console.log('\n--- 5. Member can cancel own booking ---');
    res = await request(`/api/bookings/${bookingId1}/cancel`, 'PATCH', null, member1Token);
    console.log('Status (expect 200):', res.status);

    // 7. availableSlots increases after cancellation
    console.log('\n--- 7. availableSlots increases after cancellation ---');
    schedCheck = await request(`/api/schedules/${scheduleId}`, 'GET');
    console.log('Slots (expect 2):', schedCheck.body.availableSlots);

    // 21. Cancelled booking can be followed by a new booking for the same schedule
    console.log('\n--- 21. Rebook after cancellation ---');
    res = await request('/api/bookings', 'POST', { scheduleId }, member1Token);
    console.log('Status (expect 201):', res.status);
    const newBookingId = res.body.booking.id;

    // Member 2 books the last slot
    res = await request('/api/bookings', 'POST', { scheduleId }, member2Token);
    console.log('Member 2 books slot. Status (expect 201):', res.status);

    // 9. Full class booking is rejected
    console.log('\n--- 9. Full class booking is rejected ---');
    const memberRes3 = await request('/api/auth/register', 'POST', { email: 'member3@test.com', password: 'password123', firstName: 'M3', lastName: 'L' });
    res = await request('/api/bookings', 'POST', { scheduleId }, memberRes3.body.token);
    console.log('Status (expect 409):', res.status);

    // 10. Cancelled schedule booking is rejected
    console.log('\n--- 10. Cancelled schedule booking is rejected ---');
    res = await request('/api/bookings', 'POST', { scheduleId: cancelledScheduleId }, member1Token);
    console.log('Status (expect 400):', res.status);

    // 11. Past schedule booking is rejected
    console.log('\n--- 11. Past schedule booking is rejected ---');
    res = await request('/api/bookings', 'POST', { scheduleId: pastScheduleId }, member1Token);
    console.log('Status (expect 400):', res.status);

    // 15. Admin can view all bookings
    console.log('\n--- 15. Admin can view all bookings ---');
    res = await request('/api/bookings', 'GET', null, adminToken);
    console.log('Status (expect 200):', res.status, 'Count:', res.body.length);

    // 16. Admin can update booking status
    console.log('\n--- 16. Admin can update booking status ---');
    res = await request(`/api/bookings/${newBookingId}/status`, 'PATCH', { status: 'COMPLETED' }, adminToken);
    console.log('Status (expect 200):', res.status);

    // 17. Invalid schedule ID is rejected
    console.log('\n--- 17. Invalid schedule ID is rejected ---');
    res = await request('/api/bookings', 'POST', { scheduleId: 'invalid-uuid' }, member1Token);
    console.log('Status (expect 400):', res.status);

    // 18. Invalid booking data is rejected
    console.log('\n--- 18. Invalid booking data is rejected ---');
    res = await request(`/api/bookings/${newBookingId}/status`, 'PATCH', { status: 'INVALID_STATUS' }, adminToken);
    console.log('Status (expect 400):', res.status);

    // 22. Concurrent booking attempts
    console.log('\n--- 22. Concurrent booking attempts ---');
    // We create a new schedule with 1 capacity
    const concClassRes = await request('/api/classes', 'POST', { name: 'Conc', description: 'C', type: 'C', capacity: 1, duration: 60 }, adminToken);
    const concSchedRes = await request('/api/schedules', 'POST', { classId: concClassRes.body.class.id, trainerId, date: futureTime.toISOString(), day: 'Mon', startTime: futureTime.toISOString(), endTime: futureEndTime.toISOString() }, adminToken);
    const concSchedId = concSchedRes.body.schedule.id;

    const p1 = request('/api/bookings', 'POST', { scheduleId: concSchedId }, member1Token);
    const p2 = request('/api/bookings', 'POST', { scheduleId: concSchedId }, member2Token);
    const [res1, res2] = await Promise.all([p1, p2]);

    console.log('Concurrent Status 1:', res1.status);
    console.log('Concurrent Status 2:', res2.status);
    console.log('One should be 201, the other 409 (Class is full)');

    // 19/20 are tested by virtue of the capacity block and restoration logic.
    console.log('\n--- Tests Complete ---');
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
