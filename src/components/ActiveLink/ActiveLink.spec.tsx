//render: VAI EFETUAR A RENDERIZAÇÃO DE UM COMPONENTE DE UMA MANEIRA VIRTUAL, NÃO DE UMA MANEIRA REAL, E DE UMA MANEIRA
//QUE VAMOS CONSEGUIR VISUALIZAR O OUTPUT DE UM COMPONENTE.
import {render, screen} from '@testing-library/react'
//IMPORTANDO O COMPONENTE
import { ActiveLink } from '.'

//TODA VEZ QUE UM COMPONENTE DA APLICAÇÃO IMPORTAR O next/router, VAMOS FALAR O QUE ELE VAI RETORNAR
//AGORA QUANDO O COMPONENTE QUISER O RETORNO DO USEROUTER ELE IRÁ RETORNAR O NOSSO MOCK
jest.mock('next/router', ()=>{
    return{
        useRouter(){
            return{
                asPath:'/'
            }
        }
    }
})

//CRIA UMA CATEGORIZAÇÃO DOS TESTES, COM TODOS OS TESTES DENTRO DESTA CATEGORIA
describe('ActiveLink component', () => {

//1° TESTE
//VERIFICAR SE O ACTIVE LINK ESTÁ RENDERIZANDO DA FORMA CORRETA
    it('active link renders correct', ()=>{
    //PARA MOSTRAR QUE ESTA SENDO CRIADO UMA VISUALIZAÇÃO VIRTUAL POR ESSE HTML CRIADO POR ELE, ESSE RENDER DEVOLVE ALGUMAS
    //COISAS E VAMOS PEGA LOS COM O DEBUG.
    
    //getByText: BUSCA UM DETERMINADO TEXTO DENTRO DO ELEMENTO
        render(
            <ActiveLink href="/" activeClassName="active">
                <a>Home</a>
            </ActiveLink>
        )
    
        //FUNCIONA COMO SE FOSSE UM CONSOLE LOG, MOSTRANDO O HTML "VIRTUAL" GERADO PARA O TESTE
        //debug()
        
        //ELE VAI BUSCAR UM ELEMENTO QUE CONTENHA O TEXT 'Home' E QUE ESTE ELEMENTO = .toBeInTheDocument ESTEJA NO DOCUMENTO DO TEST, OU SEJA,
        //PRESENTE NESTA RENDERIZAÇÃO
        expect(screen.getByText('Home')).toBeInTheDocument
    })
    
    //2° TESTE
    //VERIFICAR SE O ACTIVE LINK ESTÁ RECEBENDO A CLASSE ACTIVE QUANDO ELE ESTIVER ATIVO
    it('active link is receiving active class', ()=>{
            render(
            //O TESTE VAI RETORNAR COMO VERDADEIRO POIS ESTAMOS PASSANDO COMO LINK O DIRETÓRIO ROOT QUE ESTÁ SENDO
            //RETORNADO NO MOOK E ESTÁ SENDO RETORNADO COM A CLASSE ACTIVE.
                <ActiveLink href="/" activeClassName="active">
                    <a>Home</a>
                </ActiveLink>
            )
        
            //ESPERAMOS QUE O ELEMENTO HOME TENHA A CLASSE CHAMADA ACTIVE
            expect(screen.getByText('Home')).toHaveClass('active')
        })

})

