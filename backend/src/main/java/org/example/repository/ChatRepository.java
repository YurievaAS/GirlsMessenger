package org.example.repository;

import org.example.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
    List<Chat> findAllByUsers_Id(Long UserId);

    boolean existsByIdAndUsers_Id(Long chatId, Long UserId);
}
