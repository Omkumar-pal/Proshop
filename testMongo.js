import mongoose from "mongoose";
const uri = "mongodb+srv://neo:ShreeRam1538@media.r2sl6ol.mongodb.net/";
mongoose
  .connect(uri)
  .then(() => console.log("✅ Connected!"))
  .catch((err) => console.log(err));
