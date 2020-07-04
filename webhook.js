const http = require('http');
const crypto = require('crypto');
const exec = require('child_process').exec;
const webhookSecret = process.env.WEBHOOK_SECRET;
const pathOfRepo = process.env.REPO_PATH;
const port = process.env.OPEN_PORT;

http.createServer((req, res) => {
   req.on('data', (chunk) => {
       console.log('request received');
       let sig = `sha1=${crypto.createHmac('sha1', webhookSecret).update(chunk.toString()).digest('hex')}`;
       if (req.headers['x-hub-signature'] == sig) {
           console.log('Remote repo has been updated, pulling updates and restarting server...');
           exec(`cd ${pathOfRepo} && git reset --hard HEAD && git pull`, (err, stdout, stderr) => {
               console.log('Err', err);
               console.log('stdout', stdout);
               console.log('stderr', stderr);
           });
       } else {
          console.log(JSON.stringify(req));
       }
   });

   res.end();
}).listen(port);
