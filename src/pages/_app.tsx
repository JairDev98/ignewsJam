import {AppProps} from 'next/app';

import { Header } from '../components/Header';
//IMPORTANDO E FAZENDO A RENOMEAÇÃO DESSE PROVIDER
import {Provider as NextAuthProvider} from 'next-auth/client';

import '../styles/global.scss';

function MyApp({ Component, pageProps }: AppProps) {
  //pageProps.session = quando é dado um f5 na pagina as informaçõe da sessão ativa do usuário vão 
  //chegar atraves desse pageprops provider
  return(
    <NextAuthProvider session={pageProps.session}>
      <Header />
      <Component {...pageProps} />
    </ NextAuthProvider>
  )
}

export default MyApp
