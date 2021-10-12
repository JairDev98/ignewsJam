import {render, screen, fireEvent} from '@testing-library/react'
import { mocked } from 'ts-jest/utils';
import { signIn, useSession } from 'next-auth/client';
import { useRouter } from 'next/router';

import { SubscribeButton } from '.'

jest.mock('next-auth/client');
jest.mock('next/router');


describe('SubscribeButton component', () => {
    //1
    //VERIFICANDO SE O BOTÃO ESTÁ SENDO RENDERIZADO EM TELA
    it('renders correctly', ()=>{
        const useSessionMocked = mocked(useSession)

        useSessionMocked.mockReturnValueOnce([null, false]);

        render(<SubscribeButton />)
    
        expect(screen.getByText('Subscribe now')).toBeInTheDocument()
    })

    //2
    //USUÁRIO REDIRECIONADO QUANDO ELE NÃO TEM UMA SUBCRIPTION ATIVA
    it('redirects user to sign in when not authenticated', ()=>{
        const useSessionMocked = mocked(useSession)

        useSessionMocked.mockReturnValueOnce([null, false]);

        //PASSANDO SIGNIN PARA O MOCKED PEGADO DO USESESSION 'MOCADO' ACIMA. 
        const signInMocked = mocked(signIn)

        render(<SubscribeButton />)

        //ELE VAI RETORNAR O BOTÃO PELO TEXTO, POIS A NOSSA APLICAÇÃO REDIRECIONA PARA A PÁGINA INICIAL COM SUBCRIBE NOW
        const subscribeButton = screen.getByText('Subscribe now')

        //EVENTO DA LIB QUE FAZ O DISPARO DE EVENTO DE CLIQUE DO BOTÃO
        fireEvent.click(subscribeButton)

        //VALIDANDO SE A FUNCÇÃO SIGNINMOCKED FOI CHAMADA PRA SABER SE O USUÁRIO FOI REDIRECIONADO PARA A PAGINA INICIAL.
        expect(signInMocked).toHaveBeenCalled()
    })
    
    
    //3
    //ESPERAMOS QUE O USÁRIO SEJA REDIRECIONADO PARA A TELA DE POSTS QUANDO ELE TEM UMA INSCRIÇÃO ATIVA
    it('redirects to posts when user already has a subscription ', () => {
        const useRouterMocked = mocked(useRouter)
        const useSessionMocked = mocked(useSession)
        const pushMock = jest.fn()

        //RETORNA QUE TEM UM USUÁRIO LOGADO
        useSessionMocked.mockReturnValueOnce([
            {
                user: {
                    name: 'John Doe', 
                    email: 'john.doe@example.com'
                }, 
                activeSubscription: 'fake-active-subscription',
                expires: 'fake-expires'
            },
            false
        ])

        //COLOANDO O AS ANY NO FINAL PARA DE APARECER ALGUNS ERROS
        useRouterMocked.mockReturnValueOnce({
            //REPASSANDO O VALOR DO PUSHMOCK PARA O PUSH AO QUAL TIVEMOS DE IMPORTAR DE USEROUTER PARA
            //PODERMOS UTILIZAR
            push: pushMock
        } as any)

        render(<SubscribeButton/>)

        //VALIDANDO O RETORNO DO BOTÃO PELO TEXTO
        const subscribeButton = screen.getByText('Subscribe now')

        //EVENTO DA LIB QUE FAZ O DISPARO DE DO BOTÃO
        fireEvent.click(subscribeButton)

        expect(pushMock).toHaveBeenCalled()
    })
})

