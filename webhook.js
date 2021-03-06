const http = require('http');
const crypto = require('crypto');
const exec = require('child_process').exec;
const webhookSecret = process.env.WEBHOOK_SECRET;
const pathOfRepo = process.env.REPO_PATH;
const port = process.env.OPEN_PORT;
const bot = require('./bot');
const utils = require('./utils');

http.createServer((req, res) => {
   req.on('data', (chunk) => {
       let sig = `sha1=${crypto.createHmac('sha1', webhookSecret ? webhookSecret : '').update(chunk.toString()).digest('hex')}`;
       if (req.headers['x-hub-signature'] == sig) {
           console.log('Remote repo has been updated, pulling updates and restarting server...');
           exec(`cd ${pathOfRepo} && git reset --hard HEAD && git pull`, (err, stdout, stderr) => {
               console.log('Err', err);
               console.log('stdout', stdout);
               console.log('stderr', stderr);
           });
       } else {
           messageReceived(chunk.toString());
       }
   });

   res.end();
}).listen(port);

function messageReceived(message) {
    const req = JSON.parse(message);
    const playRequest = JSON.parse(req.content);
    const args = playRequest.play.split(/ +/g);
    console.log(req, playRequest, args);
    const user = utils.findUserInGuild(playRequest.guild_id, playRequest.user_id, bot);
    bot.commands.get('play').webhookPlay(args, user, bot);
}
