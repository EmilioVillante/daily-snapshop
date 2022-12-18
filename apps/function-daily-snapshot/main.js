'use strict';

const functions = require('@google-cloud/functions-framework');

/**
 * Call Google trends api and return the list of daily trends titles
 *
 * @returns String a public link to the generated image
 */
functions.http('generateSnapshot', async (req, res) => {
    console.log('CONFIG', process.env.CONFIG);

    const CONFIG = JSON.parse(process.env.CONFIG)

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
        const trendUrl = `${CONFIG.getTrends}?${new URLSearchParams({geo: 'AU'})}`;
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
        const generatedImage = await imageResponse.json();

        console.log(generatedImage)

        res.send(generatedImage);
    } catch(e) {
        console.error('Daily Snapshot Failure', e.message)
        throw new Error(e);
    }
});