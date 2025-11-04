package com.AiQuizGenerator.Quiz;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
@EnableAsync
public class QuizApplication {

	public static void main(String[] args) {
		 Dotenv dotenv = Dotenv.load();
	        dotenv.entries().forEach(e -> System.setProperty(e.getKey(), e.getValue()));
		SpringApplication.run(QuizApplication.class, args);
	}

}
