"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCoinStatus = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const CoinStatus_1 = __importDefault(require("../models/CoinStatus"));
const web3_1 = require("../program/web3");
const Coin_1 = __importDefault(require("../models/Coin"));
const User_1 = __importDefault(require("../models/User"));
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
    credentials: true, // If using cookies or authentication
}));
// Existing function to set coin status
const setCoinStatus = async (data) => {
    console.log("+++++++++++++++++");
    let checkRaydium = null;
    const coinId = await Coin_1.default.findOne({ token: data.mint }).select('_id').populate('creator');
    const userId = await User_1.default.findOne({ wallet: data.owner }).select('_id');
    const newTx = {
        holder: userId?._id,
        holdingStatus: data.swapType,
        amount: data.swapAmount,
        tx: data.tx,
        price: data.reserve2 / data.reserve1,
    };
    CoinStatus_1.default.findOne({ coinId: coinId?._id })
        .then((coinStatus) => {
        if (coinStatus) {
            coinStatus.record.push(newTx);
            coinStatus.save();
        }
    });
    console.log("update coin when buy or sell", data);
    const updateCoin = await Coin_1.default.findOneAndUpdate({ token: data.mint }, { reserveOne: data.reserve1, reserveTwo: data.reserve2 }, { new: true });
    console.log("updated coin: ", updateCoin);
    // as the buy happens it checks for raydium migration accur or not
    console.log("coin creator: ", coinId.creator.wallet);
    if (data.swapType === 0) {
        checkRaydium = (0, web3_1.checkRaydiumMigration)(data.mint, coinId.creator.wallet);
        console.log("migration check for buy");
    }
};
exports.setCoinStatus = setCoinStatus;
// Existing POST /swap route (placeholder)
router.post('/swap', async (req, res) => {
    try {
        const { data } = req.body;
        // Add logic here if needed
        res.status(200).json({ message: 'Swap processed', data });
    }
    catch (error) {
        console.error('Error in /swap:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// // New POST /coin/api/trades route for trade data
// router.post('/coin/api/trades', async (req: Request, res: Response) => {
//   const tradeData = req.body as ITrade;
//   // Validate required fields
//   if (!tradeData.account || !tradeData.type || !tradeData.tokenAmount || 
//       !tradeData.solAmount || !tradeData.txHex || !tradeData.tokenAddress) {
//     return res.status(400).json({ 
//       error: 'Missing required fields',
//       required: ['account', 'type', 'tokenAmount', 'solAmount', 'txHex', 'tokenAddress']
//     });
//   }
//   // Add timestamp
//   const tradeWithTimestamp: ITrade = {
//     ...tradeData,
//     timestamp: new Date().toISOString(),
//   };
//   try {
//     // Get or create the model for this token address
//     const TradeModel = getTradeModel(tradeData.tokenAddress);
//     // Save the trade to the dynamic collection
//     const newTrade = new TradeModel(tradeWithTimestamp);
//     await newTrade.save();
//     console.log(`Trade recorded in collection for ${tradeData.tokenAddress}:`, tradeWithTimestamp);
//     res.status(200).json({ message: 'Trade recorded successfully', trade: tradeWithTimestamp });
//   } catch (error) {
//     console.error('Error saving trade:', error);
//     res.status(500).json({ error: 'Failed to record trade' });
//   }
// });
// // New GET /coin/api/trades/:tokenAddress route to fetch trades
// router.get('/coin/api/trades/:tokenAddress', async (req: Request, res: Response) => {
//   const { tokenAddress } = req.params;
//   try {
//     const TradeModel = getTradeModel(tokenAddress);
//     const trades = await TradeModel.find();
//     if (trades.length === 0) {
//       return res.status(404).json({ message: `No trades found for token ${tokenAddress}` });
//     }
//     res.status(200).json({ trades });
//   } catch (error) {
//     console.error('Error fetching trades:', error);
//     res.status(500).json({ error: 'Failed to fetch trades' });
//   }
// });
exports.default = router;
