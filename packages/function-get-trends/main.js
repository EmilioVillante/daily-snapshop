'use strict';

const functions = require('@google-cloud/functions-framework');
const escapeHtml = require('escape-html');

const TREND_API = 'https://trends.google.com/trends/api/dailytrends';

/**
 * Call Google trends api and return the list of daily trends titles
 *
 * @param {String} req.query.geo (geo=AU) Geo code for localisation of trends
 * @param {String} req.query.date (date=2022-12-04) Date to query trends for. Google only provides the last month from today.
 *
 * @returns Array Trends relevant to the given day
 */
functions.http('getTrends', async (req, res) => {
    try {
        const CONFIG = {
            DEFAULT_GEO: process.env.DEFAULT_GEO
        }

        console.log('CONFIG', JSON.stringify(CONFIG));

        const geo = req.query.geo ? escapeHtml(req.query.geo) : CONFIG.DEFAULT_GEO;

        let queryParams = {
            geo,
            hl: 'en-US',
            ...(req.query.date && {ed: escapeHtml(req.query.date).replaceAll('-', '')})
        }

        console.log('QUERY PARAMS', JSON.stringify(queryParams));

        const url = `${TREND_API}?${new URLSearchParams(queryParams)}`;

        console.log('TREND FETCH URL', url);

        const response = await fetch(url, {method: 'GET'});
        const responseStr = await response.text();

        console.log('TREND RESPONSE', responseStr);

        const data = JSON.parse(responseStr.replace(')]}\',', ''));

        // End if there are no trends
        if (!data.default.trendingSearchesDays.length) {
            throw new Error('No trends for the given day')
        }

        const trends = data.default.trendingSearchesDays[0].trendingSearches.map((trend) => trend.title.query);

        console.log('TRENDS', trends)

        res.send(trends)
    } catch(e) {
        console.error('Get Trends Failure', e.message)
        throw new Error(e);
    }
});