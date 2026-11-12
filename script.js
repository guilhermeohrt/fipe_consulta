// Endereço base das consultas de carros na BrasilAPI.
const API = 'https://brasilapi.com.br/api/fipe';
 
const marca = document.getElementById('marca');
const modelo = document.getElementById('modelo');
const ano = document.getElementById('ano');
const status = document.getElementById('status');
const resultado = document.getElementById('resultado');
const botao = document.getElementById('btnConsultar');
 
// Mostra uma mensagem enquanto a API responde (ou quando ocorre um erro).
function mostrarStatus(mensagem, erro = false) {
  status.textContent = mensagem;
  status.className = erro ? 'erro' : '';
}
 
// Limpa um campo e deixa ele desativado até receber novas opções.
function limparSelect(campo, mensagem) {
  campo.innerHTML = '';
  campo.add(new Option(mensagem, ''));
  campo.disabled = true;
}
 
// Preenche as opções recebidas da API.
function preencherSelect(campo, itens, texto, mensagem) {
  limparSelect(campo, mensagem);
 
  itens.forEach((item) => {
    campo.add(new Option(item[texto], item.valor));
  });
 
  campo.disabled = false;
}
 
// Todas as requisições HTTP usam fetch, assim como no exemplo da aula.
async function consultarAPI(endereco) {
  const resposta = await fetch(endereco);
 
  if (!resposta.ok) {
    throw new Error('Não foi possível consultar a BrasilAPI. Tente novamente.');
  }
 
  return await resposta.json();
}
 
// Primeira etapa: carregar as marcas ao abrir a página.
async function carregarMarcas() {
  mostrarStatus('Carregando marcas...');
 
  try {
    const marcas = await consultarAPI(`${API}/marcas/v1/carros`);
    preencherSelect(marca, marcas, 'nome', 'Selecione uma marca');
    mostrarStatus('');
  } catch (erro) {
    mostrarStatus(erro.message, true);
    limparSelect(marca, 'Não foi possível carregar as marcas');
  }
}
 
// Segunda etapa: quando a marca muda, buscar os modelos correspondentes.
marca.addEventListener('change', async function () {
  limparSelect(modelo, 'Primeiro, escolha uma marca');
  limparSelect(ano, 'Primeiro, escolha um modelo');
  botao.disabled = true;
  resultado.hidden = true;
  mostrarStatus('');
 
  if (!marca.value) return;
 
  marca.disabled = true;
  mostrarStatus('Carregando modelos...');
 
  try {
    const modelos = await consultarAPI(
      `${API}/veiculos/v1/carros/${marca.value}`
    );
    preencherSelect(modelo, modelos, 'modelo', 'Selecione um modelo');
    mostrarStatus('');
  } catch (erro) {
    mostrarStatus(erro.message, true);
  } finally {
    marca.disabled = false;
  }
});
 
// Terceira etapa: buscar anos e tipos de combustível do modelo escolhido.
modelo.addEventListener('change', async function () {
  limparSelect(ano, 'Primeiro, escolha um modelo');
  botao.disabled = true;
  resultado.hidden = true;
  mostrarStatus('');
 
  if (!modelo.value) return;
 
  marca.disabled = true;
  modelo.disabled = true;
  mostrarStatus('Carregando anos...');
 
  try {
    const anos = await consultarAPI(
      `${API}/anos/v1/carros/${marca.value}/${modelo.value}`
    );
    preencherSelect(ano, anos, 'nome', 'Selecione o ano');
    mostrarStatus('');
  } catch (erro) {
    mostrarStatus(erro.message, true);
  } finally {
    marca.disabled = false;
    modelo.disabled = false;
  }
});
 
ano.addEventListener('change', function () {
  botao.disabled = !ano.value;
  resultado.hidden = true;
  mostrarStatus('');
});
 
// Última etapa: consultar o preço e alterar o conteúdo da página (DOM).
document
  .getElementById('formConsulta')
  .addEventListener('submit', async function (evento) {
    evento.preventDefault(); // Impede o formulário de recarregar a página.
 
    if (!marca.value || !modelo.value || !ano.value) return;
 
    botao.disabled = true;
    resultado.hidden = true;
    mostrarStatus('Consultando preço, aguarde...');
 
    try {
      const endereco = `${API}/detalhes/v1/carros/${marca.value}/${modelo.value}/${ano.value}`;
      const carro = await consultarAPI(endereco);
 
      document.getElementById('nomeCarro').textContent = carro.modelo;
      document.getElementById('precoCarro').textContent = carro.valor;
      document.getElementById('detalheMarca').textContent = carro.marca;
      document.getElementById('detalheAno').textContent = carro.anoModelo;
      document.getElementById('detalheCombustivel').textContent =
        carro.combustivel;
      document.getElementById('detalheCodigo').textContent = carro.codigoFipe;
      document.getElementById('detalheReferencia').textContent =
        carro.mesReferencia;
 
      resultado.hidden = false;
      mostrarStatus('');
    } catch (erro) {
      mostrarStatus(erro.message, true);
    } finally {
      botao.disabled = false;
    }
  });
 
carregarMarcas();
 
