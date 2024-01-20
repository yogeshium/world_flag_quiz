import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;


//Database connected
const db= new pg.Client({
    user: "postgres", 
    host: "localhost", 
    database: "world",
    password: "yogesh password",
    port: 5432,
});
db.connect();

//Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

//get total flags
var result = await db.query("select count(*) from flags;");
var totalFlags= result.rows[0].count;
totalFlags=Number(totalFlags);
var flagsID=[];
var curr=0;
var currentCountry={};

//Routes
app.get("/",async (req,res)=>{
    
    flagsID=[];
    curr=0;
    //Suffling randomly all the flags 
    for(let i=0;i<totalFlags;i++)
        flagsID.push(i+1);
     // Fisher–Yates shuffle Algorithm
    for(let i=flagsID.length-1;i>0;i--)
    {
        let j=Math.floor(Math.random()*(i+1));
        //swap
        let temp = flagsID[i];
        flagsID[i]=flagsID[j];
        flagsID[j]=temp;
    }

    currentCountry = await nextFlag(flagsID[curr]);
    res.render("home.ejs",{countryFlag:currentCountry.flag,score:curr});
    console.log(currentCountry);
});

app.post("/check",async (req,res)=>{
    const answer= req.body.countryName;
    console.log(answer);
    if(answer.toLowerCase()===currentCountry.name.toLowerCase())
    {
        curr++;
        if(curr===totalFlags)
        {
            res.render("home.ejs",{champ:"champ"});
        }
        else
        {
            currentCountry = await nextFlag(flagsID[curr]);
            console.log(currentCountry);
            res.render("home.ejs",{countryFlag:currentCountry.flag,score:curr,wasCorrect:true});
        }
    }
    else
    {
        res.render("home.ejs",{score:curr,wasCorrect:false})
    }
});

app.listen(port,()=>{
    console.log("Listnening to the port: "+port);
});



//Get next flag 
async function nextFlag(x){
    result = await db.query(`SELECT flag,name FROM flags WHERE id=${x};`);
    let country ={};
    country.flag=result.rows[0].flag;
    country.name = result.rows[0].name;
    return country;
}
