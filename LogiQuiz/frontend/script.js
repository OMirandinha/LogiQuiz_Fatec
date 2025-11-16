/**
 * Classe principal do Quiz de Lógica Booleana
 * Controla toda a lógica da aplicação, desde a configuração até os resultados
 */
class BooleanLogicQuiz {
    constructor() {
        // Inicialização das propriedades do quiz
        this.allQuestions = [];
        this.filteredQuestions = [];
        this.currentQuestions = [];
        this.currentQuestionIndex = 0;
        this.selectedAlternative = null;
        this.answeredQuestions = new Map();
        this.correctAnswers = 0;
        this.skippedQuestions = new Set();
        this.isReviewMode = false;
        
        // Configurações do usuário
        this.selectedDifficulty = 'todas';
        this.questionsCount = 5;
        
        // Sistema de Timer melhorado
        this.quizStartTime = null;
        this.quizEndTime = null;
        this.questionStartTimes = new Map();
        this.currentQuestionStartTime = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadAllQuestions();
    }

    /**
     * Inicializa todos os elementos da DOM que serão utilizados
     */
    initializeElements() {
        try {
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
            this.reviewNotice = document.getElementById('review-notice');
            this.quizHeader = document.querySelector('.quiz-header');
            
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
            
            // Elementos das estatísticas de tempo
            this.totalTimeElement = document.getElementById('total-time');
            this.averageTimeElement = document.getElementById('average-time');

            console.log('Elementos inicializados com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar elementos:', error);
            this.showError('Erro ao inicializar a aplicação. Recarregue a página.');
        }
    }

    /**
     * Configura todos os event listeners da aplicação
     */
    setupEventListeners() {
        try {
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

            // Event listener para teclado
            document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));

