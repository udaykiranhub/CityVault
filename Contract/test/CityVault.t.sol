// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {CityVault} from "../src/CityVault.sol";

contract CounterTest is Test {
   CityVault public x;

    function setUp() public {
        x = new CityVault();
    
    }


}
