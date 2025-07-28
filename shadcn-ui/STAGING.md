# Ambiente de Staging - App Promocional IA

Este documento explica como usar o ambiente de staging para testes do App Promocional IA.

## 🎯 Propósito do Staging

O ambiente de staging é uma réplica do ambiente de produção onde você pode:
- Testar novas funcionalidades antes do deploy
- Validar integrações com APIs reais
- Realizar testes de performance
- Verificar comportamento em condições similares à produção
- Executar testes de aceitação

## 🚀 Como Usar

### Comandos Disponíveis

```bash
# Iniciar servidor de desenvolvimento em modo staging
npm run staging

# Build para staging
npm run build:staging

# Preview do build de staging
npm run preview:staging

# Teste completo (build + preview)
npm run test:staging
```

### Portas dos Serviços

- **Development**: http://localhost:5173
- **Staging**: http://localhost:5174
- **Staging Preview**: http://localhost:5175

## ⚙️ Configurações por Ambiente

### Development (.env.development)
- Debug habilitado
- Mock API ativo
- Logs detalhados
- Devtools habilitado

### Staging (.env.staging)
- Debug habilitado (para troubleshooting)
- APIs reais (não mock)
- Analytics habilitado
- Rate limiting mais restritivo
- Modo de teste ativo

### Production (.env.production)
- Debug desabilitado
- Otimizações máximas
- Logs apenas de erro
- Devtools desabilitado

## 🔧 Configuração de Variáveis

### Variáveis Obrigatórias para Staging

```bash
# APIs de IA (configurar com chaves de teste)
VITE_APP_OPENAI_API_KEY=sk-test-...
VITE_APP_CLAUDE_API_KEY=sk-ant-test-...
VITE_APP_GEMINI_API_KEY=test-key-...
```

### Configuração via CI/CD

Para ambientes automatizados, configure as variáveis através do seu provedor de CI/CD:

```yaml
# Exemplo para GitHub Actions
env:
  VITE_APP_OPENAI_API_KEY: ${{ secrets.STAGING_OPENAI_KEY }}
  VITE_APP_CLAUDE_API_KEY: ${{ secrets.STAGING_CLAUDE_KEY }}
  VITE_APP_GEMINI_API_KEY: ${{ secrets.STAGING_GEMINI_KEY }}
```

## 🧪 Testes Recomendados

### 1. Testes Funcionais
- [ ] Geração de texto com todas as IAs
- [ ] Geração de imagem (OpenAI/Gemini)
- [ ] Validação de chaves de API
- [ ] Salvamento e carregamento de conteúdo
- [ ] Personalização de cores
- [ ] Responsividade em diferentes dispositivos

### 2. Testes de Performance
- [ ] Tempo de resposta das APIs
- [ ] Carregamento inicial da aplicação
- [ ] Tamanho dos bundles gerados
- [ ] Uso de memória

### 3. Testes de Integração
- [ ] Rate limiting das APIs
- [ ] Tratamento de erros de rede
- [ ] Fallbacks para APIs indisponíveis
- [ ] Persistência de dados local

## 📊 Monitoramento

### Indicadores Visuais

No ambiente de staging, você verá:
- Badge "STAGING" no canto superior direito
- Informações de ambiente no canto inferior esquerdo (modo debug)
- Logs detalhados no console do navegador

### Logs e Debug

```javascript
// Verificar configuração atual
console.log('Environment:', window.__APP_ENV__);
console.log('Version:', window.__APP_VERSION__);
console.log('Debug Mode:', window.__APP_DEBUG__);
```

## 🔒 Segurança

### Chaves de API
- Use sempre chaves de teste/desenvolvimento
- Nunca commite chaves reais no repositório
- Configure chaves via variáveis de ambiente
- Monitore uso das chaves de teste

### Dados de Teste
- Use dados fictícios para testes
- Não use informações pessoais reais
- Limpe dados de teste regularmente

## 🚨 Troubleshooting

### Problemas Comuns

1. **Porta já em uso**
   ```bash
   # Verificar processos na porta
   netstat -ano | findstr :5174
   # Matar processo se necessário
   taskkill /PID <PID> /F
   ```

2. **Variáveis de ambiente não carregadas**
   - Verifique se o arquivo `.env.staging` existe
   - Reinicie o servidor após mudanças
   - Confirme que as variáveis começam com `VITE_`

3. **APIs não funcionando**
   - Verifique se as chaves estão configuradas
   - Confirme conectividade de rede
   - Verifique logs de erro no console

### Debug Avançado

```bash
# Executar com logs detalhados
DEBUG=vite:* npm run staging

# Verificar build de staging
npm run build:staging -- --debug
```

## 📝 Checklist de Deploy

Antes de fazer deploy para produção:

- [ ] Todos os testes passando em staging
- [ ] Performance aceitável
- [ ] Sem erros no console
- [ ] Responsividade validada
- [ ] Chaves de API de produção configuradas
- [ ] Analytics funcionando
- [ ] Tratamento de erros validado
- [ ] Fallbacks testados

## 🤝 Contribuição

Ao trabalhar com staging:

1. Sempre teste localmente primeiro
2. Use staging para validação final
3. Documente problemas encontrados
4. Compartilhe resultados com a equipe
5. Mantenha logs de teste organizados

---

**Nota**: Este ambiente é essencial para garantir a qualidade e estabilidade da aplicação antes do deploy em produção.