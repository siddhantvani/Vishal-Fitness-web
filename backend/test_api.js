const http = require('http');

const request = (path, method, data) => {
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
    if (data) {
      const payload = JSON.stringify(data);
      options.headers['Content-Length'] = payload.length;
    }
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

(async () => {
  try {
    console.log('Registering user...');
    const regRes = await request('/api/auth/register', 'POST', {
      email: 'john@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    });
    console.log('Register Response:', regRes.status, regRes.body);

    console.log('Logging in user...');
    const loginRes = await request('/api/auth/login', 'POST', {
      email: 'john@example.com',
      password: 'password123'
    });
    console.log('Login Response:', loginRes.status, loginRes.body);

    console.log('Fetching user profile (/me)...');
    const meRes = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/me',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5173',
          'Authorization': `Bearer ${loginRes.body.token}`
        }
      };
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
      });
      req.on('error', reject);
      req.end();
    });
    console.log('Me Response:', meRes.status, meRes.body);
  } catch(e) {
    console.error(e);
  }
})();
