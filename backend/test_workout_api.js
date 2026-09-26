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

    // Trainers
    const tRes1 = await request('/api/trainers', 'POST', { email: 't1@test.com', firstName: 'T1', lastName: 'L' }, adminToken);
    const t1Id = tRes1.body.trainer.id;
    // We can't login as trainer if we created via Admin, so let's update a registered user to TRAINER
    const tempT1 = await request('/api/auth/register', 'POST', { email: 'tlogin1@test.com', password: 'password123', firstName: 'T', lastName: 'L' });
    await prisma.user.update({ where: { id: tempT1.body.user.id }, data: { role: 'TRAINER' } });
    const t1Login = await request('/api/auth/login', 'POST', { email: 'tlogin1@test.com', password: 'password123' });
    const trainer1Token = t1Login.body.token;
    const trainer1Id = tempT1.body.user.id;

    const tempT2 = await request('/api/auth/register', 'POST', { email: 'tlogin2@test.com', password: 'password123', firstName: 'T2', lastName: 'L' });
    await prisma.user.update({ where: { id: tempT2.body.user.id }, data: { role: 'TRAINER' } });
    const t2Login = await request('/api/auth/login', 'POST', { email: 'tlogin2@test.com', password: 'password123' });
    const trainer2Token = t2Login.body.token;
    const trainer2Id = tempT2.body.user.id;


    console.log('\n--- Test 1: Trainer can create a workout plan for valid member ---');
    let res = await request('/api/workouts', 'POST', { title: 'Day 1', memberId: m1Id }, trainer1Token);
    console.log('Status (expect 201):', res.status);
    const workoutId = res.body.workout.id;

    console.log('\n--- Test 2: Invalid member ID is rejected ---');
    res = await request('/api/workouts', 'POST', { title: 'Day 1', memberId: '00000000-0000-0000-0000-000000000000' }, trainer1Token);
    console.log('Status (expect 404):', res.status);

    console.log('\n--- Test 3: Trainer cannot assign a workout to another trainer ---');
    res = await request('/api/workouts', 'POST', { title: 'Day 1', memberId: trainer2Id }, trainer1Token);
    console.log('Status (expect 404 - since role must be MEMBER):', res.status);

    console.log('\n--- Test 4: Member can view their own workout plan ---');
    res = await request(`/api/workouts/${workoutId}`, 'GET', null, m1Token);
    console.log('Status (expect 200):', res.status);

    console.log('\n--- Test 5: Member cannot view another member\'s workout plan ---');
    res = await request(`/api/workouts/${workoutId}`, 'GET', null, m2Token);
    console.log('Status (expect 403):', res.status);

    console.log('\n--- Test 6: Trainer can view their workout plans ---');
    res = await request(`/api/workouts`, 'GET', null, trainer1Token);
    console.log('Status (expect 200):', res.status, 'Count:', res.body.length);

    console.log('\n--- Test 7: Trainer can update their workout plan ---');
    res = await request(`/api/workouts/${workoutId}`, 'PATCH', { difficulty: 'INTERMEDIATE' }, trainer1Token);
    console.log('Status (expect 200):', res.status);

    console.log('\n--- Test 8: Another trainer cannot modify that workout plan ---');
    res = await request(`/api/workouts/${workoutId}`, 'PATCH', { difficulty: 'ADVANCED' }, trainer2Token);
    console.log('Status (expect 403):', res.status);

    console.log('\n--- Test 9: Admin can view workout plans ---');
    res = await request(`/api/workouts`, 'GET', null, adminToken);
    console.log('Status (expect 200):', res.status, 'Count:', res.body.length);

    console.log('\n--- Test 10: Admin can update workout plans ---');
    res = await request(`/api/workouts/${workoutId}`, 'PATCH', { difficulty: 'ADVANCED' }, adminToken);
    console.log('Status (expect 200):', res.status);

    console.log('\n--- Test 11: Trainer can add an exercise ---');
    res = await request(`/api/workouts/${workoutId}/exercises`, 'POST', { name: 'Squat', sets: 3, repetitions: 10, order: 1 }, trainer1Token);
    console.log('Status (expect 201):', res.status);
    const exerciseId = res.body.exercise.id;

    console.log('\n--- Test 12: Trainer can update an exercise ---');
    res = await request(`/api/workouts/${workoutId}/exercises/${exerciseId}`, 'PATCH', { sets: 4 }, trainer1Token);
    console.log('Status (expect 200):', res.status);

    console.log('\n--- Test 13: Member cannot create a workout ---');
    res = await request('/api/workouts', 'POST', { title: 'My Workout', memberId: m1Id }, m1Token);
    console.log('Status (expect 403):', res.status);

    console.log('\n--- Test 14: Member cannot modify a workout ---');
    res = await request(`/api/workouts/${workoutId}`, 'PATCH', { title: 'Hacked' }, m1Token);
    console.log('Status (expect 403):', res.status);

    console.log('\n--- Test 15: Member cannot modify exercises ---');
    res = await request(`/api/workouts/${workoutId}/exercises/${exerciseId}`, 'PATCH', { sets: 100 }, m1Token);
    console.log('Status (expect 403):', res.status);

    console.log('\n--- Test 16: Invalid sets/repetitions/duration are rejected ---');
    res = await request(`/api/workouts/${workoutId}/exercises`, 'POST', { name: 'Bench', sets: -5, repetitions: -10, duration: -100, order: 2 }, trainer1Token);
    console.log('Status (expect 400):', res.status);

    console.log('\n--- Test 17: Invalid exercise order is rejected ---');
    // Schema currently allows positive order. Passing 0 or negative should fail if z.number().positive() is used (which it is, order is positive).
    res = await request(`/api/workouts/${workoutId}/exercises`, 'POST', { name: 'Bench', sets: 3, repetitions: 10, order: 0 }, trainer1Token);
    console.log('Status (expect 400):', res.status);

    console.log('\n--- Test 18: Non-existent workout ID is rejected ---');
    res = await request(`/api/workouts/00000000-0000-0000-0000-000000000000`, 'PATCH', { title: 'Test' }, trainer1Token);
    console.log('Status (expect 404):', res.status);

    console.log('\n--- Test 19: Non-existent exercise ID is rejected ---');
    res = await request(`/api/workouts/${workoutId}/exercises/00000000-0000-0000-0000-000000000000`, 'PATCH', { sets: 5 }, trainer1Token);
    console.log('Status (expect 404):', res.status);

    console.log('\n--- Test 20: Trainer can delete an exercise ---');
    res = await request(`/api/workouts/${workoutId}/exercises/${exerciseId}`, 'DELETE', null, trainer1Token);
    console.log('Status (expect 200):', res.status);

    console.log('\n--- Test 21: Deleting a workout does not leave orphan exercises ---');
    // First add an exercise back
    await request(`/api/workouts/${workoutId}/exercises`, 'POST', { name: 'Squat', sets: 3, repetitions: 10, order: 1 }, trainer1Token);
    
    // Delete workout
    res = await request(`/api/workouts/${workoutId}`, 'DELETE', null, trainer1Token);
    console.log('Workout Delete Status (expect 200):', res.status);
    
    // Verify exercise is gone
    const orphans = await prisma.workoutExercise.findMany({ where: { workoutId } });
    console.log('Orphan exercises count (expect 0):', orphans.length);

    console.log('\n--- Tests Complete ---');
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
