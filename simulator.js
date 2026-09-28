/* Deterministic, conservative scenario model. No external benchmark data. */
(function(root){
 'use strict';
 function estimateScenario(input){
  const fps=Number(input.fps), low=input.low===''||input.low==null?null:Number(input.low), load=Number(input.load), ram=String(input.ram);
  if(!Number.isFinite(fps)||fps<15||fps>1000)throw new Error('Informe um FPS médio entre 15 e 1000.');
  if(low!==null&&(!Number.isFinite(low)||low<1||low>fps))throw new Error('O 1% low deve ser positivo e não pode superar o FPS médio.');
  if(!Number.isFinite(load)||load<20||load>100)throw new Error('Informe o uso da GPU entre 20% e 100%.');
  if(!['clean','normal','busy'].includes(input.system)||!['competitive','cs2','fortnite','aaa'].includes(input.game)||!['8','16','32'].includes(ram))throw new Error('Revise as opções do cenário.');
  // Upper-bound reclaimable frame time. Zero benefit is always within range.
  const overhead={clean:.012,normal:.055,busy:.10}[input.system];
  const gpuWeight=load>=97?.22:load>=90?.5:load>=75?.78:1;
  const gameWeight={competitive:1,cs2:.95,fortnite:.85,aaa:.7}[input.game];
  const reclaim=overhead*gpuWeight*gameWeight;
  const upper=fps/(1-reclaim);
  const stabilityHeadroom=low===null?0:Math.max(0,1-low/fps);
  const ramMargin={8:1,16:.65,32:.4}[ram];
  const lowReclaim=Math.min(.15,reclaim+overhead*stabilityHeadroom*ramMargin);
  const lowUpper=low===null?null:Math.min(upper,low/(1-lowReclaim));
  let bottleneck=load>=97?'A GPU está perto do limite. Ajustes no sistema tendem a mudar pouco o FPS médio.':load>=90?'A GPU está bastante ocupada. A margem de FPS é pequena; observe também a estabilidade.':'Há folga na GPU. CPU, limite de FPS, memória ou o próprio jogo podem estar limitando o resultado.';
  if(input.system==='clean')bottleneck+=' Como o sistema já está limpo, a margem estimada é mínima.';
  if(ram==='8')bottleneck+=' Se faltar RAM, ajustes não substituem uma expansão de memória.';
  return {fpsMin:fps,fpsMax:Math.round(upper),gainMin:0,gainMax:Math.round((upper/fps-1)*100),lowMin:low,lowMax:lowUpper===null?null:Math.round(lowUpper),frameMin:1000/upper,frameMax:1000/fps,reclaim,bottleneck};
 }
 root.CorexSimulator={estimateScenario};
 if(typeof module!=='undefined'&&module.exports)module.exports={estimateScenario};
})(typeof window!=='undefined'?window:globalThis);
