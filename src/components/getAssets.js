const {getChampions} = require("./getCardData");

async function getRegionImage(GameState) {
    if (GameState === 'InProgress') {
        let region;
        let champion = await getChampions();
        region = champion[0][0]['regions'][0];

        if (region === 'Runeterra') return 'all_small';
        if (region === 'Piltover & Zaun') return 'pz_small'
        if (region === 'Bandle City') return 'bc_small'
        if (region === 'targon') return 'tg_small'
        return region + '_small';
    } else return 'all_small'
}

async function getLargeImage() {
    /* TODO: add Large image */
    return 'freljord_home_background'
}

module.exports = { getRegionImage, getLargeImage }