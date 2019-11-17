import express from "express";

const app = express();
const port = 4321;

app.get("/", (req, res) => res.send("Hello World!"));

const models = [

 ];

app.get("/models/shooter", (req, res) => {
  
});

app.post("/models/shooter", (req, res) => {
  
});

// tslint:disable-next-line: no-console
app.listen(port, () => console.log(`App listening on port ${port}!`));
