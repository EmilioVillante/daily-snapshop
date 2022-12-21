'use strict';

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const functions = require('@google-cloud/functions-framework');

initializeApp();
const db = getFirestore();

const AUTH_BASE = 'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=';

/**
 * Call Google trends api and return the list of daily trends titles
 *
 * @returns String a public link to the generated image
 */
functions.http('generateSnapshot', async (req, res) => {
    const CONFIG = {
        API_GET_TRENDS: process.env.API_GET_TRENDS,
        API_GENERATE_IMAGE: process.env.API_GENERATE_IMAGE,
        FIRESTORE_COLLECTION: process.env.FIRESTORE_COLLECTION,
        DEFAULT_GEO: process.env.DEFAULT_GEO
    }

    console.log('CONFIG', JSON.stringify(CONFIG));

    try {
        const trendsAuthUrl = `${AUTH_BASE}${CONFIG.API_GET_TRENDS}`;
        const imageAuthUrl = `${AUTH_BASE}${CONFIG.API_GENERATE_IMAGE}`;
        const authConfig = {
            method: 'GET',
            headers: {
                "Metadata-Flavor": "Google"
            }
        }

        // Get auth for trends call
        let authResponse = await fetch(trendsAuthUrl, authConfig)
        let auth = await authResponse.text();

        // Fetch trends
        const trendUrl = `${CONFIG.API_GET_TRENDS}?${new URLSearchParams({geo: CONFIG.DEFAULT_GEO})}`;
        const trendConfig = {
            method: 'GET',
            headers: {Authorization: `Bearer ${auth}`}
        };
        const trendsResponse = await fetch(trendUrl, trendConfig);
        const trends = await trendsResponse.json();
        console.log(JSON.stringify(trends));

        // Get auth for image generation call
        authResponse = await fetch(imageAuthUrl, authConfig)
        auth = await authResponse.text();

        // Only use the first three trends for a more refined image
        const filteredTrends = trends.slice(0, 3);

        const prompt = `${filteredTrends.join(' and ')} as a painting`
        // Generate Image trends
        const imageUrl = `${CONFIG.API_GENERATE_IMAGE}?${new URLSearchParams({prompt})}`;
        const imageConfig = {
            method: 'POST',
            headers: {Authorization: `Bearer ${auth}`}
        };
        const imageResponse = await fetch(imageUrl, imageConfig);
        const {url} = await imageResponse.json();

        // Save the metadata of the document
        const today = new Date().toISOString().split('T')[0];
        const data = {
            date: today,
            url,
            trends: filteredTrends,
            prompt,
            geo: CONFIG.DEFAULT_GEO,
            created: new Date().toISOString()
        }

        console.log(data);

        const docRef = db.collection(CONFIG.FIRESTORE_COLLECTION).doc(today);
        await docRef.set(data)

        res.send(data);
    } catch(e) {
        console.error('Daily Snapshot Failure', e.message)
        throw new Error(e);
    }
});