"use strict";
// const express = require('express');
// import User from '../models/User';
// // import {crypto} from 'crypto';
// const cors = require('cors')
// import bs58 from 'bs58';
// import { PublicKey, Transaction } from '@solana/web3.js';
// import jwt from 'jsonwebtoken';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const router = express.Router();
// const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173", "https://www.memehome.io"];
// router.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true, // If using cookies or authentication
//   })
// );
// // //post: login by wallet connectivity
// // router.post('/connect-wallet', async (req, res) => {
// //   // console.log("wallet connected");
// //   try {
// //     const { name, wallet, avatar } = req.body;
// //     let isExistingUser = await User.findOne({ wallet });
// //     // if (isExistingUser) {
// //     //   return res.status(409).json({
// //     //     success: false,
// //     //     msg: 'wallet already exists',
// //     //   });
// //     // }
// //     if(!isExistingUser){
// //       if (!name) {
// //         const aname = wallet;
// //         const user = await User.create({
// //           name:`@${aname}`,
// //           wallet,
// //           avatar
// //         })
// //         res.json({ success: true, user });
// //       } else {
// //         const user = await User.create({
// //           name,
// //           wallet,
// //           avatar
// //         })
// //         res.json({ success: true, user });
// //     }
// //     }
// //   } catch (error) {
// //     console.error("error in wallet connect", error);
// //     res.status(500).json({
// //       success: false,
// //       msg: 'wallet connect failed',
// //       error: error
// //     });
// //   }
// // })
// router.post('/connect-wallet', async (req, res) => {
//   try {
//     const { name, wallet } = req.body; // Removed avatar from destructuring
//     let isExistingUser = await User.findOne({ wallet });
//     if (!isExistingUser) {
//       if (!name) {
//         const aname = wallet;
//         const user = await User.create({
//           name: `@${aname}`,
//           wallet
//         });
//         res.json({ success: true, user });
//       } else {
//         const user = await User.create({
//           name,
//           wallet
//         });
//         res.json({ success: true, user });
//       }
//     }
//   } catch (error) {
//     console.error("error in wallet connect", error);
//     res.status(500).json({
//       success: false,
//       msg: 'wallet connect failed',
//       error: error
//     });
//   }
// });
// //get all usrs
// router.get('/getAllUsers', async(req,res) =>{
//     try {
//       const users = await User.find({});
//       res.status(200).json({users});
//     } catch (error) {
//       res.status(500).json({error})
//     }
// })
// //get user by :id
// router.get('/getuser/:id', async(req,res)=>{
//   const {id} = req.params;
//   console.log(id);
//   try {
//     const user = await User.findById(id);
//     res.status(200).json({user});
//   } catch (error) {
//     res.status(500).json(error);
//   }
// })
// export default router;
const express_1 = __importDefault(require("express"));
const web3_js_1 = require("@solana/web3.js");
const User_1 = __importDefault(require("../models/User"));
const cors_1 = __importDefault(require("cors"));
const router = express_1.default.Router();
const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173", "https://www.memehome.io"];
router.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
// Connect wallet
router.post('/connect-wallet', async (req, res) => {
    try {
        const { name, wallet } = req.body;
        let isExistingUser = await User_1.default.findOne({ wallet });
        if (!isExistingUser) {
            if (!name) {
                const aname = wallet;
                const user = await User_1.default.create({
                    name: `@${aname}`,
                    wallet
                });
                res.json({ success: true, user });
            }
            else {
                const user = await User_1.default.create({
                    name,
                    wallet
                });
                res.json({ success: true, user });
            }
        }
        else {
            res.json({ success: true, user: isExistingUser });
        }
    }
    catch (error) {
        console.error("Error in wallet connect:", error);
        res.status(500).json({
            success: false,
            msg: 'Wallet connect failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Get all users
router.get('/getAllUsers', async (req, res) => {
    try {
        const users = await User_1.default.find({});
        res.status(200).json({ users });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
});
// Get user by ID
router.get('/getuser/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User_1.default.findById(id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(200).json({ user });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
});
// Get holders for a token
// router.get('/coin/api/holders/:tokenAddress', async (req, res) => {
//   try {
//     const { tokenAddress } = req.params;
//     const connection = new Connection("https://api.devnet.solana.com", "confirmed");
//     const tokenMintPublicKey = new PublicKey(tokenAddress);
//     // Fetch token accounts
//     const tokenAccounts = await connection.getParsedProgramAccounts(
//       new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
//       {
//         filters: [
//           { dataSize: 165 },
//           { memcmp: { offset: 0, bytes: tokenMintPublicKey.toBase58() } },
//         ],
//       }
//     );
//     // Parse holder data
//     const holderData = tokenAccounts
//       .map((account) => {
//         const data = account.account.data;
//         if ('parsed' in data) {
//           const parsedData = data as ParsedAccountData;
//           if (parsedData.parsed && parsedData.parsed.info) {
//             return {
//               owner: parsedData.parsed.info.owner,
//               balance: parsedData.parsed.info.tokenAmount.uiAmount,
//             };
//           }
//         }
//         return null;
//       })
//       .filter((holder): holder is { owner: string; balance: number } => holder !== null && holder.balance > 0);
//     // Calculate total supply
//     const totalSupply = holderData.reduce((sum, holder) => sum + holder.balance, 0);
//     // Handle case where totalSupply is 0
//     if (totalSupply === 0) {
//       return res.status(200).json([]);
//     }
//     // Format holders
//     const formattedHolders = holderData
//       .map((holder) => ({
//         address: `${holder.owner.substring(0, 4)}...${holder.owner.substring(holder.owner.length - 4)}`,
//         fullAddress: holder.owner,
//         // percentage: ((holder.balance / totalSupply) * 100).toLocaleString("en-US", {
//         //   minimumFractionDigits: 2,
//         //   maximumFractionDigits: 6,
//         // }) + "%",
//         percentage: ((holder.balance / totalSupply) * 100).toFixed(2) + "%",
//       }))
//       .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage))
//       .slice(0, 5);
//     res.status(200).json(formattedHolders);
//   } catch (error) {
//     console.error("Error fetching holders:", error);
//     res.status(500).json({ error: "Failed to fetch holders" });
//   }
// });
router.get('/coin/api/holders/:tokenAddress', async (req, res) => {
    try {
        const { tokenAddress } = req.params;
        const connection = new web3_js_1.Connection("https://api.devnet.solana.com", "confirmed");
        const tokenMintPublicKey = new web3_js_1.PublicKey(tokenAddress);
        // Define the System Program public key
        const SYSTEM_PROGRAM_ID = "11111111111111111111111111111111";
        // Fetch token accounts
        const tokenAccounts = await connection.getParsedProgramAccounts(new web3_js_1.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), {
            filters: [
                { dataSize: 165 }, // Token account data size
                { memcmp: { offset: 0, bytes: tokenMintPublicKey.toBase58() } }, // Match token mint address
            ],
        });
        // Parse holder data
        const holderData = tokenAccounts
            .map((account) => {
            const data = account.account.data;
            if ('parsed' in data) {
                const parsedData = data;
                if (parsedData.parsed &&
                    parsedData.parsed.info &&
                    parsedData.parsed.info.owner &&
                    parsedData.parsed.info.tokenAmount.uiAmount > 0) {
                    return {
                        owner: parsedData.parsed.info.owner,
                        balance: parsedData.parsed.info.tokenAmount.uiAmount,
                    };
                }
            }
            return null;
        })
            .filter((holder) => holder !== null &&
            holder.balance > 0 &&
            holder.owner.startsWith(SYSTEM_PROGRAM_ID) === false // Exclude system-owned accounts
        );
        // Calculate total supply
        const totalSupply = holderData.reduce((sum, holder) => sum + holder.balance, 0);
        // Handle case where totalSupply is 0
        if (totalSupply === 0) {
            return res.status(200).json({ message: "No wallet holders found." });
        }
        // Format holders
        const formattedHolders = holderData
            .map((holder) => ({
            address: `${holder.owner.substring(0, 4)}...${holder.owner.substring(holder.owner.length - 4)}`,
            fullAddress: holder.owner,
            percentage: ((holder.balance / totalSupply) * 100).toFixed(2) + "%",
        }))
            .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
        res.status(200).json(formattedHolders);
    }
    catch (error) {
        console.error("Error fetching holders:", error);
        res.status(500).json({ error: "Failed to fetch holders" });
    }
});
exports.default = router;
