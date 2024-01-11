# wp.web.js-chatbot

## Client

The client folder is a basic react project which is a basic UI to connect with server.
After typing the following codes in the terminal, the project will run

npm install
npm start

## Server

The server part is a server file created with a simple socket io. The .wwebjs_auth and .wwebjs_cache files here are files created by whatsapp-web.js. In them, session data that has been logged and opened before is kept. You can delete them or create the project with these old data. You can paste the following into the terminal and run the project directly.

npm install
node index.js


##
In this project, a server / backend side was created with the help of express and socket. The frontend side was written with react.js with a simple ui. Here, after the project is run, the name to be given to the session is written in the input field and a session is created using the 'create new session' button and this session generates a qr code that you can enter into whatsapp-web. After reading this qr code, you will be logged into your whatsapp and now your whatsapp-web will respond to your incoming messages as a chatbot. As long as you are not logged out, if you run again after closing the project, your session is saved (Here sessions are saved remotely to the mongo db.) If you run the 'get old session' section with the name you gave to the session, you can continue your whatsapp session over the old session without the need to read qr.  
##
