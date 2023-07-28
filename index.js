const DiscordRPC = require('discord-rpc');
const GameInfo = require('./GameInfoManager');
const rpc = new DiscordRPC.Client({ transport: 'ipc' });
const { clientId } = require('./config.json');

i = 0;
async function setActivity(){
    const GameState = await GameInfo.getScreen().then(r => {
        switch (r['GameState']) {
            case 'Menus': return 'In Menu';
            case 'InProgress': return 'In Game';
            default: return 'Unknown';
        }
    });
    rpc.setActivity({
        state: GameState,
        largeImageKey: 'Trello',
        largeImageText: 'Yeto',
        smallImageKey: 'Verto',
        startTimestamp: 0,
    });
}

rpc.on('ready', () => {
    setActivity();

    setInterval(() => {
        setActivity();
    }, 15e3);
});

rpc.login({ clientId: clientId }).catch(console.error);