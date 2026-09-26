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

    // Admin
    const adminRes = await request('/api/auth/register', 'POST', { email: 'admin@test.com', password: 'password123', firstName: 'Admin', lastName: 'User' });
    await prisma.user.update({ where: { id: adminRes.body.user.id }, data: { role: 'ADMIN' } });
    const adminLogin = await request('/api/auth/login', 'POST', { email: 'admin@test.com', password: 'password123' });
    const adminToken = adminLogin.body.token;

    // Member
    const mRes1 = await request('/api/auth/register', 'POST', { email: 'm1@test.com', password: 'password123', firstName: 'Member', lastName: 'One' });
    const m1Token = mRes1.body.token;
    const m1Id = mRes1.body.user.id;

    // Trainer
    const tRes1 = await request('/api/auth/register', 'POST', { email: 't1@test.com', password: 'password123', firstName: 'Trainer', lastName: 'One' });
    await prisma.user.update({ where: { id: tRes1.body.user.id }, data: { role: 'TRAINER' } });
    const t1Login = await request('/api/auth/login', 'POST', { email: 't1@test.com', password: 'password123' });
    const trainerToken = t1Login.body.token;


    console.log('\n--- Test 1: Admin can list users ---');
    let res = await request('/api/users', 'GET', null, adminToken);
    console.log('Status (expect 200):', res.status, 'Count:', res.body.length);

    console.log('\n--- Test 2: Admin can get user by ID ---');
    res = await request(`/api/users/${m1Id}`, 'GET', null, adminToken);
    console.log('Status (expect 200):', res.status);
    console.log('Returned passwordHash? (expect undefined):', res.body.passwordHash);

    console.log('\n--- Test 3: Admin can update user ---');
    res = await request(`/api/users/${m1Id}`, 'PATCH', { firstName: 'Updated' }, adminToken);
    console.log('Status (expect 200):', res.status);
    console.log('Name changed? (expect true):', res.body.user.firstName === 'Updated');

    console.log('\n--- Test 4: Admin can deactivate user (safe delete strategy) ---');
    res = await request(`/api/users/${m1Id}`, 'DELETE', null, adminToken);
    console.log('Delete/Deactivate Status (expect 200):', res.status);
    console.log('User is deactivated? (expect false isActive):', res.body.user.isActive === false);

    console.log('\n--- Test 5: Member cannot list users ---');
    res = await request('/api/users', 'GET', null, m1Token);
    console.log('Status (expect 403):', res.status);

    console.log('\n--- Test 6: Member cannot get another user ---');
    res = await request(`/api/users/${adminRes.body.user.id}`, 'GET', null, m1Token);
    console.log('Status (expect 403):', res.status);

    console.log('\n--- Test 7: Member cannot update user ---');
    res = await request(`/api/users/${m1Id}`, 'PATCH', { role: 'ADMIN' }, m1Token);
    console.log('Status (expect 403):', res.status);

    console.log('\n--- Test 8: Member cannot delete user ---');
    res = await request(`/api/users/${m1Id}`, 'DELETE', null, m1Token);
    console.log('Status (expect 403):', res.status);

    console.log('\n--- Test 9: Trainer cannot access admin user management ---');
    res = await request('/api/users', 'GET', null, trainerToken);
    console.log('Trainer list users status (expect 403):', res.status);
    res = await request(`/api/users/${m1Id}`, 'PATCH', { firstName: 'Hacked' }, trainerToken);
    console.log('Trainer edit user status (expect 403):', res.status);

    console.log('\n--- Test 10: Invalid/Missing JWT rejected ---');
    res = await request('/api/users', 'GET', null, 'fake-jwt');
    console.log('Invalid JWT Status (expect 401):', res.status);
    res = await request('/api/users', 'GET');
    console.log('Missing JWT Status (expect 401):', res.status);

    console.log('\n--- Test 11: Unknown user returns 404 ---');
    res = await request('/api/users/00000000-0000-0000-0000-000000000000', 'GET', null, adminToken);
    console.log('Status (expect 404):', res.status);

    console.log('\n--- Test 12: Invalid email validation ---');
    res = await request(`/api/users/${m1Id}`, 'PATCH', { email: 'not-an-email' }, adminToken);
    console.log('Status (expect 400):', res.status);

    console.log('\n--- Test 13: Invalid role validation ---');
    res = await request(`/api/users/${m1Id}`, 'PATCH', { role: 'SUPERMAN' }, adminToken);
    console.log('Status (expect 400):', res.status);

    console.log('\n--- Test 14: Duplicate email rejected ---');
    res = await request(`/api/users/${m1Id}`, 'PATCH', { email: 't1@test.com' }, adminToken);
    console.log('Status (expect 409):', res.status);
    
    console.log('\n--- Test 15: Last admin cannot be deleted ---');
    res = await request(`/api/users/${adminRes.body.user.id}`, 'DELETE', null, adminToken);
    console.log('Delete last admin status (expect 400):', res.status);

    console.log('\n--- Tests Complete ---');
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
