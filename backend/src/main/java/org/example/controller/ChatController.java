package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.dto.chatDto.*;
import org.example.dto.userDto.UserDTO;
import org.example.dto.userDto.UserIdDTO;
import org.example.service.ChatService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping(path = "/chat")
public class ChatController {
    private final ChatService chatService;

    @GetMapping
    public List<ChatDTO> index() {
        return chatService.index();
    }

    @GetMapping("/{id}")
    public ChatDTO get(@PathVariable Long id) {
        return chatService.get(id);
    }

    @PostMapping("/create")
    public ChatDTO save(@RequestBody ChatCreateDTO dto) {
        return chatService.save(dto);
    }

    @PutMapping("/add-user/{chatId}")
    public ChatDTO addUser(@PathVariable Long chatId, @RequestBody UserIdDTO userId){
        return chatService.addUser(chatId, userId.getUserId());
    }

    @DeleteMapping("/leave-chat/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ChatDTO leaveChat(@PathVariable Long chatId){
        return chatService.leaveChat(chatId);
    }

    @PutMapping("/{id}")
    public ChatDTO update(@PathVariable Long id, @RequestBody ChatUpdateDTO dto) {
        return chatService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        chatService.delete(id);
    }
}

