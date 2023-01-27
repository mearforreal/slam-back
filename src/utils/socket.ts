import { Server } from "socket.io";
const io = new Server();

const Socket = {
  emit: function (event: any, data: any) {
    io.sockets.emit(event, data);
  },
};

io.on("connection", function (socket) {
  // console.log("A user connected");
});

export { io };
export { Socket };
