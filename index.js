const express = require("express");
const app = express();

const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server);
app.use(express.static(path.resolve("")));

let arr = [];
let playingArray = [];

io.on("connection", (socket) => {
    socket.on("find", (e) => {
        if (e.name != null) {
            arr.push(e.name);

            if (arr.length >= 2) {
                let p1obj = {
                    p1name: arr[0],
                    p1value: "X",
                    p1move: "",
                    p1score: 0, 
                };
                let p2obj = {
                    p2name: arr[1],
                    p2value: "O",
                    p2move: "",
                    p2score: 0, 
                };

                let obj = {
                    p1: p1obj,
                    p2: p2obj,
                    sum: 1,
                };
                playingArray.push(obj);

                arr.splice(0, 2);

                io.emit("find", { allPlayers: playingArray });
            }
        }
    });

    socket.on("playing", (e) => {
        if (e.value == "X") {
            let objToChange = playingArray.find((obj) => obj.p1.p1name === e.name);

            objToChange.p1.p1move = e.id;
            objToChange.sum++;
        } else if (e.value == "O") {
            let objToChange = playingArray.find((obj) => obj.p2.p2name === e.name);

            objToChange.p2.p2move = e.id;
            objToChange.sum++;
        }

        
        playingArray.forEach((obj) => {
            const p1Moves = obj.p1.p1move.split(",");
            const p2Moves = obj.p2.p2move.split(",");

           
            obj.p1.p1score = p1Moves.length;
            obj.p2.p2score = p2Moves.length;
        });

        io.emit("playing", { allPlayers: playingArray });

        
        playingArray.forEach((obj) => {
            if (obj.p1.p1score >= 3) {
                io.emit("winner", { winner: obj.p1.p1name });
            } else if (obj.p2.p2score >= 3) {
                io.emit("winner", { winner: obj.p2.p2name });
            }
        });
    });

    socket.on("gameOver", (e) => {
        playingArray = playingArray.filter((obj) => obj.p1.p1name !== e.name);
        console.log(playingArray);
        console.log("lol");
    });
});

app.get("/", (req, res) => {
    return res.sendFile("index.html");
});
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
    console.log(`Port connected to ${PORT}`);
});
