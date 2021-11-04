"use strict";

let canvas1 = document.getElementById("canvas1");
canvas1.width = 1000;
canvas1.height = 600;


let canscale = canvas1.width/canvas1.height;

let landsize = 200;
let land_x = Math.round(landsize*canscale);
let land_y = Math.round(landsize);
let LANDSCAPE = [];

let x_scale = canvas1.width/land_x;
let y_scale = canvas1.height/land_y;

let ctx1 = canvas1.getContext("2d");
ctx1.lineWidth = 0.4

let canvas2 = document.getElementById("canvas2");
canvas2.width = canvas1.width;
canvas2.height = canvas1.height;

let ctx2 = canvas2.getContext("2d");

const KEYS = {};
const PLAYERS = [];
const EXPL_PARTICLE = [];
const BULLETS = [];
const PROJECTILES = [];


class block{

    constructor(hue,sat,ligh,x=0,y=0,collision=false,destroyable=true,hasdmg=false){
        this.hue = hue + randomrange(-5,5);
        this.sat  = sat + randomrange(-5,5);
        this.ligh = ligh;
        this.color = "hsl("+this.hue+","+this.sat+"%,"+this.ligh+"%)";
        this.x = x;
        this.y = y;
        this.collision = collision;
        this.destroyable = destroyable;
        this.hasdmg = hasdmg;
        this.render();
    }

    destroy(){
        if(this.destroyable){
            this.collision = false;
            this.changecolor("none","none",100);
        }
    }

    changecolor(hue="none",sat="none",ligh="none"){
        if(this.destroyable){
            if(hue!=="none"){this.hue = hue;}
            if(sat!=="none"){this.sat = sat;}
            if(ligh!=="none"){this.ligh = ligh;}
            this.render();        
        }
    }

    render(){
        this.color = "hsl("+this.hue+","+this.sat+"%,"+this.ligh+"%)";
        ctx1.fillStyle = this.color;
        ctx1.clearRect(this.x*x_scale,this.y*y_scale,x_scale,y_scale);
        ctx1.fillRect(this.x*x_scale,this.y*y_scale,x_scale,y_scale);
        ctx1.strokeStyle = this.color;
        ctx1.strokeRect(this.x*x_scale,this.y*y_scale,x_scale,y_scale);
    }

}

const GameManager = {

    currentPlayer : 0,
    nextPlayer: function(a=1){
        GameManager.currentPlayer += a;
        if(GameManager.currentPlayer > PLAYERS.length-1){
            GameManager.currentPlayer = 0;
        }
        if(GameManager.currentPlayer < 0){
            GameManager.currentPlayer = PLAYERS.length-1;
        }

    },
    addPlayer:function(player){
        const playershtml = document.getElementById("players");
        let div = document.createElement("div");
        let span = document.createElement("span");
        let bar = document.createElement("meter");
        div.classList.add("flexcol");
        div.id = player.name; 
        span.innerHTML = player.name;
        bar.max = 100;
        bar.min = 0;
        bar.value = player.health;
        div.appendChild(span);
        div.appendChild(bar);
        playershtml.appendChild(div);

    },
    removePlayer:function(player){
        const playershtml = document.getElementById("players");
        const playerdiv =document.getElementById(player.name);
        playershtml.removeChild(playerdiv);
    },
    updatePlayer:function(player){
        const playerdiv =document.getElementById(player.name);
        playerdiv.lastChild.value = player.health;
    },
    roundtimer:{
        timerHTML:document.getElementById("timer"),
        starttime:0,
        totaltime:0,
        time:0,
        active:false,
        finished:false,
        starttimer:(tt = 1000)=>{
            if (GameManager.roundtimer.active) { GameManager.roundtimer.resettime(); }
            GameManager.roundtimer.active = true;
            GameManager.roundtimer.totaltime = tt;
            GameManager.roundtimer.starttime = Date.now();

        },
        resettime:()=>{
            GameManager.roundtimer.active = false;
            GameManager.roundtimer.time = 0;
            GameManager.roundtimer.finished = false;
        },
        updatetime:()=>{
            if(GameManager.roundtimer.active)
            GameManager.roundtimer.time = ( GameManager.roundtimer.totaltime - (Date.now() - GameManager.roundtimer.starttime ))
            if( GameManager.roundtimer.time < 0){
                GameManager.roundtimer.resettime();
                GameManager.roundtimer.finished = true;
            }
            GameManager.roundtimer.timerHTML.innerHTML = GameManager.roundtimer.time;
        }

    }





}

