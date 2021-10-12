import { render, screen } from '@testing-library/react'
import { mocked } from 'ts-jest/utils';
import { useSession } from 'next-auth/client';

import Post, {getStaticProps} from '../../pages/posts/preview/[slug]';
import { getPrimiscClient } from '../../services/prismic';
import { useRouter } from 'next/router';

//CRIANDO UM ARRAY DE UM POST
const post = {
    slug: 'my-new-post', 
    title: 'My New Post', 
    content: '<p>Post content</p>', 
    updatedAt: '10 de Abril'
};

//MOCANDO O NEXT-AUTH PARA O SEGUNDO TESTE
jest.mock('next-auth/client')
jest.mock('next/router')
jest.mock('../../services/prismic')

describe('Post Preview page', () => {
    //1-TESTANDO SE O COMPONENTE ESTÁ RENDERIZANDO NA TELA CORRETAMENTE
    it('renders correctly', () => {
        const useSessionMocked = mocked(useSession)

        //RETORNANDO NULO E FALSO PARA FALAR QUE O USUÁRIO NÃO ESTÁ AUTENTICADO
        useSessionMocked.mockReturnValueOnce([null, false])

        render(<Post post={post}/>)

        expect(screen.getByText("My New Post")).toBeInTheDocument()
        expect(screen.getByText("Post content")).toBeInTheDocument()
        expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument()
    })

    //2 - VERIFICAR SE A PÁGINA REDIRECIONA O USUÁRIO PARA A PÁGINA INTEIRA CASO ELE JÁ ESTEJA INSCRITO
    it('redirects user to full post when user is subscribed', async () => {
        const useSessionMocked = mocked(useSession)
        const userRouterMocked = mocked(useRouter)
        const pushMock = jest.fn();

        //A UNICA COISA QUE É VERIFICADA É SE O USUÁRIO TEM UMA ACTIVESUBSCRIPTION ATIVA
        useSessionMocked.mockReturnValueOnce([
            {activeSubscription: 'fake-active-subscription'},
            false
        ] as any)

        userRouterMocked.mockReturnValueOnce({
            push: pushMock,
        } as any)

        render(<Post post={post}/>)

        //ESPERA QUE SEJA REDIRECIONADO PARA ESSA PÁGINA
        expect(pushMock).toHaveBeenCalledWith('/posts/my-new-post')
    })

    //3 - SE OS DADOS ESTÃO SENDO CARREGADOS CASO O USUÁRIO ESTEJA LOGADO
    it('loads initial data', async () => {
        //MOCANDO CLIENT DO PRISMIC
        const getPrimiscClientMocked= mocked(getPrimiscClient)

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

        const response = await getStaticProps({ params: {slug: 'my-new-post'} })
        
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