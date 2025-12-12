package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.dto.messageDto.MessageCreateDTO;
import org.example.dto.messageDto.MessageDTO;
import org.example.service.MessageService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;


@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {
    MessageService messageService;
    private final SimpMessageSendingOperations messageTemplate;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload MessageCreateDTO dto){
        var message =  messageService.create(dto);
        String destination = "/topic/chat." + dto.getChat();
        messageTemplate.convertAndSend(destination, message);
    }

    @MessageMapping("/chat.addUser")
    public void addUser(@Payload MessageCreateDTO dto, SimpMessageHeaderAccessor headerAccessor){
        //add username to websocket session
        headerAccessor.getSessionAttributes().put("user", dto.getSender());
        headerAccessor.getSessionAttributes().put("chat", dto.getChat());

        var message = messageService.create(dto);
        String destination = "/topic/chat." + dto.getChat();
        messageTemplate.convertAndSend(destination, message);
    }
}
