const ProviderEngine = require("web3-provider-engine");
const RpcProvider = require("web3-provider-engine/subproviders/rpc.js");
const { TruffleArtifactAdapter } = require("@0x/sol-trace");
const { GanacheSubprovider } = require("@0x/subproviders");
const { ProfilerSubprovider } = require("@0x/sol-profiler");
const { CoverageSubprovider } = require("@0x/sol-coverage");
const { RevertTraceSubprovider } = require("@0x/sol-trace");

const mode = process.env.MODE;

const projectRoot = "";
const solcVersion = "0.5.0";
const defaultFromAddress = "0x5409ed021d9299bf6814279a6a1411a7e866a631";
const isVerbose = true;
const artifactAdapter = new TruffleArtifactAdapter(projectRoot, solcVersion);
const provider = new ProviderEngine();

if (mode === "profile") {
  global.profilerSubprovider = new ProfilerSubprovider(
    artifactAdapter,
    defaultFromAddress,
    isVerbose
  );
  global.profilerSubprovider.stop();
  provider.addProvider(global.profilerSubprovider);
  provider.addProvider(new RpcProvider({ rpcUrl: "http://localhost:8545" }));
} else {
  if (mode === "coverage") {
    global.coverageSubprovider = new CoverageSubprovider(
      artifactAdapter,
      defaultFromAddress,
      isVerbose
    );
    provider.addProvider(global.coverageSubprovider);
  } else if (mode === "trace") {
    const revertTraceSubprovider = new RevertTraceSubprovider(
      artifactAdapter,
      defaultFromAddress,
      isVerbose
    );
    provider.addProvider(revertTraceSubprovider);
  }
  const ganahceSubprovider = new GanacheSubprovider();
  provider.addProvider(ganahceSubprovider);
}
provider.start(err => {
  if (err !== undefined) {
    console.log(err);
    process.exit(1);
  }
});
/**
 * HACK: Truffle providers should have `send` function, while `ProviderEngine` creates providers with `sendAsync`,
 * but it can be easily fixed by assigning `sendAsync` to `send`.
 */
provider.send = provider.sendAsync.bind(provider);

module.exports = {
  networks: {
    development: {
      //provider,
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    }
  },
  coverage: {
    host: "127.0.0.1",
    network_id: "*",
    port: 8555,         // <-- If you change this, also set the port option in .solcover.js.
    gas: 0xfffffffffff, // <-- Use this high gas value
    gasPrice: 0x01      // <-- Use this low gas price
  },
  plugins: [ "truffle-security" ]
};
