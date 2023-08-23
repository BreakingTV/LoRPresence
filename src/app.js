const DiscordRPC = require('discord-rpc');
const rpc = new DiscordRPC.Client({transport: 'ipc'});
const {clientId, port} = require('../config/config.json');
const { setActivity } = require('./components/activity.js');
const { pushData, checkData } = require("./components/getCardData");

/*
rpc.on('ready', () => {
    //setActivity(rpc, port);
    checkData().then(r => console.log(r));

    setInterval(() => {
        //setActivity(rpc, port);
    }, 15e3);
});
*/
checkData();
//rpc.login({clientId: clientId}).catch(console.error);