package main

import (
        "encoding/json"
        "fmt"
        "strconv"

        "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// User represents a participant in the energy market
type User struct {
        XMax           []string `json:"xMax"`
        SurplusEnergy  []string `json:"surplusEnergy"`
        Prices         []string `json:"prices"`
        Identify       string   `json:"identify"`
        ClearPrice     []string `json:"clearPrice"`
        ClearQuantity  []string `json:"clearQuantity"`
}

// EnergyTradingContract implements energy trading functions
type EnergyTradingContract struct {
        contractapi.Contract
}

// InitLedger initializes the ledger with some users
func (c *EnergyTradingContract) InitLedger(ctx contractapi.TransactionContextInterface, usersJSON string, endKey string) error {
        var users []User
        err := json.Unmarshal([]byte(usersJSON), &users)
        if err != nil {
                return fmt.Errorf("failed to unmarshal users JSON: %v", err)
        }

        for i, user := range users {
                userJSON, err := json.Marshal(user)
                if err != nil {
                        return fmt.Errorf("failed to marshal user: %v", err)
                }

                err = ctx.GetStub().PutState("user"+strconv.Itoa(i), userJSON)
                if err != nil {
                        return fmt.Errorf("failed to put to world state: %v", err)
                }
        }

        return nil
}

// QueryUser retrieves a user from the world state by ID
func (c *EnergyTradingContract) QueryUser(ctx contractapi.TransactionContextInterface, userID string) (*User, error) {
        userJSON, err := ctx.GetStub().GetState(userID)
        if err != nil {
                return nil, fmt.Errorf("failed to read from world state: %v", err)
        }
        if userJSON == nil {
                return nil, fmt.Errorf("user %s does not exist", userID)
        }

        var user User
        err = json.Unmarshal(userJSON, &user)
        if err != nil {
                return nil, fmt.Errorf("failed to unmarshal user: %v", err)
        }

        return &user, nil
}

// AddUser adds a new user to the world state
func (c *EnergyTradingContract) AddUser(ctx contractapi.TransactionContextInterface, userJSON string) error {
        var user User
        err := json.Unmarshal([]byte(userJSON), &user)
        if err != nil {
                return fmt.Errorf("failed to unmarshal user JSON: %v", err)
        }

        userID := user.Identify
        userAsBytes, err := json.Marshal(user)
        if err != nil {
                return fmt.Errorf("failed to marshal user: %v", err)
        }

        return ctx.GetStub().PutState(userID, userAsBytes)
}

// Main function starts up the chaincode in the container during instantiate
func main() {
        energyTradingChaincode, err := contractapi.NewChaincode(&EnergyTradingContract{})
        if err != nil {
                fmt.Printf("Error creating energy trading chaincode: %s", err.Error())
                return
        }

        if err := energyTradingChaincode.Start(); err != nil {
                fmt.Printf("Error starting energy trading chaincode: %s", err.Error())
        }
}

