let io;

const socketService = {
  init(httpServer) {
    io = require('socket.io')(httpServer, {
      cors: {
        origin: "*", // Cần bảo mật bằng cách thay thế * bằng domain cụ thể
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("Client connected");

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
  },

  emitNewOrder(orderDetails) {
    io.emit("new_order", orderDetails);
  }
};

module.exports = socketService;
