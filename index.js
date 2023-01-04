const Discord = require('discord.js')
const Canvas = require('canvas')
const client = new Discord.Client()
const fs = require('fs');
const pokejson = JSON.parse(fs.readFileSync('pokemon.json'));

client.on('ready', () => {
  client.user.setActivity("p.help");
})

client.on('message', msg => {
	if(msg.author.id=="705016654341472327") pokemon(msg); //pokecord
	if(msg.author.bot) return; //ignore all bot messages
	if(msg.content.startsWith("p.")) scmd(msg); //bot commands
	else pokeguess(msg);
})

//pokemon processor
async function pokemon(msg) {
	try {
		var isPoke = false;
		try { isPoke = (msg.embeds[0].title+"").includes("Info"); } catch (err) {}
		if(msg.embeds==undefined || msg.embeds[0]==undefined || msg.embeds[0].image==undefined || !isPoke) return;
		
		const canvas1 = Canvas.createCanvas(475,475);
		const ctx1 = canvas1.getContext('2d');
		const png1 = await Canvas.loadImage(msg.embeds[0].image.url);
		ctx1.drawImage(png1,0,0,475,475);
	    var imageData1 = ctx1.getImageData(0,0,475,475);
	    var data1 = imageData1.data;
	    var r=0, g=0, b=0;
	    for(var x=0; x<475; x++) {
	    	for(var y=0; y<475; y++) {
	    		r += data1[((475*y)+x)*4];
	    		g += data1[((475*y)+x)*4+1];
	    		b += data1[((475*y)+x)*4+2];
	    	}
	    }
	    console.log(r+" "+g+" "+b);
		for(var i=0; i<936; i++) {
	    	var split = pokejson.map[i].split(' - ');
			var col = split[1].split(' ');
	    	var ri = parseInt(col[0]);
	    	var gi = parseInt(col[1]);
	    	var bi = parseInt(col[2]);
	    	if(Math.abs(col[0]-r)<=5 && Math.abs(col[1]-g)<=5 && Math.abs(col[2]-b)<=5) {
	    		console.log("p!catch "+split[0]);
	    		var proc = require('child_process').spawn('pbcopy');
	    		proc.stdin.write("p!catch "+split[0]); proc.stdin.end();
	    		msg.channel.send("||"+split[0]+"||");
	    		//used to paste the pokemon into your copy and paste - put your own user id
	    		//client.users.get("user id").send("p!catch "+pokejson.pokenames[i]);
	    		return;
	    	}
	    }
	} catch(err) {}
}

//process commands
function scmd(msg) {
	var split = msg.content.substring(2).split(" ");
	if(split[0]=="pokemon") pokecmd(msg);
	if(split[0]=="help") help(msg);
}

//help message
function help(msg) {
	msg.channel.send({ embed: {
		color: 0xe04a36,
		fields: [
		{
			name: "Command List",
			value: "Here is a list of functions."
		},
		{
			name: "Pokemon Identifier",
			value: "The bot will produce the name of the newest spawned Pokemon in the chat for the bot Pokecord (https://pokecord.xyz/)."
		},
		{
			name: "Pokemon Guessing Game",
			value: "`p.pokemon new` spawns a new Pokemon to guess. Guess by typing the name into the chat!\n `p.pokemon hint` gives a hint for the current pokemon. \n `p.pokemon end` stops the current guess."
		}]
	}});
}

//guess a pokemon
function pokeguess(msg) {
	var pokemon = "";
	for(let entry of curpokes) {
		if(entry[0]==msg.channel) {
			pokemon = entry[1];
			break;
		}
	}
	if(pokemon=="") return;
	if(msg.content.toUpperCase()!=pokemon.toUpperCase()) {
   		msg.channel.send({ embed: {
		    color: 0xe04a36,
		    fields: [{
				name: msg.member.user.tag,
				value: "Sorry, that is not the correct pokemon."
			}]
		}});
	} else {
		msg.channel.send({ embed: {
		    color: 0x49e656,
		    fields: [{
				name: msg.member.user.tag,
				value: "Congratulations, that is the correct pokemon!"
			}]
		}});
		var newcurpokes = [];
		for(let entry of curpokes) {
			if(entry[0]!=msg.channel) {
				newcurpokes.push(entry);
			}
 		}
 		curpokes = newcurpokes;
	}
}

//pokemon commands
var curpokes = [];
function pokecmd(msg) {
	var split = msg.content.split(' ');
	var channel = msg.channel;
	if(split[1]=="new") {
		for(let entry of curpokes) {
			if(entry[0]==channel) {
				msg.channel.send({ embed: {
			        color: 3447003,
			        fields: [{
						name: "There is already a pokemon in this channel!",
						value: "If you want to give up, type `p.pokemon end`."
					}]
			    }});
				return;
			}
		}
		var pokenumber = Math.ceil(Math.random()*(936));
		msg.channel.send(new Discord.Attachment("pokemon/"+pokenumber+".png"));
		var pokename = pokejson.map[pokenumber-1].split(' - ')[0];
		curpokes.push([channel,pokename,false,""]);
	} else if(split[1]=="end") {
		var newcurpokes = [];
		var pokename = "";
		for(let entry of curpokes) {
			if(entry[0]!=channel) {
				newcurpokes.push(entry);
			} else {
				pokename = entry[1];
			}
		}
		if(pokename!="") {
    		msg.channel.send({ embed: {
		        color: 3447003,
		        fields: [{
					name: "The pokemon was "+pokename+".",
					value: "If you want another pokemon to guess, type `p.pokemon new`."
				}]
		    }});
			curpokes = newcurpokes;
		} else {
    		msg.channel.send({ embed: {
		        color: 0xeb6844,
		        fields: [{
					name: "There is no pokemon to guess in this channel!",
					value: "If you want a pokemon to guess, type `p.pokemon new`."
				}]
		    }});
		}
	} else if(split[1]=="hint") {
		var pokename = "";
		var value = null;
		for(let entry of curpokes) {
			if(entry[0]==channel) {
				value = entry;
				break;
			}
		}
		if(value==null) {
			msg.channel.send({ embed: {
		        color: 0xeb6844,
		        fields: [{
					name: "There is no pokemon to guess in this channel!",
					value: "If you want a pokemon to guess, type `p.pokemon new`."
				}]
		    }});
		    return;
		}
		if(value[2]==true) {
    		msg.channel.send({ embed: {
		        color: 3447003,
		        fields: [{
					name: "A hint has already been given!",
					value: "The hint was: `"+value[3]+"`"
				}]
		    }});
			return;
		}
		value[2] = true;
		var pokename = value[1];
		var length = pokename.length;
		var hint = Math.ceil(length/3);
		var used = [];
		while(hint>0) {
			var i = Math.floor(Math.random()*length);
			while(used[i]) {
				i = Math.floor(Math.random()*length);
			}
			used[i] = true;
			hint--;
		}
		var display = "";
		for(var i=0; i<length; i++) {
			if(used[i]) display += pokename[i];
			else display += "_";
			display+=" ";
		}
		display = display.substring(0,display.length-1);
		msg.channel.send({ embed: {
		    color: 3447003,
		    fields: [{
				name: "Here is a hint:",
				value: "`"+display+"`"
			}]
		}});
		value[3]=display;
	}
}

client.login('[secret here]');
