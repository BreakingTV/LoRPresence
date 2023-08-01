const DiscordRPC = require('discord-rpc');
const rpc = new DiscordRPC.Client({transport: 'ipc'});
const {clientId} = require('./config.json');
const {DeckEncoder} = require('runeterra');

async function setActivity() {
    const positionalRectangles =  await fetch('http://127.0.0.1:21337/positional-rectangles').then(r=> r.json() );
    const staticDeckList = await fetch('http://127.0.0.1:21337/static-decklist').then(r=> r.json());
    const gameResult = await fetch('http://127.0.0.1:21337/game-result').then(r=> r.json());

    const GameState = positionalRectangles['GameState'];
    let champions = await getChampions(staticDeckList['DeckCode']);
    if (GameState === 'InProgress') {
        let GameMode = 'Standard (Ranked)';
        if (staticDeckList['DeckCode'] === null && staticDeckList['CardsInDeck'] !== null) {
            GameMode = 'Path of Champions';
        } else {
            champions = champions[0][0]['name'] + ' and ' + champions[1][0]['name'];
        }
        await rpc.setActivity({
            details: 'Playing: ' + GameMode,
            state: 'Champions: ' + champions,
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
    if (deckCode != null) {
    const deck = DeckEncoder.decode(deckCode);
        for (let i = 0; i < deck.length; i++) {
            let championData = await fetch('https://dd.b.pvp.net/latest/set' + deck[i].set + '/en_us/data/set' + deck[i].set + '-en_us.json').then(r => r.json().then(r => r.filter(r => r.rarity === 'Champion' && r.cardCode === deck[i].code)))
            if (championData.length === 0) {
                if (deck[i].set === 6) championData = await fetch('https://dd.b.pvp.net/latest/set' + deck[i].set + 'cde/en_us/data/set' + deck[i].set + 'cde-en_us.json').then(r => r.json().then(r => r.filter(r => r.rarity === 'Champion' && r.cardCode === deck[i].code)))
                if (deck[i].set === 7) championData = await fetch('https://dd.b.pvp.net/latest/set' + deck[i].set + 'b/en_us/data/set' + deck[i].set + 'b-en_us.json').then(r => r.json().then(r => r.filter(r => r.rarity === 'Champion' && r.cardCode === deck[i].code)))
            }
            if (championData.length !== 0) filteredChampionData.push(championData);
        }
    } else {
        filteredChampionData = 'WORK IN PROGRESS';
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