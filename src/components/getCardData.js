const fs = require('fs');

async function getChampions(port){
    return await new Promise((res) => {
        let filteredChampionData = [];
        return fs.readFile('data.json', 'utf8', async (err, data) => {
            const staticDeckList = await fetch('http://127.0.0.1:' + port + '/static-decklist').then(r => r.json());
            for (let card of Object.keys(staticDeckList['CardsInDeck'])) {
                let cardSet = card.substring(1, 2);
                let JSONData = JSON.parse(data);
                let championData;

                if (card === '7') championData = JSONData[8].filter(r => r['rarity'] === 'Champion' && r['cardCode'] === card)
                else championData = JSONData[cardSet].filter(r => r['rarity'] === 'Champion' && r['cardCode'] === card)

                if (championData.length === 0) {
                    if (cardSet === '6') championData = JSONData[7].filter(r => r['rarity'] === 'Champion' && r['cardCode'] === card)
                    if (cardSet === '7') championData = JSONData[8].filter(r => r['rarity'] === 'Champion' && r['cardCode'] === card)
                }
                //console.log(championData);
                if (championData.length !== 0) filteredChampionData.push(championData);
            }
            return res(filteredChampionData);
        })
    });
}

async function checkData() {
    let set = await getLatestSet();
    if (fs.existsSync('data.json')) {
        fs.readFile('data.json', 'utf8', async (err, data) => {
            if (JSON.parse(data)[0]['latestSet'] !== set) await pushData();
            else console.log("Files are up-to-date, continue")
        })
    } else await pushData();
}

async function pushData() {
    console.log("data.json not up-to-date or does not exist, updating")

    let set = 1;
    let latestSet = await getLatestSet();
    let data = [{"latestSet": latestSet}];

    let setNotFound = false;
    while (set <= latestSet) {
        let championData = await fetch('https://dd.b.pvp.net/latest/set' + set + '/en_us/data/set' + set + '-en_us.json').then(async r => {
            if (r.status !== 403) return r.json();
            else setNotFound = true;
        });

        data.push(championData);
        /* Find a new way */
        if (set === 6) {
            let set6cde = await fetch('https://dd.b.pvp.net/latest/set6cde/en_us/data/set6cde-en_us.json').then(async r => r.json());
            data.push(set6cde);
        } if (set === 7) {
            let set7 = await fetch('https://dd.b.pvp.net/latest/set7b/en_us/data/set7b-en_us.json').then(async r => r.json());
            data.push(set7);
        }

        if (setNotFound) break;
        set++;
    }

    /* TODO: Create Database and put the data in there */
    fs.writeFile('data.json', JSON.stringify(data), 'utf8', (err) => err);
}

async function getLatestSet() {
    let set = 1;
    let setNotFound = false;
    while (true) {
        set++;
        await fetch('https://dd.b.pvp.net/latest/set' + set + '/en_us/data/set' + set + '-en_us.json').then(async r => { if (r.status === 403) setNotFound = true; } );
        if (setNotFound) break;
    }
    set--;
    return set;
}

module.exports = { getChampions, checkData }