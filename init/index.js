
const mongoose = require("mongoose");
const MONGODB_URL = "mongodb://127.0.0.1:27017/wanderlust";
const Listing = require("../models/listing.js");
const initDB = require("./data.js")

main()
.then(()=>{
    console.log("connection successful");
})
.catch((err)=>{
    console.log(err)
})
async function main(){
    await mongoose.connect(MONGODB_URL);
}

const initData = async ()=>{
    await Listing.deleteMany({});
    
    initDB.data = initDB.data.map((obj)=>({...obj,owner:"66ae419b484ced0382d490cf"}))
    await Listing.insertMany(initDB.data);
    console.log('data saved')
}

initData();