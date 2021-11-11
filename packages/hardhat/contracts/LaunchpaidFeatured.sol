// SPDX-License-Identifier: UNLICENSED

/**
  ____/\__    __ __        .__   __  .__                               ____/\__
 /   / /_/   /  Y  \  __ __|  |_/  |_|__|__________    ______ ______  /   / /_/
 \__/ / \   /  \ /  \|  |  \  |\   __\  \____ \__  \  /  ___//  ___/  \__/ / \ 
 / / /   \ /    Y    \  |  /  |_|  | |  |  |_> > __ \_\___ \ \___ \   / / /   \
/_/ /__  / \____|__  /____/|____/__| |__|   __(____  /____  >____  > /_/ /__  /
  \/   \/          \/                   |__|       \/     \/     \/    \/   \/ 

  https://multipass.tools
*/

pragma solidity ^0.8.0;

contract LaunchpaidFeatured {
  mapping(address => uint40) private _featuredPreference;

  function getFeaturedPreference(address wallet) public view returns (uint40) {
    return _featuredPreference[wallet];
  }

  function getFeaturedPreference() public view returns (uint40) {
    return getFeaturedPreference(msg.sender);
  }

  function setFeaturedPreference(uint40 launch) public {
    // set the new launch preference for this wallet
    _featuredPreference[msg.sender] = launch;
  }
}