class player{

    constructor(name="none",color="black"){
        this.color = color;
        this.size = 6;
        this.xa = 0;
        this.ya = 0;
        this.dir = 0;
        this.dira = 0;
        this.shotstep = 0;
        this.shotvel = 1;
        this.shotvela = 0;
        this.lastshot = [];
        this.health = 100;
        this.showhealth = false;
        this.currentWeapon = "GrenadeLauncher";
        if(name === "none"){
            this.name = "boy"+ randomrange(0,1000);
        }else{
            this.name= name;
        }
        this.x = randomrange(0,canvas1.width-this.size*x_scale); 
        this.y = this.size*y_scale ;
        PLAYERS.push(this);   
        GameManager.addPlayer(this)     
    }

    update(i){

        if(this.health < 0){
            PLAYERS.splice(i,1);
            GameManager.removePlayer(this);
            if(GameManager.currentPlayer > i){
                GameManager.nextPlayer(-1);
            }
        }
        
        let xpos = Math.floor(this.x/x_scale);
        let ypos = Math.floor(this.y/y_scale);
        this.shotstep ++;
        let curP = GameManager.currentPlayer ===  i;
        
        
        
        this.ya += y_scale/9;
        

        if(curP){
            
            if(KEYS["d"]){
                this.xa += x_scale/15;
            }
            if(KEYS["a"]){
                this.xa -= x_scale/15;
            }
    
            if(KEYS["ArrowRight"]){
                this.dira += 0.01;
            }
    
            if(KEYS["ArrowLeft"]){
                this.dira -= 0.01;
            }
    
            if(KEYS["ArrowUp"]){
                this.shotvela += 0.002;
            }
    
            if(KEYS["ArrowDown"]){
                this.shotvela -= 0.002;
            }
    
            if(KEYS[" "]){
                this.shoot();
            }
        }
        
         // land col

        if(ypos+this.size !== land_y && xpos+this.size < land_x){
            for(let sizeposy= 0;sizeposy<this.size ; sizeposy++){
                if(LANDSCAPE[ypos+sizeposy][xpos+this.size].collision){
                    this.x = (xpos*x_scale)-0.0001;
                    this.xa = 0;
                    if(LANDSCAPE[ypos+sizeposy][xpos+this.size].hasdmg){this.health -= 3}
                }
            }
            
            for(let sizeposy= 0;sizeposy<this.size ; sizeposy++){
                if(LANDSCAPE[ypos+sizeposy][xpos].collision){
                    this.x = ((xpos+1)*x_scale)+0.0001
                    this.xa = 0;
                    if(LANDSCAPE[ypos+sizeposy][xpos].hasdmg){this.health -= 3}
                }
            }
            
            
            for(let sizeposx= 0;sizeposx<this.size+1 ; sizeposx++){
                if(LANDSCAPE[ypos+this.size][xpos+sizeposx].collision){
                    this.y = (ypos*y_scale)-0.0001;
                    this.ya = 0
                    if(LANDSCAPE[ypos+this.size][xpos+sizeposx].hasdmg){this.health -= 3; this.ya = -y_scale}

                    if(curP){
                        if(KEYS["d"] || KEYS["a"]){
                            this.ya -= y_scale/this.size/2;
                        }
                        if(KEYS["w"]){
                            this.ya = -y_scale*2;
                        }
                    }
                    
                }
            }
            
            for(let sizeposx= 0;sizeposx<this.size+1 ; sizeposx++){
                if(LANDSCAPE[ypos][xpos+sizeposx].collision){
                    this.y = ((ypos+1)*y_scale)+0.0001
                    this.ya = 0;
                    if(LANDSCAPE[ypos][xpos+sizeposx].hasdmg){this.health -= 3}
                }
            }
            
        }

        
        this.ya *= 0.99;
        this.xa *= 0.9;
        this.dira *= 0.9
        this.shotvela *= 0.9
        
        this.y += this.ya;
        this.x += this.xa;
        this.dir += this.dira;
        this.shotvel += this.shotvela;

        if(this.shotvel > 2){
            this.shotvel = 2
        }else if(this.shotvel < 0.25){
            this.shotvel = 0.25;
        }

        // border col
        {
            if(this.y >= canvas2.height-(y_scale*this.size)){
                this.y = canvas2.height-(y_scale*this.size)-y_scale;
            }
    
            if(this.y < 0){
                this.y = y_scale;
            }
            
            if(this.x+(this.size*x_scale) > canvas2.width){
                this.x = canvas2.width-(this.size*x_scale)-x_scale;
            }
    
            if(this.x < 0){
                this.x = x_scale;
            }
        }
        
    }

