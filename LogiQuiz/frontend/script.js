/**
 * Classe principal do Quiz de Lógica Booleana
 * Controla toda a lógica da aplicação, desde o carregamento das questões
 * até a interação do usuário e cálculo das estatísticas
 */
class BooleanLogicQuiz {
    constructor() {
        // Inicialização das propriedades do quiz
        this.questions = []; // Array para armazenar todas as questões
        this.currentQuestionIndex = 0; // Índice da questão atual
        this.selectedAlternative = null; // Alternativa selecionada pelo usuário
        this.answeredQuestions = new Map(); // Mapa para controlar questões respondidas
        this.correctAnswers = 0; // Contador de respostas corretas
        this.skippedQuestions = new Set(); // Conjunto para questões puladas (apenas para controle visual)
        
        // Inicializa os elementos da DOM e event listeners
        this.initializeElements();
        this.loadQuestions();
        this.setupEventListeners();
    }

    /**
     * Inicializa todos os elementos da DOM que serão utilizados
     */
    initializeElements() {
        // Elementos principais da interface
        this.loadingElement = document.getElementById('loading');
        this.questionContainer = document.getElementById('question-container');
        this.questionNumberElement = document.getElementById('question-number');
        this.questionTextElement = document.getElementById('question-text');
        this.alternativesElement = document.getElementById('alternatives');
        this.feedbackElement = document.getElementById('feedback');
        
        // Botões de navegação
        this.prevButton = document.getElementById('prev-btn');
        this.nextButton = document.getElementById('next-btn');
        this.skipButton = document.getElementById('skip-btn');
        
        // Elementos das estatísticas
        this.answeredCountElement = document.getElementById('answered-count');
        this.correctCountElement = document.getElementById('correct-count');
        this.totalCountElement = document.getElementById('total-count');
        this.percentageElement = document.getElementById('percentage');
    }

    /**
     * Carrega as questões da API
     * Em caso de erro, exibe mensagem para o usuário
     */
    async loadQuestions() {
        try {
            // Faz requisição para a API
            const response = await fetch('/api/questions');
            const data = await response.json();
            this.questions = data.questions;
            
            // Atualiza estatísticas e mostra a primeira questão
            this.updateStats();
            this.showQuestion(0);
        } catch (error) {
            console.error('Erro ao carregar questões:', error);
            this.loadingElement.innerHTML = 'Erro ao carregar questões. Verifique se o servidor está rodando.';
        }
    }

    /**
     * Exibe uma questão específica no container
     * @param {number} index - Índice da questão a ser exibida
     */
    showQuestion(index) {
        // Verifica se o índice é válido
        if (index < 0 || index >= this.questions.length) return;
        
        // Reseta o estado da questão atual (mas mantém respostas salvas)
        this.currentQuestionIndex = index;
        this.selectedAlternative = null;
        this.feedbackElement.classList.add('hidden');
        
        // Obtém a questão atual
        const question = this.questions[index];
        
        // Atualiza o cabeçalho e o texto da questão
        this.questionNumberElement.textContent = `Questão ${index + 1} de ${this.questions.length}`;
        this.questionTextElement.textContent = question.enunciado;
        
        // Renderiza as alternativas e atualiza a navegação
        this.renderAlternatives(question);
        this.updateNavigationButtons();
        
        // Esconde o loading e mostra o container da questão
        this.loadingElement.classList.add('hidden');
        this.questionContainer.classList.remove('hidden');
    }

