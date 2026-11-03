// ==========================================
// SUKISHI — LOFI
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // ELEMENTOS
  // ==========================================

  const audio = document.getElementById("lofiAudio");

  const btnMusica = document.getElementById("btnMusica");
  const btnImagem = document.getElementById("btnImagem");
  const btnPublicar = document.getElementById("btnPublicar");

  const inputImagem = document.getElementById("inputImagem");
  const textarea = document.getElementById("lofiPostText");

  const btnPlay = document.querySelector(".play-button");
  const btnPlayer = document.querySelectorAll(".player-controls button");

  const tituloPlayer = document.querySelector(".player-info strong");
  const artistaPlayer = document.querySelector(".player-info span");

  const barraProgresso = document.querySelector(".player-progress div");

  const tempoAtual = document.querySelector(".player-time span:first-child");

  const duracaoTotal = document.querySelector(".player-time span:last-child");

  const feed = document.querySelector(".main-feed");

  // ==========================================
  // VARIÁVEIS
  // ==========================================

  let musicaSelecionada = null;
  let imagemSelecionada = null;

  let playlist = [];
  let musicaAtual = 0;

  let moodAtual = "TODOS";

  // ==========================================
  // FORMATAR TEMPO
  // ==========================================

  function formatarTempo(segundos) {
    if (isNaN(segundos)) {
      return "0:00";
    }

    const minutos = Math.floor(segundos / 60);

    const segundosRestantes = Math.floor(segundos % 60)
      .toString()
      .padStart(2, "0");

    return `${minutos}:${segundosRestantes}`;
  }

  // ==========================================
  // PESQUISAR MÚSICA
  // ==========================================

  if (btnMusica) {
    btnMusica.addEventListener("click", async () => {
      const artista = prompt("Nome do cantor ou artista:");

      if (!artista) return;

      const nomeMusica = prompt("Nome da música:");

      if (!nomeMusica) return;

      btnMusica.innerHTML = `
                <ion-icon name="hourglass-outline"></ion-icon>
                A procurar...
            `;

      try {
        const pesquisa = encodeURIComponent(`${artista} ${nomeMusica}`);

        const url = `https://itunes.apple.com/search?term=${pesquisa}&entity=song&limit=10&country=PT`;

        const resposta = await fetch(url);

        if (!resposta.ok) {
          throw new Error("Erro na API");
        }

        const dados = await resposta.json();

        if (!dados.results || dados.results.length === 0) {
          alert("Não encontrei essa música.");

          restaurarBotaoMusica();

          return;
        }

        // Procurar resultado mais parecido

        const resultado =
          dados.results.find((item) => {
            const titulo = item.trackName?.toLowerCase();

            const artistaResultado = item.artistName?.toLowerCase();

            return (
              titulo?.includes(nomeMusica.toLowerCase()) &&
              artistaResultado?.includes(artista.toLowerCase())
            );
          }) || dados.results[0];

        // Verificar preview

        if (!resultado.previewUrl) {
          alert(
            "Encontrei a música, mas esta faixa não tem uma preview disponível.",
          );

          restaurarBotaoMusica();

          return;
        }

        musicaSelecionada = {
          titulo: resultado.trackName,

          artista: resultado.artistName,

          album: resultado.collectionName,

          capa: resultado.artworkUrl100,

          preview: resultado.previewUrl,

          link: resultado.trackViewUrl,
        };

        // Colocar no player

        carregarMusica(musicaSelecionada);

        // Adicionar à playlist

        playlist.push(musicaSelecionada);

        musicaAtual = playlist.length - 1;

        // Alterar botão

        btnMusica.innerHTML = `
                    <ion-icon name="checkmark-circle-outline"></ion-icon>
                    ${musicaSelecionada.titulo}
                `;

        // Tocar

        tocarMusica();
      } catch (erro) {
        console.error(erro);

        alert("Não foi possível procurar a música.");

        restaurarBotaoMusica();
      }
    });
  }

  // ==========================================
  // RESTAURAR BOTÃO MÚSICA
  // ==========================================

  function restaurarBotaoMusica() {
    if (!btnMusica) return;

    btnMusica.innerHTML = `
            <ion-icon name="musical-notes-outline"></ion-icon>
            Música
        `;
  }

  // ==========================================
  // CARREGAR MÚSICA
  // ==========================================

  function carregarMusica(musica) {
    if (!musica || !audio) return;

    audio.src = musica.preview;

    if (tituloPlayer) {
      tituloPlayer.textContent = musica.titulo;
    }

    if (artistaPlayer) {
      artistaPlayer.textContent = musica.artista;
    }

    if (barraProgresso) {
      barraProgresso.style.width = "0%";
    }

    if (tempoAtual) {
      tempoAtual.textContent = "0:00";
    }

    if (duracaoTotal) {
      duracaoTotal.textContent = "0:30";
    }

    // Capa

    const capa = document.querySelector(".player-cover");

    if (capa && musica.capa) {
      capa.style.backgroundImage = `url("${musica.capa}")`;

      capa.style.backgroundSize = "cover";

      capa.style.backgroundPosition = "center";

      capa.innerHTML = "";
    }
  }

  // ==========================================
  // PLAY
  // ==========================================

  function tocarMusica() {
    if (!audio || !audio.src) return;

    audio
      .play()
      .then(() => {
        atualizarBotaoPlay(true);
      })
      .catch((erro) => {
        console.error("Não foi possível reproduzir:", erro);
      });
  }

  // ==========================================
  // PAUSE
  // ==========================================

  function pausarMusica() {
    if (!audio) return;

    audio.pause();

    atualizarBotaoPlay(false);
  }

  // ==========================================
  // BOTÃO PLAY
  // ==========================================

  function atualizarBotaoPlay(tocando) {
    if (!btnPlay) return;

    if (tocando) {
      btnPlay.innerHTML = `
                <ion-icon name="pause"></ion-icon>
            `;
    } else {
      btnPlay.innerHTML = `
                <ion-icon name="play"></ion-icon>
            `;
    }
  }

  if (btnPlay) {
    btnPlay.addEventListener("click", () => {
      if (!audio.src) {
        alert("Primeiro escolhe uma música.");

        return;
      }

      if (audio.paused) {
        tocarMusica();
      } else {
        pausarMusica();
      }
    });
  }

  // ==========================================
  // PROGRESSO DA MÚSICA
  // ==========================================

  if (audio) {
    audio.addEventListener("timeupdate", () => {
      if (!audio.duration) return;

      const progresso = (audio.currentTime / audio.duration) * 100;

      if (barraProgresso) {
        barraProgresso.style.width = `${progresso}%`;
      }

      if (tempoAtual) {
        tempoAtual.textContent = formatarTempo(audio.currentTime);
      }

      if (duracaoTotal) {
        duracaoTotal.textContent = formatarTempo(audio.duration);
      }
    });

    // Quando termina

    audio.addEventListener("ended", () => {
      proximaMusica();
    });
  }

  // ==========================================
  // PRÓXIMA MÚSICA
  // ==========================================

  function proximaMusica() {
    if (playlist.length === 0) return;

    musicaAtual++;

    if (musicaAtual >= playlist.length) {
      musicaAtual = 0;
    }

    carregarMusica(playlist[musicaAtual]);

    tocarMusica();
  }

  // ==========================================
  // MÚSICA ANTERIOR
  // ==========================================

  function musicaAnterior() {
    if (playlist.length === 0) return;

    musicaAtual--;

    if (musicaAtual < 0) {
      musicaAtual = playlist.length - 1;
    }

    carregarMusica(playlist[musicaAtual]);

    tocarMusica();
  }

  // ==========================================
  // CONTROLOS DO PLAYER
  // ==========================================

  if (btnPlayer.length >= 3) {
    btnPlayer[0].addEventListener("click", musicaAnterior);

    btnPlayer[2].addEventListener("click", proximaMusica);
  }

  // ==========================================
  // IMAGEM
  // ==========================================

  if (btnImagem && inputImagem) {
    btnImagem.addEventListener("click", () => {
      inputImagem.click();
    });

    inputImagem.addEventListener("change", () => {
      const ficheiro = inputImagem.files[0];

      if (!ficheiro) return;

      const leitor = new FileReader();

      leitor.onload = () => {
        imagemSelecionada = leitor.result;

        btnImagem.innerHTML = `
                        <ion-icon name="checkmark-circle-outline"></ion-icon>
                        Imagem escolhida
                    `;
      };

      leitor.readAsDataURL(ficheiro);
    });
  }

  // ==========================================
  // PUBLICAR
  // ==========================================

  if (btnPublicar) {
    btnPublicar.addEventListener("click", () => {
      const texto = textarea ? textarea.value.trim() : "";

      if (!texto && !musicaSelecionada && !imagemSelecionada) {
        alert(
          "Escreve alguma coisa, escolhe uma música ou adiciona uma imagem.",
        );

        return;
      }

      const post = document.createElement("article");

      post.className = "post-card lofi-post";

      post.dataset.moods = detectarMoods(texto);

      let conteudo = "";

      // Texto

      if (texto) {
        conteudo += `
                        <p class="user-post-text">
                            ${escaparHTML(texto)}
                        </p>
                    `;
      }

      // Música

      if (musicaSelecionada) {
        conteudo += `

                        <div class="music-card">

                            <div class="music-cover">

                                <img
                                    src="${musicaSelecionada.capa}"
                                    alt="Capa da música"
                                >

                            </div>

                            <div class="music-info">

                                <strong>
                                    ${escaparHTML(musicaSelecionada.titulo)}
                                </strong>

                                <span>
                                    ${escaparHTML(musicaSelecionada.artista)}
                                </span>

                            </div>

                            <button
                                class="music-play"
                                type="button"
                            >

                                <ion-icon
                                    name="play"
                                ></ion-icon>

                            </button>

                        </div>

                    `;
      }

      // Imagem

      if (imagemSelecionada) {
        conteudo += `

                        <img
                            src="${imagemSelecionada}"
                            class="post-image"
                            alt="Imagem publicada"
                        >

                    `;
      }

      post.innerHTML = `

                    <div class="post-header">

                        <div class="user-avatar">
                            U
                        </div>

                        <div>

                            <strong>
                                Tu
                            </strong>

                            <span>
                                Agora · Cantinho Lo-Fi
                            </span>

                        </div>

                    </div>


                    <div class="post-content">

                        <div class="post-tag">
                            🎧 A ouvir
                        </div>

                        ${conteudo}

                    </div>


                    <div class="post-actions">

                        <button
                            class="btn-like"
                            type="button"
                        >

                            <ion-icon
                                name="heart-outline"
                            ></ion-icon>

                            <span>0</span>
                            Gostos

                        </button>


                        <button
                            class="btn-comment"
                            type="button"
                        >

                            <ion-icon
                                name="chatbubble-outline"
                            ></ion-icon>

                            <span>0</span>
                            Comentários

                        </button>


                        <button
                            class="btn-share"
                            type="button"
                        >

                            <ion-icon
                                name="share-social-outline"
                            ></ion-icon>

                            Partilhar

                        </button>

                    </div>

                `;

      const createPost = document.querySelector(".create-post-card");

      if (createPost) {
        createPost.after(post);
      } else {
        feed.appendChild(post);
      }

      ativarPost(post);

      // Limpar

      if (textarea) {
        textarea.value = "";
      }

      musicaSelecionada = null;

      imagemSelecionada = null;

      if (inputImagem) {
        inputImagem.value = "";
      }

      restaurarBotaoMusica();

      if (btnImagem) {
        btnImagem.innerHTML = `
                        <ion-icon name="image-outline"></ion-icon>
                        Imagem
                    `;
      }
    });
  }

  // ==========================================
  // ESCAPAR HTML
  // ==========================================

  function escaparHTML(texto) {
    const div = document.createElement("div");

    div.textContent = texto;

    return div.innerHTML;
  }

  // ==========================================
  // DETETAR MOODS
  // ==========================================

  function detectarMoods(texto) {
    const textoNormalizado = texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const moods = [];

    if (
      textoNormalizado.includes("noite") ||
      textoNormalizado.includes("midnight")
    ) {
      moods.push("noite");
    }

    if (
      textoNormalizado.includes("chuva") ||
      textoNormalizado.includes("rain") ||
      textoNormalizado.includes("rainy")
    ) {
      moods.push("chuva");
    }

    if (
      textoNormalizado.includes("cozy") ||
      textoNormalizado.includes("cafe") ||
      textoNormalizado.includes("cha") ||
      textoNormalizado.includes("manta")
    ) {
      moods.push("cozy");
    }

    if (
      textoNormalizado.includes("estudo") ||
      textoNormalizado.includes("study") ||
      textoNormalizado.includes("focus")
    ) {
      moods.push("estudo");
    }

    if (
      textoNormalizado.includes("madrugada") ||
      textoNormalizado.includes("late night")
    ) {
      moods.push("madrugada");
    }

    if (
      textoNormalizado.includes("relax") ||
      textoNormalizado.includes("calma") ||
      textoNormalizado.includes("tranquilo")
    ) {
      moods.push("relax");
    }

    if (moods.length === 0) {
      return "todos";
    }

    return moods.join(" ");
  }

  // ==========================================
  // ATIVAR POST
  // ==========================================

  function ativarPost(post) {
    ativarLike(post);

    ativarComentarios(post);

    ativarPartilha(post);

    ativarMusicaDoPost(post);
  }

  // ==========================================
  // LIKES
  // ==========================================

  function ativarLike(post) {
    const botao = post.querySelector(".btn-like");

    if (!botao) return;

    botao.addEventListener("click", () => {
      const contador = botao.querySelector("span");

      let numero = parseInt(contador.textContent) || 0;

      if (botao.classList.contains("liked")) {
        numero--;

        botao.classList.remove("liked");

        botao.querySelector("ion-icon").setAttribute("name", "heart-outline");
      } else {
        numero++;

        botao.classList.add("liked");

        botao.querySelector("ion-icon").setAttribute("name", "heart");
      }

      contador.textContent = numero;
    });
  }

  // ==========================================
  // COMENTÁRIOS
  // ==========================================

  function ativarComentarios(post) {
    const botao = post.querySelector(".btn-comment");

    if (!botao) return;

    let comentarios = post.querySelector(".comments-section");

    if (!comentarios) {
      comentarios = document.createElement("div");

      comentarios.className = "comments-section";

      comentarios.innerHTML = `

                <div class="comment-list"></div>

                <form class="comment-form">

                    <input
                        type="text"
                        class="comment-input"
                        placeholder="Escreve um comentário..."
                    >

                    <button
                        type="submit"
                        class="btn-send-comment"
                    >

                        <ion-icon
                            name="send"
                        ></ion-icon>

                    </button>

                </form>

            `;

      post.appendChild(comentarios);
    }

    botao.addEventListener("click", () => {
      comentarios.classList.toggle("active");
    });

    const form = comentarios.querySelector(".comment-form");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const input = form.querySelector(".comment-input");

      const texto = input.value.trim();

      if (!texto) return;

      const lista = comentarios.querySelector(".comment-list");

      const comentario = document.createElement("div");

      comentario.className = "comment";

      comentario.innerHTML = `

                    <strong>
                        Tu
                    </strong>

                    <p>
                        ${escaparHTML(texto)}
                    </p>

                `;

      lista.appendChild(comentario);

      const contador = botao.querySelector("span");

      let numero = parseInt(contador.textContent) || 0;

      contador.textContent = numero + 1;

      input.value = "";
    });
  }

  // ==========================================
  // PARTILHAR
  // ==========================================

  function ativarPartilha(post) {
    const botao = post.querySelector(".btn-share");

    if (!botao) return;

    botao.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);

        alert("Link copiado! 💜");
      } catch {
        alert("Não foi possível copiar o link.");
      }
    });
  }

  // ==========================================
  // MÚSICA DENTRO DOS POSTS
  // ==========================================

  function ativarMusicaDoPost(post) {
    const botao = post.querySelector(".music-play");

    if (!botao) return;

    botao.addEventListener("click", () => {
      const card = botao.closest(".music-card");

      if (!card) return;

      const titulo = card.querySelector("strong")?.textContent.trim();

      const artista = card.querySelector("span")?.textContent.trim();

      const musica = playlist.find(
        (item) => item.titulo === titulo && item.artista === artista,
      );

      if (musica) {
        musicaAtual = playlist.indexOf(musica);

        carregarMusica(musica);

        tocarMusica();

        return;
      }

      // Se a música não estiver na playlist,
      // usa a música atualmente selecionada.

      if (musicaSelecionada && musicaSelecionada.titulo === titulo) {
        carregarMusica(musicaSelecionada);

        tocarMusica();
      }
    });
  }

  // ==========================================
  // ATIVAR POSTS EXISTENTES
  // ==========================================

  document.querySelectorAll(".lofi-post").forEach((post) => {
    ativarPost(post);
  });

  // ==========================================
  // FILTRO DE MOODS
  // ==========================================

  const botoesMood = document.querySelectorAll(".mood-filter");

  botoesMood.forEach((botao) => {
    botao.addEventListener("click", () => {
      moodAtual = botao.dataset.mood?.toUpperCase();

      botoesMood.forEach((b) => b.classList.remove("active"));

      botao.classList.add("active");

      const posts = document.querySelectorAll(".lofi-post");

      let encontrados = 0;

      posts.forEach((post) => {
        const moods = (post.dataset.moods || "todos").toLowerCase();

        if (moodAtual === "TODOS" || moods.includes(moodAtual.toLowerCase())) {
          post.style.display = "block";

          encontrados++;
        } else {
          post.style.display = "none";
        }
      });

      const mensagem = document.getElementById("semResultadosLoFi");

      if (mensagem) {
        mensagem.style.display = encontrados === 0 ? "block" : "none";
      }
    });
  });
});