    shoot(){

        let curweap = WEAPONTYPES.types[this.currentWeapon]
        if(this.shotstep > curweap.firerate){
            this.shotstep = 0

            switch(curweap.bullet){

                case "projectile":
                    new projectile(this.x+(this.size/2*x_scale),this.y+(this.size/2*y_scale),this.dir,curweap.projectile,this.shotvel,this); 
                    break;
                case "drill":
                    new explosion_particle(this.x+(this.size/2*x_scale),this.y+(this.size/2*y_scale),this.dir,x_scale/2.1 ,"none",this.size+2,5);
                    break;

            }
            
        }

    }

    damage(dmg){
        this.health -= dmg;
        this.showhealth = true;
        GameManager.updatePlayer(this);
        setTimeout(()=>{this.showhealth = false},1000)

    }

    render(i){
        ctx2.strokeStyle = "black";
        ctx2.strokeRect(this.x,this.y,this.size*x_scale,this.size*y_scale);
        ctx2.fillStyle = "white";
        ctx2.fillRect(this.x,this.y,this.size*x_scale,this.size*y_scale);

        ctx2.beginPath();
        ctx2.strokeStyle =  "black";
        ctx2.moveTo(this.x+(this.size*x_scale/2),this.y+(this.size*x_scale/2));
        ctx2.lineTo(this.x+(this.size*x_scale/2) +Math.cos(this.dir)*this.size*x_scale, this.y+(this.size*x_scale/2) + Math.sin(this.dir)*this.size*x_scale);
        ctx2.stroke();


        // shooting
        if(GameManager.currentPlayer ===  i){
        ctx2.beginPath();
        ctx2.lineWidth = 4;
        ctx2.strokeStyle = "grey";
        ctx2.moveTo(this.x-(this.size*x_scale/2),this.y-(this.size*x_scale*2));
        ctx2.lineTo(this.x-(this.size*x_scale/2)+(this.size*2*x_scale),this.y-(this.size*x_scale*2));
        ctx2.stroke();
        ctx2.strokeStyle = "black";
        ctx2.lineWidth = 1;


        ctx2.beginPath();
        ctx2.lineWidth = 4;
        ctx2.strokeStyle = "blue";
        ctx2.moveTo(this.x-(this.size*x_scale/2),this.y-(this.size*x_scale*2));
        ctx2.lineTo(this.x-(this.size*x_scale/2)+((this.shotvel/2)*this.size*2*x_scale),this.y-(this.size*x_scale*2));
        ctx2.stroke();
        ctx2.strokeStyle = "black";
        ctx2.lineWidth = 1;
        }

        if(GameManager.currentPlayer ===  i || this.showhealth === true){

        // health

        ctx2.beginPath();
        ctx2.lineWidth = 4;
        ctx2.strokeStyle = "red";
        ctx2.moveTo(this.x-(this.size*x_scale/2),this.y-(this.size*x_scale));
        ctx2.lineTo(this.x-(this.size*x_scale/2)+(this.size*2*x_scale),this.y-(this.size*x_scale));
        ctx2.stroke();
        ctx2.strokeStyle = "black";
        ctx2.lineWidth = 1;


        ctx2.beginPath();
        ctx2.lineWidth = 4;
        ctx2.strokeStyle = "green";
        ctx2.moveTo(this.x-(this.size*x_scale/2),this.y-(this.size*x_scale));
        ctx2.lineTo(this.x-(this.size*x_scale/2)+((this.health/100)*this.size*2*x_scale),this.y-(this.size*x_scale));
        ctx2.stroke();
        ctx2.strokeStyle = "black";
        ctx2.lineWidth = 1;
        }


        // if(this.lastshot.length > 0){
        //     ctx2.beginPath();
        //     ctx2.moveTo(this.lastshot[0].x,this.lastshot[0].y);
        //     for(let pos of this.lastshot){
        //         ctx2.lineTo(pos.x,pos.y);
        //     }
        //     ctx2.stroke();
        // }
        
    }
}

