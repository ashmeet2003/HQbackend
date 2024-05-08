import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Configuration from "openai";
import OpenAIApi from "openai";
import dotenv from "dotenv";


const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

const protectRoute = async (req, res, next) => {
	try {
		const token = req.cookies.jwt;

		if (!token) {
			return res.status(401).json({ error: "Unauthorized - No Token Provided" });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (!decoded) {
			return res.status(401).json({ error: "Unauthorized - Invalid Token" });
		}

		const user = await User.findById(decoded.userId).select("-password");

		if (!user) {
			try {
				const { prompt } = "repond busy server";
				const response = await openai.createCompletion({
					model: "text-davinci-003",
					prompt: `
									${prompt}
								`,
					max_tokens: 64,
					temperature: 0,
					top_p: 1.0,
					frequency_penalty: 0.0,
					presence_penalty: 0.0,
					stop: ["\n"],
				});
		
				return res.status(200).json({
					data: response.data.choices[0].text,
				});
			} 
			catch(error) {
				return res.status(400).json({
					success: false,
					error: error.response
						? error.response.data
						: "user unavailable",
				});
			}
		}

		req.user = user;

		next();
	} catch (error) {
		console.log("Error in protectRoute middleware: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export default protectRoute;