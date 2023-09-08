##start the network
	
	./network.sh up createChannel -ca	
# from caliper-benchmark directory 
	nano networks/fabric/caliper_network.yaml
#Update the keystore for org1 and org2 ,its a key that end with _kv and save
## return to the running network
	cd ../fabric-samples/test-network
#to package the chaincode 

	peer lifecycle chaincode package smartcontract.tar.gz --path ../../caliper-benchmarks/chaincodes/ --lang golang --label smartcontract_1.0

	peer lifecycle chaincode calculatepackageid smartcontract.tar.gz
#install chaincode 

	peer lifecycle chaincode install smartcontract.tar.gz
#approve the chaincode into the Organizations ,and update the package-id and the path for --cafile for example: /home/badr/...

	peer lifecycle chaincode approveformyorg --orderer localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name smartcontract --version 1.0 --init-required --package-id smartcontract_1.0:e2cc8066842393cd364c549525fcd934681e8bf549372cfef05138b5c464bd64 --sequence 1 --tls --cafile /home/moonzad/go/src/github.com/zaddgit/fabric-samples/test-network/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem  --signature-policy "OR('Org1MSP.peer','Org2MSP.peer')"
#check if approved
	
	peer lifecycle chaincode checkcommitreadiness --channelID mychannel --name smartcontract --version 1.0 --init-required --sequence 1 --tls --cafile /home/moonzad/go/src/github.com/zaddgit/fabric-samples/test-network/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem --signature-policy "OR('Org1MSP.peer','Org2MSP.peer')"
#if approved by the org1MSP :true and org2MSP:false 

	source ../../caliper-benchmarks/scripts_Env/setOrg2Env.sh
#else

	source ../../caliper-benchmarks/scripts_Env/setOrg1Env.sh

# approve the next org, ps:change the CA path and package-id first 

	peer lifecycle chaincode approveformyorg --orderer localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name smartcontract --version 1.0 --init-required --package-id smartcontract_1.0:e2cc8066842393cd364c549525fcd934681e8bf549372cfef05138b5c464bd64 --sequence 1 --tls --cafile /home/moonzad/go/src/github.com/zaddgit/fabric-samples/test-network/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem --signature-policy "OR('Org1MSP.peer','Org2MSP.peer')"
## check again if both org approved ,like this 
#Chaincode definition for chaincode 'smartcontract', version '1.0', sequence '1' on channel 'mychannel' approval status by org:
Org1MSP: true
Org2MSP: true

#commit the chaincode 

	peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name smartcontract --version 1.0 --init-required --sequence 1 --tls --cafile /home/moonzad/go/src/github.com/zaddgit/fabric-samples/test-network/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem --peerAddresses localhost:7051 --tlsRootCertFiles /home/moonzad/go/src/github.com/zaddgit/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles /home/moonzad/go/src/github.com/zaddgit/fabric-samples/test-network/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt --signature-policy "OR('Org1MSP.peer','Org2MSP.peer')"
# result :2023-09-08 21:12:22.088 +01 0001 INFO [chaincodeCmd] ClientWait -> txid [3cfcb41ff4e8987fd6535014ee95177753283e61e573b06265a5b660b439761a] committed with status (VALID) at localhost:7051
2023-09-08 21:12:22.092 +01 0002 INFO [chaincodeCmd] ClientWait -> txid [3cfcb41ff4e8987fd6535014ee95177753283e61e573b06265a5b660b439761a] committed with status (VALID) at localhost:9051

# install the chaincode 

	peer lifecycle chaincode install smartcontract.tar.gz
 # to init users into the Ledger 

 	json_content=$(cat workload/users.json | tr -d '\n' | sed 's/"/\\"/g')
  	
 
#invoke the chaincode ,ps:change the paths 

	peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile /home/moonzad/go/src/github.com/zaddgit/fabric-samples/test-network/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem -C mychannel -n smartcontract --peerAddresses localhost:7051 --tlsRootCertFiles /home/moonzad/go/src/github.com/zaddgit/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles /home/moonzad/go/src/github.com/zaddgit/fabric-samples/test-network/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt --isInit -c "{\"function\":\"InitLedger\",\"Args\":[\"$json_content\"]}"

#result :2023-09-08 21:24:46.743 +01 0001 INFO [chaincodeCmd] chaincodeInvokeOrQuery -> Chaincode invoke successful. result: status:200

#change directory to caliper-benchmark 

	cd ../../caliper-benchmarks/
 ##start the caliper ,ASWS and Stackelberg game (workload)

 	./start-energy-trading.sh
