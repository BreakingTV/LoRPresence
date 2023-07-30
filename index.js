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
const {callLocalAPI} = require("./GameInfoManager");

async function setActivity() {
    const positionalRectangles =  await fetch('http://127.0.0.1:21337/positional-rectangles').then(r=> r.json() ).catch((e => { console.log('Local Api not found! Is the game running?'); throw new Error(e); }));
    const staticDeckList = await fetch('http://127.0.0.1:21337/static-decklist').then(r=> r.json()).catch((e => { console.log('Local Api not found! Is the game running?'); throw new Error(e); }));

    console.log(await getDeckChampions('CUCQCAYJEMAQICINAECQSCADAYFBUHZMAUDASEARDUPSGAYBAMERWAIGBEEACBQMAEAQCBQJF4'));

    const GameState = positionalRectangles['GameState'];
    if (GameState === 'InProgress') {
        let GameMode = 'Standard (Ranked)';
        let champions = await getDeckChampions(staticDeckList['DeckCode']);
        if (await staticDeckList['DeckCode'] === null && staticDeckList['CardsInDeck'] !== null) {
            GameMode = 'Path of Champions';
            champions = 'WORK IN PROGRESS';
        }

        await rpc.setActivity({
            details: 'Playing: ' + GameMode,
            state: 'Deck Champions: WORK IN PROGRESS',
            largeImageKey: '01fr009',
            smallImageKey: 'Verto',
            startTimestamp: 0,
        });
    } else {
        const GameResult = await GameInfo.callLocalAPI('game-result').then(r => {return r['GameID']});

        await rpc.setActivity({
            details: 'In Menu',
            state: 'Games played: ' + (GameResult + 1),
            startTimestamp: 0,
        });
    }

}

async function getDeckChampions(deckCode) {
    let filteredChampionData = [];
    const deck = DeckEncoder.decode(deckCode);
    for (let i = 0; i < deck.length; i++) {
        let championData = await callSetData(6);
        if (championData.length !== 0) filteredChampionData.push(championData);
    }

    return filteredChampionData;
}

async function callSetData(set) {
    let response = [];
    let data = await fetch('https://dd.b.pvp.net/latest/set' + set + '/en_us/data/set' + set + '-en_us.json').then(r => r.json());
    response.push(data[0]);

    if (set === 6) {
        let set6cde = await fetch('https://dd.b.pvp.net/latest/set6cde/en_us/data/set6cde-en_us.json').then(r => r.json());
        response.push(set6cde[0]);
    } else if (set === 7) {
        let set7b = await fetch('https://dd.b.pvp.net/latest/set7b/en_us/data/set7b-en_us.json').then(r => r.json());
        response.push(set7b[0]);
    }
    return response;
}



rpc.on('ready', () => {
    setActivity();

    setInterval(() => {
        setActivity();
    }, 15e3);
});

setActivity();
//rpc.login({clientId: clientId}).catch(console.error);