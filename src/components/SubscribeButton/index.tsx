import { signIn, useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';
import styles from './styles.module.scss';

export function SubscribeButton(){
    const [session] = useSession();
    //pode ser usado em qualquer componente para redirecionar para uma página
    const router = useRouter();

   async function handleSubscride(){
        //CASO O USUÁRIO NÃO TENHA SE LOGADO COM O GITHUB
        if(!session){
            signIn('github')
            return;
        }
        //CRIAÇÃO DA CHECKOUT SESSION
        //aqui caso o usuário já tiver uma sessão ativa ele será redirecionado para a página de posts
        if(session.activeSubscription){
            router.push('/posts');
            return;
        }

        try{
            //AQUI O SUBSCRIBE É NOME DO ARQUIVO QUE É A ROTA NESSE CASO SUBSCRIBE
            const response = await api.post('/subscribe')

            const { sessionId } = response.data;

            const stripe = await getStripeJs()

            //PASSANDO UM OBJETO CONTENDO O SESSION ID PARA SERVICE DO STRIPE
            await stripe.redirectToCheckout({sessionId})
        } catch (err){
            alert(err.message);
        }
    }

    return(
        <button type="button"
        className={styles.subscribeButton}
        onClick={handleSubscride}
        >
            Subscribe now
        </button>
    )
}