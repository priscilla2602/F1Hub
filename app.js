const API_URL = "http://localhost:3000";
const SESSION_KEY = "usuarioLogado";

const fotosPilotosApp = [
    { nome: "Charles Leclerc", imagem: "https://i.pinimg.com/736x/d5/34/de/d534de70350a17fa1b73bde2b55b1879.jpg" },
    { nome: "Lewis Hamilton", imagem: "https://i.pinimg.com/736x/8e/b0/30/8eb0308f8b5e703aa282e39e982da140.jpg" },
    { nome: "George Russell", imagem: "https://i.pinimg.com/736x/17/2f/ad/172fad81f4738166af4613242244510e.jpg" },
    { nome: "Kimi Antonelli", imagem: "https://i.pinimg.com/736x/4f/40/12/4f4012d7ffec1216e21b9b01150eee00.jpg" },
    { nome: "Max Verstappen", imagem: "https://i.pinimg.com/736x/d7/c2/0d/d7c20d73be8ff00e9a382a75aadb490a.jpg" },
    { nome: "Isack Hadjar", imagem: "https://i.pinimg.com/736x/b0/93/64/b0936414d6c67b74c5dbe451cd7a1fb0.jpg" },
    { nome: "Lando Norris", imagem: "https://i.pinimg.com/736x/6c/75/59/6c7559d14ca6e5f88391f1e312b6ef47.jpg" },
    { nome: "Oscar Piastri", imagem: "https://i.pinimg.com/736x/70/92/d7/7092d7fe2604183d8e2ff1f37ef3990f.jpg" },
    { nome: "Fernando Alonso", imagem: "https://i.pinimg.com/1200x/8d/a2/10/8da210cfba7a96d6de593ad0d3ffdab6.jpg" },
    { nome: "Lance Stroll", imagem: "https://i.pinimg.com/1200x/0b/4f/be/0b4fbe1d41c315fff3e9e2db39024dac.jpg" },
    { nome: "Pierre Gasly", imagem: "https://i.pinimg.com/736x/e2/d6/8d/e2d68d701b57ddcc6a58a1e0a9f76846.jpg" },
    { nome: "Jack Doohan", imagem: "https://i.pinimg.com/1200x/45/27/b7/4527b7f51ecd8a328dc05b663e29716a.jpg" },
    { nome: "Alexander Albon", imagem: "https://i.pinimg.com/736x/13/52/db/1352db5d1283dae178da9f3357432977.jpg" },
    { nome: "Carlos Sainz", imagem: "https://i.pinimg.com/1200x/aa/66/59/aa66592d3d92b65f18a3ab1254c476b7.jpg" },
    { nome: "Liam Lawson", imagem: "https://i.pinimg.com/736x/8c/ce/4d/8cce4d87e3772c546307e06655497814.jpg" },
    { nome: "Arvid Lindblad", imagem: "https://i.pinimg.com/736x/6c/3c/33/6c3c339bab6eb1cf7cdbaa84ecc678d5.jpg" },
    { nome: "Nico Hülkenberg", imagem: "https://i.pinimg.com/736x/5e/2f/26/5e2f2601285b29c2ec9fb259b96bfb4c.jpg" },
    { nome: "Gabriel Bortoleto", imagem: "https://i.pinimg.com/736x/36/00/eb/3600eb0a76e36369255905b4031b78f0.jpg" },
    { nome: "Oliver Bearman", imagem: "https://i.pinimg.com/736x/ac/9b/dd/ac9bdd0b5ec5f0083ce68009ee0abfef.jpg" },
    { nome: "Esteban Ocon", imagem: "https://i.pinimg.com/736x/0a/d4/6a/0ad46a6baca3f6d4a3d7738f34d66978.jpg" }
];

document.addEventListener("DOMContentLoaded", () => {
    configurarMenu();

    if (document.getElementById("main-home")) {
        renderizarHome();
    }

    if (document.getElementById("wrapper-detalhes-conteudo")) {
        renderizarDetalhes();
    }

    if (document.getElementById("login-page")) {
        configurarLogin();
    }

    if (document.getElementById("cadastro-usuario-page")) {
        configurarCadastroUsuario();
    }

    if (document.getElementById("favoritos-page")) {
        renderizarFavoritos();
    }

    if (document.getElementById("admin-page")) {
        configurarAdmin();
    }
});

