'use strict';

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const functions = require('@google-cloud/functions-framework');

initializeApp();
const db = getFirestore();

const DEFAULT_CONFIG = {
    getTrends: undefined,
    generateImage: undefined,
    firestoreCollection: 'daily-snapshot-test'
}

const DEFAULT_GEO = 'AU'

/**
 * Call Google trends api and return the list of daily trends titles
 *
 * @returns String a public link to the generated image
 */
functions.http('generateSnapshot', async (req, res) => {
    console.log('CONFIG', process.env.CONFIG);

    const CONFIG = {
        ...DEFAULT_CONFIG,
        ...JSON.parse(process.env.CONFIG)
    }

    try {
        const trendsAuthUrl = `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=${CONFIG.getTrends}`;
        const imageAuthUrl = `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=${CONFIG.generateImage}`;
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
        const trendUrl = `${CONFIG.getTrends}?${new URLSearchParams({geo: DEFAULT_GEO})}`;
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

        // Generate Image trends
        const imageUrl = `${CONFIG.generateImage}?${new URLSearchParams({prompt: filteredTrends.join(', ')})}`;
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
            geo: DEFAULT_GEO,
            created: new Date().toISOString()
        }

        console.log(data);

        const docRef = db.collection(CONFIG.firestoreCollection).doc(today);
        await docRef.set(data)

        res.send(data);
    } catch(e) {
        console.error('Daily Snapshot Failure', e.message)
        throw new Error(e);
    }
});