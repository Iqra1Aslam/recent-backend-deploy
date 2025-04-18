"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Coin_1 = __importDefault(require("../../models/Coin"));
const User_1 = __importDefault(require("../../models/User"));
const web3_1 = require("../../program/web3");
const validateId_1 = __importDefault(require("../../middleware/validateId"));
const router = (0, express_1.Router)();
// POST route to create a coin
router.post("/create-coin", async (req, res) => {
    try {
        const { wallet, name, bondingCurve, ticker, description, token, url, imgUrl, } = req.body;
        const userId = await User_1.default.findOne({ wallet });
        if (userId) {
            const creator = userId._id;
            const newCoin = new Coin_1.default({
                creator,
                name,
                bondingCurve,
                ticker,
                description,
                token,
                url,
                imgUrl,
            });
            const savedCoin = await newCoin.save();
            const populatedCoin = await savedCoin.populate('creator');
            const marketCap = (await (0, web3_1.getMarketCapSolFromBondingC)(savedCoin.bondingCurve)) / 1000000;
            // const io = req.app.get('io');
            // io.emit("coinAdded", { ...populatedCoin.toObject(), marketCap });
            const ably = req.app.get("ably");
            const channel = ably.channels.get("coins");
            channel.publish("coinAdded", { ...populatedCoin.toObject(), marketCap });
            res.status(201).json(savedCoin);
        }
        else {
            res.status(404).json({ error: "User not found" });
        }
    }
    catch (error) {
        console.error("Error creating coin: ", error);
        res.status(500).json({ msg: "Error creating coin", error: error.message });
    }
});
// GET route to fetch all coins
router.get("/getAllCoins", async (req, res) => {
    try {
        const getAllCoins = await Coin_1.default.find({
            bondingCurve: { $exists: true },
        }).populate("creator");
        const coinsWithMarketCap = await Promise.all(getAllCoins.map(async (coin) => {
            const marketCap = (await (0, web3_1.getMarketCapSolFromBondingC)(coin.bondingCurve)) / 1000000;
            return { ...coin.toObject(), marketCap };
        }));
        res.json(coinsWithMarketCap);
    }
    catch (error) {
        console.error("Error getting all coins:", error);
        res.status(500).json({
            error: `Error in getting all coins: ${error.message}`,
        });
    }
});
// GET route to fetch coin details by ID
router.get("/coinDetail/:id", async (req, res) => {
    const { id } = req.params;
    (0, validateId_1.default)(id);
    try {
        const getacoin = await Coin_1.default.findById(id);
        if (!getacoin) {
            return res.status(404).json({ error: "Coin not found" });
        }
        const marketCap = (await (0, web3_1.getMarketCapSolFromBondingC)(getacoin.bondingCurve)) / 1000000;
        const bId = getacoin.bondingCurve;
        const bondingCProgress = await (0, web3_1.getBondingCurveProgressAMarketC)(bId);
        const coinDetailWMarketCap = {
            ...getacoin.toObject(),
            marketCap,
            bondingCProgress,
        };
        res.json(coinDetailWMarketCap);
    }
    catch (error) {
        console.error("Error fetching coin details:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
