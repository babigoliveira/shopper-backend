## Descrição 

1ª etapa do desafio para vaga Full-Stack da Shopper | Back-End

## Ferramentas e tecnologias utilizadas

- NestJS - framework REST
- MongoDB - banco de dados
- Mongoose - ORM
- Jest - biblioteca de testes
- Docker
- Zod - Validação de dados

## O que foi feito?

- [x] Testes end to end
- [x] Upload e processamento da imagem
- [x] Confirmação da leitura
- [x] Busca com filtros
- [x] Tratamento de erros
- [x] 100% de coverage

## Setup

```bash
$ docker compose up
```

Documentação do swagger: http://localhost:3000/api

## Testes

```bash
$  docker compose run app npm run test:e2e:cov
```
