import pactum from 'pactum';
import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Mercado', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://api-desafio-qa.onrender.com/mercado';

  p.request.setDefaultTimeout(30000);

  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  describe('Mercado', () => {
    let mercado = null;

    beforeEach(async () => {
      mercado = await p
        .spec()
        .post(`${baseUrl}`)
        .withJson({
          nome: faker.company.name(),
          cnpj: faker.string.numeric(14),
          endereco: faker.location.zipCode()
        })
        .expectStatus(StatusCodes.CREATED)
        .expectBodyContains('sucesso')
        .returns('novoMercado');
    });

    it('Criar um novo mercado inválido', async () => {
      await p
        .spec()
        .post(`${baseUrl}`)
        .expectStatus(StatusCodes.BAD_REQUEST)
        .expectBodyContains('errors');
    });

    it('Atualizar um mercado existente', async () => {
      const endereco = faker.location.zipCode();

      await p
        .spec()
        .put(`${baseUrl}/${mercado.id}`)
        .withJson({
          nome: mercado.nome,
          cnpj: mercado.cnpj,
          endereco: endereco
        })
        .expectStatus(StatusCodes.OK)
        .expectBodyContains('sucesso')
        .expectBodyContains(endereco);
    });

    it('Obter mercado existente', async () => {
      await p
        .spec()
        .get(`${baseUrl}/${mercado.id}`)
        .expectStatus(StatusCodes.OK);
    });

    it('Obter mercado inexistente', async () => {
      await p.spec().get(`${baseUrl}/0`).expectStatus(StatusCodes.NOT_FOUND);
    });

    it('Atualizar um mercado inexistente', async () => {
      await p.spec().put(`${baseUrl}/0`).expectStatus(StatusCodes.NOT_FOUND);
    });

    it('Deletar mercado existente', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/${mercado.id}`)
        .expectStatus(StatusCodes.OK);
    });

    it('Deletar mercado inexistente', async () => {
      await p.spec().delete(`${baseUrl}/0`).expectStatus(StatusCodes.NOT_FOUND);
    });
  });

  describe('Bebidas com álcool ', () => {
    let mercado = null;
    let bebida = null;

    beforeEach(async () => {
      mercado = await p
        .spec()
        .post(`${baseUrl}`)
        .withJson({
          nome: faker.company.name(),
          cnpj: faker.string.numeric(14),
          endereco: faker.location.zipCode()
        })
        .expectStatus(StatusCodes.CREATED)
        .expectBodyContains('sucesso')
        .returns('novoMercado');

      bebida = await p
        .spec()
        .post(`${baseUrl}/${mercado.id}/produtos/bebidas/comAlcool`)
        .withJson({
          nome: faker.commerce.product(),
          valor: faker.number.int() * 100
        })
        .expectStatus(StatusCodes.CREATED)
        .expectBodyContains('sucesso')
        .returns('product_item');
    });

    it('Criar uma nova bebida com álcool para loja inexistente', async () => {
      await p
        .spec()
        .post(`${baseUrl}/0/produtos/bebidas/comAlcool`)
        .withJson({
          nome: faker.commerce.productName(),
          valor: faker.number.float()
        })
        .expectStatus(StatusCodes.BAD_REQUEST)
        .expectBodyContains('errors');
    });

    it('Criar uma nova bebida com álcool inválida', async () => {
      await p
        .spec()
        .post(`${baseUrl}/${mercado.id}/produtos/bebidas/comAlcool`)
        .expectStatus(StatusCodes.BAD_REQUEST)
        .expectBodyContains('errors');
    });

    it('Obter bebidas com álcool válidas', async () => {
      await p
        .spec()
        .get(`${baseUrl}/${mercado.id}/produtos/bebidas/comAlcool`)
        .expectStatus(StatusCodes.OK)
        .expectBodyContains(bebida.nome);
    });

    it('Deletar bebida com álcool existente', async () => {
      await p
        .spec()
        .delete(
          `${baseUrl}/${mercado.id}/produtos/bebidas/comAlcool/${bebida.id}`
        )
        .expectStatus(StatusCodes.OK);
    });

    it('Deletar bebida com álcool inexistente', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/${mercado.id}/produtos/bebidas/comAlcool/0`)
        .expectStatus(StatusCodes.NOT_FOUND);
    });
  });

  describe('Bebidas sem álcool', () => {
    let mercado = null;

    beforeEach(async () => {
      mercado = await p
        .spec()
        .post(`${baseUrl}`)
        .withJson({
          nome: faker.company.name(),
          cnpj: faker.string.numeric(14),
          endereco: faker.location.zipCode()
        })
        .expectStatus(StatusCodes.CREATED)
        .expectBodyContains('sucesso')
        .returns('novoMercado');
    });

    it('Criar uma nova bebida sem álcool para loja inexistente', async () => {
      await p
        .spec()
        .post(`${baseUrl}/${mercado.id}/produtos/bebidas/semAlcool`)
        .withJson({
          nome: faker.commerce.product(),
          valor: faker.number.int() * 100
        })
        .expectStatus(StatusCodes.CREATED)
        .expectBodyContains('sucesso');
    });

    it('Criar uma nova bebida sem álcool para loja inexistente', async () => {
      await p
        .spec()
        .post(`${baseUrl}/0/produtos/bebidas/semAlcool`)
        .withJson({
          nome: faker.commerce.productName(),
          valor: faker.number.float()
        })
        .expectStatus(StatusCodes.BAD_REQUEST)
        .expectBodyContains('errors');
    });

    it('Criar uma nova bebida sem álcool inválida', async () => {
      await p
        .spec()
        .post(`${baseUrl}/${mercado.id}/produtos/bebidas/semAlcool`)
        .expectStatus(StatusCodes.BAD_REQUEST)
        .expectBodyContains('errors');
    });

    it('Obter bebidas sem álcool inexistentes', async () => {
      await p
        .spec()
        .get(`${baseUrl}/${mercado.id}/produtos/bebidas/semAlcool`)
        .expectStatus(StatusCodes.NOT_FOUND)
        .expectBodyContains('A key semAlcool ainda não existe');
    });

    it('Deletar bebida sem álcool inexistente', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/${mercado.id}/produtos/bebidas/semAlcool/0`)
        .expectStatus(StatusCodes.NOT_FOUND);
    });
  });
});
