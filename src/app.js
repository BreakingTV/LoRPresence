const DiscordRPC = require('discord-rpc');
const rpc = new DiscordRPC.Client({transport: 'ipc'});
const {clientId, port} = require('../config/config.json');
const { setActivity } = require('./components/RPC.js');

rpc.on('ready', () => {
    setActivity(rpc, port);

    setInterval(() => {
        setActivity(rpc, port);
    }, 15e3);
});


rpc.login({clientId: clientId}).catch(console.error);