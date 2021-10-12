import { GetStaticProps } from "next";
import Link from 'next/link';
import Head from "next/head";
import { RichText } from "prismic-dom";
import { useEffect } from "react";
import { useRouter } from "next/router";

import { useSession } from "next-auth/client";
import { getPrimiscClient } from "../../../services/prismic";

import styles from '../post.module.scss';


interface PostPreviewProps{
    post:{
        slug: string;
        title:string;
        content:string;
        updatedAt:string;
    }
}

export default function PostPreview({ post }: PostPreviewProps) {
    const [session] = useSession()
    const router = useRouter();

    //UTILIZANDO USEEFFECT NA APLICAÇÃO PARA DETECTAR CASO ALGUM ELEMENTO TENHA SIDO MODIFICADO
    //ESSE USEEFFECT EM ESPECIFICO VAI REDIRECIONAR O USUÁRIO JÁ LOGADO NA APLICAÇÃO E COM A ASSINATURA
    //EM DIA PARA A PAGINA COM A POSTAGEM COMPLETA SEM FICAR VISUALIZANDO O PREVIEW
    useEffect(() => {
        //USUÁRIO COM A SUBSCRIPTION ATIVA?
        if(session?.activeSubscription){
            //SE SIM SERÁ REDIRECIONADO PARA A POSTAGEM COMPLETA
            router.push(`/posts/${post.slug}`)
        }
        //DEPENDENCIA QUE IRÁ DECTECTAR CASO TENHA A ALTERAÇÃO DA SESSÃO NA PÁGINA.
    }, [session])

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
                     className={`${styles.postContent} ${styles.previewContent}`}
                     dangerouslySetInnerHTML={{__html: post.content}} 
                     />

                     <div className={styles.continueReading}>
                         Wanna continue reading?
                        <Link href="/">
                            <a href="">Subscribe now 🤗</a>
                        </Link>
                     </div>
                </article>
            </main>
        </>
    );
}

export const getStaticPaths = () =>{
    return{
        paths: [],
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
   
    const { slug } = params;

    const prismic = getPrimiscClient()

    const response = await prismic.getByUID('publication', String(slug), {})

    const post ={
        slug,
        title: RichText.asText(response.data.title),
        //ESTAMOS FAZENDO UM SPLICE PRA QUE SEJAM PEGOS APENAS OS 3 PRIMEIROS BLOCOS DE LINHAS DA POSTAGEM
        content: RichText.asHtml(response.data.content.splice(0, 3)),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-br',{
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    };

    return {
        props: {
            post,
        },
         //EM TODO GETSTATICPROPS É IMPORTANTE PASSAR ESSA PROPRIEDADE DE REVALIDATE PRA DIZER DE QUANTO
        //EM QUANTO TEMPO ESSA POSTAGEM ESTATICA SEJA ATUALIZADA CONFORME O ACESSO DAS PESSOAS
        revalidate: 60 *30, //30 MINUTES
    }
}