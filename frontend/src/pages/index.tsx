import DefaultLayout from "@/layouts/default";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Card, CardBody, CardFooter } from "@nextui-org/react";
import { useMemo, useState } from "react";
import * as ethers from 'ethers';
import {useSmartAccount, useSmartAccountAddress} from "../hooks/useSmartAccount";
import { FLEEK_FUNCTIONS_ENDPOINT } from "@/config/constants";
import { getUserOpHash } from "@/utils/hash";
import { useWalletClient } from "wagmi";

export default function IndexPage() {
  const smartAccount = useSmartAccount();
  const smartAccountAddress = useSmartAccountAddress();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);

  const {data: walletClient} = useWalletClient();
  
  const onSubmit = async () => {
    setSending(true);

    const balances = await smartAccount?.getBalances([]);
    const nativeBalances = balances?.at(balances.length - 1)?.amount;
    console.log('Smart Account Balance', nativeBalances);

    const userOp = await smartAccount!.buildUserOp([{
      to: recipient,
      value: ethers.parseEther(amount)
    }], {
      forceEncodeForBatch: true,
    });

    const hash = getUserOpHash(userOp);

    const signature = await walletClient?.signMessage({
      message: { raw: hash as any }
    });
    console.log('signature', signature);

    const reqBody = {
      userOp: {
        hash,
        signature,
        to: recipient,
        amount: amount,
        sender: smartAccountAddress,
      },
      chatId: 5208832317,
    };

    try {
      const res = await fetch(`${FLEEK_FUNCTIONS_ENDPOINT}/send_tx`, {
        method: 'POST',
        body: JSON.stringify(reqBody),
      });
      const resBody = await res.text();
      console.log('sent to FleekFunction', resBody);
    } catch(error) {
      console.error(error)
    } finally {
      setSending(false);
    }
  }

  const disabled = useMemo(() => {
    if (smartAccount === null) {
      return true;
    }

    if (!ethers.isAddress(recipient)) {
      return true;
    }

    const parsedAmount = Number.parseFloat(amount);
    if (!Number.isFinite(parsedAmount)) {
      return true;
    }

    return parsedAmount <= 0;
  }, [smartAccount, recipient, amount]);

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <Card className="py-8 px-12 md:min-w-[500px]">
          <CardBody className="flex flex-col gap-5">
            <span>Sender: {smartAccountAddress}</span>
            <Input isDisabled={sending} label="Recipient" placeholder="0x" value={recipient} onChange={e => setRecipient(e.target.value)}/>
            <Input isDisabled={sending} label="Amount" type="number" value={amount} min={0} onChange={e => setAmount(e.target.value)} endContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-small">ETH</span>
            </div>
          }/>
          </CardBody>
          <CardFooter className="flex justify-center mt-4">
            <Button isDisabled={disabled} isLoading={sending} onClick={onSubmit}>Transfer</Button>
          </CardFooter>
        </Card>
      </section>
    </DefaultLayout>
  );
}
