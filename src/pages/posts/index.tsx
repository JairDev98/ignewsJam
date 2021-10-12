import { GetStaticProps } from 'next';
import Head from 'next/head';
import Primisc from '@prismicio/client';
//IMPORTANTO O RICHTEXT PARA AS RESPOSTAS SEREM CONVERTIDAS PARA TEXTO
import { RichText } from 'prismic-dom';
import Link from 'next/link';

import { getPrimiscClient } from '../../services/prismic';
import styles from './styles.module.scss';

type Post = {
    slug:string;
    title:string;
    excerpt:string;
    updatedAt:string;
}

interface PostsProps {
    posts: Post[]
}

export default function Posts({posts}: PostsProps){
    return(
        <>
            <Head>
                <title>Posts | Ignews</title>
            </Head>

            <main className={styles.container}>
                <div className={styles.posts}>
                    {posts.map(post => (
                     //COLOCANDO O LINK DA PAGINA POR VOLTA DO RESUMO DA POSTAGEM COM A PÁGINA DO SLUG JA CORRESPONDENTE   
                     <Link key={post.slug} href={`/posts/${post.slug}`}>
                       <a>
                         <time>{post.updatedAt}</time>
                         <strong>{post.title}</strong>
                         <p>{post.excerpt}</p>
                     </a>
                     </Link>
                    ))}
                </div>
            </main>
        </>
    );
}

export const getStaticProps: GetStaticProps = async () =>{
    const prismic = getPrimiscClient()

    const response = await prismic.query(
        //AQUI ESTA SENDO EFETUADA UMA BUSCA POR TODOS OS DOCUMENTOS COM O TIPO IGUAL A PUBLICATION
        //PODE SER ARMAZENADO DENTRO DE UM ARRAY POIS PODEM SER BUSCADOS VÁRIOS PREDICATES (WHERE) DE DENTRO DO PRISMIC
       [ Primisc.predicates.at('document.type', 'publication')
    ], {
        //QUAIS DADOS SE QUER BUSCAR DESTA PUBLICAÇÃO
        //ELE JÁ TRAZ A DATA E O SLUG (ID) EM TODOS OS POSTS
        fetch:['publication.title', 'publication.content'],
        //QUANTAS PÁGINAS SE QUER TRAZER POR VEZ DO PRISMIC
        pageSize: 100,
    })

    //O RESULTS TRAZ OS ELEMENTOS RETORNADOS DE RESPONSE
    const posts = response.results.map(post =>{
        return {
            slug: post.uid,
            title: RichText.asText(post.data.title),
            //COMO O PRIMEIRO CONTEUDO DE UMA POSTAGEM PODE SER UM IMAGEM POR EXEMPLO, AQUI ESTÁ SENDO REALIZADA
            //UMA FILTRAGEM ONDE O RETORNO SERÁ O PRIMEIRO PARAGRÁFO ENCONTRADO.
            //CASO NÃO ECONTRAR NENHUM PRIMEIRO PARAGRAFO O RETORNO SERÁ UMA STRING VAZIA.
            excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
            updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-br',{
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            })
        };
    });

    return{
        props:{posts}
    }
}