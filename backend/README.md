Как запустить бэкэнд?
```shell
sh start_messenger.sh
```
Где посмотреть какие данные нужны для методов?
backend/src/main/java/org.example/dto
В папке dto все структуры, которые принимают методы. Прим. UserCreateDTO - структура для создания пользователя.

Теперь все руты, кроме /auth/login, /user/registration, / (main page), /error доступны ТОЛЬКО С АУТЕНТИФИКАЦИЕЙ.
Аутенификация реализована при помощи JWT токенов. Access Token нужно передавать в заголовках -  Authorization: Bearer <token> .
Refresh Token нужно передавать в теле запроса - {refreshToken : <Токен>}. Если имя в json будет не refreshToken, то работать не будет. 