function getUsuarioLogado() {
    try {
        return JSON.parse(sessionStorage.getItem(SESSION_KEY));
    } catch {
        return null;
    }
}

function setUsuarioLogado(usuario) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
}

function encerrarSessao() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = "index.html";
}

function configurarMenu() {
    const usuario = getUsuarioLogado();
    const admin = Boolean(usuario && usuario.admin);

    alternarMenu("[data-menu-favoritos]", Boolean(usuario));
    alternarMenu("[data-menu-admin]", admin);
    alternarMenu("[data-menu-login]", !usuario);
    alternarMenu("[data-menu-logout]", Boolean(usuario));

    document.querySelectorAll("[data-menu-logout]").forEach((botao) => {
        botao.addEventListener("click", encerrarSessao);
    });
}

function alternarMenu(seletor, visivel) {
    document.querySelectorAll(seletor).forEach((elemento) => {
        const itemMenu = elemento.closest("li") || elemento;
        itemMenu.style.display = visivel ? "" : "none";
    });
}

async function apiGet(recurso) {
    const resposta = await fetch(`${API_URL}${recurso}`);
    if (!resposta.ok) {
        throw new Error("Falha ao carregar dados do JSON Server.");
    }
    return resposta.json();
}

async function apiSend(recurso, metodo, corpo) {
    const resposta = await fetch(`${API_URL}${recurso}`, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: corpo ? JSON.stringify(corpo) : undefined
    });

    if (!resposta.ok) {
        throw new Error("Falha ao salvar dados no JSON Server.");
    }

    if (resposta.status === 204) {
        return null;
    }

    return resposta.json();
}

async function renderizarHome() {
    const gridEquipes = document.getElementById("grid-equipes");

    try {
        const [equipes, favoritos] = await Promise.all([
            apiGet("/equipes"),
            carregarFavoritosUsuario()
        ]);

        renderizarCarrossel(equipes.filter((equipe) => equipe.destaque));
        renderizarCardsEquipes(equipes, favoritos, gridEquipes);
        renderizarGraficoEquipes(equipes);
        configurarPesquisa(equipes, favoritos, gridEquipes);
    } catch (erro) {
        mostrarErro(gridEquipes, erro.message);
    }
}

function renderizarCarrossel(equipesDestaque) {
    const container = document.getElementById("carousel-destaques-inner");
    if (!container) {
        return;
    }

    const destaques = equipesDestaque.length > 0 ? equipesDestaque : [];

    if (destaques.length === 0) {
        container.innerHTML = `
            <div class="carousel-item active">
                <section class="hero-banner">
                    <div class="hero-overlay"></div>
                    <div class="hero-content">
                        <span class="hero-tag">Temporada Atualizada 2026</span>
                        <h2>Velocidade. Engenharia. Emoção pura.</h2>
                        <p>Nenhum item foi marcado como destaque no JSON Server.</p>
                        <a href="#secao-equipes" class="btn-primary">Ver Grid Dinâmico</a>
                    </div>
                </section>
            </div>`;
        return;
    }

    container.innerHTML = destaques.map((equipe, index) => `
        <div class="carousel-item ${index === 0 ? "active" : ""}" data-bs-interval="5000">
            <section class="hero-banner" style="background-image: url('${escapeAttr(equipe.imagem)}');">
                <div class="hero-overlay"></div>
                <div class="hero-content">
                    <span class="hero-tag">Escuderia em Destaque</span>
                    <h2>${escapeHtml(equipe.nome)}</h2>
                    <p>${escapeHtml(equipe.descricao)}</p>
                    <a href="detalhes.html?id=${encodeURIComponent(equipe.id)}" class="btn-primary">Análise Técnica</a>
                </div>
            </section>
        </div>`).join("");
}

function configurarPesquisa(equipes, favoritos, gridEquipes) {
    const campoPesquisa = document.getElementById("campo-pesquisa");
    if (!campoPesquisa) {
        return;
    }

    campoPesquisa.addEventListener("input", () => {
        const termo = normalizar(campoPesquisa.value);
        const equipesFiltradas = equipes.filter((equipe) => {
            const nome = normalizar(equipe.nome);
            const descricao = normalizar(equipe.descricao);
            return nome.includes(termo) || descricao.includes(termo);
        });

        renderizarCardsEquipes(equipesFiltradas, favoritos, gridEquipes);
    });
}

