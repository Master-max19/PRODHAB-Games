const SERVER = 'https://localhost:7006';
const PUBLIC_PATH = '../images';

const ENVIRONMENTS = {
    development: {
        apiUrl: SERVER,
        publicPath: PUBLIC_PATH,
        debug: true,
        routes: {
            login: "http://localhost:5165/login-nuevo",
            admin: "http://localhost:5165/admin-nuevo"
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

