const { getChampions } = require('./getCardData.js');
const {getRegionImage, getLargeImage} = require("./getAssets");

async function setActivity(rpc, port) {
    const positionalRectangles =  await fetch('http://127.0.0.1:' + port +'/positional-rectangles').then(r=> r.json());
    const staticDeckList = await fetch('http://127.0.0.1:' + port + '/static-decklist').then(r=> r.json());

    const GameState = positionalRectangles['GameState'];
    const regionImage = (await getRegionImage(GameState)).toLowerCase();
    const largeImage = await getLargeImage();
    let firstLoad;

    if (GameState === 'InProgress') {
        firstLoad = true;
        let championName;
        let GameMode = ' against ' + positionalRectangles['OpponentName'];
        if (staticDeckList['CardsInDeck'] !== null) {
            if (staticDeckList['DeckCode'] === null) GameMode = ': Path of Champions';
            if (positionalRectangles['OpponentName'].startsWith('deck')) GameMode = ' against AI';
            for (let champion of await getChampions()) {
                if (championName) championName += ', ' + champion[0]['name'];
                else championName = champion[0]['name'];
            }
        }

        if (firstLoad === true) {
            await rpc.setActivity({
                details: 'Playing' + GameMode,
                state: 'Champions: ' + championName,
                largeImageKey: largeImage,
                smallImageKey: regionImage,
            });
        }
    } else {
        firstLoad = false;
        await rpc.setActivity({
            details: 'In Menu',
            largeImageKey: largeImage,
            smallImageKey: regionImage,
        });
    }
}

module.exports = { setActivity };