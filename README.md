# COREX V12 ? Performance e Business Showcase

Versão baseada na V7.3 HQ Fluid, mantendo vídeo 1080p e qualidade visual.

## Novidades
- Navegação superior redesenhada: Experiência / Simulador / Planos
- Estado ativo acompanha a seção atual
- Hover iluminado e microanimações leves no menu
- Botão flutuante de WhatsApp no canto inferior direito
- WhatsApp ainda sem número configurado; ao clicar aparece um aviso local
- Renderer do PC com pool de shapes para reduzir garbage collection
- Pointer do Canvas agrupado em no máximo uma atualização por frame
- Gráfico deixa de manter loop contínuo fora do necessário
- Mantidos vídeo HQ, DPR do Canvas, detalhes do PC e efeitos visuais

## Configurar WhatsApp depois
No `index.html`, o botão tem o ID `whatsapp-button`.
Quando tivermos o número, podemos adicionar no JavaScript uma URL no formato oficial `https://wa.me/...` com uma mensagem pronta.

## Abrir
Extraia o ZIP e abra `index.html`.

## COREX Business
Esta versão também inclui a divisão COREX Business no mesmo site.

- Troca entre COREX Performance e COREX Business sem recarregar a página.
- COREX Business usa tema azul/branco e fundo corporativo próprio.
- Serviços: criação de sites, posts/conteúdo, análise de software, suporte a sites e feedback/consultoria.
- Acesso pela escolha na intro ou pelo seletor no header.
- O vídeo da divisão Performance é pausado quando a Business está ativa para economizar recursos.
- O formulário Business ainda é demonstrativo e pode ser conectado ao WhatsApp, e-mail ou backend depois.


## V10 — COREX Business 3D
- Hero Business redesenhado em azul neon escuro + branco
- Cubo 3D COREX Business com interação de mouse
- Fundo de dados em Canvas leve, ativo somente quando a Business está visível
- Painéis flutuantes de website, analytics e status
- Cada serviço possui animação visual própria
- Cards de serviços com tilt e iluminação local
- Header Business em vidro azul escuro

## V11 — COREX Business Operations Hub

- Hero Business reconstruído com um workspace 3D coerente (site, conteúdo, análise e suporte).
- Removido o Canvas animado/cubo da V10 para reduzir travamentos.
- Novos formatos de projeto, padrão COREX e briefing ampliado.
- Serviços mantêm microanimações e agora exibem categorias/entregas com mais detalhe.
- COREX Performance preservado.

## V12 — COREX Business Showcase

- Corrigido o vazamento de verde no menu superior da divisão Business.
- Menu Business agora usa apenas azul neon, ciano, branco e tons frios.
- Nova aba **Vitrine** no header da Business.
- Nova seção com quatro conceitos demonstrativos de sites: institucional premium, SaaS/dashboard, campanha criativa e e-commerce.
- Os exemplos são identificados como conceitos de vitrine, sem serem apresentados como clientes reais.
- Adicionado bloco de qualidade com design system, responsividade, motion e estrutura para evolução.
- Microinterações da vitrine atualizam apenas durante interação do ponteiro, sem loop pesado adicional.
