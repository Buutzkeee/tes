import { test, expect } from '@playwright/test';

// Testes de autenticação
test.describe('Testes de autenticação', () => {
  test('deve exibir a página de login', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Senha')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  });

  test('deve exibir erro ao tentar login com credenciais inválidas', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByLabel('Email').fill('teste@invalido.com');
    await page.getByLabel('Senha').fill('senhaerrada');
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    // Aguardar pela mensagem de erro
    await expect(page.getByText('Email ou senha inválidos')).toBeVisible();
  });

  test('deve realizar login com sucesso', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByLabel('Email').fill('advogado@teste.com');
    await page.getByLabel('Senha').fill('senha123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    // Aguardar redirecionamento para o dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('deve realizar logout com sucesso', async ({ page }) => {
    // Fazer login primeiro
    await page.goto('http://localhost:3000/login');
    await page.getByLabel('Email').fill('advogado@teste.com');
    await page.getByLabel('Senha').fill('senha123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    // Aguardar redirecionamento para o dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Clicar no menu de usuário e depois em logout
    await page.getByRole('button', { name: /perfil/i }).click();
    await page.getByRole('menuitem', { name: /sair/i }).click();
    
    // Verificar se voltou para a página de login
    await expect(page).toHaveURL(/.*login/);
  });
});

// Testes de gerenciamento de clientes
test.describe('Testes de gerenciamento de clientes', () => {
  // Fazer login antes de cada teste
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByLabel('Email').fill('advogado@teste.com');
    await page.getByLabel('Senha').fill('senha123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('deve listar clientes', async ({ page }) => {
    await page.goto('http://localhost:3000/clients');
    await expect(page.getByRole('heading', { name: 'Clientes' })).toBeVisible();
    
    // Verificar se a tabela de clientes está visível
    await expect(page.locator('table')).toBeVisible();
  });

  test('deve criar um novo cliente', async ({ page }) => {
    await page.goto('http://localhost:3000/clients/new');
    
    // Preencher formulário
    await page.getByLabel('Nome completo *').fill('Cliente Teste Playwright');
    await page.getByLabel('E-mail *').fill('cliente.teste@exemplo.com');
    await page.getByLabel('CPF *').fill('12345678900');
    await page.getByLabel('Telefone *').fill('11987654321');
    await page.getByLabel('Endereço').fill('Rua de Teste, 123');
    
    // Enviar formulário
    await page.getByRole('button', { name: 'Salvar' }).click();
    
    // Verificar mensagem de sucesso
    await expect(page.getByText('Cliente cadastrado com sucesso')).toBeVisible();
    
    // Verificar redirecionamento para lista de clientes
    await expect(page).toHaveURL(/.*clients/);
  });

  test('deve visualizar detalhes de um cliente', async ({ page }) => {
    await page.goto('http://localhost:3000/clients');
    
    // Clicar no primeiro cliente da lista
    await page.locator('table tbody tr').first().click();
    
    // Verificar se está na página de detalhes
    await expect(page.getByText('Informações do Cliente')).toBeVisible();
    await expect(page.getByLabel('Nome completo *')).toBeVisible();
    await expect(page.getByLabel('E-mail *')).toBeVisible();
  });

  test('deve editar um cliente', async ({ page }) => {
    await page.goto('http://localhost:3000/clients');
    
    // Clicar no primeiro cliente da lista
    await page.locator('table tbody tr').first().click();
    
    // Editar o telefone
    await page.getByLabel('Telefone *').fill('11999999999');
    
    // Salvar alterações
    await page.getByRole('button', { name: 'Salvar Alterações' }).click();
    
    // Verificar mensagem de sucesso
    await expect(page.getByText('Cliente atualizado com sucesso')).toBeVisible();
  });
});

