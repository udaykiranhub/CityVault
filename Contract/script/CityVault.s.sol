// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {CityVault} from "../src/CityVault.sol";

contract CityVaultScript is Script {
    CityVault public x;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        x = new CityVault();

        vm.stopBroadcast();
    }
}
