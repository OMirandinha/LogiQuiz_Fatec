package repository;

import model.Questao;
import java.util.List;
import java.util.Random;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional
public class QuestaoRepository {
    
    @PersistenceContext
    private EntityManager entityManager;
    
    @Transactional(readOnly = true)
    public List<Questao> findAll() {
        TypedQuery<Questao> query = entityManager.createQuery("SELECT q FROM Questao q", Questao.class);
        return query.getResultList();
    }
    
    @Transactional(readOnly = true)
    public Questao findById(Long id) {
        return entityManager.find(Questao.class, id);
    }
    
    public void save(Questao question) {
        entityManager.persist(question);
    }
    
    public void saveAll(List<Questao> questoes) {
        for (int i = 0; i < questoes.size(); i++) {
            entityManager.persist(questoes.get(i));
            if (i % 50 == 0) {
                entityManager.flush();
                entityManager.clear();
            }
        }
    }
    
    @Transactional(readOnly = true)
    public Questao getRandomQuestion() {
        TypedQuery<Long> countQuery = entityManager.createQuery("SELECT COUNT(q) FROM Questao q", Long.class);
        Long count = countQuery.getSingleResult();
        
        if (count == 0) return null;
        
        int randomIndex = new Random().nextInt(count.intValue());
        
        TypedQuery<Questao> query = entityManager.createQuery("SELECT q FROM Questao q", Questao.class);
        query.setFirstResult(randomIndex);
        query.setMaxResults(1);
        
        List<Questao> result = query.getResultList();
        return result.isEmpty() ? null : result.get(0);
    }
    
    @Transactional(readOnly = true)
    public List<Questao> findByDificuldade(String dificuldade) {
        TypedQuery<Questao> query = entityManager.createQuery(
            "SELECT q FROM Questao q WHERE q.dificuldade = :dificuldade", Questao.class);
        query.setParameter("dificuldade", dificuldade);
        return query.getResultList();
    }
}