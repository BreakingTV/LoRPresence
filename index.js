const DiscordRPC = require('discord-rpc');
const rpc = new DiscordRPC.Client({transport: 'ipc'});
const {clientId} = require('./config.json');
const {DeckEncoder} = require('runeterra');

async function setActivity() {
    const positionalRectangles =  await fetch('http://127.0.0.1:21337/positional-rectangles').then(r=> r.json() );
    const staticDeckList = await fetch('http://127.0.0.1:21337/static-decklist').then(r=> r.json());
    const gameResult = await fetch('http://127.0.0.1:21337/game-result').then(r=> r.json());

    const GameState = positionalRectangles['GameState'];
    if (GameState === 'InProgress') {
        let championName;
        let champions = await getChampions(staticDeckList['DeckCode']);
        let GameMode = ' against ' + positionalRectangles['OpponentName'];
        if (staticDeckList['CardsInDeck'] !== null) {
            if (staticDeckList['DeckCode'] === null) GameMode = ': Path of Champions';
            if (positionalRectangles['OpponentName'].startsWith('deck_')) GameMode = ' against AI';
            for (let champion of champions) {
                if (championName) championName += ', ' + champion[0]['name'];
                else championName = champion[0]['name'];
        }
    }

        await rpc.setActivity({
            details: 'Playing' + GameMode,
            state: 'Champions: ' + championName,
            largeImageKey: '01fr009',
            smallImageKey: 'Verto',
            startTimestamp: 0,
        });
    } else {
        const GameResult = await gameResult['GameID'];

        await rpc.setActivity({
            details: 'In Menu',
            state: 'Games played: ' + (GameResult + 1),
            startTimestamp: 0,
        });
    }

}

async function getChampions(deckCode = null) {
    let filteredChampionData = [];
    const staticDeckList = await fetch('http://127.0.0.1:21337/static-decklist').then(r=> r.json());
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
rpc.login({clientId: clientId}).catch(console.error);