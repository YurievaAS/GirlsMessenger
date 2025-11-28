package org.example.repository;

import org.example.entity.Chat;
import org.example.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByChatIdOrderByCreatedAtAsc(Long chatId);

    boolean existsByIdAndSender_Id(Long messageId, Long senderId);

    boolean existsByIdAndChat_Users_Id(Long messageId, Long senderId);
}
