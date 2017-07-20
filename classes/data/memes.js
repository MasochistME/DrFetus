﻿var Post = require('../post.js');

exports.Memes = function (data) {
    var memes = this;
    var post = new Post.Post(data);
    var memesPath = '../data/memes.json';
    var fs = require('fs');

    memes.add = function () {
        var Input = require('../input.js');
        var input = new Input.Input();
        var newMeme = input.removeKeyword(data.message.content);

        fs.readFile(memesPath, 'utf8', (err, memesJson) => {
            if (err) {
                post.message(`:no_entry: Something went wrong <:SMB4:310138833377165312>`);
                return console.log(`Reading meme file: ${err}`);
            };
            memesJson = JSON.parse(memesJson);
            memesJson.Memes.push(newMeme);
            fs.writeFile(memesPath, JSON.stringify(memesJson), err => {
                if (err) {
                    post.message(`:no_entry: Something went wrong <:SMB4:310138833377165312>`);
                    return console.log(`Writing memes file: ${err}`);
                };
                return post.message(`New meme added!`);
            });
        });
    };
    memes.delete = function () {
        var Input = require('../input.js');
        var input = new Input.Input();
        var memeIndex = input.removeKeyword(data.message.content);
        try {
            memeIndex = parseInt(memeIndex);
        }
        catch(err){
            return post.embed(`:warning: Incorrect input`, [[`___`, `Argument given by you is not a number. The correct syntax is ` +
                `\`\`/deletememe <memeindex>\`\`, for example \`\`/deletememe 14\`\`.`, false]]);
        }
        fs.readFile(memesPath, 'utf8', (err, memesJson) => {
            if (err) {
                post.message(`:no_entry: Something went wrong <:SMB4:310138833377165312>`);
                return console.log(`Reading meme file: ${err}`);
            };
            memesJson = JSON.parse(memesJson);
            try {
                memesJson.Memes.splice(parseInt(memeIndex-1), 1);
                fs.writeFile(memesPath, JSON.stringify(memesJson), err => {
                    if (err) {
                        post.message(`:no_entry: Something went wrong <:SMB4:310138833377165312>`);
                        return console.log(`Writing memes file: ${err}`);
                    };
                    return post.message(`Meme removed!`);
                });
            }
            catch (err) {
                return post.embed(`:warning: You fucked something up.`, [[`___`, `Is using a simple command so hard to you? \n${err}`, false]]);
            }
        });
    };
    memes.show = function () {
        var RNG = require('../RNG.js');
        var rng = new RNG.RNG();
        var meme = '';

        fs.readFile(memesPath, 'utf8', (err, memesJson) => {
            if (err) {
                post.message(`:no_entry: Something went wrong <:SMB4:310138833377165312>`);
                return console.log(`Reading meme file: ${err}`);
            };
            memesJson = JSON.parse(memesJson);
            meme = `_"${memesJson.Memes[rng.chooseRandom(memesJson.Memes.length)]}"_`;
            return post.message(meme);
        });
    };
    memes.showList = function () {
        var memeList = '';

        fs.readFile(memesPath, 'utf8', (err, memesJson) => {
            if (err) {
                post.message(`:no_entry: Something went wrong <:SMB4:310138833377165312>`);
                return console.log(`Reading meme file: ${err}`);
            };
            memesJson = JSON.parse(memesJson);
            for (i in memesJson.Memes) {
                if (memeList.length + memesJson.Memes[i].length > 1950) {
                    post.message(memeList);
                    memeList = '';
                }
                memeList += `**${parseInt(i)+1}** - ${memesJson.Memes[i]}\n`;
            }
            return post.message(memeList);
        });
    };
};