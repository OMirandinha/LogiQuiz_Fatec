/**
 * Classe principal do Quiz de Lógica Booleana
 * Controla toda a lógica da aplicação, desde a configuração até os resultados
 */
class BooleanLogicQuiz {
    constructor() {
        // Inicialização das propriedades do quiz
        this.allQuestions = []; // Todas as questões carregadas
        this.filteredQuestions = []; // Questões filtradas por dificuldade
        this.currentQuestions = []; // Questões selecionadas para o quiz atual
        this.currentQuestionIndex = 0;
        this.selectedAlternative = null;
        this.answeredQuestions = new Map();
        this.correctAnswers = 0;
        this.skippedQuestions = new Set();
        this.isReviewMode = false; // Novo estado para controlar o modo de revisão
        
        // Configurações do usuário
        this.selectedDifficulty = 'todas';
        this.questionsCount = 5;
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadAllQuestions();
    }

    /**
     * Inicializa todos os elementos da DOM que serão utilizados
     */
    initializeElements() {
        // Elementos da tela de configuração
        this.configContainer = document.getElementById('config-container');
        this.dificuldadeSelect = document.getElementById('dificuldade');
        this.quantidadeInput = document.getElementById('quantidade');
        this.startButton = document.getElementById('start-btn');

        // Elementos da tela de loading
        this.loadingElement = document.getElementById('loading');
        
        // Elementos da tela do quiz
        this.quizContainer = document.getElementById('quiz-container');
        this.questionNumberElement = document.getElementById('question-number');
        this.dificuldadeIndicator = document.getElementById('dificuldade-indicator');
        this.questionTextElement = document.getElementById('question-text');
        this.alternativesElement = document.getElementById('alternatives');
        this.feedbackElement = document.getElementById('feedback');
        this.prevButton = document.getElementById('prev-btn');
        this.nextButton = document.getElementById('next-btn');
        this.skipButton = document.getElementById('skip-btn');
        
        // Elementos da barra de progresso
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        
        // Elementos da tela de resultados
        this.resultsContainer = document.getElementById('results-container');
        this.totalAnsweredElement = document.getElementById('total-answered');
        this.totalCorrectElement = document.getElementById('total-correct');
        this.finalPercentageElement = document.getElementById('final-percentage');
        this.restartButton = document.getElementById('restart-btn');
        this.reviewButton = document.getElementById('review-btn');
    }

    /**
     * Carrega todas as questões da API
     */
    async loadAllQuestions() {
        try {
            const response = await fetch('/api/questions');
            const data = await response.json();
            this.allQuestions = data.questions;
        } catch (error) {
            console.error('Erro ao carregar questões:', error);
            this.loadingElement.innerHTML = 'Erro ao carregar questões. Verifique se o servidor está rodando.';
        }
    }

