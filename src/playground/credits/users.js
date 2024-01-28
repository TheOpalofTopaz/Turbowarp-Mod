const shuffle = list => {
    for (let i = list.length - 1; i > 0; i--) {
        const random = Math.floor(Math.random() * (i + 1));
        const tmp = list[i];
        list[i] = list[random];
        list[random] = tmp;
    }
    return list;
};

const fromHardcoded = ({userID = '0', username}) => {
    const result = {
        image: `https://trampoline.turbowarp.org/avatars/${userID}`,
        text: username
    };
    if (username && userID !== '0') {
        result.href = `https://scratch.mit.edu/users/${username}/`;
    }
    return result;
};

// The lists below are in no particular order.

const contributors = [
    {
        userID: '41219524',
        username: 'CubesterYT'
    },
    {
        userID: '64691048',
        username: 'CST1229'
    },
    {
        username: 'FurryR'
    },
    {
        userID: '17340565',
        username: 'GarboMuffin'
    },
    {
        userID: '12498592',
        username: 'LilyMakesThings'
    },
    {
        userID: '105362329',
        username: 'TrueFantom'
    },
    {
        userID: '9636514',
        username: 'Tacodiva7729'
    },
    {
        username: 'SimonShiki'
    },
    {
        username: 'Geotale'
    },
    {
        username: 'Wowfunhappy'
    }
].map(fromHardcoded);

const addonDevelopers = [
    {
        userID: '34018398',
        username: 'Jeffalo'
    },
    {
        userID: '64184234',
        username: 'ErrorGamer2000'
    },
    {
        userID: '41616512',
        username: 'pufferfish101007'
    },
    {
        userID: '61409215',
        username: 'TheColaber'
    },
    {
        userID: '1882674',
        username: 'griffpatch'
    },
    {
        userID: '10817178',
        username: 'apple502j'
    },
    {
        userID: '16947341',
        username: '--Explosion--'
    },
    {
        userID: '14880401',
        username: 'Sheep_maker'
    },
    {
        userID: '9981676',
        username: 'NitroCipher'
    },
    {
        userID: '2561680',
        username: 'lisa_wolfgang'
    },
    {
        userID: '60000111',
        username: 'GDUcrash'
    },
    {
        userID: '4648559',
        username: 'World_Languages'
    },
    {
        userID: '17340565',
        username: 'GarboMuffin'
    },
    {
        userID: '5354974',
        username: 'Chrome_Cat'
    },
    {
        userID: '34455896',
        username: 'summerscar'
    },
    {
        userID: '55742784',
        username: 'RedGuy7'
    },
    {
        userID: '9636514',
        username: 'Tacodiva7729'
    },
    {
        userID: '14792872',
        username: '_nix'
    },
    {
        userID: '30323614',
        username: 'BarelySmooth'
    },
    {
        userID: '64691048',
        username: 'CST1229'
    },
    {
        username: 'DNin01'
    },
    {
        userID: '16426047',
        username: 'Maximouse'
    },
    {
        username: 'retronbv'
    },
    {
        username: 'GrahamSH'
    },
    {
        userID: '22529928',
        username: 'simiagain'
    },
    {
        username: 'Secret-chest'
    },
    {
        userID: '11677378',
        username: 'Mr_MPH'
    },
    {
        username: 'TheKodeToad'
    }
].map(fromHardcoded);

const extensionDevelopers = [
    // generated by TurboWarp/extensions/scripts/get-credits-for-gui.js
    {
        username: '-SIPC-'
    },
    {
        username: '0832'
    },
    {
        userID: '17235330',
        username: 'aleb2005'
    },
    {
        username: 'BlueDome77'
    },
    {
        username: 'ClaytonTDM'
    },
    {
        userID: '37070511',
        username: 'cs2627883'
    },
    {
        userID: '64691048',
        username: 'CST1229'
    },
    {
        userID: '41219524',
        username: 'CubesterYT'
    },
    {
        userID: '33988895',
        username: 'D-ScratchNinja'
    },
    {
        username: 'DT'
    },
    {
        userID: '1882674',
        username: 'griffpatch'
    },
    {
        userID: '41876695',
        username: 'JeremyGamer13'
    },
    {
        userID: '12498592',
        username: 'LilyMakesThings'
    },
    {
        username: 'MikeDEV'
    },
    {
        userID: '62950341',
        username: 'NamelessCat'
    },
    {
        username: 'NOname-awa'
    },
    {
        userID: '26959223',
        username: 'pinksheep2917'
    },
    {
        username: 'pumpkinhasapatch'
    },
    {
        username: 'qxsck'
    },
    {
        userID: '29118689',
        username: 'RedMan13'
    },
    {
        userID: '80038021',
        username: 'RixTheTyrunt'
    },
    {
        userID: '14880401',
        username: 'Sheep_maker'
    },
    {
        userID: '103496265',
        username: 'shreder95ua'
    },
    {
        username: 'Skyhigh173'
    },
    {
        userID: '52066199',
        username: 'softed'
    },
    {
        username: 'TheShovel'
    },
    {
        userID: '105362329',
        username: 'TrueFantom'
    },
    {
        userID: '19133274',
        username: 'Vadik1'
    },
    {
        username: 'veggiecan0419'
    },
    {
        userID: '82486672',
        username: 'lolecksdeehaha'
    },
    {
        userID: '3318598',
        username: 'plant2014'
    },
    {
        username: 'ZXMushroom63'
    }
].map(fromHardcoded);

const docs = [
    {
        userID: '12498592',
        username: 'LilyMakesThings'
    },
    {
        username: 'DNin01'
    },
    {
        username: 'Samq64'
    },
    {
        username: '61080GBA'
    },
    {
        username: 'adazem009'
    },
    {
        username: 'sajtosteszta32'
    },
    {
        username: 'yoyomonem'
    },
    {
        userID: '55742784',
        username: 'RedGuy7'
    },
    {
        username: '28klotlucas2'
    },
    {
        username: 'PPPDUD'
    },
    {
        username: 'BackThePortal'
    },
    {
        username: 'Naleksuh'
    }
].map(fromHardcoded);

export default {
    contributors: shuffle(contributors),
    addonDevelopers: shuffle(addonDevelopers),
    extensionDevelopers: shuffle(extensionDevelopers),
    docs: shuffle(docs)
};
