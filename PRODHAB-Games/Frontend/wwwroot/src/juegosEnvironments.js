const SERVER = 'http://localhost:5133';
const PUBLIC_PATH = '../../../public/image';

const ENVIRONMENTS = {
    development: {
        apiUrl: SERVER,
        publicPath: PUBLIC_PATH,
        debug: true,
        routes: {
            login: "../login/login.html",
            admin: "../admin/admin.html"
        }
    },
    production: {
        apiUrl: SERVER,
        publicPath: PUBLIC_PATH,
        debug: false,
        routes: {
            login: "../login/login.html",
            admin: "../admin/admin.html"
        }
    }
};

const CONFIG = ENVIRONMENTS.development;

