const routes= require("express").Router();
const controls= require("../routecontrol/Control");

routes.get("/",controls.details);





module.exports= routes;