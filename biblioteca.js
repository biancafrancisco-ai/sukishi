// ==================== ELEMENTOS ====================

const openModal = document.getElementById("openModal");

const closeModal = document.getElementById("closeModal");

const cancelModal = document.getElementById("cancelModal");

const bookModal = document.getElementById("bookModal");


// ==================== ABRIR MODAL ====================

openModal.addEventListener("click", function () {

    bookModal.classList.add("active");

});


// ==================== FECHAR MODAL ====================

function closeBookModal() {

    bookModal.classList.remove("active");

}


// Botão X

closeModal.addEventListener("click", closeBookModal);


// Botão Cancelar

cancelModal.addEventListener("click", closeBookModal);


// ==================== CLICAR FORA ====================

bookModal.addEventListener("click", function (event) {

    if (event.target === bookModal) {

        closeBookModal();

    }

});


// ==================== TECLA ESC ====================

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        closeBookModal();

    }

});

// ================================
// EXPLORAR POR CATEGORIA
// ================================

const botoesCategoria = document.querySelectorAll(".category-filter");
const noResults = document.getElementById("noResults");

function filtrarCategoria(categoria) {

    const posts = document.querySelectorAll(".feed .post-card");

    let encontrados = 0;

    posts.forEach(post => {

        const tipoElemento = post.querySelector(".recommendation-type");

        // Se for uma publicação sem categoria
        if (!tipoElemento) {

            if (categoria === "TODOS") {
                post.style.display = "";
                encontrados++;
            } else {
                post.style.display = "none";
            }

            return;
        }

        const tipo = tipoElemento.textContent
            .trim()
            .replace(/\s+/g, " ")
            .toUpperCase();

        if (categoria === "TODOS" || tipo === categoria) {

            post.style.display = "";
            encontrados++;

        } else {

            post.style.display = "none";

        }

    });

    // Mostrar mensagem se não houver resultados
    if (noResults) {
        noResults.style.display =
            encontrados === 0 ? "block" : "none";
    }
}


// Clique nos filtros

botoesCategoria.forEach(botao => {

    botao.addEventListener("click", function () {

        const categoria = this.dataset.category;

        // Remover ativo de todos
        botoesCategoria.forEach(b => {
            b.classList.remove("active");
        });

        // Ativar o botão clicado
        this.classList.add("active");

        // Filtrar
        filtrarCategoria(categoria);

    });

});