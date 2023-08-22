/* TODO: Update Code, use cashed data */

async function getChampions(deckCode = null, port) {
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

exports.getChampions = getChampions;