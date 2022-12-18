'use strict';

const functions = require('@google-cloud/functions-framework');
const escapeHtml = require('escape-html');

const TREND_API = 'https://trends.google.com/trends/api/topdailytrends';
const DEFAULT_GET = 'US';

/**
 * Call Google trends api and return the list of daily trends titles
 *
 * @param req.query.geo (String) Geo code for localisation of trends
 * @returns Array Trends relevant to the given day
 */
functions.http('getTrends', async (req, res) => {
    try {
        const geo = req.query.geo ? escapeHtml(req.query.geo) : DEFAULT_GET;
        const url = `${TREND_API}?${new URLSearchParams({geo})}`;

        console.log('trend fetch URL', url);

        const response = await fetch(url, {method: 'GET'});
        const responseStr = await response.text();

        console.log('response', responseStr);

        const data = JSON.parse(responseStr.replace(')]}\',', ''));
        const trends = data.default.trendingSearches.map((trend) => trend.title);

        console.log('trends', trends)

        res.send(trends)
    } catch(e) {
        console.error('Get Trends Failure', e.message)
        throw new Error(e);
    }
});