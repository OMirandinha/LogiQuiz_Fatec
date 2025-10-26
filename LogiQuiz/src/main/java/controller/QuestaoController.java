package controller;

import model.Questao;
import service.QuestaoService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/questoes")
public class QuestaoController {
    
    @Autowired
    private QuestaoService questaoService; // Corrigido o nome do campo
    
    @GetMapping
    public List<Questao> getAllQuestions() {
        return questaoService.getAllQuestions(); // Corrigida a referência
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Questao> getQuestionById(@PathVariable Long id) {
        Questao question = questaoService.getQuestionById(id); // Corrigida a referência
        if (question != null) {
            return ResponseEntity.ok(question);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/random")
    public ResponseEntity<Questao> getRandomQuestion() { // Corrigido o tipo de retorno
        Questao question = questaoService.getRandomQuestion(); // Corrigido o tipo e referência
        if (question != null) {
            return ResponseEntity.ok(question);
        } else {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
    }
    
    @GetMapping("/dificuldade/{nivel}")
    public List<Questao> getQuestionsByDifficulty(@PathVariable String nivel) { // Corrigido o tipo de retorno
        return questaoService.getQuestionsByDifficulty(nivel.toUpperCase()); // Corrigida a referência
    }
    
    @GetMapping("/contagem")
    public ResponseEntity<String> getQuestionCount() {
        List<Questao> questions = questaoService.getAllQuestions(); // Corrigido o tipo e referência
        return ResponseEntity.ok("LogiQuiz possui " + questions.size() + " questões disponíveis!");
    }
}