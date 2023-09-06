const DiscordRPC = require('discord-rpc');
const rpc = new DiscordRPC.Client({transport: 'ipc'});
const { clientId, port } = require('../config/config.json');
const { setActivity } = require('./components/activity.js');
const { checkData } = require("./components/getCardData");
const {getRegionImage} = require("./getAssets");

rpc.on('ready', () => {
    checkData().then(r => setActivity(rpc, port).then(r => console.log('RPC started, enjoy!')));


    setInterval(() => {
        try {
            fetch('http://127.0.0.1:' + port);
            setActivity(rpc, port);
        } catch (err) {
            throw new Error("Local API not found // Game probably closed");
        }
    }, 15e3);
});

rpc.login({clientId: clientId}).catch(console.error);