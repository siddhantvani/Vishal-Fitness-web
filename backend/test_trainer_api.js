const http = require('http');

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

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Clean up
    await prisma.user.deleteMany({ where: { email: { contains: 'test.com' } } });

    console.log('--- Registering Member ---');
    const memRes = await request('/api/auth/register', 'POST', {
      email: `member@test.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'Member'
    });
    const memberToken = memRes.body.token;

    console.log('--- Registering Admin ---');
    const adminRes = await request('/api/auth/register', 'POST', {
      email: `admin@test.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'Admin'
    });
    const adminToken = adminRes.body.token;
    const adminId = adminRes.body.user.id;

    // Elevate admin in DB
    await prisma.user.update({ where: { id: adminId }, data: { role: 'ADMIN' } });

    // Login again to get a fresh token with ADMIN role
    const adminLogin = await request('/api/auth/login', 'POST', {
      email: `admin@test.com`,
      password: 'password123'
    });
    const freshAdminToken = adminLogin.body.token;

    let createdTrainerId;

    // 8. Test Member restriction
    console.log('\n--- 8. Test Member Cannot Create Trainer ---');
    const failCreate = await request('/api/trainers', 'POST', {
      email: 'trainer1@test.com',
      firstName: 'John',
      lastName: 'Doe',
    }, memberToken);
    console.log('Status (expect 403):', failCreate.status);

    // 5. Test Admin create trainer
    console.log('\n--- 5. Test Admin Create Trainer ---');
    const successCreate = await request('/api/trainers', 'POST', {
      email: 'trainer1@test.com',
      firstName: 'John',
      lastName: 'Doe',
      specialization: 'Yoga',
      experience: 5
    }, freshAdminToken);
    console.log('Status (expect 201):', successCreate.status);
    createdTrainerId = successCreate.body.trainer.id;

    // 9. Test Invalid Request Validation
    console.log('\n--- 9. Test Invalid Request Validation ---');
    const invalidCreate = await request('/api/trainers', 'POST', {
      email: 'not-an-email',
      firstName: 'A'
    }, freshAdminToken);
    console.log('Status (expect 400):', invalidCreate.status);

    // 3. Test GET /api/trainers
    console.log('\n--- 3. Test GET /api/trainers ---');
    const getAll = await request('/api/trainers', 'GET');
    console.log('Status (expect 200):', getAll.status, 'Count:', getAll.body.length);

    // 4. Test GET /api/trainers/:id
    console.log('\n--- 4. Test GET /api/trainers/:id ---');
    const getOne = await request(`/api/trainers/${createdTrainerId}`, 'GET');
    console.log('Status (expect 200):', getOne.status, 'Name:', getOne.body.firstName);

    // 10. Test Trainer Not Found
    console.log('\n--- 10. Test Trainer Not Found ---');
    const notFound = await request(`/api/trainers/not-a-real-id`, 'GET');
    console.log('Status (expect 404):', notFound.status);

    // 6. Test Admin update trainer
    console.log('\n--- 6. Test Admin Update Trainer ---');
    const updateRes = await request(`/api/trainers/${createdTrainerId}`, 'PATCH', {
      specialization: 'Advanced Yoga',
      experience: 6
    }, freshAdminToken);
    console.log('Status (expect 200):', updateRes.status);
    console.log('Updated Specialization:', updateRes.body.trainer.specialization);

    // 7. Test Admin delete trainer
    console.log('\n--- 7. Test Admin Delete Trainer ---');
    const deleteRes = await request(`/api/trainers/${createdTrainerId}`, 'DELETE', null, freshAdminToken);
    console.log('Status (expect 200):', deleteRes.status);

  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
