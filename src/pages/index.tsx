import {GetStaticProps} from 'next';

import Head from 'next/head';

import { SubscribeButton } from '../components/SubscribeButton';
import { stripe } from '../services/stripe';

import styles from './home.module.scss';

interface HomeProps{
  product:{
    priceId: string;
    amount: string;
  }
}

export default function Home({product}: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>

         <main className={styles.contentContainer}>
           <section className={styles.hero}>
              <span>👏🏽 Hey, welcome</span>
              <h1>News about the<span>React</span>world.</h1>
              <p>
                Get access to all the publications <br />
                <span>for {product.amount} month</span>
              </p>
              <SubscribeButton/>
           </section>

           <img src="/images/avatar.svg" alt="Girl coding" />
         </main>
    </>  
  )
}

export const getStaticProps:GetStaticProps = async () =>{
  //retrieve = buscar um só dentro do stripe e passamos o API ID do price no produto
  const price = await stripe.prices.retrieve('price_1Ibam6JP6seK3RtjcUMZKDQS', {
    //QUANDO SE BUSCA OS DADOS DO PREÇO DE UM PRODUTO ELE RETORNA O ID DO PRODUTO AO QUAL AQUELE PREÇO ESTÁ RELACIONADO
    //O EXPAND É JUSTAMENTE PRA SE TER TODAS AS INFORMAÇÕES DO PRODUTO, COMO TITULO, IMAGEM...
    expand: ['product']
  })

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price.unit_amount / 100),
  }

  return{
    props:{
      product,
    },
    revalidate: 60 * 60 * 24 // 24 hours
  }
}