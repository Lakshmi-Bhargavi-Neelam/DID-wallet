//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Test} from "forge-std/Test.sol";
import {IssuerRegistry} from "../src/contracts/IssuerRegistry.sol";
import {IIssuerRegistry} from "../src/interfaces/IIssuerRegistry.sol";


contract IssuerRegistryTest is Test {
    IssuerRegistry public issuerRegistry;

    address public issuer;
    address public admin;

    function setUp() public {
        issuer = makeAddr("issuer");
        admin = makeAddr("admin");
        vm.prank(admin);
        issuerRegistry = new IssuerRegistry();
    }

    function test_RegisterIssuer() public {
        vm.prank(admin);
        issuerRegistry.registerIssuer(issuer, "bhargavi", "MIT");

        assertTrue(issuerRegistry.isTrustedIssuer(issuer));
    }

    function test_RemoveIssuer_SetsIsTrustedToFalse() public {
        vm.startPrank(admin);
        issuerRegistry.registerIssuer(issuer, "bhargavi", "MIT");
        issuerRegistry.removeIssuer(issuer);
        vm.stopPrank();
        assertFalse(issuerRegistry.isTrustedIssuer(issuer));
    }

    function test_GetIssuer() public {
        vm.startPrank(admin);
        issuerRegistry.registerIssuer(issuer, "bhargavi", "MIT");
        IIssuerRegistry.IssuerView memory viewIssuer = issuerRegistry.getIssuer(issuer);
        vm.stopPrank();

        assertEq(viewIssuer.name, "bhargavi");
        assertEq(viewIssuer.issuerType, "MIT");
        assertTrue(viewIssuer.isTrusted);
        assertEq(viewIssuer.registeredAt, block.timestamp);
    }

    function test_GetOwner() public {
        vm.prank(address(this));
        assertEq(issuerRegistry.getOwner(), admin);
    }



    function test_RegisterIssuer_RevertIf_NotOwner() public {
        vm.expectRevert(IssuerRegistry.NotOwner.selector);
        issuerRegistry.registerIssuer(issuer, "bhargavi", "MIT");
    }

    function test_RemoveIssuer_RevertIf_NotOwner() public {
        vm.prank(admin);
        issuerRegistry.registerIssuer(issuer, "bhargavi", "MIT");

        vm.expectRevert(IssuerRegistry.NotOwner.selector);
        issuerRegistry.removeIssuer(issuer);
    }

    function test_RegisterIssuer_RevertIf_AlreadyRegistered() public {
        vm.prank(admin);
        issuerRegistry.registerIssuer(issuer, "bhargavi", "MIT");
        
        vm.expectRevert(IssuerRegistry.AlreadyRegistered.selector);

        vm.prank(admin);
        issuerRegistry.registerIssuer(issuer, "bhargavi", "MIT");
    }

    function test_RemoveIssuer_RevertIf_IssuerNotFound() public {
        vm.expectRevert(IssuerRegistry.IssuerNotFound.selector);

        vm.prank(admin);
        issuerRegistry.removeIssuer(issuer);
    }

    function test_GetIssuer_RevertIf_IssuerNotFound() public {
        vm.expectRevert(IssuerRegistry.IssuerNotFound.selector);

        IIssuerRegistry.IssuerView memory issuerView = issuerRegistry.getIssuer(issuer);
    }

    function test_RegisterIssuer_RevertIf_EmptyField() public {
        vm.expectRevert(IssuerRegistry.EmptyField.selector);

        vm.prank(admin);
        issuerRegistry.registerIssuer(issuer, "", "MIT");
    }

}