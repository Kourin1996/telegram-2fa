pragma solidity ^0.8.17;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

struct UserOperation {
    address sender;
    uint256 nonce;
    bytes initCode;
    bytes callData;
    uint256 callGasLimit;
    uint256 verificationGasLimit;
    uint256 preVerificationGas;
    uint256 maxFeePerGas;
    uint256 maxPriorityFeePerGas;
    bytes paymasterAndData;
    bytes signature;
}

contract TelegramAuthrizationModule {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    uint256 internal constant VALIDATION_SUCCESS = 0;
    uint256 internal constant SIG_VALIDATION_FAILED = 1;
    bytes4 internal constant EIP1271_MAGIC_VALUE = 0x1626ba7e;

    string public constant NAME = "Telegram Authrization Module";
    string public constant VERSION = "0.0.1";
    mapping(address => address) internal _smartAccountOwners;
    mapping(address => address) internal _additionalSigners;

    event OwnershipTransferred(
        address indexed smartAccount,
        address indexed oldOwner,
        address indexed newOwner
    );
    event AdditionalSignersRegistered(
        address indexed smartAccount,
        address indexed signer
    );

    error AlreadyInitedForSmartAccount(address smartAccount);
    error ZeroAddressNotAllowedAsOwner();
    error NoOwnerRegisteredForSmartAccount(address smartAccount);
    error WrongSignatureLength();
    error NotEOA(address account);

    function initForSmartAccount(address eoaOwner) external returns (address) {
        if (_smartAccountOwners[msg.sender] != address(0))
            revert AlreadyInitedForSmartAccount(msg.sender);
        if (eoaOwner == address(0)) revert ZeroAddressNotAllowedAsOwner();
        _smartAccountOwners[msg.sender] = eoaOwner;
        return address(this);
    }

    function registerSigner(address smartAccount, address signer) external returns (address) {
        if (smartAccount == address(0)) revert ZeroAddressNotAllowedAsOwner();

        _additionalSigners[smartAccount] = signer;

        return address(this);
    }

    function renounceOwnership() external {
        _transferOwnership(msg.sender, address(0));
    }

    function getOwner(address smartAccount) external view returns (address) {
        address owner = _smartAccountOwners[smartAccount];
        if (owner == address(0))
            revert NoOwnerRegisteredForSmartAccount(smartAccount);
        return owner;
    }

    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) external view virtual returns (uint256) {
        (bytes memory sig1, bytes memory sig2, ) = abi.decode(
            userOp.signature,
            (bytes, bytes, address)
        );

        if (!_verifySignature(userOpHash, sig1, _smartAccountOwners[userOp.sender])) {
            return SIG_VALIDATION_FAILED;
        }

        if (!_verifySignature(userOpHash, sig1, _additionalSigners[userOp.sender])) {
            return SIG_VALIDATION_FAILED;
        }

        return VALIDATION_SUCCESS;
    }

    function isValidSignature(
        bytes32 dataHash,
        bytes memory moduleSignature
    ) public view virtual returns (bytes4) {
        return isValidSignatureForAddress(dataHash, moduleSignature, msg.sender);
    }

    function isValidSignatureForAddress(
        bytes32 dataHash,
        bytes memory moduleSignature,
        address smartAccount
    ) public view virtual returns (bytes4) {
        if (_verifySignature(dataHash, moduleSignature, _smartAccountOwners[smartAccount])) {
            return EIP1271_MAGIC_VALUE;
        }
        return bytes4(0xffffffff);
    }

    function _transferOwnership(
        address smartAccount,
        address newOwner
    ) internal {
        address _oldOwner = _smartAccountOwners[smartAccount];
        _smartAccountOwners[smartAccount] = newOwner;
        emit OwnershipTransferred(smartAccount, _oldOwner, newOwner);
    }

    function _verifySignature(
        bytes32 dataHash,
        bytes memory signature,
        address expectedSigner
    ) internal view returns (bool) {
        if (signature.length < 65) revert WrongSignatureLength();
        address recovered = (dataHash.toEthSignedMessageHash()).recover(
            signature
        );
        if (expectedSigner == recovered) {
            return true;
        }

        recovered = dataHash.recover(signature);
        if (expectedSigner == recovered) {
            return true;
        }

        return false;
    }

    function recoverAddress(
        bytes32 dataHash,
        bytes memory signature
    ) public pure returns (address) {
        if (signature.length < 65) revert WrongSignatureLength();

        address recovered = (dataHash.toEthSignedMessageHash()).recover(
            signature
        );

        return recovered;
    }

    function _isSmartContract(address account) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }
}