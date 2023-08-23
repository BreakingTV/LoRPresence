const DiscordRPC = require('discord-rpc');
const rpc = new DiscordRPC.Client({transport: 'ipc'});
const {clientId, port} = require('../config/config.json');
const { setActivity } = require('./components/RPC.js');
const { pushData } = require("./components/getChampions");

rpc.on('ready', () => {
    //setActivity(rpc, port);
    pushData().then(r => console.log(r));

    setInterval(() => {
        //setActivity(rpc, port);
    }, 15e3);
});


rpc.login({clientId: clientId}).catch(console.error);