const WEAPONTYPES = {
    typearray:[],

    types:{
        GrenadeLauncher:{
            name:"GrenadeLauncher",
            firerate:30,
            bullet:"projectile",
            projectile:"grenade",
        },
        BombLaucher:{
            name:"BombLaucher",
            firerate:20,
            bullet:"projectile",
            projectile:"bomb",
        },
        Drill:{
            name:"Drill",
            firerate:20,
            bullet:"drill",
            projectile:"none",
        },
        AtomBomb:{
            name:"AtomBomb",
            firerate:20,
            bullet:"projectile",
            projectile:"atombomb",
        },
        Cluster:{
            name:"Cluster",
            firerate:30,
            bullet:"projectile",
            projectile:"clusterbomb",
        },
        idk:{
            name:"idk",
            firerate:1,
            bullet:"projectile",
            projectile:"biggrenade",
        },
    },

    setup:function(){
        WEAPONTYPES.typearray = [];
        for(let type in WEAPONTYPES.types){
            WEAPONTYPES.typearray.push(WEAPONTYPES.types[type].name);
        }

        WEAPONTYPES.typearray.forEach(t=>{
            let ws = document.getElementById("weaponselect");
            let btn = document.createElement("button");
            btn.value = t;
            btn.innerHTML = t;
            btn.addEventListener("click",()=>{
                PLAYERS[GameManager.currentPlayer].currentWeapon = btn.value;
            });
            ws.appendChild(btn);

        })

    }

}
WEAPONTYPES.setup();



const PROJECTILETYPES = {

    smallgrenade:{
        vel:4,
        grav:0.1,
        size:1,
        expsize:18,
        drag:0.996,
        damage:5,
        bounce:5,
        cluster:false,
    },
    grenade:{
        vel:3.5,
        grav:0.1,
        size:1,
        expsize:20,
        drag:0.995,
        damage:10,
        bounce:10,
        cluster:false,
    },
    biggrenade:{
        vel:3.2,
        grav:0.2,
        size:1,
        expsize:32,
        drag:0.994,
        damage:20,
        bounce:15,
        cluster:false,
    },
    smallbomb:{
        vel:3.8,
        grav:0.1,
        size:1,
        expsize:20,
        drag:0.995,
        damage:10,
        bounce:false,
        cluster:false,
    },
    bomb:{
        vel:3.1,
        grav:0.1,
        size:1,
        expsize:30,
        drag:0.995,
        damage:20,
        bounce:false,
        cluster:false,
    },
    clusterbomb:{
        vel:3.1,
        grav:0.1,
        size:1,
        expsize:20,
        drag:0.995,
        damage:10,
        bounce:false,
        cluster:10,
    },
    atombomb:{
        vel:4,
        grav:0.3,
        size:1,
        expsize:50,
        drag:0.99,
        damage:50,
        bounce:false,
        cluster:false,
    }



    
}

class projectile {

    constructor(x,y,dir,type,velmult=1,parent){
        this.x = x;
        this.y = y;
        this.dir = dir;
        this.parent = parent;
        this.parent.lastshot = [];

        this.type = type;
        this.settype();
        this.starttime = Date.now();
        this.yga = 0;
        this.xvel = this.vel*velmult;
        this.yvel = this.vel*velmult;
        this.ya = 0;
        this.xa = 0;
        

        PROJECTILES.push(this);
    }

