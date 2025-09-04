/**
 * Teste para verificar se o frontend consegue aceder às listas de picking através da interface web
 * Este teste simula a navegação e interação com a página de picking-packing
 */

const puppeteer = require('puppeteer');

(async () => {
  let browser;
  
  try {
    console.log('🚀 Iniciando teste da interface de Picking Lists...');
    
    // Configurar o browser
    browser = await puppeteer.launch({
      headless: false, // Mostrar o browser para debug
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // Interceptar erros de console
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Erro no console:', msg.text());
      }
    });
    
    // Interceptar erros de rede
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`❌ Erro HTTP ${response.status()}: ${response.url()}`);
      }
    });
    
    console.log('📱 Navegando para o frontend...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Aguardar a página carregar
    await page.waitForTimeout(2000);
    
    console.log('🔐 Tentando fazer login...');
    
    // Verificar se existe formulário de login
    const loginForm = await page.$('form');
    if (loginForm) {
      console.log('📝 Formulário de login encontrado, preenchendo credenciais...');
      
      // Preencher credenciais
      await page.type('input[type="text"], input[name="username"], input[name="email"]', 'admin');
      await page.type('input[type="password"], input[name="password"]', 'admin123');
      
      // Submeter formulário
      await page.click('button[type="submit"]');
      
      // Aguardar redirecionamento
      await page.waitForTimeout(3000);
    }
    
    console.log('🧭 Navegando para a página de Picking & Packing...');
    
    // Tentar navegar diretamente para a página de picking-packing
    await page.goto('http://localhost:3000/picking-packing', { waitUntil: 'networkidle2' });
    
    // Aguardar a página carregar
    await page.waitForTimeout(3000);
    
    console.log('🔍 Verificando se a página de Picking & Packing carregou...');
    
    // Verificar se o título da página está presente
    const pageTitle = await page.$eval('h1, [data-testid="page-title"], .header h1', el => el.textContent).catch(() => null);
    if (pageTitle && pageTitle.includes('Picking')) {
      console.log('✅ Página de Picking & Packing carregada com sucesso!');
      console.log(`📄 Título da página: ${pageTitle}`);
    } else {
      console.log('⚠️  Título da página não encontrado ou não contém "Picking"');
    }
    
    // Verificar se o tab de Picking Lists está presente
    const pickingTab = await page.$('[data-testid="tab-picking"]');
    if (pickingTab) {
      console.log('✅ Tab de Picking Lists encontrado!');
      await pickingTab.click();
      await page.waitForTimeout(1000);
    } else {
      console.log('❌ Tab de Picking Lists não encontrado');
    }
    
    // Verificar se as listas de picking estão sendo carregadas
    console.log('📋 Verificando se as listas de picking estão visíveis...');
    
    // Aguardar o carregamento das listas
    await page.waitForTimeout(3000);
    
    // Verificar se existem listas de picking na página
    const pickingLists = await page.$$('[data-testid^="picking-list-"]');
    console.log(`📊 Número de listas de picking encontradas: ${pickingLists.length}`);
    
    if (pickingLists.length > 0) {
      console.log('✅ Listas de picking estão sendo exibidas na interface!');
      
      // Verificar detalhes da primeira lista
      const firstList = pickingLists[0];
      const orderNumber = await firstList.$eval('[data-testid^="order-number-"]', el => el.textContent).catch(() => 'N/A');
      console.log(`📦 Primeira lista - Número da encomenda: ${orderNumber}`);
      
      // Verificar se existem itens na lista
      const items = await firstList.$$('[data-testid^="picking-item-"]');
      console.log(`📋 Número de itens na primeira lista: ${items.length}`);
      
    } else {
      console.log('⚠️  Nenhuma lista de picking encontrada na interface');
      
      // Verificar se há mensagem de "nenhuma lista"
      const emptyMessage = await page.$eval('.text-center', el => el.textContent).catch(() => null);
      if (emptyMessage) {
        console.log(`💬 Mensagem exibida: ${emptyMessage}`);
      }
    }
    
    // Verificar se o botão de criar nova lista está presente
    const addButton = await page.$('[data-testid="add-picking-list"]');
    if (addButton) {
      console.log('✅ Botão "Nova Lista de Picking" encontrado!');
      
      // Testar abertura do modal
      console.log('🔘 Testando abertura do modal de criação...');
      await addButton.click();
      await page.waitForTimeout(1000);
      
      const modal = await page.$('[role="dialog"]');
      if (modal) {
        console.log('✅ Modal de criação aberto com sucesso!');
        
        // Fechar modal
        const cancelButton = await page.$('[data-testid="button-cancel-picking"]');
        if (cancelButton) {
          await cancelButton.click();
          console.log('✅ Modal fechado com sucesso!');
        }
      } else {
        console.log('❌ Modal de criação não abriu');
      }
    } else {
      console.log('❌ Botão "Nova Lista de Picking" não encontrado');
    }
    
    // Verificar se há erros de rede relacionados à API
    console.log('🌐 Verificando chamadas à API...');
    
    // Aguardar um pouco mais para capturar todas as requisições
    await page.waitForTimeout(2000);
    
    console.log('✅ Teste da interface concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  } finally {
    if (browser) {
      console.log('🔚 Fechando browser...');
      await browser.close();
    }
  }
})();