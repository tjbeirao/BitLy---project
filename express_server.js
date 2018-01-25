const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8080; // default port 8080
const morgan = require('morgan')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')


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







app.post("/urls/login/acess", (req, res) => {
    let userEmail = req.body.email;
    let userPassword = req.body.password;
    for (let i in users) {
        if (users[i]["email"] === userEmail && users[i]["password"] === userPassword) {
            res.cookie("id", userEmail);
            res.redirect("/urls/")
        } else {
            res.clearCookie("id");
            res.redirect("/urls/login/acess");
        }
    }
})



app.post("/urls/register", (req, res) => {
    let newUserID = req.body.user;
    let newUserEmail = req.body.email;
    let newUserPassword = req.body.password;
    for (let i in users) {
        if (newUserEmail === users[i]['email']) {
            res.clearCookie("id");
            res.redirect("/urls/login/acess");
        } else if (!newUserID || !newUserEmail || !newUserPassword) {
            res.redirect("/urls/error/400");
        } else {
            addUser(newUserID, newUserEmail, newUserPassword);
            res.cookie("id", newUserEmail);
            res.redirect("/urls");
        }
    }
})



app.get("/", (req, res) => {
    res.redirect("/urls/login/acess")
});


app.get("/urls", (req, res) => {
    const current_user = req.cookies.id;
    if (current_user) {
        let templateVars = { urls: urlDatabase, username: req.cookies["id"] };
        res.render("urls_index", templateVars);
    } else {
        res.redirect("/urls/login/acess");
    }
});


app.post("/urls", (req, res) => {
    var shortURL = generateShortUrl();
    let newLongUrl = addURL(req.body.longURL)
    urlDatabase[shortURL] = newLongUrl
    res.redirect("/urls")
});


app.get("/urls/login/acess", (req, res) => {
    res.render("urls_login");
})


app.post("/urls/logoff", (req, res) => {
    res.clearCookie("id");
    res.redirect("/urls");
});


app.get("/urls/register", (req, res) => {
    res.render("urls_register");
});


app.get("/urls/new", (req, res) => {
    const current_user = req.cookies.id;
    if (current_user) {
        res.render("urls_new");
    } else {
        res.redirect("/urls/login/acess");
    }
});

app.get("/urls/:id", (req, res) => {
    const current_user = req.cookies.id;
    if (current_user) {
        let templateVars = { shortURL: req.params.id, urls: urlDatabase, username: req.cookies["id"] };
        res.render("urls_show", templateVars);
    } else {
        res.redirect("/urls/login/acess");
    }
});

app.post("/urls/:id", (req, res) => {
    let newURL = req.params.id;
    urlDatabase[newURL] = req.body.longURL;
    res.redirect("/urls");
});

app.post("/urls/edit/:id", (req, res) => {
    let templateVars = { shortURL: req.params.id, urls: urlDatabase, username: req.cookies["id"] };
    res.render("urls_show", templateVars);
});

app.post("/urls/delete/:id", (req, res) => {
    const current_user = req.cookies.id;
    if (current_user) {
        let id = req.params.id;
        removeItem(id);
        res.redirect("/urls");
    } else {
        res.redirect("/urls/login/acess");
    }
});

app.get("/u/:shortURL", (req, res) => {
    let shortURL = req.params.shortURL
    let longURL = urlDatabase[shortURL]
    res.redirect(longURL);
});

app.get("/urls/error/400", (req, res) => {
    const current_user = req.cookies.id;
    if (current_user) {
        res.render("urls_error_400");
    } else {
        res.redirect("/urls/login/acess");
    }
});








app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
})

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});















// app.get("/hello", (req, res) => {
//     res.end("<html><body>Hello <b>World</b></body></html>\n");
// });



// function logIn(email, password) {
//     for (let i in users) {
//         if (email == users[i]['email'] && password == users[i]['password']) {
//             res.redirect("/urls");
//         } else if (email !== users[i]['email']) {
//             alert("Wrong email")
//             res.redirect("/urls/login/acess");
//         } else if (password == users[i]['password']) {
//             alert("Wrong password")
//             res.redirect("/urls/login/acess");
//         }
//     }
// }



// app.post("/urls/login", (req, res) => {
//     res.cookie("username", req.body.username);
//     res.redirect("/urls");
// });