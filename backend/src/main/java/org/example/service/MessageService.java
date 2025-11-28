package org.example.service;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.dto.messageDto.*;
import org.example.exception.*;

import org.example.entity.Message;
import org.example.entity.User;

import org.example.mapper.MessageMapper;
import org.example.repository.ChatRepository;
import org.example.repository.MessageRepository;
import org.example.repository.UserRepository;

import org.example.security.userDetails.CustomUserDetails;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final ChatRepository chatRepository;
    private final UserRepository userRepository;
    private final MessageMapper messageMapper;

    public MessageDTO create(MessageCreateDTO messageCreateDTO){

        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();

        var user = userRepository.findById(userDetails.user().getId()).orElseThrow(()
                -> new ResourceNotFoundException(
                "User with username " +  userDetails.user().getUsername() + " does`nt exists!"));

        var chat = chatRepository.findById(messageCreateDTO.getChat()).orElseThrow(()
                -> new ResourceNotFoundException(
                "Chat with id " + messageCreateDTO.getChat() + " does`nt exists!"));

        if (!chat.getUsers().stream().map(User::getId).toList().contains(user.getId())){
            throw new ActionNotAllowedException("User with id " + user.getId()
                    + " can`t send messages to chat " + chat.getId() + "!");
        }

        var message = messageMapper.map(messageCreateDTO);
        message.setSender(user);
        message.setChat(chat);
        message.setCreatedAt(LocalDateTime.now());
        messageRepository.save(message);

        return messageMapper.map(message);
    }

    @PreAuthorize("@messageRepository.existsByIdAndChat_Users_Id(#messageId, authentication.principal.user.id)")
    public MessageDTO update(Long messageId, MessageUpdateDTO updateDTO){
        var message = getMessageOrThrow(messageId);
        checkIsEditable(message);

        messageMapper.update(updateDTO, message);
        message.setUpdated(true);
        messageRepository.save(message);

        return messageMapper.map(message);
    }

    @PreAuthorize("@messageRepository.existsByIdAndChat_Users_Id(#messageId, authentication.principal.user.id)")
    public void delete(Long messageId){
        var message = getMessageOrThrow(messageId);
        checkIsEditable(message);

        messageRepository.delete(message);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("@messageRepository.existsByIdAndChat_Users_Id(#id, authentication.principal.user.id)")
    public MessageDTO getById(Long id){
        return messageMapper.map(getMessageOrThrow(id));
    }

    @Transactional(readOnly = true)
    @PreAuthorize("@chatRepository.existsByIdAndUsers_Id(#chatId, authentication.principal.user.id) or hasRole('ADMIN')")
    public List<MessageDTO> getMessagesByChat(Long chatId){
        return messageMapper.map(messageRepository.findByChatIdOrderByCreatedAtAsc(chatId));
    }

    @Transactional(readOnly = true)
    private Message getMessageOrThrow(Long id) {
        return messageRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Message with id " + id + " doesn't exist"));
    }

    private void checkIsEditable(Message message){
        if (LocalDateTime.now().isAfter(message.getCreatedAt().plusDays(1))) {
            throw new ActionNotAllowedException("Message can’t be edited or deleted after 1 day!");
        }
    }
}

