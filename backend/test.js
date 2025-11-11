
const mongoose=require("mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/practice", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(function(){
    console.log("Dabase connected!");
})
.catch(function(errr){
    console.log("Data base not conencted:" + errr);
})
