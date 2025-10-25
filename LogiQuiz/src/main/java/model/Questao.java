package model;

import java.util.List;
import javax.persistence.*;
import java.util.ArrayList;

@Entity
@Table(name = "questoes")
public class Questao {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(length = 1000)
    private String enunciado;
    
    @ElementCollection
    @CollectionTable(name = "questao_alternativas")
    private List<String> alternativas;
    
    private String respostaCorreta;
    private String fonte;
    private String urlFonte;
    private String dificuldade; // FÁCIL, MÉDIO, DIFÍCIL
    
    public Questao() {
        this.alternativas = new ArrayList<>();
    }
    
    public Questao(String enunciado, List<String> alternativas, String respostaCorreta, String fonte, String dificuldade) {
        this();
        this.enunciado = enunciado;
        this.alternativas = alternativas;
        this.respostaCorreta = respostaCorreta;
        this.fonte = fonte;
        this.dificuldade = dificuldade;
    }
    
    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getEnunciado() { return enunciado; }
    public void setEnunciado(String enunciado) { this.enunciado = enunciado; }
    
    public List<String> getAlternativas() { return alternativas; }
    public void setAlternativas(List<String> alternativas) { this.alternativas = alternativas; }
    
    public String getRespostaCorreta() { return respostaCorreta; }
    public void setRespostaCorreta(String respostaCorreta) { this.respostaCorreta = respostaCorreta; }
    
    public String getFonte() { return fonte; }
    public void setFonte(String fonte) { this.fonte = fonte; }
    
    public String getUrlFonte() { return urlFonte; }
    public void setUrlFonte(String urlFonte) { this.urlFonte = urlFonte; }
    
    public String getDificuldade() { return dificuldade; }
    public void setDificuldade(String dificuldade) { this.dificuldade = dificuldade; }
    
    @Override
    public String toString() {
        return "Questao{" +
                "id=" + id +
                ", enunciado='" + enunciado + '\'' +
                ", alternativas=" + alternativas +
                ", respostaCorreta='" + respostaCorreta + '\'' +
                ", fonte='" + fonte + '\'' +
                ", dificuldade='" + dificuldade + '\'' +
                '}';
    }
}