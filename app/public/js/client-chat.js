// yếu cầu server kết nối với client
const socket = io();

document.getElementById("form-messages").addEventListener("submit", (e) => {
  e.preventDefault();
  const messageText = document.getElementById("input-messages").value;
  const acknowledgements = (errors) => {
    if (errors) {
      return alert("tin nhắn không hợp lệ");
    }
    console.log("tin nhắn đã gửi thành công");
  };
  socket.emit(
    "send message from client to server",
    messageText,
    acknowledgements
  );
});

socket.on("send message from server to client", (message) => {
  console.log("messageText : ", message);
  // hiển thị lên màn hình
  const { createAt, messagesText, username } = message;
  const htmlContent = document.getElementById("app__messages").innerHTML;
  const messagesElement = `
                <div class="message-item">
                    <div class="message__row1">
                        <p class="message__name">${username}</p>
                        <p class="message__date">${createAt}</p>
                    </div>
                    <div class="message__row2">
                        <p class="message__content">
                            ${messagesText}
                        </p>
                    </div>
                </div>
  `;
  let contentRender = htmlContent + messagesElement;
  document.getElementById("app__messages").innerHTML = contentRender;

  // clear input message
  document.getElementById("input-messages").value = "";
});

// gửi vị trí
document.getElementById("btn-share-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("trình duyệt đang dùng không có hổ trợ tìm ví");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    console.log("position : ", position);
    const { latitude, longitude } = position.coords;
    socket.emit("share location from client to server", {
      latitude,
      longitude,
    });
  });
});

socket.on("share location from server to client", (data) => {
  const { createAt, messagesText, username } = data;

  const htmlContent = document.getElementById("app__messages").innerHTML;
  const messagesElement = `
                <div class="message-item">
                    <div class="message__row1">
                        <p class="message__name">${username}</p>
                        <p class="message__date">${createAt}</p>
                    </div>
                    <div class="message__row2">
                        <p class="message__content">
                          <a href="${messagesText}" target="_blank">
                            Vị Trí Của ${username}
                          </a>
                        </p>
                    </div>
                </div>
  `;
  let contentRender = htmlContent + messagesElement;
  document.getElementById("app__messages").innerHTML = contentRender;
});

// xử lý query string
const queryString = location.search;

const params = Qs.parse(queryString, {
  ignoreQueryPrefix: true,
});

const { room, username } = params;
socket.emit("join romm form client to server", { room, username });
// hiển thị tên phòng lên màn hình
document.getElementById("app__title").innerHTML = room;

// xử lý user list
socket.on("send user list from server to lient", (userList) => {
  console.log("userList : ", userList);
  let contentHtml = "";
  userList.map((user) => {
    contentHtml += `
    <li class="app__item-user">
      ${user.username}
    </li>
    `;
  });
  document.getElementById("app__list-user--content").innerHTML = contentHtml;
});
