// Dados das questões
const questions = [
    {
        id: 1,
        enunciado: "Qual o resultado da expressão booleana: (True AND False) OR True?",
        alternativas: ["True", "False", "Indefinido", "Error"],
        respostaCorreta: "True",
        fonte: "LogiQuiz",
        dificuldade: "FÁCIL"
    },
    {
        id: 2,
        enunciado: "A negação de (A AND B) é equivalente a:",
        alternativas: ["NOT A AND NOT B", "NOT A OR NOT B", "A OR B", "A AND B"],
        respostaCorreta: "NOT A OR NOT B",
        fonte: "LogiQuiz - Lei de De Morgan",
        dificuldade: "MÉDIO"
    },
    {
        id: 3,
        enunciado: "Se A = True e B = False, qual o valor de NOT A OR B?",
        alternativas: ["True", "False", "Depende", "Nenhuma das anteriores"],
        respostaCorreta: "False",
        fonte: "LogiQuiz",
        dificuldade: "FÁCIL"
    },
    {
        id: 4,
        enunciado: "Qual expressão representa a porta lógica XOR?",
        alternativas: ["A AND B", "A OR B", "(A AND NOT B) OR (NOT A AND B)", "NOT A AND NOT B"],
        respostaCorreta: "(A AND NOT B) OR (NOT A AND B)",
        fonte: "LogiQuiz - Portas Lógicas",
        dificuldade: "MÉDIO"
    },
    {
        id: 5,
        enunciado: "A expressão A AND (B OR C) é equivalente a:",
        alternativas: ["(A AND B) OR C", "(A AND B) OR (A AND C)", "A OR (B AND C)", "A AND B AND C"],
        respostaCorreta: "(A AND B) OR (A AND C)",
        fonte: "LogiQuiz - Propriedade Distributiva",
        dificuldade: "DIFÍCIL"
    }
];

// Estado do quiz
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];

// Elementos da DOM
const questionScreen = document.getElementById('questionScreen');
const resultScreen = document.getElementById('resultScreen');
const questionText = document.getElementById('questionText');
const questionNumber = document.getElementById('questionNumber');
const questionDifficulty = document.getElementById('questionDifficulty');
const alternativesContainer = document.getElementById('alternativesContainer');
const progressBar = document.getElementById('progressBar');
const currentQuestionSpan = document.getElementById('currentQuestion');
const totalQuestionsSpan = document.getElementById('totalQuestions');
const nextBtn = document.getElementById('nextBtn');
const feedback = document.getElementById('feedback');

// Inicializar quiz
function initQuiz() {
    totalQuestionsSpan.textContent = `de ${questions.length}`;
    showQuestion(0);
}

// Mostrar questão
function showQuestion(index) {
    const question = questions[index];
    
    // Atualizar informações da questão
    questionText.textContent = question.enunciado;
    questionNumber.textContent = `Questão ${index + 1}`;
    currentQuestionSpan.textContent = `Questão ${index + 1}`;
    questionDifficulty.textContent = question.dificuldade;
    questionDifficulty.className = `difficulty ${question.dificuldade.toLowerCase()}`;
    
    // Atualizar barra de progresso
    const progress = ((index + 1) / questions.length) * 100;
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
    const question = questions[currentQuestionIndex];
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
    
    if (currentQuestionIndex < questions.length) {
        showQuestion(currentQuestionIndex);
    } else {
        showResults();
    }
}

// Mostrar resultados
function showResults() {
    questionScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    
    const percentage = Math.round((score / questions.length) * 100);
    
    document.getElementById('finalScore').textContent = `${score}/${questions.length}`;
    document.getElementById('correctAnswers').textContent = score;
    document.getElementById('totalQuestionsResult').textContent = questions.length;
    document.getElementById('percentage').textContent = `${percentage}%`;
    
    // Mensagem personalizada baseada no desempenho
    let message;
    if (percentage >= 80) {
        message = '🎉 Excelente! Você domina a lógica booleana!';
    } else if (percentage >= 60) {
        message = '👍 Bom trabalho! Continue praticando!';
    } else if (percentage >= 40) {
        message = '💡 Não desanime! Revise os conceitos e tente novamente.';
    } else {
        message = '📚 Hora de estudar! Reveja os fundamentos da lógica booleana.';
    }
    
    document.getElementById('resultMessage').textContent = message;
}

// Reiniciar quiz
function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    
    resultScreen.classList.add('hidden');
    questionScreen.classList.remove('hidden');
    
    showQuestion(0);
}

// Iniciar o quiz quando a página carregar
document.addEventListener('DOMContentLoaded', initQuiz);