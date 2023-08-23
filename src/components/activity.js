const { getChampions } = require('./getCardData.js');
async function setActivity(rpc, port) {
    try {
        await fetch('http://127.0.0.1:' + port);
    } catch (err) {
        throw new Error("Local API not found");
    }


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
            for (let champion of await getChampions(staticDeckList['DeckCode'], port)) {
                if (championName) championName += ', ' + champion[0]['name'];
                else championName = champion[0]['name'];
            }
        }

        await rpc.setActivity({
            details: 'Playing' + GameMode,
            state: 'Champions: ' + championName
        });
    } else {
        await rpc.setActivity({ details: 'In Menu' });
    }
}

exports.setActivity = setActivity;