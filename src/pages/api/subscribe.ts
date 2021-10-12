import { NextApiRequest, NextApiResponse } from "next";
import { query as q } from 'faunadb';
import { getSession } from "next-auth/client";
import { fauna } from "../../services/fauna";
import { stripe } from "../../services/stripe";

//INTERFACE PASSADA AO USER
type User ={
    ref:{
        id:string;
    }
    data:{
        stripe_customer_id: string;
    }
}

export default async (req: NextApiRequest, res:NextApiResponse) => {
//COMO NÃO É UMA ROTA BACK END, NÃO TEMOS COMO SABER QUE ESSA FUNÇÃO SÓ VAI ESTAR DISPONÍVEL COM O MÉTODO HTTP POST
//VAMOS FAZER A CHECAGEM DO MÉTODO QUE ESTÁ SENDO PASSADO, SEMPRE QUE ESTOU CRIANDO ALGUMA COISA É O MÉTODO POST
//CASO O MÉTODO FOR DO TIPO POST VAMOS CRIAR UMA SESSÃO DO STRIPE
    if(req.method === 'POST'){
        const session = await getSession({ req })

        //FAZENDO UMA BUSCA NOS INDICES DO BANCO DE DADOS POR UM USUÁRIO COM O EMAIL INFORMADO NA SESSION
        //DENTRO DESSE USUÁRIO RETORNADO DENTRO DO FAUNA DENTRE AS INFORMAÇÕES TEMOS O ID DO USUÁRIO
        //PASSANDO O TIPO USER COMO RETORNO
        const user = await fauna.query<User>(
            q.Get(
                q.Match(
                    q.Index('user_by_email'),
                    q.Casefold(session.user.email)
                )
            )
        )

        //EFETUANDO A VERIFICAÇÃO PARA NÃO CADASTRAR O MESMO EMAIL NOVAMENTE COM OUTRO CUSTOMER ID, QUEREMOS APENAS ATUALIZAR CASO
        //ESSE USUÁRIO JÁ EXISTA NO BANCO DE DADOS
        let customerId = user.data.stripe_customer_id

        //CASO NÃO TENHA O CUSTOMERID SERÁ EFETUADA CRIAÇÃO DE UM CUSTOMER DENTRO DO STRIPE E DEPOIS UM UPDATE DENTRO DO FAUNADB
        //CASO JÁ TENHA ELE SIMPLESMESTE NÃO PASSA POR ESSA FUNÇÃO E INFORMA O CUSTOMERID JÁ EXISTENTE NO BANCO DE DADOS
        if(!customerId){

            const stripeCustomer = await stripe.customers.create({
                email: session.user.email,
                // metadata
            })

            await fauna.query(
                //ATUALIZAR UMA INFORMAÇÃO DENTRO DO USUÁRIO
                //ENTRETANTO É NECESSÁRIO BUSCAR POR QUAL MEIO SE PRETENDE ATUALIZAR O USUÁRIO NO NOSSO CASO É POR ID
                //FAZENDO A BUSCA ATRAVES DO USER JÁ RETORNANDO OS DADOS NA CONST USER QUE FAZ UMA CONSULTA NO FAUNA
                q.Update(
                    q.Ref(q.Collection('users'), user.ref.id),
                    {
                        data:{
                            stripe_customer_id: stripeCustomer.id,
                        }
                    }
                )
            )
            //REATRIBUINDO UM VALOR A VARIAVEL PRA ELA SEMPRE TER UM VALOR DISPONIVEL DENTRO DELA
            customerId = stripeCustomer.id;
        }
        

        const stripeCheckoutSession = await stripe.checkout.sessions.create({
            //CADASTRAR O USUÁRIO NO STRIPE
            //id do customer no stripe e não no banco de dados
            customer: customerId,
            //MEIO DE PAGAMENTO
            payment_method_types: ['card'],
            //OBRIGAR O USUÁRIO A PREENCHER O ENDEREÇO OU DEIXA O STRIPE LIDE COM ISSO DA MELHOR FORMA
            billing_address_collection: 'required',
            //QUAIS OS ITENS QUE A PESSOA VAI TER DENTRO DO CARRINHO, PASSAMOS UM OBJETO DENTRO DE UM VETOR
            line_items: [
                //O PRICE CORRESPONDE AO ID DO PREÇO
                { price: 'price_1Ibam6JP6seK3RtjcUMZKDQS', quantity: 1 }
            ],
            //PAGAMENTO RECORRENTE E NÃO DE UMA UNICA VEZ
            mode: 'subscription',
            //PERMITIR QUE SEJAM COLOCADOS CÓDIGOS PROMOCIONAIS CASO TENHAMOS FEITO ALGUMA PROMOÇÃO
            allow_promotion_codes: true,
            //PARA ONDE O USUÁRIO SERÁ REDIRECIONADO EM CASO DE SUCESSO
            success_url: process.env.STRIPE_SUCCESS_URL,
            //PARA ONDE O USUÁRIO SERÁ REDIRECIONADO QUANDO ELE CANCELA A REQUISIÇÃO
            cancel_url: process.env.STRIPE_CANCEL_URL
        })

        
        return res.status(200).json({ sessionId: stripeCheckoutSession.id})

    }else{
        //CASO O MÉTODO NÃO FOR POST DEVOLVEMOS ESSA RESPOSTA JUNTAMENTE COM O CÓDIGO 405
        res.setHeader('Allow', 'POST')
        res.status(405).end('Mehtod not allowed')
    }
}