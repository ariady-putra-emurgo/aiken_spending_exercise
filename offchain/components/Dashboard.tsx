import { Accordion, AccordionItem } from "@nextui-org/accordion";

import { ActionGroup } from "@/types/action";
import Admin from "./actions/Admin";
import Cip68 from "./actions/Cip68";
import { RedeemerAction } from "@/types/cip68";

import {
  Address,
  applyDoubleCborEncoding,
  applyParamsToScript,
  Constr,
  Data,
  fromText,
  getAddressDetails,
  Lovelace,
  LucidEvolution,
  MintingPolicy,
  mintingPolicyToId,
  paymentCredentialOf,
  SpendingValidator,
  toUnit,
  TxSignBuilder,
  validatorToAddress,
} from "@lucid-evolution/lucid";

const Script = {
  Admin: applyDoubleCborEncoding(
    "59015f010100323232323232323232232253330053232323232533300a3370e900118061baa001132332253333330140051533300d3370e900018079baa005153330113010375400a2a66601a6644646600200200644a66602a00229404cc894ccc04ccdc78010028a51133004004001375c602c002602e0026eb0c048c04cc04cc04cc04cc04cc04cc04cc04cc040dd5003299980699b8748008c03cdd5000880509bae301230103754002294454cc03924012e6c6973742e6861732874782e65787472615f7369676e61746f726965732c207369676e657229203f2046616c73650014a0018018018018018018602000260206022002601a6ea800458c038c03c00cc034008c030008c030004c020dd50008a4c2a6600c92011856616c696461746f722072657475726e65642066616c73650013656375c0022a660049210f5f72656465656d65723a20566f696400165734ae7155ceaab9e5573eae855d12ba41"
  ),

  Cip68: applyDoubleCborEncoding(
    "590d8f0101003232323232323232323232323232323222533300a323232323232323232323232323232323232323232533301f3008010132533333302801313330070131323253330260010201323253330280010221325333029302c00213253330263370e6eb4c0a401001854ccc098cdc7a4504000643b000333718900024010002264a66604e66e1cdd698150018038a99981399b8f48904000de140003337189000240100022a66604e66e3ccc058005200833016002480204c94ccc0a0c04400454ccc0a0cc028dd6180718159baa01c23375e605e60586ea80040844c94ccc0b40040a04c94ccc0b8c0c400854ccc0a8c058c0b0dd5180718169baa3010302d3754002264a6660566026605a6ea80044c94cccccc0d00044ccc03c0044c060c94ccc0b4c064c0bcdd50008a400026eb4c0ccc0c0dd5000992999816980c98179baa00114c0103d87a8000132330010013756606860626ea8008894ccc0cc004530103d87a800013233322253330333372201c0062a66606666e3c03800c4c084cc0e0dd400125eb80530103d87a8000133006006001375c60640026eb4c0cc004c0dc008c0d4004cc064dd5980818179baa00300d0280280280280283031302e37540022a660589213365787065637420496e6c696e65446174756d286d6574616461746129203d207265665f746f6b656e5f7574786f2e646174756d0016301a302d37540022a66056920135657870656374204e6f6e65203d207265665f746f6b656e5f7574786f2e616464726573732e7374616b655f63726564656e7469616c0016029302f0013300d3758603060566ea80700245280a999814180a0008a5014a260526ea806854cc0a1241536578706563740a2020202020206279746561727261792e64726f70287573725f746f6b656e5f6e616d652c203429203d3d206279746561727261792e64726f70287265665f746f6b656e5f6e616d652c2034290016153302849138657870656374202322303030646531343022203d207573725f746f6b656e5f6e616d65207c3e206279746561727261792e74616b652834290016153302849120657870656374207573725f746f6b656e5f717479203d3d206d696e745f7174790016375c60500042a6604e920138657870656374202322303030363433623022203d207265665f746f6b656e5f6e616d65207c3e206279746561727261792e74616b652834290016153302749120657870656374207265665f746f6b656e5f717479203d3d206d696e745f7174790016375c604e006046605400260540046050002660186eacc02cc090dd500a80119299981098050008a40042a6660426012002290008a99811248118496e76616c69642072656465656d657220616374696f6e210016302237540260320320320320326eb8c094c088dd50088a99980f98058080991991299999981500a899980480a8992999811980618129baa00113232533302530113027375400226464a66604e6020002294054ccc09cc04c0044c94ccc0b00040884c94ccc0b4c0c00084c8c94ccc0accc034dd6180898171baa01f23233001001330183756602260606ea8c044c0c0dd50010041129998190008a501332253330303253330313330313371e00201094128899b8f330200014802001c5281bae303200214a22660080080026068002606a002264a66606000204e264a6660626068004264a66605c602c60606ea80044c94cccccc0dc0044ccc0480044c94ccc0d00040b44c94ccc0d4c0e000854ccc0c4cdc79bae3033001008153330313375e602e60686ea8014c05cc0d0dd5180a981a1baa00e1323375e6002606a6ea8018c004c0d4dd5180b181a9baa00f2303830393039303900114a029400b8c0d8004cc068dd5980998191baa00300a02b02b02b02b02b3034303137540022a6605e92012b65787065637420496e6c696e65446174756d286d6574616461746129203d206f75747075742e646174756d0016301d303037540020506064002660206eb0c06cc0b8dd500f8030a998162481ff657870656374207b0a202020202020202020206c657420696e707574203c2d206c6973742e616e792874782e696e70757473290a202020202020202020206c657420746f6b656e73203d20696e7075742e6f75747075742e76616c7565207c3e2076616c75652e746f5f706169727328706f6c6963795f6964290a202020202020202020206c657420506169722861737365745f6e616d652c205f29203c2d206c6973742e616e7928746f6b656e73290a20202020202020202020616e64207b0a20202020202020202020202061737365745f6e616d6520213d207265665f746f6b656e5f6e616d652c0a20202020202020202020202062797465617272613a792e64726f702861737365745f6e616d652c203429203d3d20746f6b656e5f6e616d652c0a202020202020202020207d0a20202020202020207d00163301900148020dd718158008119817000998091bab300b302a3754601660546ea80100084c8cc004004c8cc004004dd5980998161baa01d22533302e00114bd70099817981618180009980100118188009129998168008a5013322533302b3371e00400c29444cc010010004dd71817800981800098141baa019375c605660506ea800454cc0992401426578706563742053637269707428706f6c6963795f696429203d20696e7075742e6f75747075742e616464726573732e7061796d656e745f63726564656e7469616c0016300a302737546014604e6ea8c020c09cdd5000981498131baa001153302449013f65787065637420536f6d6528696e70757429203d2074782e696e70757473207c3e207472616e73616374696f6e2e66696e645f696e707574286f5f726566290016323300100137586012604c6ea805c894ccc0a00045300103d87a80001332253330263375e601860526ea80080184c050cc0ac0092f5c026600800800260540026056002036036036036036604c002604c604e00260446ea80445888c8cc00400400c894ccc09800452809991299981218028010a51133004004001302800130290012225333020300930223754006264a66604a002004264a66666605400200626464a66605000200a264a66666605a00200c00c00c26464a666056002010264a666058605e0042646600200200e4464a66605e00401a26464a66666606a00201c01c01c01c26464600a606c00c60620066eb8004c0b8004c0c4008c008008024c0b4004c0b400cdd6800803181500098150019bab00100300300330270013023375400600246046604800244646600200200644a666046002297ae0133225333021325333022300e30243754002266e3c018dd7181418129baa00114a0600e60486ea8c01cc090dd500109981300119802002000899802002000981280098130009181080091119299980e98030008a99981098101baa0040030021533301d300900115333021302037540080060042a66603a600a0022a66604260406ea801000c008008c078dd50019b8748010dc3a40004603a603c603c603c603c0024464a666030600860346ea800452f5bded8c026eacc078c06cdd5000998020010009b874800888c8cc00400400c894ccc06c004530103d87a8000132333222533301b3372200e0062a66603666e3c01c00c4c024cc080dd300125eb80530103d87a8000133006006001375c60340026eacc06c004c07c008c074004dd2a400044666e30004cdc09b8d0020010022301730183018001301137540026028602a006602600460240046024002601a6ea8004526153300b49011856616c696461746f722072657475726e65642066616c73650013656153300849011772656465656d657220616374696f6e3a20416374696f6e00161533007491a0657870656374205b50616972287265665f746f6b656e5f6e616d652c205f295d203d0a202020202020202020202f2f20657874726163742074686520696e707574207265665f746f6b656e2041737365744e616d652062792073656c6620506f6c69637949440a20202020202020202020696e7075742e6f75747075742e76616c7565207c3e2076616c75652e746f5f706169727328706f6c6963795f6964290016153300649154657870656374205b6f75747075745d203d0a2020202020202020202074782e6f757470757473207c3e207472616e73616374696f6e2e66696e645f7363726970745f6f75747075747328706f6c6963795f696429001615330054911a657870656374205f3a204369703638203d206d65746164617461001615330044919d657870656374205b50616972286f5f7265665f746f6b656e5f6e616d652c205f295d203d0a202020202020202020202f2f206578747261637420746865206f7574707574207265665f746f6b656e2041737365744e616d652062792073656c6620506f6c69637949440a202020202020202020206f75747075742e76616c7565207c3e2076616c75652e746f5f706169727328706f6c6963795f6964290016153300349144657870656374205b7265665f746f6b656e2c207573725f746f6b656e5d203d2074782e6d696e74207c3e2076616c75652e746f5f706169727328706f6c6963795f6964290016153300249161657870656374205b7265665f746f6b656e5f7574786f5d203d0a202020207472616e73616374696f6e5f6f757470757473207c3e207472616e73616374696f6e2e66696e645f7363726970745f6f7574707574732873656c665f7363726970742900165734ae7155ceaab9e5573eae815d0aba257481"
  ),
};

