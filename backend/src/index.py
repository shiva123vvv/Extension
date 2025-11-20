// This file now just runs your Python Flask app
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Team Cognitive Load Monitor API...');

// Start Python Flask server
const pythonProcess = spawn('python', ['app.py'], {
  cwd: __dirname,
  stdio: 'inherit'
});

pythonProcess.on('error', (err) => {
  console.error('Failed to start Python server:', err);
  console.log('Make sure Python and required packages are installed:');
  console.log('pip install flask flask-cors PyJWT');
});

pythonProcess.on('close', (code) => {
  console.log(`Python process exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  pythonProcess.kill();
  process.exit();
});