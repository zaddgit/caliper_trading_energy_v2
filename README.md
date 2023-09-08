./network.sh up createChannel -ca  
#to packe the chaincode 
peer lifecycle chaincode package smartcontract.tar.gz --path ../../caliper-benchmarks/chaincodes/ --lang golang --label smartcontract_1.0

peer lifecycle chaincode calculatepackageid smartcontract.tar.gz
#install chaincode 
peer lifecycle chaincode install smartcontract.tar.gz
#approve the chaincode into the Orgs
peer lifecycle chaincode approveformyorg --orderer localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name smartcontract --version 1.0 --init-required --package-id smartcontract_1.0:e2cc8066842393cd364c549525fcd934681e8bf549372cfef05138b5c464bd64 --sequence 1 --tls --cafile /home/moonzad/go/src/github.com/zaddgit/fabric-samples/test-network/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem  --signature-policy "OR('Org1MSP.peer','Org2MSP.peer')"
#check if approved
peer lifecycle chaincode checkcommitreadiness --channelID mychannel --name smartcontract --version 1.0 --init-required --sequence 1 --tls --cafile /home/moonzad/go/src/github.com/zaddgit/fabric-samples/test-network/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem --signature-policy "OR('Org1MSP.peer','Org2MSP.peer')"
#if one org approved the other not,cheque the /scripts-ENV execute the one that didn't, example: ./setOrg1Env.sh and approve again
peer lifecycle chaincode approveformyorg --orderer localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name smartcontract --version 1.0 --init-required --package-id smartcontract_1.0:e2cc8066842393cd364c549525fcd934681e8bf549372cfef05138b5c464bd64 --sequence 1 --tls --cafile /home/moonzad/go/src/github.com/zaddgit/fabric-samples/test-network/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem --signature-policy "OR('Org1MSP.peer','Org2MSP.peer')"
#commit the chaincode 
peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name smartcontract --version 1.0 --init-required --sequence 1 --tls --cafile /home/moonzad/go/src/github.com/zaddgit/fabric-samples/test-network/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem --peerAddresses localhost:7051 --tlsRootCertFiles /home/moonzad/go/src/github.com/zaddgit/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles /home/moonzad/go/src/github.com/zaddgit/fabric-samples/test-network/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt --signature-policy "OR('Org1MSP.peer','Org2MSP.peer')"
#query if commited
peer lifecycle chaincode querycommitted --channelID mychannel --name smartcontract

#create the users for users.json
json_content=$(cat workload/users.json | tr -d '\n' | sed 's/"/\\"/g') 

