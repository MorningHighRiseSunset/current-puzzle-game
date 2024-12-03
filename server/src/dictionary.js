const Logger = require('./logger.js');
const axios = require('axios');

class DictionaryService {
    constructor() {
        this.cache = new Map();
    }

    async findWord(word) {
        word = word.toLowerCase().trim();

        // Check cache first
        if (this.cache.has(word)) {
            return this.cache.get(word);
        }

        try {
            // Try Free Dictionary API first
            const exists = await this.checkFreeDictionaryAPI(word);
            this.cache.set(word, exists);
            return exists;
        } catch (error) {
            Logger.warn(`Free Dictionary API failed, trying Datamuse API for: ${word}`);
            
            try {
                // Fallback to Datamuse API
                const exists = await this.checkDatamuseAPI(word);
                this.cache.set(word, exists);
                return exists;
            } catch (err) {
                Logger.error(`Both APIs failed for word: ${word}`);
                return false;
            }
        }
    }

    async checkFreeDictionaryAPI(word) {
        try {
            const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            return response.status === 200;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return false;
            }
            throw error;
        }
    }

    async checkDatamuseAPI(word) {
        try {
            // Datamuse API - checks if word exists and its frequency
            const response = await axios.get(`https://api.datamuse.com/words?sp=${word}&md=f&max=1`);
            if (response.data && response.data.length > 0) {
                // Check if the word matches exactly
                return response.data[0].word === word;
            }
            return false;
        } catch (error) {
            Logger.error(`Datamuse API error: ${error.message}`);
            return false;
        }
    }

    clearCache() {
        this.cache.clear();
        Logger.info('Dictionary cache cleared');
    }
}

const dictionaryService = new DictionaryService();

async function FindWord(lang, word) {
    // Currently only supporting English
    if (lang !== 'en') {
        Logger.warn(`Language ${lang} not supported yet`);
        return false;
    }

    try {
        return await dictionaryService.findWord(word);
    } catch (error) {
        Logger.error(`Error checking word ${word}: ${error.message}`);
        return false;
    }
}

module.exports = {
    FindWord,
    clearDictionaryCache: () => dictionaryService.clearCache()
};
