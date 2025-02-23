# chatty

## Intro
App that enables you to create chat rooms and exchange rich messages with others in real time. Frontend part is created 
in React w/ Typescript, backend in Node.js together with Express.js. Implementation of real-time event system was made 
with socket-io, with Web Sockets under the hood. Dedicated database is Redis.

## Setup
How to run the app locally:
1. Run a container with an instance of Redis Stack
   - If on macOS, install Redis Stack on your computer by running `brew install redis-stack`
   - Run the container `docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest`
   - Run the cli if you want: `docker exec -it redis-stack redis-cli`
   - To reset the db enter `flushall`
2. When in repo:
   - Install Node.js on your computer, the project was made on v22.9.0
   - In 'backend' directory, run `npm install` -> the build it `npm run build` -> run the server 
     `npm run start <hostname> <frontend-url>`, there are two optional arguments you can provide, `<hostname>` being
     the ip address you want to run the server on (example format: 127.0.0.1; port is set to 3000), and the `frontend-url` is the URL on which
     the frontend part is hosted (example format: http://127.0.0.1:5173; important for cors configuration), if not 
     provided it will default to 'localhost' and 'http://localhost:5173' respectively. In that case the server will run 
     locally and will expect the frontend to be hosted locally as well. Upon launch on the backend server, it will 
     initialize the Redis database with sample data (if not initialized already), it can take a minute.
   - In 'frontend' directory run `npm install` -> host the frontend using `npm run dev`. Optionally you can change the
     ip the frontend will be hosted on by running the command with `--host <hostname>`. In the .env file in the 
     directory, you can change the variable `VITE_BACKEND_BASE_URL` to set the URL of the backend server on the frontend
     side.
3. If all is running, enter the address 'http://localhost:5173' in the browser (or a different URL if specified) and 
  you're ready to use the app. 

## Usage
After first launch the database will be initialized with sample data. Alongside chats and message history, several 
accounts will be created allowing you to log into one of them. Here is the full list of usernames:

* mike123 
* josh 
* simon 
* anonymous 
* kevinisthebest 
* jess2001 
* criticalthinker 
* veteran

Each account can be accessed by providing 'HardPassword123' as the password.

First, you will be redirected to log into an account by providing username and password. You can use above credentials
or click link at the bottom to sign up and create a new account. When creating an account, username must be unique and
not taken already by one of other users. Passwords are hashed when stored in Redis database. The authentication system
relies on 'express-session' package, which creates and maintains unique session for each connected user.

After successful login/signup, you will be redirected to the home page. It contains the number of currently online users
in the upper right corner together with your username and log out button. There are three main buttons in the center:

* My Chats, leftmost, which will redirect you to page containing all the chats you have joined. The list is paged, 10 
entries per page, you can load more results by clicking the button at the bottom. By clicking on a tile containing chat
title, you will be forwarded to chat page.
* Add Chat, middle one with plus icon, lets you create a new chat. You must specify the chat title, so, for example a 
question or a statement about some topic, and text containing detailed description of your opinion/experience/etc. You
can append file attachments, the list of allowed extensions is displayed. Each file must be smaller than 20mb. If 
you're ready, click "Create chat" button on the right - the room will be created, and you will be redirected to chat 
page.
* Search/Find new chats, rightmost with a die image, will provide you with up to 5 randomly chosen chats that you are
not a participant of. You can click "Shuffle" button to get different results. If the chat topic interests you, and you
want to join, click the "Join" button. You will be added to the participants list and the chat tile will become 
clickable - click it to be redirected to chat page.

Each section ultimately redirects you to the chat page. It contains chat title, creation date, no of participants in 
the header. In the main part there is a classic scrollable container with messages that participants have sent. The 
message list is paged (20 a page), if there is more then by scrolling to the top the app will load more, older messages.
At the bottom there is a panel that lets user send a textual message, and optionally attach multiple files: videos, 
photos, audio. All media content is displayed properly, videos and audio are interactive. The chat is a live one, so 
all online participants of the chat will receive several events in real time:
- whenever any user sends a message it will be displayed in your chat,
- whenever a user becomes online it will be updated in the upper right corner,
- whenever some user starts typing, you will see a notification in the chat

## Remarks
Sources of inspiration:
- https://github.com/redis-developer/basic-redis-chat-app-demo-nodejs/tree/main
- https://dev.to/imichaelowolabi/passwordless-authentication-in-nodejs-on-redis-12e
- https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/routes
- https://dev.to/saranshk/how-to-get-the-hash-of-a-file-in-nodejs-1bdk

App assumes simplicity - many clients but they rely on one server. To scale the app across multiple server instances 
(so many redis clients) I could use @socket.io/redis-adapter package, which is based on Redis Pub/Sub functionality.
There are a couple of features that have been started but are yet to be added:
- ability to delete attached files,
- delete and edit messages,
- seeing user list in chat and online status of each user