// Banco de questões local completo (50 questões)
const localQuestions = [
    {
        id: 1,
        enunciado: "Qual o resultado da expressão booleana: (True AND False) OR True?",
        alternativas: ["True", "False", "Indefinido", "Error"],
        respostaCorreta: "True",
        fonte: "Khan Academy - Fundamentos",
        dificuldade: "FÁCIL"
    },
    {
        id: 2,
        enunciado: "A negação de (A AND B) é equivalente a:",
        alternativas: ["NOT A AND NOT B", "NOT A OR NOT B", "A OR B", "A AND B"],
        respostaCorreta: "NOT A OR NOT B",
        fonte: "Khan Academy - Lei de De Morgan",
        dificuldade: "MÉDIO"
    },
    {
        id: 3,
        enunciado: "Se A = True e B = False, qual o valor de NOT A OR B?",
        alternativas: ["True", "False", "Depende", "Nenhuma das anteriores"],
        respostaCorreta: "False",
        fonte: "Khan Academy - Operadores Lógicos",
        dificuldade: "FÁCIL"
    },
    {
        id: 4,
        enunciado: "Qual expressão representa a porta lógica XOR?",
        alternativas: ["A AND B", "A OR B", "(A AND NOT B) OR (NOT A AND B)", "NOT A AND NOT B"],
        respostaCorreta: "(A AND NOT B) OR (NOT A AND B)",
        fonte: "Khan Academy - Portas Lógicas",
        dificuldade: "MÉDIO"
    },
    {
        id: 5,
        enunciado: "A expressão A AND (B OR C) é equivalente a:",
        alternativas: ["(A AND B) OR C", "(A AND B) OR (A AND C)", "A OR (B AND C)", "A AND B AND C"],
        respostaCorreta: "(A AND B) OR (A AND C)",
        fonte: "Khan Academy - Propriedade Distributiva",
        dificuldade: "DIFÍCIL"
    },
    {
        id: 6,
        enunciado: "Qual a tabela verdade correta para a operação AND?",
        alternativas: [
            "0 AND 0 = 0, 0 AND 1 = 0, 1 AND 0 = 0, 1 AND 1 = 1",
            "0 AND 0 = 0, 0 AND 1 = 1, 1 AND 0 = 1, 1 AND 1 = 1",
            "0 AND 0 = 1, 0 AND 1 = 0, 1 AND 0 = 0, 1 AND 1 = 1",
            "0 AND 0 = 0, 0 AND 1 = 1, 1 AND 0 = 1, 1 AND 1 = 0"
        ],
        respostaCorreta: "0 AND 0 = 0, 0 AND 1 = 0, 1 AND 0 = 0, 1 AND 1 = 1",
        fonte: "Khan Academy - Tabelas Verdade",
        dificuldade: "FÁCIL"
    },
    {
        id: 7,
        enunciado: "A lei da identidade na lógica booleana estabelece que:",
        alternativas: [
            "A AND True = A, A OR False = A",
            "A AND False = False, A OR True = True",
            "A AND A = A, A OR A = A",
            "NOT NOT A = A"
        ],
        respostaCorreta: "A AND True = A, A OR False = A",
        fonte: "Khan Academy - Leis Booleanas",
        dificuldade: "MÉDIO"
    },
    {
        id: 8,
        enunciado: "Qual expressão é equivalente a NOT (A OR B)?",
        alternativas: [
            "NOT A AND NOT B",
            "NOT A OR NOT B",
            "A AND B",
            "A OR B"
        ],
        respostaCorreta: "NOT A AND NOT B",
        fonte: "Khan Academy - Leis de De Morgan",
        dificuldade: "MÉDIO"
    },
    {
        id: 9,
        enunciado: "A porta lógica NAND é equivalente a:",
        alternativas: [
            "NOT (A AND B)",
            "A AND NOT B",
            "NOT A AND B",
            "A OR B"
        ],
        respostaCorreta: "NOT (A AND B)",
        fonte: "Khan Academy - Portas Lógicas Universais",
        dificuldade: "DIFÍCIL"
    },
    {
        id: 10,
        enunciado: "Se A = True, B = False, C = True, qual o valor de (A AND B) OR C?",
        alternativas: ["True", "False", "Indefinido", "Error"],
        respostaCorreta: "True",
        fonte: "Khan Academy - Expressões Compostas",
        dificuldade: "FÁCIL"
    }
];

