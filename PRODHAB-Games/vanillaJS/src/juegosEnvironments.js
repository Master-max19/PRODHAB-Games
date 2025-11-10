const SERVER = 'http://localhost:5133';
const ENVIRONMENTS = {
    development: {
        apiUrl: SERVER,
        debug: true,
    },
    production: {
        apiUrl: 'http://localhost:5133',
        debug: false
    }
};

const CONFIG = ENVIRONMENTS.production;

