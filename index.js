const http = require('http');
const fs = require('fs');
const path = require("path");


const html = "<html lang='ru'><head><meta charset='UTF-8'><title>Список файлов</title><style>body{padding-top: 50px; position: relative;} button{margin: 2px; background: blanchedalmond; width: 300px; height: 40px; font-size: 20px;} #back{position: absolute; top:0; left:0;} button:hover{background: aquamarine;}</style><link rel='shortcut icon' href='#' /></head><body><button id='back' onclick='history.back()'>Назад</button>";
const isFile = fileName => {
    return fs.lstatSync(fileName).isFile();
}

const server = http.createServer((req, res) => {

        if (req.method === "GET") {
            const filePath = path.join(__dirname, req.url);

            fs.access(filePath, fs.constants.R_OK, (err) => {
                if (err) {
                    res.writeHead(404, "Not found", {'Content-Type': 'text/html'});
                    res.end("<h1>Not found!</h1>");
                } else {
                    let data = "";
                    if (isFile(filePath)) {
                        const readStream = fs.createReadStream(filePath, 'utf-8');
                        readStream.on('data', chunk => data += chunk);
                        res.writeHead(200, "Success", {'Content-Type': 'text/html'});
                        readStream.pipe(res);
                    } else {
                        try {
                            const readDir = fs.readdirSync(filePath);
                            const writeStream = fs.createWriteStream(`${__dirname}/content.html`, "utf-8");
                            writeStream.write(`${html}`);
                            readDir.forEach((file) => {
                                writeStream.write(`<button class='forward' value=${file} onclick="forward(this.value)">${file}</button><br>`);
                            })
                            writeStream.write("<script>const forward=(value)=>{\n" +
                                "    window.location.pathname+=('/'+value);\n" +
                                "}</script></body></html>")
                            const readStream = fs.createReadStream(`${__dirname}/content.html`, 'utf-8');
                            readStream.on('data', chunk => data += chunk);
                            res.writeHead(200, "Success", {'Content-Type': 'text/html'});
                            readStream.pipe(res);
                        } catch (err) {
                            if (err)
                                throw err;
                        }
                    }
                }
            })
        } else {
            res.writeHead(405, "Method is not allowed", {'Content-Type': 'text/html'});
            res.end("<h2>Method is not allowed</h2>");
        }
    })
;

server.listen(3000, "localhost", () => {
    console.log("Server started listening on port 3000");
});




