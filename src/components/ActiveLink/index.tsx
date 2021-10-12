import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/router';
//O ELEMENTO CLONEELEMENT PERMITE CLONAR UM ELEMENTO E ADICIONAR COISAS NELE SEM ELE SE TORNAR MAIS DE UM ELEMENTO
import { ReactElement, cloneElement} from 'react';

//RECEBER TODOS OS ELEMENTOS QUE SÃO PASSADOS PARA O LINK
//AQUI ESTAMOS PASSANDO TODAS AS PROPRIEDADES + CHILDREN + ACTIVECLASSNAME
interface ActiveLinkProps extends LinkProps{
    //VAI SER UM REACTELEMENT POIS QUEREMOS RECEBER UM ELEMENTO REACT E TEM QUE SER APENAS UM ELEMENTO DENTRO DO LINK, NO CASO O A
    children: ReactElement;
    //QUAL A CLASSE QUE EU QUERO COLOCAR QUANDO O LINK ESTÁ ATIVO
    activeClassName: string;
}

export function ActiveLink({children, activeClassName, ...rest}: ActiveLinkProps){
    const { asPath } = useRouter()

    //PASSANDO UM BOOLEANO, CASO O NOME DO PATH FOR IGUAL AO QUE TEM DENTRO DO REST.HREF ELE RETORNA TRUE, CASO NÃO FOR ELE RETORNA FALSE
    const className = asPath === rest.href
     ? activeClassName
     : '';
    
    return(
        //REPASSANDO TODAS AS PROPRIEDADES QUE NÃO SÃO CHILDREN E ACTIVECLASSNAME PARA O LINK
        //ELEMENTO CLONADO E MODIFICADO SEM DEIXAR DE SER APENAS UM UNICO ELEMENTO
        <Link {...rest}>    
            {cloneElement(children, {className})}
        </Link>
    );
}