    /**
     * Renderiza as alternativas da questão atual
     * @param {Object} question - Objeto da questão com alternativas
     */
    renderAlternatives(question) {
        // Limpa as alternativas anteriores
        this.alternativesElement.innerHTML = '';
        
        // Verifica se a questão já foi respondida
        const isAnswered = this.answeredQuestions.has(this.currentQuestionIndex);
        const userAnswer = this.answeredQuestions.get(this.currentQuestionIndex);
        
        // Se a questão foi respondida, usa a resposta salva
        if (isAnswered) {
            this.selectedAlternative = userAnswer.selected;
        }
        
        // Cria cada alternativa
        question.alternativas.forEach((alternative, index) => {
            const alternativeElement = document.createElement('div');
            alternativeElement.className = 'alternative';
            alternativeElement.textContent = alternative;
            
            // SEMPRE adiciona evento de clique, exceto se já foi respondida
            if (!isAnswered) {
                alternativeElement.addEventListener('click', () => this.selectAlternative(index, alternativeElement));
            } else {
                // Se já foi respondida, desabilita a interação
                alternativeElement.classList.add('disabled');
            }
            
            // Aplica estilos visuais baseados no estado da resposta
            if (isAnswered) {
                if (index === question.respostaCorreta) {
                    alternativeElement.classList.add('correct'); // Resposta correta
                } else if (userAnswer.selected === index && index !== question.respostaCorreta) {
                    alternativeElement.classList.add('incorrect'); // Resposta incorreta do usuário
                }
            }
            
            // Marca como selecionada se for a resposta do usuário
            if (index === this.selectedAlternative) {
                alternativeElement.classList.add('selected');
            }
            
            // Adiciona a alternativa ao container
            this.alternativesElement.appendChild(alternativeElement);
        });
        
        // Se a questão já foi respondida, mostra o feedback
        if (isAnswered) {
            this.showFeedback(userAnswer.isCorrect, question.explicacao);
        }
    }

    /**
     * Processa a seleção de uma alternativa pelo usuário
     * @param {number} index - Índice da alternativa selecionada
     * @param {HTMLElement} element - Elemento HTML da alternativa
     */
    selectAlternative(index, element) {
        // Remove seleção anterior de todas as alternativas
        document.querySelectorAll('.alternative').forEach(alt => {
            alt.classList.remove('selected');
        });
        
        // Marca a alternativa atual como selecionada
        element.classList.add('selected');
        this.selectedAlternative = index;
        
        // Obtém a questão atual e verifica se a resposta está correta
        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = index === question.respostaCorreta;
        
        // Armazena a resposta do usuário
        this.answeredQuestions.set(this.currentQuestionIndex, {
            selected: index,
            isCorrect: isCorrect
        });
        
        // Atualiza o contador de respostas corretas
        if (isCorrect && !this.answeredQuestions.get(this.currentQuestionIndex).alreadyCounted) {
            this.correctAnswers++;
            // Marca que esta resposta já foi contabilizada
            this.answeredQuestions.get(this.currentQuestionIndex).alreadyCounted = true;
        }
        
        // Desabilita todas as alternativas após a seleção
        document.querySelectorAll('.alternative').forEach(alt => {
            alt.classList.add('disabled');
            // Remove eventos de clique clonando o elemento
            const newAlt = alt.cloneNode(true);
            alt.parentNode.replaceChild(newAlt, alt);
        });
        
        // Mostra o feedback e atualiza as estatísticas
        this.checkAnswer(isCorrect, question.explicacao);
        this.updateStats();
        this.updateNavigationButtons();
    }

    /**
     * Exibe o feedback da resposta do usuário
     * @param {boolean} isCorrect - Se a resposta está correta
     * @param {string} explanation - Explicação da resposta
     */
    checkAnswer(isCorrect, explanation) {
        // Mostra o container de feedback
        this.feedbackElement.classList.remove('hidden');
        
        // Configura a mensagem e estilo baseado no acerto/erro
        this.feedbackElement.textContent = isCorrect ? 
            `✅ Correto! ${explanation}` : 
            `❌ Incorreto. ${explanation}`;
        
        this.feedbackElement.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        
        // Destaca visualmente as alternativas corretas e incorretas
        const question = this.questions[this.currentQuestionIndex];
        document.querySelectorAll('.alternative').forEach((alt, index) => {
            if (index === question.respostaCorreta) {
                alt.classList.add('correct'); // Destaca a resposta correta
            } else if (index === this.selectedAlternative && !isCorrect) {
                alt.classList.add('incorrect'); // Destaca a resposta errada do usuário
            }
        });
    }