function renderizarCardsEquipes(equipes, favoritos, container) {
    const mensagemVazia = document.getElementById("mensagem-lista-vazia");

    if (!container) {
        return;
    }

    if (mensagemVazia) {
        mensagemVazia.hidden = equipes.length > 0;
    }

    container.innerHTML = equipes.map((equipe) => cardEquipeHtml(equipe, favoritos)).join("");
    configurarBotoesFavorito(container);
}

function cardEquipeHtml(equipe, favoritos) {
    const favorita = favoritos.some((favorito) => favorito.equipeId === equipe.id);

    return `
        <div class="custom-card">
            <button class="favorite-btn ${favorita ? "is-active" : ""}" type="button"
                data-favorite-id="${escapeAttr(equipe.id)}"
                aria-label="${favorita ? "Remover dos favoritos" : "Adicionar aos favoritos"}">
                ${favorita ? "&#9829;" : "&#9825;"}
            </button>
            <a href="detalhes.html?id=${encodeURIComponent(equipe.id)}" class="card-image-wrapper">
                <img src="${escapeAttr(equipe.imagem)}" alt="${escapeAttr(equipe.nome)}">
            </a>
            <div class="card-content">
                <span class="card-badge">${escapeHtml(equipe.categoria || "Escuderia Oficial")}</span>
                <h3>${escapeHtml(equipe.nome)}</h3>
                <p>${escapeHtml(equipe.descricao)}</p>
                <div class="card-btn">
                    <a href="detalhes.html?id=${encodeURIComponent(equipe.id)}" class="btn-primary">Análise Técnica</a>
                </div>
            </div>
        </div>`;
}

async function carregarFavoritosUsuario() {
    const usuario = getUsuarioLogado();
    if (!usuario) {
        return [];
    }

    return apiGet(`/favoritos?usuarioId=${encodeURIComponent(usuario.id)}`);
}

function configurarBotoesFavorito(raiz = document) {
    raiz.querySelectorAll("[data-favorite-id]").forEach((botao) => {
        botao.addEventListener("click", async (evento) => {
            evento.preventDefault();
            evento.stopPropagation();
            await alternarFavorito(botao.dataset.favoriteId);
        });
    });
}

async function alternarFavorito(equipeId) {
    const usuario = getUsuarioLogado();
    if (!usuario) {
        alert("Entre no F1 Hub para marcar favoritos.");
        window.location.href = "login.html";
        return;
    }

    try {
        const favoritos = await apiGet(`/favoritos?usuarioId=${encodeURIComponent(usuario.id)}&equipeId=${encodeURIComponent(equipeId)}`);
        const favoritoExistente = favoritos[0];

        if (favoritoExistente) {
            await apiSend(`/favoritos/${favoritoExistente.id}`, "DELETE");
        } else {
            await apiSend("/favoritos", "POST", {
                id: criarId("fav"),
                usuarioId: usuario.id,
                equipeId
            });
        }

        atualizarPaginaAtual();
    } catch (erro) {
        alert(erro.message);
    }
}

function atualizarPaginaAtual() {
    if (document.getElementById("main-home")) {
        renderizarHome();
        return;
    }

    if (document.getElementById("favoritos-page")) {
        renderizarFavoritos();
        return;
    }

    if (document.getElementById("wrapper-detalhes-conteudo")) {
        renderizarDetalhes();
    }
}

function renderizarGraficoEquipes(equipes) {
    const grafico = document.getElementById("grafico-equipes");
    if (!grafico) {
        return;
    }

    const maiorValor = Math.max(...equipes.map((equipe) => Number(equipe.estatisticas?.vitorias || 0)), 1);

    grafico.innerHTML = equipes.map((equipe) => {
        const vitorias = Number(equipe.estatisticas?.vitorias || 0);
        const largura = Math.max((vitorias / maiorValor) * 100, 4);

        return `
            <a class="chart-row" href="detalhes.html?id=${encodeURIComponent(equipe.id)}">
                <span>${escapeHtml(equipe.nome)}</span>
                <div class="chart-track">
                    <div class="chart-bar" style="width: ${largura}%"></div>
                </div>
                <strong>${vitorias}</strong>
            </a>`;
    }).join("");
}