    update(i){
        
        let xpos = Math.floor(this.x/x_scale);
        let ypos = Math.floor(this.y/y_scale);

        if(this.x > canvas2.width){
            PROJECTILES.splice(i,1);
        }
        else if(this.x < 0){
            PROJECTILES.splice(i,1);
        }
        else if(this.y >= canvas2.height){
            PROJECTILES.splice(i,1);
        }
        else if(this.y < 0){
            PROJECTILES.splice(i,1);
        }else{
           
            
            if(LANDSCAPE[ypos][xpos].collision){
                let dTime= Date.now() - this.starttime;
                if(this.bounce === false || dTime > (this.bounce*1000)){
                    this.explode(i);
                }else{

                        // bounce collision

                    let yy = this.ya+this.yga;
                    let xx = this.xa;
                    const xy_flag ={x:false,y:false};

                    this.y -= yy;
                    ypos = Math.floor(this.y/y_scale);
                    xpos = Math.floor(this.x/x_scale);
                    if(LANDSCAPE[ypos][xpos].collision){
                        this.xvel *= -0.8;
                        xy_flag.y = true;
                        // 


                    }
                    this.y += yy;

                    this.x -= xx;
                    xpos = Math.floor(this.x/x_scale);
                    ypos = Math.floor(this.y/y_scale);
                    if(LANDSCAPE[ypos][xpos].collision){
                        this.yvel *= -0.8;
                        this.yga *=-0.6;
                        xy_flag.x = true;

                    }
                    this.x += xx;
                    
                    if(xy_flag.y || xy_flag.x){
                        this.x -= xx;
                        this.y -= yy;
                        if(xy_flag.y){this.y = ((ypos)*y_scale)+0.0001}
                    }
                    
                }
            }
            
            
            this.xvel *= this.drag; 
            this.yvel *= this.drag; 

            this.yga += this.grav;

            this.xa = Math.cos(this.dir)*this.xvel;
            this.ya = Math.sin(this.dir)*this.yvel;

            this.x += this.xa;
            this.y += this.ya+this.yga;
            // this.parent.lastshot.push({x:this.x,y:this.y});

        }

        
    }

    explode(i){

        PLAYERS.forEach(v=>{
            let pdistance = distance(v.x+(v.size/2*x_scale),this.x,v.y+(v.size/2*y_scale),this.y);
            if(pdistance < this.expsize*x_scale/2.15){
                v.damage( ((this.expsize*x_scale/2.15) / pdistance)*this.damage);
            }
        });
        createcricle(this.x,this.y,this.expsize);
        
        PROJECTILES.splice(i,1);
        if(this.cluster !== false){
            for(let i = 0;i<this.cluster ;i++){
                new projectile(this.x+(this.size/2*x_scale),this.y+(this.size/2*y_scale),this.dir+(Math.PI/(Math.random()+0.5)),"smallgrenade",Math.random(),this);
            }
        }

    }

    render(){
        ctx2.strokeStyle = "black";
        ctx2.strokeRect(this.x,this.y,this.size*x_scale,this.size*y_scale);
        ctx2.fillStyle = "white";
        ctx2.fillRect(this.x,this.y,this.size*x_scale,this.size*y_scale);
        ctx2.beginPath();
        ctx2.arc(10,10, this.size, 0,Math.PI*2);
        ctx2.stroke();

        if(this.bounce !== false){
            ctx2.font= "20px monospace" 
            ctx2.fillStyle = "red";
            ctx2.fillText(this.bounce-conv_time(Date.now() - this.starttime,2,4),this.x-(this.size*x_scale),this.y-(this.size*x_scale*2));
            ctx2.fillStyle = "black";
            
        }
    }

    settype(){
        this.vel = PROJECTILETYPES[this.type].vel;
        this.grav = PROJECTILETYPES[this.type].grav;
        this.size = PROJECTILETYPES[this.type].size;
        this.drag = PROJECTILETYPES[this.type].drag;
        this.expsize = PROJECTILETYPES[this.type].expsize;
        this.damage = PROJECTILETYPES[this.type].damage;
        this.bounce = PROJECTILETYPES[this.type].bounce;
        this.cluster = PROJECTILETYPES[this.type].cluster;
    }

}

