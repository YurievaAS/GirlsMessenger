#### Как запустить бэкэнд?
```shell
sh start_messenger.sh
```

##### Где посмотреть какие данные нужны для методов?
backend/src/main/java/org.example/dto
В папке dto все структуры, которые принимают методы. Прим. UserCreateDTO - структура для создания пользователя.

##### Работа с Аутентификацией
Теперь все руты, кроме /auth/login, /user/registration, / (main page), /error доступны только с аутентификацией.
Аутенификация реализована при помощи JWT токенов. Access Token нужно передавать в заголовках -  Authorization: Bearer <Токен> .
Refresh Token нужно передавать в теле запроса - {refreshToken : <Токен>}. Если имя в json будет не refreshToken, то работать не будет. 

##### Работа с REST API
REST API используется для управления чатами, пользователями и получения данных.
Все руты, по которым можно работать с данными можно посмотреть в backend/src/main/java/org.example/controller.
Все файлы, кроме ChatWebSocketController работают по REST API.

##### Работа с Web Socket
Точка подключения STOMP WebSocket: /ws через SockJS.
Отправка сообщений с клиента: /app/chat.sendMessage и /app/chat.addUser.
Подписка на сообщения чата: /topic/chat.{chatId} — все клиенты чата получают новые сообщения.
REST используется для создания и редактирования чатов и получения истории, WebSocket — только для обмена сообщениями в реальном времени.
При отправке сообщения через веб-сокеты, нужно также добавить его в бд, через Rest Controller (POST /messages).



