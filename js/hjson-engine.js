class HjsonEngine {
    parse(text) {
        try {
            const clean = text.replace(/\/\/.*/g, '').trim();
            return JSON.parse(clean);
        } catch (e) {
            return null;
        }
    }

    stringify(obj) {
        return JSON.stringify(obj, null, 2);
    }
}

const hjsonEngine = new HjsonEngine();
