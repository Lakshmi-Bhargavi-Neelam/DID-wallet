// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script, console } from "forge-std/Script.sol";
import { DIDRegistry }        from "../src/contracts/DIDRegistry.sol";
import { IssuerRegistry }     from "../src/contracts/IssuerRegistry.sol";
import { CredentialRegistry } from "../src/contracts/CredentialRegistry.sol";

/// @notice Deploys all three registries in dependency order and logs the addresses.
///
/// Usage (local Anvil):
///   anvil                                      # terminal 1 — starts local node
///   forge script script/Deploy.s.sol \
///     --rpc-url http://localhost:8545 \
///     --broadcast                              # terminal 2 — deploys
///
/// The deployer wallet becomes the IssuerRegistry owner (only account that can
/// register / remove issuers).  Use Anvil's default account #0 for local testing.
contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer    = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        // 1. DIDRegistry — no constructor args
        DIDRegistry didRegistry = new DIDRegistry();
        console.log("DIDRegistry        :", address(didRegistry));

        // 2. IssuerRegistry — owner = deployer (msg.sender in constructor)
        IssuerRegistry issuerRegistry = new IssuerRegistry();
        console.log("IssuerRegistry     :", address(issuerRegistry));

        // 3. CredentialRegistry — depends on both registries above
        CredentialRegistry credentialRegistry = new CredentialRegistry(
            address(didRegistry),
            address(issuerRegistry)
        );
        console.log("CredentialRegistry :", address(credentialRegistry));
        console.log("Deployer / Owner   :", deployer);

        vm.stopBroadcast();

        // Write addresses to a file so the frontend setup script can read them
        string memory json = string(
            abi.encodePacked(
                '{\n',
                '  "DID_REGISTRY_ADDRESS": "',        vm.toString(address(didRegistry)),        '",\n',
                '  "ISSUER_REGISTRY_ADDRESS": "',     vm.toString(address(issuerRegistry)),     '",\n',
                '  "CREDENTIAL_REGISTRY_ADDRESS": "', vm.toString(address(credentialRegistry)), '",\n',
                '  "CHAIN_ID": "31337",\n',
                '  "DEPLOYER": "',                    vm.toString(deployer),                    '"\n',
                '}'
            )
        );

        vm.writeFile("deployment.json", json);
        console.log("Addresses saved to deployment.json");
    }
}
