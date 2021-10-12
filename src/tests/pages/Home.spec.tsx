import { render, screen } from '@testing-library/react'
import { stripe } from '../../services/stripe';
import { mocked } from 'ts-jest/utils';

import Home, {getStaticProps} from '../../pages';

jest.mock('next/router');
jest.mock('next-auth/client', () =>{
    return{
        useSession:()=> [null, false]
    }
})

jest.mock('../../services/stripe')

describe('Home page', () => {
    it('renders correctly', () => {
        render(<Home product={{priceId: 'fake-priceID', amount: 'R$10,00'}} />)

        //for R$10,00 month, É O TEXTO ESPERADO PELO TESTE PARA PODER SER VALIDADO
        expect(screen.getByText("for R$10,00 month")).toBeInTheDocument()
    })

    //SIMULANDO UM RETORNO DA API DO STRIPE, COMO É UMA FUNÇÃO ASSINCRONA FAZEMOS COMO ASSYN E WAIT ONDE É ESPERADO O WAIT
    it('loads initial data', async () => {
        //REQUISITANDO ESTA FUNÇÃO ESPECIFICA DO STRIPE, IGUALMENTE ESTÁ SENDO EFETUADO NA PÁGINA HOME
        const retriveStripePricesMocked = mocked(stripe.prices.retrieve);

        //SEMPRE QUE A FUNÇÃO ESPERAR UMA PROMISSE RETORNMAMOS COM mockResolvedValueOnce, COM AS PROPRIEDADES PARA TESTAR
        retriveStripePricesMocked.mockResolvedValueOnce({
            id: 'fake-price-id',
            unit_amount: 1000,
        //PASSANDO O AS ANY PARA O TYPESCRIPT PARAR DE DAR ERRO    
        } as any)

        const response = await getStaticProps({})

        //VALIDAR QUANDO ESPERAMOS QUE O OBJETO DENTRO DA RESPOSTA (RETORNO) TENHA TAIS INFORMAÇÕES
        //ESSE EXPECT VAI VALIDAR SE ESSE OBJETO TEM PELO MENOS ESSAS INFORMAÇÕES ABAIXO
        expect(response).toEqual(
        //ESSA EXPRESSÃO ABAIXO ELE VERIFICAR SE OBJETO CONTEM E NÃO SE É EXTRITAMENTE IGUAL AO RETORNADO    
            expect.objectContaining({
                props: {
                    product: {
                        priceId: 'fake-price-id',
//\xa NECESSÁRIO POIS NO TESTE É ESPERADO RECEBER O VALOR SEM ESPAÇOS, MAS A FUNÇÃO ESTAVA RETORNANDO ELE ESPAÇADO                        
                        amount: 'US$\xa010.00'
                    }
                }
            })
        )
    })
})