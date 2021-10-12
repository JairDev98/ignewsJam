import { query as q} from 'faunadb';
import { fauna } from "../../../services/fauna";
import { stripe } from '../../../services/stripe';

//ESSA FUNÇÃO VAI SALVAR ESSAS INFORMAÇÕES QUE ESTÃO SENDO RECEBIDAS NO BANCO DE DADOS
export async function saveSubscription(
    subscriptionId: string,
    customerId: string,
    createAction = false,
) {
    //BUSCAR O USUÁRIO NO BANCO DO FAUNADB COM O ID {customerId}
    const userRef = await fauna.query(
        //PASSANDO AO FAUNA QUAIS CAMPOS EXATAMENTE QUEREMOS QUE SEJAM TRAZIDOS
        q.Select(
            //ESSE CAMPO EM ESPECIFICO, obs: PODEM SER PASSADOS MAIS CAMPOS AQUI DENTRO
            "ref",
                q.Get(
                    q.Match(
                        q.Index('user_by_stripe_customer_id'),
                        customerId
                    )
                )
            )
    )

    //BUSCANDO TODOS OS DADOS DA SUBSCRIPTION DO USUÁRIO
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    //DADOS A SEREM SALVOS NA SUBSCRIPTION
    const subscriptionData = {
        id: subscription.id,
        userId: userRef,
        status: subscription.status,
        price_id: subscription.items.data[0].price.id,
    }

    //SE É UMA CREATEDACTION PODE SE SIMPLESMENTE CRIAR UMA NOVA SUBSCRIPTION NO BANCO DE DADOS COMO JÁ ESTAVA SENDO EFETUADO
   if (createAction){
      //SALVAR OS DADOS DA SUBSCRIPITION NO FAUNADB
    await fauna.query(
        q.Create(
            q.Collection('subscriptions'),
            {data: subscriptionData}
        )
    )
    //SE NÃO VAMOS ATUALIZAR A SUBSCRIPTION EXISTENTE
   }else{
    //O REPLACE VAI SUBSTITUIR A SUBSCRIPTION JÁ EXISTENTE POR COMPLETO, PASSANDO A SUA REFERENCIA E FAZENDO A SUA SUBSTITUIÇÃO
    //CASO A SUBSCRIPTION JÁ EXISTA NO BANCO DE DADOS É EFETUADA A SUBSTITUIÇÃO DE TODOS OS DADOS DESSA SUBSCRIPTION:
    q.Replace(
        q.Select(
            "ref",
            q.Get(
                q.Match(
                    q.Index('subscription_by_id'),
                    subscription.id,
                )
            )
        ),
        //POR ESSES DADOS AQUI, OU SEJA, POR NOVOS DADOS QUE FORAM PASSADOS PELO USUÁRIO
        {data: subscriptionData}
    )
   }
}