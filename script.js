async function carregarDados() {
  const resposta = await fetch("./dados.json");
  const dados = await resposta.json();

  document.querySelector("#conteudo").innerHTML = `
    <h1>${dados.titulo}</h1>
    <p>${dados.texto}</p>
    <small>Atualizado em: ${dados.atualizado_em}</small>
  `;
}

carregarDados();
