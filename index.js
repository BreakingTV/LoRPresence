const DiscordRPC = require('discord-rpc');
const GameInfo = require('./GameInfoManager');
const rpc = new DiscordRPC.Client({transport: 'ipc'});
const {clientId} = require('./config.json');
const {DeckEncoder} = require('runeterra');

async function setActivity() {
    const GameState = await GameInfo.callLocalAPI('positional-rectangles').then(r => {return r['GameState']});
    const GameResult = await GameInfo.callLocalAPI('game-result').then(r => {return r['GameID']});
    let champions = await getDeckChampions('CIBQCAIBBIAQGCI5AECQCEICAUAQCAYJBURS4BIDBEKC2MBXI4CACAIBFUAQEAIBAECASDAIAMESCMZUHRFFAXDC');

    switch (GameState) {
        case 'Menus':
            rpc.setActivity({
                details: 'In Menu',
                state: 'Games played: ' + (GameResult + 1),
                largeImageKey: '01fr009',
                smallImageKey: 'Verto',
                startTimestamp: 0,
            });
            break;
        case 'InProgress':
            rpc.setActivity({
                details: 'In Game',
                state: 'Playing ',
                largeImageKey: '01fr009',
                smallImageKey: 'Verto',
                startTimestamp: 0,
            });
            break;
        default:
            rpc.setActivity({
                details: 'Unknown',
                state: 'Games played: ' + (GameResult + 1),
                largeImageKey: '01fr009',
                smallImageKey: 'Verto',
                startTimestamp: 0,
            });
    }

}

async function getDeckChampions(deckCode) {
    let champions = [];
    const deck = DeckEncoder.decode(deckCode);
    for (let index = 0; index < deck.length; index++) {
        const e = deck[index]
        const t = await GameInfo.callSetData(e.code.slice(1, 2)).then(r => {
            return r.filter(r => r.rarity === 'Champion' && r.cardCode === e.code)
        });
         champions.push(t);
    }
    return champions;
}

rpc.on('ready', () => {
    setActivity();

    setInterval(() => {
        setActivity();
    }, 15e3);
});

rpc.login({clientId: clientId}).catch(console.error);