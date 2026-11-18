import axios from 'axios';
import { load } from 'cheerio';

/** @param {string} movieSlug */
async function getWorkingIframeSrc(movieSlug) {
    try {
        // 1. Lade die deutsche Movie-Seite (mit Redirect für DE)
        const url = `https://filmo.to/lang/de?redirect=/movies/${movieSlug}`;

        // Wir wollen den finalen Zustand nach allen Redirects
        const { data: html } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            maxRedirects: 5 // Folge den Umleitungen bis zum Ziel
        });

        const $ = load(html);

        // 2. Finde den ersten iframe auf der Seite
        // Oft ist es der erste iframe, der nicht leer ist
        const iframe = $('iframe').first();
        const src = iframe.attr('src');

        if (!src) {
            throw new Error("Kein iframe gefunden.");
        }

        console.log("Found iframe src:", src);
        return src;

    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

export default {
    getWorkingIframeSrc
}