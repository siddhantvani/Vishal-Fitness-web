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
    const m1Id = mRes1.body.user.id;

    const mRes2 = await request('/api/auth/register', 'POST', { email: 'm2@test.com', password: 'password123', firstName: 'M2', lastName: 'L' });
    const m2Token = mRes2.body.token;

    // Admin
    const adminRes = await request('/api/auth/register', 'POST', { email: 'admin@test.com', password: 'password123', firstName: 'A', lastName: 'L' });
    await prisma.user.update({ where: { id: adminRes.body.user.id }, data: { role: 'ADMIN' } });
    const adminLogin = await request('/api/auth/login', 'POST', { email: 'admin@test.com', password: 'password123' });
    const adminToken = adminLogin.body.token;

    // Trainer
    const tempT1 = await request('/api/auth/register', 'POST', { email: 'tlogin1@test.com', password: 'password123', firstName: 'T', lastName: 'L' });
    await prisma.user.update({ where: { id: tempT1.body.user.id }, data: { role: 'TRAINER' } });
    const t1Login = await request('/api/auth/login', 'POST', { email: 'tlogin1@test.com', password: 'password123' });
    const trainerToken = t1Login.body.token;
    
    // Assign trainer to Member 1 via workout
    await request('/api/workouts', 'POST', { title: 'Day 1', memberId: m1Id }, trainerToken);

    let progressId;

    console.log('\n--- Test 1: Member creates own progress ---');
    let res = await request('/api/progress', 'POST', { weight: 75.5, height: 180, bodyFatPercentage: 15.2, notes: 'Feeling good' }, m1Token);
    console.log('Status (expect 201):', res.status);
    progressId = res.body.progress.id;

    console.log('\n--- Test 2: Member views own progress ---');
    res = await request('/api/progress', 'GET', null, m1Token);
    console.log('Status (expect 200):', res.status, 'Count:', res.body.length);

    console.log('\n--- Test 3: Member cannot access another member\'s progress ---');
    res = await request(`/api/progress/${progressId}`, 'GET', null, m2Token);
    console.log('Status (expect 403):', res.status);

    console.log('\n--- Test 4: Member cannot create progress for another member ---');
    // We try to pass another memberId in the payload. The controller ignores it and uses the token's userId.
    res = await request('/api/progress', 'POST', { weight: 80, height: 180, memberId: m1Id }, m2Token);
    console.log('Status (expect 201, but belongs to m2):', res.status);
    console.log('Belongs to m2? (expect true):', res.body.progress.memberId !== m1Id);

    console.log('\n--- Test 5: Member update/delete ownership ---');
    res = await request(`/api/progress/${progressId}`, 'PATCH', { weight: 74 }, m2Token);
    console.log('Update Status (expect 403):', res.status);
    res = await request(`/api/progress/${progressId}`, 'DELETE', null, m2Token);
    console.log('Delete Status (expect 403):', res.status);
    res = await request(`/api/progress/${progressId}`, 'PATCH', { weight: 74 }, m1Token);
    console.log('Self Update Status (expect 200):', res.status);

    console.log('\n--- Test 6: Trainer authorization ---');
    res = await request(`/api/progress?memberId=${m1Id}`, 'GET', null, trainerToken);
    console.log('Trainer views associated member progress (expect 200):', res.status);
    const m2Id = mRes2.body.user.id;
    res = await request(`/api/progress?memberId=${m2Id}`, 'GET', null, trainerToken);
    console.log('Trainer views unassociated member progress (expect 403):', res.status);
    res = await request(`/api/progress/${progressId}`, 'PATCH', { weight: 100 }, trainerToken);
    console.log('Trainer tries to update progress (expect 403):', res.status);

    console.log('\n--- Test 7: Admin access ---');
    res = await request(`/api/progress`, 'GET', null, adminToken);
    console.log('Admin views all progress (expect 200):', res.status, 'Count:', res.body.length);

    console.log('\n--- Test 8: Invalid measurements are rejected ---');
    res = await request('/api/progress', 'POST', { weight: -10, height: -180 }, m1Token);
    console.log('Status (expect 400):', res.status);
    res = await request('/api/progress', 'POST', { weight: 70, height: 180, bodyFatPercentage: 150 }, m1Token);
    console.log('Body fat > 100 Status (expect 400):', res.status);

    console.log('\n--- Test 9: Unauthenticated requests ---');
    res = await request('/api/progress', 'GET');
    console.log('Status (expect 401):', res.status);

    console.log('\n--- Test 10: Delete progress successfully ---');
    res = await request(`/api/progress/${progressId}`, 'DELETE', null, m1Token);
    console.log('Status (expect 200):', res.status);

    console.log('\n--- Tests Complete ---');
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
