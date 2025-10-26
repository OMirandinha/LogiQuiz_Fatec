package service;

import model.Questao;
import repository.QuestaoRepository;
import java.util.Arrays;
import java.util.List;
import javax.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class QuestaoService {
    
    @Autowired
    private QuestaoRepository questionRepository;
    
    @PostConstruct
    public void init() {
        carregarQuestoesLogiQuiz();
    }
    
    private void carregarQuestoesLogiQuiz() {
        if (questionRepository.findAll().isEmpty()) {
            List<Questao> questões = Arrays.asList(
                new Questao(
                    "Qual o resultado da expressão booleana: (True AND False) OR True?",
                    Arrays.asList("True", "False", "Indefinido", "Error"),
                    "True",
                    "LogiQuiz",
                    "FÁCIL"
                ),
                new Questao(
                    "A negação de (A AND B) é equivalente a:",
                    Arrays.asList("NOT A AND NOT B", "NOT A OR NOT B", "A OR B", "A AND B"),
                    "NOT A OR NOT B",
                    "LogiQuiz - Lei de De Morgan",
                    "MÉDIO"
                ),
                new Questao(
                    "Se A = True e B = False, qual o valor de NOT A OR B?",
                    Arrays.asList("True", "False", "Depende", "Nenhuma das anteriores"),
                    "False",
                    "LogiQuiz",
                    "FÁCIL"
                ),
                new Questao(
                    "Qual expressão representa a porta lógica XOR?",
                    Arrays.asList("A AND B", "A OR B", "(A AND NOT B) OR (NOT A AND B)", "NOT A AND NOT B"),
                    "(A AND NOT B) OR (NOT A AND B)",
                    "LogiQuiz - Portas Lógicas",
                    "MÉDIO"
                ),
                new Questao(
                    "A expressão A AND (B OR C) é equivalente a:",
                    Arrays.asList("(A AND B) OR C", "(A AND B) OR (A AND C)", "A OR (B AND C)", "A AND B AND C"),
                    "(A AND B) OR (A AND C)",
                    "LogiQuiz - Propriedade Distributiva",
                    "DIFÍCIL"
                ),
                new Questao(
                    "Qual o valor da expressão: NOT (True OR False) AND True?",
                    Arrays.asList("True", "False", "Undefined", "Null"),
                    "False",
                    "LogiQuiz",
                    "FÁCIL"
                ),
                new Questao(
                    "A tabela verdade de A NAND B tem resultado False quando:",
                    Arrays.asList("A=False, B=False", "A=True, B=True", "A=True, B=False", "A=False, B=True"),
                    "A=True, B=True",
                    "LogiQuiz - Porta NAND",
                    "MÉDIO"
                )
            );
            
            questionRepository.saveAll(questões);
        }
    }
    
    public List<Questao> getAllQuestions() {
        return questionRepository.findAll();
    }
    
    public Questao getQuestionById(Long id) {
        return questionRepository.findById(id);
    }
    
    public Questao getRandomQuestion() {
        return questionRepository.getRandomQuestion();
    }
    
    public List<Questao> getQuestionsByDifficulty(String dificuldade) {
        return questionRepository.findByDificuldade(dificuldade);
    }
}