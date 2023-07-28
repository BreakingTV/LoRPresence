async function getScreen() {
    const response = await fetch('http://127.0.0.1:21337/positional-rectangles').then(r => { return  r}).catch((e => {
        console.log('Game State not available! Is the game running?')
        throw new Error(e);
    }));

    return await response.json();
}

module.exports = { getScreen };