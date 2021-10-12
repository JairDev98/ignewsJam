import { FaGithub } from 'react-icons/fa'
import { FiX } from 'react-icons/fi';
//signIn = IMPORTAÇÃO DESSA FUNÇÃO QUE REALIZA A AUTENTICAÇÃO DO USUÁRIO EM SI
//useSession = RETORNA INFORMAÇÕES SE O USUÁRIO TEM UMA SESSÃO ATIVA OU NÃO
//signOut = encerra o login independente de por qual auth foi efetuado login
import {signIn, signOut ,useSession} from 'next-auth/client';

import styles from './styles.module.scss';

export function SignInButton(){
    //DESESTRUTURANDO AS INFORMAÇÕES RECEBIDAS COM UM ARRAY
    const [sesion] = useSession();

    //CONDICIONAL UTILIZANDO O RETURN, SE O USUÁRIO ESTIVER COM A BOOLEANO ACIMA IGUAL A TRUE EXIBIR
    //O PRIMEIRO RESULTADO, CASO NÃO, SERÁ EXIBIDO O SEGUNDO RESULTADO
    return sesion ? (
        <button 
        type="button"
        className={styles.signInButton}
        onClick={()=> signOut()}
        >
            <FaGithub color="#04d361" />
            {sesion.user.name}

            <FiX color="#737380" className={styles.closeIcon} />
        </button>
    ) : (
        <button 
        type="button"
        className={styles.signInButton}
        //DISPARANDO A FUNÇÃO SIGNIN COM A AUTENTICAÇÃO QUE ELE QUER UTILIZAR
        onClick={() => signIn('github')}
        >
            <FaGithub color="#eba417" />
            Sign in with Github
        </button>
    );
}