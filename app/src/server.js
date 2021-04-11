const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const formatTime = require("date-format");
const { createMessages } = require("./utils/create-messages");
const { getUserList, addUser, removeUser, findUser } = require("./utils/users");

const publicPathDirectory = path.join(__dirname, "../public");
app.use(express.static(publicPathDirectory));
const server = http.createServer(app);
const io = socketio(server);
// lắng nghe sự kiện kết nối từ client
io.on("connection", (socket) => {
  socket.on("join romm form client to server", ({ room, username }) => {
    socket.join(room);

    // chào
    // gửi cho client vừa kết nối vào
    socket.emit("send message from server to client", createMessages(`Chào Mừng Bạn Đến Với Phòng ${room}`, "Admin"));
    // gửi cho các client còn lại
    socket.broadcast
      .to(room)
      .emit(
        "send message from server to client",
        createMessages(`client ${username} Mới Vừa Tham Gia Vào Phòng ${room}`, "Admin")
      );

    // chat
    socket.on("send message from client to server", (messageText, callback) => {
      const filter = new Filter();
      if (filter.isProfane(messageText)) {
        return callback("messageText không hợp lệ vì có những từ khóa tục tĩu");
      }

      const id = socket.id;
      const user = findUser(id);

      io.to(room).emit("send message from server to client", createMessages(messageText, user.username));
      callback();
    });

    // xử lý chia sẽ vị trí
    socket.on("share location from client to server", ({ latitude, longitude }) => {
      const linkLocation = `https://www.google.com/maps?q=${latitude},${longitude}`;
      const id = socket.id;
      const user = findUser(id);
      io.to(room).emit("share location from server to client", createMessages(linkLocation, user.username));
    });

    // xử lý userlist
    const newUser = {
      id: socket.id,
      username,
      room,
    };
    addUser(newUser);
    io.to(room).emit("send user list from server to lient", getUserList(room));

    // ngắt kết nối
    socket.on("disconnect", () => {
      removeUser(socket.id);
      io.to(room).emit("send user list from server to lient", getUserList(room));
      console.log("client left server");
    });
  });
});

const port = process.env.PORT || 3456;
server.listen(port, () => {
  console.log(`app run on http://localhost:${port}`);
});