async function renderizarDetalhes() {
    const wrapper = document.getElementById("wrapper-detalhes-conteudo");
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        wrapper.innerHTML = estadoErroHtml("Escuderia não encontrada.");
        return;
    }

    try {
        const [equipe, pilotos, favoritos] = await Promise.all([
            apiGet(`/equipes/${encodeURIComponent(id)}`),
            apiGet(`/pilotos?equipeId=${encodeURIComponent(id)}`),
            carregarFavoritosUsuario()
        ]);

        preencherDetalhesEquipe(equipe, pilotos, favoritos);
    } catch (erro) {
        wrapper.innerHTML = estadoErroHtml(erro.message);
    }
}

function preencherDetalhesEquipe(equipe, pilotos, favoritos) {
    document.getElementById("detalhe-foto").src = equipe.imagem;
    document.getElementById("detalhe-foto").alt = equipe.nome;
    document.getElementById("detalhe-nome").innerText = equipe.nome;
    document.getElementById("detalhe-bio").innerText = equipe.detalles?.historia || equipe.descricao;

    const botaoFavorito = document.getElementById("btn-favorito-detalhe");
    const favorita = favoritos.some((favorito) => favorito.equipeId === equipe.id);
    botaoFavorito.dataset.favoriteId = equipe.id;
    botaoFavorito.classList.toggle("is-active", favorita);
    botaoFavorito.innerHTML = favorita ? "&#9829;" : "&#9825;";
    botaoFavorito.setAttribute("aria-label", favorita ? "Remover dos favoritos" : "Adicionar aos favoritos");
    configurarBotoesFavorito(document);

    const ficha = [
        ["Sede Operacional", equipe.detalles?.base],
        ["Direção de Equipe", equipe.detalles?.chefe],
        ["Unidade de Potência", equipe.detalles?.motor],
        ["Histórico de Sucesso", equipe.detalles?.titulos],
        ["Vitórias", equipe.estatisticas?.vitorias]
    ];

    document.getElementById("detalhe-ficha").innerHTML = ficha.map(([item, detalhe], index) => `
        <div class="ficha-item">
            <strong>${index + 1}. ${escapeHtml(item)}:</strong>
            <span>${escapeHtml(String(detalhe ?? "Não informado"))}</span>
        </div>`).join("");

    const gridPilotos = document.getElementById("grid-pilotos-vinculados");
    if (pilotos.length === 0) {
        gridPilotos.innerHTML = `<p class="empty-state">Nenhum piloto vinculado a esta escuderia.</p>`;
        return;
    }

    gridPilotos.innerHTML = pilotos.map((piloto) => `
        <div class="custom-card">
            <div class="card-image-wrapper">
                <img src="${escapeAttr(fotoDoPiloto(piloto))}" alt="${escapeAttr(piloto.nome)}">
            </div>
            <div class="card-content">
                <span class="card-badge">Piloto Titular</span>
                <h3>${escapeHtml(piloto.nome)}</h3>
                <p>Número do Monoposto: #${escapeHtml(piloto.detalles?.numero || "-")}</p>
                <p>País: ${escapeHtml(piloto.detalles?.pais || "Não informado")}</p>
            </div>
        </div>`).join("");
}

function configurarLogin() {
    const form = document.getElementById("form-login");
    const mensagem = document.getElementById("mensagem-login");

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const login = document.getElementById("login-usuario").value.trim();
        const senha = document.getElementById("senha-usuario").value;

        try {
            const usuarios = await apiGet(`/usuarios?login=${encodeURIComponent(login)}&senha=${encodeURIComponent(senha)}`);
            const usuario = usuarios[0];

            if (!usuario) {
                mensagem.textContent = "Login ou senha inválidos.";
                mensagem.className = "status-message is-error";
                return;
            }

            setUsuarioLogado(usuario);
            window.location.href = "index.html";
        } catch (erro) {
            mensagem.textContent = erro.message;
            mensagem.className = "status-message is-error";
        }
    });
}

