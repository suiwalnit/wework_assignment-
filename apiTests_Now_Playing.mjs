import axios from 'axios';
import { expect } from 'chai';
import https from 'https';

// Define reusable variables for headers, agent, and base URL
const BASE_URL = 'https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1';
const headers = {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2YTg3ZTY4MDMyODIwMTIzZmQ0Yzg0YjQzNDhjYjc3ZCIsInN1YiI6IjY2Mjg5NDExOTFmMGVhMDE0YjAwOWU1ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.6zIM73Giwg5M4wP6MX8KDCpee7IMnpnLTZUyMpETb08',
    'accept': 'application/json'
};
const agent = new https.Agent({ rejectUnauthorized: false }); // Bypass SSL verification

// Utility function to make a GET request
const getRequest = async (endpoint, customHeaders = headers) => {
    return axios.get(`${BASE_URL}/${endpoint}`, { headers: customHeaders, httpsAgent: agent });
};

// Utility function to make a POST request
const postRequest = async (endpoint, body = {}, customHeaders = headers) => {
    return axios.post(`${BASE_URL}/${endpoint}`, body, { headers: customHeaders, httpsAgent: agent });
};

describe('NOW_PLAYING_TESTCASES', function() {

    it('All movies should return status 200', async function() {
        try {
            const response = await getRequest('now_playing?language=en-US&page=1');
            // const response = await axios.get(
            //     'https://api.themoviedb.org/3/movie/now_playing?language=abc-US&page=1', 
            //     { headers, httpsAgent: agent }
            // );
            console.log(response.status);  // Optional logging

            // Validate status and structure
            expect(response.status).to.equal(200);
            expect(response.data).to.have.property('results').that.is.an('array');
        } catch (error) {
            if (error.response) {
                console.error('Error response:', error.response);
                expect.fail(`API request failed with status: ${error.response.status}`);
            } else {
                console.error('Unexpected error:', error.message);
                expect.fail(`Unexpected error: ${error.message}`);
            }
        }
    });

    it('Should return 401 for unauthorized token', async function() {
        const invalidHeaders = {
            ...headers,
            'Authorization': 'Bearer yJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2'
        };

        try {
            const response = await getRequest('now_playing?language=en-US&page=1', invalidHeaders);
            console.log(response.status);  // Optional logging

            expect(response.status).to.equal(401);
            expect(response.statusText).to.equal("Unauthorized");
        } catch (error) {
            if (error.response) {
                console.error('Error response:', error.response.data);
                expect(error.response.status).to.equal(401);
                expect(error.response.statusText).to.equal("Unauthorized");
            } else {
                console.error('Unexpected error:', error.message);
                expect.fail(`Unexpected error: ${error.message}`);
            }
        }
    });

    it('Should return 404 for POST request to an invalid endpoint', async function() {
        try {
            const response = await postRequest('now_playing?language=en-US&page=1');
            console.log(response.status);  // Optional logging

            expect(response.status).to.equal(404); // Adjust according to your negative case
        } catch (error) {
            if (error.response) {
                expect(error.response.status).to.equal(404);
                expect(error.response.data).to.have.property('status_message').that.equals('The resource you requested could not be found.');
            } else {
                console.error('Unexpected error:', error.message);
                expect.fail(`Unexpected error: ${error.message}`);
            }
        }
    });
    it('Invalid Page Number (Negative)', async function() {
        try {
            //const response = await getRequest('now_playing?language=en-US&page=1');
            const response = await axios.get(
                'https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=-1', 
                { headers, httpsAgent: agent }
            );
            console.log(response.status);  // Optional logging

            // Validate status and structure
            expect(response.status).to.equal(400);
            // expect(response.data).to.have.property('results').that.is.an('array');
        } catch (error) {
            if (error.response) {
                expect(error.response.status).to.equal(400);
                expect(error.response.data).to.have.property('status_message').that.equals('Invalid page: Pages start at 1 and max at 500. They are expected to be an integer.');
            } else {
                console.error('Unexpected error:', error.message);
                expect.fail(`Unexpected error: ${error.message}`);
            }
        }
    });
    it('Invalid Page Number (Zero) or greater than 500', async function() {
        try {
            //const response = await getRequest('now_playing?language=en-US&page=1');
            const response = await axios.get(
                'https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=0', 
                { headers, httpsAgent: agent }
            );
            console.log(response.status);  // Optional logging

            // Validate status and structure
            expect(response.status).to.equal(400);
            // expect(response.data).to.have.property('results').that.is.an('array');
        } catch (error) {
            if (error.response) {
                expect(error.response.status).to.equal(400);
                expect(error.response.data).to.have.property('status_message').that.equals('Invalid page: Pages start at 1 and max at 500. They are expected to be an integer.');
            } else {
                console.error('Unexpected error:', error.message);
                expect.fail(`Unexpected error: ${error.message}`);
            }
        }
    });
    it('Passing wrong API', async function() {
        try {
            // const response = await getRequest('now_playing?language=en-US&page=1');
            const response = await axios.get(
                'https://api.themoviedb.org/3/movie/now_playings?language=en-US&page=1', 
                { headers, httpsAgent: agent }
            );
            console.log(response.status);  // Optional logging

            // Validate status and structure
            expect(response.status).to.equal(404);
            expect(response.data).to.have.property('results').that.is.an('array');
        } catch (error) {
            if (error.response) {
                expect(error.response.status).to.equal(404);
                expect(error.response.data).to.have.property('status_message').that.equals('Invalid id: The pre-requisite id is invalid or not found.');
            } else {
                console.error('Unexpected error:', error.message);
                expect.fail(`Unexpected error: ${error.message}`);
            }
        }
    });
    it('should ensure no duplicate movies in the results', async function() {
        try {
            const response = await getRequest('now_playing?language=en-US&page=1');
            console.log(response.status);  // Optional logging
    
            // Validate status and structure
            expect(response.status).to.equal(200);
            expect(response.data).to.have.property('results').that.is.an('array');
    
            // Extract movie IDs to check for duplicates
            const movieIds = response.data.results.map(movie => movie.id);
    
            // Check for duplicates by comparing unique size with original size
            const uniqueMovieIds = new Set(movieIds);
            expect(uniqueMovieIds.size).to.equal(movieIds.length, 'Duplicate movies found in results');
    
        } catch (error) {
            if (error.response) {
                console.error('Error response:', error.response);
                expect.fail(`API request failed with status: ${error.response.status}`);
            } else {
                console.error('Unexpected error:', error.message);
                expect.fail(`Unexpected error: ${error.message}`);
            }
        }
    });

});
