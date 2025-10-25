package com.logiquiz;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class LogiQuizApplication {

    public static void main(String[] args) {
        SpringApplication.run(LogiQuizApplication.class, args);
        System.out.println("? LogiQuiz API está rodando!");
    }
}