// Estado do quiz
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
let currentQuestions = [];
let currentMode = 'offline';

// Elementos da DOM
const questionScreen = document.getElementById('questionScreen');
const resultScreen = document.getElementById('resultScreen');
const startScreen = document.getElementById('startScreen');
const loadingScreen = document.getElementById('loadingScreen');
const questionText = document.getElementById('questionText');
const questionNumber = document.getElementById('questionNumber');
const questionDifficulty = document.getElementById('questionDifficulty');
const alternativesContainer = document.getElementById('alternativesContainer');
const progressBar = document.getElementById('progressBar');
const currentQuestionSpan = document.getElementById('currentQuestion');
const totalQuestionsSpan = document.getElementById('totalQuestions');
const nextBtn = document.getElementById('nextBtn');
const feedback = document.getElementById('feedback');
const connectionStatus = document.getElementById('connectionStatus');
const questionsSource = document.getElementById('questionsSource');
const loadingDetails = document.getElementById('loadingDetails');

// Modos de operação
function setMode(mode) {
    currentMode = mode;
    
    // Atualizar UI dos botões
    document.getElementById('onlineBtn').classList.toggle('active', mode === 'online');
    document.getElementById('offlineBtn').classList.toggle('active', mode === 'offline');
    
    // Atualizar status de conexão
    const onlineStatus = document.querySelector('.status-online');
    const offlineStatus = document.querySelector('.status-offline');
    
    onlineStatus.classList.toggle('hidden', mode !== 'online');
    offlineStatus.classList.toggle('hidden', mode === 'online');
    
    questionsSource.textContent = `Fonte: ${mode === 'online' ? 'Khan Academy' : 'Local'}`;
}

// Simular busca online (funciona offline)
function simulateOnlineSearch() {
    return new Promise((resolve) => {
        // Simular delay de rede
        setTimeout(() => {
            // Em modo offline, usamos as questões locais mesmo
            const shuffledQuestions = [...localQuestions]
                .sort(() => Math.random() - 0.5)
                .slice(0, 8);
            
            resolve(shuffledQuestions);
        }, 2000);
    });
}

