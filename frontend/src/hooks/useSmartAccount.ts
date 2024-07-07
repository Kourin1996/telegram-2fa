import { useWalletClient } from "wagmi";
import { BiconomySmartAccountV2, createSmartAccountClient, WalletClientSigner } from "@biconomy/account";
import { BICONOMY_BUNDLER_URL } from "../config/constants";
import { useEffect, useState } from "react";

export const useSmartAccount = (smartAccountAddress?: string) => {
    console.log('smartAccountAddress', smartAccountAddress);

    const { data: walletClient } = useWalletClient();
    const [smartAccount, setSmartAccount] = useState<BiconomySmartAccountV2 | null>(null);

    const retriveSmartAccount = async () => {
        const signer = new WalletClientSigner(walletClient!, 'json-rpc');

        const biconomySmartAccount = await createSmartAccountClient({
            signer: signer,
            bundlerUrl: BICONOMY_BUNDLER_URL,
        });

        console.log('biconomySmartAccount', biconomySmartAccount);

        setSmartAccount(biconomySmartAccount)
    };

    useEffect(() => {
        if (walletClient) {
            retriveSmartAccount();
        }
    }, [walletClient])

    return smartAccount;
}

export const useSmartAccountAddress = () => {
    const account = useSmartAccount();

    const [sa, setSa] = useState<string | null>(null);

    useEffect(() => {
        if (account) {
            (async () => {
                const address = await account.getAccountAddress();
                setSa(address);
            })()
        }
    }, [account]);

    return sa;
}
