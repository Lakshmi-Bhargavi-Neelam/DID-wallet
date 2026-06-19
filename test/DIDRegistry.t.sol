//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Test} from "forge-std/Test.sol";
import {DIDRegistry} from "../src/contracts/DIDRegistry.sol";
import {IDIDRegistry} from "../src/interfaces/IDIDRegistry.sol";



contract DIDRegistryTest is Test {
       DIDRegistry public didRegistry;

       address public holder;
       address public holder1;

       function setUp() public {
            didRegistry = new DIDRegistry();
            holder = makeAddr("holder");
            holder1 = makeAddr("holder1");
       }

       function test_CreateDID_SetsHasDIDToTrue() public {
            vm.prank(holder);
            didRegistry.createDID("bhargavi");

            assertTrue(didRegistry.hasDID(holder));
       }

       function test_HasDID() public {
        vm.startPrank(holder);
        didRegistry.createDID("bhargavi");
        
        didRegistry.hasDID(holder);
        vm.stopPrank();
       }

       function test_GetDIDByController() public {
        vm.startPrank(holder);
        didRegistry.createDID("bhargavi");

        string memory did = didRegistry.getDIDByController(holder);
        assertEq(did, "did:wallet:bhargavi");
        vm.stopPrank();
       }

       function test_ResolveDID() public {
        vm.startPrank(holder);
        didRegistry.createDID("bhargavi");

        string memory did = didRegistry.getDIDByController(holder);

        IDIDRegistry.DIDView memory identity = didRegistry.resolveDID(did);

        assertEq(identity.did, did);
        assertEq(identity.controller, holder);
        assertEq(identity.createdAt, block.timestamp);

        vm.stopPrank();
       }






       function test_CreateDID_RevertIf_AlreadyHasDID() public {
            vm.prank(holder);
            didRegistry.createDID("bhargavi");

            vm.expectRevert(DIDRegistry.AlreadyHasDID.selector);

            vm.prank(holder);
            didRegistry.createDID("mitraja");
       }

       function test_GetDIDByController_RevertIf_DIDNotFound() public {
        vm.expectRevert(DIDRegistry.DIDNotFound.selector);
        didRegistry.getDIDByController(holder);
       }

       function test_CreateDID_RevertIf_EmptyIdentifier() public {
        vm.expectRevert(DIDRegistry.EmptyIdentifier.selector);
        didRegistry.createDID("");
       }

       function test_CreateDID_RevertIf_DIDAlreadyExists() public {
        vm.prank(holder);
        didRegistry.createDID("bhargavi");

        vm.expectRevert(DIDRegistry.DIDAlreadyExists.selector);

        vm.prank(holder1);
        didRegistry.createDID("bhargavi");
       }
}


contract DIDRegistryHarness is DIDRegistry {

    function exposedBuildDID(
        string memory identifier
    )
        external
        pure
        returns (string memory)
    {
        return _buildDID(identifier);
    }
}

contract DIDRegistryHarnessTest is Test {

    DIDRegistryHarness harness;

    function setUp() public {
        harness = new DIDRegistryHarness();
    }

    function test_BuildDID() public {

        string memory did =
            harness.exposedBuildDID("bhargavi");

        assertEq(
            did,
            "did:wallet:bhargavi"
        );
    }
}



