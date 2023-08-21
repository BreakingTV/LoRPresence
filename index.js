const DiscordRPC = require('discord-rpc');
const rpc = new DiscordRPC.Client({transport: 'ipc'});
const {clientId, RGAPI, port} = require('./config.json');
const {DeckEncoder} = require('runeterra');

async function startup() {
    let platformData = await fetch('https://europe.api.riotgames.com/lor/status/v1/platform-data?api_key=' + RGAPI).then(r => r.json())

    if (fetch('http://127.0.0.1:' + port).then(r => r.ok)) console.log('Game is Running')
    else console.log("Game isn't Running, check if the Game is running or you have the right port in the config");
    
    if (platformData['maintenances'].length === 0) console.log('No Maintenance found, continue')
}

async function setActivity() {
    const positionalRectangles =  await fetch('http://127.0.0.1:' + port +'/positional-rectangles').then(r=> r.json());
    const staticDeckList = await fetch('http://127.0.0.1:' + port + '/static-decklist').then(r=> r.json());
    const gameResult = await fetch('http://127.0.0.1:' + port + '/game-result').then(r=> r.json());

    const GameState = positionalRectangles['GameState'];
    if (GameState === 'InProgress') {
        let championName;
        let GameMode = ' against ' + positionalRectangles['OpponentName'];
        if (staticDeckList['CardsInDeck'] !== null) {
            if (staticDeckList['DeckCode'] === null) GameMode = ': Path of Champions';
            if (positionalRectangles['OpponentName'].startsWith('deck')) GameMode = ' against AI';
            for (let champion of await getChampions(staticDeckList['DeckCode'])) {
                if (championName) championName += ', ' + champion[0]['name'];
                else championName = champion[0]['name'];
        }
    }

        await rpc.setActivity({
            details: 'Playing' + GameMode,
            state: 'Champions: ' + championName,
        });
    } else {
        const GameResult = await gameResult['GameID'];

        await rpc.setActivity({
            details: 'In Menu',
        });
    }
}

async function getChampions(deckCode = null) {
    let filteredChampionData = [];
    const staticDeckList = await fetch('http://127.0.0.1:' + port + '/static-decklist').then(r=> r.json());
    for (let key of Object.keys(staticDeckList['CardsInDeck'])) {
        let set = key.substring(1,2);
        let championData = await fetch('https://dd.b.pvp.net/latest/set' + set + '/en_us/data/set' + set + '-en_us.json').then(r => r.json().then(r => r.filter(r => r.rarity === 'Champion' && r.cardCode === key)))
        if (championData.length === 0) {
            if (set === '6') championData = await fetch('https://dd.b.pvp.net/latest/set' + set + 'cde/en_us/data/set' + set + 'cde-en_us.json').then(r => r.json().then(r => r.filter(r => r.rarity === 'Champion' && r.cardCode === key)))
            if (set === '7') championData = await fetch('https://dd.b.pvp.net/latest/set' + set + 'b/en_us/data/set' + set + 'b-en_us.json').then(r => r.json().then(r => r.filter(r => r.rarity === 'Champion' && r.cardCode === key)))
        }
        if (championData.length !== 0) filteredChampionData.push(championData);
    }
    return filteredChampionData;
}

rpc.on('ready', () => {
    setActivity();

    setInterval(() => {
        setActivity();
    }, 15e3);
});

startup().then(r => console.log('Checked everything! Presence now running'));
rpc.login({clientId: clientId}).catch(console.error);