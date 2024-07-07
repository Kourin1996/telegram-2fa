import * as ethers from 'ethers';

export function getUserOpHash(useOpMinusSignature: any) {
    const packedData = ethers.AbiCoder.defaultAbiCoder().encode(
        [
          "address","uint256","bytes32","bytes32","uint256","uint256","uint256","uint256","uint256","bytes32",
        ],
        [
          useOpMinusSignature.sender,
          useOpMinusSignature.nonce,
          ethers.keccak256(useOpMinusSignature.initCode),
          ethers.keccak256(useOpMinusSignature.callData),
          useOpMinusSignature.callGasLimit,
          useOpMinusSignature.verificationGasLimit,
          useOpMinusSignature.preVerificationGas,
          useOpMinusSignature.maxFeePerGas,
          useOpMinusSignature.maxPriorityFeePerGas,
          ethers.keccak256(useOpMinusSignature.paymasterAndData),
        ]
      );
      
      const enc = ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "address", "uint256"],
        // Data, EntryPoint, ChainID
        [ethers.keccak256(packedData), "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789", 84532]
      );
      
      const userOpHash = ethers.keccak256(enc);
  
      return userOpHash;
  }