// Testes de gerenciamento de processos
test.describe('Testes de gerenciamento de processos', () => {
  // Fazer login antes de cada teste
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByLabel('Email').fill('advogado@teste.com');
    await page.getByLabel('Senha').fill('senha123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('deve listar processos', async ({ page }) => {
    await page.goto('http://localhost:3000/processes');
    await expect(page.getByRole('heading', { name: 'Processos' })).toBeVisible();
  });

  test('deve criar um novo processo', async ({ page }) => {
    await page.goto('http://localhost:3000/processes/new');
    
    // Preencher formulário
    await page.getByLabel('Número do Processo *').fill('1234567-89.2025.8.26.0100');
    await page.getByLabel('Título *').fill('Processo Teste Playwright');
    await page.getByLabel('Descrição').fill('Descrição do processo de teste');
    await page.getByLabel('Tipo de Processo *').fill('Cível');
    await page.getByLabel('Tribunal *').fill('TJSP');
    
    // Selecionar o primeiro cliente da lista
    await page.locator('select[name="clientId"]').selectOption({ index: 1 });
    
    // Enviar formulário
    await page.getByRole('button', { name: 'Salvar' }).click();
    
    // Verificar mensagem de sucesso
    await expect(page.getByText('Processo cadastrado com sucesso')).toBeVisible();
    
    // Verificar redirecionamento para lista de processos
    await expect(page).toHaveURL(/.*processes/);
  });

  test('deve visualizar detalhes de um processo', async ({ page }) => {
    await page.goto('http://localhost:3000/processes');
    
    // Clicar no primeiro processo da lista
    await page.locator('ul li a').first().click();
    
    // Verificar se está na página de detalhes
    await expect(page.getByText('Informações')).toBeVisible();
    await expect(page.getByLabel('Número do Processo *')).toBeVisible();
    await expect(page.getByLabel('Título *')).toBeVisible();
  });
});

// Testes de gerenciamento de documentos
test.describe('Testes de gerenciamento de documentos', () => {
  // Fazer login antes de cada teste
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByLabel('Email').fill('advogado@teste.com');
    await page.getByLabel('Senha').fill('senha123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('deve listar documentos', async ({ page }) => {
    await page.goto('http://localhost:3000/documents');
    await expect(page.getByRole('heading', { name: 'Documentos' })).toBeVisible();
  });

  test('deve exibir formulário de upload de documento', async ({ page }) => {
    await page.goto('http://localhost:3000/documents/new');
    
    // Verificar elementos do formulário
    await expect(page.getByLabel('Título do Documento *')).toBeVisible();
    await expect(page.getByLabel('Descrição')).toBeVisible();
    await expect(page.getByLabel('Tipo de Documento *')).toBeVisible();
    await expect(page.getByText('Selecione um arquivo')).toBeVisible();
  });
});

// Testes do assistente de IA
test.describe('Testes do assistente de IA', () => {
  // Fazer login antes de cada teste
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByLabel('Email').fill('advogado@teste.com');
    await page.getByLabel('Senha').fill('senha123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('deve exibir interface do chat com IA', async ({ page }) => {
    await page.goto('http://localhost:3000/ai-assistant');
    await expect(page.getByRole('heading', { name: 'Assistente Jurídico IA' })).toBeVisible();
    await expect(page.getByPlaceholder('Digite sua mensagem...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enviar' })).toBeVisible();
  });

  test('deve exibir interface de geração de petições', async ({ page }) => {
    await page.goto('http://localhost:3000/ai-assistant/generate-petition');
    await expect(page.getByRole('heading', { name: 'Geração de Petições com IA' })).toBeVisible();
    await expect(page.getByText('Configurações da Petição')).toBeVisible();
    await expect(page.getByText('Petição Gerada')).toBeVisible();
  });

  test('deve exibir interface de busca de jurisprudência', async ({ page }) => {
    await page.goto('http://localhost:3000/ai-assistant/jurisprudence');
    await expect(page.getByRole('heading', { name: 'Busca de Jurisprudência' })).toBeVisible();
    await expect(page.getByText('Filtros')).toBeVisible();
    await expect(page.getByPlaceholder('Digite termos para buscar jurisprudência...')).toBeVisible();
  });
});

// Testes de pagamentos
test.describe('Testes de pagamentos', () => {
  // Fazer login antes de cada teste
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByLabel('Email').fill('advogado@teste.com');
    await page.getByLabel('Senha').fill('senha123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('deve exibir página de assinaturas e pagamentos', async ({ page }) => {
    await page.goto('http://localhost:3000/payments');
    await expect(page.getByRole('heading', { name: 'Assinatura e Pagamentos' })).toBeVisible();
    await expect(page.getByText('Sua Assinatura')).toBeVisible();
    await expect(page.getByText('Planos Disponíveis')).toBeVisible();
    await expect(page.getByText('Histórico de Pagamentos')).toBeVisible();
  });
});
