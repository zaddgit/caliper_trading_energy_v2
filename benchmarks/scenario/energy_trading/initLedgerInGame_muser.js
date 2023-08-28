module.exports.createWorkloadModule = function() {
    let bc;
    let contx;
    return {
        info: 'initLedgerInGame',
        init: function(blockchain, context, args) {
            bc = blockchain;
            contx = context;
            return Promise.resolve();
        },
        run: function() {
            let numberOfSeller = 3;
            let numberOfBuyer = 3;
            var minQuantity = 0.1, maxQuantity = 5;
            var minPriceB = 14, maxPriceB = 22;
            var userInfoArr = [];

            // include node fs module
            var fs = require('fs');
            let i = 0;
            while (i < numberOfBuyer) {
                i += 1
                let rdQuantity = (Math.random() * (maxQuantity - minQuantity) + minQuantity).toFixed(3)
                let rdPrice = (Math.random() * (maxPriceB - minPriceB) + minPriceB).toFixed(1)
                let idNumber = padLeadingZeros(i, 4);
                let content = 'import sys \n';
                content += 'lamda = [4] * 13\n';
                content += `xmaxUser${idNumber} = [${rdQuantity},0,0,0,0,0,0,0,0,0,0,0,0]\n`;
                content += `surplusEnergyUser${idNumber} = [0,0,0,0,0,0,0,0,0,0,0,0,0]\n`;
                content += `lamdaUser${idNumber} = lamda\n`;
                content += `pricesUser${idNumber} = [${rdPrice},0,0,0,0,0,0,0,0,0,0,0,0]\n`;
                content += 'p = float(sys.argv[1])\n';
                content += 't = int(sys.argv[2])\n';
                content += `x = (pricesUser${idNumber}[t] - p)/lamdaUser${idNumber}[t]\n`;
                content += 'if x < 0:\n';
                content += '    x = 0\n';
                content += `elif x > xmaxUser${idNumber}:\n`;
                content += `    x = xmaxUser${idNumber}\n`;
                content += 'print(str(x))\n';
                content += 'sys.stdout.flush()\n';
                fs.writeFile(`//home//moonzad//go//src//github.com//zaddgit//caliper-benchmarks//data//user${idNumber}.py`, content, function (err) {
                  if (err) throw err;
                  // console.log('File is created successfully.');
                });

                //generate user info
                var individualUser = {};
                individualUser["xMax"] = [rdQuantity,"0","0","0","0","0","0","0","0","0","0","0","0"];
                individualUser["surplusEnergy"] = ["0","0","0","0","0","0","0","0","0","0","0","0","0"];
                individualUser["prices"] = [rdPrice,"0","0","0","0","0","0","0","0","0","0","0","0"];
                individualUser["identify"] = `user${idNumber}`;
                individualUser["clearPrice"] = ["0","0","0","0","0","0","0","0","0","0","0","0","0"];
                individualUser["clearQuantity"] = ["0","0","0","0","0","0","0","0","0","0","0","0","0"];
                userInfoArr.push(individualUser);
            }

            var minPriceS = 5, maxPriceS = 13;
            let j = i;
            while (j < numberOfSeller + numberOfBuyer) {
                j += 1
                let rdQuantity = (Math.random() * (maxQuantity - minQuantity) + minQuantity).toFixed(3)
                let rdPrice = (Math.random() * (maxPriceS - minPriceS) + minPriceS).toFixed(1)
                let idNumber = padLeadingZeros(j, 4);
                let content = 'import sys \n';
                content += 'lamda = [4] * 13\n';
                content += `xmaxUser${idNumber} = [0,0,0,0,0,0,0,0,0,0,0,0,0]\n`;
                content += `surplusEnergyUser${idNumber} = [${rdQuantity},0,0,0,0,0,0,0,0,0,0,0,0]\n`;
                content += `lamdaUser${idNumber} = lamda\n`;
                content += `pricesUser${idNumber} = [${rdPrice},0,0,0,0,0,0,0,0,0,0,0,0]\n`;
                content += 'p = float(sys.argv[1])\n';
                content += 't = int(sys.argv[2])\n';
                content += `x = (pricesUser${idNumber}[t] - p)/lamdaUser${idNumber}[t]\n`;
                content += 'if x < 0:\n';
                content += '    x = 0\n';
                content += `elif x > xmaxUser${idNumber}:\n`;
                content += `    x = xmaxUser${idNumber}\n`;
                content += 'print(str(x))\n';
                content += 'sys.stdout.flush()\n';
                fs.writeFile(`//home//moonzad//go//src//github.com//zaddgit//user${idNumber}.py`, content, function (err) {
                  if (err) throw err;
                  // console.log('File is created successfully.');
                });

                //generate user info
                var individualUser = {};
                individualUser["xMax"] = ["0","0","0","0","0","0","0","0","0","0","0","0","0"];
                individualUser["surplusEnergy"] = [rdQuantity,"0","0","0","0","0","0","0","0","0","0","0","0"];
                individualUser["prices"] = [rdPrice,"0","0","0","0","0","0","0","0","0","0","0","0"];
                individualUser["identify"] = `user${idNumber}`;
                individualUser["clearPrice"] = ["0","0","0","0","0","0","0","0","0","0","0","0","0"];
                individualUser["clearQuantity"] = ["0","0","0","0","0","0","0","0","0","0","0","0","0"];
                userInfoArr.push(individualUser);
            }

            // console.log(userInfoArr)
            let endKey = `user${padLeadingZeros(numberOfSeller + numberOfBuyer + 1, 4)}`;
            let args = {
                chaincodeFunction: 'initLedger',
                chaincodeArguments: [JSON.stringify(userInfoArr),endKey]
            };

            return bc.invokeSmartContract(contx, 'smartcontract_v1', '1.0', args, 50);
        },
        end: function() {
            return Promise.resolve();
        }
    };
};

function padLeadingZeros(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

