const express = require('express');
const ent = require('ent'); //contante servant à sécurisé notre back contre les caratères HTML

const app = express(); 
const server = require('http').createServer(app); //Création de notre serveur
const io = require('socket.io').listen(server); //On appelle socket.io

const cookie = require('cookie-session');

//On utilise les cookie de session
app.use(
    cookie(
        {secret: 'cookie_de_session'}
    )
);

const todoListe = [];

//On affiche notre todo.html
app.use('/',
    (req, res) => {
        res.sendFile(__dirname + '/todo.html');
    }
)

//redirige vers notre '/' si on netrouve pas notre page
.use(
    (req, res) => {
        res.redirect('/');
    }
)

//On utilisera désormais socket.io

//On envoie notre liste todoListe à notre view
io.sockets.on('connection',
    (socket) => {
        socket.emit('envoiTache', todoListe);

        //On recoit la todo a ajouter et on l'ajouter à notre todoliste
        socket.on('ajoutTache',
            function(valeur){
                valeur = ent.encode(valeur);//On sécurise notre envoi pour vérifier qu'il n'y a pas de caratères HTML
                todoListe.push(valeur);//On ajoute à notre tableau de session cette élément
                
                socket.emit('tableauV2', todoListe);
                socket.broadcast.emit('tableauV2', todoListe);
            }
        );

        //On recoit la position de la todo a supprimer donc on l'a supprimme
        socket.on('suppression',
            function(lignes) {
                todoListe.splice(lignes, 1);

                socket.emit('tableauV2', todoListe);
                socket.broadcast.emit('tableauV2', todoListe);
            }
        );
    }
);

server.listen(8080);