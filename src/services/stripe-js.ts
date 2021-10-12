import { loadStripe } from '@stripe/stripe-js';

export async function getStripeJs(){
    //PASSAMOS PARA ESSA CONSTANTE A CHAVE PUBLICA QUE ESTÁ NO STRIPE
    const stripeJs = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)

    return stripeJs
}