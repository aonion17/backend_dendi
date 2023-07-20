const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
require("dotenv").config();
var cors = require("cors");
var cookieParser = require("cookie-parser");

//socket.io configuration
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const errorHandler = require("./middleware/error");

//import routes
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const { Socket } = require("dgram");

//database connection
mongoose
  .connect('mongodb+srv://admin:admin@marketblogdb.jhbmvfq.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

//MIDDLEWARE
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "5mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "5mb",
    extended: true,
  })
);
app.use(cookieParser());
app.use(cors());

//ROUTES MIDDLEWARE
app.use("/api", authRoutes);
app.use("/api", postRoutes);

//error middleware
app.use(errorHandler);

//port
const port = process.env.PORT || 9000;

//app.listen(port, () => {
//  console.log(`Server running on port ${port}`);
//});

io.on("connection", (socket) => {
  //console.log("a user connected", socket.id);
  socket.on("comment", (msg) => {
    //console.log("new comment received", msg);
    io.emit("new-comment", msg);
  });
});

exports.io = io;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