            console.log('Event listeners configurados com sucesso');
        } catch (error) {
            console.error('Erro ao configurar event listeners:', error);
        }
    }

    /**
     * Navegação por teclado
     */
    handleKeyboardNavigation(e) {
        if (this.quizContainer.classList.contains('hidden')) return;

        switch(e.key) {
            case 'ArrowLeft':
                if (!this.prevButton.disabled) this.prevQuestion();
                break;
            case 'ArrowRight':
                if (!this.nextButton.disabled) this.nextQuestion();
                break;
            case ' ':
            case 'Spacebar':
                e.preventDefault();
                if (!this.skipButton.disabled && !this.isReviewMode) this.skipQuestion();
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
                const index = parseInt(e.key) - 1;
                this.selectAlternativeByIndex(index);
                break;
        }
    }

    /**
     * Seleciona alternativa por índice (para navegação por teclado)
     */
    selectAlternativeByIndex(index) {
        if (this.isReviewMode) return;
        
        const alternatives = this.alternativesElement.querySelectorAll('.alternative');
        if (index >= 0 && index < alternatives.length && !alternatives[index].classList.contains('disabled')) {
            this.selectAlternative(index, alternatives[index]);
        }
    }

    /**
     * Carrega todas as questões da API
     */
    async loadAllQuestions() {
        try {
            console.log('Carregando questões...');
            this.showLoading('Carregando questões...');
            
            const response = await fetch('/api/questions');
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.questions || !Array.isArray(data.questions)) {
                throw new Error('Formato de dados inválido');
            }
            
            this.allQuestions = data.questions;
            console.log(`Carregadas ${this.allQuestions.length} questões`);
            
            this.hideLoading();
            this.updateMaxQuestions(this.dificuldadeSelect.value);
            
        } catch (error) {
            console.error('Erro ao carregar questões:', error);
            this.showError('Erro ao carregar questões. Verifique se o servidor está rodando.');
        }
    }

    /**
     * Atualiza o número máximo de questões baseado na dificuldade selecionada
     */
    updateMaxQuestions(difficulty) {
        try {
            const filtered = this.filterQuestionsByDifficulty(difficulty);
            const maxQuestions = filtered.length;
            
            this.quantidadeInput.max = maxQuestions;
            if (this.quantidadeInput.value > maxQuestions || this.quantidadeInput.value < 1) {
                this.quantidadeInput.value = Math.min(Math.max(1, this.quantidadeInput.value), maxQuestions);
            }
            
            const helpText = this.quantidadeInput.nextElementSibling;
            if (helpText) {
                helpText.textContent = `Máximo: ${maxQuestions} questões disponíveis`;
            }
        } catch (error) {
            console.error('Erro ao atualizar máximo de questões:', error);
        }
    }

    /**
     * Filtra questões por dificuldade
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
    async startQuiz() {
        try {
            console.log('Iniciando quiz...');
            
            // Validações iniciais
            if (this.allQuestions.length === 0) {
                throw new Error('Nenhuma questão disponível. Tente recarregar a página.');
            }
            
            this.selectedDifficulty = this.dificuldadeSelect.value;
            this.questionsCount = parseInt(this.quantidadeInput.value);
            
            if (this.questionsCount < 1) {
                throw new Error('Selecione pelo menos 1 questão');
            }
            
            console.log(`Configurações: Dificuldade=${this.selectedDifficulty}, Quantidade=${this.questionsCount}`);
            
            // Filtra as questões
            this.filteredQuestions = this.filterQuestionsByDifficulty(this.selectedDifficulty);
            
            console.log(`Questões filtradas: ${this.filteredQuestions.length}`);
            
            // Verifica se há questões suficientes
            if (this.questionsCount > this.filteredQuestions.length) {
                throw new Error(`Não há questões suficientes. Máximo disponível: ${this.filteredQuestions.length}`);
            }
            
            // Seleciona questões aleatórias
            this.currentQuestions = this.getRandomQuestions(this.filteredQuestions, this.questionsCount);
            
            console.log(`Questões selecionadas: ${this.currentQuestions.length}`);
            
            // Reinicia o estado do quiz
            this.currentQuestionIndex = 0;
            this.answeredQuestions.clear();
            this.skippedQuestions.clear();
            this.correctAnswers = 0;
            this.isReviewMode = false;
            this.questionStartTimes.clear();
            this.currentQuestionStartTime = null;
            
            // Inicia o timer do quiz
            this.quizStartTime = Date.now();
            
            // Mostra o quiz
            this.hideAllScreens();
            this.quizContainer.classList.remove('hidden');
            this.showQuestion(0);
            this.updateProgress();
            
            console.log('Quiz iniciado com sucesso');
            
        } catch (error) {
            console.error('Erro ao iniciar quiz:', error);
            this.showError(error.message);
        }
    }

    /**
     * Seleciona questões aleatórias do array
     */
    getRandomQuestions(questions, count) {
        if (!questions || questions.length === 0) {
            throw new Error('Array de questões vazio');
        }
        
        if (count <= 0 || count > questions.length) {
            throw new Error(`Quantidade inválida: ${count}. Disponível: ${questions.length}`);
        }
        
        const shuffled = [...questions];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        return shuffled.slice(0, count);
    }

    /**
     * Exibe uma questão específica no container
     */
    showQuestion(index) {
        try {
            if (index < 0 || index >= this.currentQuestions.length) {
                throw new Error(`Índice de questão inválido: ${index}`);
            }
            
            // Para o timer da questão anterior se existir
            if (this.currentQuestionStartTime !== null && this.currentQuestionIndex !== index) {
                const elapsedTime = Date.now() - this.currentQuestionStartTime;
                this.recordQuestionTime(this.currentQuestionIndex, elapsedTime);
            }
            
            this.currentQuestionIndex = index;
            this.selectedAlternative = null;
            this.feedbackElement.classList.add('hidden');
            
            // Inicia o timer da nova questão
            this.currentQuestionStartTime = Date.now();
            
            const question = this.currentQuestions[index];
            
            // Atualiza a interface
            this.questionNumberElement.textContent = `Questão ${index + 1} de ${this.currentQuestions.length}`;
            this.questionTextElement.textContent = question.enunciado;
            this.updateDifficultyIndicator(question.dificuldade);
            
            this.renderAlternatives(question);
            this.updateNavigationButtons();
            this.updateProgress();
            
        } catch (error) {
            console.error('Erro ao mostrar questão:', error);
        }
    }

    /**
     * Registra o tempo gasto em uma questão
     */
    recordQuestionTime(questionIndex, elapsedTime) {
        if (this.answeredQuestions.has(questionIndex)) {
            const answer = this.answeredQuestions.get(questionIndex);
            answer.timeSpent = elapsedTime;
            this.answeredQuestions.set(questionIndex, answer);
        }
    }

    /**
     * Atualiza o indicador visual de dificuldade
     */
    updateDifficultyIndicator(difficulty) {
        const difficultyNames = {
            'facil': 'Fácil',
            'medio': 'Médio',
            'dificil': 'Difícil'
        };
        
        this.dificuldadeIndicator.textContent = difficultyNames[difficulty] || 'Desconhecida';
        this.dificuldadeIndicator.className = 'dificuldade-indicator';
        this.dificuldadeIndicator.classList.add(`dificuldade-${difficulty}`);
    }

    /**
     * Renderiza as alternativas da questão atual
     */
    renderAlternatives(question) {
        try {
            this.alternativesElement.innerHTML = '';
            
            const isAnswered = this.answeredQuestions.has(this.currentQuestionIndex);
            const userAnswer = isAnswered ? this.answeredQuestions.get(this.currentQuestionIndex) : null;
            
            if (isAnswered) {
                this.selectedAlternative = userAnswer.selected;
            }
            
            question.alternativas.forEach((alternative, index) => {
                const alternativeElement = document.createElement('div');
                alternativeElement.className = 'alternative';
                alternativeElement.textContent = alternative;
                
                // Adiciona número da alternativa
                const numberSpan = document.createElement('span');
                numberSpan.className = 'alternative-number';
                numberSpan.textContent = `${index + 1}. `;
                alternativeElement.prepend(numberSpan);
                
                if (!this.isReviewMode && !isAnswered) {
                    alternativeElement.addEventListener('click', () => this.selectAlternative(index, alternativeElement));
                    alternativeElement.style.cursor = 'pointer';
                } else {
                    alternativeElement.classList.add('disabled');
                    alternativeElement.style.cursor = 'default';
                }
                
                // Estilos para questões respondidas
                if (isAnswered) {
                    if (index === question.respostaCorreta) {
                        alternativeElement.classList.add('correct');
                    } else if (userAnswer.selected === index && index !== question.respostaCorreta) {
                        alternativeElement.classList.add('incorrect');
                    }
                }
                
                if (index === this.selectedAlternative) {
                    alternativeElement.classList.add('selected');
                }
                
                this.alternativesElement.appendChild(alternativeElement);
            });
            
            if (isAnswered) {
                this.showFeedback(userAnswer.isCorrect, question.explicacao);
            }
        } catch (error) {
            console.error('Erro ao renderizar alternativas:', error);
        }
    }

    /**
     * Processa a seleção de uma alternativa pelo usuário
     */
    selectAlternative(index, element) {
        try {
            // Remove seleção anterior
            document.querySelectorAll('.alternative').forEach(alt => {
                alt.classList.remove('selected');
            });
            
            element.classList.add('selected');
            this.selectedAlternative = index;
            
            const question = this.currentQuestions[this.currentQuestionIndex];
            const isCorrect = index === question.respostaCorreta;
            
            // Calcula o tempo gasto na questão
            const questionTime = this.currentQuestionStartTime ? 
                Date.now() - this.currentQuestionStartTime : 0;
            
            // Verifica se já havia resposta anterior para esta questão
            const hadPreviousAnswer = this.answeredQuestions.has(this.currentQuestionIndex);
            const previousAnswer = hadPreviousAnswer ? 
                this.answeredQuestions.get(this.currentQuestionIndex) : null;
            
            // Se havia resposta correta anterior, decrementa o contador
            if (hadPreviousAnswer && previousAnswer.isCorrect && previousAnswer.alreadyCounted) {
                this.correctAnswers--;
            }
            
            // Armazena a nova resposta
            this.answeredQuestions.set(this.currentQuestionIndex, {
                selected: index,
                isCorrect: isCorrect,
                timeSpent: questionTime,
                alreadyCounted: true
            });
            
            // Atualiza o contador de respostas corretas
            if (isCorrect) {
                this.correctAnswers++;
            }
            
            // Desabilita todas as alternativas
            document.querySelectorAll('.alternative').forEach(alt => {
                alt.classList.add('disabled');
                alt.style.cursor = 'default';
                const newAlt = alt.cloneNode(true);
                alt.parentNode.replaceChild(newAlt, alt);
            });
            
            // Para o timer desta questão
            this.currentQuestionStartTime = null;
            
            this.checkAnswer(isCorrect, question.explicacao);
            this.updateProgress();
            this.updateNavigationButtons();

            // Verifica se todas as questões foram respondidas
            if (!this.isReviewMode && this.answeredQuestions.size === this.currentQuestions.length) {
                setTimeout(() => this.showResults(), 2000);
            }
        } catch (error) {
            console.error('Erro ao selecionar alternativa:', error);
        }
    }

    /**
     * Exibe o feedback da resposta
     */
    checkAnswer(isCorrect, explanation) {
        try {
            this.feedbackElement.classList.remove('hidden');
            this.feedbackElement.innerHTML = isCorrect ? 
                `✅ <strong>Correto!</strong> ${explanation}` : 
                `❌ <strong>Incorreto.</strong> ${explanation}`;
            
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
        } catch (error) {
            console.error('Erro ao mostrar feedback:', error);
        }
    }

    /**
     * Mostra feedback para questões já respondidas
     */
    showFeedback(isCorrect, explanation) {
        this.feedbackElement.classList.remove('hidden');
        this.feedbackElement.innerHTML = isCorrect ? 
            `✅ <strong>Correto!</strong> ${explanation}` : 
            `❌ <strong>Incorreto.</strong> ${explanation}`;
        
        this.feedbackElement.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    }

    /**
     * Permite pular a questão atual
     */
    skipQuestion() {
        try {
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
            
            // Para o timer da questão atual
            if (this.currentQuestionStartTime) {
                this.currentQuestionStartTime = null;
            }
            
            // Avança para a próxima questão
            if (this.currentQuestionIndex < this.currentQuestions.length - 1) {
                this.showQuestion(this.currentQuestionIndex + 1);
            } else {
                this.showResults();
            }
            
        } catch (error) {
            console.error('Erro ao pular questão:', error);
        }
    }

    /**
     * Atualiza a barra de progresso
     */
    updateProgress() {
        try {
            const progress = (this.answeredQuestions.size / this.currentQuestions.length) * 100;
            this.progressFill.style.width = `${progress}%`;
            this.progressText.textContent = `${this.answeredQuestions.size}/${this.currentQuestions.length} respondidas (${this.correctAnswers} corretas)`;
        } catch (error) {
            console.error('Erro ao atualizar progresso:', error);
        }
    }

    /**
     * Avança para a próxima questão
     */
    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuestions.length - 1) {
            this.showQuestion(this.currentQuestionIndex + 1);
        } else if (this.isReviewMode) {
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
        try {
            const isAnswered = this.answeredQuestions.has(this.currentQuestionIndex);
            const isLastQuestion = this.currentQuestionIndex === this.currentQuestions.length - 1;
            
            this.prevButton.disabled = this.currentQuestionIndex === 0;
            
            if (this.isReviewMode) {
                this.nextButton.disabled = false;
                this.nextButton.textContent = isLastQuestion ? 'Voltar aos Resultados' : 'Próxima';
                this.skipButton.style.display = 'none';
            } else {
                this.nextButton.disabled = isLastQuestion;
                this.nextButton.textContent = 'Próxima';
                this.skipButton.style.display = 'block';
                this.skipButton.disabled = isAnswered || isLastQuestion;
            }
        } catch (error) {
            console.error('Erro ao atualizar navegação:', error);
        }
    }

    /**
     * Formata o tempo em minutos e segundos
     */
    formatTime(milliseconds) {
        const adjustedMs = Math.max(milliseconds, 1000);
        const totalSeconds = Math.floor(adjustedMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Calcula o tempo médio por questão
     */
    calculateAverageTime() {
        const answeredCount = this.answeredQuestions.size;
        
        if (answeredCount === 0) return 0;
        
        let totalQuestionTime = 0;
        let validAnswers = 0;
        
        this.answeredQuestions.forEach((answer) => {
            if (answer.timeSpent && answer.timeSpent > 0) {
                totalQuestionTime += answer.timeSpent;
                validAnswers++;
            }
        });
        
        if (validAnswers === 0) return 0;
        
        return totalQuestionTime / validAnswers;
    }

    /**
     * Exibe a tela de resultados finais
     */
    showResults() {
        try {
            // Para todos os timers
            this.quizEndTime = Date.now();
            this.currentQuestionStartTime = null;
            
            this.hideAllScreens();
            this.isReviewMode = false;
            
            const totalQuestions = this.currentQuestions.length;
            const answeredQuestions = this.answeredQuestions.size;
            const correctAnswers = this.correctAnswers;
            const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
            
            // Calcula estatísticas de tempo
            const totalTime = this.quizEndTime - this.quizStartTime;
            const averageTime = this.calculateAverageTime();
            
            // Atualiza a interface
            this.totalAnsweredElement.textContent = answeredQuestions;
            this.totalCorrectElement.textContent = correctAnswers;
            this.finalPercentageElement.textContent = `${percentage}%`;
            this.totalTimeElement.textContent = this.formatTime(totalTime);
            this.averageTimeElement.textContent = this.formatTime(averageTime);
            
            // Logs para debug
            console.log('=== ESTATÍSTICAS FINAIS ===');
            console.log(`Total: ${totalQuestions}, Respondidas: ${answeredQuestions}, Corretas: ${correctAnswers}`);
            console.log(`Tempo total: ${totalTime}ms, Médio: ${averageTime}ms`);
            
            this.resultsContainer.classList.remove('hidden');
            
            // Limpa notificações de revisão
            if (this.reviewNotice) {
                this.reviewNotice.classList.add('hidden');
            }
            if (this.quizHeader) {
                this.quizHeader.classList.remove('review-mode');
            }
            
        } catch (error) {
            console.error('Erro ao mostrar resultados:', error);
        }
    }

    /**
     * Reinicia o quiz voltando para a tela de configuração
     */
    restartQuiz() {
        try {
            this.isReviewMode = false;
            this.currentQuestionStartTime = null;
            this.hideAllScreens();
            this.configContainer.classList.remove('hidden');
            
            if (this.reviewNotice) {
                this.reviewNotice.classList.add('hidden');
            }
            if (this.quizHeader) {
                this.quizHeader.classList.remove('review-mode');
            }
            
        } catch (error) {
            console.error('Erro ao reiniciar quiz:', error);
        }
    }

    /**
     * Permite revisar as respostas
     */
    reviewAnswers() {
        try {
            this.isReviewMode = true;
            this.currentQuestionStartTime = null;
            this.hideAllScreens();
            this.quizContainer.classList.remove('hidden');
            
            if (this.reviewNotice) {
                this.reviewNotice.classList.remove('hidden');
            }
            if (this.quizHeader) {
                this.quizHeader.classList.add('review-mode');
            }
            
            this.showQuestion(0);
            
        } catch (error) {
            console.error('Erro ao ativar modo de revisão:', error);
        }
    }

    /**
     * Mostra tela de loading
     */
    showLoading(message = 'Carregando...') {
        this.hideAllScreens();
        this.loadingElement.classList.remove('hidden');
        this.loadingElement.textContent = message;
    }

    /**
     * Esconde tela de loading
     */
    hideLoading() {
        this.loadingElement.classList.add('hidden');
    }

    /**
     * Mostra mensagem de erro
     */
    showError(message) {
        this.hideAllScreens();
        this.loadingElement.classList.remove('hidden');
        this.loadingElement.innerHTML = `
            <div style="color: #dc2626; text-align: center;">
                <h3>❌ Erro</h3>
                <p>${message}</p>
                <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
                    Recarregar Página
                </button>
            </div>
        `;
    }

    /**
     * Esconde todas as telas
     */
    hideAllScreens() {
        const screens = [
            this.configContainer,
            this.quizContainer,
            this.resultsContainer,
            this.loadingElement
        ];
        
        screens.forEach(screen => {
            if (screen) {
                screen.classList.add('hidden');
            }
        });
    }
}

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, inicializando quiz...');
    try {
        window.booleanQuiz = new BooleanLogicQuiz();
        console.log('Quiz inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar quiz:', error);
        alert('Erro crítico ao inicializar o quiz. Recarregue a página.');
    }
});
