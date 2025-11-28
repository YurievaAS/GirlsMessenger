package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.service.MessageService;
import org.example.dto.messageDto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;

    @GetMapping("/chat/{chatId}")
    public List<MessageDTO> getMessagesByChat(@PathVariable Long chatId) {
        return messageService.getMessagesByChat(chatId);
    }

    @GetMapping("/{id}")
    public MessageDTO getById(@PathVariable Long id) {
        return messageService.getById(id);
    }

    @PostMapping
    public MessageDTO create(@RequestBody MessageCreateDTO dto) {
        return messageService.create(dto);
    }

    @PutMapping("/update/{id}")
    public MessageDTO update(@PathVariable Long id, @RequestBody MessageUpdateDTO dto) {
        return messageService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        messageService.delete(id);
    }
}

