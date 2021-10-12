import { NextApiRequest, NextApiResponse } from "next";
//ALGO QUE VAMOS LER AOS POUCOS QUE NO CASO É A NOSSA REQUISIÇÃO.
//QUANDO RECEBEMOS A REQUISIÇÃO VAMOS LE-LA UTILIZANDO ESSE READABLE
import { Readable } from 'stream';
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";

//CONVERTENDO ESSA READABLESTRING EM UMA STRING:
async function buffer(readable: Readable) {
    //PEDAÇOS DA STRING
    const chunks=[];

    //CADA VEZ QUE FORMOS RECEBENDO UM VALOR DA REQUISIÇÃO, VAMOS ARMAZENANDO DENTRO DE CHUNK
    //ELE UTILIZA UM AWAIT PARA AGUARDAR POR TODOS OS CHUNKS
    for await (const chunk of readable){
        //ELE CONTATENA TODOS OS CHUNKS RECEBIDOS
        chunks.push(
            typeof chunk === "string" ? Buffer.from(chunk): chunk
        );
    }

    //QUANDO TERMINADO DEVOLVE TUDO EM UM ARRAY DE CHUNKS
    return Buffer.concat(chunks);
}

/**
 * POR PADRÃO O NEXT TEM UM FORMATO DE ENTENDER UM REQUISIÇÃO, QUE É POR FORMATO DE JSON OU FORMULÁRIO POR EXEMPLO
 * NESSE CASO ESSA REQUISIÇÃO É UMA STRING UM READABLE,
 * COM ISTO TEMOS QUE DESABILITAR ESSE ENTENDIMENTO PADRÃO DO NEXT
 */

export const config = {
    api:{
        bodyParser: false
    }
}

//AQUI ESTÁ SENDO ARMAZENADO APENAS OS EVENTOS RELEVANTES RETORNADOS DO event.type ABAIXO
//SET([]) = UM ARRAY QUE NÃO PODE TER NADA DUPLICADO DENTRO DELE.
//COLOCAMOS APENAS O WEBHOOK QUE NOS IMPORTA POR HORA
const relevantEvents = new Set([
    'checkout.session.completed',
    'customer.subscription.updated',
    'customer.subscription.deleted'
])


export default async (req: NextApiRequest, res:NextApiResponse) =>{
    //VERIFICANDO SE ESSA REQUISIÇÃO É DO TIPO POST
    if(req.method === 'POST'){
        //REQ É UM READABLE JÁ POR PADRÃO
        //DENTRO DE BUF TEMOS A NOSSA REQUISIÇÃO EM SI
        const buf = await buffer(req)
        //quando criamos uma funcionalidade webhook na nossa aplicação, isso é uma rota como qualquer outra dentro da nossa aplicação
        //assim sendo tem como o usuários descobrir essa rota e enviar coisas indesejadas no método POST
        //é muito comum que quando uma aplicação terceira queira se comunicar com a nossa atraves de webhooks essa aplicação mande um código para o nosso app
        //dizendo que se a nossa aplicação receber esse código, então vem de mim, senão receber vem de uma fonte mal itencionada.
        //o código que ele enviou está na primeira linha: Ready, quando executamos a CLI do Stripe no nosso computador

        //CÓDIGO ENVIADO PELO STRIPE PARA A NOSSA APLICAÇÃO
        const secret = req.headers['stripe-signature']

        let event: Stripe.Event;

        try{
            //AQUI ESTÁ SENDO EFETUADA A COMPARAÇÃO DAS DUAS CHAVES: A SECRET ENVIADA PELO STRIPE E A VARIAVEL AMBIENTE ONDE COLOCAMOS A CHAVE QUE NOS FOI PASSADA
            event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET);
        }catch (err) {
            return res.status(400).send(`Webhook error: ${err.message}`)
        }

        //O event.type RETORNA O QUE ESTAVAMOS VENDO DENTRO DO NOSSO TERMINAL, ASSIM PODEMOS DETERMINAR O QUE FAZER NO TIPO DO EVENTO RETORNADO POR EXEMPLO
        //EM VERIFICAÇÃO FOI CONSTATADO QUE EXISTEM VÁRIOS DADOS IMPORTANTES RETORNADOS NO MOMENTO DA ASSINATURA QUE DEVEM SER ANALISADOS E ESCOLHIDOS QUAIS SERÃO ARMAZENADOS NO FAUNDADB
        const { type } = event;

        //CASO O WEBHOOK ESTEJA DENTRO ELE IRÁ FAZER UMA FUNCIONALIDADE
        //OUVINDO ALGUNS DOS EVENTOS QUE SÃO RETORNADOS PELO STRIPE
        if(relevantEvents.has(type)){
          try{
            switch (type){
                //ESSAS TRES VERIFICAÇÕES VÃO CAIR NESSA MESMA LÓGICA DO SWITCH
                //WEBHOOKS DE ATUALIZAÇÃO, SIM MESMO O DELETED ESTÁ ATUALIZANDO UMA INFORMAÇÃO    
                case 'customer.subscription.updated':
                case 'customer.subscription.deleted':
                    //OUVINDO O TIPO DE EVENTO QUE PODE SER UM DOS TRÊS WEBHOOKS ACIMA
                    const subscription = event.data.object as Stripe.Subscription;

                    //DADOS SENDO ENVIADOS PARA A FUNÇÃO DENTRO DE MANAGESUBSCRIPTION
                    await saveSubscription(
                        subscription.id,
                        subscription.customer.toString(),
                        //SÓ VAI SER TRUE SE ESSA CONDIÇÃO FOR VERDADEIRA
                        false
                    );


                    break;
                
                case 'checkout.session.completed':

                //FOI TIPADA PARA SABER EXATAMENTE O QUE EXISTE DENTRO DESTA CONSTANTE
                const checkoutSession = event.data.object as Stripe.Checkout.Session

                //FOI EFETUADA UMA CONVERSÃO PARA STRING POIS O RETORNO TAMBÉM PODE SER UM OBJETO COM TODOS OS ELEMENTOS DE checkoutsession
                await saveSubscription(
                    checkoutSession.subscription.toString(),
                    checkoutSession.customer.toString(),
                    true,
                )


                    break;
                default:
                    throw new Error('Unhandled event.')    
            }
          }catch (err){
              //NÃO SE PODE RETORNAR UM STATUS DE ERRO DIRETAMENTE POIS ASSIM O STRIPE VAI ENTENDER QUE OCORREU UM ERRO NA NOSSA REQUISIÇÃO
              //ASSIM ELE VAI FICAR RETENTANDO ENVIAR NOVAMENTE ESSA MESMA REQUISIÇÃO VÁRIAS E VÁRIAS VEZES
              return res.json({error: 'Webhook handler failed.'})
          }
        }

        res.json({ received:true })
    }else{
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method not allowed')
    }
}