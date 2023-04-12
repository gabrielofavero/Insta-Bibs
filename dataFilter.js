const fs = require('fs');

const seguidoresFile = './data/Seguidores.txt';
const seguindoFile = './data/Seguindo.txt';
const ignoreLines = ["·", "Seguir", "Remover", "Seguindo", 'Verificado', "Seguidores", "Pessoas", "Hashtags"]
const separator = "Foto do perfil de";

main();

function main() {
    getFollowObject(seguidoresFile, function(seguidores) {
        exportArray(seguidores, "Seguidores");
    });
    getFollowObject(seguindoFile, function(seguindo) {
        exportArray(seguindo, "Seguindo");  
    });
}

function getFollowObject(file, callback) {
    let result = [];
    dataBak = "";
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) throw err;
        data.split('\n').forEach(line => {
            let clearLine = line.trim().replace("/r", "");
            if (dataBak) {
                let value;
                if (checkWord(clearLine)){
                    value = clearLine;
                } else {
                    value = dataBak;
                }
                result.push(value);
                dataBak = "";
            } else if (checkWord(clearLine)){
                result.push(clearLine);
                dataBak = clearLine;
            }
        });
        callback(result);
    });
}

function checkWord(clearLine) {
    return (!clearLine.includes(separator) && !ignoreLines.includes(clearLine) && clearLine != '');
}

async function exportArray(arr, followType) {
    let data = arr.join('\n');
    fs.writeFile("./data/filtered/" + followType + '.txt', data, (err) => {
        if (err) throw err;
        console.log('Arquivo filtrado de ' + followType +  ' salvo com sucesso');
    });
}

