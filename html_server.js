

function start_html_server() {
    const http = require('http');
    const fs = require('fs');

    const hostname = '0.0.0.0';
    const port = 8080;

    const server = http.createServer(function(request, response) {
        response.writeHead(200, {"Content-Type": "text/html"});
        const html = fs.readFileSync('./index.html', 'utf8');
        response.write(html);
        response.end();
    });

    server.listen(port, hostname, () => {
        console.log("Server running at http://web-ze31e486f-122b.fi.docode.ng.qwasar.io");
        console.log("Replace x by your current workspace ID");
        console.log("(look at the URL of this page and mytetris.docode.YYYY.qwasar.io, mytetris is your workspace ID and YYYY is your zone)");
    });
}

start_html_server();
