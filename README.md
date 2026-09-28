# COREX Performance V8

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
