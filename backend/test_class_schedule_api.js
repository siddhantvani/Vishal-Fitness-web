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
    // Clean up
    await prisma.schedule.deleteMany({});
    await prisma.class.deleteMany({});
    await prisma.user.deleteMany({ where: { email: { contains: 'test.com' } } });

    console.log('--- Setup ---');
    const memberRes = await request('/api/auth/register', 'POST', {
      email: `member@test.com`, password: 'password123', firstName: 'Test', lastName: 'Member'
    });
    const memberToken = memberRes.body.token;

    const adminRes = await request('/api/auth/register', 'POST', {
      email: `admin@test.com`, password: 'password123', firstName: 'Test', lastName: 'Admin'
    });
    await prisma.user.update({ where: { id: adminRes.body.user.id }, data: { role: 'ADMIN' } });
    const adminLogin = await request('/api/auth/login', 'POST', { email: `admin@test.com`, password: 'password123' });
    const adminToken = adminLogin.body.token;

    const trainerRes = await request('/api/trainers', 'POST', {
      email: 'trainer@test.com', firstName: 'John', lastName: 'Doe'
    }, adminToken);
    const trainerId = trainerRes.body.trainer.id;

    const inactiveTrainerRes = await request('/api/trainers', 'POST', {
      email: 'inactive@test.com', firstName: 'Jane', lastName: 'Doe', isActive: false
    }, adminToken);
    const inactiveTrainerId = inactiveTrainerRes.body.trainer.id;

    let classId, scheduleId;

    // 10. Member cannot create class
    console.log('\n--- 10. Member Cannot Create Class ---');
    let res = await request('/api/classes', 'POST', { name: 'Yoga', description: 'Yoga class', type: 'YOGA', capacity: 20, duration: 60 }, memberToken);
    console.log('Status (expect 403):', res.status);

    // 4. Admin creates class
    console.log('\n--- 4. Admin Creates Class ---');
    res = await request('/api/classes', 'POST', { name: 'Yoga', description: 'Yoga class', type: 'YOGA', capacity: 20, duration: 60 }, adminToken);
    console.log('Status (expect 201):', res.status);
    classId = res.body.class.id;

    // 12. Invalid class data is rejected
    console.log('\n--- 12. Invalid Class Data Rejected ---');
    res = await request('/api/classes', 'POST', { name: 'Yoga', capacity: -10 }, adminToken);
    console.log('Status (expect 400):', res.status);

    // 5. Admin updates class
    console.log('\n--- 5. Admin Updates Class ---');
    res = await request(`/api/classes/${classId}`, 'PATCH', { capacity: 25 }, adminToken);
    console.log('Status (expect 200):', res.status);

    // 2. GET classes
    console.log('\n--- 2. GET Classes ---');
    res = await request('/api/classes', 'GET');
    console.log('Status (expect 200):', res.status, 'Count:', res.body.length);

    // 3. GET class by ID
    console.log('\n--- 3. GET Class by ID ---');
    res = await request(`/api/classes/${classId}`, 'GET');
    console.log('Status (expect 200):', res.status, 'Name:', res.body.name);

    // 11. Member cannot create schedule
    console.log('\n--- 11. Member Cannot Create Schedule ---');
    res = await request('/api/schedules', 'POST', { classId, trainerId, date: new Date().toISOString(), day: 'Monday', startTime: new Date().toISOString(), endTime: new Date(Date.now() + 3600000).toISOString() }, memberToken);
    console.log('Status (expect 403):', res.status);

    // 13. Invalid schedule data is rejected (end time before start time)
    console.log('\n--- 13. Invalid Schedule Data Rejected ---');
    res = await request('/api/schedules', 'POST', { classId, trainerId, date: new Date().toISOString(), day: 'Monday', startTime: new Date(Date.now() + 3600000).toISOString(), endTime: new Date().toISOString() }, adminToken);
    console.log('Status (expect 400):', res.status);

    // 14. Non-existent trainer is rejected
    console.log('\n--- 14. Non-existent Trainer Rejected ---');
    res = await request('/api/schedules', 'POST', { classId, trainerId: '00000000-0000-0000-0000-000000000000', date: new Date().toISOString(), day: 'Monday', startTime: new Date().toISOString(), endTime: new Date(Date.now() + 3600000).toISOString() }, adminToken);
    console.log('Status (expect 404):', res.status);

    // 15. Non-existent class is rejected
    console.log('\n--- 15. Non-existent Class Rejected ---');
    res = await request('/api/schedules', 'POST', { classId: '00000000-0000-0000-0000-000000000000', trainerId, date: new Date().toISOString(), day: 'Monday', startTime: new Date().toISOString(), endTime: new Date(Date.now() + 3600000).toISOString() }, adminToken);
    console.log('Status (expect 404):', res.status);

    // 16. Inactive trainer cannot be assigned
    console.log('\n--- 16. Inactive Trainer Cannot Be Assigned ---');
    res = await request('/api/schedules', 'POST', { classId, trainerId: inactiveTrainerId, date: new Date().toISOString(), day: 'Monday', startTime: new Date().toISOString(), endTime: new Date(Date.now() + 3600000).toISOString() }, adminToken);
    console.log('Status (expect 400):', res.status);

    // 6. Admin creates schedule
    console.log('\n--- 6. Admin Creates Schedule ---');
    res = await request('/api/schedules', 'POST', { classId, trainerId, date: new Date().toISOString(), day: 'Monday', startTime: new Date().toISOString(), endTime: new Date(Date.now() + 3600000).toISOString() }, adminToken);
    console.log('Status (expect 201):', res.status);
    scheduleId = res.body.schedule.id;

    // 7. Admin updates schedule
    console.log('\n--- 7. Admin Updates Schedule ---');
    res = await request(`/api/schedules/${scheduleId}`, 'PATCH', { day: 'Tuesday' }, adminToken);
    console.log('Status (expect 200):', res.status);

    // 8. Admin deletes schedule
    console.log('\n--- 8. Admin Deletes Schedule ---');
    res = await request(`/api/schedules/${scheduleId}`, 'DELETE', null, adminToken);
    console.log('Status (expect 200):', res.status);

    // 9. Admin deletes class
    console.log('\n--- 9. Admin Deletes Class ---');
    res = await request(`/api/classes/${classId}`, 'DELETE', null, adminToken);
    console.log('Status (expect 200):', res.status);

  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
