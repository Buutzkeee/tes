#!/usr/bin/env node

const axios = require('axios');
const { performance } = require('perf_hooks');

// Configurações
const API_URL = 'http://localhost:3001/api';
const NUM_CONCURRENT_USERS = 20;
const REQUESTS_PER_USER = 5;
const ENDPOINTS = [
  '/clients',
  '/processes',
  '/documents',
  '/payments/plans'
];

async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'advogado@teste.com',
      password: 'senha123'
    });
    return response.data.token;
  } catch (error) {
    console.error('Erro ao fazer login:', error.message);
    process.exit(1);
  }
}

async function simulateUser(userId, token) {
  const results = {
    userId,
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    responseTimes: [],
    errors: []
  };
  
  // Configurar axios com token de autenticação
  const api = axios.create({
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  // Executar requisições para endpoints aleatórios
  for (let i = 0; i < REQUESTS_PER_USER; i++) {
    const randomEndpoint = ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
    results.totalRequests++;
    
    try {
      const startTime = performance.now();
      await api.get(`${API_URL}${randomEndpoint}`);
      const endTime = performance.now();
      
      results.successfulRequests++;
      results.responseTimes.push(endTime - startTime);
    } catch (error) {
      results.failedRequests++;
      results.errors.push({
        endpoint: randomEndpoint,
        message: error.message,
        status: error.response?.status
      });
    }
    
    // Pequeno atraso para simular comportamento mais realista
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
  }
  
  return results;
}

async function runConcurrentTest() {
  const token = await login();
  
  console.log(`Iniciando teste com ${NUM_CONCURRENT_USERS} usuários simultâneos...`);
  
  // Criar array de promessas para simular usuários concorrentes
  const userPromises = [];
  for (let i = 0; i < NUM_CONCURRENT_USERS; i++) {
    userPromises.push(simulateUser(i + 1, token));
  }
  
  // Executar todas as simulações de usuários em paralelo
  const userResults = await Promise.all(userPromises);
  
  // Agregar resultados
  const aggregatedResults = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    responseTimes: [],
    errors: []
  };
  
  userResults.forEach(result => {
    aggregatedResults.totalRequests += result.totalRequests;
    aggregatedResults.successfulRequests += result.successfulRequests;
    aggregatedResults.failedRequests += result.failedRequests;
    aggregatedResults.responseTimes = aggregatedResults.responseTimes.concat(result.responseTimes);
    aggregatedResults.errors = aggregatedResults.errors.concat(result.errors);
  });
  
  // Calcular estatísticas
  const totalResponseTime = aggregatedResults.responseTimes.reduce((sum, time) => sum + time, 0);
  const averageResponseTime = totalResponseTime / aggregatedResults.responseTimes.length;
  const maxResponseTime = Math.max(...aggregatedResults.responseTimes);
  const minResponseTime = Math.min(...aggregatedResults.responseTimes);
  const successRate = aggregatedResults.successfulRequests / aggregatedResults.totalRequests;
  
  return {
    totalUsers: NUM_CONCURRENT_USERS,
    totalRequests: aggregatedResults.totalRequests,
    successfulRequests: aggregatedResults.successfulRequests,
    failedRequests: aggregatedResults.failedRequests,
    averageResponseTime,
    maxResponseTime,
    minResponseTime,
    successRate,
    errors: aggregatedResults.errors.slice(0, 5) // Limitar número de erros no output
  };
}

// Executar o teste e imprimir resultados
runConcurrentTest()
  .then(results => {
    console.log(JSON.stringify(results));
  })
  .catch(error => {
    console.error('Erro ao executar teste de usuários concorrentes:', error);
    process.exit(1);
  });
