const DiscordRPC = require('discord-rpc');
const rpc = new DiscordRPC.Client({transport: 'ipc'});
const {clientId, port} = require('../config/config.json');
const { setActivity } = require('./components/activity.js');
const {checkData} = require("./components/getCardData");

rpc.on('ready', () => {
    checkData().then(r => setActivity(rpc, port).then(r => console.log('RPC started, enjoy!')));


    setInterval(() => {
        setActivity(rpc, port);
    }, 15e3);
});

rpc.login({clientId: clientId}).catch(console.error);