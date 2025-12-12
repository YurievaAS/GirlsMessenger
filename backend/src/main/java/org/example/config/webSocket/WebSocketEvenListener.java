package org.example.config.webSocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.dto.messageDto.MessageCreateDTO;
import org.example.service.UserService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
@Slf4j //logging when users join or leave chat
public class WebSocketEvenListener {
    private final SimpMessageSendingOperations messageTemplate;
    private final UserService userService;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        log.info("New WebSocket connection, sessionId: {}", headerAccessor.getSessionId());
    }

    @EventListener
    public void handleWebSocketDisconnectListener(
            SessionDisconnectEvent event
    ){
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Long userId = (Long) headerAccessor.getSessionAttributes().get("user");
        Long chatId = (Long) headerAccessor.getSessionAttributes().get("chat");
        if (userId != null && chatId != null){
            log.info("User disconnected : {}", userId);

            String username = userService.get(userId).getUsername();
            var message = MessageCreateDTO.builder()
                    .sender(userId)
                    .chat(chatId)
                    .text(username + " has left the chat");

            String destination = "/topic/chat." + chatId;
            messageTemplate.convertAndSend(destination, message);
        }
    }
}