class explosion_particle{
    
    constructor(x,y,dir,vel,grav,size,speeddeath){
        this.x = x-(size*x_scale/2);
        this.y = y-(size*y_scale/2);
        this.dir = dir;
        this.vel = vel;
        this.grav = grav;
        this.size = size+1;
        this.speeddeath = speeddeath;
        this.xa = 0;
        this.ya = 0;
        EXPL_PARTICLE.push(this);
    }

    update(i){
        let xpos = Math.floor(this.x/x_scale);
        let ypos = Math.floor(this.y/y_scale);

        this.xa += Math.cos(this.dir)*this.vel;
        this.ya += Math.sin(this.dir)*this.vel;

        if(this.grav !== "none"){
            this.ya += y_scale/this.grav; 
        }

        if(this.speeddeath !== "none"){
            if(this.vel < x_scale/this.speeddeath){
                EXPL_PARTICLE.splice(i,1);
            }
        }

        this.ya *= 0.9; 
        this.xa *= 0.9; 
        this.vel *= 0.9; 


        this.x += this.xa;
        this.y += this.ya;

        if(this.x > canvas2.width){
            EXPL_PARTICLE.splice(i,1);
        }
        if(this.x < 0){
            EXPL_PARTICLE.splice(i,1);
        }

        if(this.y >= canvas2.height){
            EXPL_PARTICLE.splice(i,1);
        }
        if(this.y < 0){
            EXPL_PARTICLE.splice(i,1);
        }

        if(ypos+this.size < land_y && xpos+this.size < land_x){
            for(let sizeposx= 0;sizeposx<this.size+1 ; sizeposx++){
            for(let sizeposy= 0;sizeposy<this.size+1 ; sizeposy++){  
                if((sizeposx === 0 || sizeposy === 0 || sizeposx === this.size || sizeposy === this.size) && LANDSCAPE[ypos+sizeposy][xpos+sizeposx].collision){
                    LANDSCAPE[ypos+sizeposy][xpos+sizeposx].changecolor("none",randomrange(50,90), LANDSCAPE[ypos+sizeposy][xpos+sizeposx].ligh / 1.5);
                }else{
                    LANDSCAPE[ypos+sizeposy][xpos+sizeposx].destroy();
                }
            }}       
        }

    }
    

    render(){
        ctx2.strokeStyle = "black";
        ctx2.strokeRect(this.x,this.y,this.size*x_scale,this.size*y_scale);
        
    }

}

function createexplosion(x,y,amount,size,range){
    for(let expl= 0; expl<amount;expl++){
        new explosion_particle(x,y,Math.random()*Math.PI*2,x_scale/(randomrange(size,size+10)+Math.random()),"none",3,range);
    }
}

function createrectanlge(x,y,width,height){
    for(let posy= 0;posy<height; posy++){  
    for(let posx= 0;posx<width; posx++){
        if(x+posx<land_x && y+posy < land_y){
            LANDSCAPE[x+posx][y+posy].destroy();
        }
    }}   
}

function createcricle(x,y,range){
   TEST.x = x;
   TEST.y = y;
   TEST.range = range*x_scale/2.15;
    x = Math.floor(x/x_scale)-Math.round(range/2);
    y = Math.floor(y/y_scale)-Math.round(range/2);
    for(let posy= 0;posy<range; posy++){  
    for(let posx= 0;posx<range; posx++){
        if(x+posx<land_x && y+posy < land_y && x+posx > 0 && y+posy > 0){
            let blockdist = distance(x+posx,x+(range/2),y+posy,y+(range/2));    
            if(blockdist < range/2.15){
                LANDSCAPE[y+posy][x+posx].destroy();
            }else if(blockdist < range/2){
                if(LANDSCAPE[y+posy][x+posx].collision  && randomrange(0,2)>0){
                    LANDSCAPE[y+posy][x+posx].changecolor("none",randomrange(50,90), LANDSCAPE[y+posy][x+posx].ligh / 2)
                }
            }
        }
        else{
            console.log(y,x,"outside errror");
        }
    }}   
}

