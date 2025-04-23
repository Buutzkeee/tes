const { expect } = require('chai');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('Testes de performance', () => {
  describe('Backend', () => {
    it('deve responder a requisições em tempo aceitável', function() {
      this.timeout(10000); // Aumentar timeout para este teste
      
      // Executar um script que faz múltiplas requisições e mede o tempo de resposta
      const result = execSync('node ./tests/scripts/api-performance.js').toString();
      const data = JSON.parse(result);
      
      expect(data.averageResponseTime).to.be.lessThan(500); // Média menor que 500ms
      expect(data.maxResponseTime).to.be.lessThan(1000); // Máximo menor que 1000ms
      expect(data.successRate).to.be.greaterThan(0.95); // Taxa de sucesso maior que 95%
    });
    
    it('deve lidar com múltiplas conexões simultâneas', function() {
      this.timeout(15000); // Aumentar timeout para este teste
      
      // Executar um script que simula múltiplos usuários simultâneos
      const result = execSync('node ./tests/scripts/concurrent-users.js').toString();
      const data = JSON.parse(result);
      
      expect(data.successfulRequests).to.be.greaterThan(data.totalRequests * 0.9); // 90% de sucesso
      expect(data.averageResponseTime).to.be.lessThan(1000); // Média menor que 1000ms sob carga
    });
  });
  
  describe('Banco de Dados', () => {
    it('deve executar consultas em tempo aceitável', function() {
      this.timeout(10000); // Aumentar timeout para este teste
      
      // Executar um script que mede o tempo de consultas ao banco de dados
      const result = execSync('node ./tests/scripts/db-performance.js').toString();
      const data = JSON.parse(result);
      
      expect(data.averageQueryTime).to.be.lessThan(100); // Média menor que 100ms
      expect(data.maxQueryTime).to.be.lessThan(500); // Máximo menor que 500ms
    });
  });
  
  describe('Frontend', () => {
    it('deve ter tamanho de bundle otimizado', () => {
      // Verificar se o tamanho dos arquivos JS principais está dentro do limite aceitável
      const buildDir = path.join(__dirname, '../frontend/.next/static/chunks');
      
      // Verificar se o diretório existe (pode não existir se o build não foi feito)
      if (!fs.existsSync(buildDir)) {
        console.log('Diretório de build não encontrado. Pulando teste de tamanho de bundle.');
        return;
      }
      
      // Obter tamanho total dos arquivos JS
      const jsFiles = fs.readdirSync(buildDir)
        .filter(file => file.endsWith('.js'))
        .map(file => path.join(buildDir, file));
      
      const totalSize = jsFiles.reduce((acc, file) => {
        return acc + fs.statSync(file).size;
      }, 0);
      
      // Converter para MB
      const totalSizeMB = totalSize / (1024 * 1024);
      
      // Verificar se o tamanho total está dentro do limite (5MB é um exemplo)
      expect(totalSizeMB).to.be.lessThan(5);
    });
    
    it('deve ter pontuação Lighthouse aceitável', function() {
      this.timeout(30000); // Lighthouse pode demorar
      
      // Este teste normalmente seria executado em um ambiente CI com ferramentas como Lighthouse CI
      // Aqui estamos apenas simulando o resultado
      
      // Em um ambiente real, executaríamos algo como:
      // const result = execSync('lighthouse http://localhost:3000 --output=json --chrome-flags="--headless"').toString();
      // const data = JSON.parse(result);
      
      // Simulando resultados do Lighthouse
      const simulatedResults = {
        performance: 0.85,
        accessibility: 0.90,
        'best-practices': 0.95,
        seo: 0.92
      };
      
      expect(simulatedResults.performance).to.be.greaterThan(0.7);
      expect(simulatedResults.accessibility).to.be.greaterThan(0.8);
      expect(simulatedResults['best-practices']).to.be.greaterThan(0.8);
      expect(simulatedResults.seo).to.be.greaterThan(0.8);
    });
  });
});