function configurarCadastroUsuario() {
    const form = document.getElementById("form-cadastro-usuario");
    const mensagem = document.getElementById("mensagem-cadastro-usuario");

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const usuario = {
            id: criarId("u"),
            nome: document.getElementById("cadastro-nome").value.trim(),
            email: document.getElementById("cadastro-email").value.trim(),
            login: document.getElementById("cadastro-login").value.trim(),
            senha: document.getElementById("cadastro-senha").value,
            admin: false
        };

        try {
            const existentes = await apiGet(`/usuarios?login=${encodeURIComponent(usuario.login)}`);
            if (existentes.length > 0) {
                mensagem.textContent = "Este login já está em uso.";
                mensagem.className = "status-message is-error";
                return;
            }

            const usuarioCriado = await apiSend("/usuarios", "POST", usuario);
            setUsuarioLogado(usuarioCriado);
            window.location.href = "index.html";
        } catch (erro) {
            mensagem.textContent = erro.message;
            mensagem.className = "status-message is-error";
        }
    });
}

async function renderizarFavoritos() {
    const usuario = getUsuarioLogado();
    const grid = document.getElementById("grid-favoritos");
    const mensagem = document.getElementById("mensagem-favoritos");

    if (!usuario) {
        grid.innerHTML = "";
        mensagem.innerHTML = `Entre no F1 Hub para visualizar seus favoritos. <a href="login.html">Fazer login</a>`;
        return;
    }

    try {
        const [equipes, favoritos] = await Promise.all([
            apiGet("/equipes"),
            carregarFavoritosUsuario()
        ]);

        const idsFavoritos = favoritos.map((favorito) => favorito.equipeId);
        const equipesFavoritas = equipes.filter((equipe) => idsFavoritos.includes(equipe.id));

        if (equipesFavoritas.length === 0) {
            grid.innerHTML = "";
            mensagem.textContent = "Você ainda não marcou nenhuma escuderia como favorita.";
            return;
        }

        mensagem.textContent = "";
        renderizarCardsEquipes(equipesFavoritas, favoritos, grid);
    } catch (erro) {
        mostrarErro(grid, erro.message);
    }
}

async function configurarAdmin() {
    const usuario = getUsuarioLogado();
    const pagina = document.getElementById("admin-page");

    if (!usuario || !usuario.admin) {
        pagina.innerHTML = `
            <section class="form-card">
                <span class="hero-tag">Acesso restrito</span>
                <h1>Cadastro disponível apenas para administradores</h1>
                <p class="form-helper"><a href="login.html">Entrar com usuário administrador</a></p>
            </section>`;
        return;
    }

    document.getElementById("form-equipe").addEventListener("submit", salvarEquipe);
    document.getElementById("btn-limpar-equipe").addEventListener("click", limparFormularioEquipe);
    await renderizarListaAdmin();
}

async function renderizarListaAdmin() {
    const lista = document.getElementById("lista-admin-equipes");

    try {
        const equipes = await apiGet("/equipes");

        lista.innerHTML = equipes.map((equipe) => `
            <div class="admin-list-item">
                <img src="${escapeAttr(equipe.imagem)}" alt="${escapeAttr(equipe.nome)}">
                <div>
                    <strong>${escapeHtml(equipe.nome)}</strong>
                    <span>${escapeHtml(equipe.detalles?.base || "Base não informada")}</span>
                </div>
                <button type="button" class="btn-secondary" data-editar-equipe="${escapeAttr(equipe.id)}">Editar</button>
                <button type="button" class="btn-secondary danger" data-excluir-equipe="${escapeAttr(equipe.id)}">Excluir</button>
            </div>`).join("");

        lista.querySelectorAll("[data-editar-equipe]").forEach((botao) => {
            botao.addEventListener("click", () => carregarEquipeNoFormulario(botao.dataset.editarEquipe));
        });

        lista.querySelectorAll("[data-excluir-equipe]").forEach((botao) => {
            botao.addEventListener("click", () => excluirEquipe(botao.dataset.excluirEquipe));
        });
    } catch (erro) {
        mostrarErro(lista, erro.message);
    }
}

