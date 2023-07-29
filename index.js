/*
* TODO: Better API calling
* TODO: Clean Up code
* TODO: Images for Game States
* TODO: Better way of getting Champions
*/

const DiscordRPC = require('discord-rpc');
const GameInfo = require('./GameInfoManager');
const rpc = new DiscordRPC.Client({transport: 'ipc'});
const {clientId} = require('./config.json');
const {DeckEncoder} = require('runeterra');

async function setActivity() {
    const GameState = await GameInfo.callLocalAPI('positional-rectangles').then(r => {return r['GameState']});

    if (GameState === 'InProgress') {
        let GameMode;
        let champions
        if (await GameInfo.callLocalAPI('static-decklist').then(r => {return r['DeckCode']}) === null && GameInfo.callLocalAPI('static-decklist').then(r => {return r['CardsInDeck']}) !== null) {
            GameMode = 'Path of Champions'
            champions = 'WORK IN PROGRESS';
        } else champions = await getDeckChampions(await GameInfo.callLocalAPI('static-decklist').then(r => {return r['DeckCode']}));


        rpc.setActivity({
            details: 'Playing: ' + GameMode,
            state: 'Deck Champions: WORK IN PROGRESS',
            largeImageKey: '01fr009',
            smallImageKey: 'Verto',
            startTimestamp: 0,
        });
    } else {
        const GameResult = await GameInfo.callLocalAPI('game-result').then(r => {return r['GameID']});

        rpc.setActivity({
            details: 'In Menu',
            state: 'Games played: ' + (GameResult + 1),
            startTimestamp: 0,
        });
    }

}

async function getDeckChampions(deckCode) {
    let champions = [];
    const deck = DeckEncoder.decode(deckCode);
    for (let index = 0; index < deck.length; index++) {
        const e = deck[index]
        let set = e.code.slice(1, 2);

        // TODO: Find a better solution, what is this???
        let t = await GameInfo.callSetData(set).then(r => {return r.filter(r => r.rarity === 'Champion' && r.cardCode === e.code)});
        if (set === '6' && t.length === 0) {
            t = await GameInfo.callSetData(set + 'cde').then(r => {return r.filter(r => r.rarity === 'Champion' && r.cardCode === e.code)});
        } else if (set === '7' && t.length === 0) {
            t = await GameInfo.callSetData(set + 'b').then(r => {return r.filter(r => r.rarity === 'Champion' && r.cardCode === e.code)});
        }
        if (t.length !== 0) champions.push(t);


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