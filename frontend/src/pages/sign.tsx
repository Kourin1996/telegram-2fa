import DefaultLayout from "@/layouts/default";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardFooter } from "@nextui-org/react";
import { useEffect, useMemo, useState } from "react";
import * as ethers from 'ethers';
import {useSmartAccount} from "../hooks/useSmartAccount";
import { useWalletClient } from "wagmi";

export default function SignPage() {
  const queryParams = new URLSearchParams(window.location.search)
  const queryOp = queryParams.get('op')!;

  useEffect(() => {
    if (!queryOp) {
      window.location.href = '/'
    }
  }, []);

  const userOp = useMemo(() => {
    return JSON.parse(atob(queryOp));
  }, [queryOp]);
  const userOpHash = useMemo(() => {
    return userOp.hash;
  }, [userOp]);

  const smartAccount = useSmartAccount();

  const {data: walletClient} = useWalletClient();

  const [sending, setSending] = useState(false);
  const [completed, setCompleted] = useState(false);

  const onSubmit = async () => {
    setSending(true);

    const signature2 = await walletClient?.signMessage({
      message: { raw: userOpHash as any }
    });

    const signatureWithModuleAddress = ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes", "bytes", "address"],
      [userOp.signature, signature2, "0x0000001c5b32F37F5beA87BDD5374eB2aC54eA8e"],
    );

    const userOpResponse = await smartAccount!.sendSignedUserOp({
      ...userOp,
      signature: signatureWithModuleAddress,
    })

    console.log('sent user operation', userOpResponse);

    const userOpReceipt = await userOpResponse.wait();

    console.log('completed', userOpReceipt);

    setSending(false);
    setCompleted(true);
  }

  const {sender, recipient, amount} = useMemo(() => {
    return {
      sender: userOp.sender,
      recipient: userOp.to,
      amount: userOp.amount,
    }
  }, [userOp]);

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <Card className="w-full py-8 px-12 sm:w-[300px] md:w-[500px] md:min-w-[500px]">
          <CardBody className="flex flex-col gap-5 w-full">
            <span className="w-full whitespace-normal">Sender: {sender}</span>
            <span className="w-full whitespace-normal">Recipient: {recipient}</span>
            <span className="w-full whitespace-normal">Amount: {amount} ETH</span>
            <span className="w-full whitespace-normal">OpHash: {userOpHash}</span>
          </CardBody>
          <CardFooter className="flex justify-center mt-4 w-full">
            <Button isLoading={sending} isDisabled={completed || smartAccount === null} onClick={onSubmit}>
              {completed ? 'Completed' : 'Approve'}
            </Button>
          </CardFooter>
        </Card>
      </section>
    </DefaultLayout>
  );
}