async function carregarEquipeNoFormulario(id) {
    const equipe = await apiGet(`/equipes/${encodeURIComponent(id)}`);

    document.getElementById("equipe-id").value = equipe.id;
    document.getElementById("equipe-nome").value = equipe.nome || "";
    document.getElementById("equipe-descricao").value = equipe.descricao || "";
    document.getElementById("equipe-imagem").value = equipe.imagem || "";
    document.getElementById("equipe-base").value = equipe.detalles?.base || "";
    document.getElementById("equipe-chefe").value = equipe.detalles?.chefe || "";
    document.getElementById("equipe-motor").value = equipe.detalles?.motor || "";
    document.getElementById("equipe-titulos").value = equipe.detalles?.titulos || "";
    document.getElementById("equipe-historia").value = equipe.detalles?.historia || "";
    document.getElementById("equipe-estatistica-titulos").value = equipe.estatisticas?.titulosConstrutores || 0;
    document.getElementById("equipe-vitorias").value = equipe.estatisticas?.vitorias || 0;
    document.getElementById("equipe-destaque").checked = Boolean(equipe.destaque);

    document.getElementById("mensagem-admin").textContent = `Editando ${equipe.nome}.`;
    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function salvarEquipe(evento) {
    evento.preventDefault();

    const idAtual = document.getElementById("equipe-id").value;
    const equipe = {
        id: idAtual || criarId("e"),
        nome: document.getElementById("equipe-nome").value.trim(),
        descricao: document.getElementById("equipe-descricao").value.trim(),
        imagem: document.getElementById("equipe-imagem").value.trim(),
        categoria: "Equipes",
        destaque: document.getElementById("equipe-destaque").checked,
        detalles: {
            base: document.getElementById("equipe-base").value.trim(),
            chefe: document.getElementById("equipe-chefe").value.trim(),
            motor: document.getElementById("equipe-motor").value.trim(),
            titulos: document.getElementById("equipe-titulos").value.trim(),
            historia: document.getElementById("equipe-historia").value.trim()
        },
        estatisticas: {
            titulosConstrutores: Number(document.getElementById("equipe-estatistica-titulos").value),
            vitorias: Number(document.getElementById("equipe-vitorias").value),
            podios: 0
        }
    };

    const mensagem = document.getElementById("mensagem-admin");

    try {
        if (idAtual) {
            await apiSend(`/equipes/${encodeURIComponent(idAtual)}`, "PUT", equipe);
            mensagem.textContent = "Escuderia atualizada com sucesso.";
        } else {
            await apiSend("/equipes", "POST", equipe);
            mensagem.textContent = "Escuderia cadastrada com sucesso.";
        }

        mensagem.className = "status-message is-success";
        limparFormularioEquipe();
        await renderizarListaAdmin();
    } catch (erro) {
        mensagem.textContent = erro.message;
        mensagem.className = "status-message is-error";
    }
}

async function excluirEquipe(id) {
    const confirmar = confirm("Deseja excluir esta escuderia?");
    if (!confirmar) {
        return;
    }

    const mensagem = document.getElementById("mensagem-admin");

    try {
        const favoritos = await apiGet(`/favoritos?equipeId=${encodeURIComponent(id)}`);
        await Promise.all(favoritos.map((favorito) => apiSend(`/favoritos/${favorito.id}`, "DELETE")));
        await apiSend(`/equipes/${encodeURIComponent(id)}`, "DELETE");

        mensagem.textContent = "Escuderia excluída com sucesso.";
        mensagem.className = "status-message is-success";
        await renderizarListaAdmin();
    } catch (erro) {
        mensagem.textContent = erro.message;
        mensagem.className = "status-message is-error";
    }
}

function limparFormularioEquipe() {
    document.getElementById("form-equipe").reset();
    document.getElementById("equipe-id").value = "";
}

function fotoDoPiloto(piloto) {
    const foto = fotosPilotosApp.find((item) => normalizar(item.nome) === normalizar(piloto.nome));
    return foto?.imagem || piloto.imagem || "";
}

function mostrarErro(container, mensagem) {
    if (!container) {
        return;
    }

    container.innerHTML = estadoErroHtml(`${mensagem} Confira se o JSON Server está rodando em http://localhost:3000.`);
}

function estadoErroHtml(mensagem) {
    return `
        <div class="empty-state error-state">
            <h2>Não foi possível carregar os dados.</h2>
            <p>${escapeHtml(mensagem)}</p>
            <a href="index.html" class="btn-primary">Voltar ao início</a>
        </div>`;
}

function criarId(prefixo) {
    if (window.crypto && crypto.randomUUID) {
        return `${prefixo}-${crypto.randomUUID()}`;
    }

    return `${prefixo}-${Date.now()}`;
}

function normalizar(texto = "") {
    return String(texto)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function escapeHtml(valor = "") {
    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeAttr(valor = "") {
    return escapeHtml(valor);
}
