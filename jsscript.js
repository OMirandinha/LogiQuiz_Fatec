//Menu responsivel para celular
function menuShow() {
    let menuMobile = document.querySelector('.mobile-menu');
    if (menuMobile.classList.contains('open')) {
        menuMobile.classList.remove('open');
        document.querySelector('.icon').src ="img/icone-menu-abrir.png";
    } else {
        menuMobile.classList.add('open');
        document.querySelector('.icon').src = "img/icone-menu-fechar.png";
    }
}  
document.addEventListener('DOMContentLoaded', () => {

    const botoesMenu = document.querySelectorAll('.btn-menu');
    const secoesConteudo = document.querySelectorAll('.conteudo-secao');
    const seletorMenu = document.getElementById('seletor-menu');

    // FUNÇÃO PARA TROCAR O CONTEÚDO
    function trocarSecao(idAlvo) {
        // 1. Esconde todas as seções
        secoesConteudo.forEach(secao => secao.classList.remove('ativa'));
        
        // 2. Mostra a seção alvo
        const secaoAlvo = document.getElementById(idAlvo);
        if (secaoAlvo) {
            secaoAlvo.classList.add('ativa');
        }
    }

    // LÓGICA 1: CLIQUES NO MENU LATERAL (DESKTOP)
    botoesMenu.forEach(botao => {
        botao.addEventListener('click', () => {
            // Muda visual do botão
            botoesMenu.forEach(btn => btn.classList.remove('ativa'));
            botao.classList.add('ativa');

            // Troca o conteúdo
            trocarSecao(botao.dataset.target);
            
            // (Opcional) Sincroniza o select do mobile caso a pessoa redimensione a tela
            if(seletorMenu) seletorMenu.value = botao.dataset.target;
        });
    });

    // LÓGICA 2: MUDANÇA NO SELECT (MOBILE)
    if (seletorMenu) {
        seletorMenu.addEventListener('change', () => {
            trocarSecao(seletorMenu.value);
        });
    }

});