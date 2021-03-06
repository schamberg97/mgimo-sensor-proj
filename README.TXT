Авторство: Nicholas Schamberg, 2020

Лицензия: GPLv3

Требования:

1) Node.JS 10+. Все необходимые модули будут установлены автоматически
2) MongoDB (с приложением включена копия для MacOS; для Windows, Linux и других ОС - см. инструкции после запуска приложения)
3) Установленная прошивка Standard Firmata Plus на Arduino. См <https://github.com/firmata/arduino/blob/master/examples/StandardFirmataPlus/StandardFirmataPlus.ino>

Запуск:

1) Откройте директорию/папку с приложением в Терминале (MacOS, Linux, UNIX-совместимые ОС) / Windows PowerShell (Windows)
2) Выполните команду node index
3) Для завершения нажмите несколько раз Ctrl-C.

В случае возникновения проблем:
	1) Не обнаружен сенсор BME-280. 
		Попробуйте запустить приложение с параметром 0x76, например "node index 0x76" (без кавычек). Если это не поможет, веротяно сенсор неправильно подключен. Посмотрите соответствующие ресурсы в интернете
	2) Не работает приложение, ошибки с БД. 
		Может возникнуть на платформах, отличных от MacOS. Убедитесь, что MongoDB версии не ниже 3.6 установлен
	3) Прочие ошибки
		Попробуйте запустить приложение с параметром --debug, например "node index --debug" (без кавычек). Интерпретатор Node.JS и Приложение будет выдавать больше сообщений об ошибках

Компоненты кода:
	database.js - инициализация БД MongoDB и общее управление, предоставление интерфейса для доступа к БД другим компонентам
		database - папка, в которую MongoDB записывает свои данные
		platform - копия mongoDB для macOS
	accountManager.js - низкоуровневое управление учётными записями.
	hardware.js - управление Arduino-совместимым микроконтроллером
	lastResult.js - хранение и запись результатов последнего измерения, запись показателей в БД интерфейсы database.js
	loader.js - общая загрузка всех компонентов
	prepareData.js - подготовка исторических данных для REST API
	simpleMathOps.js - примитиыне и часто использующиеся математические операции
	web.js - веб-сервер на Express.js
		routes.js - пути, обслуживаемые веб-сервером
			views - шаблоны динамических веб-страниц
			static - статические файлы, скрипты JS для веб-страниц, каскадные стили
	index.js - загружает loader.js, при необходимости устанваливая необходимые модули
		FIRSTRUN - файл, который создаёт index.js после первого запуска и установки всех модулей
		node_modules - папка, в которой хранятся требуемые модули