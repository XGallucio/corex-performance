# Metodologia do simulador

O simulador não usa benchmarks externos nem afirma medir o computador do visitante. Ele explora uma hipótese conservadora a partir de medições fornecidas pelo usuário. Os coeficientes são escolhas heurísticas de produto, não resultados de pesquisa ou testes de hardware.

## Entradas e efeitos

- FPS médio medido: referência de todo o cálculo, entre 15 e 1000.
- 1% low: opcional, positivo e no máximo igual ao FPS médio.
- Uso da GPU: medido durante o mesmo jogo, entre 20% e 100%.
- Estado do sistema: limpo, cotidiano ou com muitos aplicativos.
- Jogo: moderador conservador do espaço para recuperação de tempo de frame.
- RAM: influencia apenas a margem de estabilidade do 1% low.
- Resolução: contexto da medição; não converte FPS de uma resolução para outra.
- Nomes de CPU/GPU: identificam o cenário e o resumo; não inferem capacidade nem ganhos.

Não há conversão entre ping e FPS, comparação de hardware baseada em nomes, garantia de resultados ou telemetria automática.

## Fórmulas

O limite superior de tempo recuperável por frame parte de um fator de sistema: 0,012 (limpo), 0,055 (cotidiano), 0,10 (muitos apps).

Esse fator é multiplicado pelo peso de uso da GPU: 0,22 para ≥97%; 0,50 para ≥90%; 0,78 para ≥75%; 1 abaixo de 75%.

O peso de jogo é 1 para competitivo leve; 0,95 para CS2; 0,85 para Fortnite; 0,70 para AAA. Essa classificação é qualitativa, não um benchmark dos jogos.

Se `r` é a fração de tempo recuperável, o teto é `FPS atual / (1 - r)`. A faixa começa sempre no FPS atual, incluindo zero de ganho. O teto matemático de ganho médio é aproximadamente 11,1% no cenário mais favorável.

Para 1% low informado, a dispersão `max(0, 1 - low / FPS)` multiplica o fator de sistema e uma margem de RAM (1 para até 8 GB; 0,65 para 16 GB; 0,4 para 32 GB+). Soma-se esse valor a `r`, com teto de 0,15. O low projetado não pode superar o FPS projetado. Mais margem com pouca RAM não significa que software resolve falta de capacidade.

Frame médio estimado: `1000 / FPS`, em milissegundos. Isso é o inverso do FPS médio, não um percentil de latência nem uma medida de input lag. Arredondamentos de FPS e porcentagem são independentes.

## Limites

Baixo uso da GPU não comprova gargalo de CPU: limite de FPS, V-Sync, engine, temperatura e outros fatores também importam. As mensagens mantêm essa incerteza. Configurações gráficas, ray tracing, drivers, patches, temperatura, energia, armazenamento e memória disponível não são medidos pelo site.

O gráfico representa variações sintéticas com senoides e picos previsíveis. Sua animação não é uma leitura ao vivo nem um benchmark antes/depois. Para validar ajustes reais, compare execuções repetidas da mesma cena e configurações, com aquecimento semelhante, FPS médio e percentis; preserve também um caminho de reversão das alterações.
