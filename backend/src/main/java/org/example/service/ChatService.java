package org.example.service;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.dto.chatDto.*;
import org.example.entity.Chat;
import org.example.entity.User;
import org.example.exception.ActionNotAllowedException;
import org.example.exception.ResourceNotFoundException;
import org.example.mapper.ChatMapper;
import org.example.repository.ChatRepository;
import org.example.repository.UserRepository;
import org.example.security.userDetails.CustomUserDetails;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ChatService {
    private final ChatRepository repository;
    private final ChatMapper mapper;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ChatDTO> index(){
        Long currentUserId = ((CustomUserDetails)
                SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .user().getId();
        return mapper.map(repository.findAllByUsers_Id(currentUserId));
    }

    @Transactional(readOnly = true)
    //@PreAuthorize("@chatRepository.existsByIdAndUsers_Id(#id, authentication.principal.user.id)")
    public ChatDTO get(Long id){
        Chat chat = repository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Chat with id " + id + " not found!"));
        return mapper.map(chat);
    }

    public ChatDTO save(ChatCreateDTO dto){
        Chat chat = mapper.map(dto);
        if (chat.getUsers() == null) {
            chat.setUsers(new ArrayList<>());
        }

        Long currentUserId = ((CustomUserDetails)
                SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .user().getId();
        var user = userRepository.findById(currentUserId).orElseThrow(() ->
                new ResourceNotFoundException("User with id " + currentUserId + "does`nt exists!"));

        chat.getUsers().add(user);
        user.getChats().add(chat);

        repository.save(chat);
        return mapper.map(chat);
    }

    //@PreAuthorize("@chatRepository.existsByIdAndUsers_Id(#id, authentication.principal.user.id)")
    public ChatDTO update(Long id, ChatUpdateDTO dto){
        Chat chat = repository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Chat with id " + id + " not found!"));
        mapper.update(dto, chat);
        if (dto.getUsers() != null && dto.getUsers().isPresent()) {
            syncChatUsers(chat, dto.getUsers().get());
        }

        repository.save(chat);
        return mapper.map(chat);
    }

    //@PreAuthorize("@chatRepository.existsByIdAndUsers_Id(#chatId, authentication.principal.user.id)")
    public ChatDTO addUser(Long chatId, Long userId){
        Chat chat = repository.findById(chatId).orElseThrow(
                () -> new ResourceNotFoundException("Chat with id " + chatId + " not found!"));

        var user = userRepository.findById(userId).orElseThrow(() ->
                new ResourceNotFoundException("User with id " + userId + "does`nt exists!"));

        if (!isChatContainsUser(chat, user)) {
            chat.getUsers().add(user);
            user.getChats().add(chat);
        }

        repository.save(chat);
        return mapper.map(chat);
    }

    //@PreAuthorize("@chatRepository.existsByIdAndUsers_Id(#chatId, authentication.principal.user.id)")
    public ChatDTO leaveChat(Long chatId){
        Chat chat = repository.findById(chatId).orElseThrow(
                () -> new ResourceNotFoundException("Chat with id " + chatId + " not found!"));

        Long userId = ((CustomUserDetails)
                SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .user().getId();

        var user = userRepository.findById(userId).orElseThrow(() ->
                new ResourceNotFoundException("User with id " + userId + "does`nt exists!"));

        if (!isChatContainsUser(chat, user)){
            throw new ActionNotAllowedException("User with id " + userId + "not in this chat!");
        }

        chat.getUsers().remove(user);
        user.getChats().remove(chat);
        repository.save(chat);
        return mapper.map(chat);
    }

    //@PreAuthorize("@chatRepository.existsByIdAndUsers_Id(#id, authentication.principal.user.id)")
    public void delete(Long id){
        Chat chat = repository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Chat with id " + id + " not found!"));

        for (User user : new ArrayList<>(chat.getUsers())) {
            user.getChats().remove(chat);
        }
        chat.getUsers().clear();
        repository.delete(chat);
    }

    private boolean isChatContainsUser(Chat chat, User user){
        return chat.getUsers().stream().anyMatch(u -> u.getId().equals(user.getId()));
    }

    private void syncChatUsers(Chat chat, List<Long> newUserIds) {
        if (newUserIds == null || newUserIds.isEmpty()) return;
        List<User> newUsers = userRepository.findAllById(newUserIds);

        for (User oldUser : new ArrayList<>(chat.getUsers())) {
            if (!newUsers.contains(oldUser)) {
                oldUser.getChats().remove(chat);
                chat.getUsers().remove(oldUser);
            }
        }

        for (User newUser : newUsers) {
            if (!chat.getUsers().contains(newUser)) {
                chat.getUsers().add(newUser);
                newUser.getChats().add(chat);
            }
        }
    }
}
