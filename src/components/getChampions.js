/* TODO: Update Code, use cashed data */
const fs = require('fs');

/*
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
 */

async function pushData() {
    let set = 0;
    let setNotFound = false;
    let data = [];

    while (true) {
        set++;
        let championData = await fetch('https://dd.b.pvp.net/latest/set' + set + '/en_us/data/set' + set + '-en_us.json').then(async r => {
            if (r.status !== 403) return r.json();
            else setNotFound = true;
        });


        data.push(championData);
        if (setNotFound) {
            /* Exceptions, if a new sub set comes out, this code needs to be updated */
            let set6cde = await fetch('https://dd.b.pvp.net/latest/set6cde/en_us/data/set6cde-en_us.json').then(async r => r.json());
            let set7 = await fetch('https://dd.b.pvp.net/latest/set7b/en_us/data/set7b-en_us.json').then(async r => r.json());
            data.push(set6cde, set7);
            break;
        }
    }

    /* TODO: Create Database and put the data in there */
    fs.writeFile('data.json', JSON.stringify(data), 'utf8', (err) => err);
}

exports.pushData = pushData;