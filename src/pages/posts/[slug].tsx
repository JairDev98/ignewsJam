import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import Head from "next/head";
import { RichText } from "prismic-dom";
import { getPrimiscClient } from "../../services/prismic";

import styles from './post.module.scss';

interface PostProps{
    post:{
        slug: string;
        title:string;
        content:string;
        updatedAt:string;
    }
}

export default function Post({ post }: PostProps) {
    return(
        <>
            <Head>
                <title>{post.title} |Ignews</title>
            </Head>

            <main className={styles.container}>
                <article className={styles.post}>
                    <h1>{post.title}</h1>
                    <time>{post.updatedAt}</time>
                    <div 
                     className={styles.postContent}
                     dangerouslySetInnerHTML={{__html: post.content}} />
                </article>
            </main>
        </>
    );
}

//DETALHE AQUI A PÁGINA PODE SER TANTO EM ESTATICA QUANTO EM DINAMICA, ENTRETANTO SE A PÁGINA FOR ESTATICA
//QUALQUER USUÁRIO VAI CONSEGUIR VISUALIZAR O SEU CONTEUDO ESTANDO OU NÃO CADASTRADO NA APLICAÇÃO, OU  SEJA, NÃO É PROTEGIDA
//NESSE CASO VAMOS FAZER A PÁGINA PROTEGIDA POR MEIO DE GETSERVERSIDEPROPS, MESMO ELE TENDO QUE IR TODA VEZ BUSCAR O CONTEUDO DENTRO DO PRISMIC
//APENAS ELE CONSEGUE FAZER A VERIFICAÇÃO SE O USUÁRIO ESTÁ LOGADO NA APLICAÇÃO PARA AI SIM PERMITIR SEU ACESSO AO CONTEUDO.

//PELO PARAMS BUSCAMOS O SLUG DO POST
export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
    //AQUI ELE VAI BUSCAR OS COOKIES PARA SABER SE O USUÁRIO ESTÁ LOGADO OU NÃO
    const session = await getSession({ req })
    const { slug } = params;

    if(!session?.activeSubscription){
        return{
            redirect:{
                destination: '/',
                //ESSE PERMANENT É PARA O USUÁRIO NÃO SER MOVIDO PERMANENTEMENTE, POIS APÓS SEU ACESSO SER NEGADO POR FALTA DE ASSINATURA ELE PODE CRIAR UMA
                permanent: false,
            }
        }
    }

    const prismic = getPrimiscClient(req)

    //BUSCANDO O DOCUMENTO PELO UID QUE É O SLUG DELE, DEPOIS PASSANDO O TIPO DO DOCUMENTO E O SLUG
    //PASSAMOS POR UMA STRING O SLUG POIS NÃO É UM ARRAY AS INFORMAÇÕES, POIS SE TRATA DE UMA POSTAGEM UNICA
    const response = await prismic.getByUID('publication', String(slug), {})

    const post ={
        slug,
        title: RichText.asText(response.data.title),
        content: RichText.asHtml(response.data.content),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-br',{
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    };

    return {
        props: {
            post,
        }
    }
}