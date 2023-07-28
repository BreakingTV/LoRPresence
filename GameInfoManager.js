async function callLocalAPI(call) {
    const response = await fetch('http://127.0.0.1:21337/' + call).then(r => {
        return r
    }).catch((e => {
        console.log('Local Api not found! Is the game running?')
        throw new Error(e);
    }));

    return await response.json();
}

async function callSetData(set) {
    const response = await fetch('https://dd.b.pvp.net/latest/set' + set + '/en_us/data/set' + set + '-en_us.json').then(r => {
        return r
    }).catch((e => {
        console.log('Dragon Data not found, are the Riot Servers down?')
        throw new Error(e);
    }));

    return await response.json();
}

module.exports = { callLocalAPI, callSetData };