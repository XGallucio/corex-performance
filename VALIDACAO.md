# Revis?o da cena Business da V14 ? 29/09/2026

- Modelo do hero reconstru?do como monitor com espessura, suporte e base, acompanhado por celular e dois pain?is compactos.
- Navegador local: larguras 320, 390, 768, 1024 e 1440 px sem transbordamento horizontal ou cortes nas quatro pe?as principais.
- Motion pausado: c?mera volta ? posi??o inicial, intera??o desativada e Business permanece com opacidade normal.
- Troca Performance/Business verificada; v?deo fica pausado em Business. N?o h? anima??o cont?nua na nova cena.
- Console do navegador consultado: nenhum erro ou aviso.
- Sintaxe dos scripts e teste do simulador: 5.760 cen?rios v?lidos e 9 entradas inv?lidas passaram.
- Recursos relativos do HTML presentes; IDs sem duplica??o.
- Os tamanhos foram testados por emula??o no navegador integrado, n?o em aparelhos f?sicos.

---

# Validação da entrega — 08/09/2026

## Atualização 4.2 — abertura cinematográfica

JavaScript verificado sem erros de sintaxe. Navegador local: abertura com preferência de movimento reduzido, replay da sequência completa, fechamento automático, botão Pular e retorno ao site verificados; console sem erros ou avisos. Recursos locais retornaram HTTP 200. A sequência normal tem 12,8 segundos definidos na linha do tempo; o timeout de segurança é de 15,5 segundos.

## Histórico: atualização 4.1 — intro

Sintaxe de `intro.js` validada. Testes isolados passaram para linha do tempo, saída automática, botão Pular, Esc, movimento reduzido, liberação da rolagem e timeout de segurança. No navegador local, a intro abriu com a logo e o indicador de progresso, fechou automaticamente e não registrou erros no console. A inspeção visual foi feita com a preferência de movimento reduzido do ambiente; a duração normal e o encerramento foram verificados no teste isolado.

## Executado

- Carregamento HTTP local em `127.0.0.1:8765`: resposta 200.
- Navegador: abertura completa, Canvas 3D visível, seleção de CPU e desmontagem por rolagem verificadas.
- Layout desktop e celular de 390 × 844: inspeção visual da abertura, do componente separado e do simulador; sem transbordamento horizontal na medição de celular.
- Simulador: erro para 1% low superior ao FPS médio. Cenário de 200 FPS / 120 low retornou 200–206 FPS e 120–125 low com os demais valores padrão.
- Seleção Boost: janela com preço R$22, resumo do plano e aviso de ausência de contratação; fechamento validado.
- Preferência inicial de movimento reduzido reconhecida pelo botão Motion.
- Console consultado durante a validação: nenhum erro ou aviso registrado.
- Sintaxe JavaScript: verificada.
- Cálculo independente: 5.760 combinações válidas e 9 verificações de entradas inválidas passaram, incluindo limites, determinismo e invariantes.
- Todos os recursos do HTML são arquivos relativos incluídos no pacote. Sem módulos, fetch, fontes remotas ou CDN.

## Limite da checagem

A abertura direta via `file://` foi bloqueada pela política de segurança da ferramenta de navegador. Não foi contornada. O carregamento local foi validado via HTTP; a compatibilidade com abertura direta foi preparada na estrutura de arquivos, mas não confirmada visualmente por essa ferramenta.

Não houve teste em aparelhos físicos, Safari ou Firefox, nem medição de performance em hardware real. O simulador é heurístico e sua verificação de software não comprova ganhos em jogos. A cena é uma representação genérica de hardware.
