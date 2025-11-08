const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do frontend (quando em produção)
app.use(express.static(path.join(__dirname, '../frontend')));

// Carregar questões do JSON
const loadQuestions = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'questions.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao carregar questões:', error);
    return { questions: [] };
  }
};

// Rotas da API
app.get('/api/questions', (req, res) => {
  const questionsData = loadQuestions();
  res.json(questionsData);
});

app.get('/api/questions/random', (req, res) => {
  const questionsData = loadQuestions();
  const randomIndex = Math.floor(Math.random() * questionsData.questions.length);
  const randomQuestion = questionsData.questions[randomIndex];
  res.json(randomQuestion);
});

app.get('/api/questions/:id', (req, res) => {
  const questionsData = loadQuestions();
  const question = questionsData.questions.find(q => q.id === parseInt(req.params.id));
  
  if (!question) {
    return res.status(404).json({ error: 'Questão não encontrada' });
  }
  
  res.json(question);
});

// Rota para servir o frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});