//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Test} from "forge-std/Test.sol";
import {CredentialRegistry} from "../src/contracts/CredentialRegistry.sol";
import {IssuerRegistry} from "../src/contracts/IssuerRegistry.sol";
import {DIDRegistry} from "../src/contracts/DIDRegistry.sol";

contract CredentialRegistryTest is Test {
    DIDRegistry public didRegistry;
    IssuerRegistry public issuerRegistry;
    CredentialRegistry public credentialRegistry;

    address public holder;
    address public issuer;
    address public issuer1;
    address public issuer2;
    address public admin;

    function setUp() public {
        didRegistry = new DIDRegistry();
        holder = makeAddr("holder");
        issuer = makeAddr("issuer");
        issuer1 = makeAddr("issuer1");
        issuer2 = makeAddr("issuer2");
        admin = makeAddr("admin");

        vm.prank(admin);
        issuerRegistry = new IssuerRegistry();

        credentialRegistry = new CredentialRegistry(address(didRegistry), address(issuerRegistry));

        vm.startPrank(admin);
        issuerRegistry.registerIssuer(issuer, "bhargavi", "University");
        issuerRegistry.registerIssuer(issuer1, "mitraja", "ITCompany");
        vm.stopPrank();

        // vm.prank(holder);
        // didRegistry.createDID("Mitraja");
    }

    function test_IssueCredential() public {
        bytes32 documentHash = keccak256(abi.encodePacked("Btech certificate"));
        string memory credId = "mit-btech-2026-001";
        vm.prank(issuer);
        credentialRegistry.issueCredential(credId, "QmTestCID123", documentHash, holder, "Certification");
        
        CredentialRegistry.Credential memory cred = credentialRegistry.getCredential(credId);
        assertEq(cred.issuedAt, block.timestamp);
    }

    function test_RevokeCredential() public {
        bytes32 documentHash = keccak256(abi.encodePacked("Btech certificate"));
        string memory credId = "mit-btech-2026-001";

        CredentialRegistry.Credential memory cred = credentialRegistry.getCredential(credId);
        assertTrue(cred.revoked);
    }

    function test_VerifyCredential() public {
        bytes32 documentHash = keccak256(abi.encodePacked("Btech certificate"));
        string memory credId = "mit-btech-2026-001";

        
        vm.prank(issuer);
        credentialRegistry.issueCredential(credId, "QmTestCID123", documentHash, holder, "Certification");
        
        (
            string  memory id,
            string  memory credType,
            string  memory cid,
            bytes32 documentHashed,
            address        issuerAddr,
            address        holderAddr,
            bool           revoked,
            uint256        issuedAt,
            uint256        revokedAt
        ) = credentialRegistry.verifyCredential(credId);
        
        assertEq(id, credId);
        assertEq(credType, "Certification");
        assertEq(cid, "QmTestCID123");
        assertEq(documentHashed, documentHash);
        assertEq(issuerAddr, issuer);
        assertEq(holderAddr, holder);
        assertFalse(revoked);
        assertEq(issuedAt, block.timestamp);
        assertEq(revokedAt, 0);
    }

    function test_GetCredential() public {
        bytes32 documentHashed = keccak256(abi.encodePacked("Btech certificate"));
        string memory credId = "mit-btech-2026-001";

        
        vm.prank(issuer);
        credentialRegistry.issueCredential(credId, "QmTestCID123", documentHashed, holder, "Certification");

        CredentialRegistry.Credential memory cred = credentialRegistry.getCredential(credId);

        assertEq(cred.credentialId, credId);
        assertEq(cred.credentialType, "Certification");
        assertEq(cred.cid, "QmTestCID123");
        assertEq(cred.documentHash, documentHashed);
        assertEq(cred.issuer, issuer);
        assertEq(cred.holder, holder);
        assertFalse(cred.revoked);
        assertEq(cred.issuedAt, block.timestamp);
        assertEq(cred.revokedAt, 0);
    }

    function test_GetCredentialsByHolder() public {
        bytes32 documentHashed = keccak256(abi.encodePacked("Btech certificate"));
        // string[] memory credIds = new string[](2);
        // credIds[0] = "mit-btech-2026-001";
        // credIds[1] = "jntu-cse-2026-12345";

        string memory credId1 = "mit-btech-2026-001";
        string memory credId2 = "jntu-cse-2026-12345";
        string memory credId3 = "au-it-2026-456";
        
        vm.startPrank(issuer);
        credentialRegistry.issueCredential(credId1, "QmTestCID123", documentHashed, holder, "Certification");
        credentialRegistry.issueCredential(credId2, "QmTestCID5464", documentHashed, holder, "Experience");
        vm.stopPrank();

        vm.prank(issuer1);
        credentialRegistry.issueCredential(credId3, "ZXTESTCID5464", documentHashed, holder, "Skill");

        string[] memory creds = credentialRegistry.getCredentialsByHolder(holder);
        assertEq(creds[0], credId1);
        assertEq(creds.length, 3);
        assertEq(creds[1], credId2);
        assertEq(creds[2], credId3);
    }

    function test_GetCredentialsByIssuer() public {
        bytes32 documentHashed = keccak256(abi.encodePacked("Btech certificate"));
        string memory credId1 = "mit-btech-2026-001";
        string memory credId2 = "jntu-cse-2026-12345";
        string memory credId3 = "au-it-2026-456";

        vm.startPrank(issuer);
        credentialRegistry.issueCredential(credId1, "QmTestCID123", documentHashed, holder, "Certification");
        credentialRegistry.issueCredential(credId2, "QmTestCID5464", documentHashed, holder, "Experience");
        vm.stopPrank();

        vm.prank(issuer1);
        credentialRegistry.issueCredential(credId3, "ZXTESTCID5464", documentHashed, holder, "Skill");

        credentialRegistry.getCredentialsByIssuer(issuer1);
    }

    function test_GetDID_Issuer_Registries() public {
        assertEq(credentialRegistry.getDIDRegistry(), address(didRegistry));
        assertEq(credentialRegistry.getIssuerRegistry(), address(issuerRegistry));
    }





    function test_IssueCredential_RevertIf_NotTrustedIssuer() public {
        string memory credId1 = "mit-btech-2026-001";
        bytes32 documentHashed = keccak256(abi.encodePacked("Btech certificate"));

        vm.expectRevert(CredentialRegistry.NotTrustedIssuer.selector);

        vm.prank(issuer2);
        credentialRegistry.issueCredential(credId1, "QmTestCID123", documentHashed, holder, "Certification");
    }

    function test_IssueCredential_RevertIf_HolderHasNoDID() public {
        string memory credId1 = "mit-btech-2026-001";
        bytes32 documentHashed = keccak256(abi.encodePacked("Btech certificate"));
        
        vm.expectRevert(CredentialRegistry.HolderHasNoDID.selector);

        vm.prank(issuer);
        credentialRegistry.issueCredential(credId1, "QmTestCID123", documentHashed, holder, "Certification");
    }
    
}