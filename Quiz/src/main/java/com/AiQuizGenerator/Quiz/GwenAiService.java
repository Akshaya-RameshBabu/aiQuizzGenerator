package com.AiQuizGenerator.Quiz;

import java.lang.reflect.Method;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter;

@Service
public class GwenAiService {

	@Value("${ai.plugin.jar.path:plugins/qwen-integration.jar}")
	private String pluginPath;
	@Value("${openrouter.api.key}")
	private String openRouterApiKey;
	
    @Async
	public void callaiPlugin( ResponseBodyEmitter emitter, String prompt) {
		try {
			Object plugin = PluginLoader.loadAiService(pluginPath);

			if (plugin != null) {
				Method method = plugin.getClass().getMethod("callQwenAIAndStreamResponse", String.class,
						ResponseBodyEmitter.class, String.class);
				method.invoke(plugin, prompt, emitter, openRouterApiKey);
			} else {
				emitter.send("AI Plugin not available.");
				emitter.complete();
			}
		} catch (Exception e) {
			try {
				emitter.send("Error while invoking AI Plugin.. Try updating new key");
			} catch (Exception ignored) {
			}
			emitter.completeWithError(e);
		}
	}

	
}
