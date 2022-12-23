'use strict';

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const functions = require('@google-cloud/functions-framework');
const escapeHtml = require('escape-html');

initializeApp();
const db = getFirestore();

const AUTH_BASE = 'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=';
const TREND_LIMIT = 3;

/**
 * Construct auth headers for a function request
 *
 * @param {String} audience The audience (url) of the function to call
 * @return {Promise<{Authorization: string}|{}>}
 */
async function getAuth(audience) {
    if (process.env.NODE_ENV === 'local') {
        return {};
    }

    const authConfig = {
        method: 'GET',
        headers: {
            "Metadata-Flavor": "Google"
        }
    }
    let auth = await fetch(`${AUTH_BASE}${audience}`, authConfig).then(response => response.text());

    return {Authorization: `Bearer ${auth}`}
}

/**
 * Creates an AI generated image based on provided or Google daily trends.
 * This is either expected to be run as:
 * - No query params to generate an image for that specific moment
 * - With a historic day and specific trends
 *
 * @param {Array} req.query.trends (trends[]=one&trends[]=two) Trends used to generate the image, If not provided googles daily trends will be used
 * @param {String} req.query.date (date=YYYY-MM-DD) Date to mark the image as generated from, used to re-generate previous dates images
 *
 * @returns Metadata about the generated image and its save locations
 */
functions.http('generateSnapshot', async (req, res) => {
    const CONFIG = {
        API_GET_TRENDS: process.env.API_GET_TRENDS,
        API_GENERATE_IMAGE: process.env.API_GENERATE_IMAGE,
        FIRESTORE_COLLECTION: process.env.FIRESTORE_COLLECTION,
        DEFAULT_GEO: process.env.DEFAULT_GEO,
        NODE_ENV: process.env.NODE_ENV,
    }

    console.log('CONFIG', JSON.stringify(CONFIG));

    try {
        // Default the provided date to today
        const today = new Date().toISOString().split('T')[0];
        const date = req.query.date ? escapeHtml(req.query.date) : today;

        // Default the trends to an empty array
        let trends = Array.isArray(req.query.trends) ? req.query.trends : [];

        console.log('INITIAL TRENDS', trends);
        console.log('INITIAL DATE', date);

        // If no prompt is provided, it will be based on the current google trends
        if (!trends.length) {

            // Fetch trends
            const trendQueryParams = {
                ...(CONFIG.DEFAULT_GEO && {geo: CONFIG.DEFAULT_GEO}),
                date,
                limit: TREND_LIMIT
            }
            const trendUrl = `${CONFIG.API_GET_TRENDS}?${new URLSearchParams(trendQueryParams)}`;
            const trendConfig = {
                method: 'GET',
                headers: {...await getAuth(CONFIG.API_GET_TRENDS)}
            };
            console.log(trendUrl);

            trends = await fetch(trendUrl, trendConfig).then(r => r.json());

            console.log('FETCH TRENDS', JSON.stringify(trends));
        }

        const prompt = `${trends.join(' and ')} as a painting`

        console.log('PROMPT', prompt)

        // Generate Image trends
        const imageUrl = `${CONFIG.API_GENERATE_IMAGE}?${new URLSearchParams({prompt, filename: date})}`;
        const imageConfig = {
            method: 'POST',
            headers: {...await getAuth(CONFIG.API_GENERATE_IMAGE)}
        };
        console.log(imageUrl)

        const imageResponse = await fetch(imageUrl, imageConfig).then(r => r.json());
        const {gcp_public_url, cloudinary_public_url} = imageResponse;

        // Save the metadata of the document
        const data = {
            date,
            url: gcp_public_url,
            cloudinaryUrl: cloudinary_public_url,
            trends,
            prompt,
            geo: CONFIG.DEFAULT_GEO,
            created: new Date().toISOString()
        }

        console.log('SAVED DATA', JSON.stringify(data));

        const docRef = db.collection(CONFIG.FIRESTORE_COLLECTION).doc(date);
        await docRef.set(data)

        res.send(data);
    } catch(e) {
        console.error('Daily Snapshot Failure', e.message)
        throw new Error(e);
    }
});