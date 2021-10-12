import { render, screen } from '@testing-library/react'
import { mocked } from 'ts-jest/utils';
import { getSession } from 'next-auth/client';

import Post, {getServerSideProps} from '../../pages/posts/[slug]';
import { getPrimiscClient } from '../../services/prismic';

//CRIANDO UM ARRAY DE UM POST
const post = {
    slug: 'my-new-post', 
    title: 'My New Post', 
    content: '<p>Post content</p>', 
    updatedAt: '10 de Abril'
};

//MOCANDO O NEXT-AUTH PARA O SEGUNDO TESTE
jest.mock('next-auth/client')
jest.mock('../../services/prismic')

describe('Post page', () => {
    //1-TESTANDO SE O COMPONENTE ESTÁ RENDERIZANDO NA TELA CORRETAMENTE
    it('renders correctly', () => {
        render(<Post post={post}/>)

        expect(screen.getByText("My New Post")).toBeInTheDocument()
        //TAMBÉM ESPERAMOS VER O CONTEUDO DO POST.
        expect(screen.getByText("Post content")).toBeInTheDocument()
    })

    //2 - VERIFICAÇÃO DO USUÁRIO NÃO TER UMA INSCRIÇÃO ATIVA
    it('redirects user if no subscription is found', async () => {
        const getSessionMocked = mocked(getSession)

        //quando esta funcção mocked for chamada ela vai retornar a activeSubscripton como nulo
        //RETORNANOS A SESSÃO INTEIRA COMO NULA
        getSessionMocked.mockResolvedValueOnce(null);

        //A VERIFICAÇÃO SE O USUÁRIO ESTÁ ATIVO OU NÃO É ATRAVÉS DOS COOKIES
        //VAMOS ENVIAR APENAS OS PARAMS E O SLUG PARA
        const response = await getServerSideProps({params: {slug: 'my-new-post'}} as any)
        
        expect(response).toEqual(
            expect.objectContaining({
                //NECESSÁRIO MANDAR NOVAMENTE ELE CHEGAR, POIS SENÃO ESTE OBJETVO VAI SER COMPARADO EXATAMENTE COM O VALOR
                //E NÃO APENAS CONTÉM O DESTINATION
               redirect:expect.objectContaining({
                destination: '/',
               })
            })
        )
    })

    //3 - SE OS DADOS ESTÃO SENDO CARREGADOS CASO O USUÁRIO ESTEJA LOGADO
    it('loads initial data', async () => {
        const getSessionMocked = mocked(getSession)
        //MOCANDO CLIENT DO PRISMIC
        const getPrimiscClientMocked= mocked(getPrimiscClient)

        //AQUI ELE ESTÁ APENAS VERIFICANDO SE O USUÁRIO TEM UM SUBSCRIÇÃO ATIVA, NÃO SENDO NECESSÁRIO PASSAR TODOS OS DADOS
        //DO USUÁRIO
        getSessionMocked.mockResolvedValueOnce({
            activeSubscription: 'fake-active-subscripton'
        } as any);

        //RETORNANDO A UNICA FUNÇÃO QUE SE UTILIZA DO PRISMICLIENT
        getPrimiscClientMocked.mockReturnValueOnce({
            getByUID: jest.fn().mockResolvedValueOnce({
                //DEVOLVER UM OBJETO QUE CONTEM
                data:{
                    title: [ {type: 'heading', text: 'My new post'}],
                    content: [ {type: 'paragraph', text: 'Post content'}],
                },
                last_publication_date: '04-01-2021'
            })
        } as any)

        const response = await getServerSideProps({params: {slug: 'my-new-post'}} as any)
        
        expect(response).toEqual(
            expect.objectContaining({
                props:{
                    post:{
                        slug: 'my-new-post',
                        title: 'My new post',
                        content: '<p>Post content</p>',
                        updatedAt: '2021 M04 01'
                    }
                }
            })
        )
    })
})