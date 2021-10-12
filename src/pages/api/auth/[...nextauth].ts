//FAZENDO A IMPORTAÇÃO DA QUERY PARA SER UTILIZADA E RENOMEANDO ELA PARA APENAS Q
import { query as q } from 'faunadb';

import NextAuth from 'next-auth';
import Providers from 'next-auth/providers'

// FAZENDO A IMPORTAÇÃO DO FAUNA
import { fauna } from '../../../services/fauna';

export default NextAuth({
    providers:[
        Providers.GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            //QUAIS INFORMAÇÕES EU QUERO TER ACESSO DO USUÁRIO
            //CASO NECESSITAR DE OUTROS ESCOPOS SÓ COLOCAR UMA VIRGULA E OS DEMAIS ESCOPOS
            scope: 'read:user'
        }),
    ],
    callbacks:{
        //UMA NOVA CALLBACK QUE ESTÁ MODIFICANDO O SESSION, POR AQUI IREMOS PASSAR OS DADOS DO SESSION MODIFICADO
        async session(session){

            //CASO NÃO FOR ENCONTRADA A CONDIÇÃO DE ATIVA NA ASSINATURA IRÁ RETORNAR UM NULO NO CATCH
            try{
                const userActiveSubscription = await fauna.query(
                //selecionando uma subscripiton por meio de uma ref do usuário
                    q.Get(
                        //Fazendo uma interseção para se dar Match em mais de um mesmo dado
                        q.Intersection([
                            q.Match(
                                q.Index('subscription_by_user_ref'),
                                //selecionando a ref do usuário
                                q.Select(
                                    "ref",
                                    q.Get(
                                        q.Match(
                                            q.Index('user_by_email'),
                                            q.Casefold(session.user.email)
                                        )
                                    )
                                )
                            ),
                            q.Match(
                                q.Index('subscription_by_status'),
                                "active"
                            )
                        ]),
                       
                    )
            )

            return {
                ...session, 
                activeSubscription: userActiveSubscription}
            } catch {
                return{
                    ...session,
                    activeSubscription: null,
                }
            }

            
        },
        async signIn(user, account, profile){
            const { email } = user;
            
            // TEMOS UMA CASCATA DE CONDIÇÕES QUE FALA QUE CASO NÃO EXISTA UM MATCH DENTRO DE USER_BY_EMAIL DE USER.EMAIL TUDO EM LETRA MINUSCULA
            //ELE FARA O REGISTRO DO EMAIL
            //CASO NÃO EXISTA ELE APENAS BUSCARÁ ESSE EMAIL DENTRO DE USER_BY_EMAIL
            try{
                await fauna.query(
                    q.If(
                        q.Not(
                            q.Exists(
                                q.Match(
                                    q.Index('user_by_email'),
                                    q.Casefold(user.email)
                                )
                            )
                        ),
                        q.Create(
                            //PASSANDO A COLLETION QUE SERÁ EFETUADA A INSERÇÃO COMO PRIMEIRO PARAMETRO
                            //PASSANDO O DADO QUE SERÁ ARMAZENADO COMO SEGUNDO PARAMETRO
                            q.Collection('users'),
                            { data: { email }}
                    ),
                    q.Get(
                        q.Match(
                            q.Index('user_by_email'),
                            q.Casefold(user.email)
                        )
                    )
                )
            )

                return true
            }catch (err) {
                console.log(err);
                return false
            }
        },
    }
})