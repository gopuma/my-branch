import axios from 'axios';

const instance = axios.create({
    // baseURL: 'https://react-burger.firebaseio.com/'
    baseURL: 'http://localhost:8080/'
});

export default instance;