    /**
     * Mostra o feedback para questões já respondidas anteriormente
     * @param {boolean} isCorrect - Se a resposta estava correta
     * @param {string} explanation - Explicação da resposta
     */
    showFeedback(isCorrect, explanation) {
        this.feedbackElement.classList.remove('hidden');
        this.feedbackElement.textContent = isCorrect ? 
            `✅ Correto! ${explanation}` : 
            `❌ Incorreto. ${explanation}`;
        
        this.feedbackElement.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    }

    /**
     * Permite pular a questão atual
     * A questão pulada pode ser respondida posteriormente ao voltar nela
     */
    skipQuestion() {
        // Remove qualquer resposta anterior desta questão (caso tenha respondido antes)
        if (this.answeredQuestions.has(this.currentQuestionIndex)) {
            const previousAnswer = this.answeredQuestions.get(this.currentQuestionIndex);
            // Se a resposta anterior estava correta, subtrai do contador
            if (previousAnswer.isCorrect && previousAnswer.alreadyCounted) {
                this.correctAnswers--;
            }
            this.answeredQuestions.delete(this.currentQuestionIndex);
        }
        
        // Marca como pulada apenas para controle visual temporário
        this.skippedQuestions.add(this.currentQuestionIndex);
        this.feedbackElement.classList.add('hidden');
        
        // Avança para a próxima questão se houver
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.showQuestion(this.currentQuestionIndex + 1);
        }
        
        // Atualiza as estatísticas
        this.updateStats();
        this.updateNavigationButtons();
    }

    /**
     * Atualiza todas as estatísticas na interface
     * Inclui contadores de respondidas, corretas, total e porcentagem
     */
    updateStats() {
        const totalQuestions = this.questions.length;
        const answeredQuestions = this.answeredQuestions.size;
        const percentage = totalQuestions > 0 ? Math.round((this.correctAnswers / totalQuestions) * 100) : 0;
        
        // Atualiza os elementos da DOM com os valores calculados
        this.answeredCountElement.textContent = answeredQuestions;
        this.correctCountElement.textContent = this.correctAnswers;
        this.totalCountElement.textContent = totalQuestions;
        this.percentageElement.textContent = `${percentage}%`;
    }

    /**
     * Avança para a próxima questão
     * Só funciona se a questão atual foi respondida ou pulada
     */
    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.showQuestion(this.currentQuestionIndex + 1);
        }
    }

    /**
     * Volta para a questão anterior
     */
    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.showQuestion(this.currentQuestionIndex - 1);
        }
    }

    /**
     * Atualiza o estado dos botões de navegação
     * Controla quando os botões devem estar habilitados ou desabilitados
     */
    updateNavigationButtons() {
        const isAnswered = this.answeredQuestions.has(this.currentQuestionIndex);
        
        // Botão Anterior: desabilitado na primeira questão
        this.prevButton.disabled = this.currentQuestionIndex === 0;
        
        // Botão Próxima: habilitado apenas se não é a última questão
        // (agora permite avançar mesmo sem responder, graças ao botão pular)
        this.nextButton.disabled = this.currentQuestionIndex === this.questions.length - 1;
        
        // Botão Pular: desabilitado se já respondeu ou é a última questão
        this.skipButton.disabled = isAnswered || this.currentQuestionIndex === this.questions.length - 1;
    }

    /**
     * Configura todos os event listeners da aplicação
     * Inclui clicks em botões e navegação por teclado
     */
    setupEventListeners() {
        // Event listeners para os botões de navegação
        this.nextButton.addEventListener('click', () => this.nextQuestion());
        this.prevButton.addEventListener('click', () => this.prevQuestion());
        this.skipButton.addEventListener('click', () => this.skipQuestion());
        
        // Navegação por teclado (setas esquerda/direita)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' && !this.nextButton.disabled) this.nextQuestion();
            if (e.key === 'ArrowLeft' && !this.prevButton.disabled) this.prevQuestion();
        });
    }
}

// Inicializa a aplicação quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    new BooleanLogicQuiz();
});