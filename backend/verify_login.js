const http = require('http');

const data = JSON.stringify({
  email: 'siddhantvani@gmail.com',
  password: 'Siddhant@2026'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    'Origin': 'http://localhost:5173',
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const json = JSON.parse(body);
    console.log(`Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log('Login Successful!');
      console.log(`User ID: ${json.user.id}`);
      console.log(`Role: ${json.user.role}`);
      console.log(`Token received? ${!!json.token}`);
    } else {
      console.log('Login Failed:', json);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
