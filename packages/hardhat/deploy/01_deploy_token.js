// deploy/01_deploy_token.js

module.exports = async ({ getNamedAccounts, deployments }) => {
  // console.log(await deployments.get("ERC20"));
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  /* const onlyMoons = */ await deploy("OnlyMoons", {
    from: deployer,
    log: true,
  });
};

module.exports.tags = ["OnlyMoons", "Token"];
