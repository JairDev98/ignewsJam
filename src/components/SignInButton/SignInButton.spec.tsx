import {render, screen} from '@testing-library/react'
//IMPORTANDO O MOCKED PARA SER UTILIZADO
import { mocked } from 'ts-jest/utils';
//FAZENDO A IMPORTAÇÃO DO USESESSION
import { useSession } from 'next-auth/client';
import { SignInButton } from '.'

//UNICO DE QUEM O SIGNINBUTTON DEPENDE
jest.mock('next-auth/client')


describe('SignInButton component', () => {
    //QUANDO O USUÁRIO NÃO ESTÁ AUTENTICADO
    it('renders correct when user is not authenticated', ()=>{
        const useSessionMocked = mocked(useSession)

        //A PROXIMA VEZ QUE A FUNÇÃO SIGNINBUTTON FOR RENDERIZADO VAI SER RETORNADO ESSES VALORES
        //QUANDO COLOCAMOS O MOCKRETURNVALUEONCE ESTAMOS DIZENDO QUE QUEREMOS O RETORNO APENAS NESSA PRIMEIRA RENDERIZAÇÃO
        //E NÃO NOS DEMAIS
        useSessionMocked.mockReturnValueOnce([null, false])

        render(<SignInButton />)
    
        expect(screen.getByText('Sign in with Github')).toBeInTheDocument
    })

    //QUANDO O USUÁRIO ESTÁ AUTENTICADO
    it('renders correct when user is not authenticated', ()=>{
        const useSessionMocked = mocked(useSession)

        //AQUI ESTÁ SENDO EFETUADO O RETORNO DESTE USUÁRIO CORRETAMENTE
        useSessionMocked.mockReturnValueOnce([
            { user : { name: 'John Doe', email: 'john.doe@example.com'}, expires: 'fake-expires'}, 
            false
        ])

        render(<SignInButton />)
    
        expect(screen.getByText('John Doe')).toBeInTheDocument
    })

})

