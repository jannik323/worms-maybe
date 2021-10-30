"use strict";

let canvas1 = document.getElementById("canvas1");
canvas1.width = 1000;
canvas1.height = 600;


let canscale = canvas1.width/canvas1.height;

let landsize = 300;
let land_x = Math.round(landsize*canscale);
let land_y = Math.round(landsize);

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




}

class player{

    constructor(x=0,y=0){
        this.x = x ; 
        this.y = y ;
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
        PLAYERS.push(this);        
    }

    update(i){

        if(this.health < 0){
            PLAYERS.splice(i,1);
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

    grenade:{
        vel:3.5,
        grav:0.1,
        size:1,
        expsize:20,
        drag:0.995,
        damage:10,
    },
    bomb:{
        vel:3,
        grav:0.1,
        size:1,
        expsize:30,
        drag:0.995,
        damage:20,
    },
    atombomb:{
        vel:2.8,
        grav:0.1,
        size:1,
        expsize:100,
        drag:0.995,
        damage:50,
    },
    fuckyou:{
        vel:4,
        grav:0.1,
        size:1,
        expsize:300,
        drag:0.995,
        damage:80,
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
        this.ya = 0;
        this.vel = this.vel*velmult;
         

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
           
            this.vel *= this.drag; 
            
            this.ya += this.grav;

            if(LANDSCAPE[ypos][xpos].collision){
                PLAYERS.forEach(v=>{
                    let pdistance = distance(v.x+(v.size/2*x_scale),this.x,v.y+(v.size/2*y_scale),this.y);
                    if(pdistance < this.expsize*x_scale/2.15){
                        v.damage( ((this.expsize*x_scale/2.15) / pdistance)*this.damage);
                    }
                });
                createcricle(this.x,this.y,this.expsize);
                
                PROJECTILES.splice(i,1);
            }

            

            this.x += Math.cos(this.dir)*this.vel;
            this.y += (Math.sin(this.dir)*this.vel)+this.ya;
            // this.parent.lastshot.push({x:this.x,y:this.y});

        }

        
    }

    render(){
        ctx2.strokeStyle = "black";
        ctx2.strokeRect(this.x,this.y,this.size*x_scale,this.size*y_scale);
        ctx2.fillStyle = "white";
        ctx2.fillRect(this.x,this.y,this.size*x_scale,this.size*y_scale);
        ctx2.arc(10,10, this.size, 0,Math.PI*2)
    }

    settype(){
        this.vel = PROJECTILETYPES[this.type].vel;
        this.grav = PROJECTILETYPES[this.type].grav;
        this.size = PROJECTILETYPES[this.type].size;
        this.drag = PROJECTILETYPES[this.type].drag;
        this.expsize = PROJECTILETYPES[this.type].expsize;
        this.damage = PROJECTILETYPES[this.type].damage;
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

function generateland(){
    let genyland = []
    genyland.push(randomrange(land_y/3,land_y/1.5));
    for(let x = 1; x<land_x;x++){
        switch(randomrange(0,10)){
 
            case 0:
                case 1:
                case 2:
                genyland.push(genyland[x-1]+randomrange(-2,2));
                break;
            case 3:
            case 4:
                case 6:
                genyland.push(genyland[x-1]+randomrange(-6,6));
                break;
            case 5:
            case 7:
            case 8:
                case 9:
                genyland.push(genyland[x-1]+randomrange(-1,1));
                break;
            case 10:
                genyland.push(genyland[x-1]+randomrange(-30,30));
                break;




        }


        if(genyland[x] < 0 ){
        genyland[x] = 0;  
        }
        if(genyland[x] > land_y ){
            genyland[x] = land_y;  
            }
    }
    return genyland;
}

function roundland(l){
    l = l.map((v,i)=>{
        if(i >2 && i < l.length-3){
            return Math.round((l[i-1]+l[i-2]+l[i-3]+l[i+1]+l[i+2]+l[i+3])/6);
        }else{
            return v;
        }
        })
    return l
}

function generatLandscape(){

    let generatedland = generateland();
    generatedland = roundland(generatedland);
    let landColor = randomrange(0,255); 
    
    for(let y = 0; y < land_y; y++){
        LANDSCAPE[y] = [];
        for(let x = 0; x < land_x; x++){
            if(y<land_y-4){
                if(y< generatedland[x]){
                    LANDSCAPE[y].push(new block(0,0,100,x,y,false));
                }else{
                    LANDSCAPE[y].push(new block(landColor,60,((((y-(generatedland[x]))+20)/land_y)*255/3),x,y,true)); 
                }
            }else{
                LANDSCAPE[y].push(new block(0, 70, 35,x,y,true,false,true));
            }
        }
    }   

}

function randomrange(min, max) { 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function distance(x1,x2,y1,y2){
    return Math.sqrt(((x2-x1)**2)+((y2-y1)**2));
}

let lastRenderTime = 0;
let GameSpeed = 200;
let lastGameSpeed = 200;
const LANDSCAPE = [];

const TEST = {x:0,y:0,x2:0,y2:0,width:10,height:10,range:10};

startgame();


function startgame(){

    generatLandscape();
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