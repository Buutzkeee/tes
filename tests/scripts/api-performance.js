#!/usr/bin/env node

const axios = require('axios');
const { performance } = require('perf_hooks');

// Configurações
const API_URL = 'http://localhost:3001/api';
const NUM_REQUESTS = 50;
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

async function runPerformanceTest() {
  const token = await login();
  
  const results = {
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
  
  // Executar requisições para cada endpoint
  for (const endpoint of ENDPOINTS) {
    for (let i = 0; i < NUM_REQUESTS / ENDPOINTS.length; i++) {
      results.totalRequests++;
      
      try {
        const startTime = performance.now();
        await api.get(`${API_URL}${endpoint}`);
        const endTime = performance.now();
        
        results.successfulRequests++;
        results.responseTimes.push(endTime - startTime);
      } catch (error) {
        results.failedRequests++;
        results.errors.push({
          endpoint,
          message: error.message,
          status: error.response?.status
        });
      }
    }
  }
  
  // Calcular estatísticas
  const totalResponseTime = results.responseTimes.reduce((sum, time) => sum + time, 0);
  const averageResponseTime = totalResponseTime / results.responseTimes.length;
  const maxResponseTime = Math.max(...results.responseTimes);
  const minResponseTime = Math.min(...results.responseTimes);
  const successRate = results.successfulRequests / results.totalRequests;
  
  return {
    totalRequests: results.totalRequests,
    successfulRequests: results.successfulRequests,
    failedRequests: results.failedRequests,
    averageResponseTime,
    maxResponseTime,
    minResponseTime,
    successRate,
    errors: results.errors.slice(0, 5) // Limitar número de erros no output
  };
}

// Executar o teste e imprimir resultados
runPerformanceTest()
  .then(results => {
    console.log(JSON.stringify(results));
  })
  .catch(error => {
    console.error('Erro ao executar teste de performance:', error);
    process.exit(1);
  });
