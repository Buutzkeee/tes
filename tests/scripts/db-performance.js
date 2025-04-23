#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const { performance } = require('perf_hooks');

// Inicializar Prisma
const prisma = new PrismaClient();

// Configurações
const NUM_QUERIES = 50;

async function runDbPerformanceTest() {
  const results = {
    totalQueries: 0,
    successfulQueries: 0,
    failedQueries: 0,
    queryTimes: [],
    errors: []
  };
  
  // Teste de consultas de clientes
  try {
    console.log('Testando consultas de clientes...');
    for (let i = 0; i < NUM_QUERIES / 5; i++) {
      results.totalQueries++;
      
      const startTime = performance.now();
      await prisma.client.findMany({
        take: 10,
        include: {
          processes: true
        }
      });
      const endTime = performance.now();
      
      results.successfulQueries++;
      results.queryTimes.push(endTime - startTime);
    }
  } catch (error) {
    results.failedQueries++;
    results.errors.push({
      query: 'findMany clients',
      message: error.message
    });
  }
  
  // Teste de consultas de processos
  try {
    console.log('Testando consultas de processos...');
    for (let i = 0; i < NUM_QUERIES / 5; i++) {
      results.totalQueries++;
      
      const startTime = performance.now();
      await prisma.process.findMany({
        take: 10,
        include: {
          client: true,
          documents: true
        }
      });
      const endTime = performance.now();
      
      results.successfulQueries++;
      results.queryTimes.push(endTime - startTime);
    }
  } catch (error) {
    results.failedQueries++;
    results.errors.push({
      query: 'findMany processes',
      message: error.message
    });
  }
  
  // Teste de consultas de documentos
  try {
    console.log('Testando consultas de documentos...');
    for (let i = 0; i < NUM_QUERIES / 5; i++) {
      results.totalQueries++;
      
      const startTime = performance.now();
      await prisma.document.findMany({
        take: 10,
        include: {
          process: true,
          client: true
        }
      });
      const endTime = performance.now();
      
      results.successfulQueries++;
      results.queryTimes.push(endTime - startTime);
    }
  } catch (error) {
    results.failedQueries++;
    results.errors.push({
      query: 'findMany documents',
      message: error.message
    });
  }
  
  // Teste de consultas complexas
  try {
    console.log('Testando consultas complexas...');
    for (let i = 0; i < NUM_QUERIES / 5; i++) {
      results.totalQueries++;
      
      const startTime = performance.now();
      await prisma.client.findMany({
        take: 5,
        include: {
          processes: {
            include: {
              documents: true
            }
          }
        }
      });
      const endTime = performance.now();
      
      results.successfulQueries++;
      results.queryTimes.push(endTime - startTime);
    }
  } catch (error) {
    results.failedQueries++;
    results.errors.push({
      query: 'complex nested query',
      message: error.message
    });
  }
  
  // Teste de consultas com filtros
  try {
    console.log('Testando consultas com filtros...');
    for (let i = 0; i < NUM_QUERIES / 5; i++) {
      results.totalQueries++;
      
      const startTime = performance.now();
      await prisma.process.findMany({
        where: {
          status: 'ACTIVE',
          type: {
            contains: 'Cível'
          }
        },
        take: 10
      });
      const endTime = performance.now();
      
      results.successfulQueries++;
      results.queryTimes.push(endTime - startTime);
    }
  } catch (error) {
    results.failedQueries++;
    results.errors.push({
      query: 'filtered query',
      message: error.message
    });
  }
  
  // Calcular estatísticas
  const totalQueryTime = results.queryTimes.reduce((sum, time) => sum + time, 0);
  const averageQueryTime = totalQueryTime / results.queryTimes.length;
  const maxQueryTime = Math.max(...results.queryTimes);
  const minQueryTime = Math.min(...results.queryTimes);
  
  return {
    totalQueries: results.totalQueries,
    successfulQueries: results.successfulQueries,
    failedQueries: results.failedQueries,
    averageQueryTime,
    maxQueryTime,
    minQueryTime,
    errors: results.errors
  };
}

// Executar o teste e imprimir resultados
runDbPerformanceTest()
  .then(results => {
    console.log(JSON.stringify(results));
  })
  .catch(error => {
    console.error('Erro ao executar teste de performance do banco de dados:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
