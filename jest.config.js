module.exports = {
    testPathIgnorePatterns:["/node_modules/", "/.next/"],

    setupFilesAfterEnv:[
        "<rootDir>/src/tests/setupTests.ts"
    ],

    transform:{
        "^.+\\.(js|jsx|ts|tsx)$" : "<rootDir>/node_modules/babel-jest"
    },

    moduleNameMapper:{
        "\\.(scss|css|sass)$" : "identity-obj-proxy"
    },

    testEnvironment: 'jsdom',

    //ATIVANDO O COVERAGEREPORT
    collectCoverage: true,
    //QUAIS ARQUIVOS QUEREMOS COLETAR O COVERAGEREPORT
    collectCoverageFrom: [
        //DE TODOS OS ARQUIVOS QUE ESTIVEREM DENTRO DA PASTA SRC, DENTRO DE QUALQUER PASTA
        "src/**/*.{tsx}",
        //EXCLUINDO APENAS OS ARQUIVOS QUE CONTÉM .SPEC.TSX
        "!src/**/*.spec.tsx",
        //IGNORANDO QUALQUER ARQUIVO COM O _APP E O _DOCUMENT
        "!src/**/_app.tsx",
        "!src/**/_document.tsx"

    ],
    //PARA TERMOS UMA OPÇÃO DE FEEDBACK EM JSON.
    coverageReporters: ["lcov", "json"]
};