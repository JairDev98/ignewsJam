import Stripe from 'stripe';

import {version} from '../../package.json';

//COMO PRIMEIRO PARAMETRO É PASSADA CHAVE DO STRIPE
//SEGUNDO PARAMETRO SÃO ALGUMAS INFORMAÇÕES OBRIGATÓRIAS: VERSÃO DA API, NOME DA APLICAÇÃO, VERSÃO DA APLICAÇÃO
//A VERSÃO ESTÁ SENDO PASSADA DE ACORDO COM PACKAGE.JSON

export const stripe = new Stripe(
    process.env.STRIPE_API_KEY,
    {
     apiVersion: '2020-08-27',
     appInfo:{
         name:'Ignews',
         version
     },        
    }
)