const fs = require('fs');

const seguidoresFile = './data/Seguidores.txt';
const seguindoFile = './data/Seguindo.txt';
const blackListFile = './data/Blacklist.txt';
const ignoreLines = ["·", "Seguir", "Remover", "Seguindo", 'Verificado']
const instagramURL = 'https://www.instagram.com/';

const GREY = "\x1b[90m%s\x1b[0m";
const GREEN = "\x1b[32m%s\x1b[0m";
const YELLOW = "\x1b[33m%s\x1b[0m";
const BLUE = "\x1b[34m%s\x1b[0m";
const RED = "\x1b[31m%s\x1b[0m";

const NOT_FOLLOWING = "Não me Seguem de volta";
const NOT_FOLLOWING_BACK = "Não sigo de volta";

const COMPLETE = "Lista Completa";
const FILTERED = "Lista Filtrada";


main();

function main() {
    getFollowObject(seguidoresFile, function(seguidores) {
        getFollowObject(seguindoFile, function(seguindo) {
            getBlackListArray(blackListFile, function(blackList) {
                var data = {
                    seguidores: seguidores,
                    seguindo: seguindo,
                    blackList: blackList
                }
                mainMenu(data);
            });
        });
    });
}

function getFollowObject(file, callback) {
    let result = {};
    let key = '';
    let val = '';
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) throw err;
        data.split('\n').forEach(line => {
            if (line.trim() == ''){
                if (key && !val){
                    result[key] = key;
                    key = '';
                }
            } else {
                if (!ignoreLines.includes(line.trim())) {
                    if (!key){
                        key = line.trim();
                    } else {
                        val = line.trim();
                        result[key] = val;
                        key = '';
                        val = '';
                    }
                }
            }
        });
        callback(result);
    });
}

function getBlackListArray(file, callback) {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) throw err;
        callback(data);
    });
}

function getUserInput() {
    return new Promise((resolve) => {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question("Digite: ", (userInput) => {
            rl.close();
            resolve(userInput);
        });
    });
}

async function mainMenu(data) {
    let seguidoresSize = Object.keys(data.seguidores).length;
    let seguindoSize = Object.keys(data.seguindo).length;
    let followData;

    console.log(BLUE, "\nInsta Bibs");
    if (seguidoresSize == 0 || seguindoSize == 0) {
        console.log(RED, "Carregue os arquivos de seguidores e seguindo antes de continuar.");
    } else {
        console.log(GREY, seguidoresSize + " Seguidores | " + seguindoSize + " Seguindo\n");
        console.log("1 - " + NOT_FOLLOWING);
        console.log("2 - " + NOT_FOLLOWING_BACK);
        console.log("0 - Sair\n");
        let userInput = await getUserInput();
        switch (userInput) {
            case "0":
            case "":
                process.exit();
            case "1":
                followData = compareObjects(data.seguindo, data.seguidores);
                if (data.blackList.length > 0) {
                    followMenu(data, followData, NOT_FOLLOWING);
                } else {
                    showList(data, followData, NOT_FOLLOWING, COMPLETE, true);
                }
                break;
            case "2":
                followData = compareObjects(data.seguidores, data.seguindo);
                if (data.blackList.length > 0) {
                    followMenu(data, followData, NOT_FOLLOWING_BACK);
                } else {
                    showList(data, followData, NOT_FOLLOWING_BACK, COMPLETE, true);
                }
                break;
            default:
                console.log(RED, "\nOpção inválida");
                await new Promise(resolve => setTimeout(resolve, 1000));
                mainMenu(data);
        }
    }
}

function compareObjects(obj1, obj2) {
    let result = {};
    for (let key in obj1) {
        if (!obj2.hasOwnProperty(key)) {
            result[key] = obj1[key];
        }
    }
    return result;
}

async function followMenu(data, followData, followType){
    let size = Object.keys(followMenu).length;
    console.log(GREEN, "\n" + followType);
    console.log(GREY, size + " Usuários\n");
    console.log("1 - " + COMPLETE);
    console.log("2 - " + FILTERED);
    console.log("0 - Voltar\n");
    let userInput = await getUserInput();
    switch (userInput) {
        case "0":
        case "":
            mainMenu(data);
            break;
        case "1":
            showList(data, followData, followType, COMPLETE);
            break;
        case "2":
            showList(data, followData, followType, FILTERED);
            break;   
        default:
            console.log(RED, "\nOpção inválida");
            await new Promise(resolve => setTimeout(resolve, 1000));
            followMenu(data, followType, followData);
    }
}

async function showList(data, obj, followType, listType, completeOnly=false) {
    let blacklistCheck = false;
    let oppositeList = FILTERED;
    if (listType == FILTERED) {
        blacklistCheck = true;
        oppositeList = COMPLETE;
    }
    if (blacklistCheck && data.blackList.length == 0) {
        console.log(YELLOW, "\nCarregue a lista de usuários ignorados antes de continuar.");
        await new Promise(resolve => setTimeout(resolve, 1000));
        mainMenu(data);
    } else {
        let arr = [];
        let complementTitle = completeOnly ? "" : " - " + followType;
        console.log(GREEN, "\n" + followType + complementTitle);
        for (let key in obj) {
            if (!blacklistCheck || !data.blackList.includes(key)) {
                let text = obj[key] + ": " + instagramURL + key;
                arr.push(text);
            }
        }
        arr.sort();
        arr.forEach(function(element) {
            console.log(element);
        });
        console.log("\n1 - Exportar Lista");
        if (!completeOnly){
            console.log("2 - Ver " + oppositeList);
        }
        console.log("0 - Voltar ao Menu");
        let userInput = await getUserInput();
        switch (userInput) {
            case "0":
            case "":
                mainMenu(data);
                break;  
            case "1":
                exportArray(arr, followType + " - " + listType);
                await new Promise(resolve => setTimeout(resolve, 1000));
                mainMenu(data);
                break;
            case "2":
                if (!completeOnly){
                    showList(data, obj, followType, oppositeList)
                } else {
                    console.log("\nOpção inválida");
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    mainMenu(data);
                }
            default:
                console.log("\nOpção inválida");
                await new Promise(resolve => setTimeout(resolve, 1000));
                mainMenu(data);
        }
    }
}

async function exportArray(arr, followType) {
    let data = arr.join('\n');
    fs.writeFile(followType + '.txt', data, (err) => {
        if (err) throw err;
        console.log(GREY, '\nArquivo Salvo com Sucesso');
    });
}

