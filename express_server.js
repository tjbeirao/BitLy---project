const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8080; // default port 8080
const morgan = require('morgan')

var cookieParser = require('cookie-parser')
app.use(cookieParser('s4bt56s465s1b65s54tb6s54tb65s4bts'))
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");




function generateShortUrl() {
    const vocabulary = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'x', 'y', 'z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    let output = "";
    for (let i = 0; i < 6; i++) {
        let index = getRandomInt();
        output += vocabulary[index];
    }
    return output;
}

function getRandomInt() {
    min = Math.ceil(0);
    max = Math.floor(35);
    return Math.floor(Math.random() * (35 - 0)) + 0;
}

function removeItem(id) {
    for (let index in urlDatabase) {
        if (index == id) {
            delete urlDatabase[index]
        }
    }
}

function addUser(user, email, password) {
    let newUserKey = generateShortUrl()
    users[newUserKey] = { id: user, email: email, password: password }
}

function addURL(longURL) {
    if (longURL.charAt(0) === "h" && longURL.charAt(8) === "w") {
        return longURL;
    } else if (longURL.charAt(0) === "w" && longURL.charAt(1) === "w" && longURL.charAt(2) === "w") {
        return longURL = ("http://" + longURL)
    } else if (longURL.charAt(0) !== "h" && longURL.charAt(8) !== "w") {
        return longURL = ("http://www." + longURL)
    }
}

var urlDatabase = {};

var users = {
    "919das": {
        id: "tjbeirao",
        email: "tjbeirao@gmail.com",
        password: "kira"
    },
    "g4s98d": {
        id: "mary",
        email: "marylamarq@hotmail.com",
        password: "kira"
    }
}


app.post("/urls/login", (req, res) => {
    res.cookie("username", req.body.username);
    res.redirect("/urls");
});


app.post("/urls/logoff", (req, res) => {
    res.clearCookie("username");
    res.redirect("/urls");
});


app.get("/urls/register", (req, res) => {
    res.render("urls_register");
});


app.post("/urls/register", (req, res) => {
    let newUserID = req.body.user;
    let newUserEmail = req.body.email;
    let newUserPassword = req.body.password;
    if (!req.body.user || !req.body.email || !req.body.password) {
        res.redirect("/urls/error/400");
    } else {
        addUser(newUserID, newUserEmail, newUserPassword);
        res.cookie("username", newUserID, newUserEmail);
        res.redirect("/urls");
    }
})

app.get("/urls/error/400", (req, res) => {
    res.render("urls_error_400");
});

app.get("/", (req, res) => {
    res.redirect("/urls/new")
});


app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
    res.render("urls_index", templateVars);
});


app.post("/urls", (req, res) => {
    var shortURL = generateShortUrl();
    let newLongUrl = addURL(req.body.longURL)
    urlDatabase[shortURL] = newLongUrl
    res.redirect("/urls");
});


app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});


app.get("/urls/:id", (req, res) => {
    let templateVars = { shortURL: req.params.id, urls: urlDatabase, username: req.cookies["username"] };
    res.render("urls_show", templateVars);
});


app.post("/urls/:id", (req, res) => {
    let newURL = req.params.id;
    urlDatabase[newURL] = req.body.longURL;
    res.redirect("/urls");
});


app.post("/urls/edit/:id", (req, res) => {
    let templateVars = { shortURL: req.params.id, urls: urlDatabase, username: req.cookies["username"] };
    res.render("urls_show", templateVars);
});


app.post("/urls/delete/:id", (req, res) => {
    let id = req.params.id;
    removeItem(id);
    res.redirect("/urls");
});


app.get("/u/:shortURL", (req, res) => {
    let shortURL = req.params.shortURL
    let longURL = urlDatabase[shortURL]
    res.redirect(longURL);
});


app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

app.get("/hello", (req, res) => {
    res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
})