const LANDGEN = {
    ygendata: [],
    blockgendata : [],
    finished : true,
    progress:0,
    progressHTML:document.getElementById("genprogress"),
    setprogress:function(value){
        LANDGEN.progress = value;
        LANDGEN.progressHTML.value = value;

    },
    roundland: function(l){
        l = l.map((v,i)=>{
            if(i >2 && i < l.length-3){
                return Math.round((l[i-1]+l[i-2]+l[i-3]+l[i+1]+l[i+2]+l[i+3])/6);
            }else{
                return v;
            }
            })
        return l;
    },
    generateYdata:function(first = false){
        console.time("ygen");
        LANDGEN.ygendata = []
        LANDGEN.ygendata.push(randomrange(land_y/3,land_y/1.5));
        LANDGEN.ygendata.push(LANDGEN.ygendata[0]+randomrange(-2,2));
        for(let x = 2; x<land_x;x++){
            switch(randomrange(0,10)){
                case 0:
                case 1:
                case 2:
                    LANDGEN.ygendata.push(LANDGEN.ygendata[x-1]+randomrange(-2,2));
                    break;
                case 3:
                case 4:
                case 6:
                    case 5:
                    LANDGEN.ygendata.push(LANDGEN.ygendata[x-1]+randomrange(-10,10));
                    break;
                case 7:
                case 8:
                case 9:
                    LANDGEN.ygendata.push(LANDGEN.ygendata[x-1]+randomrange(-1,1));
                    break;
                case 10:
                    LANDGEN.ygendata.push(LANDGEN.ygendata[x-1]+randomrange(-20,20));
                    break;
            }
    
            if((LANDGEN.ygendata[x-1] === LANDGEN.ygendata[x-2] || LANDGEN.ygendata[x-1]+1 === LANDGEN.ygendata[x-2]  || LANDGEN.ygendata[x-1]-1 === LANDGEN.ygendata[x-2]) ){
                LANDGEN.ygendata[x] = LANDGEN.ygendata[x-1]+randomrange(-2,2);
            }
            if(LANDGEN.ygendata[x] < 20 ){
            LANDGEN.ygendata[x] = 20;  
            }
            if(LANDGEN.ygendata[x] > land_y ){
                LANDGEN.ygendata[x] = land_y;  
            }
        }
        if(!first){PREVIEW.draw()}
        console.timeEnd("ygen");
        return LANDGEN.ygendata;
    },
    generateBlockdata:function (ygendata = LANDGEN.ygendata) {
        if(PLAYERSETUP.players.size >0){
            console.time("blockgen");
            elementvis("playerselect");
            elementvis("progressui", "flex");
            LANDGEN.finished = false;
            LANDGEN.progressHTML.max = land_y;
            ygendata = LANDGEN.roundland(ygendata);
            let landColor = randomrange(0, 255);

            for (let y = 0; y < land_y; y++) {
                setTimeout((y) => {
                    LANDGEN.blockgendata[y] = [];
                    for (let x = 0; x < land_x; x++) {
                        if (y < land_y - 4) {
                            if (y < ygendata[x]) {
                                LANDGEN.blockgendata[y].push(new block(0, 0, 100, x, y, false));
                            } else {
                                LANDGEN.blockgendata[y].push(new block(landColor, 60, ((((y - (ygendata[x])) + 20) / land_y) * 255 / 3), x, y, true));
                            }
                        } else {
                            LANDGEN.blockgendata[y].push(new block(0, 70, 35, x, y, true, false, true));
                        }
                    }
                    LANDGEN.setprogress(y);
                    if (y === land_y - 1) {
                        console.timeEnd("blockgen");
                        startgame();
                    }
                }, 0, y);
            }
        }else{
            alert("You need at least one player to play!")
        }

    },

}
LANDGEN.generateYdata(true);

