const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app=express();

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://karan:Karanbalodi1@cluster0-heimn.mongodb.net/todolistDB", {useNewUrlParser: true,useUnifiedTopology: true});
   
const itemSchema = {
      name: String
   };

   const Item =  mongoose.model("Item",itemSchema);

   const item1 = new Item({
      name: "buy food"
   });

   const item2 = new Item({
      name: "workout"
   });

   const item3 = new Item({
      name: "study"
   });

   const listSchema = {
      name: String,
      items: [itemSchema]
  };

    const List = mongoose.model("List",listSchema);


   let today = new Date();
     
   let options = {
       weekday: "long",
       day: "numeric",
       month: "long"
   };
   let day=today.toLocaleDateString("en-US", options);

  app.get("/",function(req,res){

      Item.find({}, function(err,foundItems){
         if(foundItems.length === 0){
            Item.insertMany([item1 ,item2, item3],function(err){
               if(err){
                 console.log(err);
               }
           });
           res.redirect("/");
         }
         else{
      res.render("list",{listTitle: day, newListItem: foundItems});
         }
   });
       
  });  
  
  app.post("/",function(req,res){
     let itemName = req.body.newItem;
     let listName = req.body.button;
      const item = new Item({
         name: itemName
      });

      if(listName === day){
        item.save();
        res.redirect("/");
      }
      else{
        List.findOne({name: listName},function(err,foundList){
               foundList.items.push(item);
               foundList.save();
               res.redirect("/"+listName);
           
        });
      }
  });

  app.post("/delete",function(req,res){
     
   const checkbox = req.body.check;
   const listName = req.body.listName;
   if(listName === day){
     Item.findByIdAndRemove(checkbox,function(err){
        if(err){
      console.log(err);
      }
   });
      res.redirect("/");
  }
  else {
   List.findOneAndUpdate({name: listName},{$pull: {items : {_id: checkbox}}},function(err,result){
      if(err){
    console.log(err);
    }
 });
    res.redirect("/"+listName);
}
  });

  app.get("/:customListName",function(req,res){
       var customListName = _.capitalize(req.params.customListName);
         

         List.findOne({name: customListName},function(err,foundList){
              if(!err){
                 if(!foundList){
                  const list = new List({
                     name : customListName,
                     items: []
                   });
                 list.save();
                 res.redirect("/" +customListName);
                 }
                 else {
                    res.render("list",{listTitle : foundList.name ,newListItem: foundList.items});
                 }

              }
         });

       
  });

  app.listen(process.env.PORT,function(){
     console.log("server started"); 
  });   