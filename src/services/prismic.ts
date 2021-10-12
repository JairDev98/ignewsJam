//A DOCUMENTAÇÃO DO PRIMISC FAZ A RECOMENDAÇÃO DE SEMPRE INSTANCIAR NOVAMENTE O CLIENTE DO PRISMIC NOVAMENTE

import Prismic from '@prismicio/client';

export function getPrimiscClient(req?: unknown){
    const primisc = Prismic.client(
        //COMO PRIMEIRO PARAMETRO PASSAMOS A VARIAVEL DE AMBIENTE COM O ENDEREÇO DO NOSSO REPOSITÓRIO DENTRO DO PRISMIC
        //COMO SEGUNDO PARAMETRO PASSAMOS UM OBJETO QUE TEM COMO PROPRIEDADE O ACESSTOKEN QUE É A VARIAVEL DE AMBIENTE DO PRISMIC
        process.env.PRISMIC_ENDPOINT,
        {
            req,
            accessToken: process.env.PRISMIC_ACESS_TOKEN
        }
    )

    return primisc;
}