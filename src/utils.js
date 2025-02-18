const {getLocalization} = require("./localizations/localizations");
const {EmbedBuilder} = require("discord.js");

module.exports = {
    getFlagEmoji (countryCode) {
        // if country code is empty return the globe emoji
        if (!countryCode) return "🌐";

        // fix some country codes
        if (countryCode === 'ja') countryCode = 'jp';
        if (countryCode === 'ko') countryCode = 'kr';
        if (countryCode === 'en') countryCode = ['gb','us'][Math.floor(Math.random()*2)];
        if (countryCode === 'en-GB') countryCode = 'gb';
        if (countryCode === 'en-US') countryCode = 'us';
        if (countryCode === 'zh-CN') countryCode = 'cn';
        if (countryCode === 'zh-TW') countryCode = 'tw';

        return countryCode.replace(/./g,(ch)=>String.fromCodePoint(0x1f1a5+ch.toUpperCase().charCodeAt()))
    },
    splitString(str, maxLength) {
        if (str.length <= maxLength) {
            return [str];
        }

        const chunks = [];
        let currentChunk = '';

        // split the string into chunks
        let advancement = 0;
        while (advancement < str.length) {
            // get the next chunk
            currentChunk = str.substring(advancement, (advancement + maxLength) > str.length ? str.length : (advancement + maxLength));

            // the `end` variable will be used to check if there's a smart way to split the chunks or not
            const end = currentChunk.substring(currentChunk.length - (currentChunk.length < 100 ? currentChunk.length : 100), currentChunk.length);

            //check if there's .!? in the end var so that we can split there.
            // also check for the first encountered space in case we don't find any of the above
            let space;
            for (let i = end.length; i > 0; i--) {
                if (end[i] === '.' || end[i] === '!' || end[i] === '?') {
                    // check if there's a space after the punctuation
                    if (end[i + 1] === ' ') {
                        // if there's a match, add the chunk to the chunks array
                        chunks.push(currentChunk.substring(0, currentChunk.length - (end.length - i)));
                        // record the advancement
                        advancement += currentChunk.length - (end.length - i);
                        // wipe the current chunk
                        currentChunk = '';
                        //and break the loop
                        break;
                    }
                } else if (!space &&end[i] === ' ') {
                    space = i;
                }
            }

            // check if the current chunk was split
            if (currentChunk.length > 0) {
                // if not check if we found a space
                if (space) {
                    // if we did, split the chunk there
                    chunks.push(currentChunk.substring(0, currentChunk.length - (end.length - space)));
                    // record the advancement
                    advancement += currentChunk.length - (end.length - space);
                    // wipe the current chunk
                    currentChunk = '';
                } else {
                    // if we haven't found anything, split the chunk there even if it's unnatural
                    chunks.push(currentChunk);
                    // record the advancement
                    advancement += currentChunk.length;
                    // wipe the current chunk
                    currentChunk = '';
                }
            }
        }
        return chunks;
    },
    makeResponseEmbeds (locale, from, to, text) {
        // make the title
        const title = getLocalization("commands:translate.success", locale ,{
            from: module.exports.getFlagEmoji(from),
            to: module.exports.getFlagEmoji(to)
        });

        // split the text so that it is not too long
        const chunks = module.exports.splitString(text, 4096);

        // make the embeds
        let responseEmbeds = []
        for (let i = 0; i < chunks.length; i++) {
            responseEmbeds[i] = new EmbedBuilder().setColor(process.env.ACCENT_COLOR)
                .setDescription(chunks[i]);
        }

        // set the title of the first embed
        responseEmbeds[0].setTitle(title);

        return responseEmbeds;
    }
}