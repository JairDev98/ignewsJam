import axios from 'axios';

export const api = axios.create({
    //AQUI PODEMOS OMITIR A PARTE DE http://localhost:3333/ POIS O AXIOS IRÁ FAZER O REAPROVEITAMENTO COM A URL QUE JÁ EXISTE
    baseURL: '/api'
})