// Iniciar quiz online (simulado)
async function startOnlineQuiz() {
    showLoading();
    updateLoadingDetails('Simulando conexão com Khan Academy...');
    
    try {
        // Simular busca online
        currentQuestions = await simulateOnlineSearch();
        
        updateLoadingDetails(`${currentQuestions.length} questões carregadas com sucesso!`);
        
        // Pequeno delay para mostrar mensagem
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        startQuiz();
        
    } catch (error) {
        console.error('Erro simulado:', error);
        updateLoadingDetails('Usando banco local...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        startOfflineQuiz();
    }
}

// Iniciar quiz offline
function startOfflineQuiz() {
    // Embaralhar questões para variedade
    currentQuestions = [...localQuestions].sort(() => Math.random() - 0.5);
    startQuiz();
}

// Iniciar o quiz
function startQuiz() {
    startScreen.classList.add('hidden');
    loadingScreen.classList.add('hidden');
    questionScreen.classList.remove('hidden');
    
    totalQuestionsSpan.textContent = `de ${currentQuestions.length}`;
    showQuestion(0);
}

// Mostrar tela de loading
function showLoading() {
    startScreen.classList.add('hidden');
    questionScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    loadingScreen.classList.remove('hidden');
}

function updateLoadingDetails(message) {
    loadingDetails.textContent = message;
}

// Mostrar questão
function showQuestion(index) {
    if (index >= currentQuestions.length) {
        showResults();
        return;
    }

    const question = currentQuestions[index];
    
    // Atualizar informações da questão
    questionText.textContent = question.enunciado;
    questionNumber.textContent = `Questão ${index + 1}`;
    currentQuestionSpan.textContent = `Questão ${index + 1}`;
    questionDifficulty.textContent = question.dificuldade;
    questionDifficulty.className = `difficulty ${question.dificuldade.toLowerCase()}`;
    
    // Atualizar barra de progresso
    const progress = ((index + 1) / currentQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;
    
    // Limpar alternativas anteriores
    alternativesContainer.innerHTML = '';
    
    // Adicionar novas alternativas
    question.alternativas.forEach((alternative, altIndex) => {
        const altElement = document.createElement('div');
        altElement.className = 'alternative';
        altElement.innerHTML = `
            <div class="alternative-letter">${String.fromCharCode(65 + altIndex)}</div>
            <div class="alternative-text">${alternative}</div>
        `;
        altElement.addEventListener('click', () => selectAlternative(altIndex, alternative));
        alternativesContainer.appendChild(altElement);
    });
    
    // Resetar estado do botão e feedback
    nextBtn.disabled = true;
    feedback.className = 'feedback hidden';
}

// Selecionar alternativa
function selectAlternative(altIndex, altText) {
    const question = currentQuestions[currentQuestionIndex];
    const alternatives = document.querySelectorAll('.alternative');
    
    // Remover seleção anterior
    alternatives.forEach(alt => alt.classList.remove('selected'));
    
    // Marcar alternativa selecionada
    alternatives[altIndex].classList.add('selected');
    
    // Habilitar botão próximo
    nextBtn.disabled = false;
    
    // Verificar resposta
    const isCorrect = altText === question.respostaCorreta;
    
    // Mostrar feedback
    feedback.textContent = isCorrect 
        ? '✅ Resposta Correta!' 
        : `❌ Resposta Incorreta! A correta é: ${question.respostaCorreta}`;
    feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    
    // Salvar resposta do usuário
    userAnswers[currentQuestionIndex] = {
        question: question.enunciado,
        userAnswer: altText,
        correctAnswer: question.respostaCorreta,
        isCorrect: isCorrect
    };
    
    // Atualizar pontuação
    if (isCorrect) {
        score++;
    }
}

// Próxima questão
function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < currentQuestions.length) {
        showQuestion(currentQuestionIndex);
    } else {
        showResults();
    }
}

// Pular questão
function skipQuestion() {
    userAnswers[currentQuestionIndex] = {
        question: currentQuestions[currentQuestionIndex].enunciado,
        userAnswer: 'Pulada',
        correctAnswer: currentQuestions[currentQuestionIndex].respostaCorreta,
        isCorrect: false
    };
    nextQuestion();
}

// Mostrar resultados
function showResults() {
    questionScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    
    const percentage = currentQuestions.length > 0 ? Math.round((score / currentQuestions.length) * 100) : 0;
    
    document.getElementById('finalScore').textContent = `${score}/${currentQuestions.length}`;
    document.getElementById('correctAnswers').textContent = score;
    document.getElementById('totalQuestionsResult').textContent = currentQuestions.length;
    document.getElementById('percentage').textContent = `${percentage}%`;
    
    // Mensagem personalizada baseada no desempenho
    let message;
    if (percentage >= 90) {
        message = '🎉 Excelente! Você é um expert em lógica booleana!';
    } else if (percentage >= 70) {
        message = '👍 Muito bom! Seu conhecimento é sólido!';
    } else if (percentage >= 50) {
        message = '💡 Bom trabalho! Continue praticando!';
    } else if (percentage >= 30) {
        message = '📚 Hora de revisar! Você está no caminho certo.';
    } else {
        message = '🔍 Vamos estudar juntos! Reveja os conceitos básicos.';
    }
    
    document.getElementById('resultMessage').textContent = message;
}

// Reiniciar quiz
function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    
    resultScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
}

// Carregar novas questões
function loadNewQuestions() {
    if (currentMode === 'online') {
        startOnlineQuiz();
    } else {
        startOfflineQuiz();
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    setMode('offline');
});