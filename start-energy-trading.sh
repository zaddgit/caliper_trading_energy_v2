echo
echo " ____    _____      _      ____    _____ "
echo "/ ___|  |_   _|    / \    |  _ \  |_   _|"
echo "|___ \    | |     / _ \   | |_) |   | |  "
echo " ___) |   | |    / ___ \  |  _ <    | |  "
echo "|____/    |_|   /_/   \_\ |_| \_\   |_|  "
echo
echo "Caliper Benchmarks ................."
echo


## directory where store hyperledger fabric network configuration
NETWORK=networks/fabric/caliper_network.yaml

## configuration caliper file
BENCHCONFIG=config_energy_trading.yaml


sudo npx caliper launch manager \
--caliper-workspace ${PWD} \
--caliper-benchconfig ${PWD}/benchmarks/scenario/energy_trading/${BENCHCONFIG} \
--caliper-networkconfig ${PWD}/${NETWORK} \
--caliper-bind-sut fabric:2.2 \
--caliper-logging-targets-console-options-level error \
--caliper-logging-targets-file-options-level error \
# --caliper-fabric-gateway-usegateway \
