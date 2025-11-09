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
        
        // Sistema de Timer (agora apenas para estatísticas finais)
        this.quizStartTime = null;
        this.quizEndTime = null;
        this.questionStartTimes = new Map();
        
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
            
            // Elementos das estatísticas de tempo (APENAS na tela de resultados)
            this.totalTimeElement = document.getElementById('total-time');
            this.averageTimeElement = document.getElementById('average-time');

            console.log('Elementos inicializados com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar elementos:', error);
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

            console.log('Event listeners configurados com sucesso');
        } catch (error) {
            console.error('Erro ao configurar event listeners:', error);
        }
    }

    /**
     * Carrega todas as questões da API
     */
    async loadAllQuestions() {
        try {
            console.log('Carregando questões...');
            const response = await fetch('/api/questions');
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            this.allQuestions = data.questions;
            console.log(`Carregadas ${this.allQuestions.length} questões`);
            
            // Atualiza o máximo de questões disponíveis
            this.updateMaxQuestions(this.dificuldadeSelect.value);
            
        } catch (error) {
            console.error('Erro ao carregar questões:', error);
            this.loadingElement.innerHTML = 'Erro ao carregar questões. Verifique se o servidor está rodando.';
        }
    }

    /**
     * Atualiza o número máximo de questões baseado na dificuldade selecionada
     * @param {string} difficulty - Dificuldade selecionada
     */
    updateMaxQuestions(difficulty) {
        try {
            const filtered = this.filterQuestionsByDifficulty(difficulty);
            const maxQuestions = filtered.length;
            
            // Atualiza o input de quantidade
            this.quantidadeInput.max = maxQuestions;
            if (this.quantidadeInput.value > maxQuestions) {
                this.quantidadeInput.value = maxQuestions;
            }
            
            // Atualiza o texto de ajuda
            const helpText = this.quantidadeInput.nextElementSibling;
            if (helpText) {
                helpText.textContent = `Máximo: ${maxQuestions} questões`;
            }
        } catch (error) {
            console.error('Erro ao atualizar máximo de questões:', error);
        }
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
        try {
            console.log('Iniciando quiz...');
            
            // Obtém as configurações do usuário
            this.selectedDifficulty = this.dificuldadeSelect.value;
            this.questionsCount = parseInt(this.quantidadeInput.value);
            
            console.log(`Configurações: Dificuldade=${this.selectedDifficulty}, Quantidade=${this.questionsCount}`);
            
            // Filtra as questões pela dificuldade
            this.filteredQuestions = this.filterQuestionsByDifficulty(this.selectedDifficulty);
            
            console.log(`Questões filtradas: ${this.filteredQuestions.length}`);
            
            // Verifica se há questões suficientes
            if (this.questionsCount > this.filteredQuestions.length) {
                alert(`Não há questões suficientes para a dificuldade selecionada. Máximo disponível: ${this.filteredQuestions.length}`);
                return;
            }
            
            if (this.filteredQuestions.length === 0) {
                alert('Não há questões disponíveis para a dificuldade selecionada.');
                return;
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
            
            // Inicia o timer do quiz (para estatísticas finais)
            this.quizStartTime = Date.now();
            
            // Mostra a tela de loading
            this.showLoadingScreen();
            
            // Pequeno delay para garantir que a tela de loading é mostrada
            setTimeout(() => {
                try {
                    this.hideAllScreens();
                    this.quizContainer.classList.remove('hidden');
                    this.showQuestion(0);
                    this.updateProgress();
                    console.log('Quiz iniciado com sucesso');
                } catch (error) {
                    console.error('Erro ao mostrar quiz:', error);
                }
            }, 500);
            
        } catch (error) {
            console.error('Erro ao iniciar quiz:', error);
            alert('Erro ao iniciar o quiz. Verifique o console para mais detalhes.');
        }
    }

    /**
     * Seleciona questões aleatórias do array
     * @param {Array} questions - Array de questões
     * @param {number} count - Quantidade de questões a selecionar
     * @returns {Array} - Array de questões selecionadas
     */
    getRandomQuestions(questions, count) {
        // Cria uma cópia do array para não modificar o original
        const shuffled = [...questions];
        
        // Algoritmo Fisher-Yates shuffle
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
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

    /**
     * Exibe uma questão específica no container
     * @param {number} index - Índice da questão a ser exibida
     */
    showQuestion(index) {
        try {
            if (index < 0 || index >= this.currentQuestions.length) {
                console.error('Índice de questão inválido:', index);
                return;
            }
            
            this.currentQuestionIndex = index;
            this.selectedAlternative = null;
            this.feedbackElement.classList.add('hidden');
            
            // Registra o tempo de início da questão atual (para estatísticas)
            this.questionStartTimes.set(index, Date.now());
            
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
            
        } catch (error) {
            console.error('Erro ao mostrar questão:', error);
        }
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
        
        this.dificuldadeIndicator.textContent = difficultyNames[difficulty] || 'Desconhecida';
        this.dificuldadeIndicator.className = 'dificuldade-indicator';
        this.dificuldadeIndicator.classList.add(`dificuldade-${difficulty}`);
    }

    /**
     * Renderiza as alternativas da questão atual
     * @param {Object} question - Objeto da questão com alternativas
     */
    renderAlternatives(question) {
        try {
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
        } catch (error) {
            console.error('Erro ao renderizar alternativas:', error);
        }
    }

    /**
     * Processa a seleção de uma alternativa pelo usuário
     * @param {number} index - Índice da alternativa selecionada
     * @param {HTMLElement} element - Elemento HTML da alternativa
     */
    selectAlternative(index, element) {
        try {
            // Remove seleção anterior
            document.querySelectorAll('.alternative').forEach(alt => {
                alt.classList.remove('selected');
            });
            
            // Marca a alternativa atual como selecionada
            element.classList.add('selected');
            this.selectedAlternative = index;
            
            const question = this.currentQuestions[this.currentQuestionIndex];
            const isCorrect = index === question.respostaCorreta;
            
            // Calcula o tempo gasto na questão atual (para estatísticas)
            const questionStartTime = this.questionStartTimes.get(this.currentQuestionIndex);
            let questionTime = 0;
            
            if (questionStartTime) {
                questionTime = Date.now() - questionStartTime;
                console.log(`Tempo gasto na questão ${this.currentQuestionIndex + 1}: ${questionTime}ms`);
            }
            
            // Armazena a resposta do usuário com o tempo gasto
            this.answeredQuestions.set(this.currentQuestionIndex, {
                selected: index,
                isCorrect: isCorrect,
                timeSpent: questionTime,
                alreadyCounted: false
            });
            
            // Atualiza o contador de respostas corretas
            if (isCorrect) {
                if (!this.answeredQuestions.get(this.currentQuestionIndex).alreadyCounted) {
                    this.correctAnswers++;
                    this.answeredQuestions.get(this.currentQuestionIndex).alreadyCounted = true;
                }
            }
            
            // Desabilita todas as alternativas após a seleção
            document.querySelectorAll('.alternative').forEach(alt => {
                alt.classList.add('disabled');
                // Remove eventos de clique
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
        } catch (error) {
            console.error('Erro ao selecionar alternativa:', error);
        }
    }

    /**
     * Exibe o feedback da resposta
     * @param {boolean} isCorrect - Se a resposta está correta
     * @param {string} explanation - Explicação da resposta
     */
    checkAnswer(isCorrect, explanation) {
        try {
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
        } catch (error) {
            console.error('Erro ao mostrar feedback:', error);
        }
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
            
            // Avança para a próxima questão ou mostra resultados
            if (this.currentQuestionIndex < this.currentQuestions.length - 1) {
                this.showQuestion(this.currentQuestionIndex + 1);
            } else {
                this.showResults();
            }
            
            this.updateProgress();
            this.updateNavigationButtons();
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
            this.progressText.textContent = `${this.answeredQuestions.size}/${this.currentQuestions.length} questões respondidas`;
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
        try {
            const isAnswered = this.answeredQuestions.has(this.currentQuestionIndex);
            const isLastQuestion = this.currentQuestionIndex === this.currentQuestions.length - 1;
            
            this.prevButton.disabled = this.currentQuestionIndex === 0;
            
            // No modo de revisão, o botão "Próxima" sempre está habilitado
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
        } catch (error) {
            console.error('Erro ao atualizar navegação:', error);
        }
    }

    /**
     * Formata o tempo em minutos e segundos
     * @param {number} milliseconds - Tempo em milissegundos
     * @returns {string} - Tempo formatado
     */
    formatTime(milliseconds) {
        // Garante que temos pelo menos 1 segundo para evitar "00:00"
        const adjustedMs = Math.max(milliseconds, 1000);
        const totalSeconds = Math.floor(adjustedMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Calcula o tempo médio por questão CORRIGIDO
     * @returns {number} - Tempo médio em milissegundos
     */
    calculateAverageTime() {
        const answeredCount = this.answeredQuestions.size;
        
        if (answeredCount === 0) return 0;
        
        // Soma o tempo gasto em todas as questões respondidas
        let totalQuestionTime = 0;
        let validAnswers = 0;
        
        this.answeredQuestions.forEach((answer, questionIndex) => {
            if (answer.timeSpent && answer.timeSpent > 0) {
                totalQuestionTime += answer.timeSpent;
                validAnswers++;
                console.log(`Questão ${questionIndex + 1}: ${answer.timeSpent}ms`);
            }
        });
        
        // Se nenhuma questão tem tempo registrado, retorna 0
        if (validAnswers === 0) return 0;
        
        // Calcula a média apenas com questões que têm tempo registrado
        const averageTime = totalQuestionTime / validAnswers;
        
        console.log(`Tempo total das questões: ${totalQuestionTime}ms, Média: ${averageTime}ms para ${validAnswers} questões`);
        
        return averageTime;
    }

    /**
     * Exibe a tela de resultados finais
     */
    showResults() {
        try {
            // Para o timer do quiz (define o tempo final)
            this.quizEndTime = Date.now();
            this.hideAllScreens();
            this.isReviewMode = false;
            
            const totalQuestions = this.currentQuestions.length;
            const answeredQuestions = this.answeredQuestions.size;
            const correctAnswers = this.correctAnswers;
            const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
            
            // Calcula estatísticas de tempo (APENAS exibidas aqui)
            const totalTime = this.quizEndTime - this.quizStartTime;
            const averageTime = this.calculateAverageTime();
            
            // Atualiza as estatísticas finais
            this.totalAnsweredElement.textContent = answeredQuestions;
            this.totalCorrectElement.textContent = correctAnswers;
            this.finalPercentageElement.textContent = `${percentage}%`;
            
            // Atualiza as estatísticas de tempo (APENAS na tela de resultados)
            this.totalTimeElement.textContent = this.formatTime(totalTime);
            this.averageTimeElement.textContent = this.formatTime(averageTime);
            
            // Logs para debug
            console.log('=== ESTATÍSTICAS DE TEMPO ===');
            console.log(`Tempo total: ${totalTime}ms`);
            console.log(`Tempo médio: ${averageTime}ms`);
            console.log(`Questões respondidas: ${answeredQuestions}`);
            console.log(`Tempo total formatado: ${this.formatTime(totalTime)}`);
            console.log(`Tempo médio formatado: ${this.formatTime(averageTime)}`);
            
            // Mostra a tela de resultados
            this.resultsContainer.classList.remove('hidden');
            
            // Limpa notificações de revisão
            if (this.reviewNotice) {
                this.reviewNotice.classList.add('hidden');
            }
            if (this.quizHeader) {
                this.quizHeader.classList.remove('review-mode');
            }
            
            console.log('Resultados exibidos com sucesso');
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
            this.hideAllScreens();
            this.configContainer.classList.remove('hidden');
            
            // Limpa notificações de revisão
            if (this.reviewNotice) {
                this.reviewNotice.classList.add('hidden');
            }
            if (this.quizHeader) {
                this.quizHeader.classList.remove('review-mode');
            }
            
            console.log('Quiz reiniciado');
        } catch (error) {
            console.error('Erro ao reiniciar quiz:', error);
        }
    }

    /**
     * Permite revisar as respostas (volta para a primeira questão no modo de revisão)
     */
    reviewAnswers() {
        try {
            this.isReviewMode = true;
            this.hideAllScreens();
            this.quizContainer.classList.remove('hidden');
            
            // Mostra o aviso de modo de revisão
            if (this.reviewNotice) {
                this.reviewNotice.classList.remove('hidden');
            }
            if (this.quizHeader) {
                this.quizHeader.classList.add('review-mode');
            }
            
            this.showQuestion(0);
            this.updateNavigationButtons();
            
            console.log('Modo de revisão ativado');
        } catch (error) {
            console.error('Erro ao ativar modo de revisão:', error);
        }
    }
}

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, inicializando quiz...');
    try {
        new BooleanLogicQuiz();
        console.log('Quiz inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar quiz:', error);
        alert('Erro ao inicializar o quiz. Verifique o console para mais detalhes.');
    }
});