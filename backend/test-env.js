require('dotenv').config();

console.log('Testing environment variables...');
console.log('MONGODB_URI length:', process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 'undefined');
console.log('MONGODB_URI preview:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 100) : 'undefined');
console.log('All env vars starting with MONGODB:');
Object.keys(process.env).filter(key => key.startsWith('MONGODB')).forEach(key => {
  console.log(`${key}: ${process.env[key]}`);
}); 