export default function Dashboard(props: {
  lucid: LucidEvolution;
  address: Address;
  setActionResult: (result: string) => void;
  onError: (error: any) => void;
}) {
  const { lucid, address, setActionResult, onError } = props;

  async function submitTx(tx: TxSignBuilder) {
    const txSigned = await tx.sign.withWallet().complete();
    const txHash = await txSigned.submit();

    return txHash;
  }

  const actions: Record<string, ActionGroup> = {
    Admin: {
      deposit: async ({ lovelace, beneficiaryAddress }: { lovelace: Lovelace; beneficiaryAddress: Address }) => {
        try {
          const pkh = paymentCredentialOf(address).hash;

          const spendingScript = applyParamsToScript(Script.Admin, [pkh]);
          const spendingValidator: SpendingValidator = { type: "PlutusV3", script: spendingScript };
          const validatorAddress = validatorToAddress(lucid.config().network, spendingValidator);

          const beneficiary = `${getAddressDetails(beneficiaryAddress).paymentCredential?.hash}`;
          const datum = Data.to(beneficiary);

          const tx = await lucid.newTx().pay.ToContract(validatorAddress, { kind: "inline", value: datum }, { lovelace }, spendingValidator).complete();

          submitTx(tx).then(setActionResult).catch(onError);
        } catch (error) {
          onError(error);
        }
      },

      withdraw: async (validatorAddress: Address) => {
        try {
          const pkh = paymentCredentialOf(address).hash;

          const utxos = (await lucid.utxosAt(validatorAddress)).filter(({ datum }) => datum && `${Data.from(datum, Data.Bytes())}` === pkh);
          const spendingValidator = utxos[0].scriptRef;
          if (!spendingValidator) throw "Missing Reference Script";

          const redeemer = Data.void();

          const tx = await lucid.newTx().collectFrom(utxos, redeemer).attach.SpendingValidator(spendingValidator).addSigner(address).complete();

          submitTx(tx).then(setActionResult).catch(onError);
        } catch (error) {
          onError(error);
        }
      },
    },

    Cip68: {
      mint: async (nft: { name: string; image: string }) => {
        try {
          if (nft.name.length > 64) throw "NFT Name is too long!";
          if (nft.image.length > 64) throw "NFT Image URL is too long!";

          const metadata = Data.fromJson(nft);
          const version = BigInt(1);
          const extra: Data[] = [];
          const cip68 = new Constr(0, [metadata, version, extra]);

          const datum = Data.to(cip68);
          const redeemer = RedeemerAction.Mint;

          const utxos = await lucid.wallet().getUtxos();
          if (!utxos) throw "Empty user wallet!";

          const nonce = utxos[0];
          const { txHash, outputIndex } = nonce;

          const oRef = new Constr(0, [String(txHash), BigInt(outputIndex)]);
          const cip68script = applyParamsToScript(Script.Cip68, [oRef]);

          const spendingValidator: SpendingValidator = { type: "PlutusV3", script: cip68script };
          const validatorAddress = validatorToAddress(lucid.config().network, spendingValidator);

          const mintingPolicy: MintingPolicy = { type: "PlutusV3", script: cip68script };
          const policyID = mintingPolicyToId(mintingPolicy);

          const assetName = fromText(nft.name);

          const refUnit = toUnit(policyID, assetName, 100);
          const nftUnit = toUnit(policyID, assetName, 222);

          localStorage.setItem("refUnit", refUnit);
          localStorage.setItem("nftUnit", nftUnit);

          //#region Validate Minting
          const refTokenUTXOs = await lucid.utxosAtWithUnit(validatorAddress, refUnit);
          if (refTokenUTXOs.length) throw "Must NOT Mint more than 1 NFT";
          //#endregion

          const tx = await lucid
            .newTx()
            .collectFrom([nonce])
            .mintAssets(
              {
                [refUnit]: 1n,
                [nftUnit]: 1n,
              },
              redeemer
            )
            .attach.MintingPolicy(mintingPolicy)
            .pay.ToContract(
              validatorAddress,
              { kind: "inline", value: datum },
              {
                [refUnit]: 1n,
              },
              spendingValidator
            )
            .complete();

          submitTx(tx).then(setActionResult).catch(onError);
        } catch (error) {
          onError(error);
        }
      },

      update: async (nft: { name: string; image: string }) => {
        try {
          if (nft.name.length > 32) throw "NFT Name is too long!";
          if (nft.image.length > 64) throw "NFT Image URL is too long!";

          const metadata = Data.fromJson(nft);
          const version = BigInt(1);
          const extra: Data[] = [];
          const cip68 = new Constr(0, [metadata, version, extra]);

          const datum = Data.to(cip68);
          const redeemer = RedeemerAction.Update;

          const refUnit = localStorage.getItem("refUnit");
          const nftUnit = localStorage.getItem("nftUnit");

          if (!refUnit || !nftUnit) throw "Found no asset units in the current session's local storage. Must mint first!";

          const refTokenUTxO = await lucid.config().provider.getUtxoByUnit(refUnit);
          const usrTokenUTxO = await lucid.config().provider.getUtxoByUnit(nftUnit);

          const cip68script = refTokenUTxO.scriptRef;
          if (!cip68script) throw "Missing Reference Script";

          const tx = await lucid
            .newTx()
            .collectFrom([refTokenUTxO, usrTokenUTxO], redeemer)
            .attach.SpendingValidator(cip68script)
            .pay.ToContract(refTokenUTxO.address, { kind: "inline", value: datum }, refTokenUTxO.assets, refTokenUTxO.scriptRef ?? undefined)
            .complete();

          submitTx(tx).then(setActionResult).catch(onError);
        } catch (error) {
          onError(error);
        }
      },

      burn: async () => {
        try {
          const redeemer = RedeemerAction.Burn;

          const refUnit = localStorage.getItem("refUnit");
          const nftUnit = localStorage.getItem("nftUnit");

          if (!refUnit || !nftUnit) throw "Found no asset units in the current session's local storage. Must mint first!";

          const refTokenUTxO = await lucid.config().provider.getUtxoByUnit(refUnit);
          const usrTokenUTxO = await lucid.config().provider.getUtxoByUnit(nftUnit);

          const cip68script = refTokenUTxO.scriptRef;
          if (!cip68script) throw "Missing Reference Script";

          const tx = await lucid
            .newTx()
            .collectFrom([refTokenUTxO, usrTokenUTxO], redeemer)
            .attach.SpendingValidator(cip68script)
            .mintAssets(
              {
                [refUnit]: -1n,
                [nftUnit]: -1n,
              },
              redeemer
            )
            .attach.MintingPolicy(cip68script)
            .complete();

          submitTx(tx).then(setActionResult).catch(onError);
        } catch (error) {
          onError(error);
        }
      },
    },
  };

  return (
    <div className="flex flex-col gap-2">
      <span>{address}</span>

      <Accordion variant="splitted">
        {/* Admin */}
        <AccordionItem key="1" aria-label="Accordion 1" title="Admin">
          <Admin onDeposit={actions.Admin.deposit} onWithdraw={actions.Admin.withdraw} />
        </AccordionItem>

        {/* CIP-68 */}
        <AccordionItem key="2" aria-label="Accordion 2" title="CIP-68">
          <Cip68 onMint={actions.Cip68.mint} onUpdate={actions.Cip68.update} onBurn={actions.Cip68.burn} />
        </AccordionItem>
      </Accordion>
    </div>
  );
}
