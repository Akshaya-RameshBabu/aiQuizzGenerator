package com.AiQuizGenerator.Quiz;

import java.util.concurrent.CompletableFuture;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter;

@CrossOrigin
@RestController
public class AiController {

    private final GwenAiService aiService;

    public AiController(GwenAiService aiService) {
        this.aiService = aiService;
    }

    private String buildQuestionPrompt(String topics, Long count) {
        return String.format("""
                You are not a chatbot or an assistant.
                You are an AI that strictly generates multiple-choice quiz questions.

                Your task:
                  - Generate exactly %d multiple-choice questions in total (not per topic).
                  - The questions should be based collectively on ALL the topics provided below.
                  - Distribute the questions fairly across the topics.
                  - Do NOT exceed or go below %d questions in total.

                Output rules:
                  - Return ONLY valid JSON (no markdown, no text before or after).
                  - Format:
                    [
                      {
                        "questionText": "...",
                        "options": ["Option A", "Option B", "Option C", "Option D"],
                        "answer": "Correct option text (must match one from options)"
                      }
                    ]

                Topics to base the questions on:
                %s
                """, count, count, topics);
    }
    @GetMapping(value = "/ai/generateByTopic", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseBodyEmitter generateByTopic(@RequestParam String topics,
                                                @RequestParam Long noOfQuestion) {
    	   // Increase timeout to 5 minutes (default = 30s)
        ResponseBodyEmitter emitter = new ResponseBodyEmitter(5 * 60 * 1000L);

        String prompt = buildQuestionPrompt(topics, noOfQuestion);

        CompletableFuture.runAsync(() -> {
            try {
                aiService.callaiPlugin(emitter, prompt);
            } catch (Exception e) {
                try {
                    emitter.send("data: Error occurred while generating quiz\n\n");
                } catch (Exception ignored) {}
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

}
