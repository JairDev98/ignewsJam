import {render, screen} from '@testing-library/react'

import { Header} from '.'

//MANTER POIS O HEADER UTILIZA O ACTIVE LINK QUE POR SUA VEZ UTILIZA O MOOK
jest.mock('next/router', ()=>{
    return{
        useRouter(){
            return{
                asPath:'/'
            }
        }
    }
})


jest.mock('next-auth/client', () => {
    return{
        useSession() {
            return [null, false]
        }
    }
})


describe('ActiveLink component', () => {

    it('renders correct', ()=>{
    
        render(
            <Header />
        )
    
        expect(screen.getByText('Home')).toBeInTheDocument
        expect(screen.getByText('Posts')).toBeInTheDocument
    })

})