    /**
     * Configura todos os event listeners da aplicação
     */
    setupEventListeners() {
        // Event listeners para a tela de configuração
        this.startButton.addEventListener('click', () => this.startQuiz());
        this.dificuldadeSelect.addEventListener('change', (e) => this.updateMaxQuestions(e.target.value));
        
        // Event listeners para os botões de navegação
        this.nextButton.addEventListener('click', () => this.nextQuestion());
        this.prevButton.addEventListener('click', () => this.prevQuestion());
        this.skipButton.addEventListener('click', () => this.skipQuestion());
        
        // Event listeners para a tela de resultados
        this.restartButton.addEventListener('click', () => this.restartQuiz());
        this.reviewButton.addEventListener('click', () => this.reviewAnswers());
        
        // Navegação por teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' && !this.nextButton.disabled) this.nextQuestion();
            if (e.key === 'ArrowLeft' && !this.prevButton.disabled) this.prevQuestion();
        });
    }

    /**
     * Atualiza o número máximo de questões baseado na dificuldade selecionada
     * @param {string} difficulty - Dificuldade selecionada
     */
    updateMaxQuestions(difficulty) {
        const filtered = this.filterQuestionsByDifficulty(difficulty);
        const maxQuestions = filtered.length;
        
        // Atualiza o input de quantidade
        this.quantidadeInput.max = maxQuestions;
        if (this.quantidadeInput.value > maxQuestions) {
            this.quantidadeInput.value = maxQuestions;
        }
        
        // Atualiza o texto de ajuda
        this.quantidadeInput.nextElementSibling.textContent = `Máximo: ${maxQuestions} questões`;
    }

    /**
     * Filtra questões por dificuldade
     * @param {string} difficulty - Dificuldade para filtrar
     * @returns {Array} - Array de questões filtradas
     */
    filterQuestionsByDifficulty(difficulty) {
        if (difficulty === 'todas') {
            return this.allQuestions;
        }
        return this.allQuestions.filter(q => q.dificuldade === difficulty);
    }

    /**
     * Inicia o quiz com as configurações selecionadas
     */
    startQuiz() {
        // Obtém as configurações do usuário
        this.selectedDifficulty = this.dificuldadeSelect.value;
        this.questionsCount = parseInt(this.quantidadeInput.value);
        
        // Filtra as questões pela dificuldade
        this.filteredQuestions = this.filterQuestionsByDifficulty(this.selectedDifficulty);
        
        // Verifica se há questões suficientes
        if (this.questionsCount > this.filteredQuestions.length) {
            alert(`Não há questões suficientes para a dificuldade selecionada. Máximo disponível: ${this.filteredQuestions.length}`);
            return;
        }
        
        // Seleciona questões aleatórias
        this.currentQuestions = this.getRandomQuestions(this.filteredQuestions, this.questionsCount);
        
        // Reinicia o estado do quiz
        this.currentQuestionIndex = 0;
        this.answeredQuestions.clear();
        this.skippedQuestions.clear();
        this.correctAnswers = 0;
        this.isReviewMode = false; // Garante que não está em modo de revisão
        
        // Mostra a tela de loading e depois inicia o quiz
        this.showLoadingScreen();
        
        // Simula um pequeno delay para carregamento
        setTimeout(() => {
            this.hideAllScreens();
            this.quizContainer.classList.remove('hidden');
            this.showQuestion(0);
            this.updateProgress();
        }, 1000);
    }

    /**
     * Seleciona questões aleatórias do array
     * @param {Array} questions - Array de questões
     * @param {number} count - Quantidade de questões a selecionar
     * @returns {Array} - Array de questões selecionadas
     */
    getRandomQuestions(questions, count) {
        const shuffled = [...questions].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    /**
     * Mostra a tela de loading
     */
    showLoadingScreen() {
        this.hideAllScreens();
        this.loadingElement.classList.remove('hidden');
    }

    /**
     * Esconde todas as telas
     */
    hideAllScreens() {
        this.configContainer.classList.add('hidden');
        this.quizContainer.classList.add('hidden');
        this.resultsContainer.classList.add('hidden');
        this.loadingElement.classList.add('hidden');
    }

    /**
     * Exibe uma questão específica no container
     * @param {number} index - Índice da questão a ser exibida
     */
    showQuestion(index) {
        if (index < 0 || index >= this.currentQuestions.length) return;
        
        this.currentQuestionIndex = index;
        this.selectedAlternative = null;
        this.feedbackElement.classList.add('hidden');
        
        const question = this.currentQuestions[index];
        
        // Atualiza o cabeçalho
        this.questionNumberElement.textContent = `Questão ${index + 1} de ${this.currentQuestions.length}`;
        this.questionTextElement.textContent = question.enunciado;
        
        // Atualiza o indicador de dificuldade
        this.updateDifficultyIndicator(question.dificuldade);
        
        // Renderiza as alternativas e atualiza a navegação
        this.renderAlternatives(question);
        this.updateNavigationButtons();
        this.updateProgress();
    }

    /**
     * Atualiza o indicador visual de dificuldade
     * @param {string} difficulty - Nível de dificuldade
     */
    updateDifficultyIndicator(difficulty) {
        const difficultyNames = {
            'facil': 'Fácil',
            'medio': 'Médio',
            'dificil': 'Difícil'
        };
        
        this.dificuldadeIndicator.textContent = difficultyNames[difficulty];
        this.dificuldadeIndicator.className = 'dificuldade-indicator';
        this.dificuldadeIndicator.classList.add(`dificuldade-${difficulty}`);
    }

    /**
     * Renderiza as alternativas da questão atual
     * @param {Object} question - Objeto da questão com alternativas
     */
    renderAlternatives(question) {
        this.alternativesElement.innerHTML = '';
        
        const isAnswered = this.answeredQuestions.has(this.currentQuestionIndex);
        const userAnswer = this.answeredQuestions.get(this.currentQuestionIndex);
        
        if (isAnswered) {
            this.selectedAlternative = userAnswer.selected;
        }
        
        question.alternativas.forEach((alternative, index) => {
            const alternativeElement = document.createElement('div');
            alternativeElement.className = 'alternative';
            alternativeElement.textContent = alternative;
            
            // No modo de revisão, não permite interação com as alternativas
            if (!this.isReviewMode && !isAnswered) {
                alternativeElement.addEventListener('click', () => this.selectAlternative(index, alternativeElement));
            } else {
                alternativeElement.classList.add('disabled');
            }
            
            // Aplica estilos visuais para questões já respondidas
            if (isAnswered) {
                if (index === question.respostaCorreta) {
                    alternativeElement.classList.add('correct');
                } else if (userAnswer.selected === index && index !== question.respostaCorreta) {
                    alternativeElement.classList.add('incorrect');
                }
            }
            
            // Marca como selecionada se for a resposta do usuário
            if (index === this.selectedAlternative) {
                alternativeElement.classList.add('selected');
            }
            
            this.alternativesElement.appendChild(alternativeElement);
        });
        
        // Mostra feedback se a questão já foi respondida
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
        // Remove seleção anterior
        document.querySelectorAll('.alternative').forEach(alt => {
            alt.classList.remove('selected');
        });
        
        // Marca a alternativa atual como selecionada
        element.classList.add('selected');
        this.selectedAlternative = index;
        
        const question = this.currentQuestions[this.currentQuestionIndex];
        const isCorrect = index === question.respostaCorreta;
        
        // Armazena a resposta do usuário
        this.answeredQuestions.set(this.currentQuestionIndex, {
            selected: index,
            isCorrect: isCorrect
        });
        
        // Atualiza o contador de respostas corretas
        if (isCorrect && !this.answeredQuestions.get(this.currentQuestionIndex).alreadyCounted) {
            this.correctAnswers++;
            this.answeredQuestions.get(this.currentQuestionIndex).alreadyCounted = true;
        }
        
        // Desabilita todas as alternativas após a seleção
        document.querySelectorAll('.alternative').forEach(alt => {
            alt.classList.add('disabled');
            const newAlt = alt.cloneNode(true);
            alt.parentNode.replaceChild(newAlt, alt);
        });
        
        // Mostra feedback e atualiza a interface
        this.checkAnswer(isCorrect, question.explicacao);
        this.updateProgress();
        this.updateNavigationButtons();

        // Verifica se é a última questão respondida (apenas se não estiver no modo de revisão)
        if (!this.isReviewMode && this.answeredQuestions.size === this.currentQuestions.length) {
            setTimeout(() => this.showResults(), 1500);
        }
    }

    /**
     * Exibe o feedback da resposta
     * @param {boolean} isCorrect - Se a resposta está correta
     * @param {string} explanation - Explicação da resposta
     */
    checkAnswer(isCorrect, explanation) {
        this.feedbackElement.classList.remove('hidden');
        this.feedbackElement.textContent = isCorrect ? 
            `✅ Correto! ${explanation}` : 
            `❌ Incorreto. ${explanation}`;
        
        this.feedbackElement.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        
        // Destaca visualmente as alternativas
        const question = this.currentQuestions[this.currentQuestionIndex];
        document.querySelectorAll('.alternative').forEach((alt, index) => {
            if (index === question.respostaCorreta) {
                alt.classList.add('correct');
            } else if (index === this.selectedAlternative && !isCorrect) {
                alt.classList.add('incorrect');
            }
        });
    }

    /**
     * Mostra feedback para questões já respondidas
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
     */
    skipQuestion() {
        // Remove resposta anterior se existir
        if (this.answeredQuestions.has(this.currentQuestionIndex)) {
            const previousAnswer = this.answeredQuestions.get(this.currentQuestionIndex);
            if (previousAnswer.isCorrect && previousAnswer.alreadyCounted) {
                this.correctAnswers--;
            }
            this.answeredQuestions.delete(this.currentQuestionIndex);
        }
        
        this.skippedQuestions.add(this.currentQuestionIndex);
        this.feedbackElement.classList.add('hidden');
        
        // Avança para a próxima questão ou mostra resultados
        if (this.currentQuestionIndex < this.currentQuestions.length - 1) {
            this.showQuestion(this.currentQuestionIndex + 1);
        } else {
            this.showResults();
        }
        
        this.updateProgress();
        this.updateNavigationButtons();
    }

    /**
     * Atualiza a barra de progresso
     */
    updateProgress() {
        const progress = (this.answeredQuestions.size / this.currentQuestions.length) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.progressText.textContent = `${this.answeredQuestions.size}/${this.currentQuestions.length} questões respondidas`;
    }

    /**
     * Avança para a próxima questão
     */
    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuestions.length - 1) {
            this.showQuestion(this.currentQuestionIndex + 1);
        } else if (this.isReviewMode) {
            // No modo de revisão, na última questão, volta para os resultados
            this.showResults();
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
     */
    updateNavigationButtons() {
        const isAnswered = this.answeredQuestions.has(this.currentQuestionIndex);
        const isLastQuestion = this.currentQuestionIndex === this.currentQuestions.length - 1;
        
        this.prevButton.disabled = this.currentQuestionIndex === 0;
        
        // No modo de revisão, o botão "Próxima" sempre está habilitado, exceto na última questão
        if (this.isReviewMode) {
            this.nextButton.disabled = false;
            // Na última questão do modo de revisão, muda o texto do botão
            if (isLastQuestion) {
                this.nextButton.textContent = 'Voltar aos Resultados';
            } else {
                this.nextButton.textContent = 'Próxima';
            }
        } else {
            // No modo normal, comportamento original
            this.nextButton.disabled = isLastQuestion;
            this.nextButton.textContent = 'Próxima';
        }
        
        // No modo de revisão, esconde o botão "Pular"
        if (this.isReviewMode) {
            this.skipButton.style.display = 'none';
        } else {
            this.skipButton.style.display = 'block';
            this.skipButton.disabled = isAnswered || isLastQuestion;
        }
    }

    /**
     * Exibe a tela de resultados finais
     */
    showResults() {
        this.hideAllScreens();
        this.isReviewMode = false; // Sai do modo de revisão
        
        const totalQuestions = this.currentQuestions.length;
        const answeredQuestions = this.answeredQuestions.size;
        const correctAnswers = this.correctAnswers;
        const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        
        // Atualiza as estatísticas finais
        this.totalAnsweredElement.textContent = answeredQuestions;
        this.totalCorrectElement.textContent = correctAnswers;
        this.finalPercentageElement.textContent = `${percentage}%`;
        
        // Mostra a tela de resultados
        this.resultsContainer.classList.remove('hidden');
    }

    /**
     * Reinicia o quiz voltando para a tela de configuração
     */
    restartQuiz() {
        this.isReviewMode = false;
        this.hideAllScreens();
        this.configContainer.classList.remove('hidden');
    }

    /**
     * Permite revisar as respostas (volta para a primeira questão no modo de revisão)
     */
    reviewAnswers() {
        this.isReviewMode = true;
        this.hideAllScreens();
        this.quizContainer.classList.remove('hidden');
        this.showQuestion(0);
        this.updateNavigationButtons();
    }
}

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new BooleanLogicQuiz();
});