const PREVIEW = {

    canvas:document.getElementById("preview"),
    ctx:null,
    setup:() => {
        PREVIEW.ctx = PREVIEW.canvas.getContext("2d");
        PREVIEW.canvas.width = PREVIEW.canvas.height = 200;
        PREVIEW.draw();

    },
    draw:()=>{
        let factor = PREVIEW.canvas.width/LANDGEN.ygendata.length
        PREVIEW.ctx.clearRect(0,0,PREVIEW.canvas.width,PREVIEW.canvas.height);
        PREVIEW.ctx.beginPath();
        PREVIEW.ctx.moveTo(0,PREVIEW.canvas.height);
        for(let i=0;i<LANDGEN.ygendata.length;i+=4){
            PREVIEW.ctx.lineTo(i*factor,LANDGEN.ygendata[i]);
        }
        PREVIEW.ctx.lineTo(PREVIEW.canvas.width,PREVIEW.canvas.height);
        PREVIEW.ctx.fill();

    },
}
PREVIEW.setup();

const PLAYERSETUP = {
    players: new Map(),
    playerlistHTML:document.getElementById("playersel"),
    COLORS:["red","blue","purple","green","yellow","orange","black"],
    addplayer:(name) => {
        let color = PLAYERSETUP.COLORS[randomrange(0,PLAYERSETUP.COLORS.length)];
        if(PLAYERSETUP.players.set(name,{name:name,color:color})){PLAYERSETUP.updatelist()}
    },
    removeplayer:(name)=>{
        if(PLAYERSETUP.players.delete(name)){PLAYERSETUP.updatelist()}
    },
    updatelist:()=>{
        PLAYERSETUP.playerlistHTML.innerHTML = "";
        PLAYERSETUP.players.forEach(v=>{
            let playerHTML = document.createElement("div");
            playerHTML.innerHTML = v.name;
            playerHTML.style.color = v.color;
            playerHTML.style.textShadow = "1px 1px 2px #333"
            playerHTML.classList.add("box");
            PLAYERSETUP.playerlistHTML.appendChild(playerHTML);
        })
    },
    spawnplayers:()=>{
        PLAYERSETUP.players.forEach(v=>{
            new player(v.name,v.color);
        })
    },

}

function randomrange(min, max) { 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function distance(x1,x2,y1,y2){
    return Math.sqrt(((x2-x1)**2)+((y2-y1)**2));
}

function conv_time(ms,a=0,e=0) {
    return new Date(ms).toISOString().slice(15+a, -1-e);
}

function elementvis(element_id,state="none"){
    let e = document.getElementById(element_id);
    e.style.display = state;
}

let lastRenderTime = 0;
let GameSpeed = 200;
let lastGameSpeed = 200;

const TEST = {x:0,y:0,x2:0,y2:0,width:10,height:10,range:10};


function startgame(){
    
        LANDSCAPE = LANDGEN.blockgendata;
        elementvis("game","flex");
        elementvis("startui");
        PLAYERSETUP.spawnplayers();
        window.requestAnimationFrame(main); 
}

function main(currentTime){
    window.requestAnimationFrame(main);
    const sslr = (currentTime- lastRenderTime)/1000
    if (sslr < 1 / GameSpeed) {return}
    lastRenderTime = currentTime;  
    update();
    render();

}

function update(){
    PLAYERS.forEach((v,i)=>v.update(i));
    EXPL_PARTICLE.forEach((v,i)=>v.update(i));
    PROJECTILES.forEach((v,i)=>v.update(i));
}

function render(){
    ctx2.clearRect(0,0,canvas2.width,canvas2.height);
    EXPL_PARTICLE.forEach(v=>v.render());
    PLAYERS.forEach((v,i)=>v.render(i));
    PROJECTILES.forEach(v=>v.render());
    GameManager.roundtimer.updatetime();

    // ctx2.beginPath();
    // ctx2.arc(TEST.x,TEST.y,TEST.range,0,Math.PI*2)
    // ctx2.stroke();
}


addEventListener("keydown", e => {
    // console.log("key: ",e.key);
    KEYS[e.key] = true;
});


addEventListener("keyup", e => {
    KEYS[e.key] = false;
});